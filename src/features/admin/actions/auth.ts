"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  createSessionToken,
  sessionCookie,
} from "@/features/admin/services/session";
import { getPoolOrNull, ensureSchema } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

// Clave HMAC para comparar passwords en tiempo constante. Se reutiliza
// ADMIN_AUTH_SECRET (ya usado para firmar la cookie de sesión) en lugar de
// una constante literal. Fallback a la literal solo para no romper build/dev
// donde el secret puede no estar definido; en producción se loguea un warning.
function getPasswordHmacKey(): string {
  const secret = process.env.ADMIN_AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    console.warn(
      "[auth] WARNING: ADMIN_AUTH_SECRET no está configurado en producción; " +
        "usando clave HMAC de fallback para comparación de password. " +
        "Configurar ADMIN_AUTH_SECRET en Vercel.",
    );
  }
  return secret || "admin-password";
}

// Alerta fuerte (no silenciosa) cuando el lockout cae al fallback en memoria.
// En serverless (Vercel) cada request puede ir a otra instancia y el Map en
// memoria nunca acumula: el bloqueo jamás dispara. Solo se loguea en
// producción para no ensuciar build/dev.
//
// Prefijos por caso (para diagnóstico en Vercel Logs):
//   [auth] DB pool=null    -> DATABASE_URL ausente (getPoolOrNull() === null)
//   [auth] DB schema-error -> ensureSchema() falló (ver detail)
//   [auth] DB read-error   -> SELECT en login_attempts falló (ver detail)
//   [auth] DB write-error  -> INSERT/UPSERT en login_attempts falló (ver detail)
// El detail incluye String(err) + `code` cuando es un error de pg
// (ej. 42501 permiso denegado, 42P01 tabla inexistente, ETIMEDOUT /
// ECONNREFUSED red/pooler/SSL). Nunca incluye secrets: solo nombre del error,
// mensaje y código.
function formatDbError(err: unknown): string {
  if (err instanceof Error) {
    const code = (err as { code?: unknown }).code;
    const suffix =
      typeof code === "string" || typeof code === "number"
        ? ` (code=${code})`
        : "";
    return `${err.name}: ${err.message}${suffix}`;
  }
  return String(err);
}

function warnMemoryFallback(where: string, err?: unknown): void {
  if (process.env.NODE_ENV !== "production") return;
  const prefix = where.startsWith("pool-null")
    ? "[auth] DB pool=null"
    : where.startsWith("schema")
      ? "[auth] DB schema-error"
      : where.startsWith("read")
        ? "[auth] DB read-error"
        : where.startsWith("write")
          ? "[auth] DB write-error"
          : "[auth] DB error";
  const detail = err === undefined ? "" : ` detail=${formatDbError(err)}`;
  console.warn(
    `${prefix} en ${where}.${detail} ` +
      "Lockout usando fallback en memoria: el bloqueo por fuerza bruta " +
      "NO es efectivo en serverless sin BD. " +
      "Verificar DATABASE_URL y que ensureSchema() haya creado login_attempts.",
  );
}

// Fallback en memoria: solo se usa si la BD no está disponible
// (p. ej. build o DATABASE_URL ausente). En Vercel el bloqueo real
// persiste en la tabla login_attempts.
const memoryAttempts = new Map<string, { count: number; lockedUntil: number }>();

export type LoginState = { error?: string } | null;

function hashPassword(value: string): Buffer {
  return createHmac("sha256", getPasswordHmacKey()).update(value).digest();
}

function isValidPassword(input: string, expected: string): boolean {
  const a = hashPassword(input);
  const b = hashPassword(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

async function getClientIp(): Promise<string> {
  const h = await headers();
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

type AttemptRecord = { count: number; lockedUntil: number };

async function readAttempt(key: string): Promise<AttemptRecord | null> {
  const pool = await getPoolOrNull();
  const fallback = async () => {
    const rec = memoryAttempts.get(key) ?? null;
    // Un bloqueo expirado se trata como si no existiera (decaimiento):
    // evita que un solo fallo futuro reactive el bloqueo.
    if (rec && rec.lockedUntil > 0 && rec.lockedUntil <= Date.now()) {
      memoryAttempts.delete(key);
      return null;
    }
    return rec;
  };
  if (!pool) {
    warnMemoryFallback("pool-null:read");
    return fallback();
  }
  try {
    await pool.query(
      "DELETE FROM login_attempts WHERE locked_until IS NOT NULL AND locked_until < now() - interval '1 day'",
    );
    await pool.query(
      "DELETE FROM login_attempts WHERE locked_until IS NULL AND updated_at < now() - interval '1 day'",
    );
    const res = await pool.query(
      "SELECT count, EXTRACT(EPOCH FROM locked_until) * 1000 AS locked_until_ms FROM login_attempts WHERE key = $1",
      [key],
    );
    if (res.rowCount === 0) return null;
    const lockedUntil = res.rows[0].locked_until_ms
      ? Number(res.rows[0].locked_until_ms)
      : 0;
    if (lockedUntil > 0 && lockedUntil <= Date.now()) {
      return null;
    }
    return {
      count: Number(res.rows[0].count) || 0,
      lockedUntil,
    };
  } catch (err) {
    warnMemoryFallback("read", err);
    return fallback();
  }
}

async function recordFailedAttempt(key: string, prev: AttemptRecord | null) {
  const now = Date.now();
  const next = {
    count: (prev?.count ?? 0) + 1,
    lockedUntil: 0,
  };
  if (next.count >= MAX_ATTEMPTS) {
    next.lockedUntil = now + LOCK_MS;
  }
  const pool = await getPoolOrNull();
  if (!pool) {
    warnMemoryFallback("pool-null:write");
    memoryAttempts.set(key, next);
    return;
  }
  try {
    await pool.query(
      `INSERT INTO login_attempts (key, count, locked_until, updated_at)
       VALUES ($1, $2, CASE WHEN ($3)::bigint > 0 THEN to_timestamp(($3)::bigint / 1000.0) ELSE NULL END, now())
       ON CONFLICT (key) DO UPDATE SET
         count = $2,
         locked_until = CASE WHEN ($3)::bigint > 0 THEN to_timestamp(($3)::bigint / 1000.0) ELSE NULL END,
         updated_at = now()`,
      [key, next.count, next.lockedUntil],
    );
  } catch (err) {
    warnMemoryFallback("write", err);
    memoryAttempts.set(key, next);
  }
}

async function clearAttempt(key: string) {
  memoryAttempts.delete(key);
  const pool = await getPoolOrNull();
  if (!pool) return;
  try {
    await pool.query("DELETE FROM login_attempts WHERE key = $1", [key]);
  } catch {
    // Sin BD, el fallback en memoria ya se limpió.
  }
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip = await getClientIp();
  const now = Date.now();
  const ipKey = `ip:${ip}`;

  // Garantiza que la tabla login_attempts exista antes de leer/escribir
  // intentos. Antes solo la creaban los servicios de contenido público, nunca
  // el flujo de auth: si la tabla faltaba en prod, cada query fallaba y el
  // lockout caía en silencio al Map en memoria (inefectivo en serverless).
  // ensureSchema() es idempotente (CREATE TABLE IF NOT EXISTS) y no-op sin
  // DATABASE_URL, así que no rompe build/dev. Devuelve el detalle del error
  // (o null si OK) para loguearlo con prefijo [auth] DB schema-error.
  const schemaError = await ensureSchema();
  if (schemaError) {
    warnMemoryFallback("schema", schemaError);
  }

  const [ipRecord, globalRecord] = await Promise.all([
    readAttempt(ipKey),
    readAttempt("global"),
  ]);

  if (
    (ipRecord && ipRecord.lockedUntil > now) ||
    (globalRecord && globalRecord.lockedUntil > now)
  ) {
    return {
      error: "Demasiados intentos fallidos. Esperá unos minutos.",
    };
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return {
      error: "ADMIN_PASSWORD no está configurada en .env.local.",
    };
  }

  const input = formData.get("password");

  if (typeof input === "string" && isValidPassword(input, expected)) {
    await clearAttempt(ipKey);
    // Un login exitoso demuestra humanidad: resetea tambien el contador
    // global para no dejar el sitio en estado de gatillo facil.
    await clearAttempt("global");
    const store = await cookies();
    store.set(sessionCookie.name, createSessionToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: sessionCookie.maxAge,
    });
    redirect("/admin");
  }

  await recordFailedAttempt(ipKey, ipRecord);
  await recordFailedAttempt("global", globalRecord);

  return { error: "Contraseña incorrecta." };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookie.name);
  redirect("/admin/login");
}

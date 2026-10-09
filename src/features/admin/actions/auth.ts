"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  createSessionToken,
  sessionCookie,
} from "@/features/admin/services/session";
import { getPoolOrNull } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

// Fallback en memoria: solo se usa si la BD no está disponible
// (p. ej. build o DATABASE_URL ausente). En Vercel el bloqueo real
// persiste en la tabla login_attempts.
const memoryAttempts = new Map<string, { count: number; lockedUntil: number }>();

export type LoginState = { error?: string } | null;

function hashPassword(value: string): Buffer {
  return createHmac("sha256", "admin-password").update(value).digest();
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
  if (!pool) return memoryAttempts.get(key) ?? null;
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
    return {
      count: Number(res.rows[0].count) || 0,
      lockedUntil: res.rows[0].locked_until_ms
        ? Number(res.rows[0].locked_until_ms)
        : 0,
    };
  } catch {
    return memoryAttempts.get(key) ?? null;
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
    memoryAttempts.set(key, next);
    return;
  }
  try {
    await pool.query(
      `INSERT INTO login_attempts (key, count, locked_until, updated_at)
       VALUES ($1, $2, CASE WHEN $3 > 0 THEN to_timestamp($3 / 1000.0) ELSE NULL END, now())
       ON CONFLICT (key) DO UPDATE SET
         count = $2,
         locked_until = CASE WHEN $3 > 0 THEN to_timestamp($3 / 1000.0) ELSE NULL END,
         updated_at = now()`,
      [key, next.count, next.lockedUntil],
    );
  } catch {
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

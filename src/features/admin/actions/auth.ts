"use server";

import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";
import {
  createSessionToken,
  sessionCookie,
} from "@/features/admin/services/session";

const MAX_ATTEMPTS = 5;
const LOCK_MS = 15 * 60 * 1000;

const attempts = new Map<string, { count: number; lockedUntil: number }>();

export type LoginState = { error?: string } | null;

function hashPassword(value: string): Buffer {
  return createHmac("sha256", "admin-password").update(value).digest();
}

function isValidPassword(input: string, expected: string): boolean {
  const a = hashPassword(input);
  const b = hashPassword(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(
  _previous: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local";
  const now = Date.now();
  const record = attempts.get(ip);

  if (record && record.lockedUntil > now) {
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
    attempts.delete(ip);
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

  const next = {
    count: (record?.count ?? 0) + 1,
    lockedUntil: 0,
  };
  if (next.count >= MAX_ATTEMPTS) {
    next.lockedUntil = now + LOCK_MS;
  }
  attempts.set(ip, next);

  return { error: "Contraseña incorrecta." };
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.delete(sessionCookie.name);
  redirect("/admin/login");
}
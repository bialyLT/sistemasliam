import { createHmac, timingSafeEqual } from "node:crypto";

export const sessionCookie = {
  name: "admin_session",
  maxAge: 60 * 60 * 24,
};

type SessionPayload = {
  exp: number;
};

function getSecret(): string {
  return process.env.ADMIN_AUTH_SECRET ?? "";
}

function sign(payload: string): Buffer {
  return createHmac("sha256", getSecret()).update(payload).digest();
}

function encode(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decode(value: string): SessionPayload | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export function createSessionToken(): string {
  const payload = encode({ exp: Date.now() + sessionCookie.maxAge * 1000 });
  return `${payload}.${sign(payload).toString("base64url")}`;
}

export function verifySessionToken(
  token: string | null | undefined,
): boolean {
  if (!token || !getSecret()) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  const provided = Buffer.from(signature, "base64url");
  if (expected.length !== provided.length) return false;
  if (!timingSafeEqual(expected, provided)) return false;

  const data = decode(payload);
  return data !== null && data.exp > Date.now();
}
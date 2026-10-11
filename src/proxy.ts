import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  sessionCookie,
  verifySessionToken,
} from "@/features/admin/services/session";

// Defensa en profundidad (edge): frena floods de POSTs contra /admin/login
// antes de que lleguen a las Server Actions. Es complementario al bloqueo
// persistente en BD de actions/auth.ts, que sigue siendo la proteccion real
// (5 fallos -> bloqueo 15 min por IP + global).
// Umbral alto a proposito: un humano jamas hace 30 logins en 60 segundos,
// pero un script de fuerza bruta si.
const WINDOW_MS = 60 * 1000;
const MAX_POSTS_PER_WINDOW = 30;

const postHits = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const h = request.headers;
  return (
    h.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip")?.trim() ||
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "local"
  );
}

function isFlooding(ip: string): boolean {
  const now = Date.now();
  const hits = (postHits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  postHits.set(ip, hits);
  if (postHits.size > 5000) postHits.clear();
  return hits.length > MAX_POSTS_PER_WINDOW;
}

export function proxy(request: NextRequest) {
  const token = request.cookies.get(sessionCookie.name)?.value;
  const authed = verifySessionToken(token);
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    if (request.method === "POST" && isFlooding(clientIp(request))) {
      return new NextResponse("Demasiadas solicitudes. Intentá de nuevo en un minuto.", {
        status: 429,
        headers: { "Retry-After": "60" },
      });
    }
    if (authed) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!authed) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

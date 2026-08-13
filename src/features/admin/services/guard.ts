import { cookies } from "next/headers";
import {
  sessionCookie,
  verifySessionToken,
} from "@/features/admin/services/session";

export async function isAdminSession(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(sessionCookie.name)?.value);
}
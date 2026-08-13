"use client";

import { logout } from "@/features/admin/actions/auth";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => logout()}
      className="rounded-full border border-white/[.12] px-4 py-1.5 text-sm transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-[0.97]"
    >
      Cerrar sesión
    </button>
  );
}
"use client";

import { useActionState } from "react";
import { login } from "@/features/admin/actions/auth";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1.5 text-sm font-medium">
        Contraseña
        <input
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className="h-11 rounded-xl border border-white/[.12] bg-zinc-900 px-4 text-sm outline-none transition-all duration-200 focus:border-blue-400/70 focus:bg-zinc-800 focus:ring-2 focus:ring-blue-500/20"
        />
      </label>
      {state?.error ? (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="h-11 rounded-full bg-foreground text-sm font-medium text-background transition-all duration-200 hover:bg-zinc-100 hover:shadow-[0_8px_30px_-8px_rgba(148,180,255,0.55)] active:scale-[0.97] disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
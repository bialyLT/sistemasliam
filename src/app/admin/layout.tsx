import type { Metadata } from "next";
import Link from "next/link";
import { LogoutButton } from "@/features/admin/components/LogoutButton";

export const metadata: Metadata = {
  title: "Panel de control",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-10">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">Panel de control</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm text-zinc-400 transition-colors duration-200 hover:text-zinc-50"
          >
            Ver sitio
          </Link>
          <LogoutButton />
        </div>
      </header>
      {children}
    </main>
  );
}
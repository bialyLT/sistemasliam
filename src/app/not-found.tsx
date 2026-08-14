import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="text-sm font-medium text-zinc-400">Error 404</p>
      <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
        Página no encontrada
      </h1>
      <p className="max-w-md leading-7 text-zinc-500">
        La página que buscás no existe o fue movida.
      </p>
      <Button href="/">Volver al inicio</Button>
      <Link href="/projects" className="text-sm text-zinc-400 hover:text-zinc-50">
        Ver proyectos
      </Link>
    </main>
  );
}
import type { Metadata } from "next";
import { Button } from "@/components/ui";
import { siteConfig, socialLinks } from "@/lib/site";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <p className="rounded-full border border-white/[.12] px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-zinc-400">
        Error 404
      </p>
      <p
        aria-hidden
        className="bg-gradient-to-b from-zinc-50 via-zinc-400 to-zinc-700 bg-clip-text text-8xl font-bold tracking-tight text-transparent sm:text-9xl"
      >
        404
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-3xl">
        Esta página se perdió en el código
      </h1>
      <p className="max-w-md leading-7 text-zinc-500">
        La página que buscás no existe o fue movida. Podés volver al inicio o
        encontrarme en mis redes.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button href="/">Volver al inicio</Button>
        <Button href="/projects" variant="secondary">
          Ver proyectos
        </Button>
      </div>
      <div className="mt-2 flex items-center gap-5 text-sm text-zinc-400">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-50"
          >
            {social.label}
          </a>
        ))}
      </div>
      <p className="text-xs text-zinc-600">
        {siteConfig.heroName} — {siteConfig.location}
      </p>
    </main>
  );
}

import { Badge } from "@/components/ui";
import type { Novedad } from "@/features/novedades/types";

type NovedadCardProps = {
  novedad: Novedad;
};

export function NovedadCard({ novedad }: NovedadCardProps) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-2xl border border-white/[.08] bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-zinc-800 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.35)] dark:border-white/[.12] dark:bg-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge>{novedad.category}</Badge>
        <span className="text-sm text-zinc-500">{novedad.date}</span>
      </div>
      <h3 className="text-lg font-semibold leading-snug tracking-tight">
        {novedad.title}
      </h3>
      {novedad.source ? (
        <p className="text-sm font-medium text-zinc-500">en {novedad.source}</p>
      ) : null}
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {novedad.excerpt}
      </p>
      <a
        href={novedad.href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto pt-2 text-sm font-medium text-zinc-950 transition-colors hover:text-blue-300 hover:underline dark:text-zinc-50"
      >
        Leer más
      </a>
    </article>
  );
}

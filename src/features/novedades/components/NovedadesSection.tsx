import { NovedadesCarousel } from "@/features/novedades/components/NovedadesCarousel";
import type { Novedad } from "@/features/novedades/types";

type NovedadesSectionProps = {
  novedades: Novedad[];
};

export function NovedadesSection({ novedades }: NovedadesSectionProps) {
  return (
    <section className="flex flex-col gap-6">
      <div className="px-6">
        <h2 className="text-2xl font-bold tracking-tight">Novedades</h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Publicaciones, prensa y comunicados.
        </p>
      </div>
      {novedades.length === 0 ? (
        <p className="px-6 text-sm text-zinc-500">Todavía no hay novedades.</p>
      ) : (
        <NovedadesCarousel novedades={novedades} />
      )}
    </section>
  );
}
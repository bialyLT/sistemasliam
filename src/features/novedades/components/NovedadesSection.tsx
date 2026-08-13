import { NovedadCard } from "@/features/novedades/components/NovedadCard";
import type { Novedad } from "@/features/novedades/types";

type NovedadesSectionProps = {
  novedades: Novedad[];
};

export function NovedadesSection({ novedades }: NovedadesSectionProps) {
  return (
    <section className="flex flex-col gap-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Novedades</h2>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Publicaciones, prensa y comunicados.
        </p>
      </div>
      {novedades.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay novedades.</p>
      ) : (
        <ul className="grid gap-6 sm:grid-cols-2">
          {novedades.map((novedad) => (
            <li key={novedad.id}>
              <NovedadCard novedad={novedad} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

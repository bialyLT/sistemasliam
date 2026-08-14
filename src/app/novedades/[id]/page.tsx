import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNovedades } from "@/features/novedades";
import { siteConfig } from "@/lib/site";
import { relativeTime } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const novedades = await getNovedades();
  const novedad = novedades.find((n) => n.id === id);
  if (!novedad) return { title: "No encontrado" };
  return { title: `${novedad.title} | ${siteConfig.title}` };
}

export default async function NovedadDetail({ params }: PageProps) {
  const { id } = await params;
  const novedades = await getNovedades();
  const novedad = novedades.find((n) => n.id === id);

  if (!novedad) notFound();

  const timeAgo = relativeTime(novedad.date);

  return (
    <main className="flex-1">
      <article className="mx-auto w-full max-w-3xl px-6 py-12">
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-lg font-bold text-white">
                LB
              </div>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-50">Liam Bialy</p>
                <p className="text-sm text-zinc-500">Analista en sistemas de Computación</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>{timeAgo}</span>
              <span>·</span>
              <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 12.6h-1.8V6.4h1.8v6.2zM8 5.4a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              {novedad.title}
            </h1>
            {novedad.source && (
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                {novedad.category} · {novedad.source}
              </p>
            )}
          </header>

          {novedad.imageUrl ? (
            <div className="mb-8 rounded-2xl overflow-hidden border border-white/[.08] dark:border-white/[.12]">
              <img
                src={novedad.imageUrl}
                alt={novedad.title}
                className="w-full h-auto object-cover"
              />
            </div>
          ) : null}

          <div className="prose prose-zinc dark:prose-invert max-w-none">
            <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
              {novedad.excerpt}
            </p>
          </div>

          {novedad.href && novedad.href !== "/" ? (
            <div className="mt-8 pt-6 border-t border-white/[.08] dark:border-white/[.12]">
              <a
                href={novedad.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Ver publicación original
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
                </svg>
              </a>
            </div>
          ) : null}
        </article>
    </main>
  );
}
import Link from "next/link";
import { relativeTime } from "@/lib/utils";
import type { Novedad } from "@/features/novedades/types";

type NovedadCardProps = {
  novedad: Novedad;
};

export function NovedadCard({ novedad }: NovedadCardProps) {
  const timeAgo = relativeTime(novedad.date);
  const shouldTruncate = novedad.excerpt.length > 150;

  return (
    <article className="flex flex-col rounded-2xl border border-white/[.08] bg-white dark:border-white/[.12] dark:bg-zinc-900 overflow-hidden">
      <div className="flex items-center gap-1 px-5 pt-4 text-xs text-zinc-500">
        <span>{timeAgo}</span>
        <span>·</span>
        <svg className="h-3 w-3" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm.93 12.6h-1.8V6.4h1.8v6.2zM8 5.4a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </div>

      <div className="px-5 py-3">
        <p
          className={`text-sm leading-6 text-zinc-800 dark:text-zinc-200 ${
            shouldTruncate ? "max-h-[4.5rem] overflow-hidden" : ""
          }`}
        >
          {novedad.excerpt}
        </p>
        {shouldTruncate ? (
          <Link
            href={`/novedades/${novedad.id}`}
            className="mt-1 inline-block text-xs font-semibold text-zinc-500 hover:text-blue-500 dark:text-zinc-400 dark:hover:text-blue-400"
          >
            más
          </Link>
        ) : null}
      </div>

      {novedad.imageUrl ? (
        <div className="mx-4 mb-4 rounded-xl overflow-hidden border border-white/[.08] dark:border-white/[.12]">
          <img
            src={novedad.imageUrl}
            alt={novedad.title}
            className="w-full h-auto object-cover"
          />
        </div>
      ) : null}

      {novedad.href && novedad.href !== "/" ? (
        <div className="mt-auto px-5 pb-4">
          <a
            href={novedad.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Leer más
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
            </svg>
          </a>
        </div>
      ) : (
        <div className="px-5 pb-4" />
      )}
    </article>
  );
}
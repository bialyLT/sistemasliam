"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui";
import type { Project } from "@/features/projects/types";
import { cn } from "@/lib/utils";

type ProjectsCarouselProps = {
  projects: Project[];
};

export function ProjectsCarousel({ projects }: ProjectsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  function scrollToIndex(index: number) {
    const track = trackRef.current;
    if (!track || !track.firstElementChild) return;

    const step =
      (track.firstElementChild as HTMLElement).offsetWidth + 16;
    const maxIndex = projects.length - 1;
    const next = Math.min(maxIndex, Math.max(0, index));

    track.scrollTo({ left: next * step, behavior: "smooth" });
    setActiveIndex(next);
  }

  return (
    <section className="flex flex-col items-center gap-6">
      <div className="flex w-full items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proyectos</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Mirá mis trabajos más recientes.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex - 1)}
            disabled={activeIndex === 0}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[.145] transition-all duration-200 hover:scale-110 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-95 disabled:opacity-40"
          >
            &larr;
          </button>
          <button
            type="button"
            onClick={() => scrollToIndex(activeIndex + 1)}
            disabled={activeIndex === projects.length - 1}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[.145] transition-all duration-200 hover:scale-110 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-95 disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="text-sm text-zinc-500">Todavía no hay proyectos.</p>
      ) : (
        <div className="w-full max-w-sm">
          <div
            ref={trackRef}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto"
          >
            {projects.map((project) => (
              <article
                key={project.slug}
                className="relative aspect-[9/16] w-full flex-none snap-center overflow-hidden rounded-3xl bg-zinc-900 shadow-lg ring-1 ring-transparent transition-[box-shadow,ring-color] duration-300 hover:shadow-[0_16px_50px_-16px_rgba(59,130,246,0.45)] hover:ring-blue-400/30"
              >
                <video
                  className="absolute inset-0 h-full w-full object-cover"
                  src={project.video}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/80" />

                <div className="absolute inset-x-0 top-0 p-4">
                  <span className="text-xs font-medium text-white/70">
                    {project.year}
                  </span>
                  <h3 className="mt-1 line-clamp-2 text-lg font-bold leading-snug text-white">
                    {project.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">
                    {project.description}
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4">
                  <div className="flex flex-wrap gap-x-2.5 gap-y-1">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-sm font-semibold text-white/90"
                      >
                        #{tag.replace(/\s+/g, "")}
                      </span>
                    ))}
                  </div>
                  <Button href="/projects" className="w-full">
                    Ver más
                  </Button>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-5 flex justify-center gap-1.5">
            {projects.map((project, index) => (
              <button
                key={project.slug}
                type="button"
                onClick={() => scrollToIndex(index)}
                aria-label={`Ir al proyecto ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full bg-zinc-300 transition-all dark:bg-zinc-700",
                  index === activeIndex && "w-6 bg-zinc-900 dark:bg-zinc-100",
                )}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

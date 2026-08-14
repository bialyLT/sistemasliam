"use client";

import { useEffect, useRef, useState } from "react";
import { NovedadCard } from "@/features/novedades/components/NovedadCard";
import type { Novedad } from "@/features/novedades/types";
import { cn } from "@/lib/utils";

type NovedadesCarouselProps = {
  novedades: Novedad[];
  autoPlaySpeed?: number;
};

export function NovedadesCarousel({
  novedades,
  autoPlaySpeed = 4000,
}: NovedadesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = novedades.length;

  const goToIndexRef = useRef<(index: number) => void>(() => {});

  useEffect(() => {
    goToIndexRef.current = (index: number) => {
      const track = trackRef.current;
      if (!track || !track.firstElementChild) return;

      const step =
        (track.firstElementChild as HTMLElement).offsetWidth + 16;
      const next = ((index % count) + count) % count;

      track.scrollTo({ left: next * step, behavior: "smooth" });
      activeRef.current = next;
      setActiveIndex(next);
    };
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return;

    const timer = window.setInterval(() => {
      goToIndexRef.current(activeRef.current + 1);
    }, autoPlaySpeed);

    return () => window.clearInterval(timer);
  }, [paused, count, autoPlaySpeed]);

  if (count === 0) {
    return <p className="text-sm text-zinc-500">Todavía no hay novedades.</p>;
  }

  function goToIndex(index: number) {
    goToIndexRef.current(index);
  }

  return (
    <div
      className="flex w-full flex-col items-center gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="w-full max-w-lg">
        <div className="mb-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goToIndex(activeIndex - 1)}
            disabled={count <= 1}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[.145] transition-all duration-200 hover:scale-110 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-95 disabled:opacity-40"
          >
            &larr;
          </button>

          <div className="flex gap-1.5">
            {novedades.map((novedad, index) => (
              <button
                key={novedad.id}
                type="button"
                onClick={() => goToIndex(index)}
                aria-label={`Ir a la novedad ${index + 1}`}
                className={cn(
                  "h-1.5 rounded-full bg-zinc-300 transition-all dark:bg-zinc-700",
                  index === activeIndex && "w-6 bg-zinc-900 dark:bg-zinc-100",
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => goToIndex(activeIndex + 1)}
            disabled={count <= 1}
            aria-label="Siguiente"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[.145] transition-all duration-200 hover:scale-110 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-95 disabled:opacity-40"
          >
            &rarr;
          </button>
        </div>

        <div
          ref={trackRef}
          className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto"
        >
          {novedades.map((novedad) => (
            <div
              key={novedad.id}
              className="w-full flex-none snap-center"
            >
              <NovedadCard novedad={novedad} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
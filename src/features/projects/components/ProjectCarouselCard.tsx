"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui";
import type { Project } from "@/features/projects/types";

type ProjectCarouselCardProps = {
  project: Project;
};

export function ProjectCarouselCard({ project }: ProjectCarouselCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      { threshold: 0.6 },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  const isExternal = !!project.href && /^https?:\/\//i.test(project.href);
  const href = isExternal ? project.href : `/projects/${project.slug}`;

  return (
    <article className="group relative aspect-[9/16] w-full flex-none snap-center overflow-hidden rounded-3xl bg-zinc-900 shadow-lg ring-1 ring-transparent transition-[box-shadow,ring-color] duration-300 hover:shadow-[0_16px_50px_-16px_rgba(59,130,246,0.45)] hover:ring-blue-400/30">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={project.video}
        muted
        loop
        playsInline
        preload="metadata"
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/10 to-black/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="absolute inset-x-0 top-0 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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

      <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
        <Button
          href={href}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className="w-full"
        >
          Ver más
        </Button>
      </div>
    </article>
  );
}
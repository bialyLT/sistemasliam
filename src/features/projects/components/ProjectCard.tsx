"use client";

import Link from "next/link";
import { Badge } from "@/components/ui";
import type { Project } from "@/features/projects/types";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="group flex flex-col gap-4 rounded-2xl border border-white/[.08] bg-white p-6 shadow-none transition-all duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-zinc-800 hover:shadow-[0_12px_40px_-12px_rgba(59,130,246,0.35)] dark:border-white/[.12] dark:bg-zinc-900">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold tracking-tight">{project.title}</h3>
        <span className="text-sm text-zinc-500">{project.year}</span>
      </div>
      <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        {project.description}
      </p>
      <div className="mt-auto flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <Link
        href={`/projects/${project.slug}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-zinc-950 transition-colors hover:text-blue-300 dark:text-zinc-50"
      >
        Ver detalle
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </article>
  );
}

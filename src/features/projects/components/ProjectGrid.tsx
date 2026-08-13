"use client";

import { ProjectCard } from "@/features/projects/components/ProjectCard";
import type { Project } from "@/features/projects/types";

type ProjectGridProps = {
  projects: Project[];
};

export function ProjectGrid({ projects }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <p className="text-center text-sm text-zinc-500">
        No hay proyectos para el filtro seleccionado.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, index) => (
        <div
          key={project.slug}
          className="animate-fade-up"
          style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
        >
          <ProjectCard project={project} />
        </div>
      ))}
    </div>
  );
}

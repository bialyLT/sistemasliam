"use client";

import { useProjects } from "@/features/projects/hooks/useProjects";
import { ProjectGrid } from "@/features/projects/components/ProjectGrid";
import type { Project } from "@/features/projects/types";
import { cn } from "@/lib/utils";

type ProjectsSectionProps = {
  projects: Project[];
  tags: string[];
};

export function ProjectsSection({ projects, tags }: ProjectsSectionProps) {
  const { projects: filteredProjects, filter, setFilter } = useProjects(projects);

  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={cn(
            "rounded-full border border-white/[.12] px-4 py-1.5 text-sm transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.04]",
            filter === null && "bg-foreground text-background",
          )}
        >
          Todos
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => setFilter(filter === tag ? null : tag)}
            className={cn(
              "rounded-full border border-white/[.12] px-4 py-1.5 text-sm transition-all duration-200 hover:border-blue-400/40 hover:bg-white/[.04]",
              filter === tag && "bg-foreground text-background",
            )}
          >
            {tag}
          </button>
        ))}
      </div>
      <ProjectGrid projects={filteredProjects} />
    </section>
  );
}

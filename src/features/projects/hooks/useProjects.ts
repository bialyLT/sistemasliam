"use client";

import { useMemo, useState } from "react";
import type { Project } from "@/features/projects/types";

export function useProjects(initialProjects: Project[]) {
  const [filter, setFilter] = useState<string | null>(null);

  const filteredProjects = useMemo(() => {
    if (!filter) return initialProjects;
    return initialProjects.filter((project) => project.tags.includes(filter));
  }, [initialProjects, filter]);

  return {
    projects: filteredProjects,
    filter,
    setFilter,
  };
}

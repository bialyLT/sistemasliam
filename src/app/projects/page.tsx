import type { Metadata } from "next";
import { connection } from "next/server";
import { GoBack } from "@/components/GoBack";
import { ProjectsSection, getProjects, getProjectTags } from "@/features/projects";

export const metadata: Metadata = {
  title: "Proyectos",
  description:
    "Una selección de proyectos de desarrollo web y software de Liam Bialy: plataformas de gestión, e-commerce y aplicaciones colaborativas.",
  alternates: {
    canonical: "/projects",
  },
};

export default async function ProjectsPage() {
  await connection();
  const [projects, tags] = await Promise.all([getProjects(), getProjectTags()]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-12">
      <GoBack href="/">Volver al inicio</GoBack>
      <h1 className="mt-6 text-3xl font-bold tracking-tight">Proyectos</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Una selección de mis trabajos más recientes.
      </p>
      <div className="mt-10">
        <ProjectsSection projects={projects} tags={tags} />
      </div>
    </main>
  );
}

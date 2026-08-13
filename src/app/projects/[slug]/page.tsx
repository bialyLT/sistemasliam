import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { GoBack } from "@/components/GoBack";
import { ProjectDetail, getProjectBySlug } from "@/features/projects";

type ProjectPageProps = PageProps<"/projects/[slug]">;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Proyecto no encontrado" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  await connection();

  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <GoBack href="/projects" className="mb-10">
        Volver a proyectos
      </GoBack>
      <ProjectDetail project={project} />
    </main>
  );
}
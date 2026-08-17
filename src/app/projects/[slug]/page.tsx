import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { GoBack } from "@/components/GoBack";
import { ProjectDetail, getProjectBySlug } from "@/features/projects";
import { siteConfig } from "@/lib/site";

type ProjectPageProps = PageProps<"/projects/[slug]">;

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    return { title: "Proyecto no encontrado" };
  }

  const url = `${siteConfig.url}/projects/${project.slug}`;
  const metaTitle = project.seoTitle ?? project.title;

  return {
    title: metaTitle,
    description: project.description,
    keywords: project.tags,
    alternates: {
      canonical: `/projects/${project.slug}`,
    },
    openGraph: {
      type: "website",
      url,
      title: `${metaTitle} | ${siteConfig.name}`,
      description: project.description,
      siteName: siteConfig.name,
    },
    twitter: {
      card: "summary_large_image",
      title: `${metaTitle} | ${siteConfig.name}`,
      description: project.description,
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  await connection();

  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: project.title,
    description: project.description,
    url: `${siteConfig.url}/projects/${project.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
    },
    mainEntity: {
      "@type": "Service",
      name: project.seoTitle ?? project.title,
      description: project.description,
      provider: {
        "@type": "Person",
        name: siteConfig.author.name,
        url: siteConfig.author.url,
      },
    },
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GoBack href="/projects" className="mb-10">
        Volver a proyectos
      </GoBack>
      <ProjectDetail project={project} />
    </main>
  );
}
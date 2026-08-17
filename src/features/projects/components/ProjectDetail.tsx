import { Badge, Button } from "@/components/ui";
import type { Project } from "@/features/projects/types";

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
  const isExternal = !!project.href && /^https?:\/\//i.test(project.href);

  return (
    <article className="max-w-2xl">
      <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
      <p className="mt-2 text-sm text-zinc-500">
        {project.year} · {project.tags.join(" · ")}
      </p>
      {project.video ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-white/[.12] shadow-[0_16px_50px_-16px_rgba(59,130,246,0.4)]">
          <video
            className="aspect-[9/16] w-full max-w-sm mx-auto bg-zinc-900 object-cover"
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            controls
            preload="metadata"
          />
        </div>
      ) : null}
      <p className="mt-8 leading-7 text-zinc-400">
        {project.description}
      </p>
      {isExternal ? (
        <div className="mt-8">
          <Button
            href={project.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visitar proyecto
            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 1.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L10.293 8 4.646 2.354a.5.5 0 010-.708z" />
            </svg>
          </Button>
        </div>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-2">
        {project.tags.map((tag) => (
          <Badge key={tag}>{tag}</Badge>
        ))}
      </div>
      <h2 className="mt-10 text-lg font-semibold tracking-tight">Highlights</h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 leading-6 text-zinc-600 dark:text-zinc-400">
        {project.highlights.map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
    </article>
  );
}

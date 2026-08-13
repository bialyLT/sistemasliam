import { Badge } from "@/components/ui";
import type { Project } from "@/features/projects/types";

type ProjectDetailProps = {
  project: Project;
};

export function ProjectDetail({ project }: ProjectDetailProps) {
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

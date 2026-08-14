import { connection } from "next/server";
import { Button } from "@/components/ui";
import { ProjectsCarousel, getProjects } from "@/features/projects";
import { NovedadesSection, getNovedades } from "@/features/novedades";
import { siteConfig } from "@/lib/site";

export default async function Home() {
  await connection();
  const [projects, novedades] = await Promise.all([
    getProjects(),
    getNovedades(),
  ]);

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": `${siteConfig.url}/#website`,
                url: siteConfig.url,
                name: siteConfig.name,
                description: siteConfig.description,
                inLanguage: "es-AR",
                publisher: {
                  "@id": `${siteConfig.url}/#organization`,
                },
              },
              {
                "@type": "Person",
                "@id": `${siteConfig.url}/#person`,
                name: siteConfig.author.name,
                url: siteConfig.author.url,
                jobTitle: siteConfig.author.title,
                image: `${siteConfig.url}/opengraph-image`,
                sameAs: [siteConfig.github, siteConfig.linkedin],
              },
              {
                "@type": "Organization",
                "@id": `${siteConfig.url}/#organization`,
                name: siteConfig.name,
                url: siteConfig.url,
                logo: `${siteConfig.url}/icon.svg`,
              },
            ],
          }),
        }}
      />
      <section className="flex flex-col items-center gap-6 pb-16 pt-24 text-center">
        <div className="flex flex-col items-center gap-4">
          <p className="animate-fade-up text-sm font-medium text-zinc-400">
            Hola, soy
          </p>
          <h1 className="animate-fade-up text-5xl font-bold tracking-tight sm:text-6xl [animation-delay:80ms]">
            {siteConfig.heroName}
          </h1>
          <div className="h-1 w-16 animate-fade-up rounded-full bg-gradient-to-r from-sky-400 to-blue-600 [animation-delay:120ms]" />
          <p className="max-w-xl animate-fade-up leading-7 text-zinc-400 [animation-delay:160ms]">
            {siteConfig.description}
          </p>
        </div>
        <div className="flex animate-fade-up flex-col gap-4 sm:flex-row [animation-delay:240ms]">
          <Button href="#proyectos">Ver proyectos</Button>
          <Button
            href="https://wa.me/5493764635099?text=Hola%20liam%2C%20necesito%20de%20tus%20servicios"
            variant="secondary"
          >
            Contactarme
          </Button>
        </div>
      </section>

      <section className="border-t border-black/[.08] py-16 dark:border-white/[.12]">
        <NovedadesSection novedades={novedades} />
      </section>

      <section
        id="proyectos"
        className="scroll-mt-8 border-t border-black/[.08] py-16 dark:border-white/[.12]"
      >
        <ProjectsCarousel projects={projects} />
      </section>
    </main>
  );
}

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
                alternateName: siteConfig.name,
                url: siteConfig.author.url,
                jobTitle: siteConfig.author.title,
                image: `${siteConfig.url}/opengraph-image`,
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "AR",
                },
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
            Hola, Bienvenidos a
          </p>
          <h1 className="animate-fade-up text-5xl font-bold tracking-tight sm:text-6xl [animation-delay:80ms]">
            {siteConfig.name}
          </h1>
          <div className="h-1 w-16 animate-fade-up rounded-full bg-gradient-to-r from-sky-400 to-blue-600 [animation-delay:120ms]" />
          <p className="max-w-xl animate-fade-up leading-7 text-zinc-400 [animation-delay:160ms]">
            {siteConfig.heroName} — {siteConfig.description}
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

      <section className="mx-auto w-full max-w-3xl border-t border-black/[.08] px-6 py-16 text-center dark:border-white/[.12]">
        <h2 className="text-2xl font-bold tracking-tight">
          Sobre Sistemas Liam
        </h2>
        <p className="mt-4 leading-7 text-zinc-600 dark:text-zinc-400">
          Sistemas Liam es el espacio de desarrollo de{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">Liam Bialy</strong>,
          analista en sistemas y desarrollador fullstack con base en{" "}
          <strong className="text-zinc-900 dark:text-zinc-100">Argentina</strong>.
          Trabajo con Next.js, React y TypeScript para crear plataformas,
          aplicaciones web y experiencias digitales eficientes.
        </p>
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

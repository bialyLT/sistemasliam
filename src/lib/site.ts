import type { NavItem, SocialLink } from "@/types";

export const siteConfig = {
  name: "Sistemas Liam",
  heroName: "LIAM BIALY",
  title: "Sistemas Liam",
  titleDefault: "Sistemas Liam",
  titleTemplate: "%s | Sistemas Liam",
  description:
    "Liam Bialy, analista en sistemas y desarrollador fullstack. Proyectos, novedades y desarrollo web con Next.js, React y TypeScript.",
  url: "https://sistemasliam.com.ar",
  author: {
    name: "Liam Bialy",
    title: "Analista en sistemas y Desarrollador Fullstack",
    url: "https://sistemasliam.com.ar",
  },
  keywords: [
    "Liam Bialy",
    "Sistemas Liam",
    "desarrollador fullstack",
    "analista en sistemas",
    "desarrollo web",
    "Next.js",
    "React",
    "TypeScript",
    "portfolio",
    "desarrollador Argentina",
    "programación",
  ],
  contact: {
    whatsapp: "https://wa.me/5493764635099",
  },
  github: "https://github.com/bialyLT",
  linkedin: "https://www.linkedin.com/in/liambialy/",
};

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/projects" },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/bialyLT" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/liambialy/" },
];
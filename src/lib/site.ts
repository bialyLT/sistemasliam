import type { NavItem, SocialLink } from "@/types";

export const siteConfig = {
  name: "Sistemas Liam",
  heroName: "LIAM BIALY",
  title: "Sistemas Liam",
  description: "Analista en sistemas y Desarrollador Fullstack",
  url: "https://liam.dev",
};

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/projects" },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/bialyLT" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/liambialy/" },
];

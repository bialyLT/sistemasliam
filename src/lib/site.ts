import type { NavItem, SocialLink } from "@/types";

export const siteConfig = {
  name: "Liam",
  title: "Portfolio de Liam",
  description:
    "Desarrollador full-stack con foco en experiencias web rápidas y accesibles.",
  url: "https://liam.dev",
};

export const navItems: NavItem[] = [
  { label: "Inicio", href: "/" },
  { label: "Proyectos", href: "/projects" },
];

export const socialLinks: SocialLink[] = [
  { label: "GitHub", href: "https://github.com/liam" },
  { label: "LinkedIn", href: "https://linkedin.com/in/liam" },
];

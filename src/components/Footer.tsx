import { siteConfig, socialLinks } from "@/lib/site";

export function Footer() {
  return (
    <footer className="flex flex-col items-center gap-2 px-6 py-8 text-sm text-zinc-500 dark:text-zinc-500">
      <div className="flex items-center gap-4">
        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-zinc-50"
          >
            {social.label}
          </a>
        ))}
      </div>
      <p>
        © {new Date().getFullYear()} {siteConfig.name}
      </p>
    </footer>
  );
}

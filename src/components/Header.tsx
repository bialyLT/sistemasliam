import Link from "next/link";
import { navItems, siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-5 max-w-5xl w-full mx-auto">
      <Link href="/" className="animate-fade-up text-lg font-semibold tracking-tight">
        {siteConfig.name}
      </Link>
      <nav className="flex items-center gap-6 text-sm text-zinc-400">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="relative transition-colors duration-200 after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-blue-400 after:transition-transform after:duration-300 hover:text-zinc-50 hover:after:scale-x-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

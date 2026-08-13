import type { AnchorHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: "primary" | "secondary";
};

const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-sm font-medium transition-all duration-200";

const variants = {
  primary:
    "bg-foreground text-background hover:bg-zinc-100 hover:shadow-[0_8px_30px_-8px_rgba(148,180,255,0.55)] active:scale-[0.97]",
  secondary:
    "border border-solid border-white/[.145] hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-white/[.06] active:scale-[0.97]",
};

export function Button({
  variant = "primary",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <a className={cn(base, variants[variant], className)} {...props}>
      {children}
    </a>
  );
}

import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded-full bg-white/[.08] px-3 py-1 text-xs font-medium text-zinc-200 transition-colors duration-200 hover:bg-white/[.12]",
        className,
      )}
    >
      {children}
    </span>
  );
}

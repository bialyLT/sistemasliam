"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type GoBackProps = Omit<ComponentProps<typeof Link>, "href" | "onClick"> & {
  href: string;
  children: ReactNode;
};

export function GoBack({ href, children, className, ...rest }: GoBackProps) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (window.history.length > 1) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={cn(
        "group inline-flex items-center gap-1.5 text-sm text-zinc-400 transition-colors duration-200 hover:text-zinc-50",
        className,
      )}
      {...rest}
    >
      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-x-0.5">
        ←
      </span>
      {children}
    </Link>
  );
}
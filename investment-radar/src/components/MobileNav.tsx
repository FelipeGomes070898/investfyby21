"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const LINKS = [
  { href: "/dashboard", label: "Radar" },
  { href: "/acoes-br", label: "BR" },
  { href: "/acoes-us", label: "US" },
  { href: "/crypto", label: "Cripto" },
  { href: "/watchlist", label: "Lista" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-ink-line bg-ink-surface/95 backdrop-blur md:hidden">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname?.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={clsx(
              "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px]",
              active ? "text-brass" : "text-text-muted"
            )}
          >
            <span
              className={clsx(
                "h-1 w-1 rounded-full",
                active ? "bg-brass" : "bg-transparent"
              )}
            />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

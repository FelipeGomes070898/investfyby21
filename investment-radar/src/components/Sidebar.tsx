"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { PulseDot } from "./ui/primitives";

const LINKS = [
  { href: "/dashboard", label: "Radar diário" },
  { href: "/acoes-br", label: "Ações BR" },
  { href: "/acoes-us", label: "Ações US" },
  { href: "/crypto", label: "Cripto" },
  { href: "/watchlist", label: "Minha watchlist" },
  { href: "/settings", label: "Configurações" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:border-r md:border-ink-line md:bg-ink md:px-4 md:py-6">
      <div className="mb-8 px-2">
        <p className="font-display text-lg italic text-text">Radar</p>
        <p className="-mt-1 text-xs text-text-muted">de investimentos</p>
      </div>

      <nav className="flex-1 space-y-1">
        {LINKS.map((link) => {
          const active = pathname === link.href || pathname?.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-ink-raised text-brass"
                  : "text-text-muted hover:bg-ink-surface hover:text-text"
              )}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-ink-line px-2 pt-4">
        <PulseDot label="atualiza a cada hora" />
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Danas", icon: "📅", match: (path: string) => path === "/" || path.startsWith("/today") },
  { href: "/lessons", label: "Lekcije", icon: "📚", match: (path: string) => path.startsWith("/lesson") },
  { href: "/chat", label: "Učitelj", icon: "💬", match: (path: string) => path.startsWith("/chat") },
];

export function TabBar() {
  const pathname = usePathname();
  // Beim Lernen ausblenden: mehr Platz für Wort und Antworten
if (pathname.startsWith("/lesson/") || pathname.startsWith("/today")) return null;

  return (
    <nav
      aria-label="Glavna navigacija"
      // Handy: unten fixiert (Daumenzone). Ab Tablet: oben.
      className="border-line bg-surface fixed inset-x-0 bottom-0 z-10 border-t-2 pb-[env(safe-area-inset-bottom)] md:sticky md:top-0 md:bottom-auto md:border-t-0 md:border-b-2 md:pb-0"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3 md:max-w-3xl">
        {TABS.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-sm font-bold md:flex-row md:gap-2 md:text-base ${
                  active ? "text-river" : "text-muted"
                }`}
              >
                <span aria-hidden="true" className="text-2xl md:text-xl">
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
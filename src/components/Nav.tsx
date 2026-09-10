"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Heart, ListChecks, Settings, Layers } from "lucide-react";

const links = [
  { href: "/", label: "Deck", icon: Layers },
  { href: "/saved", label: "Saved", icon: Heart },
  { href: "/tracker", label: "Tracker", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-slate-950 shadow-lg shadow-cyan-500/20">
              <Briefcase className="h-4 w-4" />
            </span>
            <span className="text-sm sm:text-base">
              Job Scouter <span className="text-cyan-300">Apply</span>
            </span>
          </Link>
          <nav className="hidden gap-1 sm:flex">
            {links.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition ${
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-slate-950/90 backdrop-blur-xl sm:hidden">
        <div className="mx-auto flex max-w-3xl justify-around px-2 py-2">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 rounded-lg py-1 text-[10px] ${
                  active ? "text-cyan-300" : "text-slate-500"
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

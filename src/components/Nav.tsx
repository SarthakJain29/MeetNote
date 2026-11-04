"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMeetings } from "@/lib/storage";

const LINKS = [
  { href: "/", label: "New" },
  { href: "/history", label: "Library" },
  { href: "/tasks", label: "Tasks" },
];

export function Nav() {
  const path = usePathname();
  const { meetings } = useMeetings();
  const open = meetings.reduce((n, m) => n + m.actionItems.filter((a) => !a.done).length, 0);
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-ink-950/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-white">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-orange-400 text-sm">M</span>
          MeetNote
        </Link>
        <nav className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1" aria-label="Main">
          {LINKS.map((l) => {
            const active = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${active ? "bg-white text-ink-900" : "text-zinc-300 hover:text-white"}`}
              >
                {l.label}
                {l.href === "/tasks" && open > 0 && (
                  <span className="ml-1.5 rounded-full bg-fuchsia-500 px-1.5 text-[10px] font-bold text-white">{open}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { EmptyState, Skeleton, fmtDate } from "./ui";
import { useMeetings } from "@/lib/storage";

export function Library() {
  const { meetings, ready } = useMeetings();
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return meetings;
    return meetings.filter((m) => [m.title, m.summary, ...m.topics, m.transcript].join(" ").toLowerCase().includes(n));
  }, [meetings, q]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Library</p>
          <h1 className="font-display text-4xl font-extrabold text-white">Every meeting, searchable.</h1>
        </div>
        {meetings.length > 0 && (
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search titles, topics, transcripts…"
            aria-label="Search meetings"
            className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:outline-none sm:w-80"
          />
        )}
      </div>

      {!ready ? (
        <div className="grid gap-4 sm:grid-cols-2"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
      ) : meetings.length === 0 ? (
        <EmptyState title="No meetings yet" body="Analyse a transcript and save it — it will show up here.">
          <Link href="/" className="btn-primary">Analyse your first meeting</Link>
        </EmptyState>
      ) : shown.length === 0 ? (
        <EmptyState title="No matches" body={`Nothing matches “${q}”.`} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((m) => {
            const open = m.actionItems.filter((a) => !a.done).length;
            return (
              <Link key={m.id} href={`/meetings/${m.id}`} className="glass glass-hover flex flex-col p-6">
                <span className="text-xs text-zinc-500">{fmtDate(m.createdAt)}</span>
                <h2 className="mt-1 font-display text-lg font-bold text-white">{m.title}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm text-zinc-400">{m.summary}</p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  <span className="chip">{open} open task{open === 1 ? "" : "s"}</span>
                  {m.topics.slice(0, 2).map((t) => <span key={t} className="chip">#{t.toLowerCase()}</span>)}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

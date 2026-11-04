"use client";
import Link from "next/link";
import { useState } from "react";
import { EmptyState, PRIORITY_STYLE, Skeleton } from "./ui";
import { mutateMeetings, toggleTask, updateMeeting, useMeetings } from "@/lib/storage";

type Filter = "open" | "done" | "all";

export function TaskBoard() {
  const { meetings, ready } = useMeetings();
  const [filter, setFilter] = useState<Filter>("open");
  const [owner, setOwner] = useState("");

  const rank = { high: 0, medium: 1, low: 2 } as const;
  const all = meetings.flatMap((m) => m.actionItems.map((t) => ({ t, m })));
  const owners = [...new Set(all.map((x) => x.t.owner).filter(Boolean))] as string[];
  const rows = all
    .filter(({ t }) => (filter === "all" ? true : filter === "done" ? t.done : !t.done))
    .filter(({ t }) => !owner || t.owner === owner)
    .sort((a, b) => rank[a.t.priority] - rank[b.t.priority]);

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Tasks</p>
        <h1 className="font-display text-4xl font-extrabold text-white">Everything you owe, in one list.</h1>
      </div>
      {!ready ? (
        <Skeleton className="h-64" />
      ) : all.length === 0 ? (
        <EmptyState title="No action items yet" body="Tasks from your saved meetings are collected here.">
          <Link href="/" className="btn-primary">Analyse a meeting</Link>
        </EmptyState>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              {(["open", "done", "all"] as Filter[]).map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize ${filter === f ? "bg-white text-ink-900" : "text-zinc-300 hover:text-white"}`}>{f}</button>
              ))}
            </div>
            {owners.length > 0 && (
              <select value={owner} onChange={(e) => setOwner(e.target.value)} aria-label="Filter by owner" className="rounded-full border border-white/10 bg-ink-800 px-4 py-2 text-sm text-zinc-200">
                <option value="">Everyone</option>
                {owners.map((o) => <option key={o}>{o}</option>)}
              </select>
            )}
          </div>
          {rows.length === 0 ? (
            <EmptyState title="All clear" body="No tasks match this filter." />
          ) : (
            <ul className="space-y-2">
              {rows.map(({ t, m }) => (
                <li key={t.id} className="glass flex items-start gap-3 p-4">
                  <input type="checkbox" checked={t.done} aria-label={`Mark "${t.task}" done`} className="mt-1 h-4 w-4 accent-fuchsia-500"
                    onChange={() => mutateMeetings((ms) => updateMeeting(ms, m.id, (x) => toggleTask(x, t.id)))} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${t.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>{t.task}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs">
                      {t.owner && <span className="chip">👤 {t.owner}</span>}
                      {t.due && <span className="chip">🗓 {t.due}</span>}
                      <span className={`chip ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                      <Link href={`/meetings/${m.id}`} className="text-zinc-500 hover:text-violet-300">from {m.title}</Link>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

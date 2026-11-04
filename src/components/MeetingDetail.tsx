"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { AnalysisView } from "./AnalysisView";
import { Ask } from "./Ask";
import { EmptyState, ProviderBadge, Skeleton, fmtDate } from "./ui";
import { followUpEmail, meetingToMarkdown } from "@/lib/export";
import { mutateMeetings, removeMeeting, toggleTask, updateMeeting, useMeetings } from "@/lib/storage";
import { parseTurns, transcriptStats } from "@/lib/transcript";

const TABS = ["Notes", "Transcript", "Ask", "Follow-up"] as const;

export function MeetingDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { meetings, ready } = useMeetings();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Notes");
  const [copied, setCopied] = useState<string | null>(null);
  const m = meetings.find((x) => x.id === id);

  if (!ready) return <div className="space-y-4"><Skeleton className="h-10 w-1/3" /><Skeleton className="h-48" /></div>;
  if (!m) {
    return (
      <EmptyState title="Meeting not found" body="It may have been deleted, or it was saved in a different browser.">
        <Link href="/history" className="btn-primary">Back to library</Link>
      </EmptyState>
    );
  }

  const stats = transcriptStats(m.transcript);
  const email = followUpEmail(m);
  const copy = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 1600);
    } catch { /* clipboard blocked: ignore */ }
  };
  const download = () => {
    const url = URL.createObjectURL(new Blob([meetingToMarkdown(m)], { type: "text/markdown" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `${m.title.replace(/[^\w]+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <Link href="/history" className="hover:text-white">← Library</Link>
          <span>{fmtDate(m.createdAt)}</span>
          <ProviderBadge name={m.provider} />
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={download}>Export .md</button>
          <button
            className="btn-ghost !text-rose-200"
            onClick={() => {
              if (confirm("Delete this meeting? This can't be undone.")) {
                mutateMeetings((ms) => removeMeeting(ms, m.id));
                router.push("/history");
              }
            }}
          >
            Delete
          </button>
        </div>
      </div>

      <div role="tablist" className="flex gap-1 overflow-x-auto rounded-full border border-white/10 bg-white/5 p-1 sm:w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition ${tab === t ? "bg-white text-ink-900" : "text-zinc-300 hover:text-white"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Notes" && (
        <AnalysisView a={m} onToggle={(tid) => mutateMeetings((ms) => updateMeeting(ms, m.id, (x) => toggleTask(x, tid)))} />
      )}

      {tab === "Transcript" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
          <div className="glass max-h-[34rem] space-y-3 overflow-y-auto p-6">
            {parseTurns(m.transcript).map((t, i) => (
              <p key={i} className="text-sm leading-relaxed text-zinc-300">
                {t.speaker && <strong className="mr-2 text-violet-300">{t.speaker}</strong>}
                {t.text}
              </p>
            ))}
          </div>
          <aside className="glass h-fit space-y-3 p-6">
            <h3 className="eyebrow">Talk time</h3>
            {stats.speakers.length === 0 && <p className="text-sm text-zinc-500">No speaker labels detected.</p>}
            {stats.speakers.map((s) => (
              <div key={s.speaker}>
                <div className="mb-1 flex justify-between text-xs text-zinc-300">
                  <span>{s.speaker}</span><span>{Math.round(s.share * 100)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-orange-300" style={{ width: `${s.share * 100}%` }} />
                </div>
              </div>
            ))}
            <p className="pt-2 text-xs text-zinc-500">{stats.words.toLocaleString()} words</p>
          </aside>
        </div>
      )}

      {tab === "Ask" && <Ask transcript={m.transcript} />}

      {tab === "Follow-up" && (
        <div className="glass space-y-4 p-6">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-300">{email}</pre>
          <button className="btn-primary" onClick={() => copy("email", email)}>{copied === "email" ? "Copied ✓" : "Copy email"}</button>
        </div>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { ErrorBanner, ProviderBadge } from "./ui";
import type { ProviderName } from "@/lib/types";

interface QA { q: string; a: string; provider: ProviderName }

export function Ask({ transcript }: { transcript: string }) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [log, setLog] = useState<QA[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const question = q.trim();
    if (question.length < 3 || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, question }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Request failed");
      setLog((l) => [{ q: question, a: data.answer, provider: data.provider }, ...l]);
      setQ("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={submit} className="glass flex gap-2 p-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask anything… “Who owns the release notes?”"
          aria-label="Question about this meeting"
          className="min-w-0 flex-1 bg-transparent px-4 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
        />
        <button className="btn-primary" disabled={busy || q.trim().length < 3}>{busy ? "Thinking…" : "Ask"}</button>
      </form>
      {error && <ErrorBanner>{error}</ErrorBanner>}
      {log.length === 0 && !error && <p className="px-2 text-sm text-zinc-500">Answers come only from this meeting&apos;s transcript.</p>}
      {log.map((x, i) => (
        <div key={i} className="glass animate-rise space-y-2 p-5">
          <p className="text-sm font-semibold text-white">{x.q}</p>
          <p className="text-sm leading-relaxed text-zinc-300">{x.a}</p>
          <ProviderBadge name={x.provider} />
        </div>
      ))}
    </div>
  );
}

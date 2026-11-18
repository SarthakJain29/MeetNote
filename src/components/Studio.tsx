"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnalysisView } from "./AnalysisView";
import { ErrorBanner, ProviderBadge, Skeleton } from "./ui";
import { SAMPLES } from "@/lib/samples";
import { MAX_TRANSCRIPT_CHARS, cleanSubtitles, transcriptStats } from "@/lib/transcript";
import { addMeeting, mutateMeetings } from "@/lib/storage";
import { newId } from "@/lib/ai/schema";
import type { Analysis, Meeting, ProviderName } from "@/lib/types";

interface Result { analysis: Analysis; provider: ProviderName; transcript: string; warning?: string }

export function Studio() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const stats = transcriptStats(text);
  const tooLong = text.length > MAX_TRANSCRIPT_CHARS;
  const canRun = text.trim().length >= 20 && !tooLong && !loading;

  async function analyze() {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
      setResult({ ...data, transcript: text });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function save() {
    if (!result) return;
    const meeting: Meeting = {
      ...result.analysis,
      id: newId("mtg"),
      transcript: result.transcript,
      createdAt: new Date().toISOString(),
      provider: result.provider,
    };
    try {
      mutateMeetings((ms) => addMeeting(ms, meeting));
      router.push(`/meetings/${meeting.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 2_000_000) return setError("That file is over 2 MB — please use a smaller transcript.");
    const raw = await f.text();
    setError(null);
    setText(/\.(vtt|srt)$/i.test(f.name) ? cleanSubtitles(raw) : raw);
  }

  return (
    <div className="space-y-16">
      <section className="mx-auto max-w-3xl pt-8 text-center">
        <p className="eyebrow">AI meeting notes · zero setup</p>
        <h1 className="mt-4 font-display text-5xl font-extrabold leading-[1.05] tracking-tight [text-wrap:balance] text-white sm:text-7xl">
          Meetings in. <span className="grad-text">Clarity out.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
          Drop in a transcript and get the summary, decisions, and a task list with owners and deadlines — in seconds.
        </p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <div className="glass space-y-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="t" className="eyebrow">Transcript</label>
            <div className="flex flex-wrap gap-2">
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" className="chip transition hover:bg-white/15" onClick={() => { setText(s.text); setResult(null); setError(null); }}>
                  ✨ {s.label}
                </button>
              ))}
            </div>
          </div>
          <textarea
            id="t"
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            placeholder={"Paste your transcript…\n\nTip: lines like “Priya: …” let MeetNote attribute tasks to people."}
            className="h-80 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-zinc-100 placeholder:text-zinc-600 focus:border-violet-400/60 focus:outline-none focus:ring-2 focus:ring-violet-400/30"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-500">
            <span className={tooLong ? "text-rose-300" : ""}>
              {stats.words.toLocaleString()} words · {stats.speakers.length} speaker{stats.speakers.length === 1 ? "" : "s"} · ~{stats.readMinutes} min read
              {tooLong && ` · over the ${MAX_TRANSCRIPT_CHARS.toLocaleString()} character limit`}
            </span>
            <div className="flex gap-2">
              <input ref={fileRef} type="file" accept=".txt,.vtt,.srt,.md,text/plain" className="hidden" onChange={onFile} />
              <button type="button" className="btn-ghost !py-1.5" onClick={() => fileRef.current?.click()}>Upload .txt / .vtt / .srt</button>
              {text && <button type="button" className="btn-ghost !py-1.5" onClick={() => { setText(""); setResult(null); }}>Clear</button>}
            </div>
          </div>
          <button type="button" onClick={analyze} disabled={!canRun} className="btn-primary w-full !py-3.5 text-base">
            {loading ? "Analysing…" : "Generate notes"}
          </button>
        </div>

        <div aria-live="polite" className="space-y-4">
          {error && <ErrorBanner>{error}</ErrorBanner>}
          {loading && (
            <div className="space-y-4">
              <Skeleton className="h-40" /><Skeleton className="h-56" /><Skeleton className="h-32" />
            </div>
          )}
          {!loading && !result && !error && (
            <div className="glass grid min-h-80 place-items-center p-10 text-center">
              <div>
                <div className="mx-auto mb-4 grid h-14 w-14 animate-float place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-orange-400/30 text-2xl">✦</div>
                <p className="font-display text-lg font-bold text-white">Your notes will appear here</p>
                <p className="mt-1 text-sm text-zinc-500">Try a sample to see it in action — no API key needed.</p>
              </div>
            </div>
          )}
          {result && !loading && (
            <>
              {result.warning && <ErrorBanner>{result.warning}</ErrorBanner>}
              <div className="flex items-center justify-between">
                <ProviderBadge name={result.provider} />
                <button type="button" onClick={save} className="btn-primary">Save to library</button>
              </div>
              <AnalysisView a={result.analysis} />
            </>
          )}
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          ["⚡", "Owner-aware tasks", "Action items are attributed to the speaker and carry due dates and priority."],
          ["🔌", "Bring any free LLM", "Gemini or Groq behind one interface — or run fully offline in mock mode."],
          ["🔒", "Private by default", "Your library lives in your browser. Nothing is stored on a server."],
        ].map(([i, t, b]) => (
          <div key={t} className="glass glass-hover p-6">
            <div className="text-2xl">{i}</div>
            <h3 className="mt-3 font-display font-bold text-white">{t}</h3>
            <p className="mt-1 text-sm text-zinc-400">{b}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

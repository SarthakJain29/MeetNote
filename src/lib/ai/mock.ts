import { parseTurns } from "../transcript";
import { normalizeAnalysis } from "./schema";
import type { Analysis, Priority } from "../types";
import type { AIProvider } from "./types";

const STOP = new Set(
  "the a an and or but if then so to of in on for with at by from is are was were be been it this that these those i you we they he she as do does did have has had not no yes can could should would will just about our your their there here what when who how why which also like going get got let's lets okay ok yeah right think know need want one two really very more some any all up out into over than too me my us them its it's i'll we'll don't can't i'm we're that's".split(" "),
);

const sentences = (text: string) =>
  text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter((s) => s.split(" ").length >= 4) ?? [];

const words = (s: string) => (s.toLowerCase().match(/[a-z][a-z'-]+/g) ?? []).filter((w) => !STOP.has(w) && w.length > 2);

const ACTION_RE = /\b(i'll|i will|we'll|we will|will (?:send|share|write|draft|schedule|set up|follow|review|update|prepare|check|fix|build|create|book)|can you|could you|need to|needs to|action item|todo|to-do|take (?:the|care)|by (?:monday|tuesday|wednesday|thursday|friday|eod|end of|next|tomorrow|tonight)|follow up)\b/i;
const DECISION_RE = /\b(we (?:decided|agreed)|decided to|agreed to|let's go with|we're going with|we will go with|final decision|approved|signed off|going ahead with)\b/i;
const DUE_RE = /\b(by (?:end of (?:day|week|month)|eod|eow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|tonight|next \w+)|(?:next|this) (?:week|monday|tuesday|wednesday|thursday|friday|sprint|month)|tomorrow|today|(?:on|by) (?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w* \d{1,2})\b/i;
const POS = ["great", "excited", "love", "good", "awesome", "perfect", "thanks", "happy", "progress", "nice"];
const NEG = ["blocked", "worried", "concern", "delay", "problem", "risk", "unhappy", "angry", "frustrat", "behind", "issue", "fail"];

const stripTask = (s: string) =>
  s.replace(/^(ok(ay)?|yes|yeah|sure|great|so|and|then|alright)[,.]?\s+/i, "").replace(/\s+/g, " ").trim();
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Deterministic, offline heuristic analysis. Lets the whole app work with zero API keys. */
export function mockAnalyze(transcript: string): Analysis {
  const turns = parseTurns(transcript);
  const flat = turns.flatMap((t) => sentences(t.text).map((s) => ({ s, speaker: t.speaker })));
  const lower = transcript.toLowerCase();

  // term frequency -> topics and sentence scoring
  const freq = new Map<string, number>();
  for (const w of words(transcript)) freq.set(w, (freq.get(w) ?? 0) + 1);
  const topics = [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).filter(([, n]) => n > 1).map(([w]) => cap(w));

  const scored = flat
    .map((x, i) => {
      const ws = words(x.s);
      const score = ws.reduce((a, w) => a + (freq.get(w) ?? 0), 0) / Math.sqrt(ws.length + 1);
      return { ...x, i, score };
    })
    .filter((x) => !x.s.endsWith("?"));
  const keyPoints = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .sort((a, b) => a.i - b.i)
    .map((x) => stripTask(x.s));

  const decisions = flat.filter((x) => DECISION_RE.test(x.s)).map((x) => stripTask(x.s)).slice(0, 6);

  const seen = new Set<string>();
  const items = flat
    .filter((x) => ACTION_RE.test(x.s) && !x.s.endsWith("?") || /^(can|could) you\b/i.test(x.s))
    .map((x) => {
      const task = stripTask(x.s);
      const due = DUE_RE.exec(x.s)?.[0] ?? null;
      const priority: Priority = /\b(urgent|asap|critical|blocker|today|eod)\b/i.test(x.s) ? "high" : /\b(eventually|nice to have|someday|when you can)\b/i.test(x.s) ? "low" : "medium";
      return { task, owner: x.speaker, due, priority };
    })
    .filter((a) => {
      const k = a.task.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 8);

  const openQuestions = flat.filter((x) => x.s.endsWith("?") && x.s.split(" ").length >= 5).map((x) => x.s).slice(0, 4);

  const pos = POS.filter((w) => lower.includes(w)).length;
  const neg = NEG.filter((w) => lower.includes(w)).length;
  const sentiment = neg > pos + 1 ? "tense" : pos > neg ? "positive" : "neutral";

  const speakers = [...new Set(turns.map((t) => t.speaker).filter(Boolean))] as string[];
  const lead = keyPoints.slice(0, 2).join(" ");
  const summary =
    (lead || flat[0]?.s || "The transcript was too short to summarise.") +
    ` ${speakers.length ? `${speakers.length} participant${speakers.length > 1 ? "s" : ""} took part` : "The discussion"}, ` +
    `producing ${items.length} action item${items.length === 1 ? "" : "s"} and ${decisions.length} decision${decisions.length === 1 ? "" : "s"}.`;

  return normalizeAnalysis({
    title: topics.length ? `${topics.slice(0, 2).join(" & ")} sync` : "Meeting notes",
    summary,
    keyPoints,
    decisions,
    actionItems: items,
    openQuestions,
    topics,
    sentiment,
  });
}

/** Keyword retrieval: returns the transcript sentences that best match the question. */
export function mockAsk(transcript: string, question: string): string {
  const q = new Set(words(question));
  if (!q.size) return "Ask a more specific question about the meeting.";
  const hits = sentences(transcript)
    .map((s) => ({ s, score: words(s).filter((w) => q.has(w)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);
  if (!hits.length) return "I couldn't find anything about that in the transcript.";
  return hits.map((h) => h.s).join(" ");
}

export const mockProvider: AIProvider = {
  name: "mock",
  analyze: async (t) => mockAnalyze(t),
  ask: async (t, q) => mockAsk(t, q),
};

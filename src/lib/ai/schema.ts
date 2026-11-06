import { z } from "zod";
import type { Analysis, ActionItem, Priority } from "../types";

const str = z.string().trim();
const priority = z
  .string()
  .transform((s): Priority => (/^h/i.test(s) ? "high" : /^l/i.test(s) ? "low" : "medium"));

const raw = z.object({
  title: str.default("Untitled meeting"),
  summary: str.default(""),
  keyPoints: z.array(str).default([]),
  decisions: z.array(str).default([]),
  actionItems: z
    .array(
      z.object({
        task: str,
        owner: z.string().nullish(),
        due: z.string().nullish(),
        priority: priority.default("medium"),
      }),
    )
    .default([]),
  openQuestions: z.array(str).default([]),
  topics: z.array(str).default([]),
  sentiment: z.string().default("neutral"),
});

let counter = 0;
export function newId(prefix = "id"): string {
  counter += 1;
  return `${prefix}_${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

/** Pulls the first JSON object out of an LLM reply (handles ```json fences and chatter). */
export function extractJson(text: string): unknown {
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const body = fenced ? fenced[1] : text;
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model reply");
  return JSON.parse(body.slice(start, end + 1));
}

/** Validates + normalises untrusted model output into an Analysis. Throws on garbage. */
export function normalizeAnalysis(input: unknown): Analysis {
  const p = raw.parse(input);
  const clean = (xs: string[]) => xs.map((x) => x.trim()).filter(Boolean);
  const actionItems: ActionItem[] = p.actionItems
    .filter((a) => a.task.length > 0)
    .map((a) => ({
      id: newId("task"),
      task: a.task,
      owner: a.owner?.trim() || null,
      due: a.due?.trim() || null,
      priority: a.priority,
      done: false,
    }));
  const s = p.sentiment.toLowerCase();
  if (!p.summary) throw new Error("Model returned no summary");
  return {
    title: p.title.slice(0, 120) || "Untitled meeting",
    summary: p.summary,
    keyPoints: clean(p.keyPoints).slice(0, 10),
    decisions: clean(p.decisions).slice(0, 10),
    actionItems: actionItems.slice(0, 25),
    openQuestions: clean(p.openQuestions).slice(0, 8),
    topics: clean(p.topics).slice(0, 8),
    sentiment: s.startsWith("pos") ? "positive" : s.startsWith("ten") || s.startsWith("neg") ? "tense" : "neutral",
  };
}

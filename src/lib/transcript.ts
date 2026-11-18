import type { Turn, TranscriptStats } from "./types";

export const MAX_TRANSCRIPT_CHARS = 60_000;

/** Strips WebVTT / SRT cue numbers, timings and headers, leaving spoken text. */
export function cleanSubtitles(raw: string): string {
  const lines = raw.replace(/\r/g, "").split("\n");
  const out: string[] = [];
  for (const line of lines) {
    const t = line.trim();
    if (!t || t === "WEBVTT" || /^\d+$/.test(t)) continue;
    if (/^\d{1,2}:\d{2}(:\d{2})?[.,]\d{3}\s*-->/.test(t)) continue;
    if (/^(NOTE|STYLE|Kind:|Language:)/.test(t)) continue;
    out.push(t.replace(/<[^>]+>/g, ""));
  }
  return out.join("\n");
}

const SPEAKER_RE = /^(?:\[?\(?\d{1,2}:\d{2}(?::\d{2})?\)?\]?\s*)?([A-Z][\w.'’-]*(?: [A-Z][\w.'’-]*){0,2})\s*:\s+(.+)$/;

/** Splits a transcript into speaker turns. Unlabelled lines attach to the previous turn. */
export function parseTurns(transcript: string): Turn[] {
  const turns: Turn[] = [];
  for (const rawLine of transcript.replace(/\r/g, "").split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = SPEAKER_RE.exec(line);
    if (m) turns.push({ speaker: m[1], text: m[2].trim() });
    else if (turns.length) turns[turns.length - 1].text += " " + line;
    else turns.push({ speaker: null, text: line });
  }
  return turns;
}

export function countWords(text: string): number {
  const m = text.trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function transcriptStats(transcript: string): TranscriptStats {
  const turns = parseTurns(transcript);
  const byWords = new Map<string, number>();
  let labelled = 0;
  for (const t of turns) {
    if (!t.speaker) continue;
    const w = countWords(t.text);
    labelled += w;
    byWords.set(t.speaker, (byWords.get(t.speaker) ?? 0) + w);
  }
  const speakers = [...byWords.entries()]
    .map(([speaker, words]) => ({ speaker, words, share: labelled ? words / labelled : 0 }))
    .sort((a, b) => b.words - a.words);
  const words = countWords(transcript);
  return { words, readMinutes: Math.max(1, Math.round(words / 200)), speakers };
}

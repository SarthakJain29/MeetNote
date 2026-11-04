import { describe, expect, it } from "vitest";
import { cleanSubtitles, parseTurns, transcriptStats } from "@/lib/transcript";

describe("transcript", () => {
  it("parses speaker turns and joins continuation lines", () => {
    const t = parseTurns("Ann: Hello there\nand welcome\n[00:12] Bob Smith: Hi Ann");
    expect(t).toEqual([
      { speaker: "Ann", text: "Hello there and welcome" },
      { speaker: "Bob Smith", text: "Hi Ann" },
    ]);
  });
  it("computes speaker share", () => {
    const s = transcriptStats("Ann: one two three\nBob: four");
    expect(s.words).toBe(6);
    expect(s.speakers[0]).toMatchObject({ speaker: "Ann", words: 3, share: 0.75 });
  });
  it("cleans VTT/SRT", () => {
    const out = cleanSubtitles("WEBVTT\n\n1\n00:00:01.000 --> 00:00:03.000\nHello <b>world</b>\n");
    expect(out).toBe("Hello world");
  });
});

import { describe, expect, it } from "vitest";
import { mockAnalyze, mockAsk } from "@/lib/ai/mock";
import { SAMPLES } from "@/lib/samples";

describe("mock provider", () => {
  const a = mockAnalyze(SAMPLES[0].text);
  it("finds action items with owners and due dates", () => {
    expect(a.actionItems.length).toBeGreaterThanOrEqual(3);
    const notes = a.actionItems.find((x) => /release notes/i.test(x.task));
    expect(notes?.owner).toBe("Dana");
    expect(notes?.due).toMatch(/friday/i);
  });
  it("finds decisions and open questions", () => {
    expect(a.decisions.join(" ")).toMatch(/onboarding first/i);
    expect(a.openQuestions.length).toBeGreaterThan(0);
  });
  it("answers from transcript or admits ignorance", () => {
    expect(mockAsk(SAMPLES[0].text, "Who writes the release notes?")).toMatch(/release notes/i);
    expect(mockAsk(SAMPLES[0].text, "zebra giraffe")).toMatch(/couldn't find/i);
  });
});

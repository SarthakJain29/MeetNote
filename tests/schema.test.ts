import { describe, expect, it } from "vitest";
import { extractJson, normalizeAnalysis } from "@/lib/ai/schema";

describe("schema", () => {
  it("extracts JSON from fenced replies", () => {
    expect(extractJson('Sure!\n```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });
  it("throws without JSON", () => {
    expect(() => extractJson("nope")).toThrow();
  });
  it("normalises messy model output", () => {
    const a = normalizeAnalysis({
      title: "T", summary: "S", sentiment: "Positive vibes",
      actionItems: [{ task: "Do it", owner: " Ann ", priority: "HIGH" }, { task: "" }],
    });
    expect(a.sentiment).toBe("positive");
    expect(a.actionItems).toHaveLength(1);
    expect(a.actionItems[0]).toMatchObject({ owner: "Ann", priority: "high", done: false, due: null });
  });
  it("rejects missing summary", () => {
    expect(() => normalizeAnalysis({ title: "x" })).toThrow();
  });
});

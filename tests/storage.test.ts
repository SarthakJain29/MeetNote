import { describe, expect, it } from "vitest";
import { addMeeting, parseMeetings, removeMeeting, toggleTask } from "@/lib/storage";
import type { Meeting } from "@/lib/types";

const m = (id: string): Meeting => ({
  id, transcript: "", createdAt: "2026-01-01", provider: "mock", title: id, summary: "", keyPoints: [],
  decisions: [], openQuestions: [], topics: [], sentiment: "neutral",
  actionItems: [{ id: "t1", task: "x", owner: null, due: null, priority: "low", done: false }],
});

describe("storage helpers", () => {
  it("tolerates corrupt JSON", () => {
    expect(parseMeetings("{oops")).toEqual([]);
    expect(parseMeetings('{"a":1}')).toEqual([]);
  });
  it("adds newest first and removes", () => {
    const list = addMeeting([m("a")], m("b"));
    expect(list.map((x) => x.id)).toEqual(["b", "a"]);
    expect(removeMeeting(list, "a").map((x) => x.id)).toEqual(["b"]);
  });
  it("toggles a task immutably", () => {
    const a = m("a");
    const b = toggleTask(a, "t1");
    expect(b.actionItems[0].done).toBe(true);
    expect(a.actionItems[0].done).toBe(false);
  });
});

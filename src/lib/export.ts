import type { Meeting } from "./types";

export function meetingToMarkdown(m: Meeting): string {
  const list = (xs: string[]) => xs.map((x) => `- ${x}`).join("\n");
  const parts = [`# ${m.title}`, `_${new Date(m.createdAt).toLocaleString("en-US")}_`, "", "## Summary", m.summary];
  if (m.keyPoints.length) parts.push("", "## Key points", list(m.keyPoints));
  if (m.decisions.length) parts.push("", "## Decisions", list(m.decisions));
  if (m.actionItems.length) {
    parts.push("", "## Action items");
    for (const a of m.actionItems) {
      const meta = [a.owner && `@${a.owner}`, a.due && `due ${a.due}`, a.priority].filter(Boolean).join(", ");
      parts.push(`- [${a.done ? "x" : " "}] ${a.task} (${meta})`);
    }
  }
  if (m.openQuestions.length) parts.push("", "## Open questions", list(m.openQuestions));
  return parts.join("\n") + "\n";
}

/** Draft follow-up email body built from the structured notes (no LLM needed). */
export function followUpEmail(m: Meeting): string {
  const tasks = m.actionItems
    .map((a) => `  • ${a.task}${a.owner ? ` — ${a.owner}` : ""}${a.due ? ` (${a.due})` : ""}`)
    .join("\n");
  return [
    `Subject: Recap — ${m.title}`,
    "",
    "Hi all,",
    "",
    "Thanks for the time today. Quick recap:",
    "",
    m.summary,
    m.decisions.length ? `\nDecisions:\n${m.decisions.map((d) => `  • ${d}`).join("\n")}` : "",
    tasks ? `\nNext steps:\n${tasks}` : "",
    "",
    "Shout if I missed anything.",
  ]
    .filter((l, i, a) => !(l === "" && a[i - 1] === ""))
    .join("\n");
}

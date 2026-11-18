import type { Analysis } from "@/lib/types";
import { PRIORITY_STYLE } from "./ui";

function Section({ title, children, delay = 0 }: { title: string; children: React.ReactNode; delay?: number }) {
  return (
    <section className="glass animate-rise p-6" style={{ animationDelay: `${delay}ms` }}>
      <h3 className="eyebrow mb-3">{title}</h3>
      {children}
    </section>
  );
}

const Bullets = ({ items }: { items: string[] }) => (
  <ul className="space-y-2.5">
    {items.map((x, i) => (
      <li key={i} className="flex gap-3 text-sm leading-relaxed text-zinc-200">
        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-violet-400 to-orange-300" />
        {x}
      </li>
    ))}
  </ul>
);

const SENT = { positive: "😊 Positive", neutral: "😐 Neutral", tense: "😬 Tense" } as const;

export function AnalysisView({ a, onToggle }: { a: Analysis; onToggle?: (taskId: string) => void }) {
  const done = a.actionItems.filter((t) => t.done).length;
  return (
    <div className="space-y-4">
      <section className="glass animate-rise p-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip">{SENT[a.sentiment]}</span>
          {a.topics.map((t) => <span key={t} className="chip">#{t.toLowerCase()}</span>)}
        </div>
        <h2 className="font-display text-2xl font-bold text-white">{a.title}</h2>
        <p className="mt-3 leading-relaxed text-zinc-300">{a.summary}</p>
      </section>

      {a.actionItems.length > 0 && (
        <Section title={`Action items · ${done}/${a.actionItems.length} done`} delay={60}>
          <ul className="space-y-2">
            {a.actionItems.map((t) => (
              <li key={t.id} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[.03] p-3">
                <input
                  type="checkbox"
                  checked={t.done}
                  disabled={!onToggle}
                  onChange={() => onToggle?.(t.id)}
                  aria-label={`Mark "${t.task}" done`}
                  className="mt-1 h-4 w-4 shrink-0 accent-fuchsia-500"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm ${t.done ? "text-zinc-500 line-through" : "text-zinc-100"}`}>{t.task}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-xs">
                    {t.owner && <span className="chip">👤 {t.owner}</span>}
                    {t.due && <span className="chip">🗓 {t.due}</span>}
                    <span className={`chip ${PRIORITY_STYLE[t.priority]}`}>{t.priority}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {a.keyPoints.length > 0 && <Section title="Key points" delay={120}><Bullets items={a.keyPoints} /></Section>}
        {a.decisions.length > 0 && <Section title="Decisions" delay={160}><Bullets items={a.decisions} /></Section>}
      </div>
      {a.openQuestions.length > 0 && <Section title="Open questions" delay={200}><Bullets items={a.openQuestions} /></Section>}
    </div>
  );
}

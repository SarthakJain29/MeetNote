import type { Priority, ProviderName } from "@/lib/types";

export const PRIORITY_STYLE: Record<Priority, string> = {
  high: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  medium: "border-amber-300/30 bg-amber-300/10 text-amber-100",
  low: "border-emerald-300/30 bg-emerald-300/10 text-emerald-100",
};

export function ProviderBadge({ name }: { name: ProviderName }) {
  const label = name === "mock" ? "Offline mode" : name === "gemini" ? "Gemini" : "Groq";
  return (
    <span className="chip" title={name === "mock" ? "Heuristic analysis, no API key needed" : "LLM analysis"}>
      <span className={`h-1.5 w-1.5 rounded-full ${name === "mock" ? "bg-amber-300" : "bg-emerald-400"}`} />
      {label}
    </span>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  return (
    <div className="glass flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-violet-500/30 to-orange-400/30 text-2xl">✦</div>
      <h2 className="font-display text-xl font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-zinc-400">{body}</p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function ErrorBanner({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
      {children}
    </div>
  );
}

export function Skeleton({ className = "h-24" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

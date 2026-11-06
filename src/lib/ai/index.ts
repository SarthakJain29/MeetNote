import { createGemini } from "./gemini";
import { createGroq } from "./groq";
import { mockProvider } from "./mock";
import type { AIProvider } from "./types";
import type { Analysis, ProviderName } from "../types";

type Env = Record<string, string | undefined>;

export interface Resolved {
  provider: AIProvider;
  /** preferred provider first, then other configured ones, ending with mock */
  chain: AIProvider[];
  /** every real provider that is configured, in preference order */
  available: ProviderName[];
}

/** Picks a provider from env. AI_PROVIDER=auto|gemini|groq|mock. Missing key => mock. */
export function resolveProvider(env: Env = process.env): Resolved {
  const gemini = env.GEMINI_API_KEY ? createGemini(env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined) : null;
  const groq = env.GROQ_API_KEY ? createGroq(env.GROQ_API_KEY, env.GROQ_MODEL || undefined) : null;
  const real = [gemini, groq].filter(Boolean) as AIProvider[];
  const want = (env.AI_PROVIDER || "auto").toLowerCase();
  let chain: AIProvider[];
  if (want === "mock") chain = [];
  else {
    const first = real.find((p) => p.name === want);
    chain = first ? [first, ...real.filter((p) => p !== first)] : real;
  }
  chain = [...chain, mockProvider];
  return { provider: chain[0], chain, available: real.map((p) => p.name) };
}

export interface RunResult<T> {
  value: T;
  provider: ProviderName;
  /** set when a real provider failed and we degraded to another one / mock */
  warning?: string;
}

async function withFallback<T>(run: (p: AIProvider) => Promise<T>, env: Env): Promise<RunResult<T>> {
  const { chain } = resolveProvider(env);
  const failures: string[] = [];
  for (const provider of chain) {
    try {
      const value = await run(provider);
      const warning = failures.length
        ? `${failures.join("; ")}. Used ${provider.name === "mock" ? "offline analysis" : provider.name} instead.`
        : undefined;
      return { value, provider: provider.name, warning };
    } catch (err) {
      if (provider.name === "mock") throw err;
      const reason = err instanceof Error ? err.message : "unknown error";
      failures.push(`${provider.name} failed (${reason.replace(/\s+/g, " ").slice(0, 90)})`);
    }
  }
  throw new Error("No provider available");
}

export const analyzeTranscript = (t: string, env: Env = process.env): Promise<RunResult<Analysis>> =>
  withFallback((p) => p.analyze(t), env);

export const askAboutTranscript = (t: string, q: string, env: Env = process.env): Promise<RunResult<string>> =>
  withFallback((p) => p.ask(t, q), env);

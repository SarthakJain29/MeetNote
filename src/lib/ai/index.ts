import { createGemini } from "./gemini";
import { createGroq } from "./groq";
import { mockProvider } from "./mock";
import type { AIProvider } from "./types";
import type { Analysis, ProviderName } from "../types";

type Env = Record<string, string | undefined>;

export interface Resolved {
  provider: AIProvider;
  /** every real provider that is configured, in preference order */
  available: ProviderName[];
}

/** Picks a provider from env. AI_PROVIDER=auto|gemini|groq|mock. Missing key => mock. */
export function resolveProvider(env: Env = process.env): Resolved {
  const gemini = env.GEMINI_API_KEY ? createGemini(env.GEMINI_API_KEY, env.GEMINI_MODEL || undefined) : null;
  const groq = env.GROQ_API_KEY ? createGroq(env.GROQ_API_KEY, env.GROQ_MODEL || undefined) : null;
  const available = [gemini && "gemini", groq && "groq"].filter(Boolean) as ProviderName[];
  const want = (env.AI_PROVIDER || "auto").toLowerCase();
  let provider: AIProvider = mockProvider;
  if (want === "gemini" && gemini) provider = gemini;
  else if (want === "groq" && groq) provider = groq;
  else if (want === "auto") provider = gemini ?? groq ?? mockProvider;
  return { provider, available };
}

export interface RunResult<T> {
  value: T;
  provider: ProviderName;
  /** set when a real provider failed and we degraded to mock */
  warning?: string;
}

async function withFallback<T>(
  run: (p: AIProvider) => Promise<T>,
  env: Env,
): Promise<RunResult<T>> {
  const { provider } = resolveProvider(env);
  try {
    return { value: await run(provider), provider: provider.name };
  } catch (err) {
    if (provider.name === "mock") throw err;
    const reason = err instanceof Error ? err.message : "unknown error";
    return {
      value: await run(mockProvider),
      provider: "mock",
      warning: `${provider.name} failed (${reason.slice(0, 120)}). Showing offline analysis instead.`,
    };
  }
}

export const analyzeTranscript = (t: string, env: Env = process.env): Promise<RunResult<Analysis>> =>
  withFallback((p) => p.analyze(t), env);

export const askAboutTranscript = (t: string, q: string, env: Env = process.env): Promise<RunResult<string>> =>
  withFallback((p) => p.ask(t, q), env);

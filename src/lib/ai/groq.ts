import { postJson } from "./http";
import { ANALYZE_SYSTEM, ASK_SYSTEM, analyzeUser, askUser } from "./prompts";
import { extractJson, normalizeAnalysis } from "./schema";
import type { AIProvider } from "./types";

interface ChatResponse {
  choices?: { message?: { content?: string } }[];
}

export function createGroq(apiKey: string, model = "llama-3.3-70b-versatile"): AIProvider {
  const call = async (system: string, user: string, json: boolean) => {
    const data = (await postJson(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        ...(json ? { response_format: { type: "json_object" } } : {}),
      },
      { Authorization: `Bearer ${apiKey}` },
    )) as ChatResponse;
    const text = data.choices?.[0]?.message?.content ?? "";
    if (!text) throw new Error("Groq returned an empty reply");
    return text;
  };
  return {
    name: "groq",
    analyze: async (t) => normalizeAnalysis(extractJson(await call(ANALYZE_SYSTEM, analyzeUser(t), true))),
    ask: async (t, q) => (await call(ASK_SYSTEM, askUser(t, q), false)).trim(),
  };
}

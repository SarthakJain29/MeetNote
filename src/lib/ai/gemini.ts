import { postJson } from "./http";
import { ANALYZE_SYSTEM, ASK_SYSTEM, analyzeUser, askUser } from "./prompts";
import { extractJson, normalizeAnalysis } from "./schema";
import type { AIProvider } from "./types";

interface GeminiResponse {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
}

export function createGemini(apiKey: string, model = "gemini-flash-latest"): AIProvider {
  const call = async (system: string, user: string, json: boolean) => {
    const data = (await postJson(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
        generationConfig: { temperature: 0.2, ...(json ? { responseMimeType: "application/json" } : {}) },
      },
      { "x-goog-api-key": apiKey },
    )) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
    if (!text) throw new Error("Gemini returned an empty reply");
    return text;
  };
  return {
    name: "gemini",
    analyze: async (t) => normalizeAnalysis(extractJson(await call(ANALYZE_SYSTEM, analyzeUser(t), true))),
    ask: async (t, q) => (await call(ASK_SYSTEM, askUser(t, q), false)).trim(),
  };
}

import { afterEach, describe, expect, it, vi } from "vitest";
import { analyzeTranscript, resolveProvider } from "@/lib/ai";

const T = "Ann: I will send the report by Friday. Bob: We decided to launch in May.";

afterEach(() => vi.unstubAllGlobals());

describe("provider selection", () => {
  it("defaults to mock without keys", () => {
    expect(resolveProvider({}).provider.name).toBe("mock");
  });
  it("auto picks gemini then groq", () => {
    expect(resolveProvider({ GEMINI_API_KEY: "k", GROQ_API_KEY: "g" }).provider.name).toBe("gemini");
    expect(resolveProvider({ GROQ_API_KEY: "g" }).provider.name).toBe("groq");
  });
  it("explicit mock wins", () => {
    expect(resolveProvider({ AI_PROVIDER: "mock", GROQ_API_KEY: "g" }).provider.name).toBe("mock");
  });
  it("falls back to mock with a warning when the API fails", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("boom", { status: 500 })));
    const r = await analyzeTranscript(T, { GROQ_API_KEY: "g" });
    expect(r.provider).toBe("mock");
    expect(r.warning).toMatch(/groq failed/);
  });
  it("parses a successful groq reply", async () => {
    const reply = { choices: [{ message: { content: JSON.stringify({ summary: "ok", title: "t" }) } }] };
    vi.stubGlobal("fetch", vi.fn(async () => Response.json(reply)));
    const r = await analyzeTranscript(T, { GROQ_API_KEY: "g" });
    expect(r.provider).toBe("groq");
    expect(r.value.summary).toBe("ok");
  });
});

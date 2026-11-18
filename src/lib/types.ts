export type Priority = "high" | "medium" | "low";

export interface ActionItem {
  id: string;
  task: string;
  owner: string | null;
  due: string | null;
  priority: Priority;
  done: boolean;
}

export type Sentiment = "positive" | "neutral" | "tense";

/** What an AI provider (or the mock) returns for a transcript. */
export interface Analysis {
  title: string;
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  openQuestions: string[];
  topics: string[];
  sentiment: Sentiment;
}

export interface Meeting extends Analysis {
  id: string;
  transcript: string;
  createdAt: string;
  provider: ProviderName;
}

export type ProviderName = "gemini" | "groq" | "mock";

export interface Turn {
  speaker: string | null;
  text: string;
}

export interface SpeakerStat {
  speaker: string;
  words: number;
  share: number; // 0..1
}

export interface TranscriptStats {
  words: number;
  readMinutes: number;
  speakers: SpeakerStat[];
}

import type { Analysis, ProviderName } from "../types";

export interface AIProvider {
  name: ProviderName;
  analyze(transcript: string): Promise<Analysis>;
  ask(transcript: string, question: string): Promise<string>;
}

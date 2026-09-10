import type { ProviderJobInput } from "../types";

export interface JobProvider {
  id: "linkedin" | "hkust";
  name: string;
  /** Parse pasted JD text into a structured job input */
  parsePaste(text: string): ProviderJobInput;
  /** Import an array of JSON job objects */
  importJson(payload: unknown): ProviderJobInput[];
}

import { linkedInProvider } from "./linkedin";
import { hkustProvider } from "./hkust";
import type { JobProvider } from "./types";
import type { Job, ProviderJobInput } from "../types";
import { detectLanguageFlag, scoreJob } from "../matching";

export const providers: Record<string, JobProvider> = {
  linkedin: linkedInProvider,
  hkust: hkustProvider,
};

export function providerInputToJob(input: ProviderJobInput): Job {
  const languageFlag =
    input.languageFlag || detectLanguageFlag(`${input.role} ${input.description}`);
  const tags = input.tags || [];
  const { score, reason } = scoreJob({
    role: input.role,
    location: input.location || "Hong Kong",
    description: input.description,
    tags,
    languageFlag,
  });
  const id = `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  return {
    id,
    company: input.company,
    role: input.role,
    source: input.source,
    url: input.url || "",
    location: input.location || "Hong Kong",
    description: input.description,
    status: "new",
    dateFound: new Date().toISOString(),
    dateMaterials: null,
    notes: "",
    matchReason: reason,
    matchScore: score,
    languageFlag,
    tags,
  };
}

import type { Job, LanguageFlag, Profile } from "./types";

const AI_ML_KEYWORDS = [
  "ai",
  "ml",
  "machine learning",
  "deep learning",
  "llm",
  "genai",
  "generative",
  "computer vision",
  "nlp",
  "data scientist",
  "research engineer",
  "agentic",
];

const NEW_GRAD_KEYWORDS = [
  "new grad",
  "new graduate",
  "graduate",
  "junior",
  "entry",
  "intern",
  "internship",
  "fresh graduate",
  "campus",
];

const HK_KEYWORDS = ["hong kong", "hk", "kowloon", "hongkong", "central", "admiralty"];

const CHINESE_REQUIRED = [
  "mandatory chinese",
  "fluent cantonese required",
  "native chinese",
  "must speak chinese",
  "must be fluent in mandarin",
  "must be fluent in chinese",
  "fluent in mandarin chinese",
  "chinese mandatory",
  "chinese required",
  "proficient in chinese required",
  "fluent written and spoken chinese mandatory",
];

const CHINESE_PREFERRED = [
  "cantonese",
  "mandarin",
  "chinese preferred",
  "bilingual",
  "written chinese",
  "business mandarin",
];

export function detectLanguageFlag(text: string): LanguageFlag {
  const lower = text.toLowerCase();
  if (CHINESE_REQUIRED.some((k) => lower.includes(k))) return "chinese_required";
  if (CHINESE_PREFERRED.some((k) => lower.includes(k))) return "chinese_preferred";
  return "english_ok";
}

export function scoreJob(
  job: Pick<Job, "role" | "location" | "description" | "tags" | "languageFlag">,
  profile?: Profile
): { score: number; reason: string } {
  const blob = `${job.role} ${job.location} ${job.description} ${job.tags.join(" ")}`.toLowerCase();
  let score = 40;
  const reasons: string[] = [];

  const aiHits = AI_ML_KEYWORDS.filter((k) => blob.includes(k));
  if (aiHits.length) {
    score += Math.min(30, aiHits.length * 8);
    reasons.push(`AI/ML fit (${aiHits.slice(0, 2).join(", ")})`);
  }

  const gradHits = NEW_GRAD_KEYWORDS.filter((k) => blob.includes(k));
  if (gradHits.length) {
    score += 15;
    reasons.push(`New-grad / intern friendly`);
  }

  if (HK_KEYWORDS.some((k) => blob.includes(k))) {
    score += 15;
    reasons.push("Hong Kong based");
  }

  const flag = job.languageFlag || detectLanguageFlag(blob);
  if (flag === "english_ok") {
    score += 10;
    reasons.push("English-friendly");
  } else if (flag === "chinese_preferred") {
    score -= 5;
    reasons.push("Chinese preferred (downranked)");
  } else if (flag === "chinese_required") {
    score -= (profile?.preferences.downrankChineseRequired ?? true) ? 25 : 10;
    reasons.push("Mandatory Chinese (strongly downranked)");
  }

  if (
    blob.includes("cpeg") ||
    blob.includes("computer engineering") ||
    blob.includes("fullstack") ||
    blob.includes("full-stack") ||
    blob.includes("full stack")
  ) {
    score += 5;
    reasons.push("Engineering / full-stack overlap");
  }

  score = Math.max(0, Math.min(99, score));
  const reason = reasons.length ? reasons.join(" · ") : "General software / AI interest match";
  return { score, reason };
}

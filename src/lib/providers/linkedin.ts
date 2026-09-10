import type { ProviderJobInput } from "../types";
import { detectLanguageFlag } from "../matching";
import type { JobProvider } from "./types";

/**
 * LinkedIn provider stub.
 * - Paste a LinkedIn JD (title, company, location, description).
 * - Or import JSON: [{ company, role, url?, location?, description, tags? }]
 * Does NOT auto-apply or scrape LinkedIn — manual paste / JSON only.
 */
export const linkedInProvider: JobProvider = {
  id: "linkedin",
  name: "LinkedIn (manual paste / JSON)",

  parsePaste(text: string): ProviderJobInput {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const role = lines[0] || "Untitled Role";
    const companyLine = lines.find((l) => /company|at\s+/i.test(l)) || lines[1] || "Unknown Company";
    const company = companyLine.replace(/^company[:\s]*/i, "").replace(/^at\s+/i, "");
    const location =
      lines.find((l) => /hong kong|hk|remote|hybrid|on-?site/i.test(l)) ||
      "Hong Kong";
    const urlMatch = text.match(/https?:\/\/[^\s]+linkedin\.com\/jobs\/[^\s]+/i);
    const description = lines.slice(2).join("\n") || text;
    const languageFlag = detectLanguageFlag(text);
    return {
      company: company.slice(0, 80),
      role: role.slice(0, 120),
      url: urlMatch?.[0] || "https://www.linkedin.com/jobs/",
      location,
      description,
      source: "LinkedIn",
      tags: ["imported", "linkedin"],
      languageFlag,
    };
  },

  importJson(payload: unknown): ProviderJobInput[] {
    const arr = Array.isArray(payload) ? payload : [payload];
    return arr.map((item) => {
      const o = item as Record<string, unknown>;
      const description = String(o.description ?? o.jobDescription ?? "");
      return {
        company: String(o.company ?? o.companyName ?? "Unknown"),
        role: String(o.role ?? o.title ?? o.jobTitle ?? "Untitled"),
        url: String(o.url ?? o.link ?? "https://www.linkedin.com/jobs/"),
        location: String(o.location ?? "Hong Kong"),
        description,
        source: "LinkedIn" as const,
        tags: Array.isArray(o.tags) ? o.tags.map(String) : ["imported", "linkedin"],
        languageFlag: detectLanguageFlag(description),
      };
    });
  },
};

export default linkedInProvider;

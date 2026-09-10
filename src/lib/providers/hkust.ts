import type { ProviderJobInput } from "../types";
import { detectLanguageFlag } from "../matching";
import type { JobProvider } from "./types";

/**
 * HKUST Career Center / departmental postings stub.
 * - Paste a Career Center JD or email blast.
 * - Or import JSON from a scraped/exported listing.
 * Does NOT auto-submit to HKUST portals — review materials in-app only.
 */
export const hkustProvider: JobProvider = {
  id: "hkust",
  name: "HKUST Career (manual paste / JSON)",

  parsePaste(text: string): ProviderJobInput {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const role =
      lines.find((l) => /intern|assistant|engineer|analyst|position/i.test(l)) ||
      lines[0] ||
      "HKUST Opportunity";
    const company =
      lines
        .find((l) => /company|employer|organisation|organization|dept|department/i.test(l))
        ?.replace(/^(company|employer|organisation|organization|dept|department)[:\s]*/i, "") ||
      "HKUST Partner";
    const location =
      lines.find((l) => /clear water|science park|hong kong|hkust|cwb/i.test(l)) ||
      "HKUST / Hong Kong";
    const urlMatch = text.match(/https?:\/\/[^\s]*(ust\.hk|career)[^\s]*/i);
    const description = lines.join("\n");
    return {
      company: company.slice(0, 80),
      role: role.slice(0, 120),
      url: urlMatch?.[0] || "https://career.ust.hk/",
      location,
      description,
      source: "HKUST",
      tags: ["imported", "hkust"],
      languageFlag: detectLanguageFlag(text),
    };
  },

  importJson(payload: unknown): ProviderJobInput[] {
    const arr = Array.isArray(payload) ? payload : [payload];
    return arr.map((item) => {
      const o = item as Record<string, unknown>;
      const description = String(o.description ?? o.details ?? "");
      return {
        company: String(o.company ?? o.employer ?? "HKUST Partner"),
        role: String(o.role ?? o.title ?? o.position ?? "Untitled"),
        url: String(o.url ?? "https://career.ust.hk/"),
        location: String(o.location ?? "Hong Kong"),
        description,
        source: "HKUST" as const,
        tags: Array.isArray(o.tags) ? o.tags.map(String) : ["imported", "hkust"],
        languageFlag: detectLanguageFlag(description),
      };
    });
  },
};

export default hkustProvider;

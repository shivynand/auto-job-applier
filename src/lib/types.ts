export type JobSource = "LinkedIn" | "HKUST";

/** Internal pipeline statuses (kept for the app UI). */
export type JobStatus =
  | "new"
  | "saved"
  | "materials_ready"
  | "applied"
  | "rejected"
  | "skipped";

/**
 * Values written to Shivansh's Google Sheet "GRADUATE grind".
 * Primary sheet values are Applied / Rejected; other internal
 * statuses map to readable labels on export.
 */
export type GraduateGrindStatus =
  | "Applied"
  | "Rejected"
  | "Saved"
  | "Materials ready"
  | "New"
  | "Skipped";

export type LanguageFlag = "english_ok" | "chinese_preferred" | "chinese_required";

export interface Job {
  id: string;
  company: string;
  role: string;
  source: JobSource;
  url: string;
  location: string;
  description: string;
  status: JobStatus;
  dateFound: string;
  dateMaterials: string | null;
  /** ISO date when marked applied (used as Application date in sheet export). */
  dateApplied?: string | null;
  notes: string;
  /** Recruiter / contact person for GRADUATE grind "Contact" column. */
  contact?: string;
  /** Interview schedule/location for GRADUATE grind "Interview time and place". */
  interviewTimePlace?: string;
  matchReason: string;
  matchScore: number;
  languageFlag: LanguageFlag;
  tags: string[];
  tailoredCv?: string;
  coverLetter?: string;
}

/** One row matching the Google Sheet "GRADUATE grind" column order. */
export interface GraduateGrindRow {
  Status: GraduateGrindStatus;
  Company: string;
  Role: string;
  "Application date": string;
  Contact: string;
  "Interview time and place": string;
}

export interface Profile {
  name: string;
  email: string;
  cv: string;
  agentsMd: string;
  preferences: {
    locations: string[];
    roles: string[];
    downrankChineseRequired: boolean;
    prioritizeNewGrad: boolean;
    prioritizeAIML: boolean;
  };
}

export interface JobsStore {
  jobs: Job[];
  updatedAt: string;
}

export interface ProviderJobInput {
  company: string;
  role: string;
  url?: string;
  location?: string;
  description: string;
  source: JobSource;
  tags?: string[];
  languageFlag?: LanguageFlag;
}

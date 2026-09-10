export type JobSource = "LinkedIn" | "HKUST";
export type JobStatus =
  | "new"
  | "saved"
  | "materials_ready"
  | "applied"
  | "skipped";

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
  notes: string;
  matchReason: string;
  matchScore: number;
  languageFlag: LanguageFlag;
  tags: string[];
  tailoredCv?: string;
  coverLetter?: string;
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

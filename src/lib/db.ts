import { promises as fs } from "fs";
import path from "path";
import type {
  GraduateGrindRow,
  GraduateGrindStatus,
  Job,
  JobStatus,
  JobsStore,
  Profile,
} from "./types";
import { buildSeedJobs } from "./seed-jobs";

const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_PATH = path.join(DATA_DIR, "jobs.json");
const PROFILE_CV = path.join(DATA_DIR, "profile", "cv.txt");
const PROFILE_AGENTS = path.join(DATA_DIR, "profile", "AGENTS.md");
const PROFILE_META = path.join(DATA_DIR, "profile", "meta.json");
const EXPORTS_DIR = path.join(DATA_DIR, "exports");
export const GRADUATE_GRIND_CSV_PATH = path.join(
  EXPORTS_DIR,
  "graduate-grind.csv"
);

/** Exact header order for Google Sheet "GRADUATE grind". */
export const GRADUATE_GRIND_HEADERS = [
  "Status",
  "Company",
  "Role",
  "Application date",
  "Contact",
  "Interview time and place",
] as const;

async function ensureDataFiles() {
  await fs.mkdir(path.join(DATA_DIR, "profile"), { recursive: true });
  await fs.mkdir(EXPORTS_DIR, { recursive: true });
  try {
    await fs.access(JOBS_PATH);
  } catch {
    const store: JobsStore = {
      jobs: buildSeedJobs(),
      updatedAt: new Date().toISOString(),
    };
    await fs.writeFile(JOBS_PATH, JSON.stringify(store, null, 2), "utf-8");
  }
  try {
    await fs.access(PROFILE_META);
  } catch {
    const meta = {
      name: "Shivansh Anand",
      email: "sanandaa@connect.ust.hk",
      preferences: {
        locations: ["Hong Kong"],
        roles: ["AI/ML Intern", "New Grad SWE", "Research Assistant"],
        downrankChineseRequired: true,
        prioritizeNewGrad: true,
        prioritizeAIML: true,
      },
    };
    await fs.writeFile(PROFILE_META, JSON.stringify(meta, null, 2), "utf-8");
  }
}

export async function getJobs(): Promise<Job[]> {
  await ensureDataFiles();
  const raw = await fs.readFile(JOBS_PATH, "utf-8");
  const store: JobsStore = JSON.parse(raw);
  return store.jobs;
}

export async function saveJobs(jobs: Job[]): Promise<void> {
  await ensureDataFiles();
  const store: JobsStore = { jobs, updatedAt: new Date().toISOString() };
  await fs.writeFile(JOBS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

export async function getJob(id: string): Promise<Job | undefined> {
  const jobs = await getJobs();
  return jobs.find((j) => j.id === id);
}

export async function updateJob(
  id: string,
  patch: Partial<Job>
): Promise<Job | null> {
  const jobs = await getJobs();
  const idx = jobs.findIndex((j) => j.id === id);
  if (idx === -1) return null;
  const prev = jobs[idx];
  const next: Job = { ...prev, ...patch };
  // Stamp application date when transitioning to applied
  if (patch.status === "applied" && prev.status !== "applied" && !next.dateApplied) {
    next.dateApplied = new Date().toISOString();
  }
  jobs[idx] = next;
  await saveJobs(jobs);
  return jobs[idx];
}

export async function upsertJobs(incoming: Job[]): Promise<Job[]> {
  const jobs = await getJobs();
  const byId = new Map(jobs.map((j) => [j.id, j]));
  for (const job of incoming) {
    const existing = byId.get(job.id);
    byId.set(job.id, existing ? { ...existing, ...job } : job);
  }
  const merged = Array.from(byId.values()).sort(
    (a, b) => b.matchScore - a.matchScore
  );
  await saveJobs(merged);
  return merged;
}

export async function resetJobs(): Promise<Job[]> {
  const jobs = buildSeedJobs();
  await saveJobs(jobs);
  return jobs;
}

export async function getProfile(): Promise<Profile> {
  await ensureDataFiles();
  const [cv, agentsMd, metaRaw] = await Promise.all([
    fs.readFile(PROFILE_CV, "utf-8"),
    fs.readFile(PROFILE_AGENTS, "utf-8"),
    fs.readFile(PROFILE_META, "utf-8"),
  ]);
  const meta = JSON.parse(metaRaw);
  return {
    name: meta.name,
    email: meta.email,
    cv,
    agentsMd,
    preferences: meta.preferences,
  };
}

export async function saveProfile(profile: Profile): Promise<void> {
  await ensureDataFiles();
  await Promise.all([
    fs.writeFile(PROFILE_CV, profile.cv, "utf-8"),
    fs.writeFile(PROFILE_AGENTS, profile.agentsMd, "utf-8"),
    fs.writeFile(
      PROFILE_META,
      JSON.stringify(
        {
          name: profile.name,
          email: profile.email,
          preferences: profile.preferences,
        },
        null,
        2
      ),
      "utf-8"
    ),
  ]);
}

/** Map internal JobStatus → GRADUATE grind sheet Status cell. */
export function statusToSheet(status: JobStatus): GraduateGrindStatus {
  switch (status) {
    case "applied":
      return "Applied";
    case "rejected":
      return "Rejected";
    case "saved":
      return "Saved";
    case "materials_ready":
      return "Materials ready";
    case "new":
      return "New";
    case "skipped":
      return "Skipped";
    default:
      return "New";
  }
}

function formatApplicationDate(job: Job): string {
  const raw =
    job.dateApplied ||
    (job.status === "applied" || job.status === "rejected"
      ? job.dateMaterials || job.dateFound
      : "");
  if (!raw) return "";
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  // en-HK style date for the sheet
  return d.toLocaleDateString("en-HK");
}

export function jobToGraduateGrindRow(job: Job): GraduateGrindRow {
  return {
    Status: statusToSheet(job.status),
    Company: job.company,
    Role: job.role,
    "Application date": formatApplicationDate(job),
    Contact: job.contact ?? "",
    "Interview time and place": job.interviewTimePlace ?? "",
  };
}

export function jobsToCsv(jobs: Job[]): string {
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = jobs.map((j) => {
    const row = jobToGraduateGrindRow(j);
    return GRADUATE_GRIND_HEADERS.map((h) => escape(row[h])).join(",");
  });
  return [GRADUATE_GRIND_HEADERS.join(","), ...rows].join("\n");
}

/** Write CSV to data/exports/graduate-grind.csv and return the text. */
export async function writeGraduateGrindCsv(jobs?: Job[]): Promise<string> {
  await ensureDataFiles();
  const list = jobs ?? (await getJobs());
  const csv = jobsToCsv(list);
  await fs.writeFile(GRADUATE_GRIND_CSV_PATH, csv, "utf-8");
  return csv;
}

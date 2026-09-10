import { promises as fs } from "fs";
import path from "path";
import type { Job, JobsStore, Profile } from "./types";
import { buildSeedJobs } from "./seed-jobs";

const DATA_DIR = path.join(process.cwd(), "data");
const JOBS_PATH = path.join(DATA_DIR, "jobs.json");
const PROFILE_CV = path.join(DATA_DIR, "profile", "cv.txt");
const PROFILE_AGENTS = path.join(DATA_DIR, "profile", "AGENTS.md");
const PROFILE_META = path.join(DATA_DIR, "profile", "meta.json");

async function ensureDataFiles() {
  await fs.mkdir(path.join(DATA_DIR, "profile"), { recursive: true });
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
  jobs[idx] = { ...jobs[idx], ...patch };
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

export function jobsToCsv(jobs: Job[]): string {
  const headers = [
    "Company",
    "Role",
    "Source",
    "URL",
    "Status",
    "Date found",
    "Date materials",
    "Notes",
    "Match reason",
  ];
  const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const rows = jobs.map((j) =>
    [
      j.company,
      j.role,
      j.source,
      j.url,
      j.status,
      j.dateFound,
      j.dateMaterials ?? "",
      j.notes,
      j.matchReason,
    ]
      .map(escape)
      .join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

import { NextResponse } from "next/server";
import { getJobs, resetJobs, upsertJobs } from "@/lib/db";
import { providers, providerInputToJob } from "@/lib/providers";

export const runtime = "nodejs";

export async function GET() {
  const jobs = await getJobs();
  return NextResponse.json({ jobs });
}

export async function POST(req: Request) {
  const body = await req.json();
  if (body.action === "reset") {
    const jobs = await resetJobs();
    return NextResponse.json({ jobs });
  }

  if (body.action === "import") {
    const provider = providers[body.provider as string];
    if (!provider) {
      return NextResponse.json({ error: "Unknown provider" }, { status: 400 });
    }
    let inputs;
    if (body.mode === "paste") {
      inputs = [provider.parsePaste(String(body.text || ""))];
    } else {
      inputs = provider.importJson(body.payload);
    }
    const jobs = inputs.map(providerInputToJob);
    const merged = await upsertJobs(jobs);
    return NextResponse.json({ jobs: merged, imported: jobs.length });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

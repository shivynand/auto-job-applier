import { NextResponse } from "next/server";
import { getJob, updateJob, getProfile } from "@/lib/db";
import { generateMaterials } from "@/lib/materials";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  const job = await getJob(id);
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const profile = await getProfile();
  const result = await generateMaterials(job, profile);
  const updated = await updateJob(id, {
    tailoredCv: result.tailoredCv,
    coverLetter: result.coverLetter,
    status: "materials_ready",
    dateMaterials: new Date().toISOString(),
  });

  return NextResponse.json({
    job: updated,
    provider: result.provider,
  });
}

import { NextResponse } from "next/server";
import { getJobs, jobsToCsv } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const jobs = await getJobs();
  const csv = jobsToCsv(jobs);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="job-scouter-export.csv"',
    },
  });
}

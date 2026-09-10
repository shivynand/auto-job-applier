import { NextRequest, NextResponse } from "next/server";
import { getJobs, jobsToCsv, writeGraduateGrindCsv } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Sync helper for GRADUATE grind CSV.
 *
 * Body (JSON, optional):
 *   { "write": true }  — also write data/exports/graduate-grind.csv
 *
 * Returns the CSV text (same columns as GET /api/export).
 *
 * Live Google Sheet cell append needs the Google Sheets API + OAuth.
 * Drive MCP alone cannot append rows to a spreadsheet; use this CSV
 * download/file and import manually, or wire Sheets API separately.
 */
export async function POST(req: NextRequest) {
  let write = false;
  try {
    const body = await req.json();
    write = Boolean(body?.write);
  } catch {
    // empty body is fine
  }

  const jobs = await getJobs();
  const csv = write ? await writeGraduateGrindCsv(jobs) : jobsToCsv(jobs);

  return NextResponse.json({
    ok: true,
    written: write,
    path: write ? "data/exports/graduate-grind.csv" : null,
    filename: "graduate-grind.csv",
    csv,
    note:
      "Live Google Sheet cell append needs Sheets API OAuth (not available via Drive MCP). Import this CSV into \"GRADUATE grind\" or paste rows manually.",
  });
}

/** Convenience GET — same as /api/export download. */
export async function GET() {
  const jobs = await getJobs();
  const csv = jobsToCsv(jobs);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        'attachment; filename="graduate-grind.csv"',
    },
  });
}

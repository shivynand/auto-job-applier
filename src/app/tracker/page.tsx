"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/lib/types";
import { LanguageBadge, SourceBadge, StatusBadge } from "@/components/Badges";
import { Download, Loader2, RotateCcw, Upload } from "lucide-react";

export default function TrackerPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data.jobs as Job[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered =
    filter === "all" ? jobs : jobs.filter((j) => j.status === filter);

  const reset = async () => {
    if (!confirm("Reset all jobs to the 10 HK seed listings?")) return;
    setLoading(true);
    await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    await load();
  };

  const syncCsv = async () => {
    setSyncMsg(null);
    try {
      const res = await fetch("/api/export/drive-csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ write: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sync failed");
      setSyncMsg(
        `Wrote ${data.path}. Import into Google Sheet "GRADUATE grind" (Sheets API OAuth needed for live cell append — not available via Drive MCP).`
      );
    } catch (e) {
      setSyncMsg(e instanceof Error ? e.message : "Sync failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading tracker…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Tracker</h1>
          <p className="mt-1 text-sm text-slate-400">
            Pipeline overview + CSV export matching Google Sheet &quot;GRADUATE grind&quot;:
            Status, Company, Role, Application date, Contact, Interview time and place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="/api/export"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10"
          >
            <Download className="h-4 w-4" /> Export CSV
          </a>
          <button
            type="button"
            onClick={syncCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-3 py-2 text-sm text-cyan-100 hover:bg-cyan-500/20"
          >
            <Upload className="h-4 w-4" /> Sync CSV file
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 hover:bg-rose-500/20"
          >
            <RotateCcw className="h-4 w-4" /> Reset seeds
          </button>
        </div>
      </div>

      {syncMsg && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {syncMsg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[
          "all",
          "new",
          "saved",
          "materials_ready",
          "applied",
          "rejected",
          "skipped",
        ].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs capitalize ${
              filter === f ? "bg-white/15 text-white" : "bg-white/5 text-slate-400"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Company</th>
              <th className="px-3 py-3">Role</th>
              <th className="px-3 py-3">Application date</th>
              <th className="px-3 py-3">Contact</th>
              <th className="px-3 py-3">Interview time and place</th>
              <th className="px-3 py-3">Source</th>
              <th className="px-3 py-3">Lang</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-3">
                  <StatusBadge status={j.status} />
                </td>
                <td className="px-3 py-3">
                  <Link href={`/job/${j.id}`} className="font-medium text-white hover:text-cyan-300">
                    {j.company}
                  </Link>
                </td>
                <td className="px-3 py-3 text-slate-300">{j.role}</td>
                <td className="px-3 py-3 text-xs text-slate-500">
                  {j.dateApplied
                    ? new Date(j.dateApplied).toLocaleDateString("en-HK")
                    : j.status === "applied" || j.status === "rejected"
                      ? new Date(j.dateMaterials || j.dateFound).toLocaleDateString("en-HK")
                      : "—"}
                </td>
                <td className="px-3 py-3 text-xs text-slate-400">{j.contact || "—"}</td>
                <td className="px-3 py-3 text-xs text-slate-400">
                  {j.interviewTimePlace || "—"}
                </td>
                <td className="px-3 py-3">
                  <SourceBadge source={j.source} />
                </td>
                <td className="px-3 py-3">
                  <LanguageBadge flag={j.languageFlag} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Job } from "@/lib/types";
import { LanguageBadge, MatchScore, SourceBadge, StatusBadge } from "@/components/Badges";
import { FileText, Loader2, Sparkles } from "lucide-react";

export default function SavedPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(
      (data.jobs as Job[]).filter((j) =>
        ["saved", "materials_ready", "applied"].includes(j.status)
      )
    );
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const generate = async (id: string) => {
    setBusyId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessage(
        `Pack ready via ${data.provider === "openai" ? "OpenAI" : "mock LLM"}. Review on job page.`
      );
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading saved jobs…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="mt-1 text-sm text-slate-400">
          Generate tailored CV + cover letter packs. Nothing is auto-submitted — you review in-app.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {message}
        </div>
      )}

      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-10 text-center text-sm text-slate-400">
          No saved jobs yet. Swipe right on the deck.
        </div>
      ) : (
        <ul className="space-y-3">
          {jobs.map((job) => (
            <li
              key={job.id}
              className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 shadow-lg shadow-black/20"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap gap-2">
                    <SourceBadge source={job.source} />
                    <LanguageBadge flag={job.languageFlag} />
                    <StatusBadge status={job.status} />
                  </div>
                  <h2 className="text-lg font-semibold text-white">{job.role}</h2>
                  <p className="text-sm text-cyan-300/90">{job.company}</p>
                  <p className="text-xs text-slate-500">
                    Match <MatchScore score={job.matchScore} /> · {job.matchReason}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => generate(job.id)}
                    disabled={busyId === job.id}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-3 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
                  >
                    {busyId === job.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                    Generate pack
                  </button>
                  <Link
                    href={`/job/${job.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                  >
                    <FileText className="h-4 w-4" />
                    Open
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

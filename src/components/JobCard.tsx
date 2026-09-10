"use client";

import type { Job } from "@/lib/types";
import { LanguageBadge, MatchScore, SourceBadge } from "./Badges";
import { MapPin, Sparkles } from "lucide-react";

export function JobCard({
  job,
  style,
  className = "",
}: {
  job: Job;
  style?: React.CSSProperties;
  className?: string;
}) {
  return (
    <article
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 shadow-2xl shadow-black/50 ${className}`}
      style={style}
    >
      <div className="relative h-36 shrink-0 bg-gradient-to-br from-cyan-500/30 via-violet-500/20 to-fuchsia-500/10 p-5">
        <div className="flex flex-wrap gap-2">
          <SourceBadge source={job.source} />
          <LanguageBadge flag={job.languageFlag} />
        </div>
        <div className="absolute bottom-4 right-5 text-right">
          <div className="text-xs text-slate-300">Match</div>
          <MatchScore score={job.matchScore} />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-sm font-medium text-cyan-300/90">{job.company}</p>
          <h2 className="mt-1 text-xl font-semibold leading-snug text-white sm:text-2xl">
            {job.role}
          </h2>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin className="h-3.5 w-3.5" />
            {job.location}
          </p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/5 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Match reason
          </p>
          <p className="text-sm leading-relaxed text-slate-300">{job.matchReason}</p>
        </div>
        <p className="line-clamp-5 flex-1 text-sm leading-relaxed text-slate-400">
          {job.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {job.tags.slice(0, 5).map((t) => (
            <span
              key={t}
              className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] text-slate-400 ring-1 ring-white/10"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}

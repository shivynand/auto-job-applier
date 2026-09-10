import type { Job, JobSource, LanguageFlag } from "@/lib/types";

export function SourceBadge({ source }: { source: JobSource }) {
  const cls =
    source === "LinkedIn"
      ? "bg-sky-500/15 text-sky-300 ring-sky-500/30"
      : "bg-amber-500/15 text-amber-300 ring-amber-500/30";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${cls}`}>
      {source}
    </span>
  );
}

export function LanguageBadge({ flag }: { flag: LanguageFlag }) {
  const map = {
    english_ok: { label: "EN OK", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
    chinese_preferred: { label: "中文 preferred", cls: "bg-orange-500/15 text-orange-300 ring-orange-500/30" },
    chinese_required: { label: "中文 required", cls: "bg-rose-500/15 text-rose-300 ring-rose-500/30" },
  } as const;
  const m = map[flag];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${m.cls}`}>
      {m.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: Job["status"] }) {
  const map: Record<Job["status"], string> = {
    new: "bg-slate-500/20 text-slate-300",
    saved: "bg-pink-500/20 text-pink-300",
    materials_ready: "bg-violet-500/20 text-violet-300",
    applied: "bg-emerald-500/20 text-emerald-300",
    skipped: "bg-zinc-600/30 text-zinc-400",
  };
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function MatchScore({ score }: { score: number }) {
  const color =
    score >= 75 ? "text-emerald-300" : score >= 55 ? "text-cyan-300" : "text-amber-300";
  return <span className={`font-semibold tabular-nums ${color}`}>{score}%</span>;
}

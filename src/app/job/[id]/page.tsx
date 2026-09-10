"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import type { Job } from "@/lib/types";
import { LanguageBadge, SourceBadge, StatusBadge } from "@/components/Badges";
import { ArrowLeft, ExternalLink, Loader2, Save, Sparkles } from "lucide-react";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [job, setJob] = useState<Job | null>(null);
  const [cv, setCv] = useState("");
  const [letter, setLetter] = useState("");
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<Job["status"]>("saved");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/jobs/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    const j = data.job as Job;
    setJob(j);
    setCv(j.tailoredCv || "");
    setLetter(j.coverLetter || "");
    setNotes(j.notes || "");
    setStatus(j.status);
  };

  useEffect(() => {
    load();
  }, [id]);

  const generate = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/materials/${id}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setJob(data.job);
      setCv(data.job.tailoredCv || "");
      setLetter(data.job.coverLetter || "");
      setStatus(data.job.status);
      setMsg(`Generated via ${data.provider}. Edit below, then save.`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tailoredCv: cv,
          coverLetter: letter,
          notes,
          status,
          dateMaterials:
            cv || letter ? new Date().toISOString() : job?.dateMaterials ?? null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setJob(data.job);
      setMsg("Saved locally.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (!job) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/saved" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to saved
      </Link>

      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          <SourceBadge source={job.source} />
          <LanguageBadge flag={job.languageFlag} />
          <StatusBadge status={status} />
        </div>
        <h1 className="text-2xl font-semibold">{job.role}</h1>
        <p className="text-cyan-300">{job.company} · {job.location}</p>
        <p className="text-sm text-slate-400">{job.matchReason}</p>
        <a
          href={job.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-sm text-violet-300 hover:underline"
        >
          Open posting <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {msg && (
        <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
          {msg}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={generate}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Generate application pack
        </button>
        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-60"
        >
          <Save className="h-4 w-4" /> Save edits
        </button>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Job["status"])}
          className="rounded-xl border border-white/15 bg-slate-900 px-3 py-2 text-sm"
        >
          <option value="saved">saved</option>
          <option value="materials_ready">materials_ready</option>
          <option value="applied">applied</option>
          <option value="skipped">skipped</option>
          <option value="new">new</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <h2 className="mb-2 text-sm font-medium text-slate-300">Job description</h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-400">{job.description}</p>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-300">Tailored CV</span>
        <textarea
          value={cv}
          onChange={(e) => setCv(e.target.value)}
          rows={16}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-cyan-500/50"
          placeholder="Generate a pack to populate…"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-300">Cover letter</span>
        <textarea
          value={letter}
          onChange={(e) => setLetter(e.target.value)}
          rows={12}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 font-mono text-xs leading-relaxed text-slate-200 outline-none focus:border-cyan-500/50"
          placeholder="Generate a pack to populate…"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-300">Notes</span>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-sm text-slate-200 outline-none focus:border-cyan-500/50"
        />
      </label>

      <p className="text-xs text-slate-500">
        Reminder: this app never auto-submits to LinkedIn or HKUST. Copy materials and apply yourself.
      </p>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Job } from "@/lib/types";
import { JobCard } from "./JobCard";
import { Check, Undo2, X } from "lucide-react";

async function patchJob(id: string, patch: Partial<Job>) {
  const res = await fetch(`/api/jobs/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error("Failed to update job");
  return res.json();
}

export function SwipeDeck({ initialJobs }: { initialJobs: Job[] }) {
  const deck = useMemo(
    () => initialJobs.filter((j) => j.status === "new").sort((a, b) => b.matchScore - a.matchScore),
    [initialJobs]
  );
  const [index, setIndex] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<"left" | "right" | null>(null);
  const [history, setHistory] = useState<{ id: string; prev: Job["status"] }[]>([]);

  const current = deck[index];
  const next = deck[index + 1];

  const commit = useCallback(
    async (dir: "left" | "right") => {
      if (!current || leaving) return;
      setLeaving(dir);
      const status = dir === "right" ? "saved" : "skipped";
      setHistory((h) => [...h, { id: current.id, prev: current.status }]);
      try {
        await patchJob(current.id, { status });
      } catch {
        /* keep UX moving */
      }
      setTimeout(() => {
        setLeaving(null);
        setOffset({ x: 0, y: 0 });
        setIndex((i) => i + 1);
      }, 220);
    },
    [current, leaving]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") commit("right");
      if (e.key === "ArrowLeft") commit("left");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [commit]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!current) return;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setOffset((o) => ({ x: o.x + e.movementX, y: o.y + e.movementY * 0.3 }));
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (offset.x > 100) commit("right");
    else if (offset.x < -100) commit("left");
    else setOffset({ x: 0, y: 0 });
  };

  const undo = async () => {
    const last = history[history.length - 1];
    if (!last || index === 0) return;
    setHistory((h) => h.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
    await patchJob(last.id, { status: "new" });
  };

  if (!current) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-20 text-center">
        <p className="text-lg font-medium text-white">Deck cleared</p>
        <p className="max-w-sm text-sm text-slate-400">
          No more new jobs. Check Saved to generate application packs, or import more in Settings.
        </p>
      </div>
    );
  }

  const rot = offset.x / 20;
  const leaveX = leaving === "right" ? 480 : leaving === "left" ? -480 : 0;

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className="relative mx-auto h-[560px] touch-none select-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {next && (
          <JobCard job={next} className="scale-[0.96] opacity-60" style={{ zIndex: 1 }} />
        )}
        <JobCard
          job={current}
          style={{
            zIndex: 2,
            transform: `translate(${leaving ? leaveX : offset.x}px, ${offset.y}px) rotate(${leaving ? (leaving === "right" ? 18 : -18) : rot}deg)`,
            transition: dragging ? "none" : "transform 200ms ease",
          }}
          className={offset.x > 60 ? "ring-2 ring-emerald-400/50" : offset.x < -60 ? "ring-2 ring-rose-400/50" : ""}
        />
        {offset.x > 60 && (
          <div className="pointer-events-none absolute left-6 top-8 z-10 rotate-[-12deg] rounded-lg border-2 border-emerald-400 px-3 py-1 text-sm font-bold uppercase text-emerald-300">
            Save
          </div>
        )}
        {offset.x < -60 && (
          <div className="pointer-events-none absolute right-6 top-8 z-10 rotate-[12deg] rounded-lg border-2 border-rose-400 px-3 py-1 text-sm font-bold uppercase text-rose-300">
            Skip
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => commit("left")}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
          aria-label="Skip"
        >
          <X className="h-6 w-6" />
        </button>
        <button
          type="button"
          onClick={undo}
          disabled={history.length === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-400 transition hover:bg-white/10 disabled:opacity-30"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => commit("right")}
          className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300 transition hover:bg-emerald-500/20"
          aria-label="Save"
        >
          <Check className="h-6 w-6" />
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-slate-500">
        Swipe or use ← skip / → save · {Math.max(0, deck.length - index)} left in deck
      </p>
    </div>
  );
}

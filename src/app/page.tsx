import { getJobs } from "@/lib/db";
import { SwipeDeck } from "@/components/SwipeDeck";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const jobs = await getJobs();
  const newCount = jobs.filter((j) => j.status === "new").length;
  const savedCount = jobs.filter((j) => j.status === "saved" || j.status === "materials_ready").length;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Swipe deck</h1>
        <p className="text-sm text-slate-400">
          HK-first · new-grad / AI-ML biased · English-friendly ranked higher.{" "}
          <span className="text-slate-300">
            {newCount} new · {savedCount} saved
          </span>
        </p>
      </div>
      <SwipeDeck initialJobs={jobs} />
    </div>
  );
}

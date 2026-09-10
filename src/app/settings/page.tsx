"use client";

import { useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { Loader2, Save, Upload } from "lucide-react";

const emptyProfile: Profile = {
  name: "",
  email: "",
  cv: "",
  agentsMd: "",
  preferences: {
    locations: ["Hong Kong"],
    roles: [],
    downrankChineseRequired: true,
    prioritizeNewGrad: true,
    prioritizeAIML: true,
  },
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [provider, setProvider] = useState<"linkedin" | "hkust">("linkedin");
  const [paste, setPaste] = useState("");
  const [jsonText, setJsonText] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/profile");
      const data = await res.json();
      setProfile(data.profile);
      setLoading(false);
    })();
  }, []);

  const save = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!res.ok) throw new Error("Save failed");
      setMsg("Profile saved to data/profile/.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const importPaste = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", provider, mode: "paste", text: paste }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setMsg(`Imported ${data.imported} job(s) via ${provider} paste parser.`);
      setPaste("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  const importJson = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const payload = JSON.parse(jsonText);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "import", provider, mode: "json", payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");
      setMsg(`Imported ${data.imported} job(s) via ${provider} JSON.`);
      setJsonText("");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Failed");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading profile…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-slate-400">
          Edit Shivansh profile (cv.txt + AGENTS.md). Import jobs via LinkedIn / HKUST stubs.
        </p>
      </div>

      {msg && (
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100">
          {msg}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        <h2 className="font-medium">Profile</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block space-y-1 text-sm">
            <span className="text-slate-400">Name</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
            />
          </label>
          <label className="block space-y-1 text-sm">
            <span className="text-slate-400">Email</span>
            <input
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-4 text-sm">
          {(
            [
              ["downrankChineseRequired", "Downrank mandatory Chinese"],
              ["prioritizeNewGrad", "Prioritize new-grad / intern"],
              ["prioritizeAIML", "Prioritize AI/ML"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={profile.preferences[key]}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferences: { ...profile.preferences, [key]: e.target.checked },
                  })
                }
              />
              {label}
            </label>
          ))}
        </div>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-400">CV (data/profile/cv.txt)</span>
          <textarea
            rows={12}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-xs"
            value={profile.cv}
            onChange={(e) => setProfile({ ...profile, cv: e.target.value })}
          />
        </label>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-400">AGENTS.md (data/profile/AGENTS.md)</span>
          <textarea
            rows={10}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-xs"
            value={profile.agentsMd}
            onChange={(e) => setProfile({ ...profile, agentsMd: e.target.value })}
          />
        </label>

        <button
          type="button"
          onClick={save}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save profile
        </button>
      </section>

      <section className="space-y-4 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
        <h2 className="font-medium">Import jobs (provider stubs)</h2>
        <p className="text-xs text-slate-500">
          Uses <code className="text-cyan-300">lib/providers/linkedin.ts</code> and{" "}
          <code className="text-cyan-300">lib/providers/hkust.ts</code>. Paste JD text or JSON — no scraping /
          auto-apply.
        </p>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as "linkedin" | "hkust")}
          className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-sm"
        >
          <option value="linkedin">LinkedIn</option>
          <option value="hkust">HKUST</option>
        </select>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-400">Paste JD</span>
          <textarea
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 text-sm"
            value={paste}
            onChange={(e) => setPaste(e.target.value)}
            placeholder={"Role title\nCompany\nHong Kong\nDescription..."}
          />
        </label>
        <button
          type="button"
          onClick={importPaste}
          disabled={busy || !paste.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> Import paste
        </button>

        <label className="block space-y-1 text-sm">
          <span className="text-slate-400">JSON import</span>
          <textarea
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3 font-mono text-xs"
            value={jsonText}
            onChange={(e) => setJsonText(e.target.value)}
            placeholder='[{"company":"...","role":"...","description":"..."}]'
          />
        </label>
        <button
          type="button"
          onClick={importJson}
          disabled={busy || !jsonText.trim()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> Import JSON
        </button>
      </section>

      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-4 text-sm text-slate-400">
        <h2 className="mb-2 font-medium text-slate-200">OpenAI (optional)</h2>
        <p>
          Set <code className="text-cyan-300">OPENAI_API_KEY</code> in the environment before{" "}
          <code className="text-cyan-300">npm run dev</code> for richer materials. Without it, the mock
          generator always works.
        </p>
      </section>
    </div>
  );
}

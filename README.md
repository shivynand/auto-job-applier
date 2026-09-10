# Job Scouter Apply

Local-first Next.js (App Router) + TypeScript + Tailwind MVP for swiping Hong Kong jobs, saving fits, and generating tailored CV + cover letter packs.

**Does not auto-submit** to LinkedIn or HKUST — you review and edit materials in-app, then apply yourself.

## Quick start

```bash
cd /workspace/auto-job-applier
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional richer copy:

```bash
export OPENAI_API_KEY=sk-...
# optional: export OPENAI_MODEL=gpt-4o-mini
npm run dev
```

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Tinder-style swipe deck (→ save, ← skip; buttons + keyboard) |
| `/saved` | Saved jobs + **Generate application pack** |
| `/job/[id]` | Review/edit tailored CV, cover letter, notes, contact, interview, status |
| `/settings` | Edit profile (`cv.txt`, `AGENTS.md`) + paste/JSON import |
| `/tracker` | Pipeline table + CSV export (GRADUATE grind columns) + sync helper |

## Persistence

- Jobs: `data/jobs.json` (seeded with 10 realistic HK LinkedIn/HKUST-flavored listings on first run)
- Profile: `data/profile/cv.txt`, `data/profile/AGENTS.md`, `data/profile/meta.json`
- Sync file: `data/exports/graduate-grind.csv` (written by `POST /api/export/drive-csv` with `{ "write": true }`)

### Google Sheet "GRADUATE grind" columns

CSV export (`GET /api/export` and tracker download) matches these headers **exactly**:

| Status | Company | Role | Application date | Contact | Interview time and place |

**Status mapping** (internal → sheet):

| Internal | Sheet export |
|----------|--------------|
| `applied` | **Applied** |
| `rejected` | **Rejected** |
| `saved` | Saved |
| `materials_ready` | Materials ready |
| `new` | New |
| `skipped` | Skipped |

Primary sheet values Shivansh uses are **Applied** and **Rejected**; other pipeline statuses export as readable labels.

### Sync helper

- `GET /api/export` — download `graduate-grind.csv`
- `POST /api/export/drive-csv` — returns CSV text in JSON; pass `{ "write": true }` to also write `data/exports/graduate-grind.csv`

**Live Google Sheet cell append needs the Google Sheets API + OAuth** (not available via Drive MCP). Use the CSV import / File → Import into the sheet, or paste rows manually until Sheets API is wired.

## Providers (stubs)

- `src/lib/providers/linkedin.ts` — paste JD / JSON import
- `src/lib/providers/hkust.ts` — paste JD / JSON import

Use **Settings → Import** to add jobs. Matching downranks mandatory Chinese and boosts HK + new-grad + AI/ML.

## Stack

- Next.js App Router, React 19, TypeScript, Tailwind CSS v4
- JSON file store (no DB required)
- Mock LLM always; OpenAI when `OPENAI_API_KEY` is set

## Scripts

```bash
npm run dev    # development server
npm run build  # production build
npm run start  # serve production build
```

# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `artifacts/humanproof` (`@workspace/humanproof`)

HumanProof v2.0 — AI job displacement intelligence platform. Dark cyberpunk React+Vite SPA with 7 tools.

**v2.0 6-Dimension Formula (weights sum to exactly 1.00):**
- D1 · Task Automatability: 26% (was 25%)
- D2 · AI Tool Maturity: 18% (was 20%)
- D3 · Human Amplification: 20% — **v2 fix**: curved inversion `100*(1-(augVal/100)^0.70)` (was linear)
- D4 · Experience Shield: 16% (was 18%)
- D5 · Country Exposure: 9% — **v2 fix**: multiplicative formula `adoption*(1-regulation/100)*0.80+22`, COUNTRY_DATA now [adoption, regulation] pairs
- D6 · Social Capital Moat: 11% — **NEW** (MIT Sloan 2024, NETWORK_MOAT table, D6_EXP_BONUS)
- Boost: `displacementPressure = D1*0.6 + D2*0.4`, boostMultiplier clamped to 1.42

**Tools (all 7 tabs functional):**
- **Tab 1 – Job Risk Score** (`CalculatorPage`): 6D formula, D6 bar in breakdown, data freshness chip (Q1 2026), network moat display; **v3**: Career Pivot Simulator (click-to-simulate target role risk), Peer Benchmark (percentile vs peers), updated transparency panel with v3 boost formula
- **Tab 2 – Skill Risk** (`SkillRiskCalculator`): 200+ skills, portfolio radar (4+ skills) / bar (≤3), projection; **v3**: Peer Benchmark added to results
- **Tab 3 – Human Irreplaceability** (`HumanIrreplacibilityIndex`): 30-question BARS quiz; **v3**: provisional score requires 4+ dimensions, Peer Benchmark added to results
- **Tab 4 – Upskilling Roadmap** (`UpskillingRoadmap`): 20 role-specific roadmaps
- **Tab 5 – Human Edge Journal** (`HumanEdgeJournal`): Entry editing with dirty state; **v3**: 500 entry cap (warn at 450, prune 50 oldest)
- **Tab 6 – Progress Tracker** (`ScoreDriftTracker`): PlotScore inversion, time-weighted drift, 90-day staleness; **v3**: Resilience Badge (unlocks HII>70 AND JobRisk<40 AND SkillRisk<45, downloadable SVG, LinkedIn post copy)
- **Tab 7 – Displacement Forecast** (`DisplacementForecast`): S-curve projection by role

**v3.0 Formula fixes (riskFormula.ts):**
- D4 floor: only applied when `base > 50` (low-risk roles reduce freely)
- D1/D2 boost: interaction term `(D1-70)*(D2-70)*0.001` only when BOTH D1>70 AND D2>70 (was average-based)
- `projectScore`: saturating exponential `MAX_RISK - (MAX_RISK - baseline) * e^(-k*t)` (never goes below baseline)

**v3.0 Storage (scoreStorage.ts):**
- 30-min time gate removed; saves on meaningful delta (≥4/6/8 pts for job/skill/hii)
- 200-entry pruning; "ever completed" flags (`hp_ever_completed_job/skill/hii`)
- `hasLegacyVersionEntries()` and `getEverCompletedFlags()` exported

**v3.0 New components:**
- `PeerBenchmark.tsx`: percentile ranking vs peers in same role (pre-computed medians, WEF/McKinsey data). Used in all 3 assessment results.
- `ResilienceBadge.tsx`: achievement badge unlocked when HII>70, JobRisk<40, SkillRisk<45. SVG download + LinkedIn post copy.
- `DailyChallenge.tsx`: floating widget with daily micro-challenge tied to lowest HII dimension; streak counter, one-tap journal link.

**ToolsPage v3 improvements:**
- Session drift banner: shows once per session via sessionStorage (not per-render)
- Assessment completion progress bar uses "ever completed" flags (no flicker on retake)
- Dependency banners: specific benefit messages per tab + "Start now →" button
- Legacy version migration banner when old data entries detected
- Daily Micro-Challenge floating widget (bottom-right)
- Keyboard navigation, lazy mounting, ARIA roles

**Architecture split (v2):**
- `src/data/riskData.ts` — pure data tables: TASK_AUTO, DISRUPTION_VELOCITY, AUGMENTATION, EXP_SENSITIVITY, COUNTRY_DATA([adoption, regulation]), NETWORK_MOAT, D6_EXP_BONUS, KEY_REGISTRY
- `src/data/riskFormula.ts` — pure calculation functions: calculateD1-D6, calculateScore(), projectScore (logistic S-curve), getScoreColor, getVerdict, getConfidence
- `src/data/riskEngine.ts` — barrel re-export from riskData + riskFormula for backward compat

**Context v2 (HumanProofContext.tsx):**
- HYDRATE action: restores jobRiskScore, skillRiskScore, humanScore, selectedSkills, skillBreakdown, roadmapStartDate from localStorage on mount
- Loading screen shown during hydration (prevents flash)
- skillBreakdown persisted to localStorage (KEY_REGISTRY.SKILL_BREAKDOWN)

**Score dedup fix (scoreStorage.ts):**
- Old: time-gated (24h block even if score changed)
- New: change-first (`scoreChanged` = delta ≥ threshold always saves; time guard is only 1-hour minimum)
- DATA_VERSION bumped to `'2026-Q1'`

**Pages:**
- `ProductsPage`: working filter buttons (All/Free/Guides/Templates/Reports) using useState
- `PricingPage`: waitlist modal with email capture → localStorage (hp_waitlist_email), D6 FAQ item added
- `HomePage`: 6D model section with D6 card, all percentage weights updated

**Key Files:**
- `src/data/riskData.ts` — all data tables, KEY_REGISTRY, NETWORK_MOAT, D6_EXP_BONUS
- `src/data/riskFormula.ts` — 6D formula engine, projection, score utilities
- `src/data/riskEngine.ts` — barrel re-exports for backward compat
- `src/context/HumanProofContext.tsx` — HYDRATE action, loading screen, skillBreakdown persist
- `src/utils/scoreStorage.ts` — change-first dedup (1h min, always on meaningful delta)
- `src/components/DisplacementForecast.tsx` — Tab 7: S-curve per-role forecast
- `src/pages/CalculatorPage.tsx` — D6 bar, networkMoat display, data freshness chip
- `src/pages/ToolsPage.tsx` — 7 tabs, completion bar, forecast dependency check
- `src/pages/ProductsPage.tsx` — functional filters
- `src/pages/PricingPage.tsx` — waitlist modal
- `src/pages/HomePage.tsx` — 6D model section, 6-D stat

**Design**: Cyberpunk dark — `--cyan: #00F5FF`, `--emerald: #00FF9F`, `--violet: #7C3AFF`. Fonts: JetBrains Mono, Syne, Inter. Responsive at 768px/480px.

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.

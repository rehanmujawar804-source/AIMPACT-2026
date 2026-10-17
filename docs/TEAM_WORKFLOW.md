# ProofTrail — Team Workflow & Collaboration Protocol

**Hackathon Window:** AIMPACT 2026 · AI for Business & Commerce · 8-Hour Build  
**Status:** Canonical operational guide and collaboration agreement for parallel execution.  
**Team Members:** Rehan, Maaz, Bhavika, Swara.

---

## 1. Provisional Team Responsibilities

To achieve rapid, conflict-free parallel development across 8 hours, work is organized around decoupled ownership.

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Rehan (Lead)     │ Canonical Contracts · API Pipeline · Integration   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Maaz             │ Deterministic Rules · Arithmetic · Test Fixtures   │
├──────────────────┼────────────────────────────────────────────────────┤
│ Bhavika          │ Investigation Desk UI · Evidence Display · States  │
├──────────────────┼────────────────────────────────────────────────────┤
│ Swara            │ AI Claim Extraction · Output Validation · Eval     │
└────────────────────────────────────────────────────────────────────────┘
```

### Member 1 — Rehan: Product Integration & Coordination
- **Core Ownership:** Canonical contracts, API orchestration, integration checkpoints, end-to-end user flow.
- **Key Tasks:**
  - Maintain the single source of truth for contracts in `src/types/index.ts` and `src/lib/validation/`.
  - Govern package configuration (`package.json`, `tsconfig.json`) and project-wide settings.
  - Orchestrate the investigation pipeline in `src/app/api/investigations/route.ts`.
  - Run the integration checkpoints every 30–60 minutes and enforce the **Hour 3.0 Hard Gate**.
  - Lead the live judge presentation and architecture defense (`docs/08_DEMO_AND_JUDGE_DEFENSE.md`).
- **Sole-Editor Rule (non-negotiable):** Rehan is the **only** team member who may commit changes to the following files. Other members who need a contract change must raise it at a checkpoint, not edit the file independently:
  - `src/types/index.ts`
  - `src/lib/validation/index.ts`
  - `package.json`
  - `tsconfig.json`
  - `docs/DEVELOPMENT_ROADMAP.md` (the decision log entries)

### Member 2 — Maaz: Deterministic Rules & Synthetic Data
- **Core Ownership:** Ground truth fixtures, deterministic verification rules, calculation accuracy, expected outcomes.
- **Key Tasks:**
  - Author and maintain synthetic dispute fixtures in `tests/fixtures/` adhering to `docs/06_SYNTHETIC_TEST_CASES.md`. Coordinate with Rehan before finalising fixture format (fixtures must validate against `FindingSchema`).
  - Implement deterministic record matching in `src/lib/rules/recordMatcher.ts`.
  - Implement quantity difference and financial reconciliation rules in `src/lib/rules/quantityComparison.ts`.
  - Build source-linked finding objects with calculations in `src/lib/evidence/findingBuilder.ts`. Exported function signature: `runDeterministicInvestigation(input: ValidatedInvestigationInput): Finding[]`.
  - Write and maintain automated Vitest unit tests in `tests/unit/rules.test.ts` proving arithmetic correctness.

### Member 3 — Bhavika: Frontend & Investigation Desk
- **Core Ownership:** Investigation desk interface, claim cards, findings list, loading and error states.
- **Key Tasks:**
  - Build the single-screen investigation workspace in `src/features/investigations/` and `src/app/page.tsx` following `docs/design.md`.
  - Start immediately by binding UI components to `tests/fixtures/mock_investigation_response.json` without waiting for the backend.
  - Implement the summary strip (Invoice amount, Recorded payments, Recorded balance before unapproved credits).
  - Implement clear empty, loading, error, and manual claim edit states.
- **UI Adapter Requirement (Decision D11):** `docs/design.md` uses different status labels (`SUPPORTED`, `CONTRADICTED`, `MISSING`, `AMBIGUOUS`) from the canonical wire contract (`SUPPORTED_BY_RECORDS`, `CONFLICTING_RECORDS`, `NOT_FOUND_IN_PROVIDED_DATA`, `UNRESOLVED`). Bhavika must implement a dedicated adapter (e.g. `src/features/investigations/lib/statusAdapter.ts`) that maps wire values to display labels. This adapter must be documented inline. The mapping is:
  - `"SUPPORTED_BY_RECORDS"` → green badge, label "Supported"
  - `"CONFLICTING_RECORDS"` → red badge, label "Conflicting"
  - `"NOT_FOUND_IN_PROVIDED_DATA"` → amber badge, label "Missing"
  - `"UNRESOLVED"` → slate badge, label "Unresolved"
- **Important:** Do not import or use the `Finding` type definition from `docs/design.md` in source code. Import only from `src/types/index.ts`.

### Member 4 — Swara: AI Claim Extraction & Evaluation
- **Core Ownership:** AI extraction adapter, structured output schema enforcement, failure handling, evaluation harness.
- **Key Tasks:**
  - Implement prompt templates and schema-constrained extraction in `src/lib/ai/claimExtractor.ts`. Exported function signature: `extractClaim(message: string): DisputeInput | null` — returns `null` on any failure.
  - Enforce Zod validation on model output; guarantee that invalid JSON, extra fields, or timeouts never crash the app.
  - Implement the seamless fallback to manual claim entry (`processing_mode: "rules_only"`).
  - Build and execute the evaluation harness in `src/app/api/evaluate/route.ts` comparing Hybrid vs. Rules-Only baseline.
  - Ensure zero hallucinated invoice references or made-up quantities enter the pipeline.


### Dynamic Role Reassignment Policy
These roles are provisional starting assignments designed for rapid parallel progress. If technical bottlenecks, personal strengths, or unexpected blockers emerge (e.g., frontend requires extra hands, or AI adapter is completed early):
- The team lead (Rehan) can reassign tasks dynamically during any 30-minute checkpoint.
- Any reassignment must be noted in `docs/TEAM_WORKFLOW.md` and communicated across the team.

---

## 2. Dependency Decoupling Strategy

To prevent teammates from waiting on each other or experiencing blocking dependencies:

1. **Frontend Works Against Mock Response:**
   - Bhavika develops the UI against a static JSON mock (`tests/fixtures/mock_investigation_response.json`).
   - The UI does not need a live backend server or working database during Hours 1.0–2.5.
   - At Hour 2.5, swapping the mock import for a live `fetch('/api/investigations')` requires zero UI redesign.

2. **Rules Engine Works Against Synthetic Fixtures:**
   - Maaz builds the rules engine as pure TypeScript functions taking validated JSON fixtures as inputs.
   - The rules engine does not require the UI, a running web server, or LLM connectivity.
   - Verification is 100% testable via `npm test`.

3. **AI Extractor Works in Isolation:**
   - Swara develops extraction against raw dispute message strings in isolation.
   - If AI extraction fails or the API times out, the system defaults to manual structured inputs without affecting Maaz's rules engine or Bhavika's UI.

4. **Zero Heavy Infrastructure:**
   - Do **NOT** install or configure Docker, PostgreSQL, MongoDB, Redis, Celery, Pinecone, or LangChain.
   - In-memory processing and synthetic JSON fixtures are faster, more reliable, and eliminate 90% of hackathon deployment bugs.

---

## 3. Git & Branching Strategy

To maintain a clean Git history and prevent accidental code overwrites:

### 3.1 Repository & Main Branch
- Canonical repository: `https://github.com/rehanmujawar804-source/AIMPACT-2026.git`
- Canonical branch: `main`
- **Protected `main` Rule:** No member may push directly to `main` during parallel implementation blocks. All code enters `main` through reviewed integration merges at checkpoints.

### 3.2 Branch Naming Conventions
Every member works on an isolated feature branch named after their workstream:
- `feat/rules-engine` (Maaz)
- `feat/investigation-ui` (Bhavika)
- `feat/claim-extraction` (Swara)
- `feat/evaluation` (Swara)
- `chore/integration-harness` (Rehan)

### 3.3 Commit Discipline
- Make frequent, small, atomic commits with informative prefixes:
  - `feat(rules): add invoice-to-receipt quantity subtraction`
  - `test(fixtures): add case 02 short delivery JSON`
  - `fix(ui): format monetary amounts using INR currency symbol`
  - `docs(roadmap): update checkpoint 2 status`
- **Never commit:**
  - Build directories (`.next/`, `dist/`, `out/`)
  - Node modules (`node_modules/`)
  - Local secrets or environment files (`.env`, `.env.local`)
  - Temporary editor files (`.vscode/`, `*.tsbuildinfo`)

---

## 4. Contract Freeze & Single Source of Truth

To ensure components integrate seamlessly without painful schema disagreements:

1. **Single Source of Truth:**
   - All shared types, contracts, and finding states live exclusively in `src/types/index.ts`.
   - Re-exported by `src/lib/validation/index.ts`.
   - **Never create duplicate types** in component or feature folders.

2. **Contract Freeze at Hour 1.0:**
   - After Hour 1.0, data contracts are frozen.
   - Neither the frontend nor the backend may unilaterally add, rename, or delete fields.

3. **How to Resolve Contract Conflicts:**
   - If a member discovers a missing field or schema limitation during implementation:
     1. Do **not** modify `src/types/index.ts` independently on your feature branch.
     2. Raise the proposed change in the next 30-minute checkpoint or notify Rehan immediately.
     3. Rehan evaluates impact on other workstreams.
     4. If approved, Rehan updates `src/types/index.ts` on `main` and coordinates a quick `git pull origin main` to all feature branches.

---

## 5. Integration Checkpoints & Hard Gate Cadence

We hold a 5-minute standup/checkpoint every 30–60 minutes to maintain momentum:

```text
Hour 0.5 ──► Hour 1.0 ──► Hour 1.5 ──► Hour 2.0 ──► Hour 2.5 ──► Hour 3.0 (HARD GATE)
Scope        Freeze       Sync 1       Sync 2       Pre-Merge    Vertical Slice
```

### Checkpoint Agenda (5 Minutes Max):
1. What did you complete in the last 30 minutes?
2. Are your unit tests passing?
3. Are you blocked by any contract, dependency, or bug?
4. Are you on schedule for the next milestone?

### The Hour 3.0 Hard Gate Protocol:
At Hour 3.0, the team stops new feature work and verifies the integrated vertical slice:
- Can a user select `case_02_short_delivery` in the browser?
- Does the backend compute the quantity difference (`100 - 80 = 20`)?
- Does the UI display the finding with `CONFLICTING_RECORDS` and valid source IDs (`INV-REC-001`, `POD-REC-001`)?
- **Pass:** Proceed to Phase 4 (AI extraction & evaluation).
- **Fail:** Immediately trigger Feature Cut Level 1 (cut live LLM explanations and export feature; dedicate the next 30 minutes to fixing the deterministic flow).

---

## 6. Security, API Keys & Secret Handling

1. **Zero Secrets in Git:**
   - No real API keys, passwords, private tokens, or customer data may ever be committed to the repository.
   - `.gitignore` explicitly ignores `.env*` while preserving `.env.example`.
2. **Local Environment Only:**
   - Copy `.env.example` to `.env.local` for local development.
   - If an AI API key (OpenAI/Anthropic/Gemini) is used, each developer configures it only in their untracked `.env.local`.
3. **Graceful Missing Key Behavior:**
   - If no API key is present in `process.env`, the application must **not** crash.
   - It must automatically switch to manual claim entry mode with a gentle notice: `"AI extraction offline — manual claim entry active."`
4. **Synthetic Data Only:**
   - All invoices, company names, addresses, and transaction amounts must be purely synthetic. Never test with real customer financial records.

---

## 7. Blocker & Decision Recording Protocol

To prevent repeated arguments and keep all decisions transparent:

1. **Settled Decisions:**
   - All locked architectural and product decisions are recorded in `docs/09_DECISIONS_AND_OPEN_QUESTIONS.md` and summarized in `docs/DEVELOPMENT_ROADMAP.md` Section 9.
   - Do not re-open a settled decision unless a critical technical blocker makes it impossible to implement.

2. **Logging Blockers:**
   - If a blocker cannot be resolved within 10 minutes, escalate to Rehan.
   - If a workaround requires altering scope, record it in the Decision Log with:
     - Date & time
     - Issue description
     - Options considered
     - Agreed resolution
     - Impacted files

3. **No Silent Changes:**
   - Never silently change the meaning of a status, calculation formula, or product definition.
   - Keep code, tests, and documentation strictly aligned.

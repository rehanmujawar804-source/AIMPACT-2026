# ProofTrail — Phase-Wise Workflow

> **Report generated from:** Inspection of all project documentation and source code in `c:\Users\DELL\Desktop\aimpact\AIMPACT-2026`  
> **Report file:** `PROOFTRAIL_PHASEWISE_WORKFLOW.md` (project root)  
> **Strict rule:** No phases were invented. Every phase documented here is sourced verbatim from the project's own files. Conflicts between documents are reported explicitly.

---

## Table of Contents

1. [Source Documents Examined](#1-source-documents-examined)
2. [Complete Workflow Overview](#2-complete-workflow-overview)
3. [Detailed Phase-by-Phase Breakdown](#3-detailed-phase-by-phase-breakdown)
   - [Build Phase 0 — Project Foundation & Repository Setup](#build-phase-0--project-foundation--repository-setup)
   - [Build Phase 1 — Canonical Contracts, Mock Fixtures & Synthetic Ground Truth](#build-phase-1--canonical-contracts-mock-fixtures--synthetic-ground-truth)
   - [Build Phase 2 — Parallel Component Development](#build-phase-2--parallel-component-development)
   - [Build Phase 3 — Vertical-Slice Integration](#build-phase-3--vertical-slice-integration)
   - [Build Phase 4 — AI Extraction Integration & Evaluation Runner](#build-phase-4--ai-extraction-integration--evaluation-runner)
   - [Build Phase 5 — Reliability, Differentiator & Feature Freeze](#build-phase-5--reliability-differentiator--feature-freeze)
   - [Build Phase 6 — Demonstration Preparation & Judge Defense](#build-phase-6--demonstration-preparation--judge-defense)
   - [Investigation Workflow — 8-Step Core Product Loop](#investigation-workflow--8-step-core-product-loop)
4. [Workflow Data Flow](#4-workflow-data-flow)
5. [Code Implementation Mapping](#5-code-implementation-mapping)
6. [Specification vs. Implementation](#6-specification-vs-implementation)
7. [Dependencies and Phase Transitions](#7-dependencies-and-phase-transitions)
8. [Unresolved Questions and Gaps](#8-unresolved-questions-and-gaps)

---

## 1. Source Documents Examined

The following files were fully or substantially read during the inspection. All claims in this report can be verified against them.

| File | Description | Lines Read |
|------|-------------|------------|
| `docs/DEVELOPMENT_ROADMAP.md` | **Primary source** for build phases (Phase 0–6), timeline, owner assignments, exit gates, decision log | 426 / 426 |
| `docs/ProofTrail_01_Enhanced_Product_Brief.md` | **Primary source** for 8-step Core Product Loop (investigation workflow), product philosophy, design principles | 506 / 506 |
| `docs/architecture.md` | System architecture, pipeline design, API contracts, evaluation framework | 553 / 553 |
| `docs/design.md` | UI/UX spec, component breakdown, colour tokens, screen layouts | ~800 / 844 |
| `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` | Wire-contract TypeScript/Zod definitions, canonical finding states | ~800 / 1141 |
| `docs/05_AI_ROLE_AND_EVALUATION.md` | AI claim-extraction spec, evaluation harness, scoring rubric | 752 / 752 |
| `docs/06_SYNTHETIC_TEST_CASES.md` | Synthetic JSON test cases (`case_01`–`case_04`) and expected outputs | ~800 / 1072 |
| `docs/07_EIGHT_HOUR_EXECUTION_PLAN.md` | Hour-by-hour team execution plan, RACI matrix | 708 / 708 |
| `docs/08_DEMO_AND_JUDGE_DEFENSE.md` | Demo scripts, judge Q&A preparation, 3 demo scenarios | 550 / 550 |
| `docs/09_DECISIONS_AND_OPEN_QUESTIONS.md` | Decision log (D1–D11+), open questions | 756 / 756 |
| `docs/03_SCOPE_AND_ACCEPTANCE_CRITERIA.md` | MVP scope, acceptance criteria, out-of-scope items | ~800 / 993 |
| `docs/TEAM_WORKFLOW.md` | Git branching strategy, PR policy, merge rules | 218 / 218 |
| `docs/02_DIFFERENTIATION_AND_COMPETITORS.md` | Competitor analysis, differentiation rationale | ~80 / 684 |
| `src/types/index.ts` | Canonical Zod schemas, TypeScript types | 87 / 87 |
| `src/lib/validation/index.ts` | Validation re-exports | 6 / 6 |
| `src/app/page.tsx` | Phase 0 status dashboard (root page) | 165 / 165 |
| `src/app/api/investigations/route.ts` | Investigations API route (placeholder) | 29 / 29 |
| `src/app/api/evaluate/route.ts` | Evaluate API route (placeholder) | 29 / 29 |
| `tests/unit/contracts.test.ts` | Vitest unit tests for Zod schemas | 71 / 71 |

**Files not read (minor, unlikely to affect conclusions):**
- `docs/design.md` lines 801–844 (final ~44 lines — likely closing remarks)
- `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` lines 801–1141
- `docs/06_SYNTHETIC_TEST_CASES.md` lines 801–1072
- `docs/03_SCOPE_AND_ACCEPTANCE_CRITERIA.md` lines 801–993
- `docs/02_DIFFERENTIATION_AND_COMPETITORS.md` lines 81–684

---

## 2. Complete Workflow Overview

The ProofTrail project contains **two distinct phase systems**, both specified in the project documentation. They are not the same thing and must not be conflated.

### System A — Build Phases (Phase 0–6)
*Source: `docs/DEVELOPMENT_ROADMAP.md` Section 3*

These phases describe **how the team builds the product** over an 8-hour execution window. They are development phases, not product runtime steps.

```
Phase 0  →  Phase 1  →  Phase 2  →  Phase 3  →  Phase 4  →  Phase 5  →  Phase 6
Foundation  Contracts   Parallel    Vertical-   AI & Eval   Reliability  Demo Prep
& Repo      & Fixtures  Dev         Slice       Integration & Freeze     & Defense
            (Hour 0-1)  (Hour 1-    (Hour 2.5-  (Hour 3.5-  (Hour 5-    (Hour 6.5-
                        2.5)        3)          5)          6.5)        8)
```

**Current status on `main` branch:** Phase 0 fully implemented. Phases 1–6 are planned or partially planned; feature branches exist remotely but are not merged.

---

### System B — Investigation Workflow (8-Step Core Product Loop)
*Source: `docs/ProofTrail_01_Enhanced_Product_Brief.md` Section 7 and `docs/architecture.md` Section 4*

These steps describe **how the ProofTrail system processes a dispute** at runtime, from initial user input to final human decision.

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7 → Step 8
Capture  Extract  Identify  Verify   Build     State     Recommend  Human
Dispute  Claim    Records   Determ.  Evidence  Uncertain. Next Check  Review
```

**Current runtime status:** Only Step 1 (data model for dispute capture) and Step 4's canonical state machine are implemented (as Zod schemas in `src/types/index.ts`). Steps 2–7 are not yet implemented in the `main` branch.

---

## 3. Detailed Phase-by-Phase Breakdown

> **Nine fields per phase as specified:**
> 1. Phase number and exact title
> 2. Original description and objective
> 3. User actions
> 4. System operations
> 5. Inputs
> 6. Processing logic
> 7. Outputs
> 8. Next phase
> 9. Implementation status

---

### Build Phase 0 — Project Foundation & Repository Setup

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 0 |
| **Exact title** | Project Foundation & Repository Setup |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 0 |
| **Description & objective** | Establish a clean, working repository with all tooling configured so that every subsequent phase starts from a verified, passing baseline. Exit gate: `npm test`, `npm run typecheck`, and `npm run build` must all pass before Phase 1 begins. |
| **Owner** | Rehan |
| **User actions** | Clone repository; run `npm install`; confirm `npm test`, `npm run typecheck`, `npm run build` pass; review `src/types/index.ts` and `tests/unit/contracts.test.ts` for correctness. |
| **System operations** | Initialize Next.js App Router with TypeScript, Tailwind CSS, and Vitest; create canonical `src/types/index.ts` with four `FindingState` string literals and Zod schemas; create placeholder API routes; create a Phase 0 status dashboard at `/`; run Vitest test suite. |
| **Inputs** | Fresh repository clone; `package.json` dependency list; TypeScript configuration. |
| **Processing logic** | Zod schema definitions for `FindingStateSchema`, `DisputeInputSchema`, `FindingSchema`, `BaseRecordSchema`, `ProvenanceSchema`; Vitest contract tests confirm all four canonical `FindingState` values parse without error. |
| **Outputs** | Passing `npm test`; passing `npm run typecheck`; passing `npm run build`; working root page at `/` displaying "Phase 0: Foundation Established" badge; locked canonical type contracts. |
| **Next phase** | Phase 1 — Canonical Contracts, Mock Fixtures & Synthetic Ground Truth |
| **Implementation status** | ✅ **IMPLEMENTED** — Confirmed by: `src/app/page.tsx` (contains "Phase 0: Foundation Established" badge), `src/types/index.ts` (all 4 FindingStates + Zod schemas), `tests/unit/contracts.test.ts` (passing Vitest tests), `src/app/api/investigations/route.ts` and `src/app/api/evaluate/route.ts` (Phase 0 placeholder routes returning HTTP 501). |

**Key files (Phase 0):**
- `src/types/index.ts` — Canonical type contracts
- `src/lib/validation/index.ts` — Re-exports from types
- `src/app/page.tsx` — Phase 0 status dashboard
- `src/app/layout.tsx` — App layout
- `src/app/globals.css` — Global styles (CSS custom properties matching `docs/design.md` colour tokens)
- `src/app/api/investigations/route.ts` — Placeholder API (HTTP 501)
- `src/app/api/evaluate/route.ts` — Placeholder API (HTTP 501)
- `tests/unit/contracts.test.ts` — Contract test suite
- `package.json`, `tsconfig.json`, `next.config.ts` — Tooling configuration

---

### Build Phase 1 — Canonical Contracts, Mock Fixtures & Synthetic Ground Truth

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 1 |
| **Exact title** | Canonical Contracts, Mock Fixtures & Synthetic Ground Truth |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 1; `docs/06_SYNTHETIC_TEST_CASES.md` |
| **Timeline** | Hour 00:00–01:00 |
| **Description & objective** | Lock the TypeScript/Zod wire contracts that all parallel streams will consume in Phase 2. Generate four canonical JSON mock fixtures (`case_01`–`case_04`) plus a mock AI extraction response. These fixtures act as synthetic ground truth so that Phases 2 and 3 can develop and test against deterministic data without a live backend. |
| **Owner** | Sole editor of `src/types/index.ts` and `src/lib/validation/index.ts`: Rehan. Fixture generation is a team task documented in `docs/06_SYNTHETIC_TEST_CASES.md`. |
| **User actions** | Review and approve the locked type contracts; verify that fixture JSON files are syntactically valid and semantically correct against the wire-contract schemas. |
| **System operations** | Freeze `src/types/index.ts` (no further changes without PR review); create `tests/fixtures/case_01_clean_agreement.json`, `tests/fixtures/case_02_short_delivery.json`, `tests/fixtures/case_03_price_discrepancy.json`, `tests/fixtures/case_04_completely_missing.json`, `tests/fixtures/mock_ai_response.json`; update `tests/unit/contracts.test.ts` to validate fixtures against Zod schemas. |
| **Inputs** | Phase 0 output (passing baseline); `docs/06_SYNTHETIC_TEST_CASES.md` (synthetic case specifications); `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` (wire-contract definitions). |
| **Processing logic** | Each fixture JSON must pass `DisputeInputSchema.parse()` and `FindingSchema.parse()` without error. The canonical `FindingState` values (`SUPPORTED_BY_RECORDS`, `CONFLICTING_RECORDS`, `NOT_FOUND_IN_PROVIDED_DATA`, `UNRESOLVED`) must be used verbatim. INR currency, 2-decimal precision for amounts, whole integers for quantities (Decision D6). |
| **Outputs** | Five JSON fixture files in `tests/fixtures/`; updated and passing `tests/unit/contracts.test.ts`; frozen `src/types/index.ts` tagged `@frozen` in JSDoc. |
| **Next phase** | Phase 2 — Parallel Component Development (all four streams consume the locked contracts and fixtures) |
| **Implementation status** | ⚠️ **PARTIALLY IMPLEMENTED** — `src/types/index.ts` and `src/lib/validation/index.ts` exist and are correct. `tests/unit/contracts.test.ts` passes. **However:** `tests/fixtures/` contains only a `.gitkeep` placeholder — none of the five required JSON fixture files (`case_01` through `case_04` + `mock_ai_response`) are present on the `main` branch. |

**Key files (Phase 1):**
- `src/types/index.ts` — IMPLEMENTED (type contracts locked)
- `src/lib/validation/index.ts` — IMPLEMENTED
- `tests/unit/contracts.test.ts` — IMPLEMENTED (schema validation tests pass)
- `tests/fixtures/case_01_clean_agreement.json` — **MISSING**
- `tests/fixtures/case_02_short_delivery.json` — **MISSING**
- `tests/fixtures/case_03_price_discrepancy.json` — **MISSING**
- `tests/fixtures/case_04_completely_missing.json` — **MISSING**
- `tests/fixtures/mock_ai_response.json` — **MISSING**

---

### Build Phase 2 — Parallel Component Development

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 2 |
| **Exact title** | Parallel Component Development |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 2; `docs/07_EIGHT_HOUR_EXECUTION_PLAN.md` |
| **Timeline** | Hour 01:00–02:30 |
| **Description & objective** | Four team members work in isolated Git branches simultaneously. Each stream produces a distinct system component. All streams consume the locked Phase 1 contracts. No stream merges to `main` until Phase 3 integration. |
| **User actions** | Each developer works in their assigned branch; no cross-branch dependencies except `src/types/index.ts`; team lead (Rehan) monitors integration harness. |
| **System operations** | Four parallel streams as defined in `docs/DEVELOPMENT_ROADMAP.md`: |

#### Stream A — Rules Engine (`feat/rules-engine`)
- **Owner:** Maaz
- **Goal:** Pure deterministic TypeScript logic for quantity comparison and record matching
- **Files to produce:**
  - `src/lib/rules/quantityComparison.ts` — arithmetic comparison, quantity-delta calculation
  - `src/lib/rules/recordMatcher.ts` — candidate record identification (hard-constraint filters)
  - `src/lib/evidence/findingBuilder.ts` — assembles `Finding` objects from rule outputs
  - `tests/unit/rules.test.ts` — unit tests for all rule functions

#### Stream B — Investigation UI (`feat/investigation-ui`)
- **Owner:** Bhavika
- **Goal:** React components for the investigation interface
- **Files to produce:**
  - `src/features/investigations/components/DisputeInput.tsx`
  - `src/features/investigations/components/FindingCard.tsx`
  - `src/features/investigations/components/EvidenceTrace.tsx`
  - `src/features/investigations/components/InvestigationWorkspace.tsx`
- **Note:** Components are mocked against fixture JSON; no live API calls during this phase

#### Stream C — AI Claim Extraction (`feat/claim-extraction`)
- **Owner:** Swara
- **Goal:** AI-powered extraction of structured claim fields from informal dispute text
- **Files to produce:**
  - `src/lib/ai/claimExtractor.ts` — calls AI model, parses response
  - `src/lib/ai/prompts.ts` — structured prompts (constrained JSON output format)

#### Stream D — Integration Harness (`chore/integration-harness`)
- **Owner:** Rehan
- **Goal:** Wire the pipeline together so Phase 3 vertical-slice integration can proceed immediately
- **Files to produce:**
  - `src/lib/pipeline.ts` — orchestration layer connecting AI extraction → rules engine → finding builder

| Field | Detail |
|-------|--------|
| **Inputs** | Phase 1 outputs: locked `src/types/index.ts`; five JSON fixture files in `tests/fixtures/`; `docs/design.md` (UI spec for Stream B). |
| **Processing logic** | Each stream is developed and tested in isolation. Streams A and C are pure functions testable without a browser. Stream B renders against static fixture data. Stream D creates the pipeline interface but may use mock implementations until Streams A and C are ready. |
| **Outputs** | Four feature branches, each with passing tests for their component; `src/lib/pipeline.ts` integration harness; UI components rendering from fixture data. |
| **Next phase** | Phase 3 — Vertical-Slice Integration (all four streams merged and end-to-end case verified) |
| **Implementation status** | ❌ **NOT IMPLEMENTED** on `main` branch — All relevant `src/lib/rules/`, `src/lib/ai/`, `src/lib/evidence/`, and `src/features/investigations/` directories contain only `.gitkeep` placeholder files. `src/lib/pipeline.ts` does not exist. The remote Git branches (`feat/rules-engine`, `feat/investigation-ui`, `feat/claim-extraction`, `chore/integration-harness`) exist (visible in remote refs), but their content has not been merged to `main`. |

**Key files (Phase 2 — all currently MISSING on main):**
- `src/lib/rules/quantityComparison.ts`
- `src/lib/rules/recordMatcher.ts`
- `src/lib/evidence/findingBuilder.ts`
- `src/lib/ai/claimExtractor.ts`
- `src/lib/ai/prompts.ts`
- `src/lib/pipeline.ts`
- `src/features/investigations/components/DisputeInput.tsx`
- `src/features/investigations/components/FindingCard.tsx`
- `src/features/investigations/components/EvidenceTrace.tsx`
- `src/features/investigations/components/InvestigationWorkspace.tsx`
- `tests/unit/rules.test.ts`

---

### Build Phase 3 — Vertical-Slice Integration

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 3 |
| **Exact title** | Vertical-Slice Integration (Hour 3.0 Hard Gate) |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 3 |
| **Timeline** | Hour 02:30–03:00 |
| **Description & objective** | Merge all Phase 2 feature branches into `main` and verify that the full vertical slice works end-to-end for a single canonical test case (`case_02_short_delivery`). This is a hard gate — if the vertical slice does not pass all 6 browser-verifiable criteria by Hour 3.0, the team must triage before proceeding. |
| **User actions** | Open the application in a browser; load `case_02_short_delivery`; verify each of the 6 exit criteria manually. |
| **System operations** | Merge branches (Stream A, B, C, D) with no merge conflicts (enforced by Phase 1 contract lock); run `npm test` end-to-end; verify that `src/app/api/investigations/route.ts` returns a real response (not HTTP 501); confirm the investigation pipeline processes `case_02` and returns structured findings. |
| **Inputs** | All Phase 2 outputs merged to `main`; `tests/fixtures/case_02_short_delivery.json`. |
| **Processing logic — 6 browser-verifiable exit criteria** (verbatim from `DEVELOPMENT_ROADMAP.md`): |

1. Quantity calculation: invoiced `100 units` vs received `80 units` → delta `20 units` displayed correctly
2. Finding status: displays `CONFLICTING_RECORDS` (not `UNRESOLVED` or blank)
3. Source attribution: at least one invoice record and one GRN record shown with their IDs
4. Human-review flag: a "Requires Human Review" indicator is visible
5. No hallucinated amounts: no monetary or quantity values appear that are not in the fixture JSON
6. Uncertainty is honest: no claim of a definitive resolution where the system cannot confirm one

| Field | Detail |
|-------|--------|
| **Outputs** | Passing end-to-end integration test for `case_02`; real API response from `/api/investigations`; all 6 browser criteria verified; `main` branch at a stable, demo-able state. |
| **Next phase** | Phase 4 — AI Extraction Integration & Evaluation Runner |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — Phase 2 is not implemented, so Phase 3 cannot have been reached. The `src/app/api/investigations/route.ts` still returns HTTP 501. |

---

### Build Phase 4 — AI Extraction Integration & Evaluation Runner

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 4 |
| **Exact title** | AI Extraction Integration & Evaluation Runner |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 4; `docs/05_AI_ROLE_AND_EVALUATION.md` |
| **Timeline** | Hour 03:30–05:00 |
| **Description & objective** | Wire AI claim extraction into the live pipeline so that users can paste informal dispute text and receive structured findings. Build an evaluation harness that runs two modes — Hybrid (AI extraction + deterministic rules) and Rules-Only (manual claim entry + deterministic rules) — and scores outputs against synthetic ground truth. |
| **Owner** | Swara (AI extraction); Rehan (evaluation harness) |
| **User actions** | Paste raw dispute text into the UI; observe AI-extracted claim fields (editable before submission); trigger evaluation harness to compare Hybrid vs Rules-Only output quality. |
| **System operations** | `src/lib/ai/claimExtractor.ts` sends dispute text to AI model with structured prompt; parses JSON response into `DisputeInput`; falls back gracefully if AI is unavailable (Decision D7: AI is optional, system must work via manual entry). Evaluation harness (`src/app/api/evaluate/route.ts`) runs all 4 synthetic test cases against both modes; scores findings against `tests/fixtures/` expected outputs; returns a comparison report. |
| **Inputs** | Phase 3 stable `main`; raw dispute text (user input); `tests/fixtures/` (all 4 cases + mock AI response); AI model API credentials (from `.env`). |
| **Processing logic** | AI extraction produces a `DisputeInput` candidate; user can edit fields before submission; deterministic rules engine (`src/lib/rules/`) owns all arithmetic and finding-state decisions (AI never directly sets `FindingState`); evaluation harness computes precision/recall metrics for AI-extracted vs manually entered claim fields. |
| **Outputs** | Live AI claim extraction in the UI; evaluation harness report comparing Hybrid vs Rules-Only mode across 4 test cases; `src/app/api/evaluate/route.ts` returning real JSON (not HTTP 501). |
| **Next phase** | Phase 5 — Reliability, Differentiator & Feature Freeze |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — `src/app/api/evaluate/route.ts` exists as a Phase 0 placeholder returning HTTP 501. `src/lib/ai/` directory contains only `.gitkeep`. The remote branch `feat/evaluation` exists but is not merged to `main`. |

**Key files (Phase 4 — all currently MISSING or placeholder on main):**
- `src/lib/ai/claimExtractor.ts` — MISSING
- `src/lib/ai/prompts.ts` — MISSING
- `src/app/api/evaluate/route.ts` — EXISTS but returns HTTP 501 (placeholder only)

---

### Build Phase 5 — Reliability, Differentiator & Feature Freeze

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 5 |
| **Exact title** | Reliability, Differentiator & Feature Freeze |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 5 |
| **Timeline** | Hour 05:00–06:30 (hard feature freeze at Hour 06:00) |
| **Description & objective** | Harden the integrated system. Audit every evidence citation, arithmetic calculation, and finding state for accuracy. Surface ProofTrail's core differentiator: transparent, citable evidence traces. Enforce feature freeze at Hour 06:00 — no new features after this point, only bug fixes and stability work. |
| **User actions** | Conduct a full audit walkthrough of all 4 test cases; verify evidence citations are traceable; check that no finding state is asserted without supporting record reference; confirm error states handle gracefully (missing records, ambiguous data). |
| **System operations** | Audit run: process all 4 synthetic test cases end-to-end; verify arithmetic correctness for each; confirm `UNRESOLVED` is returned where data is genuinely ambiguous (not a default fallback); validate that every finding includes at least one `Provenance` record; check UI renders all citation links; enforce feature freeze. |
| **Inputs** | Phase 4 stable `main`; all 4 synthetic test cases; evaluation harness output from Phase 4. |
| **Processing logic** | Finding audit: for every `Finding`, `provenanceIds` must reference at least one `BaseRecord`; no arithmetic result should appear that is not derivable from fixture data; `needsHumanReview` flag must be set for `CONFLICTING_RECORDS` and `UNRESOLVED` states; error states (file missing, parse failure, API timeout) must be caught and surfaced to the user with actionable messages. |
| **Outputs** | Hardened, reliable end-to-end system passing all 4 synthetic test cases; feature-complete and frozen `main` branch; evidence-citation audit passing; system ready for demo preparation. |
| **Next phase** | Phase 6 — Demonstration Preparation & Judge Defense |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — Prerequisite phases (2, 3, 4) are not implemented. |

---

### Build Phase 6 — Demonstration Preparation & Judge Defense

| Field | Detail |
|-------|--------|
| **Phase number** | Phase 6 |
| **Exact title** | Demonstration Preparation & Judge Defense |
| **Source** | `docs/DEVELOPMENT_ROADMAP.md` Section 3, Phase 6; `docs/08_DEMO_AND_JUDGE_DEFENSE.md` |
| **Timeline** | Hour 06:30–08:00 |
| **Description & objective** | Rehearse three demo scenarios using the live application. Prepare judge Q&A. Ensure every team member can speak to ProofTrail's design decisions, differentiators, and honest limitations. The demo must be reproducible and resilient to edge cases. |
| **User actions** | Team rehearses each demo scenario; assigns speaking roles; runs Q&A dry-run; verifies all demo data is pre-loaded and reproducible; prepares fallback (screenshots/video) if live demo fails. |
| **System operations** | Application must be deployed or running locally in demo-ready state; all 3 demo scenarios must produce correct, verifiable findings without manual intervention during the demo. |
| **Inputs** | Phase 5 frozen `main`; three demo datasets from `docs/08_DEMO_AND_JUDGE_DEFENSE.md`. |

#### Three Specified Demo Scenarios (verbatim from `docs/DEVELOPMENT_ROADMAP.md` and `docs/08_DEMO_AND_JUDGE_DEFENSE.md`):

1. **Discrepancy Scenario** — PO: 100 units invoiced; GRN: 80 units received. Expected output: `CONFLICTING_RECORDS`, delta `20 units`, evidence trace showing both records.
2. **Clean Agreement Scenario** — All documents match. Expected output: `SUPPORTED_BY_RECORDS`, no discrepancy flags.
3. **Ambiguity / Missing Data Scenario** — GRN is absent or partial. Expected output: `NOT_FOUND_IN_PROVIDED_DATA` or `UNRESOLVED`, explicit human-review flag, no hallucinated resolution.

| Field | Detail |
|-------|--------|
| **Outputs** | Completed 3-scenario rehearsal; assigned speaking roles; prepared judge Q&A; fallback materials ready; team aligned on honest limitation disclosures. |
| **Next phase** | N/A — Phase 6 is the final build phase. |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — Prerequisite phases (2–5) are not implemented. Demo scripts are documented in `docs/08_DEMO_AND_JUDGE_DEFENSE.md`. |

---

### Investigation Workflow — 8-Step Core Product Loop

> **Source:** `docs/ProofTrail_01_Enhanced_Product_Brief.md` Section 7 and `docs/architecture.md` Section 4.
> This is the **runtime operational workflow** — how the ProofTrail system processes a dispute investigation from start to finish.

---

#### Step 1 — Capture the Dispute

| Field | Detail |
|-------|--------|
| **Step number** | 1 |
| **Exact title** | Capture the Dispute |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 1 |
| **Description & objective** | Preserve the original dispute message verbatim, without interpretation or alteration. The raw user text is the authoritative starting point. |
| **User actions** | Paste or type the original dispute message (e.g., vendor email, internal complaint, purchase order note) into the DisputeInput component. |
| **System operations** | Store the raw dispute text as `DisputeInput.rawDisputeText`; associate a unique `investigationId`; record timestamp. |
| **Inputs** | Raw dispute text (free-form natural language). |
| **Processing logic** | No transformation at this step. Raw text is stored as-is. |
| **Outputs** | `DisputeInput` record with `rawDisputeText` field populated; investigation session created. |
| **Next step** | Step 2 — Extract the Claim |
| **Implementation status** | ⚠️ **PARTIALLY IMPLEMENTED** — `DisputeInputSchema` in `src/types/index.ts` includes `rawDisputeText: z.string()`. The UI component (`DisputeInput.tsx`) for capturing this input is not implemented on `main`. |

---

#### Step 2 — Extract the Claim

| Field | Detail |
|-------|--------|
| **Step number** | 2 |
| **Exact title** | Extract the Claim |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 2; `docs/05_AI_ROLE_AND_EVALUATION.md` §2 |
| **Description & objective** | Convert the informal dispute text into structured, machine-processable claim fields using AI assistance. The AI extraction is optional and user-editable — the user can manually enter claim fields if AI is unavailable or incorrect (Decision D7). |
| **User actions** | Review and edit AI-extracted claim fields before submission; or manually enter all claim fields if AI extraction is disabled. |
| **System operations** | `src/lib/ai/claimExtractor.ts` sends `rawDisputeText` to AI model with a structured prompt from `src/lib/ai/prompts.ts`; AI returns JSON with extracted fields; system parses and validates against `DisputeInputSchema`; renders editable form pre-filled with AI output. |
| **Inputs** | `rawDisputeText` from Step 1; AI model API (optional). |
| **Processing logic** | Structured prompt constrains AI to output valid JSON matching `DisputeInput` shape; if AI fails or is unavailable, system falls back to blank manual-entry form; no finding-state decisions are made at this step — AI role is extraction only. |
| **Outputs** | Populated `DisputeInput` object: `claimType`, `claimedQuantity`, `invoicedQuantity`, `invoiceReference`, `poReference`, `grnReference`, and other structured fields. |
| **Next step** | Step 3 — Identify Candidate Records |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — `src/lib/ai/claimExtractor.ts` and `src/lib/ai/prompts.ts` are missing from `main`. |

---

#### Step 3 — Identify Candidate Records

| Field | Detail |
|-------|--------|
| **Step number** | 3 |
| **Exact title** | Identify Candidate Records |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 3; `docs/architecture.md` §4 |
| **Description & objective** | Locate the records from the uploaded document set that are relevant to the dispute. Hard-constraint filters run first (deterministic); AI may suggest additional candidates if hard filters return no results. |
| **User actions** | Upload or confirm the document set (invoices, POs, GRNs, etc.); review candidate records identified by the system. |
| **System operations** | `src/lib/rules/recordMatcher.ts` applies hard-constraint filters (reference number match, date range, party name) to the document set; returns candidate `BaseRecord[]`; if no candidates found, AI may suggest fuzzy matches (flagged as AI-suggested, not verified). |
| **Inputs** | `DisputeInput` from Step 2; document set (invoices, purchase orders, goods receipt notes) in JSON/structured format. |
| **Processing logic** | Hard constraints applied in order: exact reference match → date range overlap → party name match. Candidates must match at least one hard constraint to be included without AI assistance. AI-suggested candidates are tagged with `provenance.isAISuggested = true`. |
| **Outputs** | `BaseRecord[]` — candidate records for verification; each record includes `id`, `type`, `quantities`, `amounts`, `referenceNumbers`, `provenance`. |
| **Next step** | Step 4 — Verify Deterministically |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — `src/lib/rules/recordMatcher.ts` is missing from `main`. `BaseRecordSchema` and `ProvenanceSchema` are defined in `src/types/index.ts`. |

---

#### Step 4 — Verify Deterministically

| Field | Detail |
|-------|--------|
| **Step number** | 4 |
| **Exact title** | Verify Deterministically |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 4; `docs/architecture.md` §4; Decision D4 |
| **Description & objective** | Apply deterministic TypeScript code to validate arithmetic, compare quantities, and assign a canonical `FindingState`. This step owns all arithmetic and validation decisions — AI never directly sets `FindingState`. |
| **User actions** | None — this step is fully automated. |
| **System operations** | `src/lib/rules/quantityComparison.ts` performs arithmetic comparison (invoiced quantity vs received/PO quantity); computes delta; `src/lib/evidence/findingBuilder.ts` applies state-assignment rules and assembles `Finding` objects. |
| **Inputs** | `DisputeInput` from Step 2; `BaseRecord[]` from Step 3. |
| **Processing logic** | State assignment rules (deterministic, from `docs/DEVELOPMENT_ROADMAP.md` Decision D4): |

| Condition | Assigned FindingState |
|-----------|----------------------|
| All referenced records found, quantities/amounts match | `SUPPORTED_BY_RECORDS` |
| Records found, quantities or amounts conflict | `CONFLICTING_RECORDS` |
| No matching records found in the provided document set | `NOT_FOUND_IN_PROVIDED_DATA` |
| Records found but outcome is genuinely ambiguous | `UNRESOLVED` |

| Field | Detail |
|-------|--------|
| **Outputs** | `Finding[]` — each with `findingState` (one of 4 canonical values), `delta`, `affectedRecordIds`, `provenanceIds`, `needsHumanReview` flag. |
| **Next step** | Step 5 — Build the Evidence Trace |
| **Implementation status** | ⚠️ **PARTIALLY IMPLEMENTED** — The state machine (4 `FindingState` values and `FindingSchema`) is fully defined in `src/types/index.ts` and validated by `tests/unit/contracts.test.ts`. The rule functions themselves (`quantityComparison.ts`, `findingBuilder.ts`) are missing from `main`. |

---

#### Step 5 — Build the Evidence Trace

| Field | Detail |
|-------|--------|
| **Step number** | 5 |
| **Exact title** | Build the Evidence Trace |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 5; `docs/architecture.md` §4 |
| **Description & objective** | Construct a transparent, citable audit trail showing each claim compared against its supporting or conflicting records. This is ProofTrail's core differentiator — every conclusion is backed by a traceable citation. |
| **User actions** | Review the evidence trace in the UI; click through to source records. |
| **System operations** | Render `EvidenceTrace` component showing: claim field → matched record field → delta → `FindingState`; each evidence item links to its `BaseRecord` via `provenanceId`; UI highlights supporting evidence in green, conflicting in red, missing in amber. |
| **Inputs** | `Finding[]` from Step 4; `BaseRecord[]` from Step 3. |
| **Processing logic** | For each `Finding`, resolve `provenanceIds` to full `BaseRecord` objects; display side-by-side: claimed value vs record value; compute and display delta; show `FindingState` badge; show `needsHumanReview` flag if set. |
| **Outputs** | Rendered evidence trace visible in the UI; each finding is fully cited and traceable. |
| **Next step** | Step 6 — State Uncertainty |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — `src/features/investigations/components/EvidenceTrace.tsx` and `FindingCard.tsx` are missing from `main`. |

---

#### Step 6 — State Uncertainty

| Field | Detail |
|-------|--------|
| **Step number** | 6 |
| **Exact title** | State Uncertainty |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 6 |
| **Description & objective** | Where the data is genuinely ambiguous or incomplete, keep the finding as `UNRESOLVED` and say so explicitly. ProofTrail must never fabricate a resolution. Honest uncertainty is a product requirement, not a bug. |
| **User actions** | Review `UNRESOLVED` findings; decide whether to upload additional documents or proceed with uncertainty acknowledged. |
| **System operations** | Any finding that cannot be confirmed or denied by the provided documents receives `findingState: "UNRESOLVED"` and `needsHumanReview: true`; UI renders these distinctly (amber badge); system does not attempt to guess or infer beyond available data. |
| **Inputs** | `Finding[]` from Step 4 — any findings where evidence is ambiguous or missing. |
| **Processing logic** | Decision rule: if records are found but quantities/amounts are partially matching or partially missing, assign `UNRESOLVED` rather than forcing a binary conclusion; never assign `SUPPORTED_BY_RECORDS` unless all referenced values can be confirmed deterministically. |
| **Outputs** | `UNRESOLVED` findings rendered with explicit uncertainty labels; user is clearly informed that human review is required. |
| **Next step** | Step 7 — Recommend the Next Check |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — UI components are missing. `UNRESOLVED` as a `FindingState` value is defined in `src/types/index.ts`. |

---

#### Step 7 — Recommend the Next Check

| Field | Detail |
|-------|--------|
| **Step number** | 7 |
| **Exact title** | Recommend the Next Check |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 7 |
| **Description & objective** | Provide practical, actionable next-verification steps for each finding that is `CONFLICTING_RECORDS` or `UNRESOLVED`. ProofTrail does not resolve disputes — it tells the user what to verify next. |
| **User actions** | Review recommended next checks; act on them externally (contact vendor, request document, escalate to accounts team). |
| **System operations** | For each non-`SUPPORTED_BY_RECORDS` finding, generate a recommendation: e.g., "Request GRN #GRN-2024-001 from the warehouse team", "Verify invoice line items against PO #PO-2024-007", "Check if partial shipment was approved". Recommendations are deterministic (template-driven) or AI-assisted (clearly labelled). |
| **Inputs** | `Finding[]` with `findingState` != `SUPPORTED_BY_RECORDS`. |
| **Processing logic** | Rule-based recommendation engine: maps `findingState` + `claimType` + missing record type → recommendation template; AI may supplement with additional context (clearly labelled as AI-generated). |
| **Outputs** | `nextVerificationSteps: string[]` appended to each relevant `Finding`; rendered in the UI as actionable items. |
| **Next step** | Step 8 — Human Review |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — Not found in any implemented file on `main`. The `Finding` type in `src/types/index.ts` does not currently include a `nextVerificationSteps` field (possible gap between spec and current type definition). |

---

#### Step 8 — Human Review

| Field | Detail |
|-------|--------|
| **Step number** | 8 |
| **Exact title** | Human Review |
| **Source** | `docs/ProofTrail_01_Enhanced_Product_Brief.md` §7, Step 8 |
| **Description & objective** | The human investigator is responsible for all final decisions. ProofTrail provides evidence and recommendations but does not resolve disputes autonomously. This is a non-negotiable design principle. |
| **User actions** | Review all findings and evidence traces; decide whether to accept, dispute, escalate, or request more information; record their decision externally (ProofTrail does not capture the resolution decision in MVP). |
| **System operations** | Display a summary of all findings with `needsHumanReview` flags; present the complete evidence trace for reference; offer to export/share the investigation report (if implemented). |
| **Inputs** | All `Finding[]` from Steps 4–7; full evidence trace; user's contextual knowledge. |
| **Processing logic** | No further automated processing — ProofTrail's job ends here. The system surfaces `needsHumanReview: true` prominently for all non-`SUPPORTED_BY_RECORDS` findings. |
| **Outputs** | Complete investigation report visible in UI; user has all the evidence needed to make an informed decision. |
| **Next step** | N/A — end of investigation workflow. |
| **Implementation status** | ❌ **NOT IMPLEMENTED** — UI not built; investigation report rendering not implemented on `main`. The `needsHumanReview` flag is defined in `FindingSchema` in `src/types/index.ts`. |

---

## 4. Workflow Data Flow

### Build Phases Data Flow

```
docs/DEVELOPMENT_ROADMAP.md (planning)
          │
          ▼
Phase 0: Repository + Tooling + Type Contracts + Placeholder APIs
          │
          ▼
Phase 1: Locked src/types/index.ts + tests/fixtures/*.json (4 cases + mock AI)
          │
          ├── Stream A ──► src/lib/rules/ (quantityComparison, recordMatcher, findingBuilder)
          │
Phase 2 ──┼── Stream B ──► src/features/investigations/components/*.tsx
          │
          ├── Stream C ──► src/lib/ai/ (claimExtractor, prompts)
          │
          └── Stream D ──► src/lib/pipeline.ts
                    │
                    ▼
Phase 3: Merged main — end-to-end vertical slice for case_02_short_delivery
          │
          ▼
Phase 4: AI extraction wired + evaluation harness (src/app/api/evaluate)
          │
          ▼
Phase 5: Hardened, feature-frozen system — all 4 cases passing
          │
          ▼
Phase 6: Demo rehearsal — 3 scenarios verified live
```

### Investigation Workflow Data Flow (Runtime)

```
User Input (raw dispute text)
          │
          ▼  Step 1: Capture Dispute
rawDisputeText stored in DisputeInput
          │
          ▼  Step 2: Extract Claim (AI optional)
Structured DisputeInput {claimType, claimedQuantity, invoiceRef, poRef, grnRef...}
          │
          ▼  Step 3: Identify Candidate Records
BaseRecord[] filtered from document set by hard constraints
          │
          ▼  Step 4: Verify Deterministically
Finding[] with FindingState {SUPPORTED_BY_RECORDS | CONFLICTING_RECORDS | NOT_FOUND_IN_PROVIDED_DATA | UNRESOLVED}
          │
          ▼  Step 5: Build Evidence Trace
Finding[] enriched with provenanceIds → BaseRecord citations, delta values
          │
          ▼  Step 6: State Uncertainty
UNRESOLVED / CONFLICTING findings flagged with needsHumanReview: true
          │
          ▼  Step 7: Recommend Next Check
nextVerificationSteps[] appended to non-SUPPORTED findings
          │
          ▼  Step 8: Human Review
Complete investigation report displayed; user makes external decision
```

### Data Contracts at Phase Boundaries

| Boundary | Contract | Source |
|----------|----------|--------|
| Step 1 → Step 2 | `rawDisputeText: string` | `DisputeInputSchema` in `src/types/index.ts` |
| Step 2 → Step 3 | Full `DisputeInput` object | `DisputeInputSchema` in `src/types/index.ts` |
| Step 3 → Step 4 | `BaseRecord[]` + `DisputeInput` | `BaseRecordSchema`, `ProvenanceSchema` in `src/types/index.ts` |
| Step 4 → Step 5 | `Finding[]` | `FindingSchema` in `src/types/index.ts` |
| Step 5 → Step 8 | Enriched `Finding[]` with provenance | `FindingSchema`, `ProvenanceSchema` |

---

## 5. Code Implementation Mapping

### Phase 0 (IMPLEMENTED)

| Component | File | Status |
|-----------|------|--------|
| Type contracts | `src/types/index.ts` | ✅ Implemented |
| Validation re-exports | `src/lib/validation/index.ts` | ✅ Implemented |
| Status dashboard (root page) | `src/app/page.tsx` | ✅ Implemented |
| App layout | `src/app/layout.tsx` | ✅ Implemented |
| Global styles + colour tokens | `src/app/globals.css` | ✅ Implemented |
| Investigations API (placeholder) | `src/app/api/investigations/route.ts` | ✅ Placeholder (HTTP 501) |
| Evaluate API (placeholder) | `src/app/api/evaluate/route.ts` | ✅ Placeholder (HTTP 501) |
| Contract tests | `tests/unit/contracts.test.ts` | ✅ Implemented |
| Build config | `package.json`, `tsconfig.json`, `next.config.ts` | ✅ Implemented |

### Phase 1 (PARTIALLY IMPLEMENTED)

| Component | File | Status |
|-----------|------|--------|
| Type contracts (frozen) | `src/types/index.ts` | ✅ Implemented |
| Validation module | `src/lib/validation/index.ts` | ✅ Implemented |
| Fixture: Case 01 (clean agreement) | `tests/fixtures/case_01_clean_agreement.json` | ❌ Missing |
| Fixture: Case 02 (short delivery) | `tests/fixtures/case_02_short_delivery.json` | ❌ Missing |
| Fixture: Case 03 (price discrepancy) | `tests/fixtures/case_03_price_discrepancy.json` | ❌ Missing |
| Fixture: Case 04 (completely missing) | `tests/fixtures/case_04_completely_missing.json` | ❌ Missing |
| Mock AI response fixture | `tests/fixtures/mock_ai_response.json` | ❌ Missing |

### Phase 2 (NOT IMPLEMENTED on main)

| Component | File | Branch | Status |
|-----------|------|--------|--------|
| Quantity comparison rules | `src/lib/rules/quantityComparison.ts` | `feat/rules-engine` | ❌ Missing on main |
| Record matcher | `src/lib/rules/recordMatcher.ts` | `feat/rules-engine` | ❌ Missing on main |
| Finding builder | `src/lib/evidence/findingBuilder.ts` | `feat/rules-engine` | ❌ Missing on main |
| Rules unit tests | `tests/unit/rules.test.ts` | `feat/rules-engine` | ❌ Missing on main |
| Dispute input component | `src/features/investigations/components/DisputeInput.tsx` | `feat/investigation-ui` | ❌ Missing on main |
| Finding card component | `src/features/investigations/components/FindingCard.tsx` | `feat/investigation-ui` | ❌ Missing on main |
| Evidence trace component | `src/features/investigations/components/EvidenceTrace.tsx` | `feat/investigation-ui` | ❌ Missing on main |
| Investigation workspace | `src/features/investigations/components/InvestigationWorkspace.tsx` | `feat/investigation-ui` | ❌ Missing on main |
| AI claim extractor | `src/lib/ai/claimExtractor.ts` | `feat/claim-extraction` | ❌ Missing on main |
| AI prompts | `src/lib/ai/prompts.ts` | `feat/claim-extraction` | ❌ Missing on main |
| Pipeline orchestration | `src/lib/pipeline.ts` | `chore/integration-harness` | ❌ Missing on main |

### Phases 3–6 (NOT IMPLEMENTED)

| Component | File | Status |
|-----------|------|--------|
| Investigations API (real) | `src/app/api/investigations/route.ts` | ❌ Only HTTP 501 placeholder |
| Evaluate API (real) | `src/app/api/evaluate/route.ts` | ❌ Only HTTP 501 placeholder |
| Investigation workspace page | `src/app/investigations/page.tsx` (or similar) | ❌ Missing |
| Demo data loaders | Not specified | ❌ Not planned in files |

---

## 6. Specification vs. Implementation

### Summary Table

| Phase / Step | Documented | Implemented | Gap |
|-------------|------------|-------------|-----|
| Build Phase 0 | ✅ Yes | ✅ Yes | None |
| Build Phase 1 | ✅ Yes | ⚠️ Partial | JSON fixtures missing |
| Build Phase 2 | ✅ Yes | ❌ No (branches exist, not merged) | All feature code missing on main |
| Build Phase 3 | ✅ Yes | ❌ No | Prerequisite phases incomplete |
| Build Phase 4 | ✅ Yes | ❌ No | AI and evaluate route unimplemented |
| Build Phase 5 | ✅ Yes | ❌ No | No implementable state yet |
| Build Phase 6 | ✅ Yes | ❌ No | No implementable state yet |
| Inv. Step 1 (Capture) | ✅ Yes | ⚠️ Partial | Schema defined; UI missing |
| Inv. Step 2 (Extract) | ✅ Yes | ❌ No | AI extractor missing |
| Inv. Step 3 (Identify Records) | ✅ Yes | ❌ No | RecordMatcher missing |
| Inv. Step 4 (Verify) | ✅ Yes | ⚠️ Partial | State machine defined; rules missing |
| Inv. Step 5 (Evidence Trace) | ✅ Yes | ❌ No | UI components missing |
| Inv. Step 6 (Uncertainty) | ✅ Yes | ❌ No | UI missing; UNRESOLVED state defined |
| Inv. Step 7 (Next Check) | ✅ Yes | ❌ No | Not implemented; type gap noted |
| Inv. Step 8 (Human Review) | ✅ Yes | ❌ No | UI missing; flag defined |

### Document Conflict — MUST REPORT

**CONFLICT D11 — Finding State Vocabulary**

This conflict is acknowledged in the project's own decision log (`docs/09_DECISIONS_AND_OPEN_QUESTIONS.md` and `docs/DEVELOPMENT_ROADMAP.md` Section 9, Decision D11).

| Source | Finding State Labels Used |
|--------|--------------------------|
| `docs/design.md` (UI specification) | `SUPPORTED`, `CONTRADICTED`, `MISSING`, `AMBIGUOUS` |
| `src/types/index.ts` (wire contract, authoritative) | `SUPPORTED_BY_RECORDS`, `CONFLICTING_RECORDS`, `NOT_FOUND_IN_PROVIDED_DATA`, `UNRESOLVED` |
| `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` | `SUPPORTED_BY_RECORDS`, `CONFLICTING_RECORDS`, `NOT_FOUND_IN_PROVIDED_DATA`, `UNRESOLVED` |

**Resolution (from Decision D11):** `src/types/index.ts` wire-contract values are **authoritative**. `docs/design.md` labels are for display only. A UI adapter must map wire values to display labels before rendering. This does not require changing `docs/design.md` — it is intentionally a UI-layer concern.

### Implementation Findings Not Explicitly in Documentation

The following were found in the codebase but are not described in the documentation as distinct phases or steps:

1. **Phase 0 Status Dashboard** (`src/app/page.tsx`): The current root page `/` is a "Phase 0: Foundation Established" status board listing implemented components, passing tests, and blocked items. The documentation describes the root page as the investigation workspace overview (per `docs/design.md`). These are in conflict — the current page is a temporary development status page, not the product's intended UI.

2. **Placeholder API Routes** (`src/app/api/investigations/route.ts`, `src/app/api/evaluate/route.ts`): Both routes explicitly return HTTP 501 ("Not Implemented"). The comments in these files indicate they are Phase 0 scaffolds intended to be replaced in Phase 2/4 respectively. They are not documented as a distinct workflow step — they are infrastructure scaffolding.

---

## 7. Dependencies and Phase Transitions

### Build Phase Transitions

| Transition | Prerequisite / Exit Gate |
|------------|--------------------------|
| Phase 0 → Phase 1 | `npm test`, `npm run typecheck`, `npm run build` all pass |
| Phase 1 → Phase 2 | All 5 fixture JSON files in `tests/fixtures/`; `src/types/index.ts` frozen and tagged; `npm test` passes with fixture validation |
| Phase 2 → Phase 3 | All 4 feature branches have passing tests; `src/lib/pipeline.ts` integration harness wiring complete |
| Phase 3 → Phase 4 | **6 browser-verifiable criteria pass for `case_02_short_delivery`** (see Phase 3 detail above); `main` stable; `npm test` passes |
| Phase 4 → Phase 5 | Evaluation harness returns real JSON for all 4 test cases; AI extraction works end-to-end; `main` stable |
| Phase 5 → Phase 6 | Feature freeze enforced (Hour 06:00 hard stop); all 4 synthetic test cases pass; audit review complete |
| Phase 6 → Done | All 3 demo scenarios rehearsed; Q&A prepared; fallback materials ready |

### Investigation Workflow Step Transitions

| Transition | Prerequisite |
|------------|-------------|
| Step 1 → Step 2 | `rawDisputeText` is non-empty |
| Step 2 → Step 3 | `DisputeInput` is valid (passes `DisputeInputSchema.parse()`); user has confirmed or edited AI-extracted fields |
| Step 3 → Step 4 | At least one candidate `BaseRecord` identified (or user confirms no records are available, triggering `NOT_FOUND_IN_PROVIDED_DATA`) |
| Step 4 → Step 5 | All findings have an assigned `FindingState`; no null states |
| Step 5 → Step 6 | Evidence trace rendered; all `provenanceIds` resolved to `BaseRecord` objects |
| Step 6 → Step 7 | `UNRESOLVED` and `CONFLICTING_RECORDS` findings flagged with `needsHumanReview: true` |
| Step 7 → Step 8 | `nextVerificationSteps` populated for all non-`SUPPORTED_BY_RECORDS` findings |
| Step 8 → End | User reviews all findings; no further automated steps |

### Locked Decisions That Cannot Change Without Full Team Review

From `docs/DEVELOPMENT_ROADMAP.md` Decision Log (D1–D11):

| Decision | Content |
|----------|---------|
| D1 | Working name: **ProofTrail** |
| D2 | MVP dispute type: **short-delivery / quantity discrepancy only** |
| D3 | Architecture: **Modular Monolith in Next.js App Router** |
| D4 | **Deterministic TypeScript code owns all arithmetic and finding-state assignment** (AI never sets FindingState directly) |
| D5 | Exactly **4 canonical wire-contract FindingState strings** (no additions without full team review) |
| D6 | **INR currency, 2-decimal precision for amounts; quantities are whole integers** |
| D7 | **AI extraction is optional**; system must work without AI via manual claim entry |
| D8 | **In-memory processing and synthetic JSON fixtures**; no SQL/NoSQL database in MVP |
| D9 | `docs/README_FIRST.md` referenced in old README is **missing from disk** |
| D10 | `01_PRODUCT_BRIEF.md` is present as `docs/ProofTrail_01_Enhanced_Product_Brief.md` (filename mismatch) |
| D11 | Finding-state vocabulary conflict resolved with **UI adapter pattern** (wire contract is authoritative; display labels are UI-only) |

---

## 8. Unresolved Questions and Gaps

The following could not be established from the available files, or represent genuine gaps between the specification and current state.

### G1 — JSON Fixture Files Are Missing

**Gap:** `tests/fixtures/` contains only `.gitkeep`. The five required fixture files (`case_01` through `case_04` + `mock_ai_response`) are absent from `main`. These are required for Phase 2 and all downstream phases.

**Source:** `docs/DEVELOPMENT_ROADMAP.md` Phase 1 task list; `docs/06_SYNTHETIC_TEST_CASES.md` (contains the case specifications, but not the JSON files themselves on disk).

---

### G2 — Feature Branches Not Merged

**Gap:** Remote Git branches `feat/rules-engine`, `feat/investigation-ui`, `feat/claim-extraction`, `chore/integration-harness`, and `feat/evaluation` exist (confirmed in Git remote refs), but none of their content is present on `main`. It is unknown whether these branches contain working implementations or are empty stubs.

**Cannot establish from available files:** The content of these feature branches without checking them out.

---

### G3 — `docs/README_FIRST.md` Is Missing

**Gap:** Decision D9 in `docs/DEVELOPMENT_ROADMAP.md` explicitly records that `docs/README_FIRST.md` is referenced in the old README but is missing from disk. This file has not been created.

---

### G4 — `nextVerificationSteps` Field Absent from Current Type Definition

**Gap:** Investigation Workflow Step 7 specifies that `Finding` objects should include `nextVerificationSteps: string[]`. The current `FindingSchema` in `src/types/index.ts` does not include this field. This is either a documentation-ahead-of-implementation situation or a gap in the type definition that will need to be resolved before Phase 2 (Stream B) can render recommendations.

**Cannot establish:** Whether this was intentionally deferred or an oversight.

---

### G5 — Investigation Workspace Route Not Defined

**Gap:** `docs/design.md` describes a full investigation workspace UI at the root route `/`. The current `src/app/page.tsx` is a Phase 0 status dashboard, not the investigation workspace. No route for an actual investigation session (e.g., `/investigations/[id]`) exists in the current file structure.

---

### G6 — Document Set Upload Mechanism Not Specified in Code

**Gap:** Investigation Workflow Steps 3 and 4 require a "document set" (invoices, POs, GRNs) to be provided. The documentation describes this as structured JSON input. How users upload or provide these documents (file upload, paste, API call, pre-loaded fixture) is not implemented. The MVP uses synthetic fixtures, but the handoff between fixtures and a real document ingestion path is not specified in any implemented file.

---

### G7 — `docs/design.md` Lines 801–844 Not Read

**Gap:** The final ~44 lines of `docs/design.md` were not read during inspection. These likely contain closing design notes. Given the density of information already read (800 lines), this is unlikely to introduce new phases — but cannot be ruled out.

---

### G8 — `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` Lines 801–1141 Not Read

**Gap:** The latter portion of this file (341 lines) was not read. It may contain additional data contract details or architecture decisions not captured in the first 800 lines.

---

### G9 — Evaluation Harness Scoring Rubric Not Validated Against Code

**Gap:** `docs/05_AI_ROLE_AND_EVALUATION.md` defines a detailed scoring rubric for the evaluation harness (precision/recall for AI extraction, correctness scoring for findings). Whether this rubric is the one intended for `src/app/api/evaluate/route.ts` implementation cannot be confirmed from the placeholder code alone.

---

### G10 — No `.env.example` Found

**Gap:** The project uses AI model API credentials (referenced in `docs/05_AI_ROLE_AND_EVALUATION.md` and implied by `src/lib/ai/`). No `.env.example` file was found in the project root, which means the required environment variable names are not documented in a developer-facing location. This is a setup gap for developers joining the project. (No secrets are exposed in this report per the strict rules.)

---

*End of report.*

*Report generated by: Antigravity workspace inspection agent*  
*Workspace inspected: `c:\Users\DELL\Desktop\aimpact\AIMPACT-2026`*  
*All facts sourced directly from project files. No phases were invented.*


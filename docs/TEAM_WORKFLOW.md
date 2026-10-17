# ProofTrail — Team Workflow & Collaboration Guide

**Hackathon Window:** AIMPACT 2026 · AI for Business & Commerce · 8-Hour Build  
**Status:** Canonical team operating agreement for parallel development.

---

## 1. Division of Responsibilities

The provisional division of responsibilities across the four team members is organized around decoupled ownership to minimize merge conflicts and ensure clear integration boundaries:

### Member 1 — Rehan: Product Integration & Coordination
- **Ownership:** Canonical contracts, API coordination, end-to-end integration, demo defense.
- **Key Responsibilities:**
  - Maintain canonical schemas and data contracts in `src/types/index.ts` and `src/lib/validation/`.
  - Coordinate integration checkpoints at Hour 2.5 and Hour 3 (hard gate).
  - Ensure the end-to-end flow adheres strictly to `docs/01_PRODUCT_BRIEF.md` and `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md`.
  - Prepare demonstration script, judge question defense (`docs/08_DEMO_AND_JUDGE_DEFENSE.md`), and validation evidence.

### Member 2 — Maaz: Deterministic Rules & Synthetic Data
- **Ownership:** Deterministic business logic, verification engine, synthetic fixtures, unit tests.
- **Branch:** `feat/rules-engine`
- **Key Responsibilities:**
  - Own synthetic dispute fixtures in `tests/fixtures/` and evaluate expected outcomes against `docs/06_SYNTHETIC_TEST_CASES.md`.
  - Implement deterministic verification checks in `src/lib/rules/` and finding builder in `src/lib/evidence/`.
  - Verify arithmetic precision (decimal-safe currency / integer units), record compatibility, unit checks, and conflicting evidence handling.
  - Implement automated unit tests in `tests/unit/` verifying each deterministic rule independently of UI and LLMs.

### Member 3 — Bhavika: Frontend & Investigation Desk
- **Ownership:** Investigation desk UI, user experience, evidence rendering.
- **Branch:** `feat/investigation-ui`
- **Key Responsibilities:**
  - Implement the single-screen investigation desk in `src/features/investigations/` and `src/app/page.tsx` adhering to `docs/design.md`.
  - Consume canonical mock fixtures and API contracts without implementing business arithmetic or rules in the UI.
  - Render findings with appropriate color-coding (Green for `SUPPORTED_BY_RECORDS`, Red for `CONFLICTING_RECORDS`, Amber for `NOT_FOUND_IN_PROVIDED_DATA`, Slate for `UNRESOLVED`).
  - Provide clear source record citation trays, reconciliation strips, and editable claim verification cards.

### Member 4 — Swara: AI Extraction & Evaluation
- **Ownership:** Claim extraction adapter, prompt engineering, structured output validation, evaluation runner.
- **Branch:** `feat/claim-extraction` / `feat/evaluation`
- **Key Responsibilities:**
  - Implement AI claim extraction adapter in `src/lib/ai/` constrained strictly by `DisputeInputSchema` and `ProvenanceSchema`.
  - Enforce fallback to manual entry when LLM is unavailable, times out, or fails schema validation.
  - Build evaluation comparison in `src/app/api/evaluate/route.ts` measuring AI-assisted extraction against rules-only baseline across synthetic test cases.
  - Ensure no model hallucinated numbers or fake source IDs enter the system.

---

## 2. Git & Branching Strategy

To enable 4 engineers to work simultaneously without overwriting work or causing blocking conflicts:

1. **Shared Repository & Protected `main`:**
   - Repository: `https://github.com/rehanmujawar804-source/AIMPACT-2026.git`
   - The `main` branch represents the stable, working baseline.
   - **No direct pushes to `main` during parallel work** unless explicitly agreed upon by the team during an integration checkpoint.

2. **Feature Branch Naming:**
   - `feat/rules-engine` (Maaz)
   - `feat/investigation-ui` (Bhavika)
   - `feat/claim-extraction` (Swara)
   - `feat/evaluation` (Swara)
   - `chore/integration-hour-X` (Rehan)

3. **Commit Standards:**
   - Make small, atomic commits with clear messages (e.g., `feat(rules): add invoice-to-receipt quantity check`, `fix(ui): align table numbers to tabular numerals`).
   - Never commit `.env` secrets, generated build directories (`.next/`), or dependencies (`node_modules/`).

4. **Integration Cadence:**
   - **Hour 1.0:** Contract Freeze — `src/types/index.ts` locked down.
   - **Hour 2.5:** First vertical slice integration — mock API connects to UI.
   - **Hour 3.0:** Hard gate — deterministic engine connected to API and UI.
   - **Hour 5.0:** AI extraction adapter connected with rules-only fallback.
   - **Hour 6.5:** Feature freeze — start evaluation runs and judge defense prep.

5. **Single Source of Truth:**
   - All shared types, contracts, and finding states live in `src/types/index.ts`.
   - Never define duplicate schemas or ad-hoc types in individual feature files.
   - If a contract must change, notify Rehan to coordinate the update.

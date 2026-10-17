# ProofTrail — Evidence-First Dispute Investigation Assistant

**Event Context:** AIMPACT 2026 · AI for Business & Commerce · 8-Hour Build  
**Current Phase:** Phase 0 — Foundation & Repository Setup (Completed)  
**Implementation Status:** Foundation established. Contracts, schemas, and test suite configured. Product features (rules engine, claim extraction, full investigation UI) are **not implemented yet** and will be built in subsequent phases.

---

## 1. What is ProofTrail?

ProofTrail is an evidence-first investigation assistant designed for small B2B suppliers and buyers navigating short-delivery quantity disputes.

When a buyer claims fewer goods were received or deducts an unapproved amount from a payment:
- ProofTrail correlates structured transaction records (Purchase Orders, Invoices, Dispatch Records, Proof of Delivery/Signed Receipts, Payment Records, and Credit Notes).
- Deterministic code validates schema consistency, verifies arithmetic, and evaluates evidence.
- Findings are mapped strictly to four canonical states with explicit source record citations.
- Assistive AI extracts claims and suggests candidate matches, while falling back gracefully to manual entry if unavailable.

### Canonical Finding States
1. `SUPPORTED_BY_RECORDS` — Stated claim is directly confirmed by uploaded records.
2. `CONFLICTING_RECORDS` — Uploaded records actively contradict each other (e.g., dispatch: 100, receipt: 80).
3. `NOT_FOUND_IN_PROVIDED_DATA` — The record or evidence is absent from the provided dataset. (Does **not** imply non-existence in reality).
4. `UNRESOLVED` — Ambiguous references, missing records, or incompatible units prevent a definitive conclusion.

---

## 2. Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (v14+ App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (strict mode)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with custom design tokens from `docs/design.md`
- **Validation:** [Zod](https://zod.dev/) runtime schema validation for data contracts and finding states
- **Testing:** [Vitest](https://vitest.dev/) automated test runner
- **Architecture:** Modular Monolith (single Next.js application containing Route Handlers, deterministic engines, and UI)

---

## 3. Prerequisites & Environment Setup

- **Node.js:** v20+ or v24+ (Detected on system: `v24.22.0` at `C:\Program Files\nodejs`)
- **Package Manager:** `npm` v10+ (Detected on system: `11.19.1`)

> [!NOTE]
> **Windows PowerShell Execution Policy:**  
> On Windows systems where script execution is restricted (`PSSecurityException`), run commands with `npm.cmd` or bypass the execution policy for your active terminal session:
> ```powershell
> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
> ```

---

## 4. Installation & Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rehanmujawar804-source/AIMPACT-2026.git
cd AIMPACT-2026

# Install exact dependencies
npm install
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env.local
```
*(No external API keys or cloud services are required for Phase 0.)*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to inspect the Phase 0 foundation workspace.

### 4. Run Automated Tests & Type Checks
```bash
# Run unit tests with Vitest
npm test

# Run TypeScript type check
npm run typecheck
```

---

## 5. Repository & Documentation Guide

The documentation pack represents the source of truth for all requirements, architecture, and evaluation:

| Document | Purpose |
|---|---|
| `docs/ProofTrail_01_Enhanced_Product_Brief.md` | Core problem, scope boundary, and product definition |
| `docs/02_DIFFERENTIATION_AND_COMPETITORS.md` | Competitive posture against ERP/accounting software |
| `docs/03_SCOPE_AND_ACCEPTANCE_CRITERIA.md` | Hackathon scope boundaries and definition of done |
| `docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md` | Canonical schemas, finding states, and modular monolith architecture |
| `docs/05_AI_ROLE_AND_EVALUATION.md` | Assistive AI role, schema constraints, and baseline evaluation |
| `docs/06_SYNTHETIC_TEST_CASES.md` | Benchmark dispute scenarios and expected outcomes |
| `docs/07_EIGHT_HOUR_EXECUTION_PLAN.md` | Hackathon timeline, checkpoints, and risk gates |
| `docs/08_DEMO_AND_JUDGE_DEFENSE.md` | Demo script, defense questions, and evidence proof points |
| `docs/09_DECISIONS_AND_OPEN_QUESTIONS.md` | Architectural decisions, assumptions, and known risks |
| `docs/architecture.md` | System component interaction & flow diagrams |
| `docs/design.md` | Complete UI specification, design tokens, and layout guidelines |
| `docs/TEAM_WORKFLOW.md` | 4-person team responsibilities, branch strategy, and coordination rules |

*(Note: `docs/README_FIRST.md` is currently missing from the documentation pack; see Documentation Status below).*

---

## 6. Four-Person Team Collaboration

Detailed in `docs/TEAM_WORKFLOW.md`:

- **Member 1 — Rehan (Integration Lead):** Canonical contracts, integration checkpoints, API coordination, judge demo defense.
- **Member 2 — Maaz (Rules & Data):** Deterministic verification engine, synthetic fixtures, arithmetic rules (`feat/rules-engine`).
- **Member 3 — Bhavika (Frontend):** Investigation workspace, evidence findings UI, reconciliation strip (`feat/investigation-ui`).
- **Member 4 — Swara (AI & Evaluation):** AI claim extraction adapter, schema validation, rules-only benchmark evaluation (`feat/claim-extraction`).

**Branching Rules:**
- All work occurs on individual feature branches.
- No direct pushes to `main`.
- Shared types in `src/types/index.ts` remain the sole source of truth.

---

## 7. Capabilities Not Implemented Yet (Phase 0 Boundary)

To maintain architectural integrity, the following features are intentionally **not implemented** in Phase 0:
- Deterministic rules engine (quantity difference, unit compatibility, date consistency)
- LLM claim extraction adapter
- Investigation execution API (`src/app/api/investigations/route.ts` is an unimplemented placeholder)
- Evaluation execution API (`src/app/api/evaluate/route.ts` is an unimplemented placeholder)
- Interactive frontend results screens
- External database, vector database, or authentication services

---

## 8. External References

Competitor notes are based on public vendor pages checked on 17 October 2026:
- Zoho Books invoice management: https://www.zoho.com/in/books/accounting-software/invoice-management/
- Zoho Books India plans/features: https://www.zoho.com/in/books/pricing/
- Medius purchase-to-pay: https://www.medius.com/solutions/purchase-to-pay/
- Medius invoice automation: https://www.medius.com/solutions/medius-accounts-payable-automation/
- HighRadius deductions management: https://www.highradius.com/software/order-to-cash/deductions-management/
- HighRadius proof-of-delivery automation: https://www.highradius.com/software/order-to-cash/collections-management/proof-of-delivery-automation/

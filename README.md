# ProofTrail — Hackathon Documentation Pack

**Event context:** AIMPACT 2026 · AI for Business & Commerce · 8-hour build  
**Working product:** ProofTrail — evidence-first short-delivery dispute investigation for small B2B suppliers  
**Status:** Proposed build specification. This is not evidence of market validation or a completed implementation.

## Read in this order
1. `01_PRODUCT_BRIEF.md` — what we are building and for whom.
2. `02_DIFFERENTIATION_AND_COMPETITORS.md` — the honest competitive position and what must not be claimed.
3. `03_SCOPE_AND_ACCEPTANCE_CRITERIA.md` — the build boundary and definition of done.
4. `04_DATA_CONTRACTS_AND_ARCHITECTURE.md` — schemas, API contract, and architecture.
5. `05_AI_ROLE_AND_EVALUATION.md` — why AI is present and how to prove it adds value.
6. `06_SYNTHETIC_TEST_CASES.md` — test scenarios and expected behavior.
7. `07_EIGHT_HOUR_EXECUTION_PLAN.md` — parallel work, integration checkpoints, feature freeze.
8. `08_DEMO_AND_JUDGE_DEFENSE.md` — demo script, difficult questions, defensible answers.
9. `09_DECISIONS_AND_OPEN_QUESTIONS.md` — assumptions, decisions, risks, and unresolved questions.

## Non-negotiable product rules
- Never claim a dispute is fraud merely because records differ.
- Never infer that a record does not exist in the real world just because it is absent from the uploaded dataset.
- Every factual finding must cite one or more input record IDs.
- All arithmetic is deterministic code, not free-form LLM arithmetic.
- If the evidence is incomplete or conflicting, show `UNRESOLVED` and explain why.
- AI must be compared against a rules-only baseline. If it adds no measurable value, narrow or remove the AI role.
- Do not claim unique/first-in-market, customer validation, production readiness, real-world impact, or superior accuracy without evidence.
- Synthetic test performance is prototype evaluation only, not proof of market demand or real-world effectiveness.

## Suggested repository layout
```text
prooftrail/
  README.md
  docs/
    README_FIRST.md
    01_PRODUCT_BRIEF.md
    02_DIFFERENTIATION_AND_COMPETITORS.md
    03_SCOPE_AND_ACCEPTANCE_CRITERIA.md
    04_DATA_CONTRACTS_AND_ARCHITECTURE.md
    05_AI_ROLE_AND_EVALUATION.md
    06_SYNTHETIC_TEST_CASES.md
    07_EIGHT_HOUR_EXECUTION_PLAN.md
    08_DEMO_AND_JUDGE_DEFENSE.md
    09_DECISIONS_AND_OPEN_QUESTIONS.md
  sample_data/
  app/
  tests/
```

## Current external references
Competitor notes are based on public vendor pages checked on 17 October 2026. Vendor feature pages are evidence of advertised capabilities, not independent evaluations of quality or proof that every customer has access to every feature.
- Zoho Books invoice management: https://www.zoho.com/in/books/accounting-software/invoice-management/
- Zoho Books India plans/features: https://www.zoho.com/in/books/pricing/
- Medius purchase-to-pay: https://www.medius.com/solutions/purchase-to-pay/
- Medius invoice automation: https://www.medius.com/solutions/medius-accounts-payable-automation/
- HighRadius deductions management: https://www.highradius.com/software/order-to-cash/deductions-management/
- HighRadius proof-of-delivery automation: https://www.highradius.com/software/order-to-cash/collections-management/proof-of-delivery-automation/

Last updated: 17 October 2026.

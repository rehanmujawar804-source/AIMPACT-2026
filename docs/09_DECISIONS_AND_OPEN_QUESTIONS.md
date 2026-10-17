# 09 — Decisions, Assumptions & Open Questions

## Locked working decisions
- Working name: ProofTrail.
- Domain: AI for Business & Commerce.
- Initial workflow: short-delivery / quantity discrepancy dispute for a small B2B supplier.
- Product role: evidence-first investigation assistant, not accounting software or legal adjudicator.
- Input: structured CSV/JSON plus a dispute message.
- Core: source-linked evidence trace, deterministic arithmetic, explicit uncertainty.
- AI: claim extraction and candidate record matching, validated before use.
- Evaluation: compare hybrid against rules-only using synthetic labelled cases.
- No real customer data in an external LLM during the hackathon.
- No claims of unique market position or customer validation.

## Assumptions to validate
| ID | Assumption | How to test | Current status |
|---|---|---|---|
| A1 | Small suppliers encounter recurring short-delivery disputes/payment deductions | 3–5 exploratory conversations; ask for a recent workflow example | Unvalidated |
| A2 | Records are spread across different files or systems | Ask users to walk through the last case | Unvalidated |
| A3 | Current workflows take meaningful time or create avoidable errors | Observe workflow and estimate steps/time; do not lead interviewees | Unvalidated |
| A4 | A claim-first evidence trace is useful to the target user | Show a prototype and ask them to compare with their current process | Unvalidated |
| A5 | AI improves extraction/matching over a structured form | Run fixed evaluation against rules-only | Unvalidated |
| A6 | The target user can supply structured exports | Inspect sample exports with permission; document data-cleaning burden | Unvalidated |
| A7 | The narrow wedge is commercially distinct from existing products | Hands-on workflow/plan comparison and interviews | Unvalidated |

## Decisions still open
- Final tech stack based on what the team can implement fastest.
- LLM provider and whether API access is available.
- Whether to support English only or tested Hinglish.
- Whether record matching is exact-link-only for MVP or includes a simple candidate scorer.
- Whether output is copyable text or a downloadable report.
- Which metrics can be completed within the remaining time.
- Whether any informal user conversations are possible.

## Risks
1. **No demand validation:** product may solve a rare or already manageable problem.
2. **Competitive overlap:** related functions already exist in accounting and enterprise dispute products.
3. **Weak AI contribution:** rules-only might perform similarly.
4. **Data cleanliness:** structured data may omit the real complexity of document-heavy disputes.
5. **False certainty:** the model could overstate what records prove.
6. **Integration failure:** parallel implementations can diverge.
7. **Scope creep:** OCR, integrations and extra features can prevent a reliable end-to-end demo.

## Risk controls
- One dispute type only.
- Small explicit schemas.
- Early vertical slice by 2.5 hours; integration hard gate by 3 hours.
- All findings require source IDs.
- Unknown/ambiguous status is a valid outcome.
- Deterministic calculation engine.
- Fixed labelled tests and transparent failures.
- Feature freeze by 5.5 hours.
- Demo fallback without model connectivity.

## Decision rule after the hackathon
Continue beyond the prototype only if:
- at least some target users describe a recurring painful workflow,
- the prototype performs reliably on representative cases,
- AI shows a measurable advantage for a clearly defined task,
- users can provide the necessary records without disproportionate setup,
- competitor review reveals a credible underserved workflow.

Otherwise revise or stop. A technically impressive demo is not by itself proof of a viable business.

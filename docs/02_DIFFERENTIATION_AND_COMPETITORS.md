# 02 — Differentiation & Competitor Map

## First principle: do not invent a competitor gap
Invoice matching, payment reconciliation, receipt matching, deduction handling, proof-of-delivery retrieval, and dispute workflows already exist in the market. ProofTrail cannot credibly claim to invent invoice-dispute management or AI evidence matching.

Our proposed differentiation is a hypothesis about product focus and interaction design—not a verified market gap.

## Public competitor evidence (checked 17 Oct 2026)

| Product/vendor | Publicly described capability | Implication for ProofTrail | What we have NOT established |
|---|---|---|---|
| Zoho Books | Invoicing, payment tracking, partial/offline payments, credit notes, sales/purchase orders, banking reconciliation; India plans include invoice management and other accounting functions. | Basic invoice/payment tracking and related records are not differentiators. | We have not tested every Zoho plan/workflow or proven that Zoho cannot support a particular short-delivery investigation. |
| Medius | Purchase-to-pay and AP automation; invoice capture; matching invoices against purchase orders and goods receipts; exception routing. | Matching invoice, PO, and receipt is established functionality. | We have not performed a hands-on feature comparison or established relative pricing/usability for small Indian suppliers. |
| HighRadius | Deductions management; shortage/price variance analysis; proof-of-delivery and claim-document workflows are advertised. | Shortage disputes and supporting-document workflows already exist in enterprise products. | We have not verified suitability, availability, or cost for the exact target SME segment. |

### Sources
- Zoho Books invoice management: https://www.zoho.com/in/books/accounting-software/invoice-management/
- Zoho Books India plans: https://www.zoho.com/in/books/pricing/
- Medius purchase-to-pay: https://www.medius.com/solutions/purchase-to-pay/
- Medius AP automation: https://www.medius.com/solutions/medius-accounts-payable-automation/
- HighRadius deductions management: https://www.highradius.com/software/order-to-cash/deductions-management/
- HighRadius proof-of-delivery automation: https://www.highradius.com/software/order-to-cash/collections-management/proof-of-delivery-automation/

These are vendor-authored pages. They establish that capabilities are advertised, not independent product quality, customer outcomes, or availability in every plan.

## Our narrow wedge to test
**An evidence-first investigation workspace for one short-delivery dispute, designed around transparent source trails and explicit uncertainty rather than broad accounting automation.**

The potential differentiation has four parts:
1. **Claim-first:** begin from the actual disputed statement, not just a preconfigured mismatch rule.
2. **Evidence trace:** every finding opens the exact source row(s) and shows the calculation.
3. **Uncertainty is a first-class result:** conflicting, missing, and ambiguous evidence are not forced into a binary “fraud/no fraud” verdict.
4. **Low-setup demo workflow:** accept a small, documented CSV/JSON contract instead of promising integrations.

These are design choices we can implement. They are not proof that no competitor offers them.

## How to avoid becoming generic
Do not pitch:
- “AI-powered invoice management.”
- “Revolutionizing finance with AI.”
- “Fraud detection for SMEs.”
- “A single platform for all business disputes.”
- “First/only/unique solution.”
- “Saves X% or resolves disputes Y times faster” without measured evidence.

Pitch:
“ProofTrail turns a short-delivery complaint into a traceable investigation: it extracts the claim, connects the relevant transaction records, verifies the arithmetic deterministically, and shows which conclusions are supported, conflicting, or unresolved.”

## What could make the idea genuinely stronger
Before claiming a differentiator, test these hypotheses:
- H1: Intended users currently spend meaningful time locating and comparing records for these disputes.
- H2: Their evidence is spread across multiple record types and references, not already fully resolved by one existing system.
- H3: A claim-first evidence trace is easier to audit than the user's current workflow.
- H4: AI extraction/matching helps with informal messages or inconsistent references beyond a rules-only form.
- H5: The intended user can provide structured exports without an expensive implementation.

A 3–5 person informal interview sample can guide the prototype but is not statistically representative. Record actual quotes/observations accurately; never invent interview evidence.

## Judge-facing differentiation statement
“Matching invoices and receipts is not new. Our prototype focuses on the investigation step after a short-delivery claim: it traces each claim to the supplied records, separates record-backed facts from conflicts and missing evidence, verifies the calculations with deterministic code, and abstains when the records cannot establish an answer. We are testing whether AI makes the investigation easier than a rules-only workflow.”

## Competitive positioning conclusion
Current status: **differentiation hypothesis, not validated moat**. A hackathon can demonstrate technical discipline and measurable prototype behavior; it cannot prove a durable business moat in eight hours.

# 02 — Differentiation & Competitor Map

## 1. Purpose of This Document

This document defines how ProofTrail should be positioned against existing products, what the public competitor evidence actually establishes, where our proposed differentiation might come from, and what we still need to validate.

The objective is **not to prove that ProofTrail has no competitors**. The objective is to identify a narrow, credible product hypothesis that we can implement and test during the hackathon.

We must distinguish four things throughout this document:

- **Verified public capability:** A vendor publicly describes a feature or workflow.
- **Product hypothesis:** A specific workflow or interaction design that we believe could be useful.
- **Unverified assumption:** Something about users, competitors, or the market that we have not established.
- **Prototype evidence:** Results from our own implementation and controlled evaluation.

These categories must not be mixed. A competitor's public feature page does not establish the quality of its implementation, and a successful synthetic test does not establish market demand.

**Core principle: do not invent a competitor gap to make the pitch sound innovative.**

---

## 2. Product Context: What ProofTrail Is Trying to Improve

ProofTrail is a proposed evidence-first investigation workspace for a narrow class of business disputes: **short-delivery claims raised against small B2B suppliers, wholesalers, or distributors.**

The initial scenario is straightforward:

A supplier invoices a buyer for a shipment. The buyer later claims that fewer units were received and deducts money from the payment. The supplier needs to investigate the claim using the available purchase order, invoice, dispatch record, proof of delivery or receipt, payment entry, and any relevant credit note or adjustment.

The records may contain different quantities, identifiers, dates, descriptions, or references. The investigation requires identifying the relevant records, comparing them, checking the arithmetic, and determining which questions remain unanswered.

ProofTrail aims to make that investigation traceable.

### The problem we are investigating

The following is our **target-user hypothesis**, not an established finding about every small business:

- Relevant records may be distributed across spreadsheets, accounting exports, dispatch records, receipt documents, and informal messages.
- A disputed claim may not map neatly to one invoice number or shipment reference.
- A person investigating the dispute may need to locate records, compare quantities and amounts, identify missing documentation, and explain the result to another person.
- Existing accounting or enterprise systems may already solve some or all of this workflow for particular users.

We have not yet established how frequently the problem occurs, how much time it consumes, or whether the intended users would adopt a separate investigation tool.

### What we are not claiming

ProofTrail is not claiming to invent:

- Invoice matching.
- Purchase-order matching.
- Goods-receipt matching.
- Payment reconciliation.
- Deduction management.
- Proof-of-delivery retrieval.
- Exception management.
- AI-assisted document extraction.
- Financial dispute workflows.

These capabilities already appear in the public positioning of established products.

Our proposed focus is narrower: **investigating one short-delivery claim through source-linked evidence, deterministic checks, and explicit uncertainty.**

Whether this focus provides a meaningful advantage remains to be tested.

---

## 3. Competitor Map: Publicly Described Capabilities

**Research snapshot:** 17 October 2026, based on the public vendor pages listed below.

The following is a desk-research comparison, not a hands-on product evaluation. Vendor pages establish advertised capabilities; they do not independently establish performance, usability, price suitability, or availability in every plan and region.

| Product/vendor | Publicly described capabilities | Implication for ProofTrail | What remains unverified |
|---|---|---|---|
| Zoho Books | Invoicing, payment tracking, partial and offline payments, credit notes, purchase and sales orders, and related accounting workflows. | Basic invoice/payment tracking and access to transaction records are not credible differentiators. | We have not tested every plan or workflow, or established whether a particular short-delivery investigation can or cannot be completed inside Zoho Books. |
| Medius | Purchase-to-pay and accounts-payable automation, invoice capture, invoice matching against purchase orders and goods receipts, and exception-handling workflows. | Matching invoices, purchase orders, and receipts is established functionality. | We have not performed a hands-on comparison or established relative usability, cost, implementation effort, or suitability for small Indian suppliers. |
| HighRadius | Deductions-management workflows, shortage and price-variance analysis, and proof-of-delivery or supporting-document automation. | Shortage disputes and evidence-document workflows already appear in enterprise-oriented product offerings. | We have not verified the suitability, availability, price, or implementation requirements of these products for our exact target segment. |

### 3.1 Zoho Books

**Public sources**

- Invoice management: https://www.zoho.com/in/books/accounting-software/invoice-management/
- India pricing and plans: https://www.zoho.com/in/books/pricing/

**What this establishes**

Zoho Books publicly describes accounting workflows involving invoices, payments, and related financial records.

**What this means for our product**

ProofTrail should not claim that small businesses lack digital invoice and payment management. Some intended users may already manage their records effectively in accounting software.

Our potential value would need to come from how a particular disputed claim is investigated—not from simply storing invoices or showing payment status.

**What we have not established**

We have not conducted a complete workflow test in Zoho Books using the same synthetic short-delivery scenario that ProofTrail will use. We must not claim that Zoho cannot handle this scenario.

### 3.2 Medius

**Public sources**

- Purchase-to-pay: https://www.medius.com/solutions/purchase-to-pay/
- Accounts-payable automation: https://www.medius.com/solutions/medius-accounts-payable-automation/

**What this establishes**

Medius publicly describes invoice-processing and matching capabilities involving purchase orders, goods receipts, and exception workflows.

**What this means for our product**

A comparison among an invoice, a purchase order, and a receipt is not, by itself, a differentiator. Neither is the ability to flag a mismatch.

ProofTrail must demonstrate a more specific investigation experience if we want to argue that our approach is useful.

**What we have not established**

We have not tested Medius directly, verified the full range of its matching behavior, or established whether it is practical or economical for our intended users.

### 3.3 HighRadius

**Public sources**

- Deductions management: https://www.highradius.com/software/order-to-cash/deductions-management/
- Proof-of-delivery automation: https://www.highradius.com/software/order-to-cash/collections-management/proof-of-delivery-automation/

**What this establishes**

HighRadius publicly describes deduction-management and proof-of-delivery-related workflows, including the use of supporting documents to investigate payment deductions.

**What this means for our product**

ProofTrail cannot credibly claim to be the first product to investigate shortages, retrieve supporting evidence, or assist with deductions.

Our possible distinction is the deliberate focus of the prototype: one claim, a small documented dataset, visible source references, inspectable calculations, and an explicit unresolved state when the available records do not establish an answer.

**What we have not established**

We have not verified the exact suitability, availability, price, or implementation requirements of HighRadius for our target segment. We also have not established that its existing workflows lack the design choices proposed for ProofTrail.

---

## 4. Competitive Conclusion: What We Can and Cannot Say

### What public research supports

- Accounting products already support invoice and payment workflows.
- Purchase-to-pay products already support invoice matching and exception workflows.
- Enterprise finance products already advertise deduction investigation and proof-of-delivery workflows.
- Therefore, the broad concept of matching business records to investigate a payment discrepancy is not new.

### What public research does not support

Our current research does not establish that:

- No competitor offers a claim-first investigation workspace.
- Existing products cannot display source-linked findings.
- Existing products do not handle ambiguous evidence.
- Small Indian suppliers are underserved by all available products.
- Our proposed workflow is easier, faster, cheaper, or more accurate.
- Users will pay for ProofTrail.
- ProofTrail has a defensible market moat.

These claims require additional research, hands-on comparisons, or user evidence.

**Current competitive status: relevant competitors exist; our proposed differentiation remains a hypothesis.**

---

## 5. The Narrow Wedge We Intend to Test

### Proposed positioning

**An evidence-first investigation workspace for one short-delivery dispute, designed around transparent source trails and explicit uncertainty rather than broad accounting automation.**

This is a product-design hypothesis, not a claim of exclusive market ownership.

The proposed wedge has four components.

### 5.1 Claim-first investigation

The workflow starts with the actual disputed statement, such as:

> “We received only 80 units, so we deducted the value of the missing 20 units from the payment.”

The system attempts to extract structured details from the claim, including:

- Claimed shortage quantity.
- Item or product reference, if stated.
- Invoice, order, or shipment reference, if stated.
- Relevant dates, if stated.
- Claimed deduction amount, if stated.
- Missing or ambiguous information.

The extracted fields must preserve unknown values as unknown. The system must not invent a shipment identifier, invoice number, quantity, or deduction reason.

The system then searches the supplied structured records for candidate matches.

**Why this matters:** the investigation begins with the question that needs to be resolved, rather than requiring the user to start by manually finding and opening every potentially relevant record.

**What remains to be proven:** whether this claim-first workflow materially improves the user's current process compared with a structured form or existing accounting workflow.

### 5.2 Source-linked evidence trace

Each finding should connect to the exact records supporting it.

For example:

- Invoice `INV-104`: 100 units billed.
- Dispatch record `DSP-104`: 100 units recorded as dispatched.
- Receipt record `GRN-104`: 80 units recorded as received.
- Calculated quantity difference: 20 units.
- Conditional value calculation: 20 units × ₹150 per unit = ₹3,000, assuming the applicable unit price is ₹150 and the records refer to the same item, shipment, and compatible units.

The user should be able to inspect the source records and the arithmetic instead of receiving only a generated paragraph.

**Why this matters:** a reviewer should be able to verify how the system arrived at a finding.

**What remains to be proven:** whether users find this presentation more useful or easier to audit than their current tools.

### 5.3 Explicit uncertainty instead of forced verdicts

ProofTrail should distinguish between evidence that supports a claim, evidence that conflicts with it, records that were not found in the supplied dataset, and cases that remain unresolved.

The initial finding states are:

- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

These states describe the relationship between a claim and the supplied evidence. They do not establish legal liability, intent, fraud, or the complete truth of a business dispute.

For example, if no credit note is found in the uploaded dataset, the system may report:

> “No linked credit note was found in the records provided.”

It must not report:

> “No credit note exists.”

The second statement extends beyond the evidence available to the system.

Similarly, a dispatch record showing 100 units does not independently prove that 100 units were received. A partial payment does not independently prove why the payment was partial.

**Why this matters:** an investigation tool must show the limits of its evidence, not conceal those limits behind confident language.

**What remains to be proven:** whether this explicit uncertainty makes the workflow more trustworthy or useful to actual users.

### 5.4 Low-setup prototype workflow

The hackathon version will accept a documented, limited set of structured records through CSV or JSON rather than attempting to integrate with every accounting, banking, messaging, logistics, or enterprise system.

The initial record categories are:

- Purchase orders.
- Invoices.
- Dispatch records.
- Proof of delivery or receipt records.
- Payments.
- Credit notes or adjustments.

Each record should have a stable identifier and the relevant dates, quantities, amounts, party references, transaction references, units, and currency where applicable.

The prototype must validate inputs and report missing or incompatible fields instead of silently assuming that all records match.

**Why this matters:** a small input contract reduces implementation complexity and allows us to build and evaluate a complete workflow within eight hours.

**What remains to be proven:** whether intended users can realistically export and provide these records without significant manual work or costly setup.

---

## 6. The Role of AI: Where It May Add Value

ProofTrail should not use AI merely because the hackathon is AI-themed. AI must have a defined job, and its contribution must be evaluated.

### Appropriate AI responsibilities

**A. Claim extraction**

Convert an informal dispute message into structured fields while preserving unknowns and the original wording needed for review.

**B. Candidate record matching**

Suggest which supplied records may relate to the claim when references are inconsistent, incomplete, or expressed differently.

Candidate matches must include their basis and must not automatically become confirmed matches.

**C. Explanation generation**

Turn verified findings into a concise explanation that refers only to the evidence and calculations provided by the deterministic investigation layer.

**D. Next-check suggestions**

Suggest reasonable follow-up checks based on identified gaps, such as requesting a missing receipt record or confirming whether a credit note exists outside the supplied dataset.

These suggestions are prompts for human verification, not evidence that the suggested event occurred.

### Responsibilities that remain deterministic

Ordinary code—not a language model—must control:

- Schema and field validation.
- Quantity and amount arithmetic.
- Unit and currency compatibility checks.
- Explicit comparison rules.
- Finding-state assignment under documented rules.
- Source record identifiers and citation integrity.
- Evaluation metrics and test outcomes.

The model must not invent records, IDs, citations, calculations, or factual explanations.

A rules-only fallback should still allow the user to investigate a dispute if the AI service is unavailable.

### The central AI hypothesis

**AI may make claim interpretation and candidate record selection more useful when the input is informal or references are inconsistent.**

This is not yet a result. It must be tested against a rules-only baseline using labelled cases.

If AI does not improve a clearly defined task, we should narrow its role or remove the unsupported AI claim.

---

## 7. Differentiation Hypotheses to Validate

We will use five explicit hypotheses.

### H1 — The investigation is a meaningful pain point

**Hypothesis:** intended users spend meaningful time locating, comparing, and explaining records for short-delivery disputes.

**How to investigate:**

Ask potential users to describe a recent real dispute, what records they used, how they located those records, what they had to calculate, and what delayed the resolution.

**Evidence to record:**

- Actual steps performed.
- Record types involved.
- Reported frequency.
- Reported time or effort, clearly labelled as self-reported.
- Existing tools and workarounds.
- Problems the user could not resolve easily.

Do not convert a few interviews into a population-wide statistic.

### H2 — Relevant evidence is fragmented for some target users

**Hypothesis:** for at least some intended users, relevant records are spread across multiple files, tools, or inconsistent references.

**How to investigate:**

Ask users to walk through how they would assemble the evidence for a recent dispute. Where possible, inspect a redacted or synthetic representation of the workflow with permission.

**Evidence to record:**

- Actual record locations.
- Missing or inconsistent identifiers.
- Whether one existing system already provides the required view.
- How much manual reconciliation remains.

Do not assume that every small supplier uses disconnected spreadsheets or that every large system is inaccessible.

### H3 — The evidence trace improves auditability

**Hypothesis:** showing each finding alongside source records, calculations, assumptions, and unresolved questions makes the investigation easier to inspect.

**How to investigate:**

Compare a conventional summary with the ProofTrail evidence-trace view using the same synthetic case. Ask reviewers to identify the supporting records, verify the calculation, and identify what remains unknown.

**Possible measurements:**

- Correct identification of supporting records.
- Correct verification of arithmetic.
- Correct recognition of unresolved questions.
- Time required to complete the review, if measured consistently.

A positive result in a small prototype test would support further investigation, not prove general superiority.

### H4 — AI improves the workflow beyond rules-only logic

**Hypothesis:** AI extraction and candidate matching improve handling of informal claims or inconsistent references compared with a rules-only structured workflow.

**How to investigate:**

Evaluate both approaches against the same labelled cases.

**Possible measurements:**

- Field-level extraction accuracy.
- Correct candidate match rate.
- Finding classification correctness.
- Source attribution correctness.
- Unsupported assertion count.
- Correct abstention on ambiguous cases.

If the hybrid approach does not improve a defined task, we must report that honestly and consider reducing the AI scope.

### H5 — The workflow can operate with a manageable input burden

**Hypothesis:** intended users can supply enough structured data through documented exports or small files for the investigation to be useful.

**How to investigate:**

Ask users which records they can actually export, which identifiers are available, and which fields would require manual cleanup.

**Evidence to record:**

- Available export formats.
- Required fields that are commonly missing.
- Manual preparation effort.
- Incompatible units, naming conventions, or references.
- Whether the proposed CSV/JSON contract is realistic.

A working synthetic CSV upload does not establish that real users can supply clean data with little effort.

---

## 8. Validation Plan for the Hackathon

The eight-hour prototype cannot validate a durable business moat. It can test whether our proposed workflow behaves correctly on controlled examples and whether AI provides measurable value within that evaluation.

### 8.1 Build a labelled synthetic test set

Target approximately 24–30 synthetic cases if time permits, with at least 20 cases as a minimum practical target.

Include:

- A clean transaction with no discrepancy.
- A short-delivery claim supported by a receipt record.
- A claim that conflicts with the available receipt.
- Missing receipt evidence.
- Missing or unlinked credit notes.
- Partial payments with an unknown reason.
- Ambiguous invoice or shipment references.
- Duplicate or conflicting records.
- Incompatible units or currencies.
- Informal claim wording.
- Inputs designed to tempt the model to invent a record or accuse a party of fraud.

The cases must be labelled according to documented expected behavior before evaluation.

Synthetic records are appropriate for controlled testing. They are not a substitute for real-world user evidence.

### 8.2 Compare the approaches

**Baseline A — Rules-only workflow**

The user provides structured fields, and deterministic rules check the supplied records.

**Approach B — Hybrid ProofTrail**

AI extracts claim fields and suggests candidate matches; deterministic logic performs validation, arithmetic, and finding-state assignment.

**Optional comparator — LLM-only output**

If time permits, compare an unconstrained model-generated assessment to demonstrate why source validation and deterministic checks matter. This is optional and should not delay the working hybrid workflow.

### 8.3 Report measurable outcomes

Report actual counts, denominators, and failure examples for:

- Extraction field accuracy.
- Candidate matching accuracy.
- Finding classification correctness.
- Source attribution correctness.
- Arithmetic correctness.
- Unsupported factual assertions.
- Correct abstention when evidence is insufficient.
- Hybrid performance compared with the rules-only baseline.

Do not choose a flattering metric after seeing the results and present it as the original evaluation plan.

Do not claim that synthetic-case performance establishes production accuracy, real-world impact, user adoption, or financial benefit.

### 8.4 Preserve honest evaluation

Where feasible, reserve a small subset of cases from the examples used during development.

Document failures, including cases where:

- The model selects the wrong record.
- References are too ambiguous to match.
- The system makes an unsupported inference.
- The evidence is incomplete.
- The rules-only baseline performs just as well or better.

A visible, well-understood limitation is more credible than a polished demo that hides failure cases.

---

## 9. What ProofTrail Should Not Claim

The following claims are prohibited unless supported by appropriate evidence:

- “The first AI dispute-investigation platform.”
- “The only solution for small suppliers.”
- “Fraud detection for SMEs.”
- “Automatically proves who is right.”
- “Eliminates payment disputes.”
- “Works with every accounting system.”
- “Guaranteed accurate.”
- “Production-ready.”
- “Saves 80% of investigation time.”
- “Resolves disputes X times faster.”
- “No competitor offers this workflow.”
- “Users need this product” based only on team intuition.
- “AI is more accurate than rules” without a controlled comparison.

We should also avoid claiming that a missing record proves that an event did not occur.

**Preferred language:** “The prototype identifies discrepancies in the supplied records and highlights what remains unresolved.”

---

## 10. Recommended Positioning and Messaging

### One-line pitch

**ProofTrail helps small B2B suppliers investigate short-delivery disputes by connecting transaction records, checking discrepancies deterministically, and showing what the available evidence supports, conflicts with, or cannot establish.**

### Short pitch

A buyer disputes a delivery and deducts money from a payment. The supplier needs to compare the invoice, dispatch record, receipt, payment entry, and any relevant adjustments. ProofTrail takes the dispute statement, extracts the claim, suggests relevant records, checks the numbers using deterministic rules, and creates a traceable investigation with explicit uncertainty. It does not declare fraud or automatically decide who is legally right.

### Judge-facing differentiation statement

“Matching invoices and receipts is not new. Our prototype focuses on the investigation step after a short-delivery claim. It traces findings to the supplied records, separates record-backed facts from conflicts and missing evidence, verifies calculations with deterministic code, and abstains when the available records cannot establish an answer. We are testing whether AI makes claim interpretation and record selection more useful than a rules-only workflow.”

### What makes this positioning credible

- It acknowledges established competitors.
- It identifies one narrow workflow.
- It describes observable product behavior rather than vague AI benefits.
- It separates AI-assisted interpretation from deterministic verification.
- It makes uncertainty visible.
- It provides a measurable evaluation plan.
- It avoids unsupported market, accuracy, and ROI claims.

---

## 11. Demo Scenario: Demonstrating the Proposed Wedge

Use one controlled synthetic case to demonstrate the product.

### Supplied records

| Record | Supplied information |
|---|---|
| Invoice `INV-104` | 100 units at ₹150 per unit; invoice line total ₹15,000 |
| Dispatch `DSP-104` | 100 units recorded as dispatched |
| Receipt `GRN-104` | 80 units recorded as received |
| Payment `PAY-104` | ₹12,000 recorded as paid |
| Credit notes | No linked credit note found in the supplied dataset |

Assume the records refer to the same item and shipment, and that the units and price are comparable. These assumptions must be stated or checked, not silently applied.

### Expected behavior

1. Extract the buyer's short-delivery claim.
2. Suggest the relevant invoice, dispatch, receipt, and payment records.
3. Show the invoice quantity of 100 units and receipt quantity of 80 units.
4. Calculate a 20-unit difference.
5. Show the conditional value of that difference: 20 × ₹150 = ₹3,000, before taxes, discounts, or other adjustments, and assuming the applicable unit price is ₹150.
6. Show that the dispatch record reports 100 units but does not independently establish what the buyer received.
7. Show that the payment entry records ₹12,000 but does not, by itself, establish why the payment was partial.
8. Report that no linked credit note was found in the supplied dataset.
9. Identify the remaining questions for human verification.

### Expected conclusion

The available records show a quantity discrepancy between the invoice and the receipt record. Under the stated assumptions, the difference is 20 units, with a conditional unit-price value of ₹3,000 before other adjustments.

The records provided do not establish the full reason for the payment amount or whether additional delivery, credit, or payment arrangements exist outside the dataset.

**The system must not conclude that fraud occurred or that either party is definitively at fault.**

### Why this demo matters

The demo should show more than a chatbot explaining a spreadsheet. It should visibly connect a claim to specific records, show inspectable calculations, identify limitations, and preserve unresolved questions.

This demonstrates the proposed product behavior. It does not establish that the workflow is unique in the market.

---

## 12. What Could Strengthen the Idea Beyond the Prototype

If the initial workflow performs well, future validation could investigate:

- Whether users repeatedly face this particular dispute type.
- Whether they can supply structured records without excessive cleanup.
- Whether a claim-first interface improves review compared with their existing tools.
- Whether the system can handle inconsistent references without unacceptable false matches.
- Whether source-linked explanations reduce the effort needed to verify a finding.
- Whether users want a standalone tool or prefer this capability within their existing accounting system.
- Whether a specific customer segment has a sufficiently frequent and costly problem to justify a product.

These are research questions, not committed features or established market opportunities.

Potential future integrations should be considered only after identifying which records users actually have and what their existing workflow lacks.

---

## 13. Eight-Hour Hackathon Implications

Competitive positioning must influence what we build—not merely how we describe it.

### P0 — Must demonstrate

- One short-delivery dispute workflow.
- Structured synthetic transaction records.
- AI-assisted claim extraction with reviewable fields.
- Candidate record suggestions with visible source references.
- Deterministic quantity and amount calculations.
- Explicit finding states and uncertainty.
- A traceable evidence view.
- At least one rules-only versus hybrid evaluation.
- Tests for ambiguous and misleading inputs.
- A reliable demonstration of supported, conflicting, and unresolved evidence.

### P1 — Only if the core works

- Better ranking of ambiguous candidate records.
- Additional informal-language test cases.
- Exportable investigation summaries.
- A small additional set of adversarial tests.

### Out of scope for the initial prototype

- General-purpose invoice processing.
- Arbitrary PDF and OCR pipelines.
- Production integrations with accounting, banking, messaging, or logistics platforms.
- Automated settlement or collection.
- Legal conclusions or fraud detection.
- Multiple dispute types.
- Blockchain or zero-knowledge features.
- Multi-agent orchestration.
- Complex vector-database infrastructure.
- Claims of production deployment, commercial readiness, or verified ROI.

The product should prove one complete investigation path before expanding its surface area.

---

## 14. Open Questions and Evidence Gaps

The following questions remain open:

1. How frequently do the intended users encounter short-delivery disputes?
2. What is their current investigation process?
3. Which records are available, and where are they stored?
4. How often do transaction references conflict or go missing?
5. Do existing accounting or enterprise tools already handle the user's real workflow adequately?
6. Does a claim-first investigation view improve auditability?
7. Does AI improve extraction or candidate matching over a rules-only baseline?
8. Can users provide the proposed structured input with manageable effort?
9. Which user segment, if any, would benefit enough to adopt a separate tool?
10. What additional evidence would be needed before making any commercial or impact claim?

We must not fill these gaps with invented interview results, assumed customer behavior, or unsupported competitor comparisons.

---

## 15. Final Competitive Position

**Current status: differentiation hypothesis, not a validated moat.**

ProofTrail is not differentiated simply because it uses AI, matches records, or investigates payment discrepancies. Those capabilities overlap with established product categories.

Our proposed wedge is the combination of:

- A narrow, claim-first short-delivery investigation.
- Source-linked findings that can be inspected.
- Deterministic arithmetic and validation.
- Explicit handling of conflicting, missing, and ambiguous evidence.
- AI-assisted extraction and candidate matching evaluated against a rules-only baseline.
- A small, documented input contract suitable for an eight-hour prototype.

These are product choices we can implement and test. Whether they offer meaningful user value or a defensible market distinction remains unproven.

**Our goal for the hackathon is not to claim that ProofTrail has defeated established finance software. It is to demonstrate a carefully scoped investigation workflow, measure its behavior on labelled cases, expose its limitations, and show exactly where AI helps—or fails to help.**
# 01 — Product Brief: ProofTrail
**Version:** 1.1 — Expanded product definition  
**Event context:** AIMPACT 2026 · AI for Business & Commerce · 8-hour hackathon  
**Document status:** Working product specification. It contains proposed decisions and hypotheses; it does not establish market validation, completed implementation, or measured results.

---

## 1. Product in One Sentence

**ProofTrail helps a small B2B supplier investigate a disputed delivery or payment by connecting relevant transaction records, checking discrepancies deterministically, and producing a source-linked explanation of what the available evidence supports, conflicts with, or cannot establish.**

### Short pitch
When a buyer says a delivery was short or deducts money from an invoice, ProofTrail turns the dispute message and supplied transaction records into a traceable investigation: it extracts the claim, identifies relevant records, verifies quantities and amounts, exposes conflicts or missing evidence, and suggests what a human should verify next.

### What ProofTrail is not
ProofTrail is not:
- a generic “chat with your invoices” chatbot;
- a replacement for accounting or ERP software;
- an automated fraud detector or legal adjudicator;
- a guarantee that the supplier or buyer is correct;
- a full document-ingestion or dispute-management platform in eight hours.

**Core principle:** ProofTrail reports what the supplied records establish and what remains uncertain. It must never confuse a record with unquestionable truth.

---

## 2. The Problem We Are Targeting

### 2.1 The narrow problem
A small B2B supplier invoices a buyer for goods. The buyer later says that fewer goods were received, disputes the invoice, or deducts an amount from a payment. The supplier must work out which order, invoice, dispatch, receipt, payment, or credit note relates to the complaint.

The investigation may require comparing:
- purchase order quantities;
- invoice line quantities and prices;
- dispatch or packing records;
- proof of delivery / receipt records;
- payments and remittance references;
- credit notes or adjustments;
- the buyer’s dispute message.

The difficulty we intend to investigate is not arithmetic alone. It is the work of connecting a claim to the right transaction records, understanding which records agree or disagree, and identifying what cannot yet be concluded.

### 2.2 What we know versus what we hypothesize

**Established product-design facts**
- Different record types can describe different stages of a transaction.
- A dispatch record and a recipient’s receipt record are not equivalent evidence.
- A partial payment does not by itself prove a delivery shortage or dishonest conduct.
- Existing accounting and enterprise dispute products advertise related capabilities; therefore, invoice matching and deduction management are not novel by themselves.

**Hypotheses requiring validation**
- The target small supplier encounters this workflow often enough for a dedicated investigation aid to matter.
- Their records are sufficiently fragmented or inconsistently referenced to make the investigation burdensome.
- A claim-first, source-linked investigation view is more convenient or auditable than their current workflow.
- The target user can provide structured exports or a small set of records without disproportionate setup.
- AI can improve claim interpretation or record selection beyond a rules-only form.

Do not turn these hypotheses into factual marketing claims until evidence is gathered.

### 2.3 Problem statement
**When a small B2B supplier receives a short-delivery complaint or related payment deduction, they need a reliable way to connect the claim to the relevant transaction records, identify inconsistencies, and determine what evidence to verify next—without being pushed into an unsupported conclusion.**

### 2.4 Why start with short delivery?
Short delivery is narrow enough to model with a few related record types and to evaluate in a short hackathon. It also creates a meaningful distinction between:
- what the supplier says was dispatched;
- what the buyer says was received;
- what a receipt record actually records;
- what the invoice charges;
- what the payment ledger records.

This is a scope choice for a prototype, not a claim that short-delivery disputes are the most common or most underserved dispute category.

---

## 3. Target User and Context

### 3.1 Primary target user (hypothesis)
A small Indian B2B supplier, wholesaler, or distributor that:
- sells goods to business buyers;
- issues invoices and tracks payments;
- may maintain some transaction records in spreadsheets, accounting exports, delivery paperwork, or messages;
- occasionally receives disputed quantities or payment deductions;
- does not have a dedicated deductions/dispute analyst.

The exact business category, business size, dispute frequency, and current tools remain open until interviews or workflow observation support them.

### 3.2 User role in the workflow
The primary user is the person investigating the dispute, not necessarily the person who caused or reported it. They might be a business owner, accounts employee, operations coordinator, or sales/admin employee.

### 3.3 Secondary stakeholders
- **Buyer/accounts contact:** may provide the claim, receipt confirmation, or payment deduction explanation.
- **Dispatch/warehouse staff:** may provide dispatch or packing records.
- **Accountant/bookkeeper:** may clarify invoice, payment, and credit-note entries.

These are possible stakeholders, not confirmed users or personas.

### 3.4 Initial user journey
1. A buyer reports a shortage or deducts money.
2. The supplier identifies the relevant order/invoice/shipment.
3. The supplier gathers dispatch, receipt, payment, and adjustment records.
4. The supplier compares the records and calculates the discrepancy.
5. The supplier identifies missing or contradictory evidence.
6. The supplier decides what to verify or ask for before responding.

ProofTrail supports steps 2–5 and suggests checks for step 6. It does not send a message, negotiate, collect debt, or decide legal responsibility.

---

## 4. Narrow Initial Job-to-Be-Done

> “When a buyer says the delivery was short and deducts money from payment, help me assemble the relevant records and understand what needs checking before I respond.”

### Trigger
A buyer disputes the quantity received or explains a payment deduction as a delivery shortage.

### User’s desired outcome
The user should leave with:
- a clear statement of the claim;
- the relevant records and links between them;
- correct quantity/amount calculations;
- an explanation of what records agree or conflict;
- an explicit list of unresolved questions;
- a practical next verification step.

### Not the promised outcome
ProofTrail does not promise to recover money, prove misconduct, settle a dispute, or reduce resolution time by a particular percentage.

---

## 5. MVP Inputs and Supported Data

The hackathon MVP should use **structured CSV/JSON records and a dispute message**. Arbitrary PDF/OCR ingestion is out of scope.

### 5.1 Input record types

| Record type | Minimum useful fields | Why it matters |
|---|---|---|
| Dispute message | dispute ID, original message, optional stated invoice/shipment reference | Captures the actual claim in the buyer’s words |
| Purchase order | record ID, PO ID, buyer/supplier IDs, item ID, ordered quantity, unit, agreed price if available, date | Describes what was ordered |
| Invoice | record ID, invoice ID, PO/shipment references, item ID, invoiced quantity, unit, unit price, line amount, currency, date | Describes what was charged |
| Dispatch | record ID, shipment ID, invoice/PO reference, item ID, dispatched quantity, unit, date | Describes what the supplier’s dispatch record says left |
| Receipt / proof of delivery | record ID, shipment/invoice reference, item ID, received quantity, unit, signature/confirmation indicator if available, date | Describes what the supplied receipt record says was received |
| Payment | record ID, invoice/reference, amount, currency, date, payment reference | Describes the payment entry in the supplied ledger |
| Credit note / adjustment | record ID, invoice reference, amount/quantity if applicable, reason, currency, date | Captures recorded adjustments |

### 5.2 Data contract principles
- Every record needs a stable `record_id`.
- Keep original source fields where possible; do not overwrite source data with model interpretations.
- Keep currency and units explicit.
- Do not compare quantities across incompatible units without a documented conversion.
- Link records by explicit references when available.
- A fuzzy match is a candidate, not a confirmed link.
- Record the reason a candidate was matched.
- A missing record in the supplied dataset is not proof that the record does not exist elsewhere.
- Use synthetic data for the demo; do not send real supplier/customer financial data to an external model.

### 5.3 MVP input limitations
The prototype will not handle every messy real-world export, handwritten receipt, photo, PDF, email inbox, WhatsApp attachment, or accounting platform. If a real workflow requires those inputs, that is a future product and integration question—not something to imply is solved by a CSV demo.

---

## 6. Product Outputs

Each investigation should produce a compact, auditable brief.

### 6.1 Required output fields
1. **Claim summary:** the issue extracted from the original dispute message.
2. **Structured claim:** issue type, quantity/amount if stated, units/currency, and mentioned references.
3. **Candidate record matches:** relevant records and why each was selected.
4. **Deterministic checks:** arithmetic, quantity differences, payment entries, credit notes, and linkage checks.
5. **Findings:** each finding has a status, explanation, source record IDs, calculations, assumptions, and limitations.
6. **Unresolved questions:** the facts that cannot be established from the supplied records.
7. **Suggested verification steps:** practical next checks, selected from predefined templates or generated from validated gaps.
8. **Human review indicator:** where multiple matches, conflicting records, or missing data prevent a confident result.

### 6.2 Allowed finding states
- `SUPPORTED_BY_RECORDS` — the specified statement is supported by the cited supplied records under stated assumptions.
- `CONFLICTING_RECORDS` — two or more supplied records or a record and the claim disagree in a relevant way.
- `NOT_FOUND_IN_PROVIDED_DATA` — the needed record was not found in the dataset supplied to this investigation.
- `UNRESOLVED` — the available evidence is insufficient, ambiguous, or not safely linkable to make the intended comparison.

These states describe the relationship between a claim and the supplied records. They do not determine legal truth, intent, or fault.

### 6.3 Every finding should show
- what is being asserted;
- source record IDs;
- the exact values used;
- the calculation, if applicable;
- the link/matching rationale;
- assumptions;
- what the records do not establish;
- the next verification step.

A finding without traceable source records should be blocked or marked unresolved.

---

## 7. Core Product Loop

**Dispute message → claim extraction → candidate record matching → deterministic checks → evidence trace → unresolved questions → human review**

### Step 1: Capture the dispute
Preserve the original message verbatim. Do not replace it with an AI paraphrase.

### Step 2: Extract the claim
AI proposes structured fields, such as issue type, claimed quantity, amount, invoice ID, shipment ID, and supporting text span. Unknown fields remain `null`; ambiguity triggers human review.

### Step 3: Identify candidate records
Use hard constraints first: explicit IDs, item IDs, transaction references, units, dates, and party references. AI may suggest candidates, but it cannot silently turn a weak similarity into a confirmed match.

### Step 4: Verify deterministically
Code validates units and currencies, computes arithmetic, compares linked records, and applies explicit status rules. The language model must not be the authority for final totals.

### Step 5: Build the evidence trace
Show each claim alongside the records that support, conflict with, or fail to resolve it. Let the user open a source record and inspect its fields.

### Step 6: State uncertainty
Keep conflicting or ambiguous cases unresolved. Explain what information would help resolve them.

### Step 7: Recommend the next check
Examples:
- verify whether the receipt covers the entire shipment;
- check for a later/partial delivery;
- confirm whether the invoice and receipt refer to the same item and unit;
- check whether a credit note exists in the relevant records;
- verify whether a payment was partial for a reason unrelated to delivery.

### Step 8: Human review
The user remains responsible for deciding what to ask, verify, or communicate.

---

## 8. AI Role: Useful, Limited, and Measurable

### 8.1 AI responsibilities
AI is used for tasks where language and ambiguity create friction:
1. **Claim extraction:** convert an informal dispute message into a validated structured claim.
2. **Candidate matching assistance:** suggest likely records and explain which identifiers or fields support the suggestion.
3. **Plain-language explanation:** explain already-verified findings without adding new facts.
4. **Next-step suggestions:** map detected gaps to a predefined verification checklist.

### 8.2 Non-AI responsibilities
Deterministic code is responsible for:
- schema validation;
- required-field checks;
- identifier and transaction-link validation;
- unit/currency compatibility checks;
- quantity and monetary calculations;
- duplicate/conflicting record checks where rules are defined;
- finding-state assignment;
- source record IDs and citation integrity;
- evaluation and metrics.

### 8.3 Why not use AI for everything?
Free-form model output can sound confident while making arithmetic errors, inventing references, or confusing a supplier’s dispatch statement with a buyer’s receipt. The product’s trustworthiness depends on separating language interpretation from verifiable calculations and evidence links.

### 8.4 AI guardrails
- Unknown fields must remain `null`.
- Preserve the exact text span supporting each extracted field when feasible.
- Validate model output against a schema.
- Reject invented record IDs.
- Do not allow the model to generate source citations independently; the application supplies them from the actual matched records.
- Do not allow a model-generated explanation to introduce facts absent from the verified finding object.
- If the model fails or is unavailable, allow manual claim entry and rules-only analysis.
- Do not label a person or company fraudulent, dishonest, guilty, or liable.
- Do not treat the absence of a record in the input as proof that it does not exist.

### 8.5 AI value is a hypothesis
The product must compare the hybrid workflow with a rules-only baseline. If AI does not improve claim extraction or record-selection performance on the fixed test set, reduce the AI role and report that honestly.

---

## 9. Differentiation and Competitive Context

### 9.1 What is already available
Public vendor materials show that related capabilities already exist:
- Zoho Books advertises invoice/payment workflows and supports recording partial payments; its plan comparison lists credit notes and invoicing capabilities. [Zoho Books payment help](https://www.zoho.com/in/books/help/invoice/record-payment-for-invoice.html) · [Zoho Books India plan comparison](https://www.zoho.com/in/books/pricing/pricing-comparison.html)
- Medius advertises invoice matching against purchase orders and goods receipts as part of AP automation. [Medius AP automation](https://www.medius.com/solutions/medius-accounts-payable-automation/)
- HighRadius advertises deduction management, claim/document linking, shortage analysis, and proof-of-delivery automation. [HighRadius deductions management](https://www.highradius.com/product/deductions-management-automation-software/) · [HighRadius POD automation](https://www.highradius.com/software/order-to-cash/collections-management/proof-of-delivery-automation/)

These are vendor-authored descriptions of advertised capabilities, not independent performance evaluations. We have not completed a hands-on competitor comparison, verified every plan, or proven that these products cannot serve the target user.

### 9.2 What we must not claim
Do not claim that:
- invoice matching is new;
- AI dispute investigation is new;
- no competitor supports short-delivery disputes;
- ProofTrail is the first or only solution;
- existing accounting tools cannot do this;
- the product is cheaper, faster, more accurate, or more suitable without evidence;
- the target market is underserved without validation.

### 9.3 Proposed product wedge
**A claim-first investigation workspace for a single short-delivery dispute, with a visible source trail and explicit uncertainty, using a small documented dataset.**

The intended design emphasis is:
1. Start from the dispute claim, not only a mismatch alert.
2. Show exactly which records support each finding.
3. Make the arithmetic inspectable.
4. Distinguish dispatch evidence from receipt evidence.
5. Make missing and ambiguous evidence visible.
6. Recommend the next verification step instead of issuing a fraud verdict.
7. Keep the prototype low-setup and focused on one case type.

These are proposed product-design choices, not proof of a unique market position.

### 9.4 What would validate the wedge?
- Ask 3–5 potential users to walk through a recent dispute, if access is possible.
- Record how they find and compare records today.
- Ask what tools they already use and what remains manual.
- Avoid leading questions such as “Would you use our AI tool?”
- Show a prototype only after learning the existing workflow.
- Compare current steps with the ProofTrail workflow.
- Treat a small convenience sample as exploratory, not statistically representative.

### 9.5 Differentiation statement for a pitch
“Invoice matching and deduction management already exist. ProofTrail focuses narrowly on the investigation step after a short-delivery claim: it connects the claim to supplied transaction records, verifies the arithmetic deterministically, shows the source behind each finding, and keeps conflicting or missing evidence unresolved. We are testing whether AI-assisted claim interpretation improves this workflow over a rules-only baseline.”

---

## 10. Example Investigation

### Supplied synthetic records
- Invoice: 100 units × ₹150 = ₹15,000.
- Dispatch record: 100 units.
- Signed receipt: 80 units.
- Payment ledger: ₹12,000.
- No linked credit note found in the supplied dataset.

### Safe findings
1. The invoice record states 100 units and a line amount of ₹15,000.
2. The dispatch record states that 100 units were dispatched.
3. The linked receipt record states that 80 units were received.
4. The recorded invoice/receipt quantity difference is 20 units, assuming both records refer to the same item and shipment and use compatible units.
5. At ₹150 per unit, 20 units correspond to ₹3,000 before considering taxes, fees, discounts, or other adjustments, and only if the price applies to the same items.
6. The payment record supplied for this case records ₹12,000. This alone does not prove why the payment was partial.
7. No linked credit note was found in the supplied dataset. This does not prove that no credit note exists elsewhere.
8. The cause and final settlement remain unresolved until relevant evidence is checked.

### Unsafe conclusions
- “The buyer committed fraud.”
- “The buyer definitely received only 80 units.”
- “The supplier definitely dispatched 100 good units.”
- “The ₹3,000 difference is definitely owed.”
- “No credit note exists anywhere.”
- “The partial payment was definitely caused by the shortage.”

### Suggested next checks
- Confirm that invoice, dispatch, and receipt reference the same shipment and item.
- Confirm whether the receipt covers the full shipment.
- Check for subsequent deliveries or partial shipments.
- Check whether a credit note, return, discount, or other adjustment is recorded.
- Ask for missing documentation if necessary.

---

## 11. Product Boundaries and Non-Goals

### Explicit non-goals for the hackathon
- Legal judgement, fraud verdicts, or liability determination.
- Debt collection, automated buyer contact, negotiation, or settlement.
- Full accounting or ERP replacement.
- Email, WhatsApp, bank, GST, carrier, or accounting-platform integrations.
- Arbitrary PDF, image, or OCR ingestion.
- Automated financial transactions.
- Predicting whether a buyer is dishonest.
- Claims that absent data proves an event did not happen.
- Multi-tenant production security, billing, enterprise deployment, or compliance certification.
- Multi-dispute-type support.
- Blockchain, agents, voice, or complex retrieval infrastructure without a demonstrated need.

### Why the scope is narrow
The hackathon lasts eight hours. A complete, reliable, auditable workflow is more valuable than a broad collection of shallow features. The core demo must work before any stretch feature is added.

---

## 12. Success Criteria for the Hackathon Prototype

Success is not defined by a large feature list. It is defined by a reliable vertical slice and transparent evaluation.

### Functional criteria
- Accept a dispute message and a defined set of structured records.
- Validate records and show malformed/missing fields.
- Extract a structured claim with review for ambiguous values.
- Identify candidate records and show why they were matched.
- Compute quantities and amounts deterministically.
- Attach source IDs to every factual finding.
- Display supported, conflicting, not-found-in-provided-data, and unresolved states correctly.
- Avoid fraud/legal conclusions.
- Work in manual/rules-only fallback if the LLM is unavailable.
- Demonstrate one clean case, one discrepancy case, and one ambiguous case.

### Evaluation criteria
Create 24–30 synthetic cases if time allows, with expected outcomes labelled before running the evaluation. Compare:
- rules-only structured input;
- hybrid AI extraction plus deterministic checks;
- optional LLM-only comparator, treated as an experimental baseline rather than a trusted mode.

Measure:
- claim-field extraction accuracy;
- candidate record match accuracy;
- finding-state correctness;
- source-link correctness;
- arithmetic correctness;
- unsupported assertion count;
- correct abstention on ambiguous cases;
- hybrid improvement over rules-only.

Report actual counts and denominators. Synthetic test results validate only behavior on those synthetic cases; they do not establish real-world accuracy, business impact, or demand.

---

## 13. Demo Story

### Case A — Clear discrepancy
Show an invoice for 100 units and a linked signed receipt for 80 units. Show the 20-unit difference, source IDs, and calculation.

**Narration:** “ProofTrail identifies a discrepancy between the supplied records. It does not infer intent or decide who is legally right.”

### Case B — Ambiguous evidence
Show a missing receipt or two plausible shipment matches. ProofTrail should leave the finding unresolved, explain the gap, and suggest the next verification step.

**Narration:** “When the records cannot establish an answer, unresolved is a valid result—not a failure to hide.”

### Case C — Clean transaction
Show matching PO, invoice, and receipt records. The system should not invent a discrepancy.

**Narration:** “The system should be capable of finding no discrepancy when the records agree.”

### AI demonstration
Show the original informal claim and extracted fields, then the deterministic result and source trace. If evaluation results exist, report actual metrics only.

---

## 14. Risks and Mitigations

| Risk | Why it matters | Mitigation |
|---|---|---|
| No validated demand | The workflow may be rare or already manageable with existing tools | Exploratory interviews and workflow observation |
| Competitive overlap | Related features already exist in accounting and enterprise dispute products | Narrow positioning; no “first/only” claims; hands-on comparison if time allows |
| AI adds little | A structured form may solve the task just as well | Compare hybrid with rules-only; narrow AI role if no measurable lift |
| Data is too clean | CSV-only data may omit the real difficulty of scattered evidence | Acknowledge the limit; include missing, conflicting, and ambiguous test cases |
| False certainty | The model may overstate what a record proves | Deterministic calculations, source links, uncertainty states, adversarial tests |
| Incorrect record matching | Similar IDs/dates can lead to a wrong transaction | Hard constraints first; multiple candidates remain unresolved |
| Integration failure | Parallel work can produce incompatible contracts | Freeze schemas early; integrate a vertical slice by hour 2.5–3 |
| Scope creep | OCR, integrations, and multiple dispute types can block the core demo | P0/P1 scope and feature freeze |
| External model failure | API limits or connectivity may interrupt the demo | Manual claim form and rules-only fallback |
| Privacy risk | Real invoices/payment details are sensitive | Synthetic data only for hackathon; no secrets in Git |

---

## 15. Eight-Hour Build Principle

The build order is:
1. Freeze schema, finding statuses, and one canonical example.
2. Create labelled synthetic cases.
3. Build deterministic validation and calculations.
4. Build the interface around a mocked finding object.
5. Add AI claim extraction and candidate matching.
6. Integrate one end-to-end case early.
7. Evaluate and fix unsafe or incorrect findings.
8. Freeze features and rehearse the demo.

**Hard checkpoint:** by approximately hour 3, at least one complete case must run from input to source-linked output. If not, cut stretch features and focus on the deterministic evidence trace.

---

## 16. Product Principles (Non-Negotiable)

1. **Evidence before explanation.** Explanations must be generated from verified finding objects.
2. **Traceability by default.** Every factual finding links to source record IDs.
3. **Uncertainty is a valid outcome.** Never force ambiguous cases into a confident verdict.
4. **Deterministic arithmetic.** Code, not an LLM, computes totals and differences.
5. **No invented evidence.** The model cannot create IDs, records, or citations.
6. **No fraud verdicts.** A mismatch is not proof of intent.
7. **Missing from data is not missing in reality.** Use exact wording.
8. **AI must earn its place.** Compare against a rules-only baseline.
9. **Honest evaluation.** Publish actual results, denominators, and limitations.
10. **Narrow and reliable beats broad and fragile.** Build one strong investigation workflow first.

---

## 17. Open Questions Before Implementation

- Can the team speak with any supplier, wholesaler, distributor, or accountant before or during the hackathon?
- What is the simplest stack the team can integrate reliably in the available time?
- Is an LLM API available and permitted, and what is the fallback?
- Will the MVP support English only, or can the team reliably test simple Hinglish phrasing?
- Which fields are required for a safe record match?
- How will the team label expected outcomes for the synthetic cases?
- Which evaluation metrics can be computed before the feature freeze?
- What actual competitor workflow can be checked hands-on, if access is available?

Do not delay implementation while trying to answer every business question. Lock the technical contract, build the vertical slice, and keep unvalidated assumptions clearly labelled.

---

## 18. Final Product Definition

**ProofTrail is a focused, evidence-first short-delivery dispute investigation prototype for small B2B suppliers.** It accepts a dispute message and structured transaction records, uses AI to interpret the claim and suggest relevant records, verifies calculations using deterministic code, and produces a source-linked investigation that distinguishes record-backed facts, conflicts, missing records in the supplied dataset, and unresolved questions.

Its proposed differentiation is the claim-to-evidence trace and explicit uncertainty in a narrow workflow—not the invention of invoice matching or dispute management. Its AI value must be demonstrated against a rules-only baseline. Its market need and competitive gap remain unvalidated until supported by user research and closer product comparison.

**The promise:** help a human investigate more transparently.  
**The boundary:** never claim more than the available evidence establishes.

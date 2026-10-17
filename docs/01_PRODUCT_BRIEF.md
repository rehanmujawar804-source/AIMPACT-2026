# 01 — Product Brief

## Product in one sentence
ProofTrail helps a small B2B supplier investigate a disputed delivery or payment by connecting transaction records, checking discrepancies, and producing a source-linked explanation of what the available evidence supports, conflicts with, or cannot establish.

## Target user (hypothesis)
A small Indian B2B supplier/distributor who handles purchase orders, invoices, dispatch/receipt records and payments across spreadsheets, accounting exports, and messages, but does not have a dedicated dispute analyst.

This is a target-user hypothesis, not a validated customer segment. Validate with interviews if possible.

## Narrow initial job-to-be-done
“When a buyer says the delivery was short and deducts money from payment, help me assemble the relevant records and understand what needs checking before I respond.”

## Trigger
A buyer disputes a delivery quantity or deducts a corresponding amount from an invoice/payment.

## Input
For the hackathon MVP:
- One dispute message in natural language (English; optional simple Hinglish examples if reliably tested).
- Structured records supplied as CSV/JSON: purchase order, invoice, dispatch, proof of delivery/receipt, payments, credit notes.
- Each record has a stable record ID, date, party reference, transaction/shipment reference, and relevant quantities/amounts.

## Output
A compact investigation brief with:
1. Dispute claim extracted into structured fields.
2. Relevant records and why each was matched.
3. Deterministic quantity/amount calculations.
4. Findings labeled `SUPPORTED_BY_RECORDS`, `CONFLICTING_RECORDS`, `NOT_FOUND_IN_PROVIDED_DATA`, or `UNRESOLVED`.
5. Source IDs attached to every factual finding.
6. One or more suggested verification steps.
7. Explicit limitations and missing information.

## Value proposition
Not “AI decides who is right.” Instead: reduce the manual effort of locating and comparing relevant records, while making uncertainty visible and keeping every finding traceable.

Potential value must be measured; do not claim time savings or financial recovery before testing.

## Core product loop
Dispute message → claim extraction → candidate record matching → deterministic checks → evidence trace → unresolved questions → human review.

## AI role
- Parse an informal dispute message into a validated claim schema.
- Suggest candidate record matches using explicit IDs/fields and explain match evidence.
- Draft a plain-language explanation from verified findings only.
- Suggest next verification steps from predefined templates and detected gaps.

## Non-AI role
- Schema validation.
- Amount/quantity calculations.
- Matching hard constraints.
- Status rules.
- Evidence IDs and source linking.
- Evaluation metrics and test scoring.

## Explicit non-goals
- Legal judgement, fraud verdicts, debt collection, automated buyer contact.
- Full accounting, ERP, email, carrier, GST, or bank integration.
- Arbitrary PDF/OCR ingestion in the 8-hour build.
- Automatic resolution or financial transactions.
- Predicting whether a buyer is dishonest.
- Claiming that absent data proves an event did not occur.
- Multi-tenant production security, billing, or enterprise deployment.

## Example
Invoice: 100 units × ₹150 = ₹15,000. Dispatch record says 100 units. Signed receipt says 80 units. Payment record says ₹12,000. No credit note appears in the provided dataset.

Safe finding:
- Invoice record states 100 units.
- Receipt record states 80 units.
- Difference between those recorded quantities is 20 units.
- At the stated unit price, 20 units correspond to ₹3,000, assuming the invoice line and receipt refer to the same shipment and no adjustments apply.
- The supplied dataset contains no linked credit note.
- It remains unresolved whether another delivery, adjustment, or payment arrangement exists outside the supplied data.

Unsafe finding:
- “The buyer is committing fraud.”
- “The buyer definitely received only 80 units.”
- “No credit note exists anywhere.”

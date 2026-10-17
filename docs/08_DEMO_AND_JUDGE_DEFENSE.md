# 08 — Demo Script & Judge Defense

## 3-minute demo flow
**0:00–0:20 — Problem**
“An invoice discrepancy is not the same as knowing what happened. A supplier may have an invoice and dispatch entry while the buyer reports a short delivery. The relevant evidence may not agree.”

**0:20–0:40 — Product**
“ProofTrail starts from a dispute message, links it to supplied transaction records, verifies the arithmetic, and shows what is supported, conflicting, or unresolved.”

**0:40–1:20 — Case 1: discrepancy**
Load a synthetic case with invoice quantity 100 and linked signed receipt quantity 80.
Show:
- extracted claim,
- source records,
- 20-unit difference calculation,
- source links.

Say: “This establishes a discrepancy between the supplied records. It does not by itself establish fault or fraud.”

**1:20–1:50 — Case 2: ambiguity**
Load a case with missing receipt or multiple possible shipments.
Show `UNRESOLVED`, the missing/ambiguous evidence, and next verification step.

**1:50–2:20 — AI vs deterministic code**
Explain:
- AI interprets informal claims and suggests record matches.
- Code validates schema and performs arithmetic.
- The evidence layer blocks unsupported claims.
Show actual measured test results only after the evaluation is run.

**2:20–2:45 — Differentiation**
“Invoice matching itself is not new. Our design focus is the claim-to-evidence investigation trace and explicit uncertainty for this narrow workflow. We are testing whether this makes review more reliable than a rules-only form.”

**2:45–3:00 — Limits and next step**
“This is a synthetic-data prototype, not a deployed accounting integration. Next we would validate the workflow with suppliers and test with their permission using appropriately protected records.”

## Difficult judge questions

### “Isn't this just a spreadsheet?”
Answer:
“The calculations alone could be done in a spreadsheet. The hypothesis we test is whether AI can turn informal dispute messages into structured claims and suggest the right records, while our trace shows every source and calculation. We compare that against a rules-only baseline rather than assuming AI is better.”

### “How is this different from Zoho Books?”
Answer:
“Zoho Books already supports invoicing, payment tracking, credit notes and related accounting workflows. We are not claiming to replace it. Our prototype focuses narrowly on investigating a short-delivery claim across supplied records. We have not proven that existing tools cannot do this; validating that gap is future work.”

### “HighRadius already handles deductions and proof of delivery. Why build this?”
Answer:
“HighRadius publicly describes deduction management and proof-of-delivery automation, so the broader capability is not new. Our current hypothesis is a simpler, claim-first investigation flow for a small supplier using a small set of records. We have not yet validated whether that segment needs a separate product.”

### “Why do you need AI?”
Answer:
“AI is used for unstructured claim interpretation and candidate record matching, not for final arithmetic or verdicts. We evaluate the hybrid version against a rules-only baseline. If it does not improve a measured task, we will narrow the AI role.”

### “Can it detect fraud?”
Answer:
“No. A discrepancy can result from incomplete records, timing, partial delivery, data entry, or legitimate adjustments. ProofTrail identifies record-backed inconsistencies and unresolved questions; it does not determine intent or legal responsibility.”

### “What if the receipt is wrong?”
Answer:
“The system reports what the receipt records and identifies the source type. It does not treat a record as infallible. Conflicting records stay visible and require human review.”

### “What if no proof of delivery is uploaded?”
Answer:
“It reports that a receipt was not found in the provided dataset. It does not conclude that a receipt does not exist.”

### “Where is the dataset?”
Answer:
“For this time-limited prototype, we use synthetic labelled cases so expected outcomes are known and we can test failure modes. That allows controlled testing but does not prove real-world performance or demand.”

### “What is your accuracy?”
Answer:
“Report only the measured result from the fixed test set, with the denominator and metric. If tests are incomplete, say that the evaluation is preliminary. Do not claim a general real-world accuracy percentage.”

### “Is this novel?”
Answer:
“We do not claim that invoice matching or dispute management is novel. The prototype tests a narrower workflow and interaction: claim-to-evidence traceability, explicit uncertainty, and measurable comparison with rules-only investigation.”

## Presenter rules
- Never say “first,” “unique,” “fraud-proof,” “guaranteed,” or “production-ready.”
- Do not invent customer interviews, ROI, speed gains, accuracy, or adoption.
- State clearly what is implemented versus proposed.
- If a feature is mocked, call it mocked.
- Use one real result from the evaluation rather than a long feature list.

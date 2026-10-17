# 08 — Demo Script & Judge Defense

## 1. Purpose

This document defines ProofTrail's three-minute demonstration, presenter script, live-demo actions, difficult judge questions, evidence requirements, fallback plan, and presentation rules.

The goal is to communicate a focused product hypothesis and demonstrate the working system without overstating its technical capability, market differentiation, or evaluation results.

ProofTrail is a claim-first investigation workflow for short-delivery and quantity-discrepancy disputes. It connects a dispute message to supplied transaction records, performs deterministic checks, and produces source-linked findings that distinguish supported evidence, conflicting records, missing evidence, and unresolved questions.

The demo should prove that the workflow operates as described—not that the entire product vision has been completed.

---

## 2. Three-Minute Demo Flow

### 0:00–0:20 — Problem

**Presenter script**

“An invoice discrepancy is not the same as knowing what happened. A supplier may have an invoice and dispatch entry while the buyer reports a short delivery. The relevant records may be incomplete, inconsistent, or difficult to connect. Before responding, someone needs to understand what the available evidence actually supports.”

**On-screen action**

Show the short-delivery investigation screen and the selected synthetic dispute.

Avoid starting with a long market explanation or a list of unrelated accounting problems.

**Key message**

The problem is not simply calculating a difference. It is understanding which records support the claim, what conflicts, and what remains unknown.

### 0:20–0:40 — Product

**Presenter script**

“ProofTrail starts from a dispute message, links it to supplied transaction records, verifies the arithmetic, and shows what is supported, conflicting, missing from the supplied data, or unresolved. AI assists with interpreting the claim and suggesting records, while deterministic code verifies the findings.”

**On-screen action**

Show the primary investigation screen.

Briefly point out:

- Dispute input.
- Extracted claim.
- Relevant source records.
- Findings and their statuses.

**Key message**

ProofTrail is an evidence-tracing workflow, not a chatbot that simply generates a verdict.

### 0:40–1:20 — Case 1: Recorded quantity discrepancy

**Synthetic example**

- Invoice quantity: 100 pieces.
- Linked signed receipt quantity: 80 pieces.
- Same item, shipment, and unit.
- No unresolved relationship ambiguity in this example.

**Presenter script**

“Here, the invoice records 100 pieces, while the linked signed receipt records 80. ProofTrail compares the two compatible records and calculates a difference of 20 pieces. You can inspect the invoice, the receipt, and the calculation behind the finding.”

Then say:

“This establishes a discrepancy between the supplied records. It does not, by itself, establish fault or fraud.”

**On-screen actions**

1. Load the synthetic case.
2. Show the extracted claim.
3. Open the invoice source record.
4. Open the receipt source record.
5. Display the calculation: 100 − 80 = 20 pieces.
6. Show the source IDs attached to the finding.
7. Point out the stated assumptions and limitations.

**What this demonstrates**

- Record matching.
- Deterministic arithmetic.
- Source traceability.
- Separation of a recorded discrepancy from a conclusion about responsibility.

**Do not claim**

- The system has established what physically happened beyond the available evidence.
- The discrepancy proves deliberate short-shipping.
- The system has determined who is legally responsible.

### 1:20–1:50 — Case 2: Ambiguous or missing evidence

Choose one of these cases based on which path works most reliably.

**Option A — Missing receipt**

The invoice is available, but no matching receipt appears in the supplied dataset.

**Presenter script**

“Here, we have an invoice but no matching receipt in the supplied records. ProofTrail identifies the evidence gap. It does not conclude that delivery failed or that a receipt does not exist elsewhere.”

**Option B — Multiple possible shipments**

Two shipments are plausible candidates, and the dispute message does not identify the correct one.

**Presenter script**

“Here, multiple records are plausible, but the available references do not establish which shipment is being disputed. Instead of silently choosing one, ProofTrail preserves the ambiguity and identifies what needs to be checked.”

**On-screen actions**

1. Load the ambiguous case.
2. Show the missing record or candidate alternatives.
3. Display `NOT_FOUND_IN_PROVIDED_DATA` or `UNRESOLVED`, as appropriate.
4. Show the unresolved question or next verification step.

Use the status that the actual implementation returns. Do not force a status simply to match the presentation.

**What this demonstrates**

The system is designed to preserve uncertainty instead of inventing a complete story from incomplete records.

### 1:50–2:20 — AI versus deterministic verification

**Presenter script**

“AI helps interpret informal claims and suggest relevant records. But it does not own the final arithmetic, source validation, or finding status. Those checks are handled by deterministic code. We also compare the hybrid workflow against a rules-only baseline to test whether AI improves a defined task.”

If evaluation has been completed, show one actual result:

- Claim-extraction performance.
- Candidate-match recall.
- Correct abstention on ambiguous cases.
- Source-attribution results.

Use the actual count, denominator, and evaluation scope.

For example, report the number of correct fields out of the applicable fields rather than presenting an unsupported general accuracy percentage.

If evaluation is incomplete, say:

“We have implemented the initial evaluation framework, but the results are still preliminary. We are not presenting an unmeasured accuracy claim.”

**On-screen action**

Show the real evaluation summary if available. Otherwise, show the labelled test-case structure and clearly identify it as the evaluation setup, not a completed result.

### 2:20–2:45 — Differentiation

**Presenter script**

“Invoice matching and deduction management already exist in established accounting and enterprise software. We are not claiming those capabilities are new. Our design focus is a narrow, claim-first investigation trace: connect the disputed claim to its source records, expose the calculation, and make missing or conflicting evidence explicit. We are testing whether this workflow improves review compared with a rules-only form.”

**On-screen action**

Show the evidence trace or a compact workflow diagram.

Do not display an unverified competitor comparison claiming that established products lack this capability.

**Key message**

The differentiation is a hypothesis about workflow and usability that requires validation—not a proven market gap.

### 2:45–3:00 — Limitations and next step

**Presenter script**

“This is a synthetic-data prototype, not a deployed accounting integration. Our next step would be to validate the workflow with small suppliers and, with their permission, test it using appropriately protected records. We would measure whether it makes investigation easier and whether the AI contribution justifies its complexity.”

**On-screen action**

Show a concise next-step statement or the final evidence-trace screen.

End with the product's actual demonstrated capability, not a future feature list.

---

## 3. Demo Preparation Checklist

### Before the presentation

- [ ] Verify the application starts from a clean state.
- [ ] Confirm the exact synthetic fixture IDs.
- [ ] Run the clean case.
- [ ] Run the quantity-discrepancy case.
- [ ] Run the missing or ambiguous evidence case.
- [ ] Check all displayed calculations against expected results.
- [ ] Check that every displayed source ID exists.
- [ ] Verify the UI does not display unsupported model-generated claims.
- [ ] Confirm the manual/rules-only fallback works.
- [ ] Record actual evaluation results and denominators, if available.
- [ ] Prepare a backup output from the same synthetic fixtures.
- [ ] Confirm the backup is clearly identified as a backup.

### During the presentation

- [ ] Keep the demonstration within three minutes.
- [ ] Show the working product early.
- [ ] Explain the invoice-to-receipt comparison.
- [ ] Open the actual source records.
- [ ] Show the calculation.
- [ ] Demonstrate uncertainty.
- [ ] Explain the limited AI role.
- [ ] State the limitations clearly.

### If the live demo fails

1. Do not conceal the failure or claim the application worked.
2. Switch to the known-good manual/rules-only path if it is available.
3. If necessary, use the prepared backup output and identify it as a saved result.
4. Explain which component failed and what the backup demonstrates.
5. Avoid claiming that a mocked or saved response represents a successful live integration.

A transparent fallback is better than improvising unsupported output.

---

## 4. Difficult Judge Questions

### Q1. “Isn't this just a spreadsheet?”

**Answer**

“The calculations alone could be done in a spreadsheet. Our hypothesis is that AI can help turn informal dispute messages into structured claims and suggest relevant records, while the evidence trace shows every source and calculation. We compare that approach against a rules-only workflow rather than assuming AI is better.”

**If challenged further**

“Whether the AI contribution is worthwhile depends on the evaluation. If it does not improve a preselected task, we should simplify the AI role rather than pretend it adds value.”

**What the answer establishes**

The team understands that deterministic arithmetic is not the novel part of the product.

### Q2. “How is this different from Zoho Books?”

**Answer**

“Zoho Books already supports invoicing, payment tracking, credit notes, and related accounting workflows. We are not claiming to replace it. Our prototype focuses narrowly on investigating a short-delivery claim across supplied transaction records. We have not proven that existing tools cannot support this workflow; validating the gap is future work.”

**If challenged further**

“Our current contribution is the specific evidence-trace workflow we are testing. We would need hands-on comparison and supplier feedback before claiming that it is materially better than an existing product.”

**Avoid saying**

- Zoho cannot investigate discrepancies.
- Accounting software lacks evidence tracking.
- Small suppliers have no existing solution.

Those statements have not been established by our prototype.

### Q3. “HighRadius already handles deductions and proof of delivery. Why build this?”

**Answer**

“HighRadius publicly describes deduction management and proof-of-delivery automation, so the broader capability is not new. Our current hypothesis is a simpler, claim-first investigation flow for a small supplier working with a limited set of records. We have not yet validated whether that segment needs a separate product.”

**If challenged further**

“That is precisely why we are treating this as a narrow workflow hypothesis rather than claiming a proven competitive advantage. The next step would be to compare the actual workflows and validate the need with target users.”

### Q4. “Why do you need AI?”

**Answer**

“AI is used for unstructured claim interpretation and candidate record suggestions, not final arithmetic or verdicts. We evaluate the hybrid version against a rules-only baseline. If it does not improve a measured task, we will narrow the AI role.”

**If asked for proof**

Show the actual comparison results.

If no comparison has been completed, state that the AI value remains unproven.

Do not use the mere presence of an LLM as evidence that the product is meaningfully AI-driven.

### Q5. “Can it detect fraud?”

**Answer**

“No. A discrepancy can result from incomplete records, timing, partial delivery, data entry, or legitimate adjustments. ProofTrail identifies record-backed inconsistencies and unresolved questions; it does not determine intent or legal responsibility.”

**If challenged further**

“The output is designed to help a human investigate what the records show, not replace a human decision with a fraud verdict.”

### Q6. “What if the receipt is wrong?”

**Answer**

“The system reports what the receipt records and identifies the source type. It does not treat a record as infallible. If records conflict, the conflict remains visible and requires human review.”

**If challenged further**

“A signed receipt is evidence of a recorded acknowledgment, but the system cannot independently establish that every recorded fact is correct. The quality and reliability of source records remain limitations.”

### Q7. “What if no proof of delivery is uploaded?”

**Answer**

“It reports that matching receipt evidence was not found in the provided dataset. It does not conclude that a receipt does not exist elsewhere or that delivery failed.”

**If challenged further**

“The system should identify the missing evidence and request the relevant record or reference.”

### Q8. “Where is your dataset?”

**Answer**

“For this time-limited prototype, we use synthetic labelled cases so expected outcomes are known and we can test failure modes under controlled conditions. That helps us evaluate prototype behavior, but it does not establish real-world performance or customer demand.”

**If challenged further**

“We would need appropriately authorized real-world records, privacy safeguards, and independent review to evaluate performance on actual disputes.”

Do not suggest that synthetic records are customer data.

### Q9. “What is your accuracy?”

**Answer if testing is complete**

“On our labelled synthetic test set, we correctly handled [actual count] out of [applicable denominator] for [specific metric]. This measures the prototype on these cases only, not its general real-world accuracy.”

Replace the placeholders with actual measured values.

**Answer if testing is incomplete**

“We have not completed a sufficiently reliable evaluation to report a final accuracy figure. We can explain the metrics and test cases, but we do not want to present an unmeasured number as a result.”

**If challenged further**

Separate extraction accuracy, candidate matching, source attribution, arithmetic correctness, and abstention. A single blended accuracy number could hide important failures.

### Q10. “Is this novel?”

**Answer**

“We do not claim that invoice matching or dispute management is novel. The prototype tests a narrower workflow and interaction: claim-to-evidence traceability, explicit uncertainty, and a measurable comparison with rules-only investigation.”

**If challenged further**

“Whether that is sufficiently differentiated to become a useful product is still an open question. It requires user validation and comparison with existing workflows.”

Do not claim to be the first, only, or unique solution.

### Q11. “What happens when the AI hallucinates?”

**Answer**

“AI output is treated as a suggestion, not authoritative evidence. The application validates the schema and record IDs, performs arithmetic deterministically, and applies the documented finding rules. Invalid IDs or unsupported relationships should be rejected rather than displayed as verified findings.”

**If challenged further**

“We test this with synthetic adversarial cases, including attempts to invent a receipt, select a similar but incorrect invoice, and infer fraud. Our actual safety results depend on the cases that have been run.”

Only claim a safeguard works if it has been implemented and tested.

### Q12. “Why not simply automate everything?”

**Answer**

“Because incomplete or conflicting transaction records cannot always support a reliable conclusion. Automating a guess would make the system appear more decisive but less trustworthy. ProofTrail automates structured checks while preserving human review for unresolved relationships.”

### Q13. “Who is your target customer?”

**Answer**

“Our initial target-user hypothesis is a small B2B supplier, wholesaler, or distributor that needs to investigate short-delivery claims using transaction records. We have not yet validated how frequently the problem occurs or whether these businesses would adopt a separate tool.”

**If challenged further**

“The next step is to speak with representative suppliers, understand their existing process, and test whether the evidence trace solves a real workflow problem.”

Do not invent interview results or claim market demand has been validated.

### Q14. “How will you make money?”

**Answer**

“We have not validated a pricing model. A potential future model could be a paid workflow tool for businesses that handle enough disputes to justify it, but pricing and willingness to pay require customer research.”

Do not invent subscription prices, market size, or revenue forecasts as if they were established facts.

### Q15. “Can this integrate with accounting software?”

**Answer**

“Integrations are a possible future direction. The current prototype uses supplied structured records. We have not demonstrated a production integration, so we are not claiming that it currently synchronizes with accounting software.”

### Q16. “How do you protect sensitive financial records?”

**Answer**

“The current demonstration uses synthetic records. Before handling real business data, the product would need appropriate access controls, secure storage and transmission, retention policies, and permissioned data handling. We are not claiming that a production-grade security program has already been implemented.”

### Q17. “What happens if the model API fails?”

**Answer**

“The investigation should remain usable through manual structured input and deterministic verification. AI is an assistive component, not a prerequisite for the core calculations.”

Demonstrate this fallback if it has been implemented.

### Q18. “Why only short-delivery disputes?”

**Answer**

“We narrowed the MVP to keep the workflow, evidence rules, and evaluation measurable within the hackathon. Supporting more dispute types would introduce additional data relationships and rules before we have established that this initial workflow works.”

### Q19. “How do you know the result is correct?”

**Answer**

“We validate the relevant record relationships, use deterministic calculations, check source references, and compare the output against labelled expected results. This helps us test whether the implementation follows our rules. It does not guarantee that the supplied source records reflect reality.”

### Q20. “What is your biggest limitation?”

**Answer**

“Our biggest limitation is that the current evaluation uses synthetic cases and a narrow structured-record workflow. We still need to validate the problem with actual suppliers, evaluate appropriately authorized real-world records, and compare the workflow with existing tools.”

A clear limitation is more credible than claiming that every part of the problem has been solved.

---

## 5. Presenter Rules

### Claims to avoid

Never say:

- “We are the first.”
- “Our solution is unique.”
- “Fraud-proof.”
- “Guaranteed accurate.”
- “Production-ready,” unless production readiness has actually been established.
- “We save 80% of the time,” without a measured study.
- “Businesses are already using it,” without evidence.
- “Our AI is more accurate than existing tools,” without a valid comparison.
- “No existing tool can do this,” without sufficient research.

### Always distinguish implementation states

Use the following vocabulary consistently:

- **Implemented:** present in the code and working.
- **Tested:** executed against a defined test or case.
- **Measured:** supported by recorded evaluation results.
- **Proposed:** planned but not implemented.
- **Hypothesis:** a claim that still needs evidence.
- **Unknown:** not established by the available information.

A designed screen is not necessarily an implemented feature. A working feature is not necessarily a validated product benefit.

### Use one strong result, not a feature list

A clear demonstration of one source-linked discrepancy and one appropriately unresolved case is more persuasive than listing numerous features that the judges cannot verify.

### Explain AI honestly

The team should be able to explain:

- What the model receives.
- What the model returns.
- Which fields are validated.
- Which calculations are deterministic.
- How invalid source IDs are handled.
- What happens when evidence conflicts.
- How the system behaves when AI is unavailable.
- Whether the AI contribution improved a measured task.

### Explain market positioning honestly

Acknowledge relevant existing capabilities when asked. Explain the narrow workflow being tested without presenting a competitor's unverified limitations as facts.

### Explain results honestly

Report actual counts, denominators, test scope, and limitations. If the test set is small, say so. If a feature was mocked or a case was not tested, say so.

---

## 6. Backup Demo Plan

Prepare a backup using the same synthetic fixtures as the live application.

The backup may contain:

- The dispute message.
- The invoice and receipt source records.
- The deterministic quantity calculation.
- The resulting finding object.
- The source references.
- The unresolved-evidence example.
- The actual evaluation summary, if completed.

Label saved screenshots or outputs clearly as prerecorded or generated results.

If the live AI request fails, use the manual/rules-only workflow where possible. If the entire application fails, explain that the backup shows a saved result rather than a successful live run.

Never invent a response during the presentation and imply that it came from the running application.

---

## 7. Final Judge-Readiness Checklist

### Product

- [ ] The narrow problem is clearly explained.
- [ ] The demo uses synthetic data.
- [ ] The main discrepancy is visible.
- [ ] The source records are inspectable.
- [ ] The calculation is correct.
- [ ] The ambiguous case preserves uncertainty.

### AI and engineering

- [ ] AI responsibilities are clearly separated from deterministic checks.
- [ ] Invalid IDs and unsupported claims are handled appropriately.
- [ ] Manual fallback is available or its absence is disclosed.
- [ ] The rules-only comparison is explained accurately.
- [ ] Actual evaluation results are shown only if measured.

### Differentiation and market

- [ ] Existing invoice-matching and deduction-management capabilities are acknowledged.
- [ ] No unverified competitor gap is presented as fact.
- [ ] The target customer is described as a hypothesis unless validated.
- [ ] No invented interviews, adoption, ROI, or willingness-to-pay results are claimed.

### Delivery

- [ ] The demo fits three minutes.
- [ ] The presenter knows the fallback path.
- [ ] The team can explain its biggest limitation.
- [ ] Every performance claim has a traceable basis.
- [ ] The final statement describes what was actually built and tested.

---

## 8. Final Presentation Principle

ProofTrail should not be presented as a system that automatically determines who is right in a commercial dispute.

It should be presented as a prototype that organizes supplied transaction evidence, verifies defined calculations, identifies conflicts and gaps, and helps a human understand what should be checked next.

**The strongest claim the team can make is the strongest claim its implementation and evaluation actually support.**
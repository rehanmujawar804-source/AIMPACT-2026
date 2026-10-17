# 05 — AI Role & Evaluation Plan

## 1. Purpose

This document defines ProofTrail's AI responsibilities, baseline approaches, evaluation methodology, synthetic test-set design, metrics, prompting principles, failure handling, and go/no-go criteria.

The goal is not to maximize the number of AI features. The goal is to test whether AI improves a specific part of a short-delivery investigation while preserving evidence traceability and avoiding unsupported conclusions.

### Core research question

**Does AI-assisted claim interpretation and record matching improve the quality of a short-delivery investigation compared with a rules-only workflow, without increasing unsupported claims?**

This is a hypothesis to test, not a pre-established result.

### Secondary questions

1. Can AI extract useful structured fields from informal dispute messages?
2. Can AI help identify relevant records when references are incomplete or inconsistent?
3. Does the hybrid workflow preserve source attribution and deterministic arithmetic?
4. Can the system recognize when the available evidence is insufficient?
5. Does the hybrid workflow provide measurable value over manual structured input and deterministic rules?
6. Is the value sufficient to justify the additional complexity and dependency of an external model?

### What this evaluation can establish

A controlled synthetic evaluation can show how the prototype behaves on the test cases created for it.

It cannot, by itself, establish:

- Accuracy on real supplier disputes.
- Customer demand or willingness to pay.
- Real-world time savings.
- Financial impact or return on investment.
- Production reliability.
- Superiority over commercial products.
- General performance across industries, languages, or document formats.

Those claims require separate evidence.

---

## 2. Evaluation Design

ProofTrail should be evaluated as an investigation workflow, not as a generic chatbot.

The main comparison is between two approaches:

- **Rules-only:** the user supplies structured claim fields, and deterministic logic performs matching and verification.
- **Hybrid:** AI interprets the original dispute message and suggests candidate records, while deterministic logic validates and verifies the resulting investigation.

An optional LLM-only baseline may be included to demonstrate the risks of generating conclusions directly from a language model. It is not the authoritative application workflow.

### 2.1 Baseline A — Rules-only

The user manually enters structured claim fields, such as:

- Issue type.
- Claimed quantity.
- Unit.
- Invoice reference.
- Shipment reference.
- Claimed amount, if stated.

The deterministic engine then validates the supplied records, applies documented matching rules, performs calculations, and produces source-linked findings.

This baseline is important because it represents a viable alternative to adding AI.

If the hybrid system cannot improve a preselected task, the team must reconsider whether that AI component is necessary.

### 2.2 Baseline B — LLM-only (optional)

The model receives the dispute and relevant supplied records and generates an assessment without relying on the full deterministic verification pipeline.

This comparison may help expose unsupported claims, arithmetic mistakes, invalid citations, and excessive certainty.

However:

- It is an experimental comparator, not the main product result.
- Its outputs must be evaluated against the same labelled cases.
- Invalid record references count as failures.
- Unsupported factual claims must be recorded.
- It must never bypass the application's source-validation and deterministic verification safeguards.

Do not spend valuable implementation time on this baseline if the core product or hybrid-versus-rules-only comparison is incomplete.

### 2.3 Baseline C — Hybrid

The hybrid approach follows this sequence:

1. AI extracts structured claim fields from the original message.
2. The extraction is validated against the shared schema.
3. The user can review or correct the extracted fields.
4. The matcher proposes candidate records using available references and evidence.
5. Deterministic logic validates record relationships.
6. The verification engine calculates quantities and amounts.
7. The findings builder applies documented finding-state rules.
8. Every factual finding is checked for valid source references.
9. The UI presents findings, calculations, limitations, and next steps.

The LLM does not become the source of truth merely because the workflow uses AI.

---

## 3. What AI Is Allowed to Do

AI should be limited to tasks where language interpretation or flexible matching may help.

### 3.1 Claim extraction

AI may extract:

- Issue type.
- Claimed quantity.
- Unit.
- Claimed amount.
- Currency.
- Invoice reference.
- Shipment reference.
- Relevant text spans.
- Missing fields.
- Whether human review is needed.

The model must distinguish directly stated values from derived or inferred values.

For example, if a message states that 80 units were received against 100 invoiced, the numerical difference is 20 units. If the schema permits the extractor to derive this value, its provenance must identify it as derived rather than directly stated.

The extractor must not invent a price, invoice reference, shipment reference, or amount that the message does not establish.

### 3.2 Candidate record suggestions

AI may suggest that a particular supplied record could relate to the dispute.

A suggestion must be based on visible information, such as:

- A reference in the dispute message.
- A matching invoice or shipment identifier.
- An item reference.
- A relevant date.
- A documented relationship between records.

The matching layer must verify that every proposed record ID exists.

If several records are plausible, the system should retain the alternatives rather than force a single match.

### 3.3 Plain-language explanations

AI may convert a verified finding into an understandable explanation.

For example, a verified calculation could be explained as:

“The invoice records 100 pieces, while the linked receipt records 80 pieces. The recorded difference is 20 pieces, assuming both records refer to the same item and shipment.”

The explanation must use the actual finding object supplied by the backend. It must not add new factual claims or silently change the calculation.

### 3.4 Suggested next checks

AI may help phrase a next verification step based on an already identified evidence gap.

Examples include:

- Confirm whether the receipt covers the complete shipment.
- Check whether another receipt or delivery record exists.
- Verify that the selected receipt belongs to the same invoice.
- Review whether a relevant adjustment has been recorded.

Suggestions must remain suggestions. They must not imply that the missing record or event definitely exists.

### 3.5 AI contribution must be visible

The demo should show the actual AI contribution rather than simply placing an AI label on the interface.

Useful visible evidence includes:

- The original dispute message.
- The extracted fields.
- Field provenance or uncertainty.
- Candidate matches and the reasons for them.
- User corrections, if any.
- The deterministic findings generated after validation.

The UI must make it possible to understand which parts came from AI and which parts were verified by deterministic logic.

---

## 4. What AI Is Not Allowed to Do

The following restrictions are non-negotiable.

### 4.1 No authoritative arithmetic from free-form output

The model may extract numerical values, but final calculations must be performed by deterministic code.

Do not trust a model-generated difference or financial total without recomputing it from validated inputs.

### 4.2 No invented records or citations

The model cannot create an invoice, shipment, receipt, payment, or source ID that is absent from the supplied dataset.

Every source reference must be checked programmatically.

### 4.3 No unsupported certainty

The model must not force an ambiguous investigation into a definitive conclusion.

When records are incomplete or contradictory, the finding must preserve the uncertainty.

### 4.4 No fraud or intent verdicts

The system must not label a party fraudulent, dishonest, guilty, or legally liable.

A quantity discrepancy does not establish intent.

### 4.5 No inference from absence

A missing record means it was not found in the supplied dataset.

It does not establish that the record does not exist elsewhere.

### 4.6 No hidden overrides

The model cannot override:

- Schema validation.
- Record-ID validation.
- Unit or currency compatibility checks.
- Deterministic calculations.
- Hard contradictions in the supplied records.
- Documented finding-state rules.

### 4.7 No unsupported performance claims

Synthetic tests cannot establish real-world accuracy, adoption, financial benefits, or time savings.

All demo and presentation claims must match the actual evaluation results.

---

## 5. Synthetic Test-Set Design

### 5.1 Target size

Target **24–30 labelled synthetic cases** if time allows.

At least 20 cases should be completed for the planned evaluation, provided the team can label them carefully and execute the tests reliably.

A smaller, well-labelled set is more useful than a larger set with ambiguous expected outcomes.

### 5.2 Proposed test distribution

| Case category | Target cases | What it tests |
|---|---:|---|
| Straightforward short-delivery cases | 5 | Quantity extraction and compatible invoice/receipt comparisons |
| Clean/no-discrepancy cases | 4 | Avoiding false discrepancy findings |
| Missing receipt or credit-note cases | 4 | Missing-evidence handling and careful language |
| Ambiguous references or multiple shipment candidates | 4 | Candidate selection and correct abstention |
| Partial payments not necessarily caused by delivery | 3 | Avoiding unsupported causal explanations |
| Duplicate or conflicting records | 3 | Validation and contradiction handling |
| Confusing or informal messages | 3 | Robust extraction; simple Hinglish only if reviewed by a fluent speaker |
| **Total** | **26** | |

The distribution is a target, not a report of tests already completed.

The team may adjust the category counts if a technical constraint arises, but it must record the final test-set composition.

### 5.3 Case-design principles

Each test case should define:

- A unique case ID.
- The original dispute message.
- The structured source records.
- Expected extracted fields.
- Expected candidate matches or acceptable candidate set.
- Expected findings and finding states.
- Expected calculations.
- Required source references.
- Whether the case should remain unresolved.
- Any specific unsupported conclusion the system must avoid.

### 5.4 Include negative cases

Do not test only obvious discrepancies.

Include cases where:

- Invoice and receipt quantities agree.
- The receipt is missing.
- A shipment reference appears in more than one record.
- A partial payment exists without evidence of its cause.
- Two records contradict each other.
- A duplicate ID makes a source ambiguous or invalid.
- A message omits the invoice number.
- A message contains an unclear quantity or unit.
- The dataset does not support a confident conclusion.

Negative cases are essential because a system that always reports a discrepancy can appear convincing on positive examples while being unsafe in practice.

### 5.5 Avoid leakage between development and evaluation

Where feasible, split the test cases into:

- **Development set:** used to debug the implementation and refine prompts or rules.
- **Held-out set:** reserved for the final evaluation and not used for iterative tuning.

For example, a 26-case set might contain 18 development cases and 8 held-out cases. This is only a practical example; the final split must be documented.

If the team does not have enough time to maintain a held-out set, state that the test cases were used during development and that the evaluation is exploratory.

A teammate who did not implement the extractor should ideally write or review some held-out messages.

### 5.6 Label before running the comparison

Expected results must be written before the final evaluation run.

Do not change expected labels merely to make the system pass.

If a test case is genuinely ambiguous, document the acceptable outcomes or label the expected result as unresolved.

If the case design itself is flawed, correct it transparently and record the change.

---

## 6. Evaluation Metrics

The team should choose a small number of primary metrics and track the others as supporting diagnostics.

### 6.1 Claim extraction field accuracy

Measure whether the extracted fields match the expected labels.

Track fields separately where possible:

- Issue type.
- Claimed quantity.
- Unit.
- Claimed amount.
- Invoice reference.
- Shipment reference.

A field counts as correct only when its value and the relevant provenance or uncertainty requirements are satisfied.

Report exact counts and denominators. Do not combine unlike fields into a single percentage without explaining the calculation.

### 6.2 Candidate match recall

Measure whether the correct source record appears among the proposed candidate matches.

For cases with multiple valid candidates, define the acceptable candidate set before testing.

Candidate recall alone is not enough: returning every record would achieve high recall while making the product less useful.

Where feasible, also report candidate precision—the fraction of proposed candidates that are relevant.

### 6.3 Finding classification accuracy

Measure whether the finding state matches the expected label:

- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

The expected state must be defined by the documented evidence rules, not chosen after seeing the output.

For cases containing several findings, specify whether scoring is performed per finding, per claim, or per case. Use the same scoring method for both baselines.

### 6.4 Source attribution precision

Check whether every cited source record actually supports the statement attached to it.

A source ID merely existing in the dataset is insufficient. It must support the particular claim being made.

Report:

- Number of citations checked.
- Number of citations valid and relevant.
- Number of findings containing an invalid or irrelevant citation.

For a small hackathon test set, manual review against the labelled source records is acceptable if the team records who reviewed it and applies the same process consistently.

### 6.5 Unsupported assertion count

Count factual assertions that are not supported by the supplied records or valid deterministic calculations.

Examples include:

- Claiming that fraud occurred.
- Attributing a partial payment to a shortage without evidence.
- Stating that a credit note does not exist anywhere because it was not uploaded.
- Claiming a shipment was fully delivered based only on a dispatch record.
- Introducing an invoice or shipment ID absent from the dataset.

Define the counting unit before the evaluation—for example, each distinct unsupported factual assertion in the generated finding and explanation.

Report the raw count and the number of cases reviewed. A zero count on a small synthetic set is encouraging but does not prove general safety.

### 6.6 Arithmetic correctness

For each applicable calculation, compare the output with an independently prepared expected result.

Check:

- Quantity differences.
- Unit-price calculations.
- Line totals.
- Any implemented payment or adjustment calculations.

Report the number correct over the number evaluated.

Do not score an unsupported financial calculation as correct merely because its arithmetic is mathematically accurate. Its inputs and assumptions must also be valid.

### 6.7 Abstention quality

Measure whether cases that lack sufficient evidence remain unresolved.

Track at least:

- Ambiguous cases correctly left unresolved.
- Ambiguous cases incorrectly given a definitive conclusion.
- Cases incorrectly left unresolved despite sufficient evidence, where practical.

The goal is not to maximize abstention. It is to make appropriate conclusions when evidence is sufficient and preserve uncertainty when it is not.

### 6.8 Incremental value over rules-only

This is the central comparison.

Preselect at least one task where AI could plausibly help:

- Claim extraction from informal wording.
- Candidate-match recall when references are inconsistent.

Compare the hybrid system against rules-only on the same applicable cases.

For claim extraction, rules-only may receive manually entered structured fields. For a fair interpretation, acknowledge that this baseline assumes the user has already completed the structuring step. The comparison tests whether AI can reduce that manual structuring burden or improve extraction quality—not whether AI beats a perfect human who already supplied correct fields.

For matching, keep the source dataset, matching requirements, and scoring rules consistent.

If hybrid performance does not improve a preselected task, do not claim that AI improved investigation quality. Narrow the AI role, simplify the system, or present AI as optional assistance.

### 6.9 Optional usability measure

If time permits, ask a teammate who did not build the UI to complete a clean case and an ambiguous case using the prototype.

Record:

- Whether the person completes the workflow.
- Where they become confused.
- Whether they can identify the source of a finding.
- Whether they understand why a case remains unresolved.

This is an informal usability check, not a representative user study.

---

## 7. Reporting Results Honestly

All reported measurements must come from actual test runs.

Use raw counts and denominators alongside percentages.

### Suggested report format

“On **N** labelled synthetic cases, the hybrid workflow correctly extracted quantities in **X/N** applicable cases. The correct source record appeared among proposed matches in **Y/Z** applicable cases. **A/B** ambiguous cases were correctly left unresolved. We observed **C** unsupported factual assertions across **D** reviewed cases. These results describe the prototype on our synthetic test set and do not establish real-world accuracy.”

Replace every placeholder only after the tests have run.

If a metric was not measured, state that it was not measured.

### 7.1 Report failures

Include examples of:

- Incorrect extraction.
- Incorrect candidate selection.
- Invalid source attribution.
- Incorrect calculations.
- False discrepancy findings.
- Unsupported conclusions.
- Cases where the system should have abstained but did not.

A credible failure analysis is more useful than a presentation containing only successful examples.

### 7.2 Distinguish implementation tests from product validation

Passing unit tests demonstrates that implemented rules behave as expected on the tested inputs.

Passing synthetic end-to-end cases demonstrates that the workflow handles those cases.

Neither establishes that actual suppliers experience the problem frequently, that the workflow is easier than their current process, or that they would adopt the product.

---

## 8. Go/No-Go Criteria

These criteria should be applied before the final demo.

### Gate 1 — Arithmetic

**Go:** all tested authoritative calculations match independently prepared expected values.

**No-go:** an incorrect calculation can appear as a verified finding.

Action: fix the rule, add a regression test, and rerun the affected cases.

### Gate 2 — Source integrity

**Go:** every source ID in every factual finding exists and supports the attached statement.

**No-go:** the system can display fabricated or irrelevant citations as evidence.

Action: validate citations programmatically and block invalid findings.

### Gate 3 — Uncertainty handling

**Go:** ambiguous relationships and insufficient evidence remain unresolved under the agreed rules.

**No-go:** the system forces an unsupported definitive conclusion.

Action: revise matching or finding-state logic and rerun the ambiguous cases.

### Gate 4 — Clean cases

**Go:** clean cases do not generate unsupported discrepancy findings.

**No-go:** the system invents discrepancies where the relevant records agree.

Action: inspect matching rules, comparison conditions, and the expected labels.

### Gate 5 — AI contribution

**Go:** hybrid performance improves at least one preselected task over the rules-only baseline without violating evidence safeguards.

**No-go:** no measured improvement appears on the preselected task.

Action: simplify the AI component, narrow the claim, or position AI as optional assistance.

### Gate 6 — AI availability

**Go:** the workflow remains usable when the external model is unavailable.

**No-go:** the application cannot investigate a case without a successful LLM response.

Action: implement manual structured input and rules-only fallback.

### Gate 7 — Demo readiness

**Go:** the team can demonstrate one clean case, one discrepancy case, and one ambiguous or missing-evidence case end to end.

**No-go:** the demo depends on unverified model output, manual code edits during the presentation, or unsupported claims.

Action: freeze features and rehearse the known-good cases.

---

## 9. Prompting Principles

### 9.1 Use structured output

Use schema-constrained output where supported by the chosen model/API.

Still validate the response programmatically. Schema-constrained generation does not guarantee factual correctness.

### 9.2 Minimize context

Provide only the dispute and records relevant to the current investigation.

Every record sent to the model should retain its actual source ID.

### 9.3 Unknown values must remain unknown

Tell the model to return `null` for unstated values.

Do not encourage the model to fill gaps based on what usually happens in business transactions.

### 9.4 Request supporting text spans

For extracted values, ask for the exact text span that supports the value when such a span exists.

A derived value may be supported by multiple spans. A field inferred from record context must be labelled as inferred and reviewed.

### 9.5 Request candidates, not verdicts

The matching prompt should ask for possible record IDs and the reasons they may be relevant.

It must not ask the model to determine who is right or declare that the dispute is proven.

### 9.6 Keep verification outside the prompt

Do not rely on instructions alone to guarantee correct arithmetic, valid citations, or safe findings.

Implement those safeguards in code.

### 9.7 Reuse fixed cases

Run the same labelled cases across modes and, where practical, across prompt revisions.

Record changes to prompts, rules, or schemas so the team can explain which version produced the reported result.

---

## 10. Example Claim Extraction Prompt

The following is a starting prompt to adapt to the final agreed schema.

```text
You extract structured information from a short-delivery dispute message.

Your task is to represent what the message says, not to decide whether
the dispute is true.

Return JSON that conforms exactly to the supplied schema.

Rules:
1. Use only information supported by the message.
2. Return null for unstated values.
3. Do not invent invoice IDs, shipment IDs, prices, amounts, or records.
4. Preserve the original meaning of the message.
5. Distinguish explicitly stated values from derived or inferred values.
6. Include exact text spans supporting extracted fields when available.
7. If multiple interpretations are plausible, set
   needs_human_review to true.
8. Do not determine fault, fraud, intent, or legal responsibility.
9. Do not treat a claim as verified merely because it is stated.
10. Return only the required structured output.
```

The backend must still validate the output against the schema and allow user review.

---

## 11. Example Candidate Matching Prompt

```text
You suggest candidate source records that may relate to a short-delivery
dispute.

You may use only the supplied dispute message and supplied records.

Rules:
1. Return only record IDs that actually appear in the supplied records.
2. Explain the specific reference or field that supports each candidate.
3. Do not claim a candidate is confirmed unless the deterministic rules
   establish the required relationship.
4. If multiple records are plausible, return the alternatives.
5. If the evidence is insufficient, return no confirmed match and
   explain what remains ambiguous.
6. Do not invent missing records or identifiers.
7. Do not infer fraud, intent, or legal responsibility.
8. Follow the required output schema exactly.
```

Candidate IDs must be checked against the supplied dataset after the model responds.

---

## 12. Failure Handling and Fallback Behavior

### Invalid JSON or schema mismatch

- Reject the invalid model output.
- Retry once if appropriate.
- Validate the retry.
- If it still fails, use manual claim entry or rules-only mode.
- Do not silently coerce unsupported fields into plausible values.

### Model timeout or unavailable service

- Display a clear message.
- Preserve the dispute message and supplied records.
- Offer manual structured input.
- Continue deterministic verification where possible.
- Report that AI extraction was unavailable.

### Invalid candidate ID

- Reject the candidate reference.
- Record the failure for evaluation.
- Do not display it as a valid evidence source.

### Ambiguous candidates

- Show the plausible candidates and the matching reasons.
- Require review where necessary.
- Keep the relevant finding unresolved until the relationship is sufficiently established.

### Contradictory evidence

- Preserve the conflicting records.
- Show the discrepancy and source references.
- Do not let the LLM choose one record simply because it produces a clearer narrative.

### Missing evidence

- State which record type was not found in the supplied dataset.
- Explain what conclusion cannot be established.
- Suggest a concrete next check.
- Avoid claims about records outside the dataset.

---

## 13. Implementation Plan for the Eight-Hour Hackathon

### First phase — establish the baseline

1. Finalize the test-case schema.
2. Create the first synthetic cases.
3. Implement manual claim fields.
4. Implement deterministic verification.
5. Verify that the rules-only path produces correct, source-linked findings.

### Second phase — integrate AI

1. Add claim extraction.
2. Validate the output schema.
3. Display extracted fields for review.
4. Add candidate suggestions only after the first vertical slice works.
5. Route accepted fields through the same deterministic engine.

### Third phase — evaluate

1. Freeze the applicable test set.
2. Run rules-only.
3. Run hybrid.
4. Score extraction, matching, findings, attribution, arithmetic, and abstention.
5. Inspect failures.
6. Apply only necessary fixes.
7. Rerun affected tests and report the actual final results.

### Fourth phase — prepare the demo

Show three cases:

- A clean case where the records agree.
- A discrepancy case where the quantity calculation is inspectable.
- An ambiguous case where the system correctly refuses to overstate the evidence.

Explain what AI contributed, what deterministic code verified, what the test set measured, and what remains unvalidated.

---

## 14. Final Evaluation Decision

ProofTrail should not be judged by whether it can produce a convincing AI-generated explanation.

It should be judged by whether the complete workflow can interpret a claim, select relevant records, calculate discrepancies correctly, link findings to real supplied records, and preserve uncertainty when the evidence is insufficient.

**The AI component earns its place only if evaluation shows measurable improvement over the rules-only baseline on a preselected task, without undermining source integrity or evidence safeguards.**

If it does not, simplify the AI component and report the result honestly.

The final technical claim must reflect the evidence collected during the hackathon—not the result the team hoped to achieve.
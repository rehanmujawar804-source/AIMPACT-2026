# 03 — Scope & Acceptance Criteria

## 1. Purpose of This Document

This document defines the exact scope of the ProofTrail hackathon prototype, its user workflow, required functionality, acceptance criteria, failure handling, and definition of done.

Its purpose is to keep the team focused on building one complete, testable investigation workflow instead of several incomplete features.

ProofTrail is an evidence-first investigation workspace for a narrow business scenario: **short-delivery or quantity-discrepancy disputes between B2B buyers and suppliers.**

The prototype must demonstrate how a disputed claim can be connected to supplied transaction records, checked through deterministic rules, and presented with source-linked findings and explicit uncertainty.

The prototype is not expected to become a production finance platform in eight hours. It must demonstrate a reliable vertical slice, measurable behavior, and honest limitations.

### Scope principles

1. Build one complete workflow before adding features.
2. Prefer correctness and traceability over visual complexity.
3. Use synthetic data and documented input contracts.
4. Use AI only for defined tasks that can be evaluated.
5. Use deterministic code for calculations and rule-based findings.
6. Preserve uncertainty when the evidence is insufficient.
7. Do not silently ignore invalid records or invent missing information.
8. Keep a rules-only fallback for AI failures.
9. Freeze the core contract before parallel implementation.
10. Do not claim features, accuracy, or impact that have not been demonstrated.

---

## 2. Target User and Initial Use Case

### Target-user hypothesis

The initial target is a small B2B supplier, wholesaler, or distributor that needs to investigate a buyer's claim that fewer units were received than invoiced.

This is a hypothesis about the intended user segment, not a validated finding about all small businesses.

### Primary use case

A supplier invoices a buyer for 100 units. The buyer claims that only 80 units arrived and deducts money from the payment. The supplier needs to investigate the discrepancy using the available invoice, dispatch record, receipt record, payment entry, and relevant adjustments.

ProofTrail should help the user answer:

- What exactly is being disputed?
- Which supplied records may relate to the claim?
- What do the records actually state?
- Are the quantities and amounts consistent?
- Which findings are supported by the supplied records?
- Which records conflict?
- What information is missing or ambiguous?
- What should a human verify next?

ProofTrail must not automatically decide who is legally right, infer fraud, or assume that the supplied dataset contains every relevant business record.

---

## 3. MVP User Flow

The complete MVP flow is:

1. Select a supplied synthetic dispute case or paste a dispute message.
2. Load or select the corresponding structured transaction records.
3. Validate every input row against the documented schema.
4. Display invalid rows, field-level errors, and relevant warnings.
5. Extract the claim into structured fields using AI, or enter the fields manually.
6. Let the user review and edit extracted fields before investigation.
7. Identify candidate transaction records using the matching logic.
8. Display candidate matches and their source identifiers.
9. Run deterministic quantity, amount, reference, and compatibility checks.
10. Assign finding states using documented rules.
11. Display the investigation findings with source links and inspectable calculations.
12. Identify missing information, conflicts, assumptions, and unresolved questions.
13. Suggest next verification steps based on the findings.
14. Allow the user to copy or export the investigation brief, if the export feature is implemented.

### Important workflow rule

AI extraction and matching are not equivalent to verified findings.

The system must preserve the distinction between:

- A claim extracted from a message.
- A record suggested as a possible match.
- A fact stated by a source record.
- A calculation performed by deterministic code.
- A finding assigned under documented rules.
- A question that remains unresolved.

The UI must make these distinctions understandable without requiring the user to inspect raw model output.

### Minimum acceptable workflow

If time is limited, the app must still support one complete case from input to evidence-linked findings. A polished landing page, an elaborate dashboard, or multiple screens without a functioning investigation path do not satisfy the MVP.

---

## 4. Input Contract and Data Scope

### 4.1 Supported input types

The hackathon prototype will use:

- A dispute message supplied as text.
- Structured synthetic records supplied as JSON or CSV.
- Predefined synthetic cases for repeatable demonstration and testing.
- Manual claim fields as a fallback when AI extraction is unavailable.

Arbitrary document uploads are not part of the initial scope.

### 4.2 Supported record categories

The initial contract covers six categories:

1. Purchase orders.
2. Invoices.
3. Dispatch records.
4. Proof-of-delivery or receipt records.
5. Payment records.
6. Credit notes or other relevant adjustments.

The prototype does not need every category to be present in every case. Missing categories must be represented honestly rather than fabricated.

### 4.3 Required data principles

Every supplied record must have a stable `record_id`.

Where applicable, records should include:

- Record type.
- Transaction, order, invoice, or shipment reference.
- Party or counterparty reference.
- Item or product reference.
- Event or document date.
- Quantity and unit of measure.
- Amount and currency.
- Links or references to related records.
- Any additional fields required by the defined check.

The exact required fields must be finalized in `04_DATA_CONTRACTS_AND_ARCHITECTURE.md` before parallel implementation begins.

The schema must distinguish required fields from optional fields. An optional missing field must not automatically invalidate an entire case unless a documented rule requires it.

### 4.4 Stable identifiers

Record IDs must be unique within the dataset scope.

The system must not create a source citation for a record that does not exist. If records are duplicated, the system must report or handle the ambiguity according to a documented rule rather than silently selecting one.

### 4.5 Units and currency

Quantity comparisons are valid only when the units are compatible or an explicit, verified conversion rule exists.

Amount comparisons must respect currency. The prototype must not compare amounts in different currencies as if they were directly equivalent.

The MVP may reject unsupported conversions instead of implementing a general unit or foreign-exchange conversion engine.

### 4.6 Dataset limitations

The prototype uses synthetic records. It does not need live customer information, private financial records, or production integrations.

All demonstration data should be clearly labelled as synthetic.

---

## 5. Finding States and Their Meaning

ProofTrail must use explicit states rather than forcing every case into a binary answer.

### 5.1 `SUPPORTED_BY_RECORDS`

Use when the relevant supplied records support the specific finding under the documented rules.

Example: a receipt record states that 80 units were received.

This status does not automatically establish every related claim or the complete truth of the dispute.

### 5.2 `CONFLICTING_RECORDS`

Use when relevant supplied records disagree on a material fact.

Example: one record reports 100 units received, while another relevant receipt record reports 80 units for what appears to be the same shipment.

The system must expose the conflicting records and explain the disagreement. It must not arbitrarily choose the record that supports the preferred conclusion.

### 5.3 `NOT_FOUND_IN_PROVIDED_DATA`

Use when a required record or matching record cannot be found in the supplied dataset under the documented search rules.

Example: no linked credit note was found in the provided records.

This means only that the record was not found in the dataset searched. It does not prove that the record does not exist elsewhere.

### 5.4 `UNRESOLVED`

Use when the available evidence is insufficient, ambiguous, incompatible, or too contradictory to support a reliable conclusion.

Example: two invoices have similar references and both could plausibly relate to the claim.

Where useful, the system should show the candidate records and explain what additional information would help resolve the ambiguity.

### 5.5 State assignment rules

Finding states must be assigned through documented logic. The language model must not independently choose a definitive outcome based on persuasive wording.

The system may produce multiple findings with different states within the same investigation.

For example, the receipt quantity may be supported by a receipt record, the relationship between the receipt and invoice may remain unresolved, and a credit note may be absent from the supplied dataset.

---

## 6. P0 — Required Features

P0 features define the minimum viable prototype. They must be implemented and tested before optional features are added.

### P0.1 — One dispute type

Support only short-delivery or quantity-discrepancy investigations.

The system does not need to handle pricing disputes, damaged goods, tax disputes, payment fraud, returns, or other dispute categories.

### P0.2 — Structured synthetic data

Provide a small, documented dataset containing the record types needed for the core demonstration.

Include at least:

- One clean case.
- One clear quantity-discrepancy case.
- One ambiguous or missing-evidence case.

The test suite must cover more than these three demonstration cases.

### P0.3 — Schema validation

Validate every input row before relying on its contents.

The system must detect relevant problems such as:

- Missing required fields.
- Invalid field types.
- Missing or duplicate record IDs.
- Invalid numeric values.
- Unsupported units or currencies.
- Invalid or unusable references.

Exact validation rules must be documented in the data contract.

**Acceptance requirement:** invalid data must produce visible errors or warnings. The system must not silently discard invalid rows and then present the remaining result as if the dataset were complete.

### P0.4 — Claim extraction with review

Extract the claim into structured fields using AI when available.

The extracted claim should include applicable fields such as:

- Dispute type.
- Claimed quantity or shortage.
- Item reference.
- Invoice or shipment reference.
- Relevant date.
- Claimed deduction amount.
- Missing or ambiguous details.

Unknown values must remain null or explicitly unknown.

The user must be able to review and edit extracted fields, or complete the claim manually.

**Acceptance requirement:** the investigation must use validated claim fields, not unreviewed raw model output.

### P0.5 — Candidate record matching

Identify plausible records that may relate to the claim.

Candidate matching may use explicit identifiers, documented reference rules, and AI suggestions where appropriate.

The system must distinguish a candidate match from a confirmed relationship.

**Acceptance requirement:** multiple plausible candidates must remain visible when the available information does not uniquely identify a record.

### P0.6 — Deterministic checks

All quantity and amount calculations must be performed by code.

Examples include:

- Invoice quantity compared with receipt quantity.
- Difference between recorded quantities.
- Conditional value of a quantity difference using an applicable unit price.
- Comparison of related amounts when the currency and calculation basis are compatible.
- Detection of duplicate identifiers or inconsistent references.

Calculations must check that the records being compared refer to compatible items, units, and transactions.

**Acceptance requirement:** every computed quantity or amount must be reproducible from the source values and documented calculation rule.

### P0.7 — Source-linked findings

Every factual finding must cite valid source record IDs for the records that support or contradict it.

Each finding should expose, where applicable:

- Finding statement.
- Finding state.
- Source record IDs.
- Relevant source values.
- Calculation or comparison performed.
- Assumptions and limitations.
- Unresolved questions.
- Suggested next verification step.

If no source record supports a statement, the system must not present it as a verified record-backed fact.

### P0.8 — Explicit uncertainty

Support all four finding states:

- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

The UI must communicate that these states describe the available evidence, not guilt, fraud, legal liability, or certainty about events outside the dataset.

### P0.9 — Human-readable investigation brief

Display the extracted claim, relevant records, calculations, findings, and unresolved questions in a coherent view.

The user should not need to read raw JSON from the model or infer the conclusion from a collection of debug messages.

### P0.10 — Evaluation suite

Create at least 20 labelled synthetic test cases. Aim for 24–30 when time permits.

The cases must exercise the main finding states, arithmetic rules, source attribution, ambiguous references, missing evidence, and misleading inputs.

The team must be able to report actual evaluation results rather than merely showing that the application runs.

### P0.11 — Rules-only versus hybrid comparison

Compare:

- A rules-only structured workflow.
- A hybrid workflow using AI-assisted extraction or candidate matching plus deterministic checks.

Use the same labelled cases where applicable.

Report which tasks each approach gets right or wrong. Do not assume the hybrid approach is better before measuring it.

### P0.12 — Honest limitation statement

The prototype must disclose that:

- It is an experimental hackathon prototype.
- Its demonstration dataset is synthetic.
- Results are limited to the supplied records and implemented rules.
- It does not detect or prove fraud.
- It does not determine legal liability.
- Missing evidence in the dataset may exist elsewhere.
- Evaluation on synthetic cases does not establish real-world accuracy or business impact.

---

## 7. P1 — Optional Features

P1 features may be attempted only after the P0 vertical slice works end to end.

### P1.1 — Simple Hinglish input

Support selected informal Hinglish claim messages only if those messages are included in the evaluation set.

Do not claim general Hinglish support based on one successful example.

### P1.2 — Alternative candidate matches

Show more than one plausible candidate when appropriate.

Confidence labels, if implemented, must have a defined meaning. An uncalibrated model confidence score must not be presented as a statistically reliable probability that a match is correct.

A simple label such as “possible match” may be more honest than a percentage.

### P1.3 — Exportable investigation brief

Allow the user to copy the investigation brief or export JSON or a simple report.

The exported content must preserve finding states, source references, calculations, and limitations.

Export is optional and must not delay the core investigation workflow.

### P1.4 — Visual evidence trace

Provide a visual relationship among:

- Original dispute claim.
- Extracted fields.
- Candidate records.
- Deterministic checks.
- Findings.
- Unresolved questions.

This is a presentation improvement, not a substitute for correct data relationships.

### P1 prioritization rule

If a P1 feature threatens integration, testing, or demo reliability, cut it.

A complete, correct investigation is more valuable than several optional features that fail during demonstration.

---

## 8. Explicitly Out of Scope

The following are excluded from the eight-hour build unless the core workflow is complete and the team has a compelling, measured reason to reconsider a specific item.

### Document processing and integrations

- Arbitrary PDF parsing.
- OCR pipelines.
- Automatic extraction from scanned invoices.
- Live accounting integrations.
- Banking integrations.
- Email or WhatsApp integrations.
- Carrier or logistics integrations.
- Live customer data.

### Production platform features

- Authentication.
- Role-based access control.
- Multi-tenancy.
- Payment processing.
- Production deployment claims.
- Automated customer communication.
- Automated settlement or debt collection.

### AI and advanced infrastructure

- Autonomous agents.
- Voice interfaces.
- Blockchain.
- Forecasting.
- Embeddings or vector databases without a demonstrated need.
- Complex multi-agent orchestration.
- General-purpose financial reasoning.

### Product expansion

- Multiple dispute types.
- Full accounting software.
- General-purpose ERP.
- Fraud verdicts.
- Legal advice.
- Automatic decisions about which party is at fault.

**Scope rule:** a feature is not justified merely because it is technically interesting or makes the project look more sophisticated.

---

## 9. Acceptance Criteria

A case is considered **demo-ready** only when the following requirements hold.

### AC-01 — Input validation

Every supplied input row is validated against the applicable schema.

- Valid rows can proceed.
- Invalid rows display actionable errors.
- The system does not silently treat rejected or malformed rows as valid evidence.
- Any excluded rows are visible to the user.

### AC-02 — Deterministic arithmetic

Every computed quantity or amount is produced by deterministic code.

- The inputs to the calculation are inspectable.
- The calculation rule is documented.
- Incompatible units or currencies are not silently compared.
- The output can be reproduced by running the same calculation on the same inputs.

### AC-03 — Valid source attribution

Every factual finding contains valid source record IDs when source records are available.

- Each cited ID exists in the dataset.
- Each cited record is relevant to the finding.
- Conflicting findings expose the relevant records on both sides.
- The model cannot invent source IDs or citations.

For findings that describe the absence of a matching record, the system must state the search scope and use `NOT_FOUND_IN_PROVIDED_DATA` where appropriate.

### AC-04 — Unresolved cases remain unresolved

Ambiguous or insufficient evidence must not be converted into a definitive conclusion simply to complete the workflow.

- Multiple plausible matches remain visible.
- Missing evidence is identified.
- Contradictory records are surfaced.
- The system explains what additional information could help.

### AC-05 — Missing data is described accurately

The system must distinguish:

- A record not found in the provided dataset.
- A record confirmed to exist.
- A record confirmed to be linked to a transaction.
- A fact that cannot be established from the supplied data.

It must never turn “not found” into “does not exist.”

### AC-06 — Clean cases remain clean

A clean case must not produce an unsupported discrepancy.

- Compatible quantities must not be incorrectly flagged as different.
- Matching references must follow documented rules.
- Optional missing fields must not create unsupported negative conclusions.
- The expected output is checked against a labelled test case.

### AC-07 — No fraud verdicts

The app must not claim that a buyer, supplier, employee, or other party committed fraud.

It may identify discrepancies, inconsistent records, unusual values, or missing evidence where supported by the implemented checks.

It must not infer dishonest intent from those observations.

### AC-08 — Main rules are tested

Automated or repeatable tests cover:

- Schema validation.
- Duplicate identifiers.
- Quantity arithmetic.
- Amount arithmetic.
- Compatible versus incompatible units.
- Source record integrity.
- Each finding state.
- Ambiguous candidate matches.
- Missing evidence.
- Clean cases.
- Invalid or incomplete AI output.

### AC-09 — AI contribution is explainable

The team can explain:

- Which task uses AI.
- Which tasks are deterministic.
- How extracted fields are reviewed.
- How candidate matches are validated.
- What happens when AI output is wrong or unavailable.
- How the hybrid approach compares with the rules-only baseline.

### AC-10 — Evaluation results are reportable

The team has labelled test cases and can report actual results with counts and denominators.

The evaluation must include failures and must not overstate what synthetic testing establishes.

### AC-11 — The vertical slice is usable

A user can complete a demonstration without reading raw model output or manually piecing together the conclusion from logs.

### AC-12 — Failure handling is visible

Errors, unsupported inputs, missing records, and AI failures are displayed or logged in a way the team can diagnose.

The app must not silently produce a plausible-looking answer after a failed validation or failed model call.

---

## 10. Definition of Done: Vertical Slice

The vertical slice is complete when a user can provide a dispute message and the relevant structured records and see the following in the application.

### 10.1 Extracted claim

- The original dispute message.
- The structured claim fields.
- Unknown or ambiguous fields.
- A review or edit step before investigation.

### 10.2 Selected records

- Candidate records relevant to the claim.
- Stable source record IDs.
- An explanation of the match basis where available.
- Ambiguity when more than one record could match.

### 10.3 Calculations

- The source values used.
- The deterministic calculation.
- Units and currency where applicable.
- Assumptions or limitations affecting interpretation.

### 10.4 Findings

- Finding statement.
- Finding state.
- Source references.
- Conflicting evidence, if any.
- Missing or unresolved evidence.
- No unsupported fraud or legal conclusion.

### 10.5 Next verification step

The application identifies a reasonable next check based on the evidence gap.

Examples:

- Confirm that the receipt belongs to the same shipment.
- Request the receipt record if none was supplied.
- Verify whether an additional delivery was made.
- Check for a credit note or adjustment outside the supplied dataset.
- Clarify which of two candidate invoices relates to the claim.

These are suggestions for verification, not claims that the suggested event occurred.

### 10.6 Readable output

The investigation brief communicates the above in a human-readable format.

The user should not need to interpret raw LLM output to determine what the system found.

### Definition of done statement

**Given a dispute message and relevant structured records, a user can review the extracted claim, inspect the selected records, verify deterministic calculations, understand the supported, conflicting, missing, or unresolved findings, and identify the next verification step without reading raw model output.**

---

## 11. Failure Handling Requirements

Failure handling is part of the product, not optional polish.

### 11.1 Invalid schema

**Condition:** A row is malformed or lacks a required field.

**Required behavior:**

- Identify the affected row.
- Identify the invalid field or rule.
- Explain what needs correction.
- Do not proceed silently as if the row were valid.
- Do not use invalid values in calculations.

If partial processing is supported, the app must clearly show which records were excluded and how that affects the investigation.

### 11.2 No candidate record

**Condition:** No relevant record is found in the supplied dataset.

**Required behavior:**

- Use `NOT_FOUND_IN_PROVIDED_DATA` when the documented search has found no candidate for the specific requirement.
- State which record type or reference was searched for.
- Avoid claiming that the record does not exist outside the dataset.
- Suggest a useful verification step.

### 11.3 Multiple plausible records

**Condition:** Two or more records could plausibly match the claim.

**Required behavior:**

- Preserve the candidate records and their IDs.
- Use `UNRESOLVED` for the relationship that cannot be established.
- Explain the ambiguity.
- Ask for a distinguishing field or recommend the next check.
- Do not select a record solely because it produces a more convenient conclusion.

### 11.4 Contradictory records

**Condition:** Relevant records disagree on a material fact.

**Required behavior:**

- Use `CONFLICTING_RECORDS` for the conflict.
- Show the relevant source records.
- Identify the specific values that disagree.
- Do not silently discard one record.
- Do not infer which source is correct unless a documented, justified rule resolves the issue.

### 11.5 Arithmetic mismatch

**Condition:** A deterministic comparison identifies a quantity or amount discrepancy.

**Required behavior:**

- Show the values being compared.
- Show the calculated difference.
- Cite the relevant source record IDs.
- State any assumptions affecting the calculation.
- Distinguish a mathematical discrepancy from an explanation for that discrepancy.

For example, a difference of 20 units does not establish why those units were not recorded as received.

### 11.6 LLM timeout

**Condition:** The AI service does not respond within the allowed time.

**Required behavior:**

- Retry once if time and service behavior allow.
- If the retry fails, provide manual claim fields or the rules-only workflow.
- Show that AI extraction was unavailable.
- Do not invent an extracted claim or a matching result.

### 11.7 Invalid LLM output

**Condition:** The AI returns malformed JSON, an unexpected schema, missing required fields, or invalid references.

**Required behavior:**

- Validate the response before use.
- Retry once where appropriate.
- Reject invalid output if the retry fails.
- Fall back to manual fields or rules-only processing.
- Never accept model-generated source IDs without checking that the records exist.
- Never allow model text to override deterministic calculations or finding-state rules.

### 11.8 No usable records

**Condition:** The dataset is empty or contains no usable records for the selected claim.

**Required behavior:**

- Explain that the investigation cannot proceed meaningfully with the available data.
- Identify the minimum missing record types or fields.
- Allow the user to load a valid dataset or return to a demonstration case.
- Do not fabricate findings.

### 11.9 Unsupported units or currencies

**Condition:** Relevant quantities use incompatible units, or amounts use different currencies without a defined conversion rule.

**Required behavior:**

- Flag the incompatibility.
- Avoid direct comparison unless a documented conversion is available.
- Leave the relevant conclusion unresolved where necessary.
- Explain what information is required to continue.

### 11.10 Partial processing

**Condition:** Some records are valid while others are invalid.

**Required behavior:**

- Make the processing scope visible.
- Identify which rows were accepted and rejected.
- Ensure findings refer only to records actually processed.
- Warn when excluded records may affect the conclusion.

The system must never present a partial dataset as though every supplied record had been successfully considered.

---

## 12. Evaluation and Test Requirements

### 12.1 Test-set size

- Minimum: 20 labelled synthetic cases.
- Target: 24–30 cases if time permits.

The test set should include normal, discrepant, incomplete, ambiguous, conflicting, and adversarial cases.

### 12.2 Required test categories

| Test category | Expected behavior |
|---|---|
| Clean transaction | No unsupported discrepancy is produced. |
| Clear short delivery | Correct quantity difference is calculated from compatible records. |
| Missing receipt | Missing evidence is identified without asserting what actually arrived. |
| Missing credit note | No linked credit note is reported as not found in the supplied dataset. |
| Partial payment | Payment amount is shown without assuming the reason for the difference. |
| Ambiguous reference | Multiple candidates are retained and the relationship remains unresolved. |
| Conflicting receipt records | The conflict is exposed rather than silently resolved. |
| Duplicate record ID | Validation catches or explicitly handles the duplicate. |
| Incompatible units | The system does not compare incompatible quantities without conversion. |
| Incompatible currencies | The system does not treat different currencies as directly comparable. |
| Invalid AI response | Output is rejected, retried once where appropriate, or handled through fallback. |
| Unsupported fraud claim | The application does not generate a fraud verdict. |
| Missing source record | The application does not fabricate a citation. |
| Adversarial claim | The system resists unsupported conclusions and preserves uncertainty. |

### 12.3 Required evaluation outputs

The team should record:

- Total test cases.
- Number passed and failed.
- Extraction field accuracy where applicable.
- Candidate match correctness.
- Finding-state correctness.
- Source attribution correctness.
- Arithmetic correctness.
- Unsupported assertion count.
- Correct abstention count.
- Rules-only versus hybrid results.

Report actual counts and denominators. For a small test set, show the number of cases alongside any percentage.

### 12.4 Evaluation integrity

- Define expected outcomes before judging each test.
- Use the same applicable cases for baseline and hybrid comparisons.
- Record failures rather than silently changing expected results.
- Do not count an unsupported conclusion as correct merely because it sounds plausible.
- Do not claim real-world accuracy based solely on synthetic cases.

---

## 13. Demonstration Acceptance Scenarios

The live demo must include three cases.

### Scenario A — Clean case

**Purpose:** show that the system does not invent a discrepancy.

Expected behavior:

- Relevant records are identified.
- Compatible quantities and amounts are compared.
- No unsupported shortage is reported.
- The output explains what the records support.

### Scenario B — Quantity discrepancy

**Purpose:** demonstrate source-linked deterministic analysis.

Expected behavior:

- The claim is extracted or entered manually.
- Relevant records are selected.
- The quantity difference is calculated by code.
- The calculation cites source records.
- Any value calculation states its assumptions.
- The finding does not infer intent or fraud.

### Scenario C — Ambiguous or missing evidence

**Purpose:** demonstrate restraint when the evidence is insufficient.

Expected behavior:

- The system identifies missing or conflicting information.
- The appropriate unresolved or not-found state is shown.
- Multiple candidates remain visible where applicable.
- The application proposes a reasonable verification step.
- It does not force a definitive conclusion.

### Demo fallback

The team must retain preloaded synthetic cases and a rules-only fallback so that an AI timeout or network problem does not destroy the demonstration.

The fallback must be genuine application behavior, not a prerecorded claim presented as a live AI result.

---

## 14. Eight-Hour Implementation Priorities

The team should work toward the first complete vertical slice as early as possible.

### 0:00–0:30 — Freeze the contract

Agree on:

- Supported dispute type.
- Record schemas.
- Finding states.
- Matching rules.
- Calculation rules.
- Request and response formats.
- Canonical demonstration cases.

**Exit condition:** every team member knows the minimum request, response, and evidence structures.

### 0:30–1:30 — Build components in parallel

- Backend: schemas, validation, deterministic checks.
- AI: claim extraction and structured response validation.
- Frontend: claim review, case selection, findings view using a mocked response.
- Evaluation: synthetic labelled cases and expected outcomes.

**Exit condition:** each component can demonstrate its own contract without depending on unfinished components.

### 1:30–2:30 — Integrate the vertical slice

Connect the UI, backend, matching logic, AI extraction, and findings view.

**Exit condition:** at least one synthetic case completes the full workflow.

### 2:30–3:00 — Integration hard gate

Test a clean case and a discrepancy case end to end.

If the complete workflow is still broken at hour three, cut optional features and fix the integration path.

**Hard rule:** do not spend the remaining time polishing disconnected components.

### 3:00–4:30 — Correctness and evaluation

- Run the labelled test cases.
- Fix incorrect calculations and source references.
- Test ambiguous cases.
- Compare rules-only and hybrid behavior.
- Record failures and results.

### 4:30–5:30 — Evidence trace and uncertainty

- Improve source visibility.
- Make calculations inspectable.
- Clarify finding states.
- Show missing evidence and next verification steps.
- Test invalid input and AI failure handling.

### 5:30–6:00 — Feature freeze

Stop adding features unless a core defect requires a change.

Prioritize a stable, testable application over last-minute functionality.

### 6:00–7:00 — Demo preparation

Prepare:

- One clean case.
- One discrepancy case.
- One ambiguous or missing-evidence case.
- A concise explanation of the AI role.
- Actual evaluation results.
- A limitations statement.

### 7:00–8:00 — Rehearsal and fallback

- Run the complete demo.
- Check the expected outputs.
- Verify the rules-only fallback.
- Prepare for an AI timeout or invalid response.
- Rehearse judge questions and limitations.

---

## 15. Feature-Cut Order

If time is running short, cut features in this order:

1. Downloadable report formatting.
2. Additional language variations.
3. Alternative candidate-ranking enhancements.
4. Elaborate visual trace animations.
5. Optional model-only comparison.
6. Nonessential UI polish.

Preserve:

- Schema validation.
- Deterministic calculations.
- Source-linked findings.
- Explicit uncertainty.
- A working end-to-end workflow.
- Main automated or repeatable tests.
- Rules-only versus hybrid evaluation.
- Honest failure handling.
- A reliable demo.

Never cut a correctness requirement just to make the presentation look more complete.

---

## 16. Final Definition of MVP Success

ProofTrail's MVP is successful for the hackathon when:

1. It completes one short-delivery investigation from a claim and structured records to a human-readable brief.
2. Every supplied row is validated and invalid data is surfaced.
3. All quantity and amount calculations are deterministic and inspectable.
4. Findings cite valid source record IDs where applicable.
5. Conflicting, missing, and ambiguous evidence is represented explicitly.
6. Clean cases do not produce unsupported discrepancies.
7. The system does not issue fraud or legal verdicts.
8. At least 20 labelled synthetic test cases have been evaluated.
9. Rules-only and hybrid behavior have been compared honestly.
10. The team can explain the AI contribution, failure modes, and limitations.
11. The demo remains usable if the AI service fails.

### Final scope rule

**ProofTrail is not judged by how many features it contains. It is judged by whether one narrow investigation workflow is correct, traceable, testable, understandable, and honest about what the evidence cannot establish.**
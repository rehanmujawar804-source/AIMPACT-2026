# 04 — Data Contracts & Architecture

## 1. Purpose and Architecture Principles

This document defines the minimum viable architecture, data model, claim extraction contract, finding contract, deterministic verification rules, API interfaces, validation behavior, and privacy requirements for ProofTrail.

ProofTrail is an evidence-first investigation workspace for short-delivery or quantity-discrepancy disputes between B2B buyers and suppliers.

The objective is to build one complete, testable investigation workflow within an eight-hour hackathon—not a production accounting platform.

### Core architecture principles

1. **Structured records are the evidence source.** The system must distinguish supplied source records from claims extracted from messages.
2. **Deterministic code owns calculations.** Quantity differences, amount calculations, validation, and documented finding-state rules must not depend on free-form LLM reasoning.
3. **AI assists interpretation.** It may extract claim fields, suggest candidate matches, and explain verified findings.
4. **Source references must be verifiable.** Every cited record ID must exist in the dataset actually processed.
5. **Uncertainty is a valid outcome.** Ambiguous relationships and insufficient evidence must remain unresolved.
6. **One backend is enough.** Use a modular monolith rather than splitting the prototype into microservices.
7. **The same contracts serve every component.** The frontend, backend, AI layer, and evaluator must share agreed schemas.
8. **The application must survive AI failure.** Manual claim entry and rules-only investigation remain available.
9. **The demo uses synthetic data.** No real customer invoices, bank references, or personal data should be sent to external models.
10. **Build the vertical slice first.** Do not expand the architecture before the main investigation path works.

---

## 2. Recommended Architecture

Use a small web frontend, one backend/service layer, deterministic verification modules, and an optional LLM adapter.

```text
User / Synthetic Demo Case
          |
          v
     Web Frontend
          |
          v
  Investigation API
          |
          v
     Input Validator
          |
          +------ Invalid rows / errors ------> Validation UI
          |
          v
     Claim Processing
          |
          +------ LLM extraction
          |          |
          |          v
          |    Schema validation
          |          |
          +------ Manual fallback
                     |
                     v
            Candidate Record Matcher
                     |
                     v
         Deterministic Verification Engine
                     |
                     v
           Evidence / Findings Builder
                     |
                     v
          Investigation Response
                     |
                     v
            Findings and Trace UI
                     |
                     v
               Copy / Export
```

### 2.1 Component responsibilities

**Frontend**

Responsible for:

- Selecting a synthetic case or entering a dispute message.
- Displaying validation errors.
- Reviewing and editing extracted claim fields.
- Displaying candidate matches.
- Showing findings, calculations, sources, and unresolved questions.
- Triggering investigation and evaluation requests.
- Offering copy/export functionality if implemented.

The frontend must not calculate authoritative quantity or amount findings independently of the backend.

**Investigation API**

Responsible for:

- Accepting and validating requests.
- Coordinating the investigation pipeline.
- Returning structured responses.
- Handling errors and AI fallbacks.
- Providing a stable interface for the frontend and evaluator.

**Input Validator**

Responsible for:

- Validating record schemas.
- Checking stable identifiers and duplicates.
- Checking required fields and field types.
- Identifying unsupported units or currencies.
- Reporting invalid records before they are used in findings.

**Claim Extraction Adapter**

Responsible for:

- Converting the dispute message into a structured claim.
- Preserving unknown fields.
- Distinguishing directly stated fields from inferred fields.
- Validating the model response against the agreed schema.
- Falling back to manual entry when necessary.

**Candidate Record Matcher**

Responsible for:

- Identifying possible links between the claim and supplied records.
- Using explicit identifiers and documented matching rules.
- Incorporating AI suggestions where appropriate.
- Preserving multiple plausible candidates.
- Avoiding unsupported automatic links.

**Deterministic Verification Engine**

Responsible for:

- Performing quantity and amount calculations.
- Checking compatible units and currencies.
- Comparing relevant transaction records.
- Detecting inconsistencies under documented rules.
- Producing structured verification results.

**Evidence and Findings Builder**

Responsible for:

- Converting verification results into the standard finding contract.
- Attaching valid source record IDs.
- Assigning documented finding states.
- Including assumptions, limitations, and next verification steps.
- Preventing unsupported conclusions from being presented as verified facts.

**Evaluation Module**

Responsible for:

- Running labelled synthetic cases through supported modes.
- Comparing rules-only and hybrid results.
- Calculating evaluation metrics from actual outputs.
- Reporting failures as well as successes.

### 2.2 Architecture decision

A **modular monolith** is sufficient.

Keep validation, extraction, matching, verification, findings, and evaluation in separate modules or functions, but run them within one application.

Do not introduce separate services, a message broker, a vector database, a complex orchestration framework, or a production database unless a demonstrated requirement makes one necessary.

---

## 3. Shared Data Conventions

All implementation work must follow these conventions.

### 3.1 JSON and field names

- Use JSON-compatible data at API boundaries.
- Use `snake_case` for field names.
- Use stable string identifiers for records and investigations.
- Represent unknown optional values as `null`.
- Represent dates as ISO-formatted calendar dates (`YYYY-MM-DD`) unless a timestamp is explicitly required.
- Use documented enumerations for finding states and processing modes.
- Reject unsupported field types rather than silently coercing them.

### 3.2 Stable record IDs

Every source record must have a `record_id`.

Examples:

- `PO-001`
- `INV-001`
- `DSPT-001`
- `POD-001`
- `PAY-001`
- `CN-001`

IDs must be unique within the investigation dataset.

A business identifier such as `invoice_id` is not automatically interchangeable with `record_id`. They may contain the same string in simple synthetic cases, but their meanings should remain distinct.

- `record_id`: identifies a supplied source record.
- `invoice_id`: identifies an invoice referenced by a claim or another record.
- `shipment_id`: identifies a shipment referenced by a claim or another record.
- `po_id`: identifies a purchase order.

Source citations must use `record_id`.

### 3.3 Numeric values

Quantities and monetary values must be represented using validated numeric types.

For calculations involving currency, use decimal-safe arithmetic in the backend rather than binary floating-point arithmetic where precision matters.

The API may serialize monetary values as JSON numbers for this prototype, provided the backend uses a defined precision strategy and tests rounding behavior.

### 3.4 Currency and units

Each quantity comparison must establish unit compatibility.

Each monetary comparison must establish currency compatibility.

Do not compare `100 pcs` directly with `80 boxes`, or ₹12,000 directly with US$12,000, without a verified conversion rule.

Unsupported conversions must produce a validation warning or unresolved finding.

### 3.5 Provenance

Keep the following concepts separate:

- Original user message.
- Extracted claim.
- Supplied source records.
- Candidate matches.
- Deterministic calculations.
- Findings.
- Generated explanations.

An extracted claim is not a source record. A candidate match is not a verified relationship. A generated explanation is not independent evidence.

---

## 4. Minimum Viable Data Model

The initial data model covers a dispute and six transaction-record categories.

The following examples are illustrative. IDs, dates, parties, quantities, and amounts are synthetic.

### 4.1 Dispute

The dispute object stores the original message and any known references.

```json
{
  "dispute_id": "DSP-001",
  "message": "We received only 80 of the 100 units invoiced.",
  "claimed_issue": "short_delivery",
  "invoice_id": "INV-001",
  "shipment_id": "SHP-001"
}
```

Field meanings:

| Field | Meaning | Requirement |
|---|---|---|
| `dispute_id` | Stable identifier for the dispute input | Required |
| `message` | Original dispute statement | Required when using message extraction |
| `claimed_issue` | User-supplied issue category, if known | Optional |
| `invoice_id` | Invoice reference explicitly supplied or subsequently reviewed | Optional |
| `shipment_id` | Shipment reference explicitly supplied or subsequently reviewed | Optional |

The original message must be preserved unchanged for review.

The claim extractor must not silently overwrite the original message or treat an inferred reference as though the user explicitly supplied it.

### 4.2 Purchase order

```json
{
  "record_id": "PO-REC-001",
  "po_id": "PO-001",
  "buyer_id": "BUY-001",
  "supplier_id": "SUP-001",
  "item_id": "ITEM-01",
  "ordered_qty": 100,
  "unit": "pcs",
  "unit_price": 150,
  "currency": "INR",
  "date": "2026-10-10"
}
```

Field meanings:

- `record_id`: stable source-record ID.
- `po_id`: business purchase-order reference.
- `buyer_id` and `supplier_id`: synthetic party references.
- `item_id`: product or line-item identifier.
- `ordered_qty`: quantity ordered.
- `unit`: quantity unit.
- `unit_price`: stated unit price.
- `currency`: currency for the price.
- `date`: purchase-order date.

The minimum implementation may omit party fields when they are not needed for a particular rule, but required versus optional fields must be specified in the schema.

### 4.3 Invoice

```json
{
  "record_id": "INV-REC-001",
  "invoice_id": "INV-001",
  "po_id": "PO-001",
  "shipment_id": "SHP-001",
  "item_id": "ITEM-01",
  "invoiced_qty": 100,
  "unit": "pcs",
  "unit_price": 150,
  "line_amount": 15000,
  "currency": "INR",
  "date": "2026-10-11"
}
```

The invoice represents the quantity and amount billed.

The verification engine may calculate the expected line amount as quantity multiplied by unit price and compare it with the stored line amount.

That calculation must account for the defined contract. If taxes, discounts, or other line adjustments are not represented in the MVP schema, the comparison must be labelled as a simple line-total check rather than a complete invoice reconciliation.

### 4.4 Dispatch

```json
{
  "record_id": "DSPT-REC-001",
  "shipment_id": "SHP-001",
  "invoice_id": "INV-001",
  "item_id": "ITEM-01",
  "dispatched_qty": 100,
  "unit": "pcs",
  "dispatch_date": "2026-10-11"
}
```

A dispatch record represents what the supplied record states was dispatched.

It does not, by itself, establish what the buyer received.

### 4.5 Receipt / proof of delivery

```json
{
  "record_id": "POD-REC-001",
  "shipment_id": "SHP-001",
  "invoice_id": "INV-001",
  "item_id": "ITEM-01",
  "received_qty": 80,
  "unit": "pcs",
  "signed": true,
  "receipt_date": "2026-10-12"
}
```

A receipt record represents the receipt quantity recorded in the supplied data.

The `signed` field is a property of the supplied record. The prototype must not claim to independently authenticate a signature or verify the legal validity of the document.

### 4.6 Payment

```json
{
  "record_id": "PAY-REC-001",
  "invoice_id": "INV-001",
  "amount": 12000,
  "currency": "INR",
  "payment_date": "2026-10-15",
  "reference": "BANK-REF-001"
}
```

The payment record states the payment amount recorded in the dataset.

A partial payment must not automatically be attributed to a delivery dispute. The reason for the payment difference must be supported by evidence before the system can describe it as established.

### 4.7 Credit note

```json
{
  "record_id": "CN-REC-001",
  "invoice_id": "INV-001",
  "amount": 3000,
  "currency": "INR",
  "date": "2026-10-16",
  "reason": "short_delivery_adjustment"
}
```

A credit note may affect the amount outstanding or explain an adjustment.

The MVP should link credit notes to invoices only when a valid reference or reviewed relationship supports that link.

A missing credit note in the supplied dataset does not establish that no credit note exists outside it.

### 4.8 Canonical record collection

The API should use one predictable collection structure:

```json
{
  "purchase_orders": [],
  "invoices": [],
  "dispatches": [],
  "receipts": [],
  "payments": [],
  "credit_notes": []
}
```

All collections must be validated before the investigation uses them.

---

## 5. Claim Extraction Contract

### 5.1 Purpose

The claim extractor converts an informal dispute message into structured fields that the user can review.

The extractor must identify what is explicitly stated, distinguish derived or inferred values, preserve uncertainty, and flag fields requiring human review.

It must not decide whether the dispute is valid.

### 5.2 Proposed extraction schema

```json
{
  "dispute_id": "DSP-001",
  "issue_type": "short_delivery",
  "claimed_qty": 20,
  "unit": "pcs",
  "claimed_amount": 3000,
  "currency": "INR",
  "mentioned_invoice_id": "INV-001",
  "mentioned_shipment_id": "SHP-001",
  "claim_text_span": "received only 80 of the 100 units invoiced",
  "field_provenance": {
    "claimed_qty": "inferred",
    "unit": "explicit",
    "claimed_amount": "unknown",
    "mentioned_invoice_id": "unknown",
    "mentioned_shipment_id": "unknown"
  },
  "missing_fields": [],
  "needs_human_review": true
}
```

This is an illustrative schema shape, not a requirement that every message produces these exact values.

**Important:** if a message only says “we received 80 of 100 units,” the model may calculate a difference of 20 only if the system's extraction contract permits derived quantities and records that the value was inferred. The model must not invent an invoice ID, shipment ID, price, or monetary claim.

The example should be revised during implementation if the final schema uses a different provenance representation. The team must agree on one canonical format before parallel development.

### 5.3 Required extraction behavior

- Preserve the original dispute message.
- Extract only supported fields.
- Represent unknown optional values as `null` or an explicitly documented unknown state.
- Distinguish explicit values from inferred values.
- Preserve the text span supporting important extracted fields where feasible.
- Do not silently infer invoice or shipment IDs from weak candidate matches.
- Validate the returned structure against the agreed schema.
- Mark ambiguous or uncertain extraction for human review.
- Permit manual correction before investigation.

### 5.4 Provenance values

For fields where provenance is tracked, use a documented set of values such as:

- `explicit`: stated directly in the dispute message.
- `derived`: calculated from directly stated values under an explicit rule.
- `inferred`: suggested by interpretation and requiring review.
- `unknown`: not established by the supplied message.

Do not use `inferred` to mean that a field has been verified.

### 5.5 Human review

The frontend must show the extracted fields before they are treated as accepted claim inputs.

If a field is inferred, ambiguous, or missing, the UI must make that clear.

The user must be able to correct extracted fields or switch to manual entry.

### 5.6 AI extraction failure

If the model times out or returns invalid output:

1. Retry once if appropriate.
2. Validate the retry.
3. If it still fails, display an understandable error.
4. Allow manual claim entry or rules-only processing.
5. Do not manufacture a successful extraction result.

---

## 6. Candidate Record Matching Contract

### 6.1 Purpose

Candidate matching identifies which supplied records may relate to the dispute.

It is a separate step from verification.

### 6.2 Matching inputs

Candidate matching may consider:

- Explicit invoice reference.
- Explicit shipment reference.
- Purchase-order reference.
- Item identifier.
- Quantity and unit.
- Dates.
- Other documented transaction relationships.

AI may suggest matches when the message uses informal language or inconsistent references, but deterministic checks must validate the existence and compatibility of the selected records.

### 6.3 Proposed candidate structure

```json
{
  "candidate_id": "CAND-001",
  "record_id": "POD-REC-001",
  "record_type": "receipt",
  "match_status": "POSSIBLE_MATCH",
  "match_reasons": [
    "Shipment reference matches the reviewed claim."
  ],
  "requires_review": false
}
```

The exact matching vocabulary must be finalized before implementation.

A candidate status such as `POSSIBLE_MATCH` is not a finding status and must not be confused with the four approved finding states.

### 6.4 Matching rules

- An explicit, unique, validated identifier is stronger evidence than a vague text similarity.
- AI-suggested matches must be checked against actual supplied record IDs.
- Weak or contradictory references must not be treated as confirmed links.
- Multiple plausible candidates must remain visible.
- A missing candidate must not trigger a fabricated source record.
- Candidate explanations must describe the actual matching basis.

### 6.5 Matching failure

If no candidate can be identified, return an empty candidate list and create an appropriate not-found or unresolved finding, depending on what was searched and whether the absence can be stated accurately.

If multiple candidates remain plausible, preserve them and mark the relationship unresolved.

---

## 7. Finding Contract

### 7.1 Purpose

The finding contract is the common output format for deterministic verification and the frontend.

Every finding must communicate what was observed, how it was established, which records support it, and what remains uncertain.

### 7.2 Proposed finding schema

```json
{
  "finding_id": "F-001",
  "status": "CONFLICTING_RECORDS",
  "claim": "Receipt quantity differs from invoice quantity",
  "summary": "Invoice records 100 pcs; linked receipt records 80 pcs.",
  "source_record_ids": [
    "INV-REC-001",
    "POD-REC-001"
  ],
  "calculation": {
    "expression": "100 - 80",
    "result": 20,
    "unit": "pcs"
  },
  "assumptions": [
    "Both records refer to the same item and shipment."
  ],
  "limitations": [
    "Other deliveries may exist outside the supplied dataset."
  ],
  "next_step": "Verify whether the receipt covers the complete shipment."
}
```

The schema may be expanded with structured fields such as `finding_type`, `source_values`, or `rule_id` if those fields improve implementation or testing. Any extension must be agreed upon and documented.

### 7.3 Approved finding states

Only the following finding states are allowed in the MVP:

- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

Do not introduce `FRAUD`, `GUILTY`, `PROVEN`, or equivalent states.

### 7.4 Source-reference requirements

- Every source ID must exist in the validated dataset.
- A finding must cite the records relevant to that specific statement.
- A conflict should expose the relevant records on both sides.
- A calculated finding should cite the records supplying the calculation inputs.
- A finding without sufficient source evidence must remain unresolved or explicitly describe the limitation.
- The LLM cannot generate or validate its own source IDs.

### 7.5 Calculation requirements

Where a finding includes a calculation, it should expose:

- Input values.
- Source records.
- Calculation expression or rule.
- Result.
- Unit or currency.
- Assumptions affecting interpretation.

The UI should render the calculation from structured values. It must not treat a model-generated expression or number as authoritative.

### 7.6 Limitations and next steps

Limitations should explain what the available records cannot establish.

Next steps should identify a practical verification action, such as requesting a missing receipt record or confirming whether another delivery was made.

They must not imply that the suggested event definitely occurred.

---

## 8. Deterministic Verification Rules

Deterministic verification is the core trust mechanism of ProofTrail.

The verification engine should produce structured results from validated records, using documented rules that can be unit-tested independently of the LLM.

### Rule 1 — Validate records before comparison

Check:

- Required fields.
- Stable record IDs.
- Duplicate IDs.
- Field types.
- Relevant references.
- Units and currencies.
- Required numeric values.

Invalid records must not silently enter authoritative calculations.

### Rule 2 — Check transaction relationships

Before comparing quantities, verify that the records are linked through valid identifiers or an explicitly reviewed relationship.

Check relevant:

- Invoice references.
- Shipment references.
- Item references.
- Purchase-order references.
- Other relationship fields required by the rule.

A weak text similarity is not enough to establish that two records describe the same transaction.

### Rule 3 — Check units and currencies

Before comparing quantities, establish unit compatibility.

Before comparing amounts, establish currency compatibility.

If the system lacks a verified conversion rule, do not perform the comparison.

### Rule 4 — Check invoice arithmetic

Where the schema provides quantity, unit price, and line amount, calculate:

`expected_line_amount = invoiced_qty × unit_price`

Compare the calculated amount with the stored line amount.

If they differ, create a finding that identifies the discrepancy and the source record.

The calculation does not constitute a complete tax, discount, or invoice reconciliation unless those fields and rules are explicitly implemented.

### Rule 5 — Compare invoiced and received quantities

Compare invoice quantity with receipt quantity only when:

- The item references align.
- The relevant transaction or shipment relationship is sufficiently established.
- The units are compatible.
- The quantities are valid.

Calculate the numerical difference only after these checks.

A positive difference may be a quantity discrepancy, but it does not automatically establish why the difference exists or which party is responsible.

### Rule 6 — Compare dispatch and receipt separately

Dispatch records describe what was recorded as dispatched. Receipt records describe what was recorded as received.

If the relevant records are compatible, calculate the difference between dispatched and received quantities.

Do not assume that a dispatch record proves receipt, or that a receipt record covers every delivery related to an invoice.

### Rule 7 — Calculate potential quantity value cautiously

A potential monetary value may be calculated when:

- The relevant quantity difference is valid.
- The applicable unit price is available.
- The currency is known.
- The unit-price basis is compatible.
- Relevant adjustments required for the calculation are either represented or explicitly excluded from the estimate.

Example:

`potential_value = quantity_difference × applicable_unit_price`

The result must be labelled as a conditional or indicative value if taxes, discounts, returns, or other adjustments are not fully modelled.

### Rule 8 — Handle payments separately

Payment amounts must be evaluated separately from delivery quantities.

The system may report that a payment record contains a particular amount and that the invoice contains a different amount.

It must not infer that a partial payment was caused by a delivery dispute unless the supplied evidence establishes that connection.

### Rule 9 — Handle credit notes separately

Credit notes and adjustments must be linked using valid references or reviewed relationships.

Where relevant, the system may compare an invoice amount, recorded payments, and linked credit notes under a documented calculation rule.

Do not assume that every credit note is a shortage adjustment or that every missing credit note indicates an error.

### Rule 10 — Missing records

If a required record is not found, state:

“No matching record was found in the provided dataset.”

Do not state that the record does not exist in reality.

### Rule 11 — Ambiguous relationships

If several records could match a claim and the available evidence cannot distinguish them, preserve the candidates and return an unresolved relationship.

### Rule 12 — Contradictory records

If relevant records disagree on a material fact, expose the disagreement.

Do not silently discard a contradictory record or select the more convenient result.

### Rule 13 — No intent inference

Quantity or amount differences are observations, not evidence of dishonest intent.

The verification engine must not assign fraud, guilt, or legal liability.

---

## 9. API Contract: Investigation Endpoint

### Endpoint

`POST /api/investigations`

### Purpose

Run a single short-delivery investigation using the supplied dispute and structured records.

### Request example

```json
{
  "dispute": {
    "dispute_id": "DSP-001",
    "message": "We received only 80 of the 100 units invoiced."
  },
  "records": {
    "purchase_orders": [],
    "invoices": [],
    "dispatches": [],
    "receipts": [],
    "payments": [],
    "credit_notes": []
  },
  "mode": "hybrid"
}
```

The empty collections are placeholders in this example. A meaningful investigation requires the relevant records to be supplied.

### Supported modes

- `rules_only`: manual or supplied claim fields plus deterministic matching and verification.
- `hybrid`: AI-assisted claim extraction or candidate suggestions, followed by validation and deterministic verification.

An `llm_only` mode is not required for the application workflow. If implemented for evaluation, it must be clearly separated from authoritative production-style findings and must never bypass safety, source-validation, or deterministic checks in the main application.

### Response example

```json
{
  "investigation_id": "INVEST-001",
  "dispute_id": "DSP-001",
  "claim_extraction": {
    "issue_type": "short_delivery",
    "claimed_qty": 20,
    "unit": "pcs",
    "mentioned_invoice_id": null,
    "mentioned_shipment_id": null,
    "needs_human_review": true
  },
  "candidate_matches": [],
  "findings": [],
  "unresolved_questions": [],
  "evaluation_metadata": {
    "mode": "hybrid",
    "model_used": null,
    "fallback_used": false
  }
}
```

This response is illustrative. Actual extraction and findings must be generated from the request data and the implemented rules.

### Required response behavior

The response must:

- Include a stable investigation ID.
- Identify the processing mode.
- Return validated claim fields.
- Return candidate matches with real source record IDs.
- Return findings using only approved finding states.
- Include unresolved questions where applicable.
- Report fallback use and relevant processing metadata.
- Never return fabricated source references.

### Error handling

Use consistent structured errors for malformed requests and invalid records.

A validation error should identify the affected collection, record, and field where possible.

For partial processing, the response must clearly identify rejected rows and disclose that the findings apply only to the records actually processed.

---

## 10. API Contract: Evaluation Endpoint

### Endpoint

`POST /api/evaluate`

### Purpose

Run the same labelled synthetic test cases through supported approaches and compare their outputs.

### Conceptual request

```json
{
  "case_set_id": "short_delivery_v1",
  "modes": [
    "rules_only",
    "hybrid"
  ]
}
```

If the implementation uses a fixed built-in test set, the endpoint may accept only the requested modes and use that fixed set. The exact interface must be agreed before implementation.

### Evaluation requirements

- Use the same applicable labelled cases across the compared modes.
- Preserve expected results separately from model outputs.
- Validate all outputs before scoring them.
- Calculate metrics from actual test results.
- Record failures and unsupported assertions.
- Include denominators when reporting counts or percentages.
- Distinguish synthetic evaluation from real-world performance.

### Suggested output shape

```json
{
  "case_set_id": "short_delivery_v1",
  "results": [
    {
      "mode": "rules_only",
      "cases_evaluated": 24,
      "cases_passed": 0,
      "cases_failed": 0,
      "metrics": {},
      "failure_examples": []
    },
    {
      "mode": "hybrid",
      "cases_evaluated": 24,
      "cases_passed": 0,
      "cases_failed": 0,
      "metrics": {},
      "failure_examples": []
    }
  ],
  "limitations": [
    "Results apply only to the synthetic cases evaluated."
  ]
}
```

The zero values are placeholders, not target performance. They must be replaced with actual results.

Do not return an empty metric object as though evaluation has been completed. The final implementation must either populate actual measurements or explicitly report that a metric was not evaluated.

### Optional LLM-only comparator

An LLM-only comparator may be included as a research baseline if time permits. Its outputs must be scored against the same expected results, and unsupported assertions must count as failures where applicable.

It must not be used as the authoritative finding pipeline.

---

## 11. API and Data Contract Agreement

Before parallel implementation begins, the team must freeze the following shared decisions:

1. Exact record schemas and required fields.
2. Unique-ID validation behavior.
3. Claim extraction schema and provenance representation.
4. Candidate match structure and matching statuses.
5. Approved finding states.
6. Rules for assigning finding states.
7. Finding response schema.
8. Investigation request and response structure.
9. Error response format.
10. Supported modes and fallback behavior.
11. Evaluation request and result format.
12. Source-reference integrity requirements.

No component should invent a private response format and expect another component to adapt later.

If a contract changes, communicate it to every affected component and update the tests.

---

## 12. Suggested Project Module Structure

The exact stack may follow the team's existing repository, but the responsibilities should remain separated.

A possible layout is:

```text
prooftrail/
├── README.md
├── .env.example
├── .gitignore
├── docs/
│   ├── 01_PRODUCT_BRIEF.md
│   ├── 02_DIFFERENTIATION_AND_COMPETITORS.md
│   ├── 03_SCOPE_AND_ACCEPTANCE_CRITERIA.md
│   └── 04_DATA_CONTRACTS_AND_ARCHITECTURE.md
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── investigations.py
│   │   │   └── evaluation.py
│   │   ├── schemas/
│   │   │   ├── dispute.py
│   │   │   ├── records.py
│   │   │   ├── claim.py
│   │   │   └── findings.py
│   │   ├── services/
│   │   │   ├── validation.py
│   │   │   ├── extraction.py
│   │   │   ├── matching.py
│   │   │   ├── verification.py
│   │   │   ├── findings.py
│   │   │   └── evaluation.py
│   │   └── tests/
│   └── requirements.txt
├── frontend/
│   └── ...
└── data/
    ├── cases/
    └── test_cases/
```

This is a suggested structure, not a requirement to create every file in advance.

The team should avoid spending valuable hackathon time creating empty directories or abstractions before the first working case exists.

---

## 13. Security and Privacy Requirements

### 13.1 Synthetic data only

Use synthetic records for the hackathon.

Do not upload real customer names, invoices, bank references, phone numbers, addresses, or other personal or confidential business data to an external model.

### 13.2 API keys

- Store keys in environment variables.
- Keep local `.env` files out of Git.
- Provide an `.env.example` containing placeholder variable names, not real secrets.
- Never commit API keys or tokens.
- Do not expose server-side keys in frontend code.

### 13.3 Logging

Do not log secrets or unnecessary raw dispute content.

Logs should focus on:

- Request and processing status.
- Validation error categories.
- Processing mode.
- Fallback use.
- Test outcomes.
- Debug information needed to diagnose failures.

For the synthetic demo, limited input logging may be acceptable for debugging, but the team should not build habits that would expose sensitive data in a real deployment.

### 13.4 External model calls

Only send the minimum synthetic information required for the extraction or matching task.

Validate all external model responses before use.

Treat model output as untrusted input: it may be malformed, incomplete, contradictory, or unsupported.

### 13.5 Failure fallback

If the external LLM is unavailable:

- The user can enter claim fields manually.
- The rules-only workflow remains usable.
- Deterministic checks continue to work.
- The application identifies that AI extraction was unavailable.
- No fabricated AI result is displayed.

---

## 14. Implementation Order

The recommended implementation order is:

### Step 1 — Freeze schemas

Agree on the record, claim, candidate-match, finding, and API contracts.

### Step 2 — Build synthetic cases

Create a clean case, a clear discrepancy case, and an ambiguous or missing-evidence case.

### Step 3 — Implement validation

Reject or flag malformed records before they are used in authoritative findings.

### Step 4 — Implement deterministic verification

Add quantity and amount calculations, compatibility checks, and source-reference validation.

### Step 5 — Build the findings response

Return structured findings with approved states, source IDs, assumptions, limitations, and next steps.

### Step 6 — Connect the frontend

Display claim input, validation results, records, calculations, findings, and unresolved questions.

### Step 7 — Add AI extraction

Connect the LLM only after the manual and rules-only path can complete a case.

### Step 8 — Add candidate suggestions

Integrate AI-assisted candidate matching only if the core workflow is stable and the team can validate the suggestions.

### Step 9 — Run evaluation

Compare rules-only and hybrid behavior against the same labelled synthetic cases.

### Step 10 — Rehearse failure handling

Test invalid input, ambiguous matches, missing evidence, malformed AI output, and AI unavailability.

**Critical milestone:** the team should have at least one complete end-to-end case before the midpoint of the hackathon. If that milestone is missed, cut optional features and prioritize integration.

---

## 15. Definition of Done

The architecture and contracts are implemented sufficiently for the hackathon when:

- All supported input records follow the shared schema.
- Invalid records produce visible validation errors.
- Claim extraction returns validated structured fields or falls back safely.
- Candidate matches refer to actual source records.
- Quantity and amount calculations are deterministic.
- Finding states follow documented rules.
- Every source reference can be verified.
- Ambiguous relationships remain unresolved.
- Missing records are described as missing from the provided dataset.
- The investigation API returns the agreed response structure.
- The UI renders the response without requiring raw model output.
- Rules-only investigation works without an external model.
- The evaluation module can compare the rules-only and hybrid modes on labelled synthetic cases.
- API keys and secrets are not committed to the repository.
- The team can explain the architecture, AI boundaries, and limitations.

---

## 16. Final Architecture Decision

**ProofTrail will use a modular monolith with a small web frontend, one backend API, schema validation, optional AI-assisted claim extraction and candidate matching, deterministic verification, source-linked findings, and a rules-only fallback.**

The input records and deterministic calculations remain the source of truth. The LLM is an assistive component, not an authority.

The architecture should remain intentionally small until measured needs justify expansion.

**Success means that every team member can exchange data through one agreed contract and the prototype can trace a short-delivery claim from the original message to inspectable, source-linked findings without inventing evidence or hiding uncertainty.**
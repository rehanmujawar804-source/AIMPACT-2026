# 07 — Eight-Hour Execution Plan

## 1. Purpose

This document defines the team's execution strategy for building ProofTrail during an eight-hour hackathon.

The goal is to deliver a working, evidence-first short-delivery investigation workflow that can:

1. Accept a dispute message and relevant structured transaction records.
2. Extract or manually enter the claim.
3. identify relevant source records.
4. Run deterministic quantity, reference, and arithmetic checks.
5. Produce findings linked to actual source records.
6. Preserve uncertainty when the available evidence is incomplete or conflicting.
7. Demonstrate the hybrid workflow against a rules-only baseline on labelled synthetic cases.

The team must prioritize a complete, testable vertical slice over the number of features implemented.

**Definition of success:** a judge can enter or select a synthetic dispute, inspect the relevant source records, see the calculations and evidence supporting each finding, and understand what remains unresolved.

This plan assumes an eight-hour build window. Actual ownership should be adjusted to the team's strengths and the tools available on the day.

---

## 2. Core Execution Principles

### 2.1 One source of truth

The repository is the source of truth for code, schemas, fixtures, expected results, and implementation decisions.

Do not maintain competing versions of the API contract in separate documents or chat messages.

Keep the agreed contracts in shared files and update them deliberately.

### 2.2 Small contracts before parallel implementation

Parallel work is useful only when teammates agree on what they are building.

Before separate components are implemented, agree on:

- The minimum dispute input.
- The source-record schema.
- The claim-extraction response.
- The finding object.
- The allowed finding statuses.
- The API request and response.
- The canonical test cases.
- The acceptance criteria.

A small stable contract is better than a comprehensive schema that no one finishes implementing.

### 2.3 Early integration

Do not wait until the last hour to connect the frontend, backend, and AI extraction.

The first end-to-end workflow should exist by approximately 2.5 hours into the event, with an integration hard gate at hour 3.

If the first slice does not work, stop adding features and fix the integration path.

### 2.4 Deterministic core, assistive AI

The product must remain useful if the model is unavailable.

AI may help interpret the dispute and suggest candidate records. Deterministic code owns validation, calculations, record integrity, and finding-state rules.

The fallback must be a real working path, not a slide explaining what the team would have built.

### 2.5 Evidence before presentation polish

A polished interface cannot compensate for incorrect calculations or unsupported findings.

Priority order:

1. Correct record relationships.
2. Correct calculations.
3. Valid source attribution.
4. Appropriate uncertainty.
5. Hybrid-versus-rules-only evaluation.
6. Usability and presentation polish.

---

## 3. Suggested Team Roles

These roles are starting assignments, not assumptions about each teammate's actual technical ability.

Adjust them based on who can implement and debug each component most effectively.

### Role A — Product and Integration Lead

**Primary responsibility:** keep the entire system coherent and runnable.

Tasks:

- Freeze the MVP and user flow.
- Finalize the shared data and API contracts.
- Maintain the acceptance checklist.
- Create the canonical end-to-end example.
- Coordinate integration and merges.
- Resolve contract disagreements.
- Track blockers and feature cuts.
- Verify the final workflow against the acceptance criteria.
- Prepare the product explanation and judge-facing narrative.

This role should not spend the entire event writing documentation. The integration lead must continuously verify the working product.

### Role B — Data and Evaluation Owner

**Primary responsibility:** create the ground truth and demonstrate whether the prototype behaves correctly.

Tasks:

- Create the initial synthetic fixtures.
- Label expected claim fields and finding states.
- Define expected calculations.
- Build or maintain the evaluation script.
- Run the rules-only and hybrid workflows on comparable cases.
- Record failures and actual results.
- Check unsupported assertions and source attribution.
- Maintain the final results table.

This teammate should coordinate closely with the backend owner so expected results and implemented rules use the same documented semantics without allowing the implementation to rewrite the ground truth.

### Role C — Frontend Owner

**Primary responsibility:** make the investigation understandable and inspectable.

Tasks:

- Build the dispute input and case-selection interface.
- Display extracted claim fields.
- Support manual correction or manual claim entry.
- Display candidate records and their matching reasons.
- Render findings and their statuses.
- Make source references inspectable.
- Display calculations, assumptions, and limitations.
- Make unresolved findings visibly distinct from supported findings.
- Connect the interface to the real API.
- Preserve a usable mocked layout only as an interim development tool.

A finding should lead the user to the source records supporting it. Do not spend time on decorative animations or complex dashboards before this works.

### Role D — Backend and Deterministic Rules Owner

**Primary responsibility:** build the authoritative investigation engine.

Tasks:

- Validate input schemas.
- Check record IDs and business references.
- Implement matching rules.
- Detect duplicate and conflicting records where feasible.
- Check unit compatibility.
- Implement quantity and financial calculations.
- Generate finding objects.
- Apply the four approved statuses.
- Validate source attribution.
- Expose the agreed API.
- Ensure manual input works without AI.
- Add tests for critical verification rules.

The backend must not rely on a language model to decide whether arithmetic is correct or whether a source record exists.

### AI extraction ownership

AI extraction should be implemented by the teammate best suited to model/API integration. This can be the backend owner or another teammate with capacity.

Do not create a separate AI microservice simply to make the architecture look more advanced. A function or module inside the existing application is sufficient for the MVP.

If no teammate can implement model integration reliably within the available time, prioritize the rules-only path and add AI only after the vertical slice works.

---

## 4. Shared Contract Before Coding

During the first 30 minutes, agree on a minimum common contract.

### 4.1 Input

The investigation request should contain:

- A dispute message or manually structured claim.
- The supplied transaction records.
- A case or investigation identifier.
- Any explicit user-selected references, if applicable.

### 4.2 Claim extraction

The extraction result should include:

- Issue type.
- Claimed quantity and unit, where stated.
- Claimed amount and currency, where stated.
- Invoice and shipment references, where stated.
- Supporting text spans, where available.
- Unknown fields represented as `null`.
- A human-review indicator.

### 4.3 Finding object

Each finding should contain, as applicable:

- Finding ID.
- Finding type.
- Finding status.
- Source record IDs.
- Verified calculation results.
- Assumptions.
- Limitations.
- Suggested next check.

### 4.4 Approved status vocabulary

Use only the agreed vocabulary:

- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

Do not introduce additional statuses independently in the frontend, backend, or evaluation script.

### 4.5 Canonical cases

Agree on at least two cases before parallel implementation:

- **Case A:** invoice 100 pieces, linked receipt 80 pieces.
- **Case B:** two plausible shipment candidates, with insufficient evidence to select one confidently.

The first case verifies the normal discrepancy path. The second verifies that the system does not force certainty.

---

## 5. Eight-Hour Timeline

<text>Time blocks are elapsed time from the start of the event. The gates are more important than completing every planned task.</text>

### 00:00–00:30 — Freeze scope and contracts

**All teammates**

- Confirm the single MVP dispute type: short-delivery/quantity discrepancy.
- Agree on the primary user flow.
- Confirm the input schema and finding object.
- Confirm the four finding statuses.
- Agree on the API request and response.
- Create the initial repository structure.
- Assign owners and identify integration dependencies.
- Select one clear case and one ambiguous case.

**Product/integration lead**

- Keep the scope narrow.
- Record decisions and unresolved questions.
- Make sure every owner understands the acceptance criteria.

**Data/evaluation owner**

- Define the minimum fixture format and expected-result structure.

**Frontend owner**

- Agree on the fields and findings that must be rendered.

**Backend/rules owner**

- Agree on the validation and deterministic calculation rules.

**Gate at 00:30**

No one begins a major extra feature before the minimum contracts are agreed.

If a field or endpoint is not required for the first vertical slice, defer it.

### 00:30–01:30 — Build independent components

Work in parallel against the agreed contracts.

**Data/evaluation**

- Create the canonical synthetic records.
- Create expected labels for the clear and ambiguous cases.
- Add several high-value edge cases.
- Prepare the structure for automated or repeatable scoring.

**Backend/rules**

- Implement schema validation.
- Implement record lookup and basic matching.
- Implement the quantity comparison.
- Generate source-linked finding objects.
- Add the first deterministic tests.

**Frontend**

- Build the primary investigation screen.
- Add dispute-message input or sample-case selection.
- Add the extracted-claim panel.
- Add findings, status labels, and source-record details.
- Use mocked responses only until the backend endpoint is available.

**AI integration, if assigned**

- Implement extraction into the agreed schema.
- Validate unknown fields and text spans.
- Ensure invalid model output does not break the investigation.
- Preserve manual-entry fallback.

**Gate at 01:30**

Each component must be able to demonstrate progress against the shared contract.

If a component is blocked by another component, use the agreed mock or fixture rather than inventing a different schema.

### 01:30–02:30 — Build the first vertical slice

Stop treating components as independent prototypes.

Connect the real frontend and backend.

The first slice should perform the following workflow:

1. Select or enter the canonical dispute.
2. Submit the dispute and source records.
3. Extract the claim or accept manual structured input.
4. Match the invoice and receipt.
5. Calculate the quantity difference deterministically.
6. Return a finding with valid source IDs.
7. Display the finding and supporting records in the UI.

Run both the clear discrepancy case and the ambiguous case.

Check that the calculations match the expected results.

**Gate at 02:30**

The team should have a working end-to-end slice or immediately stop new feature work and focus on integration.

Do not respond to a missing vertical slice by adding more isolated features.

### 02:30–03:00 — Integration hard gate

Use this period to stabilize the first slice.

Tasks:

- Merge working code.
- Resolve schema and API mismatches.
- Verify the source IDs returned by the backend.
- Confirm the UI displays actual backend output.
- Confirm manual structured input works.
- Confirm the application does not require a successful model response to perform deterministic checks.
- Fix the most serious crash or integration blocker.

**Hard rule at 03:00**

If no end-to-end workflow exists, cut AI-generated explanations and export functionality first.

Prioritize a reliable deterministic evidence trace over an ambitious but disconnected architecture.

The minimum working path should include the input, matching, calculations, findings, and source links.

### 03:00–04:30 — Evaluation and critical fixes

**Data/evaluation owner**

- Run the labelled cases that are actually implemented.
- Compare the rules-only and hybrid paths where available.
- Record applicable denominators.
- Track failures separately from passes.
- Identify unsupported assertions and invalid source references.

**Backend/rules owner**

- Fix incorrect arithmetic.
- Fix invalid source relationships.
- Fix incompatible-unit comparisons.
- Fix duplicate counting and status errors.
- Add regression tests for each critical fix.

**Frontend owner**

- Fix rendering of statuses and source records.
- Make unresolved findings understandable.
- Remove any wording that overstates the evidence.
- Ensure a failed model request does not leave the interface unusable.

**Product/integration lead**

- Review failures.
- Decide which fixes are necessary.
- Keep the demo claims aligned with actual behavior.

**Gate at 04:30**

The team should know which core cases pass, which fail, and which have not yet been tested.

Do not report unexecuted cases as passing.

### 04:30–05:30 — Strengthen the differentiator

Improve the features that make ProofTrail an evidence-first investigation workflow.

Prioritize:

1. Each finding links to the source records supporting it.
2. The user can inspect why a record was matched.
3. Calculations expose their inputs and assumptions.
4. Missing evidence is described accurately.
5. Conflicting or ambiguous cases remain unresolved where necessary.
6. At least one adversarial case is tested.
7. The rules-only and hybrid comparison is repeatable.

If time remains, improve candidate selection or the plain-language explanation.

Do not add unrelated product areas such as inventory forecasting, full accounting, payment collection, or general-purpose document chat.

**Gate at 05:30**

The core workflow must be stable enough to demonstrate without changing code or fixture contents manually.

### 05:30–06:00 — Feature freeze

Freeze new feature development.

Only make changes that address:

- Crashes.
- Incorrect calculations.
- Invalid source links.
- Broken API contracts.
- Unsafe overclaims.
- Blocking usability defects.
- Demo failures.

Every critical fix should be followed by a relevant regression test.

Do not introduce new database layers, agent frameworks, complex matching systems, or major UI redesigns after this point.

**Gate at 06:00**

The team moves from feature development to verification, presentation, and contingency preparation.

### 06:00–07:00 — Demo preparation

Prepare three reliable examples.

**Example 1 — Clean transaction**

- Relevant records agree.
- The system does not invent a discrepancy.
- The user can inspect the checks actually performed.

**Example 2 — Short-delivery discrepancy**

- Invoice and receipt quantities differ.
- The calculation is visible.
- Both source records are accessible.
- The finding avoids fraud or intent claims.

**Example 3 — Ambiguous or missing evidence**

- The system shows the missing or conflicting information.
- The uncertainty is explicit.
- The next verification step is understandable.
- The system does not force a binary verdict.

Prepare:

- A concise architecture explanation.
- The actual evaluation summary.
- A list of tested and untested cases.
- A short explanation of the AI contribution.
- The limitations and intended scope.
- A backup output from the same synthetic fixture data, if permitted.

Never fabricate metrics to make the results slide look complete.

### 07:00–08:00 — Rehearsal and contingency

Assign one presenter and one demo operator if the team has the capacity.

The remaining teammates should be ready to answer technical or evaluation questions.

Rehearse:

- The clean case.
- The discrepancy case.
- The ambiguous case.
- A model failure.
- A judge asking whether the product detects fraud.
- A judge asking how it differs from accounting or AP tools.
- A judge asking whether the test results represent real customers.

Test the manual/rules-only fallback.

Save screenshots or a short recording only if the event rules permit it.

Keep a backup static output generated from the same synthetic data, clearly labelled as a backup rather than a live run.

Do not use a backup screenshot to imply that a failed live feature worked during the demonstration.

---

## 6. Integration Strategy

### 6.1 Integrate by contract, not by assumptions

The frontend should not invent response fields because the backend is unfinished.

The backend should not rename fields without coordinating with the frontend and evaluation owner.

The evaluator should not silently change expected statuses to match implementation behavior.

Keep the shared schema and one canonical response example in the repository.

### 6.2 Maintain a runnable main branch

The `main` branch should remain in a runnable state as much as possible.

Use small branches or isolated commits for parallel work, but integrate early enough to catch mismatches.

Before merging, confirm:

- The change has an owner.
- The change follows the shared contract.
- The relevant test passes.
- The application still starts.
- No secret or real business data was added.

### 6.3 Use mocks strategically

Mocked frontend responses are useful before the backend is ready.

However, mocks must be replaced by real integration before the evaluation phase.

A successful mock demonstration is not evidence that the backend or end-to-end workflow works.

### 6.4 Avoid integration debt

Integration debt accumulates when independent components use different schemas, status names, field meanings, or assumptions.

Examples include:

- Frontend expects `status`, but backend returns `finding_status`.
- Evaluator expects `UNRESOLVED`, but backend introduces a new unapproved status.
- AI returns a business invoice number where the backend expects a unique record ID.
- UI displays a model-generated amount instead of the deterministic calculation.
- Duplicate rows are counted by one component but deduplicated by another.

Resolve these mismatches immediately rather than patching around them at the end.

---

## 7. Git and Repository Discipline

### 7.1 Establish the repository early

At the start:

- Confirm the repository and working directory.
- Add the agreed folder structure.
- Create a working initial commit.
- Confirm every teammate can pull and run the project.
- Add the required environment-variable template without secrets.

### 7.2 Keep contracts centralized

Suggested shared files:

```text id="8z1j6t"
docs/
├── 01_PRODUCT_BRIEF.md
├── 02_DIFFERENTIATION_AND_COMPETITORS.md
├── 03_SCOPE_AND_ACCEPTANCE_CRITERIA.md
├── 04_DATA_CONTRACTS_AND_ARCHITECTURE.md
├── 05_AI_ROLE_AND_EVALUATION.md
├── 06_SYNTHETIC_TEST_CASES.md
└── 07_EIGHT_HOUR_EXECUTION_PLAN.md

schemas/
tests/
src/
```

The implementation structure may differ depending on the selected stack. Do not create folders solely to match this illustration if they do not serve the actual codebase.

### 7.3 Commit discipline

- Commit the initial runnable baseline early.
- Make small, understandable commits.
- Integrate continuously.
- Test after merging shared contracts.
- Avoid unrelated formatting or refactoring during the final hour.
- Never commit API keys or private business records.
- Keep a known-good commit or branch that can be restored quickly.

### 7.4 Feature ownership

Every feature needs:

- One accountable owner.
- A clear acceptance condition.
- A test or verification method.
- A known integration dependency.

Multiple teammates can contribute, but ownership must be unambiguous.

---

## 8. Feature-Cut Order

When the schedule slips, reduce scope deliberately.

### Cut first

1. Download/export functionality.
2. Hinglish extraction, unless already stable and evaluated.
3. Advanced candidate-ranking UI.
4. LLM-only comparison.
5. Extra visualizations and decorative UI.
6. Additional case categories beyond the core acceptance set.
7. Optional matching heuristics that are not needed for the canonical cases.

### Preserve

- Deterministic arithmetic.
- Schema and source-ID validation.
- Source-linked findings.
- Unit compatibility checks.
- Appropriate uncertainty.
- Rules-only fallback.
- A clean case, a discrepancy case, and an ambiguous case.
- A real comparison between rules-only and hybrid on at least one preselected task, if the hybrid path is implemented.
- Honest reporting of test results.

Do not cut safety-critical checks to make room for presentation polish.

If the AI path is unreliable, use the rules-only path for the live demonstration and describe the AI component only to the extent it has actually been implemented and evaluated.

---

## 9. Risk Register

| Risk | Early warning sign | Response |
|---|---|---|
| Integration starts too late | UI and backend use different contracts | Stop feature work; connect one canonical case |
| AI takes too long | Extraction output is unstable or invalid | Use manual structured input and deterministic checks |
| Incorrect calculations | Expected values do not match outputs | Fix rules and add regression tests |
| Unsupported findings | Explanation exceeds source evidence | Restrict the finding builder to verified finding objects |
| Ambiguous matching | System selects a record without enough evidence | Return alternatives or unresolved status |
| Evaluation becomes superficial | Only successful examples are tested | Run clean, ambiguous, and adversarial cases |
| Feature creep | New features are added before core flow works | Apply the cut order and freeze scope |
| Dependency failure | External model or API is unavailable | Use rules-only fallback |
| Last-minute regressions | Changes are not retested | Freeze features and run known-good cases |
| Overstated presentation | Planned metrics are shown as measured results | Use actual counts and label untested work clearly |

---

## 10. Definition of Done

ProofTrail is ready for the final demonstration when the following conditions are satisfied:

### Product workflow

- The user can select or enter a synthetic dispute.
- The system accepts structured transaction records.
- Manual claim entry works.
- The investigation can run without successful AI connectivity.

### Evidence and verification

- The system identifies the records used in each finding.
- Every source ID is validated.
- Quantity comparisons use compatible units and established record relationships.
- Authoritative arithmetic is deterministic.
- Dispatch and receipt evidence are distinguished.
- Missing records are described as missing from the supplied dataset.
- Conflicting or ambiguous evidence is not silently resolved.

### Evaluation

- Expected results are stored separately from actual results.
- At least the implemented core cases have been run.
- Rules-only and hybrid are compared where applicable.
- Critical failures are fixed or clearly disclosed.
- The final report uses actual denominators and observed results.

### Presentation

- A clean transaction can be demonstrated.
- A quantity discrepancy can be demonstrated.
- An ambiguous or missing-evidence case can be demonstrated.
- The AI role and deterministic safeguards are explained.
- The team can state the limitations without overclaiming.
- A known-good fallback is available.

If a criterion is not met, the team must either fix it or explicitly narrow the claims made during the presentation.

---

## 11. Final Execution Rule

ProofTrail should be built as one coherent investigation workflow, not four separate demonstrations assembled at the last minute.

The team's strongest outcome is a small product that works end to end, shows where its evidence comes from, calculates correctly, and admits when it cannot establish an answer.

**By hour three, integration must take priority over expansion. By hour six, reliability must take priority over new features. By hour eight, every claim made in the presentation must be supported by what the team actually built and tested.**
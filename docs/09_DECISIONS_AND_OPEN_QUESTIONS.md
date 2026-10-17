# 09 — Decisions, Assumptions & Open Questions

**Project:** ProofTrail  
**Domain:** AI for Business & Commerce  
**Document purpose:** Maintain a single source of truth for project decisions, assumptions, unresolved questions, risks, and post-hackathon validation criteria.

---

## 1. Purpose of This Document

ProofTrail is being developed under a strict eight-hour hackathon constraint. The team cannot afford to repeatedly debate the product direction, introduce incompatible implementations, or confuse a promising hypothesis with a verified fact.

This document exists to:

1. Record decisions that are already settled for the hackathon.
2. Separate established project facts from assumptions requiring validation.
3. Identify decisions that remain open and provide practical default choices.
4. Make technical and product trade-offs explicit.
5. Assign a response to each major risk.
6. Establish conditions for continuing, revising, or stopping the project after the event.

**Operating principle:** Reopen a settled decision only when new evidence, a technical blocker, a safety issue, or a material implementation constraint justifies doing so.

A decision is not permanently correct simply because it has been written down. However, during the hackathon, changing direction must have a clear benefit that outweighs the cost of rework.

---

## 2. Status Labels and Evidence Discipline

Every important statement about ProofTrail should be understood according to its evidence status.

| Label | Meaning | Example |
|---|---|---|
| **DECIDED** | The team has selected this direction for the current prototype. | One dispute type for the MVP. |
| **IMPLEMENTED** | The feature exists in the current repository and has been verified. | The calculation engine passes its tests. |
| **TESTED** | The behavior has been evaluated using a defined test set. | The hybrid pipeline correctly identifies 18 of 20 labelled cases. |
| **OBSERVED** | The team directly observed a behavior or workflow. | A user demonstrated how they investigate a delivery discrepancy. |
| **EXTERNAL EVIDENCE** | A statement is supported by a cited external source. | A vendor's product page describes invoice-matching functionality. |
| **HYPOTHESIS** | A plausible explanation or opportunity that remains unvalidated. | Small suppliers may benefit from a claim-first evidence workspace. |
| **UNKNOWN** | Available evidence does not support a conclusion. | Whether target users would pay for ProofTrail. |

These labels are not interchangeable.

A decision to build a feature does not prove that customers need it. A successful synthetic test does not establish real-world accuracy. A vendor's marketing page does not establish its actual performance under every customer workflow.

### Rules for communicating evidence

- Do not describe a hypothesis as a validated market need.
- Do not report a feature as implemented until it works in the current application.
- Do not report an evaluation score without the tested cases, denominator, and evaluation conditions.
- Do not claim customer validation unless actual target-user feedback was collected.
- Do not claim market uniqueness based only on a limited competitor review.
- Do not convert missing information into a negative conclusion about the real world.
- Do not claim that AI is valuable simply because the product uses an LLM.

When evidence changes, update the relevant assumption, decision, or risk entry rather than silently changing the project narrative.

---

## 3. Locked Working Decisions

The following decisions are locked for the current hackathon MVP.

### D1. Working name: ProofTrail

The working project name is **ProofTrail**.

The name represents the idea that an investigation should leave a traceable path from the original claim to the records, calculations, limitations, and unresolved questions behind the result.

The name is provisional from a branding and commercial perspective. The team does not need to spend hackathon time on naming alternatives unless a genuine conflict or blocker is discovered.

### D2. Domain: AI for Business & Commerce

ProofTrail is positioned within the AI for Business & Commerce domain.

The business problem concerns investigating a commercial transaction discrepancy using business records. AI is intended to assist with interpreting the claim and finding relevant records, while deterministic logic handles calculations and explicit verification rules.

The product must demonstrate a meaningful workflow improvement rather than merely displaying a chatbot inside a business dashboard.

### D3. Initial workflow: short-delivery / quantity discrepancy

The MVP focuses on one narrow problem:

**A B2B supplier receives a complaint or payment deduction because the buyer claims that fewer units were delivered than expected.**

The investigation may involve comparing:

- The purchase order.
- The invoice.
- The dispatch record.
- The proof of delivery or receipt record.
- The payment ledger.
- Any linked credit note or adjustment available in the supplied dataset.
- The buyer's dispute message.

This workflow is a deliberately constrained starting point. It does not imply that short-delivery disputes are the most common or most valuable problem for all suppliers. That remains an assumption to validate.

**Scope rule:** Do not add pricing disputes, tax disputes, returns, damaged goods, general fraud detection, or complete accounts-receivable automation to the MVP.

### D4. Product role: evidence-first investigation assistant

ProofTrail helps a user organize and investigate the available evidence. It does not replace the accounting system, make legal determinations, or independently decide which party is right.

Its role is to answer questions such as:

- What exactly is being claimed?
- Which supplied records may relate to this transaction?
- What do the records explicitly state?
- Are there discrepancies between quantities or amounts?
- Which calculations can be reproduced?
- Which records are missing or contradictory?
- What additional information should a human verify?

The product should help a user make a better-informed decision. It should not present an automated conclusion as a final legal, financial, or commercial judgment.

### D5. Input: structured records plus a dispute message

The initial input consists of:

1. A dispute message describing the buyer's complaint or deduction.
2. Structured records supplied as CSV, JSON, or equivalent validated application data.

The initial data model may include purchase orders, invoices, dispatch records, receipt records, payment entries, and credit notes.

The exact supported columns must be documented in the data contract. Unsupported columns, missing identifiers, invalid quantities, incompatible units, and inconsistent references must not be silently interpreted as valid data.

**Out of scope for the first MVP:** arbitrary PDF ingestion, general-purpose OCR, email inbox integrations, WhatsApp integrations, live accounting integrations, and automatic access to a customer's business systems.

These features may become relevant later, but they add significant parsing, privacy, integration, and testing requirements.

### D6. Core product behavior: traceable evidence and explicit uncertainty

Every material finding must be connected to the source records and calculations supporting it.

A finding should show:

- The claim or question being investigated.
- The records used.
- The relevant record identifiers.
- The calculation or comparison performed.
- The resulting finding status.
- Any assumptions required for the calculation.
- Important limitations.
- The next verification step, where applicable.

The application must support inconclusive outcomes. A case with ambiguous references or missing records is not necessarily a failed investigation.

**Non-negotiable:** The application must not invent records, source identifiers, calculations, or supporting evidence.

### D7. Deterministic calculations and validation

Application code owns calculations and explicit business rules.

This includes:

- Schema validation.
- Identifier and reference checks.
- Quantity comparisons.
- Amount calculations.
- Unit and currency compatibility checks.
- Matching rules that can be expressed deterministically.
- Validation of source identifiers.
- Evaluation metrics and test results.

An LLM may interpret text or suggest a possible record match. It must not be the final authority for arithmetic or evidence integrity.

### D8. AI role: claim extraction and candidate record matching

AI is permitted to help with two primary tasks:

1. **Claim extraction:** Convert an informal dispute message into a validated structured representation of the claim.
2. **Candidate record matching:** Suggest which supplied records may relate to the claim, with an explainable basis for the suggestion.

AI may also explain already-validated findings in plain language, provided that the explanation is grounded in verified application output.

AI-generated values must be validated before use. Unknown values should remain unknown rather than being filled with guesses.

The team must be able to explain why AI is included, what it does, and how its contribution is evaluated.

### D9. Evaluation: hybrid versus rules-only

The evaluation must compare a hybrid workflow with a rules-only baseline on a fixed set of labelled synthetic cases.

The comparison should investigate whether AI improves a clearly defined task, such as extracting claim fields or selecting relevant records, while the deterministic layer maintains calculation and evidence integrity.

The evaluation should measure actual behavior, not perceived sophistication.

At minimum, the team should track:

- Claim-field extraction correctness.
- Candidate record matching correctness, if matching is implemented.
- Finding classification correctness.
- Arithmetic correctness.
- Source attribution correctness.
- Unsupported assertions.
- Appropriate abstention on ambiguous cases.

The final report must state the test-set size, denominators, errors, and limitations. If the hybrid approach does not demonstrate an advantage on a meaningful task, the team must narrow the AI claim rather than manufacture a justification.

### D10. Synthetic data only for the hackathon

The demonstration and evaluation will use synthetic records unless a separate, appropriate, authorized data arrangement is established.

**No real customer data should be submitted to an external LLM during the hackathon.**

Synthetic examples should resemble plausible business workflows without reproducing confidential customer information.

Synthetic data allows controlled testing of known scenarios. It does not prove that the same performance will occur with real suppliers, messy exports, or operational records.

### D11. No unsupported differentiation or validation claims

The team must not claim that ProofTrail is:

- The first product of its kind.
- The only product capable of investigating delivery discrepancies.
- Proven to save time or money.
- More accurate than existing products without comparative evidence.
- Validated by customers when no such validation occurred.
- Production-ready merely because the demonstration works.

Existing accounting and enterprise order-to-cash products already advertise related capabilities, including invoice matching, reconciliation, deduction handling, and proof-of-delivery workflows.

The working differentiation hypothesis is narrower: a claim-first investigation workflow that makes evidence, calculations, conflicts, and unknowns easy to inspect.

This is a product-design hypothesis, not a verified competitive gap.

---

## 4. Assumptions Requiring Validation

The following assumptions are not established facts. They represent questions the team should investigate before investing beyond the prototype.

| ID | Assumption | Why it matters | How to test | Current status |
|---|---|---|---|---|
| A1 | Small suppliers encounter recurring short-delivery disputes or related payment deductions. | If the problem is rare, the product may have limited value. | Conduct 3–5 exploratory conversations and ask for a recent real workflow example. | Unvalidated |
| A2 | Relevant records are spread across multiple files, systems, or communication channels. | This could create a useful reason for an evidence-assembly workflow. | Ask the user to walk through the last case and identify where each record lived. | Unvalidated |
| A3 | The current process takes meaningful time or creates avoidable errors. | A tool is more valuable if the existing process has a meaningful cost or failure mode. | Observe the workflow, steps, handoffs, delays, and corrections without leading the interviewee. | Unvalidated |
| A4 | A claim-first evidence trace is useful to the target user. | The proposed interface may be technically coherent but operationally unnecessary. | Show a prototype and ask the user to compare it with their current process. | Unvalidated |
| A5 | AI improves claim extraction or record matching compared with a simpler baseline. | This establishes whether AI contributes measurable value. | Evaluate both approaches on the same labelled cases using predefined metrics. | Unvalidated |
| A6 | Target users can provide sufficiently structured exports without disproportionate setup. | Data preparation may become the main obstacle to adoption. | Inspect sample exports with permission and record the mapping and cleaning effort required. | Unvalidated |
| A7 | The proposed workflow has a commercially meaningful distinction from existing products. | A useful prototype is not automatically a viable product opportunity. | Compare real workflows, plans, limitations, setup requirements, and user feedback. | Unvalidated |
| A8 | Users trust a system that explicitly shows uncertainty and supporting records. | Trust may depend on the usefulness and clarity of the evidence presentation. | Ask users to inspect correct, incomplete, and contradictory examples and explain their reactions. | Unvalidated |
| A9 | A supplier is the best initial buyer or user segment. | Another role, such as a distributor's finance or operations team, might experience the problem more acutely. | Interview different relevant roles without assuming the original segment is correct. | Unvalidated |
| A10 | The proposed workflow is frequent and costly enough to justify a separate tool. | A problem can exist without justifying a standalone product. | Ask about frequency, current workarounds, consequences, and willingness to change workflows. | Unvalidated |

### Validation interview guidance

If informal conversations are possible, prioritize understanding what people actually do rather than persuading them that ProofTrail is useful.

Useful questions include:

- “Can you walk me through the last time a buyer disputed a delivery quantity?”
- “What records did you need to check?”
- “Where were those records stored?”
- “What was the hardest part of resolving it?”
- “What did you do when the records disagreed?”
- “How often does something similar happen?”
- “What tools or workarounds do you currently use?”
- “Which part, if any, would you trust software to help with?”

Avoid leading questions such as “Would an AI tool that automatically resolves this problem be useful?” Positive responses to a hypothetical pitch are weaker evidence than a concrete example of a recent workflow.

Do not request confidential business documents merely to validate the idea. A verbal walkthrough or appropriately anonymized example may be sufficient for an initial conversation.

### Interpreting validation results

- No relevant recent examples may indicate that the problem is less frequent than expected, or that the interviewee is not in the right role.
- A recurring problem already handled well by existing software may weaken the case for a separate tool.
- A recurring problem with substantial manual reconciliation may justify deeper investigation, but does not by itself prove willingness to pay.
- A positive reaction to the prototype is encouraging, but it is not proof of adoption or commercial demand.
- A failed AI test should trigger a technical reassessment, not a reinterpretation of the metric.

---

## 5. Decisions Still Open

These decisions should be made using the simplest option that supports a reliable end-to-end demonstration.

| ID | Open decision | Default for the hackathon | Reopen when |
|---|---|---|---|
| O1 | Final technology stack | Use the team's fastest reliable stack and existing working environment. | A demonstrated blocker prevents implementation or integration. |
| O2 | LLM provider and API availability | Use an available provider only after a minimal connectivity and structured-output test. | Credentials, latency, quotas, reliability, or cost prevent use. |
| O3 | English only or Hinglish support | English-first unless Hinglish can be tested reliably within the time available. | A representative test set and implementation path are available. |
| O4 | Exact matching or candidate scoring | Begin with exact references and deterministic matching; add a simple candidate scorer only if the vertical slice works. | Ambiguous references make the baseline inadequate and there is time to evaluate the improvement. |
| O5 | Copyable text or downloadable report | Provide an on-screen, copyable evidence summary first. | The core workflow is stable and export adds clear demo value. |
| O6 | Final evaluation metrics | Prioritize metrics that can be labelled and computed reliably before the deadline. | The necessary ground truth and evaluation implementation are available. |
| O7 | Informal user conversations | Attempt a small number if suitable people are accessible without disrupting the build. | Relevant contacts or appropriate opportunities arise. |
| O8 | Exact backend/frontend structure | Keep the smallest architecture that allows parallel work and integration. | The chosen structure creates a concrete dependency or integration problem. |
| O9 | LLM failure behavior | The investigation must still run through a rules-only or manually entered claim path. | Only if an implementation blocker makes the fallback impossible; the team should otherwise preserve it. |

### Decision rule

Do not select a more sophisticated option because it sounds more innovative. Select it only if it produces a measurable improvement, resolves a real blocker, or materially improves the demonstration without threatening the core workflow.

---

## 6. Technical and Product Constraints

The following constraints govern the implementation regardless of the chosen stack.

### 6.1 Evidence integrity

- Every material finding must cite valid source record identifiers.
- Every quantity or amount comparison must be reproducible from the supplied records.
- Incompatible units or currencies must not be compared silently.
- Missing records must be described as missing from the supplied dataset, not missing from the real world.
- Candidate matches must not be treated as confirmed matches without satisfying the defined matching rules.
- Conflicting records must remain visible.
- The system must not convert an uncertain result into a confident conclusion just to produce a cleaner demo.

### 6.2 AI boundaries

- Validate structured model output against a defined schema.
- Preserve unknown fields as `null` or the agreed explicit unknown representation.
- Keep the original dispute message available for review.
- Do not allow the model to create authoritative record IDs.
- Do not allow the model to calculate the final quantities or financial discrepancy.
- Do not allow the model to change the application's finding status without validated evidence.
- Treat model explanations as presentation, not as the source of truth.
- Handle invalid, incomplete, or unavailable model output without corrupting the investigation.

### 6.3 Privacy and data handling

- Use synthetic records for the main demo and evaluation.
- Do not upload real customer records to external model providers during the hackathon.
- Do not include credentials, API keys, or confidential records in Git commits.
- Keep secrets in environment variables or the relevant local secret-management mechanism.
- Avoid logging sensitive data unnecessarily.
- If the project continues beyond the hackathon, establish a more complete privacy, retention, access-control, and data-processing approach before using real business records.

### 6.4 Reliability

- The core investigation must not depend entirely on model availability.
- A manual claim-entry or rules-only path must remain available.
- An invalid model response must not crash the whole workflow.
- The demo must work with a known synthetic case and a known ambiguous case.
- A failure should be visible and handled honestly rather than hidden by fabricated output.

---

## 7. Risk Register

Risks are ranked by their potential to undermine the project, not by how technically interesting they are.

### R1. No demand validation

**Risk:** The workflow may be rare, low-cost, already manageable, or poorly suited to a standalone product.

**Impact:** High.

**Control:**
- Treat the target user and problem frequency as hypotheses.
- Conduct a small number of exploratory conversations if feasible.
- Ask about actual recent cases and existing workarounds.
- Avoid building extra features to compensate for the absence of user evidence.

**Evidence that would reduce the risk:** Multiple relevant users independently describe a similar recurring workflow and a meaningful difficulty with their current approach.

**Evidence that would increase the risk:** Relevant users rarely encounter the problem, already resolve it efficiently, or cannot identify a reason to change their current process.

### R2. Competitive overlap

**Risk:** Accounting and enterprise dispute products already offer related functionality. ProofTrail may not have a sufficiently valuable distinction.

**Impact:** High.

**Control:**
- Describe the intended workflow precisely.
- Compare actual products and workflows instead of relying on broad category descriptions.
- Do not assume that existing products cannot serve smaller organizations.
- Evaluate setup effort, evidence traceability, uncertainty handling, and workflow fit as possible comparison dimensions.
- Present differentiation as a hypothesis until supported by evidence.

**Evidence that would reduce the risk:** A repeatable user problem that is not adequately served by the tools available to the target segment, supported by hands-on comparison and user feedback.

**Evidence that would increase the risk:** Existing tools already handle the complete target workflow at an acceptable cost and complexity.

### R3. Weak AI contribution

**Risk:** A rules-only implementation may perform as well as or better than the hybrid pipeline.

**Impact:** High for an AI-focused hackathon.

**Control:**
- Define the AI task before running evaluation.
- Establish a rules-only baseline.
- Use the same labelled cases for both approaches.
- Measure field extraction and matching separately from deterministic calculation correctness.
- Record failures, including hallucinations and incorrect matches.
- Remove or narrow AI claims if the evaluation does not show a meaningful advantage.

**Evidence that would reduce the risk:** A reproducible improvement on a clearly defined task without an unacceptable increase in unsupported assertions or incorrect matches.

**Evidence that would increase the risk:** Similar performance to the simpler baseline, poor abstention, or more errors introduced by AI than it resolves.

### R4. Data cleanliness and representativeness

**Risk:** Structured synthetic records may omit the complexity of real-world documents, inconsistent references, missing attachments, and manual corrections.

**Impact:** High.

**Control:**
- Include missing, duplicated, contradictory, and ambiguous records in the synthetic test set.
- Keep data contracts explicit.
- Track invalid and unmatched records.
- Document the difference between the controlled test environment and a real workflow.
- Do not use synthetic test success as proof of production readiness.

**Evidence that would reduce the risk:** The prototype can handle appropriately authorized, representative examples with a manageable amount of preparation.

**Evidence that would increase the risk:** Real exports require extensive manual cleaning or contain information the prototype cannot safely interpret.

### R5. False certainty or misleading explanations

**Risk:** The model may overstate what records establish, confuse dispatch with receipt, infer intent, or misrepresent a missing record as proof that something never happened.

**Impact:** Very high.

**Control:**
- Use explicit finding statuses.
- Require source IDs for findings.
- Keep arithmetic deterministic.
- Preserve contradictory evidence.
- Distinguish records that support a claim from records that merely correlate with it.
- Include ambiguous and adversarial test cases.
- Prohibit fraud, guilt, and legal-rightness verdicts.

**Evidence that would reduce the risk:** The application consistently preserves uncertainty and avoids unsupported conclusions across the evaluation set.

**Evidence that would increase the risk:** A finding appears authoritative despite missing sources, ambiguous matching, invalid arithmetic, or conflicting evidence.

### R6. Integration failure

**Risk:** Parallel work may produce incompatible interfaces, inconsistent field names, conflicting status definitions, or components that cannot be connected in time.

**Impact:** Very high under an eight-hour deadline.

**Control:**
- Agree on shared schemas and statuses before parallel implementation.
- Define one canonical sample request and response.
- Use mocked responses while individual components are developed.
- Integrate early.
- Assign one person responsibility for the end-to-end path.
- Freeze interface changes unless a concrete blocker requires a change.

**Evidence that would reduce the risk:** The complete workflow runs early using the agreed contract.

**Evidence that would increase the risk:** Components only work independently or repeatedly require unplanned schema changes.

### R7. Scope creep

**Risk:** OCR, additional dispute types, integrations, dashboards, authentication, and other stretch features prevent completion of the core product.

**Impact:** Very high.

**Control:**
- Implement one dispute type.
- Keep the schemas small.
- Require the vertical slice before stretch features.
- Freeze features by approximately hour 5.5–6.
- Cut optional capabilities when reliability is threatened.

**Evidence that would reduce the risk:** The MVP passes its acceptance checks with enough time to rehearse the demonstration.

**Evidence that would increase the risk:** Multiple unfinished branches compete for time while the main workflow remains unreliable.

### R8. External model or network failure

**Risk:** API credentials, network access, quotas, latency, or model output failures disrupt the demonstration.

**Impact:** High.

**Control:**
- Test connectivity early.
- Keep the rules-only/manual fallback.
- Prepare a known synthetic case.
- Avoid making the main demo depend on an untested external service.
- Never simulate a successful live model response while presenting it as real.

**Evidence that would reduce the risk:** The AI path and fallback path have both been tested.

**Evidence that would increase the risk:** The only working demo requires an unreliable external dependency.

### R9. Misleading evaluation

**Risk:** A small synthetic test set may make the prototype appear more capable than it is.

**Impact:** High.

**Control:**
- Define expected outcomes before testing.
- Keep the test set fixed during a comparison.
- Report the denominator and error categories.
- Include difficult and ambiguous cases.
- Avoid presenting one successful example as a general performance result.
- State that synthetic evaluation does not establish real-world effectiveness.

**Evidence that would reduce the risk:** Results are reproducible and the limitations are clearly reported.

**Evidence that would increase the risk:** Cases are selected after observing outputs, failures are excluded without explanation, or metrics lack a denominator.

### R10. Weak demo narrative

**Risk:** Judges see a collection of AI features rather than a clear business workflow and measurable technical contribution.

**Impact:** Medium to high.

**Control:**
- Demonstrate one realistic discrepancy case from claim to evidence trace.
- Show the actual calculation.
- Show an unresolved case rather than only a perfect example.
- Explain which work is performed by AI and which by deterministic logic.
- Present evaluation results honestly.

**Evidence that would reduce the risk:** A viewer can explain the problem, workflow, AI contribution, safeguards, and limitations after the demonstration.

**Evidence that would increase the risk:** The demo relies on vague claims, hidden assumptions, or unverified performance numbers.

---

## 8. Risk Controls and Time Gates

The team will use explicit implementation gates to prevent a technically ambitious project from becoming an unfinished demo.

| Time from start | Required checkpoint | Response if missed |
|---|---|---|
| 0:00–0:30 | Shared schema, statuses, example case, and interface contract agreed. | Simplify the contract immediately. |
| 0:30–1:30 | Backend/rules, UI shell, test cases, and AI extraction can progress independently against the contract. | Use mocked responses and reduce parallel dependencies. |
| 1:30–2:30 | First end-to-end vertical slice is operational or close enough to integrate. | Drop optional matching or presentation features. |
| By 3:00 | At least one investigation runs end-to-end using the actual application path. | Stop new features and integrate the smallest working path. |
| 3:00–4:30 | Core cases, calculations, and source trace are tested. | Prioritize correctness and source integrity over visual polish. |
| 4:30–5:30 | Ambiguous case and AI failure/fallback behavior are verified. | Remove unreliable capabilities and keep a deterministic path. |
| By 5:30–6:00 | Feature freeze. | Only fix defects that block the demo or compromise correctness. |
| 6:00–7:00 | Demo narrative, known examples, and backup plan are ready. | Cut additional changes and rehearse the stable build. |
| 7:00–8:00 | Final rehearsal and contingency buffer. | Avoid risky changes unless the current build cannot demonstrate the core workflow. |

### Feature-cut order

If time becomes constrained, remove features in this order:

1. Downloadable reports or exports.
2. Hinglish support unless already implemented and tested.
3. Advanced candidate ranking.
4. Optional visualizations or extra dashboard sections.
5. Additional evaluation comparisons that are not essential to the main claim.

Preserve these capabilities for as long as possible:

- One working end-to-end investigation.
- Deterministic arithmetic and validation.
- Source-linked findings.
- Explicit uncertainty.
- At least one clean case and one discrepancy or ambiguous case.
- A basic hybrid-versus-rules-only comparison.
- A reliable fallback if the model is unavailable.

---

## 9. Post-Hackathon Decision Framework

A successful hackathon demonstration is a reason to investigate further, not sufficient evidence to launch a business.

After the event, evaluate five separate dimensions.

### 9.1 Problem evidence

**Question:** Does the target user experience the problem frequently enough for a solution to matter?

Review:
- Number of relevant users interviewed.
- Number of concrete recent examples.
- Recurrence and consequences of the workflow.
- Existing workarounds.
- Whether different users describe the same underlying problem.

A few conversations are exploratory evidence, not statistically representative research.

### 9.2 Product reliability

**Question:** Can the prototype handle the intended workflow without inventing or misrepresenting evidence?

Review:
- Correctness on labelled cases.
- Behavior on missing and contradictory records.
- Source attribution integrity.
- Arithmetic correctness.
- Correct abstention.
- Model and network failure behavior.

A visually polished interface cannot compensate for an unreliable evidence trail.

### 9.3 Measurable AI contribution

**Question:** Does AI improve a defined part of the workflow compared with a simpler alternative?

Review:
- Hybrid performance against rules-only.
- Error types and severity.
- Unsupported assertion rate.
- Quality of candidate matching, if included.
- Whether the improvement justifies the extra complexity.

If AI does not improve a useful task, the team should simplify the architecture or identify a better-supported AI task.

### 9.4 Data feasibility

**Question:** Can users supply the required information with acceptable effort?

Review:
- Export formats available.
- Required fields that are commonly absent.
- Reference consistency.
- Data-cleaning effort.
- Need for manual mapping.
- Whether the workflow depends on records users cannot access.

If the required data is difficult to obtain, data preparation may become the primary product challenge.

### 9.5 Competitive and commercial credibility

**Question:** Is there a specific workflow and target segment for which ProofTrail is meaningfully better suited than available alternatives?

Review:
- Existing accounting and dispute-management capabilities.
- Pricing and setup requirements where verifiable.
- The target user's current tools.
- Specific unmet workflow needs supported by evidence.
- Whether the user would consider changing the current process or paying for a solution.

Do not infer a commercial opportunity solely because a product category is large or a prototype looks useful.

---

## 10. Continue, Revise, or Stop

The following are decision principles, not claimed results.

### Continue investigating when:

- Multiple relevant users describe a recurring and consequential workflow.
- The prototype handles representative cases reliably enough for the intended purpose.
- AI shows a measurable advantage on a clearly defined task, or a credible AI task remains to be tested.
- Users can provide the required records without disproportionate setup.
- Competitor review and user feedback suggest a credible workflow opportunity.

### Revise the product when:

- The problem exists but the chosen user segment is wrong.
- Users value evidence assembly but not the current matching workflow.
- AI helps with extraction but not with candidate matching, or vice versa.
- Data preparation is the primary obstacle.
- The workflow is useful but the interface, scope, or output needs to change.
- Existing tools cover most of the problem, but a narrower use case may still merit investigation.

### Stop or substantially rethink when:

- Relevant users cannot identify a recurring problem.
- Existing tools already solve the workflow adequately for the target segment.
- The prototype cannot produce trustworthy findings from realistic inputs.
- AI adds complexity without measurable value and no defensible AI task remains.
- The required data cannot reasonably be obtained.
- There is no credible reason for a user to adopt a separate solution.

Stopping or revising after receiving contrary evidence is a valid product decision. Continuing only because the team has already invested time would be a sunk-cost error.

---

## 11. Decision Log

Record material changes here so that the team can understand why the project evolved.

| Decision ID | Decision or change | Reason/evidence | Impact | Status |
|---|---|---|---|---|
| DLOG-01 | Select ProofTrail as the working project direction. | Chosen as the leading candidate for the AI for Business & Commerce track. | Establishes the current product direction. | Locked for MVP |
| DLOG-02 | Narrow the MVP to short-delivery / quantity discrepancy disputes. | Constrains the workflow enough for an eight-hour implementation. | Limits data model and demo scope. | Locked for MVP |
| DLOG-03 | Use evidence-linked findings and deterministic calculations. | Reduces the risk of unsupported conclusions and incorrect arithmetic. | Core architectural requirement. | Locked |
| DLOG-04 | Evaluate hybrid against rules-only. | Tests whether AI adds value beyond a simpler baseline. | Requires labelled cases and comparable metrics. | Locked |
| DLOG-05 | Use synthetic records for the hackathon evaluation and demo. | Enables controlled tests without exposing real customer information to external models. | Limits claims about real-world performance. | Locked |
| DLOG-06 | Keep differentiation claims explicitly provisional. | Related functions exist in the accounting and enterprise dispute-management market. | Requires honest positioning and further validation. | Locked |

Add new entries rather than silently replacing earlier reasoning.

Suggested format for future entries:

| Field | Required content |
|---|---|
| Date/time | When the decision was made. |
| Decision ID | Unique identifier. |
| Question | What needed to be decided. |
| Options considered | Realistic alternatives, not straw-man choices. |
| Evidence | Tests, user observations, technical constraints, or cited sources. |
| Decision | The option selected. |
| Trade-off | What is gained and what is sacrificed. |
| Revisit condition | What new evidence would justify reopening it. |

---

## 12. Open Questions for the Next Review

These questions should be answered when evidence becomes available. They should not block the current MVP unless they directly prevent implementation.

### Product and users

1. Which specific supplier or distributor role experiences the workflow most acutely?
2. How often do short-delivery disputes occur in the target segment?
3. What is the current process from complaint to response?
4. Which records are actually available during an investigation?
5. Who would use the product, approve it, and potentially pay for it?

### Technical behavior

6. Which claim fields can be extracted reliably from informal messages?
7. When should a candidate record be accepted, rejected, or left unresolved?
8. What is the smallest useful set of deterministic rules?
9. How should the application represent duplicate or contradictory records?
10. What is the minimum test set needed to reveal meaningful failure modes within the available time?

### AI and evaluation

11. Which task benefits most from AI: claim extraction, record matching, or plain-language explanation?
12. Does the hybrid system improve over rules-only on the same labelled cases?
13. Which errors are severe enough to block use?
14. How should the system abstain when the input is ambiguous?
15. What evidence would justify testing with appropriately authorized real-world examples later?

### Competitive and commercial

16. Which existing products have been tested hands-on rather than reviewed only through vendor descriptions?
17. Does the target user already have an acceptable workflow in an accounting or ERP system?
18. Is the proposed investigation layer worth adopting separately?
19. Would the user prefer an independent tool, an extension to an existing system, or a service-assisted workflow?
20. What evidence would establish a credible commercial opportunity rather than a technically interesting prototype?

---

## 13. Final Working Agreement

For the remainder of the hackathon, the team agrees to:

- Build one reliable investigation workflow before adding extra features.
- Keep interfaces and data contracts consistent across parallel work.
- Separate AI suggestions from verified findings.
- Use deterministic code for arithmetic and explicit rules.
- Preserve missing information, ambiguity, and contradictions.
- Evaluate the hybrid approach against a simpler baseline.
- Report actual results, including failures.
- Use synthetic data for the main hackathon workflow.
- Avoid unsupported claims about uniqueness, demand, accuracy, or business impact.
- Freeze features early enough to rehearse.
- Prefer a stable, honest demonstration over an unfinished collection of ambitious features.

**Final principle:**

ProofTrail should be judged by whether it can turn a disputed business claim into a clearer, traceable, and appropriately cautious investigation—not by how many AI features it contains.

A technically impressive prototype is not, by itself, proof of a viable business. The next step after the hackathon is to test the workflow, the AI contribution, the data requirements, and the commercial assumptions against evidence.
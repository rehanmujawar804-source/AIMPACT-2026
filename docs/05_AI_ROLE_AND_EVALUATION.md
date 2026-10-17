# 05 — AI Role & Evaluation Plan

## Core research question
Does AI-assisted claim interpretation and record matching improve the quality of a short-delivery investigation compared with a rules-only workflow, without increasing unsupported claims?

This is the technical hypothesis to test. It is not a pre-established result.

## Baselines
- **Rules-only:** user fills a structured claim form; deterministic rules perform checks.
- **LLM-only (optional comparison):** model generates an assessment from supplied records. Treat as a deliberately weak/unsafe comparator; do not use as the production result.
- **Hybrid:** LLM extracts structured claims and proposes candidate matches; deterministic engine verifies calculations; finding builder links every claim to source IDs and applies uncertainty rules.

## What AI is allowed to do
- Extract issue type, claimed quantity, amount, invoice/shipment references and text spans.
- Suggest candidate matches using evidence visible in the records.
- Explain a verified finding in plain language.
- Suggest predefined next checks based on missing/ambiguous evidence.

## What AI is not allowed to do
- Calculate final financial totals without deterministic verification.
- Invent IDs or citations.
- Label a party fraudulent or dishonest.
- Turn absence from the dataset into proof of non-existence.
- Override a hard contradiction or force an unresolved case into a binary conclusion.
- Claim real-world performance based on synthetic cases.

## Test set design
Target 24–30 cases if feasible:
- 5 straightforward short-delivery cases.
- 4 clean/no-discrepancy cases.
- 4 missing-receipt or missing-credit-note cases.
- 4 ambiguous references / multiple possible shipment matches.
- 3 partial payment cases not necessarily caused by delivery.
- 3 duplicate or conflicting records.
- 3 confusing or informal phrasings, including simple Hinglish only if reviewed by a fluent speaker.

Keep a small held-out set that is not used to tune prompts/rules. If time permits, ask a teammate who did not implement the extractor to author or review the held-out wording.

## Metrics
1. **Claim extraction exact/field accuracy:** issue type, quantity, amount, identifiers.
2. **Candidate match accuracy:** correct source record appears among proposed matches.
3. **Finding classification accuracy:** status matches the labelled expected state.
4. **Source attribution precision:** every cited source actually supports the attached statement.
5. **Unsupported assertion count:** number of factual claims not supported by records.
6. **Arithmetic correctness:** computed values match deterministic expected results.
7. **Abstention quality:** ambiguous cases remain unresolved rather than receiving unsupported certainty.
8. **Incremental value:** hybrid vs rules-only on claim interpretation and record selection.

## Report honestly
Publish the denominator and actual count, not only percentages. Example format:
“On N synthetic cases, hybrid extraction correctly captured X/N quantities; source attribution was correct for Y/N findings; Z cases were correctly left unresolved. This tests prototype behavior on synthetic data only.”

Do not pre-fill X/Y/Z with invented values. Populate them after tests run.

## Go/no-go criteria
- If arithmetic is wrong: do not demo that path until fixed.
- If source IDs are invalid: block the finding.
- If the system overstates evidence in ambiguous cases: change the status rules and retest.
- If hybrid does not beat rules-only on at least one preselected task (e.g. claim extraction or candidate match recall), simplify AI claims and position AI as optional assistance.
- If LLM reliability is poor or connectivity fails: demo manual structured input + deterministic engine.

## Prompting principles
- Use schema-constrained output where available.
- Provide only the records relevant to the dispute, with IDs.
- Tell the model to return `null` for unknown fields.
- Ask it to quote the exact claim text span for each extracted value.
- Ask it to propose candidates, not declare facts.
- Validate outputs programmatically.
- Re-run the same fixed cases for comparisons.

## Example extraction instruction
“You extract a structured claim from a dispute message. Return JSON matching the supplied schema. Use only information stated in the message. Use null for unstated values. Do not decide whether the claim is true. Do not invent identifiers. Include exact text spans supporting extracted values. If more than one interpretation is plausible, set needs_human_review=true.”

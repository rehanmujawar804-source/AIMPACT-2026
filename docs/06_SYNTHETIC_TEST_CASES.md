# 06 — Synthetic Test Cases

All cases in this file are proposed test scenarios. Generate the actual CSV/JSON fixture files and a labelled expected-results file before evaluating the system. Do not present these scenarios as customer data.

## Case catalogue

| ID | Scenario | Expected behavior |
|---|---|---|
| T01 | Invoice 100 units; signed receipt 80; same shipment/item/unit | Flag 20-unit recorded discrepancy; link invoice and receipt; no fraud verdict. |
| T02 | Invoice 100; receipt 100; payment partial | Do not infer short delivery from partial payment alone. |
| T03 | Invoice 100; no receipt in dataset | Mark receipt evidence not found in provided data; do not conclude delivery failed. |
| T04 | Two shipments share similar dates and buyer | Return multiple candidates or unresolved; do not silently choose. |
| T05 | Receipt unit is cartons; invoice unit is pieces; conversion absent | Do not compare quantities until conversion is known. |
| T06 | Invoice line says 100 × ₹150 but stored line amount says ₹14,000 | Deterministically flag arithmetic inconsistency and cite invoice row. |
| T07 | Invoice 100; receipt 80; credit note ₹3,000 exists and links to invoice | Show the recorded quantity discrepancy and separately show credit note; do not double-count adjustment. |
| T08 | Invoice 100; receipt 80; credit note absent from dataset | State no linked credit note was found in supplied data; do not say none exists. |
| T09 | Buyer says “twenty short”; invoice and receipt identify 20-unit gap | AI should extract claim; deterministic engine should verify it against records. |
| T10 | Buyer says “payment kam bheja because maal kam aaya” without IDs | Extract broad claim; request/identify missing invoice or shipment reference. |
| T11 | Buyer says “all 100 arrived” but receipt says 80 | Preserve conflict between message and receipt; human review required. |
| T12 | Duplicate receipt rows for same shipment | Detect duplicate candidate records; avoid adding quantities unless the schema proves they are separate deliveries. |
| T13 | Dispatch says 100; receipt says 80 | Distinguish supplier dispatch record from recipient receipt; do not treat dispatch as proof of receipt. |
| T14 | Payment ₹12,000 against invoice ₹15,000; no dispute context | Show recorded partial payment; do not attribute cause. |
| T15 | Receipt references different item ID | Do not use it as evidence for the invoice item without an explicit mapping. |
| T16 | Claim says 20 units short; invoice unit price missing | Calculate quantity discrepancy if supported, but do not compute monetary impact. |
| T17 | Same invoice ID appears with conflicting totals | Flag conflicting source records; do not choose one without a rule. |
| T18 | No matching invoice found | Mark unresolved/not found in provided data and ask for a transaction reference. |
| T19 | Message includes a claimed ₹3,000 deduction but no payment record | Separate buyer's claimed deduction from recorded payment facts. |
| T20 | Receipt is unsigned and contains 80 units | Report source type and quantity; do not imply signed confirmation. |
| T21 | One partial delivery and one later delivery exist | Aggregate only if links/dates/items establish they belong to same order and the rule is explicit. |
| T22 | Credit note belongs to a different invoice | Do not apply it to this dispute. |
| T23 | Dates are inconsistent or missing | Flag timeline ambiguity; avoid assuming sequence. |
| T24 | Clean case with matching PO, invoice, receipt and payment | Do not invent a discrepancy; explain only checks actually performed. |

## Required expected-result fields
For each fixture, label:
- `expected_issue_type`
- `expected_claim_fields`
- `expected_candidate_record_ids`
- `expected_findings`
- `expected_statuses`
- `expected_calculations`
- `must_not_claim`
- `expected_unresolved_questions`

## Adversarial cases
At least one test should attempt to induce the model to:
- declare fraud,
- invent a missing receipt,
- use a similar but wrong invoice,
- confuse dispatch with receipt,
- attribute a partial payment to the delivery dispute,
- treat absence in the dataset as absence in reality.

The expected behavior is to refuse the unsupported inference and preserve uncertainty.

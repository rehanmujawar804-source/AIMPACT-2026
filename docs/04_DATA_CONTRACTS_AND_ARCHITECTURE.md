# 04 — Data Contracts & Architecture

## Recommended architecture
Keep the implementation simple: a small web UI + one backend/service layer + deterministic rules + optional LLM extraction. A modular monolith is sufficient.

```text
User / Demo Case
      |
      v
Input Validator ---- invalid rows ----> Validation UI
      |
      v
Claim Extractor (LLM; schema-constrained)
      |
      v
Candidate Record Matcher
      |
      v
Deterministic Verification Engine
      |
      v
Evidence Trace / Findings Builder
      |
      v
Investigation UI + Export
```

The LLM is not the source of truth. Input records plus deterministic computations are the source of truth.

## Data model (minimum viable)

### Dispute
```json
{
  "dispute_id": "DSP-001",
  "message": "We received only 80 of the 100 units invoiced.",
  "claimed_issue": "short_delivery",
  "invoice_id": "INV-001",
  "shipment_id": "SHP-001"
}
```

### Purchase order
```json
{
  "record_id": "PO-001",
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

### Invoice
```json
{
  "record_id": "INV-001",
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

### Dispatch
```json
{
  "record_id": "DSPT-001",
  "shipment_id": "SHP-001",
  "invoice_id": "INV-001",
  "item_id": "ITEM-01",
  "dispatched_qty": 100,
  "unit": "pcs",
  "dispatch_date": "2026-10-11"
}
```

### Receipt / proof of delivery
```json
{
  "record_id": "POD-001",
  "shipment_id": "SHP-001",
  "invoice_id": "INV-001",
  "item_id": "ITEM-01",
  "received_qty": 80,
  "unit": "pcs",
  "signed": true,
  "receipt_date": "2026-10-12"
}
```

### Payment
```json
{
  "record_id": "PAY-001",
  "invoice_id": "INV-001",
  "amount": 12000,
  "currency": "INR",
  "payment_date": "2026-10-15",
  "reference": "BANK-REF-001"
}
```

### Credit note
```json
{
  "record_id": "CN-001",
  "invoice_id": "INV-001",
  "amount": 3000,
  "currency": "INR",
  "date": "2026-10-16",
  "reason": "short_delivery_adjustment"
}
```

All data above is illustrative. Dates, IDs, and amounts are synthetic.

## Claim extraction schema
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
  "missing_fields": [],
  "needs_human_review": false
}
```

Requirements:
- Numeric fields may be null if not explicitly stated or reliably derived.
- Separate directly stated facts from inferred fields.
- Store the original text and the extraction output.
- Do not silently infer shipment/invoice IDs from weak matches.
- Validate all output against a schema before using it.

## Finding contract
```json
{
  "finding_id": "F-001",
  "status": "CONFLICTING_RECORDS",
  "claim": "Receipt quantity differs from invoice quantity",
  "summary": "Invoice records 100 pcs; linked receipt records 80 pcs.",
  "source_record_ids": ["INV-001", "POD-001"],
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

Allowed finding statuses:
- `SUPPORTED_BY_RECORDS`
- `CONFLICTING_RECORDS`
- `NOT_FOUND_IN_PROVIDED_DATA`
- `UNRESOLVED`

Do not use `FRAUD`, `GUILTY`, or `PROVEN` as system states.

## Deterministic rules
1. Check IDs, units, currencies and transaction links before comparing quantities.
2. Calculate line total from quantity × unit price; compare with stored total and flag differences.
3. Compare invoiced quantity with receipt quantity only when item, shipment and units align.
4. Compute a potential quantity difference and corresponding value only when unit price and relevant adjustments are known.
5. Compare payment and credit notes separately from delivery quantities.
6. Do not assume partial payment is caused by a delivery dispute unless the evidence says so.
7. A missing record means “not found in provided dataset.”
8. Multiple plausible matches must remain unresolved until reviewed.

## Example API contracts
`POST /api/investigations`
```json
{
  "dispute": {"dispute_id": "DSP-001", "message": "We received only 80 of the 100 units invoiced."},
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

Response:
```json
{
  "investigation_id": "INVEST-001",
  "claim_extraction": {},
  "candidate_matches": [],
  "findings": [],
  "unresolved_questions": [],
  "evaluation_metadata": {
    "mode": "hybrid",
    "model_used": null
  }
}
```

`POST /api/evaluate` should run the same labelled test cases in `rules_only`, `llm_only` (if implemented safely), and `hybrid` modes.

## Security and privacy for the demo
- Use synthetic records only.
- Do not upload real customer names, bank references, invoices, or personal data to an external model.
- Keep API keys in environment variables; never commit them.
- Do not log raw sensitive data.
- If external LLM is unavailable, manual claim fields and rules-only mode must still work.

/**
 * ProofTrail — Deterministic Finding Builder
 *
 * Implements the core investigation engine:
 * runDeterministicInvestigation(input: ValidatedInvestigationInput): Finding[]
 *
 * Rules:
 * - Findings mapped strictly to 4 canonical states (FindingState)
 * - source_record_ids contains ONLY IDs that physically exist in input records
 * - Deterministic arithmetic, zero floating-point drift, zero LLM dependencies
 * - Preserves uncertainty (UNRESOLVED) when evidence is ambiguous
 * - Never accuses of fraud, bad faith, or theft (Rule 13)
 */

import { Finding, FindingState } from "@/types";
import { ValidatedInvestigationInput } from "../rules/types";
import { matchRecords } from "../rules/recordMatcher";
import {
  compareInvoiceAndReceiptQuantities,
  calculateInvoiceLineArithmetic,
  validateUnitCompatibility,
} from "../rules/quantityComparison";

/**
 * Executes a deterministic dispute investigation against supplied commercial records.
 */
export function runDeterministicInvestigation(
  input: ValidatedInvestigationInput
): Finding[] {
  const findings: Finding[] = [];
  const { dispute, records } = input;

  // Track all valid record IDs physically present in the input to guarantee citation integrity
  const availableRecordIds = new Set<string>();
  const recordGroups = Object.values(records) as Array<Array<{ record_id: string }>>;
  for (const group of recordGroups) {
    if (Array.isArray(group)) {
      for (const rec of group) {
        if (rec && rec.record_id) {
          availableRecordIds.add(rec.record_id);
        }
      }
    }
  }

  // 1. Execute Record Matching
  const match = matchRecords(dispute, records);

  // Check 0: Duplicate records check (Rule 1)
  if (match.duplicateRecordIds.length > 0) {
    const citedDups = match.duplicateRecordIds.filter((id) => availableRecordIds.has(id));
    findings.push({
      finding_id: "FND-DUP-RECORDS",
      claim_id: dispute.dispute_id,
      statement: `Duplicate record IDs (${citedDups.join(", ")}) detected in supplied records; records must be deduplicated before verification.`,
      status: FindingState.CONFLICTING_RECORDS,
      source_record_ids: citedDups,
      calculation: null,
      assumptions: [
        "Record identifiers must be globally unique within an investigation dataset.",
      ],
      limitations: [
        "Duplicate records prevent safe deterministic calculation without double-counting.",
      ],
      next_step: "Deduplicate transaction records so each source record possesses a unique identifier.",
    });
    return findings;
  }

  // Check 1: Invoice presence
  if (!match.invoice) {
    if (match.candidateInvoices && match.candidateInvoices.length > 1) {
      const citedIds = match.candidateInvoices
        .map((i) => i.record_id)
        .filter((id) => availableRecordIds.has(id));

      findings.push({
        finding_id: dispute.invoice_id
          ? `FND-AMBIG-INVOICE-${dispute.invoice_id}`
          : "FND-AMBIG-INVOICE-MULTIPLE",
        claim_id: dispute.dispute_id,
        statement: dispute.invoice_id
          ? `Multiple candidate invoices (${match.candidateInvoices.map((i) => i.record_id).join(", ")}) share invoice_id '${dispute.invoice_id}'; invoice selection remains unresolved.`
          : `Multiple invoices (${match.candidateInvoices.map((i) => i.record_id).join(", ")}) exist in the dataset but dispute does not specify invoice_id; invoice selection remains unresolved.`,
        status: FindingState.UNRESOLVED,
        source_record_ids: citedIds,
        calculation: null,
        assumptions: [
          "Multiple candidate invoices match the dispute identifier or dataset scope.",
        ],
        limitations: [
          "Deterministic engine cannot arbitrarily select one invoice candidate without explicit disambiguating criteria.",
        ],
        next_step: "Specify the exact unique invoice record ID or provide disambiguating transaction metadata.",
      });
      return findings;
    }

    findings.push({
      finding_id: "FND-INV-NOT-FOUND",
      claim_id: dispute.dispute_id,
      statement: dispute.invoice_id
        ? `Invoice '${dispute.invoice_id}' was not found in the provided dataset.`
        : "No matching invoice found for this dispute in the provided dataset.",
      status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
      source_record_ids: [],
      calculation: null,
      assumptions: [],
      limitations: [
        "Absence of an invoice in the provided dataset does not prove that no invoice was issued in reality.",
      ],
      next_step: "Provide the relevant commercial invoice record to proceed with verification.",
    });
    return findings;
  }

  const invoice = match.invoice;

  // Check 2: Invoice line-item arithmetic consistency (Rule 4)
  const lineCheck = calculateInvoiceLineArithmetic(
    invoice.invoiced_qty,
    invoice.unit_price,
    invoice.line_amount,
    invoice.currency
  );

  if (lineCheck.valid && !lineCheck.matches) {
    findings.push({
      finding_id: `FND-ARITH-${invoice.record_id}`,
      claim_id: dispute.dispute_id,
      statement: `Invoice line amount (${lineCheck.recordedAmount} ${lineCheck.currency}) does not match invoiced quantity × unit price (${lineCheck.expectedAmount} ${lineCheck.currency}).`,
      status: FindingState.CONFLICTING_RECORDS,
      source_record_ids: [invoice.record_id].filter((id) => availableRecordIds.has(id)),
      calculation: {
        expression: `${invoice.invoiced_qty} * ${invoice.unit_price}`,
        result: lineCheck.expectedAmount,
        unit: lineCheck.currency,
      },
      assumptions: [
        "Line calculation excludes unmodelled trade discounts, rebates, or taxes.",
      ],
      limitations: [
        "Discrepancy may reflect documented off-invoice pricing adjustments not present in dataset.",
      ],
      next_step: "Verify whether taxes, freight charges, or line discounts apply to invoice total.",
    });
  }

  // Check 3: Ambiguous shipment matching (Rule 11)
  if (match.candidateDispatches.length > 1 && !match.dispatch) {
    findings.push({
      finding_id: `FND-AMBIG-SHIPMENT-${invoice.record_id}`,
      claim_id: dispute.dispute_id,
      statement: `Multiple candidate shipments (${match.candidateDispatches.map((d) => d.shipment_id).join(", ")}) match invoice ${invoice.invoice_id}; shipment attribution remains unresolved.`,
      status: FindingState.UNRESOLVED,
      source_record_ids: [
        invoice.record_id,
        ...match.candidateDispatches.map((d) => d.record_id),
        ...(match.receipt ? [match.receipt.record_id] : []),
      ].filter((id) => availableRecordIds.has(id)),
      calculation: null,
      assumptions: [
        "Candidate dispatches share overlapping transaction references and dates.",
      ],
      limitations: [
        "Deterministic engine cannot arbitrarily select one shipment candidate without explicit consignment documentation.",
      ],
      next_step: "Request transporter consignment note or lorry receipt linking the delivery to a specific shipment.",
    });
    return findings;
  }

  // Check 4: Missing receipt / proof of delivery (Rule 10)
  if (!match.receipt) {
    const citedIds = [
      invoice.record_id,
      ...(match.dispatch ? [match.dispatch.record_id] : []),
    ].filter((id) => availableRecordIds.has(id));

    findings.push({
      finding_id: `FND-POD-NOT-FOUND-${invoice.record_id}`,
      claim_id: dispute.dispute_id,
      statement: match.dispatch
        ? `No signed receipt or proof of delivery found in the provided dataset for shipment ${match.dispatch.shipment_id}.`
        : `No signed receipt or proof of delivery found in the provided dataset for invoice ${invoice.invoice_id}.`,
      status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
      source_record_ids: citedIds,
      calculation: null,
      assumptions: match.dispatch
        ? [`Supplier dispatch record ${match.dispatch.record_id} records dispatch of ${match.dispatch.dispatched_qty} ${match.dispatch.unit}.`]
        : [],
      limitations: [
        "Absence of a signed receipt in the provided dataset does not prove that delivery failed in physical reality.",
      ],
      next_step: "Obtain signed physical delivery acknowledgment or transporter electronic confirmation.",
    });
    return findings;
  }

  const receipt = match.receipt;

  // Check 5: Unit compatibility check (Rule 3)
  if (!validateUnitCompatibility(invoice.unit, receipt.unit)) {
    findings.push({
      finding_id: `FND-UNIT-MISMATCH-${invoice.record_id}-${receipt.record_id}`,
      claim_id: dispute.dispute_id,
      statement: `Incompatible units between invoice (${invoice.unit}) and receipt (${receipt.unit}); quantity difference cannot be safely calculated.`,
      status: FindingState.UNRESOLVED,
      source_record_ids: [invoice.record_id, receipt.record_id].filter((id) => availableRecordIds.has(id)),
      calculation: null,
      assumptions: [],
      limitations: [
        "No verified conversion ratio exists between the specified units in the dataset.",
      ],
      next_step: "Provide a verified unit-of-measure conversion factor or standard packaging specification.",
    });
    return findings;
  }

  // Check 6: Quantity comparison (Invoice vs. Receipt) (Rule 5)
  const qtyCheck = compareInvoiceAndReceiptQuantities(
    invoice.invoiced_qty,
    receipt.received_qty,
    invoice.unit,
    receipt.unit
  );

  if (qtyCheck.safe && qtyCheck.difference !== undefined) {
    const diff = qtyCheck.difference;
    const citedIds = [invoice.record_id, receipt.record_id].filter((id) =>
      availableRecordIds.has(id)
    );

    if (diff === 0) {
      // Clean agreement
      findings.push({
        finding_id: `FND-QTY-MATCH-${invoice.record_id}`,
        claim_id: dispute.dispute_id,
        statement: `Invoiced quantity (${invoice.invoiced_qty} ${invoice.unit}) matches signed receipt quantity (${receipt.received_qty} ${receipt.unit}) with zero discrepancy.`,
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: citedIds,
        calculation: {
          expression: qtyCheck.expression || `${invoice.invoiced_qty} - ${receipt.received_qty}`,
          result: 0,
          unit: invoice.unit,
        },
        assumptions: [
          `Invoice ${invoice.record_id} and signed receipt ${receipt.record_id} represent the same delivery for ${invoice.item_id}.`,
        ],
        limitations: [
          "Verification applies strictly to the records supplied in this dataset.",
        ],
        next_step: "No further delivery verification required; records agree.",
      });
    } else if (diff > 0) {
      // Short delivery discrepancy
      findings.push({
        finding_id: `FND-QTY-SHORT-${invoice.record_id}`,
        claim_id: dispute.dispute_id,
        statement: `Signed receipt records ${receipt.received_qty} ${receipt.unit}, conflicting with invoice quantity of ${invoice.invoiced_qty} ${invoice.unit} (${diff} ${invoice.unit} shortage).`,
        status: FindingState.CONFLICTING_RECORDS,
        source_record_ids: citedIds,
        calculation: {
          expression: qtyCheck.expression || `${invoice.invoiced_qty} - ${receipt.received_qty}`,
          result: diff,
          unit: invoice.unit,
        },
        assumptions: [
          `Invoice ${invoice.record_id} and signed receipt ${receipt.record_id} refer to item ${invoice.item_id}.`,
        ],
        limitations: [
          "Other deliveries or partial fulfillments may exist outside the supplied dataset.",
        ],
        next_step: "Verify whether a secondary shipment was dispatched or if a credit note was issued.",
      });
    } else {
      // Over-delivery (negative discrepancy)
      findings.push({
        finding_id: `FND-QTY-OVER-${invoice.record_id}`,
        claim_id: dispute.dispute_id,
        statement: `Signed receipt records ${receipt.received_qty} ${receipt.unit}, exceeding invoiced quantity of ${invoice.invoiced_qty} ${invoice.unit} by ${Math.abs(diff)} ${invoice.unit}.`,
        status: FindingState.CONFLICTING_RECORDS,
        source_record_ids: citedIds,
        calculation: {
          expression: qtyCheck.expression || `${invoice.invoiced_qty} - ${receipt.received_qty}`,
          result: diff,
          unit: invoice.unit,
        },
        assumptions: [
          `Invoice ${invoice.record_id} and signed receipt ${receipt.record_id} refer to the same delivery.`,
        ],
        limitations: [
          "Additional quantities may reflect buffer inventory or unbilled sample items.",
        ],
        next_step: "Confirm whether an additional invoice was issued for surplus delivered goods.",
      });
    }
  }

  // Check 7: Credit Note check for short delivery (Rule 9)
  if (qtyCheck.safe && qtyCheck.difference && qtyCheck.difference > 0) {
    if (match.creditNotes.length === 0) {
      findings.push({
        finding_id: `FND-CN-MISSING-${invoice.record_id}`,
        claim_id: dispute.dispute_id,
        statement: `No credit note found in supplied records for invoice ${invoice.invoice_id}.`,
        status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        source_record_ids: [invoice.record_id].filter((id) => availableRecordIds.has(id)),
        calculation: null,
        assumptions: [
          "Credit adjustments would be provided in the credit_notes collection.",
        ],
        limitations: [
          "Absence of a credit note in supplied records does not prove an adjustment was never issued in physical reality.",
        ],
        next_step: "Request credit note documentation from supplier if an adjustment was agreed upon.",
      });
    } else {
      const citedCnIds = [
        invoice.record_id,
        ...match.creditNotes.map((cn) => cn.record_id),
      ].filter((id) => availableRecordIds.has(id));

      const totalCredits = match.creditNotes.reduce((sum, cn) => sum + cn.amount, 0);
      findings.push({
        finding_id: `FND-CN-FOUND-${invoice.record_id}`,
        claim_id: dispute.dispute_id,
        statement: `Credit notes totaling ${totalCredits} ${invoice.currency} are recorded against invoice ${invoice.invoice_id}.`,
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: citedCnIds,
        calculation: {
          expression: match.creditNotes.map((c) => c.amount).join(" + "),
          result: totalCredits,
          unit: invoice.currency,
        },
        assumptions: [
          "Credit notes link to the disputed invoice by explicit invoice_id.",
        ],
        limitations: [
          "Credit note presence does not automatically determine whether the buyer's deduction was fully authorized.",
        ],
        next_step: "Compare credit note amount against computed shortage value.",
      });
    }
  }

  return findings;
}


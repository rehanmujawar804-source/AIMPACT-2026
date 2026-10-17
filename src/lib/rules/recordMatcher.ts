/**
 * ProofTrail — Deterministic Record Matching Engine
 *
 * Matches claims against commercial records using explicit identifiers:
 * - invoice_id, po_id, shipment_id, item_id
 *
 * Enforces key architectural rules:
 * - Never match records solely because quantities or amounts are equal (Rule 2).
 * - Preserve multiple candidate matches when evidence is ambiguous (Rule 11).
 * - Detect duplicate record IDs and duplicate transaction entries (Rule 1).
 * - Never select the first candidate arbitrarily.
 * - Never manufacture record identifiers (Rule 10).
 * - Pure TypeScript, 0 external dependencies, 0 LLM calls.
 */

import { DisputeInput } from "@/types";
import {
  Invoice,
  PurchaseOrder,
  DispatchRecord,
  ReceiptRecord,
  PaymentRecord,
  CreditNoteRecord,
  RecordCollection,
  RecordMatchOutcome,
} from "./types";

/**
 * Matches a dispute input against the supplied collection of commercial records.
 */
export function matchRecords(
  dispute: DisputeInput,
  records: RecordCollection
): RecordMatchOutcome {
  const unresolvedReasons: string[] = [];
  const duplicateRecordIds: string[] = [];

  // Check 0: Duplicate Record ID detection across all collections (Rule 1)
  const seenRecordIds = new Set<string>();
  const allRecords = [
    ...(records.purchase_orders || []),
    ...(records.invoices || []),
    ...(records.dispatches || []),
    ...(records.receipts || []),
    ...(records.payments || []),
    ...(records.credit_notes || []),
  ];

  for (const rec of allRecords) {
    if (rec && rec.record_id) {
      if (seenRecordIds.has(rec.record_id)) {
        duplicateRecordIds.push(rec.record_id);
        unresolvedReasons.push(`Duplicate record_id '${rec.record_id}' detected in provided records.`);
      } else {
        seenRecordIds.add(rec.record_id);
      }
    }
  }

  // 1. Match Invoice
  let matchedInvoice: Invoice | undefined;
  const candidateInvoices: Invoice[] = [];
  const invoices = records.invoices || [];

  if (dispute.invoice_id) {
    const foundInvoices = invoices.filter(
      (inv) => inv.invoice_id === dispute.invoice_id
    );
    candidateInvoices.push(...foundInvoices);
    if (candidateInvoices.length === 1) {
      matchedInvoice = candidateInvoices[0];
    } else if (candidateInvoices.length > 1) {
      unresolvedReasons.push(
        `Multiple invoices (${candidateInvoices.map((i) => i.record_id).join(", ")}) share the same invoice_id '${dispute.invoice_id}'.`
      );
    } else {
      unresolvedReasons.push(
        `Referenced invoice '${dispute.invoice_id}' not found in supplied invoice records.`
      );
    }
  } else if (invoices.length === 1) {
    // If dispute did not specify invoice_id but exactly one invoice exists in dataset
    matchedInvoice = invoices[0];
    candidateInvoices.push(matchedInvoice);
  } else if (invoices.length > 1) {
    candidateInvoices.push(...invoices);
    unresolvedReasons.push(
      "Dispute does not specify invoice_id, and dataset contains multiple invoices."
    );
  }

  // 2. Match Purchase Order
  let matchedPO: PurchaseOrder | undefined;
  const pos = records.purchase_orders || [];
  if (matchedInvoice?.po_id) {
    matchedPO = pos.find((po) => po.po_id === matchedInvoice!.po_id);
  }

  // 3. Match Dispatches
  const candidateDispatches: DispatchRecord[] = [];
  const dispatches = records.dispatches || [];
  const targetInvoiceId = matchedInvoice?.invoice_id || dispute.invoice_id;
  const targetShipmentId = dispute.shipment_id || matchedInvoice?.shipment_id;

  for (const dspt of dispatches) {
    const matchesInvoice = targetInvoiceId && dspt.invoice_id === targetInvoiceId;
    const matchesShipment = targetShipmentId && dspt.shipment_id === targetShipmentId;

    if (matchesShipment || matchesInvoice) {
      candidateDispatches.push(dspt);
    }
  }

  let matchedDispatch: DispatchRecord | undefined;
  if (candidateDispatches.length === 1) {
    matchedDispatch = candidateDispatches[0];
  } else if (candidateDispatches.length > 1) {
    unresolvedReasons.push(
      `Multiple candidate dispatches (${candidateDispatches.map((d) => d.record_id).join(", ")}) match the transaction.`
    );
  }

  // 4. Match Receipts
  const candidateReceipts: ReceiptRecord[] = [];
  const receipts = records.receipts || [];

  for (const pod of receipts) {
    // Match by explicit shipment ID if available
    if (targetShipmentId && pod.shipment_id === targetShipmentId) {
      candidateReceipts.push(pod);
      continue;
    }
    // Match by invoice ID if available
    if (targetInvoiceId && pod.invoice_id === targetInvoiceId) {
      candidateReceipts.push(pod);
      continue;
    }
    // Match by item ID if linked to matched invoice item
    if (matchedInvoice && pod.item_id === matchedInvoice.item_id) {
      candidateReceipts.push(pod);
    }
  }

  let matchedReceipt: ReceiptRecord | undefined;
  if (candidateReceipts.length === 1) {
    matchedReceipt = candidateReceipts[0];
  } else if (candidateReceipts.length > 1) {
    unresolvedReasons.push(
      `Multiple candidate receipts (${candidateReceipts.map((r) => r.record_id).join(", ")}) match the transaction.`
    );
  }

  // 5. Match Payments & Credit Notes
  const matchedPayments: PaymentRecord[] = [];
  const payments = records.payments || [];
  if (targetInvoiceId) {
    for (const pay of payments) {
      if (pay.invoice_id === targetInvoiceId) {
        matchedPayments.push(pay);
      }
    }
  }

  const matchedCreditNotes: CreditNoteRecord[] = [];
  const creditNotes = records.credit_notes || [];
  if (targetInvoiceId) {
    for (const cn of creditNotes) {
      if (cn.invoice_id === targetInvoiceId) {
        matchedCreditNotes.push(cn);
      }
    }
  }

  // 6. Determine Match Status
  let status: RecordMatchOutcome["status"] = "UNIQUE_MATCH";
  if (duplicateRecordIds.length > 0) {
    status = "DUPLICATE_RECORDS";
  } else if (!matchedInvoice) {
    if (candidateInvoices.length > 1) {
      status = "AMBIGUOUS_MATCH";
    } else {
      status = "MISSING_RECORD";
    }
  } else if (candidateDispatches.length > 1 || candidateReceipts.length > 1) {
    status = "AMBIGUOUS_MATCH";
  } else if (!matchedDispatch && dispatches.length > 0) {
    status = "MISSING_RECORD";
  }

  return {
    status,
    invoice: matchedInvoice,
    candidateInvoices,
    purchaseOrder: matchedPO,
    dispatch: matchedDispatch,
    candidateDispatches,
    receipt: matchedReceipt,
    candidateReceipts,
    payments: matchedPayments,
    creditNotes: matchedCreditNotes,
    unresolvedReasons,
    duplicateRecordIds,
  };
}


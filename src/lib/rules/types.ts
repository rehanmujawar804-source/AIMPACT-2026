/**
 * ProofTrail — Deterministic Rules Engine Internal Contracts
 *
 * NOTE: These types align strictly with the canonical contracts defined in
 * docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Sections 4 & 9), src/types/index.ts,
 * and the Phase 1 fixtures.
 */

import {
  DisputeInput,
  Finding,
  PurchaseOrderRecord,
  InvoiceRecord,
  DispatchRecord,
  ReceiptRecord,
  PaymentRecord,
  CreditNoteRecord,
  RecordCollection,
} from "@/types";

// Re-export canonical record types for rules engine usage
export type PurchaseOrder = PurchaseOrderRecord;
export type Invoice = InvoiceRecord;
export type { DispatchRecord, ReceiptRecord, PaymentRecord, CreditNoteRecord, RecordCollection };

/**
 * Validated investigation input representing dispute + commercial records collection
 */
export interface ValidatedInvestigationInput {
  dispute: DisputeInput;
  records: RecordCollection;
  mode?: "rules_only" | "hybrid";
}

export type MatchStatus =
  | "UNIQUE_MATCH"
  | "AMBIGUOUS_MATCH"
  | "MISSING_RECORD"
  | "INVALID_RELATIONSHIP"
  | "DUPLICATE_RECORDS";

export interface RecordMatchOutcome {
  status: MatchStatus;
  invoice?: Invoice;
  candidateInvoices: Invoice[];
  purchaseOrder?: PurchaseOrder;
  dispatch?: DispatchRecord;
  candidateDispatches: DispatchRecord[];
  receipt?: ReceiptRecord;
  candidateReceipts: ReceiptRecord[];
  payments: PaymentRecord[];
  creditNotes: CreditNoteRecord[];
  unresolvedReasons: string[];
  duplicateRecordIds: string[];
}


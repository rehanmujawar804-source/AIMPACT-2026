/**
 * ProofTrail — Deterministic Rules Engine Internal Contracts
 * 
 * NOTE: These types align strictly with the canonical contracts defined in
 * docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Sections 4 & 9) and the Phase 1 fixtures.
 * They represent the exact schema structure proposed to Rehan for formal inclusion
 * in src/types/index.ts under the team's Sole-Editor rule.
 */

import { DisputeInput, Finding } from "@/types";

export interface PurchaseOrder {
  record_id: string;
  po_id: string;
  buyer_id?: string;
  supplier_id?: string;
  item_id: string;
  ordered_qty: number;
  unit: string;
  unit_price: number;
  currency: string;
  date: string;
}

export interface Invoice {
  record_id: string;
  invoice_id: string;
  po_id?: string | null;
  shipment_id?: string | null;
  item_id: string;
  invoiced_qty: number;
  unit: string;
  unit_price: number;
  line_amount: number;
  currency: string;
  date: string;
}

export interface DispatchRecord {
  record_id: string;
  shipment_id: string;
  invoice_id?: string | null;
  item_id: string;
  dispatched_qty: number;
  unit: string;
  dispatch_date?: string;
  date: string;
}

export interface ReceiptRecord {
  record_id: string;
  shipment_id?: string | null;
  invoice_id?: string | null;
  item_id: string;
  received_qty: number;
  unit: string;
  signed: boolean;
  receipt_date?: string;
  date: string;
}

export interface PaymentRecord {
  record_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  payment_date?: string;
  date: string;
  reference?: string;
}

export interface CreditNoteRecord {
  record_id: string;
  invoice_id: string;
  amount: number;
  currency: string;
  date: string;
  reason?: string;
  status?: "approved" | "pending" | "rejected";
}

export interface RecordCollection {
  purchase_orders: PurchaseOrder[];
  invoices: Invoice[];
  dispatches: DispatchRecord[];
  receipts: ReceiptRecord[];
  payments: PaymentRecord[];
  credit_notes: CreditNoteRecord[];
}

export interface ValidatedInvestigationInput {
  dispute: DisputeInput;
  records: RecordCollection;
  mode?: "rules_only" | "hybrid";
}

export type MatchStatus =
  | "UNIQUE_MATCH"
  | "AMBIGUOUS_MATCH"
  | "MISSING_RECORD"
  | "INVALID_RELATIONSHIP";

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
}


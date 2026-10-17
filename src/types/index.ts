/**
 * ProofTrail — Canonical Data Contracts & Shared Types
 * Source of truth: docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md & docs/DEVELOPMENT_ROADMAP.md
 *
 * NOTE: Phase 1 locks down all canonical contracts, record schemas,
 * request/response payloads, and synthetic fixture structures.
 */

import { z } from "zod";

// ============================================================================
// 1. Finding States (Canonical wire contract: 4 approved states, D5 & D11)
// ============================================================================

export const FindingState = {
  SUPPORTED_BY_RECORDS: "SUPPORTED_BY_RECORDS",
  CONFLICTING_RECORDS: "CONFLICTING_RECORDS",
  NOT_FOUND_IN_PROVIDED_DATA: "NOT_FOUND_IN_PROVIDED_DATA",
  UNRESOLVED: "UNRESOLVED",
} as const;

export const FindingStateSchema = z.enum([
  FindingState.SUPPORTED_BY_RECORDS,
  FindingState.CONFLICTING_RECORDS,
  FindingState.NOT_FOUND_IN_PROVIDED_DATA,
  FindingState.UNRESOLVED,
]);

export type FindingStateType = z.infer<typeof FindingStateSchema>;

// ============================================================================
// 2. Provenance Values (docs/04 Section 5.4)
// ============================================================================

export const Provenance = {
  EXPLICIT: "explicit",
  DERIVED: "derived",
  INFERRED: "inferred",
  UNKNOWN: "unknown",
} as const;

export const ProvenanceSchema = z.enum([
  Provenance.EXPLICIT,
  Provenance.DERIVED,
  Provenance.INFERRED,
  Provenance.UNKNOWN,
]);

export type ProvenanceType = z.infer<typeof ProvenanceSchema>;

// ============================================================================
// 3. Dispute Input Contract (docs/04 Section 4.1)
// ============================================================================

export const DisputeInputSchema = z.object({
  dispute_id: z.string().min(1),
  message: z.string().min(1),
  claimed_issue: z.string().optional().nullable(),
  invoice_id: z.string().optional().nullable(),
  shipment_id: z.string().optional().nullable(),
});

export type DisputeInput = z.infer<typeof DisputeInputSchema>;

// ============================================================================
// 4. Calculation Structure (docs/04 Section 7.5)
// ============================================================================

export const FindingCalculationSchema = z.object({
  expression: z.string(),
  result: z.number(),
  unit: z.string(),
});

export type FindingCalculation = z.infer<typeof FindingCalculationSchema>;

// ============================================================================
// 5. Canonical Finding Contract (docs/04 Section 7.2)
// ============================================================================

export const FindingSchema = z.object({
  finding_id: z.string().min(1),
  claim_id: z.string().optional().nullable(),
  statement: z.string().min(1),
  status: FindingStateSchema,
  source_record_ids: z.array(z.string()),
  calculation: FindingCalculationSchema.optional().nullable(),
  assumptions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  /**
   * Canonical next verification step field as defined in docs/04 Section 7.2
   */
  next_step: z.string().optional().nullable(),
  /**
   * Optional aliases / extensions for documentation and UI compatibility
   */
  claim: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  next_verification_steps: z.array(z.string()).optional(),
});

export type Finding = z.infer<typeof FindingSchema>;

// ============================================================================
// 6. Source Record Schemas (docs/04 Section 4.2 – 4.7)
// ============================================================================

export const BaseRecordSchema = z.object({
  record_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD"),
});

export type BaseRecord = z.infer<typeof BaseRecordSchema>;

/**
 * Purchase Order Record (docs/04 Section 4.2)
 */
export const PurchaseOrderRecordSchema = BaseRecordSchema.extend({
  po_id: z.string().min(1),
  buyer_id: z.string().optional().nullable(),
  supplier_id: z.string().optional().nullable(),
  item_id: z.string().min(1),
  ordered_qty: z.number().int().nonnegative(),
  unit: z.string().min(1),
  unit_price: z.number().nonnegative(),
  currency: z.string().default("INR"),
});

export type PurchaseOrderRecord = z.infer<typeof PurchaseOrderRecordSchema>;

/**
 * Invoice Record (docs/04 Section 4.3)
 */
export const InvoiceRecordSchema = BaseRecordSchema.extend({
  invoice_id: z.string().min(1),
  po_id: z.string().optional().nullable(),
  shipment_id: z.string().optional().nullable(),
  item_id: z.string().min(1),
  invoiced_qty: z.number().int().nonnegative(),
  unit: z.string().min(1),
  unit_price: z.number().nonnegative(),
  line_amount: z.number().nonnegative(),
  currency: z.string().default("INR"),
});

export type InvoiceRecord = z.infer<typeof InvoiceRecordSchema>;

/**
 * Dispatch Record (docs/04 Section 4.4)
 */
export const DispatchRecordSchema = z.object({
  record_id: z.string().min(1),
  shipment_id: z.string().min(1),
  invoice_id: z.string().optional().nullable(),
  item_id: z.string().min(1),
  dispatched_qty: z.number().int().nonnegative(),
  unit: z.string().min(1),
  dispatch_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD").optional(),
});

export type DispatchRecord = z.infer<typeof DispatchRecordSchema>;

/**
 * Receipt / Proof of Delivery Record (docs/04 Section 4.5)
 */
export const ReceiptRecordSchema = z.object({
  record_id: z.string().min(1),
  shipment_id: z.string().min(1),
  invoice_id: z.string().optional().nullable(),
  item_id: z.string().min(1),
  received_qty: z.number().int().nonnegative(),
  unit: z.string().min(1),
  signed: z.boolean().default(false),
  receipt_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD").optional(),
});

export type ReceiptRecord = z.infer<typeof ReceiptRecordSchema>;

/**
 * Payment Record (docs/04 Section 4.6)
 */
export const PaymentRecordSchema = z.object({
  record_id: z.string().min(1),
  invoice_id: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().default("INR"),
  payment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD").optional(),
  reference: z.string().optional().nullable(),
});

export type PaymentRecord = z.infer<typeof PaymentRecordSchema>;

/**
 * Credit Note Record (docs/04 Section 4.7)
 */
export const CreditNoteRecordSchema = BaseRecordSchema.extend({
  invoice_id: z.string().min(1),
  amount: z.number().nonnegative(),
  currency: z.string().default("INR"),
  reason: z.string().optional().nullable(),
});

export type CreditNoteRecord = z.infer<typeof CreditNoteRecordSchema>;

/**
 * Canonical Record Collection (docs/04 Section 4.8)
 */
export const RecordCollectionSchema = z.object({
  purchase_orders: z.array(PurchaseOrderRecordSchema).default([]),
  invoices: z.array(InvoiceRecordSchema).default([]),
  dispatches: z.array(DispatchRecordSchema).default([]),
  receipts: z.array(ReceiptRecordSchema).default([]),
  payments: z.array(PaymentRecordSchema).default([]),
  credit_notes: z.array(CreditNoteRecordSchema).default([]),
});

export type RecordCollection = z.infer<typeof RecordCollectionSchema>;

// ============================================================================
// 7. Claim Extraction Contract (docs/04 Section 5.2)
// ============================================================================

export const ClaimExtractionSchema = z.object({
  dispute_id: z.string().min(1),
  issue_type: z.string().default("short_delivery"),
  claimed_qty: z.number().nullable().optional(),
  unit: z.string().nullable().optional(),
  claimed_amount: z.number().nullable().optional(),
  currency: z.string().default("INR").optional(),
  mentioned_invoice_id: z.string().nullable().optional(),
  mentioned_shipment_id: z.string().nullable().optional(),
  claim_text_span: z.string().nullable().optional(),
  field_provenance: z.record(ProvenanceSchema).default({}),
  missing_fields: z.array(z.string()).default([]),
  needs_human_review: z.boolean().default(true),
});

export type ClaimExtraction = z.infer<typeof ClaimExtractionSchema>;

// ============================================================================
// 8. Candidate Record Matching Contract (docs/04 Section 6.3)
// ============================================================================

export const CandidateMatchSchema = z.object({
  candidate_id: z.string().min(1),
  record_id: z.string().min(1),
  record_type: z.string().min(1),
  match_status: z.string().min(1),
  match_reasons: z.array(z.string()).default([]),
  requires_review: z.boolean().default(false),
});

export type CandidateMatch = z.infer<typeof CandidateMatchSchema>;

// ============================================================================
// 9. API Request & Response Contracts (docs/04 Section 9)
// ============================================================================

export const ProcessingModeSchema = z.enum(["rules_only", "hybrid"]);
export type ProcessingMode = z.infer<typeof ProcessingModeSchema>;

export const InvestigationRequestSchema = z.object({
  dispute: DisputeInputSchema,
  records: RecordCollectionSchema,
  mode: ProcessingModeSchema.default("hybrid"),
});

export type InvestigationRequest = z.infer<typeof InvestigationRequestSchema>;

export const EvaluationMetadataSchema = z.object({
  mode: ProcessingModeSchema,
  model_used: z.string().nullable().optional(),
  fallback_used: z.boolean().default(false),
});

export type EvaluationMetadata = z.infer<typeof EvaluationMetadataSchema>;

export const ReconciliationSummarySchema = z.object({
  invoice_amount: z.number().nonnegative(),
  payments_recorded: z.number().nonnegative(),
  credit_notes_recorded: z.number().nonnegative().default(0),
  calculated_balance: z.number(),
  currency: z.string().default("INR"),
});

export type ReconciliationSummary = z.infer<typeof ReconciliationSummarySchema>;

export const InvestigationResponseSchema = z.object({
  investigation_id: z.string().min(1),
  dispute_id: z.string().min(1),
  claim_extraction: ClaimExtractionSchema.optional().nullable(),
  candidate_matches: z.array(CandidateMatchSchema).default([]),
  findings: z.array(FindingSchema),
  reconciliation: ReconciliationSummarySchema.optional().nullable(),
  unresolved_questions: z.array(z.string()).default([]),
  evaluation_metadata: EvaluationMetadataSchema.optional().nullable(),
});

export type InvestigationResponse = z.infer<typeof InvestigationResponseSchema>;

// ============================================================================
// 10. Synthetic Test Case Benchmark Contract (docs/06 Section 3)
// ============================================================================

export const SyntheticCaseExpectedResultsSchema = z.object({
  finding_statuses: z.array(FindingStateSchema),
  expected_findings: z.array(FindingSchema).optional(),
  expected_calculation: FindingCalculationSchema.optional().nullable(),
  unresolved_questions: z.array(z.string()).optional(),
  needs_human_review: z.boolean().default(true),
});

export type SyntheticCaseExpectedResults = z.infer<typeof SyntheticCaseExpectedResultsSchema>;

export const SyntheticCaseSchema = z.object({
  case_id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  dispute: DisputeInputSchema,
  records: RecordCollectionSchema,
  expected_results: SyntheticCaseExpectedResultsSchema,
});

export type SyntheticCase = z.infer<typeof SyntheticCaseSchema>;

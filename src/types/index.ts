/**
 * ProofTrail — Canonical Data Contracts & Shared Types
 * Source of truth: docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md
 *
 * NOTE: Phase 0 establishes schemas and types. Business rules and engines
 * are implemented in subsequent phases.
 */

import { z } from "zod";

// --- Finding States ---
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

// --- Provenance Values ---
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

// --- Dispute Input Contract ---
export const DisputeInputSchema = z.object({
  dispute_id: z.string().min(1),
  message: z.string().min(1),
  claimed_issue: z.string().optional().nullable(),
  invoice_id: z.string().optional().nullable(),
  shipment_id: z.string().optional().nullable(),
});

export type DisputeInput = z.infer<typeof DisputeInputSchema>;

// --- Calculation Structure ---
export const FindingCalculationSchema = z.object({
  expression: z.string(),
  result: z.number(),
  unit: z.string(),
});

export type FindingCalculation = z.infer<typeof FindingCalculationSchema>;

// --- Canonical Finding Contract ---
export const FindingSchema = z.object({
  finding_id: z.string().min(1),
  claim_id: z.string().optional().nullable(),
  statement: z.string().min(1),
  status: FindingStateSchema,
  source_record_ids: z.array(z.string()),
  calculation: FindingCalculationSchema.optional().nullable(),
  assumptions: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  next_step: z.string().optional().nullable(),
});

export type Finding = z.infer<typeof FindingSchema>;

// --- Source Record Common Base ---
export const BaseRecordSchema = z.object({
  record_id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be ISO YYYY-MM-DD"),
});

export type BaseRecord = z.infer<typeof BaseRecordSchema>;

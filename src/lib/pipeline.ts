/**
 * ProofTrail — Investigation Pipeline
 *
 * Orchestrates the complete investigation workflow:
 *   Input Validation → Claim Extraction (AI or fallback) → Record Matching → Deterministic Verification → Finding Builder → Response
 *
 * Source of truth:
 *   docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Section 9)
 *   docs/DEVELOPMENT_ROADMAP.md (Phase 2 Stream D, Phase 4)
 *
 * Handoff contracts:
 *   From Maaz: runDeterministicInvestigation(input: ValidatedInvestigationInput): Finding[]
 *   From Swara: extractClaim(message, disputeId): Promise<ExtractionResult>
 *   To Bhavika: InvestigationResponse (matches mock_investigation_response.json field-for-field)
 */

import {
  InvestigationRequestSchema,
  InvestigationResponseSchema,
  type InvestigationRequest,
  type InvestigationResponse,
  type ClaimExtraction,
} from "@/types";
import { runDeterministicInvestigation } from "@/lib/evidence/findingBuilder";
import { extractClaim, type ExtractionResult } from "@/lib/ai/claimExtractor";
import { z } from "zod";

// ============================================================================
// Pipeline Orchestration
// ============================================================================

/**
 * Runs the full investigation pipeline.
 *
 * Processing modes:
 *   - "rules_only": Skips AI extraction; uses the dispute fields as-is.
 *   - "hybrid": Attempts AI extraction; falls back to rules-only if it fails.
 */
export async function runInvestigationPipeline(
  request: InvestigationRequest
): Promise<InvestigationResponse> {
  const { dispute, records, mode } = request;

  const investigationId = `INVEST-${Date.now()}-${dispute.dispute_id}`;

  let claimExtraction: ClaimExtraction | null = null;
  let extractionResult: ExtractionResult | null = null;
  let fallbackUsed = false;
  let modelUsed: string | null = null;
  const processingMode = mode ?? "hybrid";

  // Step 1: Claim extraction (hybrid mode only)
  if (processingMode === "hybrid") {
    extractionResult = await extractClaim(
      dispute.message,
      dispute.dispute_id,
      true // always allow mock fallback in development
    );

    claimExtraction = extractionResult.extraction;
    fallbackUsed = extractionResult.mode !== "ai";
    modelUsed = extractionResult.providerUsed === "ai" ? "live-provider" : extractionResult.providerUsed;

    // If extraction succeeded (AI or mock), enrich the dispute input with extracted references
    // but only if the original dispute fields are absent — never silently overwrite explicit user input.
    if (claimExtraction) {
      if (!dispute.invoice_id && claimExtraction.mentioned_invoice_id) {
        dispute.invoice_id = claimExtraction.mentioned_invoice_id;
      }
      if (!dispute.shipment_id && claimExtraction.mentioned_shipment_id) {
        dispute.shipment_id = claimExtraction.mentioned_shipment_id;
      }
      if (!dispute.claimed_issue && claimExtraction.issue_type) {
        dispute.claimed_issue = claimExtraction.issue_type;
      }
    }
  }

  // Step 2: Deterministic Investigation (always runs regardless of mode)
  const findings = runDeterministicInvestigation({ dispute, records, mode: processingMode });

  // Step 3: Compute reconciliation summary
  const invoices = records.invoices ?? [];
  const payments = records.payments ?? [];
  const creditNotes = records.credit_notes ?? [];

  // Find the invoice matched for this dispute for reconciliation figures
  const matchedInvoice = invoices.find(
    (inv) => dispute.invoice_id && inv.invoice_id === dispute.invoice_id
  ) ?? invoices[0];

  const invoiceAmount = matchedInvoice?.line_amount ?? 0;
  const paymentsRecorded = payments.reduce((sum, p) => sum + (p.amount ?? 0), 0);
  const creditNotesRecorded = creditNotes.reduce((sum, cn) => sum + (cn.amount ?? 0), 0);

  const reconciliation = {
    invoice_amount: invoiceAmount,
    payments_recorded: paymentsRecorded,
    credit_notes_recorded: creditNotesRecorded,
    calculated_balance: invoiceAmount - paymentsRecorded - creditNotesRecorded,
    currency: matchedInvoice?.currency ?? "INR",
  };

  // Step 4: Build unresolved questions list from findings
  const unresolvedQuestions = findings
    .filter((f) => f.next_step)
    .map((f) => f.next_step as string)
    .filter(Boolean);

  // Step 5: Build candidate matches from claim extraction if available
  const candidateMatches = claimExtraction
    ? buildCandidateMatchesFromExtraction(claimExtraction, records)
    : [];

  // Step 6: Assemble and validate full response
  const response: InvestigationResponse = {
    investigation_id: investigationId,
    dispute_id: dispute.dispute_id,
    claim_extraction: claimExtraction ?? null,
    candidate_matches: candidateMatches,
    findings,
    reconciliation,
    unresolved_questions: unresolvedQuestions,
    evaluation_metadata: {
      mode: processingMode,
      model_used: modelUsed ?? null,
      fallback_used: fallbackUsed,
    },
  };

  // Validate the response before returning (internal integrity check)
  const parseResult = InvestigationResponseSchema.safeParse(response);
  if (!parseResult.success) {
    // Response structure is malformed — this is a code bug, not a user error
    // Return a safe error response rather than crashing
    return {
      investigation_id: investigationId,
      dispute_id: dispute.dispute_id,
      claim_extraction: null,
      candidate_matches: [],
      findings: [
        {
          finding_id: "FND-PIPELINE-ERROR",
          claim_id: dispute.dispute_id,
          statement:
            "An internal pipeline error occurred while assembling the investigation response. " +
            "Source records are preserved and the investigation can be retried.",
          status: "UNRESOLVED",
          source_record_ids: [],
          calculation: null,
          assumptions: [],
          limitations: ["Pipeline response schema validation failed."],
          next_step: "Contact the engineering team with the investigation ID for diagnostics.",
        },
      ],
      reconciliation: null,
      unresolved_questions: ["Internal pipeline error — response schema mismatch."],
      evaluation_metadata: {
        mode: processingMode,
        model_used: null,
        fallback_used: true,
      },
    };
  }

  return parseResult.data;
}

// ============================================================================
// Internal: Candidate Match Builder
// ============================================================================

/**
 * Builds a list of candidate matches from a validated claim extraction.
 * Only creates candidates for record IDs that are verifiably present in the
 * supplied records collection. Does NOT invent references.
 */
function buildCandidateMatchesFromExtraction(
  extraction: ClaimExtraction,
  records: InvestigationRequest["records"]
): InvestigationResponse["candidate_matches"] {
  const candidates: InvestigationResponse["candidate_matches"] = [];

  // Validate invoice candidate
  if (extraction.mentioned_invoice_id) {
    const invoice = records.invoices?.find(
      (inv) => inv.invoice_id === extraction.mentioned_invoice_id
    );
    if (invoice) {
      candidates.push({
        candidate_id: `CAND-INV-${invoice.record_id}`,
        record_id: invoice.record_id,
        record_type: "invoice",
        match_status: "CONFIRMED_MATCH",
        match_reasons: [
          `Invoice ID '${extraction.mentioned_invoice_id}' explicitly mentioned in dispute message.`,
        ],
        requires_review: extraction.needs_human_review,
      });
    }
    // If mentioned but not found, do NOT create a phantom candidate
  }

  // Validate shipment / receipt candidate
  if (extraction.mentioned_shipment_id) {
    // Check dispatches
    const dispatch = records.dispatches?.find(
      (d) => d.shipment_id === extraction.mentioned_shipment_id
    );
    if (dispatch) {
      candidates.push({
        candidate_id: `CAND-DSP-${dispatch.record_id}`,
        record_id: dispatch.record_id,
        record_type: "dispatch",
        match_status: "CONFIRMED_MATCH",
        match_reasons: [
          `Shipment reference '${extraction.mentioned_shipment_id}' links dispatch record.`,
        ],
        requires_review: extraction.needs_human_review,
      });
    }

    // Check receipts
    const receipt = records.receipts?.find(
      (r) => r.shipment_id === extraction.mentioned_shipment_id
    );
    if (receipt) {
      candidates.push({
        candidate_id: `CAND-POD-${receipt.record_id}`,
        record_id: receipt.record_id,
        record_type: "receipt",
        match_status: "CONFIRMED_MATCH",
        match_reasons: [
          `Shipment reference '${extraction.mentioned_shipment_id}' links proof-of-delivery record.`,
        ],
        requires_review: extraction.needs_human_review,
      });
    }
  }

  return candidates;
}


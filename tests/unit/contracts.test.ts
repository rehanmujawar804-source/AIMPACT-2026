import { describe, it, expect } from "vitest";
import {
  FindingState,
  FindingStateSchema,
  Provenance,
  ProvenanceSchema,
  DisputeInputSchema,
  FindingSchema,
  BaseRecordSchema,
  PurchaseOrderRecordSchema,
  InvoiceRecordSchema,
  DispatchRecordSchema,
  ReceiptRecordSchema,
  PaymentRecordSchema,
  CreditNoteRecordSchema,
  RecordCollectionSchema,
  ClaimExtractionSchema,
  CandidateMatchSchema,
  InvestigationRequestSchema,
  InvestigationResponseSchema,
} from "@/types";

describe("Canonical Data Contracts & Schemas", () => {
  describe("FindingStateSchema (Decision D5 & D11)", () => {
    it("accepts all four canonical finding states", () => {
      expect(FindingStateSchema.safeParse(FindingState.SUPPORTED_BY_RECORDS).success).toBe(true);
      expect(FindingStateSchema.safeParse(FindingState.CONFLICTING_RECORDS).success).toBe(true);
      expect(FindingStateSchema.safeParse(FindingState.NOT_FOUND_IN_PROVIDED_DATA).success).toBe(true);
      expect(FindingStateSchema.safeParse(FindingState.UNRESOLVED).success).toBe(true);
    });

    it("rejects unauthorized finding states (e.g. FRAUD, GUILTY, PROVEN)", () => {
      // docs/04 Section 7.3: Do not introduce FRAUD, GUILTY, PROVEN, or equivalent states.
      expect(FindingStateSchema.safeParse("FRAUD").success).toBe(false);
      expect(FindingStateSchema.safeParse("GUILTY").success).toBe(false);
      expect(FindingStateSchema.safeParse("PROVEN").success).toBe(false);
      expect(FindingStateSchema.safeParse("PARTIAL_MATCH").success).toBe(false);
      expect(FindingStateSchema.safeParse("CORRECT").success).toBe(false);
      expect(FindingStateSchema.safeParse("CHEATING").success).toBe(false);
    });
  });

  describe("ProvenanceSchema", () => {
    it("accepts all 4 canonical provenance values", () => {
      expect(ProvenanceSchema.safeParse(Provenance.EXPLICIT).success).toBe(true);
      expect(ProvenanceSchema.safeParse(Provenance.DERIVED).success).toBe(true);
      expect(ProvenanceSchema.safeParse(Provenance.INFERRED).success).toBe(true);
      expect(ProvenanceSchema.safeParse(Provenance.UNKNOWN).success).toBe(true);
    });

    it("rejects unauthorized provenance values", () => {
      expect(ProvenanceSchema.safeParse("VERIFIED").success).toBe(false);
      expect(ProvenanceSchema.safeParse("GUESS").success).toBe(false);
    });
  });

  describe("DisputeInputSchema", () => {
    it("validates a compliant dispute object", () => {
      const validDispute = {
        dispute_id: "DSP-001",
        message: "We received only 80 of the 100 units invoiced.",
        claimed_issue: "short_delivery",
        invoice_id: "INV-001",
        shipment_id: "SHP-001",
      };
      const result = DisputeInputSchema.safeParse(validDispute);
      expect(result.success).toBe(true);
    });

    it("rejects dispute with missing required fields", () => {
      const invalidDispute = {
        claimed_issue: "short_delivery",
      };
      const result = DisputeInputSchema.safeParse(invalidDispute);
      expect(result.success).toBe(false);
    });

    it("rejects empty dispute_id or message", () => {
      expect(DisputeInputSchema.safeParse({ dispute_id: "", message: "text" }).success).toBe(false);
      expect(DisputeInputSchema.safeParse({ dispute_id: "DSP-1", message: "" }).success).toBe(false);
    });
  });

  describe("FindingSchema & next_step / nextVerificationSteps contract", () => {
    it("validates a fully formed finding with source citations and deterministic calculation", () => {
      const validFinding = {
        finding_id: "FND-001",
        claim_id: "CLM-001",
        statement: "Delivery shortage of 20 pcs between invoice and signed receipt.",
        status: FindingState.CONFLICTING_RECORDS,
        source_record_ids: ["INV-REC-001", "POD-REC-001"],
        calculation: {
          expression: "100 - 80",
          result: 20,
          unit: "pcs",
        },
        assumptions: ["Both records refer to the same item and shipment."],
        limitations: ["Other deliveries may exist outside the supplied dataset."],
        next_step: "Verify whether the receipt covers the complete shipment.",
      };
      const result = FindingSchema.safeParse(validFinding);
      expect(result.success).toBe(true);
    });

    it("validates finding with optional next_verification_steps array extension", () => {
      const findingWithSteps = {
        finding_id: "FND-002",
        statement: "Missing signed receipt in provided dataset.",
        status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        source_record_ids: ["INV-REC-001"],
        next_step: "Request signed POD from buyer.",
        next_verification_steps: [
          "Request signed POD from carrier.",
          "Check warehouse physical gate log.",
        ],
      };
      const result = FindingSchema.safeParse(findingWithSteps);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.next_step).toBe("Request signed POD from buyer.");
        expect(result.data.next_verification_steps).toHaveLength(2);
      }
    });

    it("rejects findings without finding_id, statement, status, or source_record_ids", () => {
      expect(FindingSchema.safeParse({ finding_id: "F-1" }).success).toBe(false);
      expect(
        FindingSchema.safeParse({
          finding_id: "F-1",
          statement: "Some issue",
          status: "SUPPORTED_BY_RECORDS",
          // missing source_record_ids
        }).success
      ).toBe(false);
    });
  });

  describe("Transaction Record Schemas (docs/04 Section 4)", () => {
    it("validates BaseRecordSchema with ISO date regex", () => {
      expect(BaseRecordSchema.safeParse({ record_id: "R-1", date: "2026-10-17" }).success).toBe(true);
      expect(BaseRecordSchema.safeParse({ record_id: "R-1", date: "17-10-2026" }).success).toBe(false);
      expect(BaseRecordSchema.safeParse({ record_id: "R-1", date: "invalid-date" }).success).toBe(false);
    });

    it("validates PurchaseOrderRecordSchema and rejects negative values", () => {
      const validPO = {
        record_id: "PO-REC-001",
        po_id: "PO-001",
        item_id: "ITEM-01",
        ordered_qty: 100,
        unit: "pcs",
        unit_price: 150,
        currency: "INR",
        date: "2026-10-01",
      };
      expect(PurchaseOrderRecordSchema.safeParse(validPO).success).toBe(true);

      const invalidPO = { ...validPO, ordered_qty: -10 };
      expect(PurchaseOrderRecordSchema.safeParse(invalidPO).success).toBe(false);
    });

    it("validates InvoiceRecordSchema and enforces positive numbers", () => {
      const validInvoice = {
        record_id: "INV-REC-001",
        invoice_id: "INV-001",
        item_id: "ITEM-01",
        invoiced_qty: 100,
        unit: "pcs",
        unit_price: 150,
        line_amount: 15000,
        currency: "INR",
        date: "2026-10-05",
      };
      expect(InvoiceRecordSchema.safeParse(validInvoice).success).toBe(true);
    });

    it("validates DispatchRecordSchema with dispatch_date", () => {
      const validDispatch = {
        record_id: "DSPT-REC-001",
        shipment_id: "SHP-001",
        item_id: "ITEM-01",
        dispatched_qty: 100,
        unit: "pcs",
        dispatch_date: "2026-10-06",
      };
      expect(DispatchRecordSchema.safeParse(validDispatch).success).toBe(true);
    });

    it("validates ReceiptRecordSchema with signed flag", () => {
      const validReceipt = {
        record_id: "POD-REC-001",
        shipment_id: "SHP-001",
        item_id: "ITEM-01",
        received_qty: 80,
        unit: "pcs",
        signed: true,
        receipt_date: "2026-10-08",
      };
      expect(ReceiptRecordSchema.safeParse(validReceipt).success).toBe(true);
    });

    it("validates PaymentRecordSchema and CreditNoteRecordSchema", () => {
      const validPayment = {
        record_id: "PAY-REC-001",
        invoice_id: "INV-001",
        amount: 12000,
        currency: "INR",
        payment_date: "2026-10-15",
      };
      expect(PaymentRecordSchema.safeParse(validPayment).success).toBe(true);

      const validCreditNote = {
        record_id: "CN-REC-001",
        invoice_id: "INV-001",
        amount: 3000,
        currency: "INR",
        date: "2026-10-16",
        reason: "short_delivery_adjustment",
      };
      expect(CreditNoteRecordSchema.safeParse(validCreditNote).success).toBe(true);
    });

    it("validates RecordCollectionSchema with default empty arrays", () => {
      const emptyCollection = {};
      const parsed = RecordCollectionSchema.safeParse(emptyCollection);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.invoices).toEqual([]);
        expect(parsed.data.receipts).toEqual([]);
      }
    });
  });

  describe("API Envelopes: InvestigationRequest & InvestigationResponse", () => {
    it("validates InvestigationRequestSchema with dispute and records", () => {
      const request = {
        dispute: {
          dispute_id: "DSP-001",
          message: "Check short delivery on INV-001",
        },
        records: {
          invoices: [
            {
              record_id: "INV-REC-001",
              invoice_id: "INV-001",
              item_id: "ITEM-01",
              invoiced_qty: 100,
              unit: "pcs",
              unit_price: 150,
              line_amount: 15000,
              currency: "INR",
              date: "2026-10-05",
            },
          ],
        },
        mode: "rules_only" as const,
      };
      expect(InvestigationRequestSchema.safeParse(request).success).toBe(true);
    });

    it("validates CandidateMatchSchema", () => {
      const match = {
        candidate_id: "CAND-001",
        record_id: "POD-REC-001",
        record_type: "receipt",
        match_status: "CONFIRMED_MATCH",
        match_reasons: ["Matched shipment_id SHP-001"],
        requires_review: false,
      };
      expect(CandidateMatchSchema.safeParse(match).success).toBe(true);
    });

    it("validates ClaimExtractionSchema", () => {
      const extraction = {
        dispute_id: "DSP-001",
        issue_type: "short_delivery",
        claimed_qty: 20,
        unit: "pcs",
        field_provenance: {
          claimed_qty: "derived" as const,
        },
        needs_human_review: true,
      };
      expect(ClaimExtractionSchema.safeParse(extraction).success).toBe(true);
    });

    it("validates full InvestigationResponseSchema", () => {
      const response = {
        investigation_id: "INVEST-001",
        dispute_id: "DSP-001",
        candidate_matches: [],
        findings: [
          {
            finding_id: "FND-001",
            statement: "Short delivery detected",
            status: FindingState.CONFLICTING_RECORDS,
            source_record_ids: ["INV-REC-001", "POD-REC-001"],
            calculation: {
              expression: "100 - 80",
              result: 20,
              unit: "pcs",
            },
          },
        ],
        reconciliation: {
          invoice_amount: 15000,
          payments_recorded: 12000,
          credit_notes_recorded: 0,
          calculated_balance: 3000,
          currency: "INR",
        },
        unresolved_questions: ["Where is the remaining delivery?"],
        evaluation_metadata: {
          mode: "hybrid" as const,
          fallback_used: false,
        },
      };
      expect(InvestigationResponseSchema.safeParse(response).success).toBe(true);
    });
  });
});

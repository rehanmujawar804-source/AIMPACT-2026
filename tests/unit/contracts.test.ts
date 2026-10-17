import { describe, it, expect } from "vitest";
import {
  FindingState,
  FindingStateSchema,
  DisputeInputSchema,
  FindingSchema,
} from "@/types";

describe("Canonical Data Contracts & Schemas", () => {
  describe("FindingStateSchema", () => {
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
  });

  describe("FindingSchema", () => {
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
  });
});

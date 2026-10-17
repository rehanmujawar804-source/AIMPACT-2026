import { describe, it, expect } from "vitest";
import {
  FindingSchema,
  FindingState,
  InvestigationResponseSchema,
  ClaimExtractionSchema,
  SyntheticCaseSchema,
  RecordCollectionSchema,
  InvestigationRequestSchema,
} from "@/types";

// Import canonical test fixtures
import case01 from "../fixtures/case_01_clean_delivery.json";
import case02 from "../fixtures/case_02_short_delivery.json";
import case03 from "../fixtures/case_03_ambiguous_shipment.json";
import case04 from "../fixtures/case_04_missing_receipt.json";
import mockInvestigationResponse from "../fixtures/mock_investigation_response.json";
import mockAiResponse from "../fixtures/mock_ai_response.json";

describe("Phase 1 Canonical Fixture Conformance", () => {
  describe("Synthetic Benchmark Cases (case_01 to case_04)", () => {
    const cases = [
      { id: "case_01", data: case01, expectedState: FindingState.SUPPORTED_BY_RECORDS },
      { id: "case_02", data: case02, expectedState: FindingState.CONFLICTING_RECORDS },
      { id: "case_03", data: case03, expectedState: FindingState.UNRESOLVED },
      { id: "case_04", data: case04, expectedState: FindingState.NOT_FOUND_IN_PROVIDED_DATA },
    ];

    it.each(cases)("$id parses cleanly against SyntheticCaseSchema", ({ data, expectedState }) => {
      const parsed = SyntheticCaseSchema.safeParse(data);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.expected_results.finding_statuses).toContain(expectedState);
      }
    });

    it.each(cases)("$id records validate against RecordCollectionSchema", ({ data }) => {
      const parsed = RecordCollectionSchema.safeParse(data.records);
      expect(parsed.success).toBe(true);
    });

    it.each(cases)("$id can form a valid InvestigationRequest", ({ data }) => {
      const requestPayload = {
        dispute: data.dispute,
        records: data.records,
        mode: "hybrid" as const,
      };
      const parsed = InvestigationRequestSchema.safeParse(requestPayload);
      expect(parsed.success).toBe(true);
    });
  });

  describe("mock_investigation_response.json Conformance", () => {
    it("parses against InvestigationResponseSchema", () => {
      const result = InvestigationResponseSchema.safeParse(mockInvestigationResponse);
      expect(result.success).toBe(true);
    });

    it("ensures every individual finding parses against FindingSchema", () => {
      for (const finding of mockInvestigationResponse.findings) {
        const result = FindingSchema.safeParse(finding);
        expect(result.success).toBe(true);
      }
    });

    it("includes at least one instance of all 4 canonical finding states (DEVELOPMENT_ROADMAP acceptance gate)", () => {
      const states = new Set(mockInvestigationResponse.findings.map((f) => f.status));
      expect(states.has(FindingState.SUPPORTED_BY_RECORDS)).toBe(true);
      expect(states.has(FindingState.CONFLICTING_RECORDS)).toBe(true);
      expect(states.has(FindingState.NOT_FOUND_IN_PROVIDED_DATA)).toBe(true);
      expect(states.has(FindingState.UNRESOLVED)).toBe(true);
    });

    it("verifies all calculation structures adhere to expression, result, unit", () => {
      for (const finding of mockInvestigationResponse.findings) {
        if (finding.calculation) {
          expect(finding.calculation).toHaveProperty("expression");
          expect(typeof finding.calculation.result).toBe("number");
          expect(finding.calculation).toHaveProperty("unit");
        }
      }
    });

    it("contains valid source record IDs in source_record_ids", () => {
      for (const finding of mockInvestigationResponse.findings) {
        expect(Array.isArray(finding.source_record_ids)).toBe(true);
        expect(finding.source_record_ids.length).toBeGreaterThan(0);
      }
    });
  });

  describe("mock_ai_response.json Conformance", () => {
    it("parses cleanly against ClaimExtractionSchema", () => {
      const result = ClaimExtractionSchema.safeParse(mockAiResponse);
      expect(result.success).toBe(true);
    });

    it("correctly encodes field provenance and review flags", () => {
      const parsed = ClaimExtractionSchema.parse(mockAiResponse);
      expect(parsed.claimed_qty).toBe(20);
      expect(parsed.needs_human_review).toBe(true);
      expect(parsed.field_provenance.claimed_qty).toBe("derived");
      expect(parsed.field_provenance.unit).toBe("explicit");
    });
  });
});


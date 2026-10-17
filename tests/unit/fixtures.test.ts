import { describe, it, expect } from "vitest";
import {
  FindingState,
  FindingStateSchema,
  DisputeInputSchema,
  FindingSchema,
  BaseRecordSchema,
} from "@/types";

import case01 from "../fixtures/case_01_clean_delivery.json";
import case02 from "../fixtures/case_02_short_delivery.json";
import case03 from "../fixtures/case_03_ambiguous_shipment.json";
import case04 from "../fixtures/case_04_missing_receipt.json";
import mockResponse from "../fixtures/mock_investigation_response.json";

const allCases = [
  { id: "case_01", fixture: case01 },
  { id: "case_02", fixture: case02 },
  { id: "case_03", fixture: case03 },
  { id: "case_04", fixture: case04 },
];

describe("Canonical Synthetic Fixtures & Ground Truth Validation", () => {
  describe("Zod Schema Conformance across all synthetic cases", () => {
    it.each(allCases)("validates dispute object schema for $id", ({ fixture }) => {
      const result = DisputeInputSchema.safeParse(fixture.dispute);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dispute_id).toBeTruthy();
        expect(result.data.message).toBeTruthy();
      }
    });

    it.each(allCases)("validates all commercial records conform to BaseRecordSchema for $id", ({ fixture }) => {
      const recordGroups = Object.values(fixture.records) as Array<Array<{ record_id: string; date: string }>>;
      for (const group of recordGroups) {
        for (const record of group) {
          const result = BaseRecordSchema.safeParse(record);
          expect(result.success).toBe(true);
        }
      }
    });

    it.each(allCases)("validates expected_findings conform to FindingSchema for $id", ({ fixture }) => {
      expect(fixture.expected_findings.length).toBeGreaterThan(0);
      for (const finding of fixture.expected_findings) {
        const result = FindingSchema.safeParse(finding);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(FindingStateSchema.safeParse(result.data.status).success).toBe(true);
          expect(result.data.source_record_ids.length).toBeGreaterThan(0);
        }
      }
    });

    it("rejects invalid fixture structures", () => {
      const malformedDispute = {
        message: "No dispute ID provided",
      };
      expect(DisputeInputSchema.safeParse(malformedDispute).success).toBe(false);

      const malformedRecord = {
        record_id: "REC-999",
        date: "invalid-date-format",
      };
      expect(BaseRecordSchema.safeParse(malformedRecord).success).toBe(false);

      const invalidFinding = {
        finding_id: "FND-INVALID",
        statement: "Invented verdict",
        status: "FRAUD", // Prohibited state
        source_record_ids: ["REC-001"],
      };
      expect(FindingSchema.safeParse(invalidFinding).success).toBe(false);
    });
  });

  describe("Case 01 — Clean Delivery Agreement", () => {
    it("verifies matching quantities between invoice, dispatch, and signed receipt", () => {
      const inv = case01.records.invoices[0];
      const dspt = case01.records.dispatches[0];
      const pod = case01.records.receipts[0];

      expect(inv.invoiced_qty).toBe(100);
      expect(dspt.dispatched_qty).toBe(100);
      expect(pod.received_qty).toBe(100);
      expect(inv.unit).toBe(pod.unit);
      expect(pod.signed).toBe(true);
    });

    it("verifies that expected findings classify clean agreement as SUPPORTED_BY_RECORDS with zero discrepancy", () => {
      const finding = case01.expected_findings[0];
      expect(finding.status).toBe(FindingState.SUPPORTED_BY_RECORDS);
      expect(finding.calculation?.expression).toBe("100 - 100");
      expect(finding.calculation?.result).toBe(0);
      expect(finding.calculation?.unit).toBe("pcs");
    });
  });

  describe("Case 02 — Short Delivery Dispute", () => {
    it("verifies the intended 20-piece quantity discrepancy", () => {
      const inv = case02.records.invoices[0];
      const dspt = case02.records.dispatches[0];
      const pod = case02.records.receipts[0];

      const invoicedMinusReceived = inv.invoiced_qty - pod.received_qty;
      const dispatchedMinusReceived = dspt.dispatched_qty - pod.received_qty;

      expect(invoicedMinusReceived).toBe(20);
      expect(dispatchedMinusReceived).toBe(20);
      expect(inv.unit).toBe("pcs");
      expect(pod.unit).toBe("pcs");
    });

    it("verifies absence of credit notes and presence of CONFLICTING_RECORDS and NOT_FOUND_IN_PROVIDED_DATA findings", () => {
      expect(case02.records.credit_notes).toHaveLength(0);

      const conflictFinding = case02.expected_findings.find(
        (f) => f.status === FindingState.CONFLICTING_RECORDS
      );
      expect(conflictFinding).toBeDefined();
      expect(conflictFinding?.calculation?.expression).toBe("100 - 80");
      expect(conflictFinding?.calculation?.result).toBe(20);

      const missingCreditNoteFinding = case02.expected_findings.find(
        (f) => f.status === FindingState.NOT_FOUND_IN_PROVIDED_DATA
      );
      expect(missingCreditNoteFinding).toBeDefined();
      expect(missingCreditNoteFinding?.source_record_ids).toContain("INV-REC-002");
    });

    it("verifies calculated balance and indicative shortage value", () => {
      const { invoiced_minus_received, indicative_shortage_value, balance } = case02.expected_calculations;
      expect(invoiced_minus_received.result).toBe(20);
      expect(indicative_shortage_value.result).toBe(3000);
      expect(indicative_shortage_value.unit).toBe("INR");
      expect(balance.result).toBe(3000);
    });
  });

  describe("Case 03 — Ambiguous Shipment Candidates", () => {
    it("preserves multiple plausible shipment candidates without arbitrary selection", () => {
      expect(case03.records.dispatches.length).toBe(2);
      const shipmentIds = case03.records.dispatches.map((d) => d.shipment_id);
      expect(shipmentIds).toContain("SHP-2026-003A");
      expect(shipmentIds).toContain("SHP-2026-003B");

      // The dispute and receipt do not specify an explicit shipment ID
      expect(case03.dispute.shipment_id).toBeNull();
      expect(case03.records.receipts[0].shipment_id).toBeNull();
    });

    it("expects finding status UNRESOLVED due to multi-shipment ambiguity", () => {
      const finding = case03.expected_findings[0];
      expect(finding.status).toBe(FindingState.UNRESOLVED);
      expect(finding.source_record_ids).toContain("DSPT-REC-003A");
      expect(finding.source_record_ids).toContain("DSPT-REC-003B");
    });
  });

  describe("Case 04 — Missing Receipt Evidence", () => {
    it("confirms dispatch evidence exists but receipt evidence is completely absent", () => {
      expect(case04.records.dispatches.length).toBe(1);
      expect(case04.records.dispatches[0].dispatched_qty).toBe(100);
      expect(case04.records.receipts).toHaveLength(0);
    });

    it("expects finding status NOT_FOUND_IN_PROVIDED_DATA without fabricating receipt IDs", () => {
      const finding = case04.expected_findings[0];
      expect(finding.status).toBe(FindingState.NOT_FOUND_IN_PROVIDED_DATA);

      // Verify no nonexistent POD ID is cited
      for (const citedId of finding.source_record_ids) {
        expect(citedId.startsWith("POD-")).toBe(false);
      }
    });
  });

  describe("Mock Investigation Response (`mock_investigation_response.json`)", () => {
    it("matches the API response wire structure", () => {
      expect(mockResponse.investigation_id).toBeTruthy();
      expect(mockResponse.dispute_id).toBeTruthy();
      expect(["rules_only", "hybrid"]).toContain(mockResponse.processing_mode);
      expect(Array.isArray(mockResponse.findings)).toBe(true);
      expect(mockResponse.reconciliation).toBeDefined();
    });

    it("validates every finding against FindingSchema", () => {
      expect(mockResponse.findings.length).toBe(4);
      for (const finding of mockResponse.findings) {
        const result = FindingSchema.safeParse(finding);
        expect(result.success).toBe(true);
      }
    });

    it("contains at least one example of all four canonical finding states", () => {
      const statuses = mockResponse.findings.map((f) => f.status);
      expect(statuses).toContain(FindingState.SUPPORTED_BY_RECORDS);
      expect(statuses).toContain(FindingState.CONFLICTING_RECORDS);
      expect(statuses).toContain(FindingState.NOT_FOUND_IN_PROVIDED_DATA);
      expect(statuses).toContain(FindingState.UNRESOLVED);
    });

    it("verifies financial reconciliation summary values", () => {
      const { invoice_amount, payments_recorded, credits_recorded, balance_before_unapproved_credits, currency } =
        mockResponse.reconciliation;
      expect(invoice_amount).toBe(15000);
      expect(payments_recorded).toBe(12000);
      expect(credits_recorded).toBe(0);
      expect(balance_before_unapproved_credits).toBe(3000);
      expect(currency).toBe("INR");
    });
  });

  describe("Source Citation Integrity across all fixtures", () => {
    it("ensures every source_record_id cited in expected findings physically exists in the fixture's records", () => {
      for (const { id, fixture } of allCases) {
        const allRecordIds = new Set<string>();
        const recordGroups = Object.values(fixture.records) as Array<Array<{ record_id: string }>>;
        for (const group of recordGroups) {
          for (const record of group) {
            allRecordIds.add(record.record_id);
          }
        }

        for (const finding of fixture.expected_findings) {
          for (const citedId of finding.source_record_ids) {
            expect(
              allRecordIds.has(citedId),
              `Fixture ${id} finding ${finding.finding_id} cites non-existent record ID ${citedId}`
            ).toBe(true);
          }
        }
      }
    });

    it("ensures source citations in mock_investigation_response reference existing records from case_02 context", () => {
      const validCase02Ids = new Set([
        "PO-REC-002",
        "INV-REC-002",
        "DSPT-REC-002",
        "POD-REC-002",
        "PAY-REC-002",
      ]);

      for (const finding of mockResponse.findings) {
        for (const citedId of finding.source_record_ids) {
          expect(
            validCase02Ids.has(citedId),
            `Mock response finding ${finding.finding_id} cites non-existent record ID ${citedId}`
          ).toBe(true);
        }
      }
    });
  });
});


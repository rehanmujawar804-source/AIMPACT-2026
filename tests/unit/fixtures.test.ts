import { describe, it, expect } from "vitest";
import { FindingSchema, DisputeInputSchema, FindingState } from "@/types";
import mockResponse from "../fixtures/mock_investigation_response.json";

describe("Mock Investigation Response Fixture Conformance", () => {
  it("conforms to DisputeInputSchema for dispute metadata", () => {
    const disputeParse = DisputeInputSchema.safeParse(mockResponse.dispute);
    expect(disputeParse.success).toBe(true);
    if (disputeParse.success) {
      expect(disputeParse.data.dispute_id).toBe("DSP-2026-004");
      expect(disputeParse.data.invoice_id).toBe("INV-1048");
      expect(disputeParse.data.claimed_issue).toBe("short_delivery");
    }
  });

  it("validates every finding against the canonical FindingSchema", () => {
    expect(mockResponse.findings.length).toBeGreaterThan(0);

    for (const finding of mockResponse.findings) {
      const result = FindingSchema.safeParse(finding);
      expect(
        result.success,
        `Finding ${finding.finding_id} failed schema validation: ${
          result.success ? "" : JSON.stringify(result.error.issues)
        }`
      ).toBe(true);
    }
  });

  it("contains at least one instance of all four canonical finding states", () => {
    const states = new Set(mockResponse.findings.map((f) => f.status));
    expect(states.has(FindingState.SUPPORTED_BY_RECORDS)).toBe(true);
    expect(states.has(FindingState.CONFLICTING_RECORDS)).toBe(true);
    expect(states.has(FindingState.NOT_FOUND_IN_PROVIDED_DATA)).toBe(true);
    expect(states.has(FindingState.UNRESOLVED)).toBe(true);
  });

  it("maintains strict mathematical consistency in financial reconciliation", () => {
    const rec = mockResponse.reconciliation;
    // Invoiced quantity * unit price
    expect(rec.invoiced_quantity * rec.unit_price).toBe(rec.invoice_amount);
    // Discrepancy quantity: invoiced - accepted
    expect(rec.invoiced_quantity - rec.accepted_quantity).toBe(rec.disputed_quantity);
    // Balance calculation: invoice_amount - recorded_payments - approved_credits
    const expectedBalance = rec.invoice_amount - rec.recorded_payments - rec.approved_credits;
    expect(rec.recorded_balance).toBe(expectedBalance);
    // Unapproved requested credit must NOT be subtracted from recorded balance
    expect(rec.approved_credits).toBe(0);
    expect(rec.recorded_balance).toBe(18000);
  });

  it("ensures all cited source_record_ids resolve to defined records in the fixture", () => {
    const allRecordIds = new Set<string>();
    for (const inv of mockResponse.source_records.invoices) {
      allRecordIds.add(inv.record_id);
    }
    for (const del of mockResponse.source_records.deliveries) {
      allRecordIds.add(del.record_id);
    }
    for (const pay of mockResponse.source_records.payments) {
      allRecordIds.add(pay.record_id);
    }

    for (const finding of mockResponse.findings) {
      for (const sourceId of finding.source_record_ids) {
        expect(
          allRecordIds.has(sourceId),
          `Finding ${finding.finding_id} cites non-existent source ID '${sourceId}'`
        ).toBe(true);
      }
    }
  });
});

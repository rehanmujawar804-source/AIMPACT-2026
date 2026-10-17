import { describe, it, expect } from "vitest";
import { FindingSchema, DisputeInputSchema, FindingState } from "@/types";
import { DEMO_CASES, type DemoCaseId } from "@/features/investigations/lib/demoCases";

describe("Demonstration Cases Conformance (Milestone 2)", () => {
  const caseKeys = Object.keys(DEMO_CASES) as DemoCaseId[];

  it("provides exactly the three canonical benchmark cases", () => {
    expect(caseKeys).toEqual(["case_01", "case_02", "case_03"]);
  });

  caseKeys.forEach((key) => {
    describe(`Conformance for ${key} (${DEMO_CASES[key].name})`, () => {
      const demoCase = DEMO_CASES[key];

      it("validates dispute payload against DisputeInputSchema", () => {
        const result = DisputeInputSchema.safeParse(demoCase.dispute);
        expect(result.success, `Dispute in ${key} failed validation`).toBe(true);
      });

      it("validates every finding against FindingSchema", () => {
        expect(demoCase.findings.length).toBeGreaterThan(0);
        for (const finding of demoCase.findings) {
          const result = FindingSchema.safeParse(finding);
          expect(
            result.success,
            `Finding ${finding.finding_id} in ${key} failed schema: ${
              result.success ? "" : JSON.stringify(result.error.issues)
            }`
          ).toBe(true);
        }
      });

      it("maintains strict mathematical reconciliation consistency", () => {
        const rec = demoCase.reconciliation;
        // Invoiced quantity * unit price = invoice amount
        expect(rec.invoiced_quantity * rec.unit_price).toBe(rec.invoice_amount);
        // Balance = invoice_amount - recorded_payments - approved_credits
        const expectedBalance = rec.invoice_amount - rec.recorded_payments - rec.approved_credits;
        expect(rec.recorded_balance).toBe(expectedBalance);
      });

      it("verifies that all cited source_record_ids resolve to loaded records in that case", () => {
        const allRecordIds = new Set<string>();
        demoCase.source_records.invoices.forEach((r: { record_id: string }) => allRecordIds.add(String(r.record_id)));
        demoCase.source_records.deliveries.forEach((r: { record_id: string }) => allRecordIds.add(String(r.record_id)));
        demoCase.source_records.payments.forEach((r: { record_id: string }) => allRecordIds.add(String(r.record_id)));
        demoCase.source_records.credit_notes.forEach((r: { record_id: string }) => allRecordIds.add(String(r.record_id)));

        for (const finding of demoCase.findings) {
          for (const sourceId of finding.source_record_ids) {
            expect(
              allRecordIds.has(sourceId),
              `Finding ${finding.finding_id} in ${key} cites non-existent record '${sourceId}'`
            ).toBe(true);
          }
        }
      });
    });
  });

  describe("Scenario-Specific Verification", () => {
    it("verifies Case 1 (Short Delivery) preserves the unapproved credit non-deduction rule", () => {
      const c1 = DEMO_CASES.case_01;
      expect(c1.reconciliation.invoice_amount).toBe(48000);
      expect(c1.reconciliation.recorded_payments).toBe(30000);
      expect(c1.reconciliation.recorded_balance).toBe(18000);
      expect(c1.reconciliation.potential_credit_amount).toBe(4000);
      expect(c1.reconciliation.approved_credits).toBe(0);
      // Confirms at least one CONFLICTING_RECORDS finding exists
      expect(c1.findings.some((f) => f.status === FindingState.CONFLICTING_RECORDS)).toBe(true);
    });

    it("verifies Case 2 (Clean Agreement) contains zero discrepancies and zero balance", () => {
      const c2 = DEMO_CASES.case_02;
      expect(c2.reconciliation.invoice_amount).toBe(35000);
      expect(c2.reconciliation.recorded_payments).toBe(35000);
      expect(c2.reconciliation.recorded_balance).toBe(0);
      expect(c2.reconciliation.disputed_quantity).toBe(0);
      expect(c2.reconciliation.potential_credit_amount).toBe(0);
      // All findings must be SUPPORTED_BY_RECORDS
      expect(c2.findings.every((f) => f.status === FindingState.SUPPORTED_BY_RECORDS)).toBe(true);
    });

    it("verifies Case 3 (Missing POD) explicitly flags NOT_FOUND_IN_PROVIDED_DATA without fabricating receipt", () => {
      const c3 = DEMO_CASES.case_03;
      expect(c3.source_records.deliveries[0].record_id).toBe("DSP-310"); // Dispatch record, not POD
      expect(c3.reconciliation.accepted_quantity).toBe(0);
      expect(c3.findings.some((f) => f.status === FindingState.NOT_FOUND_IN_PROVIDED_DATA)).toBe(true);
      expect(c3.findings.some((f) => f.status === FindingState.UNRESOLVED)).toBe(true);
    });
  });
});

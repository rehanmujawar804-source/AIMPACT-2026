import { describe, it, expect } from "vitest";
import { FindingState } from "@/types";
import {
  compareInvoiceAndReceiptQuantities,
  compareDispatchAndReceiptQuantities,
  calculateInvoiceLineArithmetic,
  calculateIndicativeShortageValue,
  calculateFinancialReconciliation,
  calculateDeliveredGoodsReconciliation,
  validateUnitCompatibility,
} from "@/lib/rules/quantityComparison";
import { matchRecords } from "@/lib/rules/recordMatcher";
import { runDeterministicInvestigation } from "@/lib/evidence/findingBuilder";
import { ValidatedInvestigationInput } from "@/lib/rules/types";

import case01 from "../fixtures/case_01_clean_delivery.json";
import case02 from "../fixtures/case_02_short_delivery.json";
import case03 from "../fixtures/case_03_ambiguous_shipment.json";
import case04 from "../fixtures/case_04_missing_receipt.json";

describe("Deterministic Rules Engine Unit Tests", () => {
  describe("Scenario 1: Clean Delivery (case_01)", () => {
    it("verifies clean delivery agreement and produces SUPPORTED_BY_RECORDS", () => {
      const input = case01 as unknown as ValidatedInvestigationInput;
      const findings = runDeterministicInvestigation(input);

      expect(findings.length).toBeGreaterThan(0);
      const qtyFinding = findings.find((f) => f.finding_id.includes("QTY-MATCH"));
      expect(qtyFinding).toBeDefined();
      expect(qtyFinding?.status).toBe(FindingState.SUPPORTED_BY_RECORDS);
      expect(qtyFinding?.calculation?.result).toBe(0);
      expect(qtyFinding?.calculation?.expression).toBe("100 - 100");
      expect(qtyFinding?.calculation?.unit).toBe("pcs");
      expect(qtyFinding?.source_record_ids).toEqual(["INV-REC-001", "POD-REC-001"]);
    });
  });

  describe("Scenario 2: Short Delivery Discrepancy (case_02)", () => {
    it("computes exact 20 pcs discrepancy for invoice-to-receipt and dispatch-to-receipt", () => {
      const invComp = compareInvoiceAndReceiptQuantities(100, 80, "pcs", "pcs");
      expect(invComp.safe).toBe(true);
      expect(invComp.difference).toBe(20);
      expect(invComp.expression).toBe("100 - 80");

      const dsptComp = compareDispatchAndReceiptQuantities(100, 80, "pcs", "pcs");
      expect(dsptComp.safe).toBe(true);
      expect(dsptComp.difference).toBe(20);
      expect(dsptComp.expression).toBe("100 - 80");
    });

    it("produces CONFLICTING_RECORDS finding with exact citations", () => {
      const input = case02 as unknown as ValidatedInvestigationInput;
      const findings = runDeterministicInvestigation(input);

      const conflict = findings.find((f) => f.status === FindingState.CONFLICTING_RECORDS);
      expect(conflict).toBeDefined();
      expect(conflict?.calculation?.result).toBe(20);
      expect(conflict?.calculation?.expression).toBe("100 - 80");
      expect(conflict?.source_record_ids).toEqual(["INV-REC-002", "POD-REC-002"]);
    });
  });

  describe("Scenario 3: Indicative Shortage Value", () => {
    it("calculates indicative value (20 pcs × ₹150 = ₹3,000) labelled as indicative", () => {
      const res = calculateIndicativeShortageValue(20, 150, "INR");
      expect(res.valid).toBe(true);
      expect(res.value).toBe(3000);
      expect(res.expression).toBe("20 * 150");
      expect(res.isIndicative).toBe(true);
      expect(res.currency).toBe("INR");
    });
  });

  describe("Scenario 4: Financial Reconciliation", () => {
    it("calculates balance (₹15,000 invoice - ₹12,000 payments = ₹3,000)", () => {
      const reconciliation = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [],
        "INR"
      );
      expect(reconciliation.valid).toBe(true);
      expect(reconciliation.invoiceAmount).toBe(15000);
      expect(reconciliation.totalPayments).toBe(12000);
      expect(reconciliation.totalApprovedCredits).toBe(0);
      expect(reconciliation.balanceBeforeUnapprovedCredits).toBe(3000);
    });

    it("excludes pending or unapproved credit notes from balance deduction", () => {
      const reconciliation = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [
          { amount: 3000, currency: "INR", status: "pending" }, // pending: must NOT deduct
          { amount: 500, currency: "INR", status: "approved" }, // approved: should deduct
        ],
        "INR"
      );
      expect(reconciliation.totalApprovedCredits).toBe(500);
      expect(reconciliation.balanceBeforeUnapprovedCredits).toBe(2500); // 15000 - 12000 - 500
    });
  });

  describe("Scenario 5: Delivered-Goods Reconciliation (Documented Demo Data)", () => {
    it("correctly reconciles 120 invoiced @ ₹400, 110 accepted, ₹30,000 paid to ₹14,000 adjusted balance", () => {
      // Demo case specified in prompt:
      // 120 invoiced units at ₹400 = ₹48,000 original invoice total
      // 110 accepted units = ₹44,000 verified delivered value
      // ₹30,000 paid, no approved credits
      // Original invoice total: ₹48,000
      // Verified delivered value: ₹44,000
      // Original outstanding balance: ₹18,000 (48,000 - 30,000)
      // Adjusted delivered balance: ₹14,000 (44,000 - 30,000)
      const recon = calculateDeliveredGoodsReconciliation(
        120, // invoicedQty
        400, // unitPrice
        110, // acceptedQty
        [{ amount: 30000, currency: "INR" }], // payments
        [], // credit notes
        "INR"
      );

      expect(recon.valid).toBe(true);
      expect(recon.originalInvoiceTotal).toBe(48000);
      expect(recon.verifiedDeliveredValue).toBe(44000);
      expect(recon.shortageQuantity).toBe(10);
      expect(recon.shortageValue).toBe(4000);
      expect(recon.totalPayments).toBe(30000);
      expect(recon.totalApprovedCredits).toBe(0);
      expect(recon.originalOutstandingBalance).toBe(18000);
      expect(recon.adjustedDeliveredBalance).toBe(14000);
      expect(recon.currency).toBe("INR");
    });
  });

  describe("Scenario 6: Missing Credit Note (case_02)", () => {
    it("reports credit note absence as NOT_FOUND_IN_PROVIDED_DATA without asserting non-existence in reality", () => {
      const input = case02 as unknown as ValidatedInvestigationInput;
      const findings = runDeterministicInvestigation(input);

      const cnFinding = findings.find((f) => f.status === FindingState.NOT_FOUND_IN_PROVIDED_DATA);
      expect(cnFinding).toBeDefined();
      expect(cnFinding?.statement).toContain("No credit note found in supplied records");
      expect(cnFinding?.limitations[0]).toContain("does not prove an adjustment was never issued in physical reality");
      expect(cnFinding?.source_record_ids).toEqual(["INV-REC-002"]);
    });
  });

  describe("Scenario 7: Ambiguous Shipment (case_03)", () => {
    it("preserves multiple candidates and classifies relationship as UNRESOLVED", () => {
      const input = case03 as unknown as ValidatedInvestigationInput;
      const findings = runDeterministicInvestigation(input);

      expect(findings.length).toBe(1);
      const ambig = findings[0];
      expect(ambig.status).toBe(FindingState.UNRESOLVED);
      expect(ambig.statement).toContain("Multiple candidate shipments");
      expect(ambig.source_record_ids).toContain("DSPT-REC-003A");
      expect(ambig.source_record_ids).toContain("DSPT-REC-003B");
    });
  });

  describe("Scenario 8: Missing Receipt (case_04)", () => {
    it("reports missing receipt as NOT_FOUND_IN_PROVIDED_DATA without fabricating receipt IDs", () => {
      const input = case04 as unknown as ValidatedInvestigationInput;
      const findings = runDeterministicInvestigation(input);

      expect(findings.length).toBe(1);
      const missingPod = findings[0];
      expect(missingPod.status).toBe(FindingState.NOT_FOUND_IN_PROVIDED_DATA);
      expect(missingPod.statement).toContain("No signed receipt or proof of delivery found in the provided dataset");

      // Verify no phantom receipt IDs were cited
      for (const id of missingPod.source_record_ids) {
        expect(id.startsWith("POD-")).toBe(false);
      }
    });
  });

  describe("Scenario 9: Incompatible Units", () => {
    it("rejects comparison between pcs and boxes and produces UNRESOLVED finding", () => {
      expect(validateUnitCompatibility("pcs", "boxes")).toBe(false);
      expect(validateUnitCompatibility("pcs", "pcs")).toBe(true);

      const comp = compareInvoiceAndReceiptQuantities(100, 10, "pcs", "boxes");
      expect(comp.safe).toBe(false);
      expect(comp.error).toContain("Incompatible units");

      const input: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-UNIT-TEST",
          message: "Unit mismatch test",
          invoice_id: "INV-UNIT-1",
        },
        records: {
          purchase_orders: [],
          invoices: [
            {
              record_id: "INV-U-01",
              invoice_id: "INV-UNIT-1",
              item_id: "ITEM-A",
              invoiced_qty: 100,
              unit: "pcs",
              unit_price: 10,
              line_amount: 1000,
              currency: "INR",
              date: "2026-10-10",
            },
          ],
          dispatches: [],
          receipts: [
            {
              record_id: "POD-U-01",
              shipment_id: "SHP-U-01",
              invoice_id: "INV-UNIT-1",
              item_id: "ITEM-A",
              received_qty: 10,
              unit: "boxes",
              signed: true,
              receipt_date: "2026-10-11",
              date: "2026-10-11",
            },
          ],
          payments: [],
          credit_notes: [],
        },
      };

      const findings = runDeterministicInvestigation(input);
      const unitFinding = findings.find((f) => f.finding_id.includes("UNIT-MISMATCH"));
      expect(unitFinding).toBeDefined();
      expect(unitFinding?.status).toBe(FindingState.UNRESOLVED);
      expect(unitFinding?.statement).toContain("Incompatible units");
    });
  });

  describe("Scenario 10: Source Citation Integrity", () => {
    it("guarantees every cited source_record_id physically exists in input records", () => {
      const inputs = [case01, case02, case03, case04] as unknown as ValidatedInvestigationInput[];

      for (const input of inputs) {
        const availableIds = new Set<string>();
        for (const group of Object.values(input.records)) {
          if (Array.isArray(group)) {
            for (const rec of group) {
              if (rec && rec.record_id) availableIds.add(rec.record_id);
            }
          }
        }

        const findings = runDeterministicInvestigation(input);
        for (const finding of findings) {
          for (const citedId of finding.source_record_ids) {
            expect(
              availableIds.has(citedId),
              `Finding ${finding.finding_id} cited non-existent record ID ${citedId}`
            ).toBe(true);
          }
        }
      }
    });
  });

  describe("Scenario 11: Empty Collections and Missing Invoice", () => {
    it("handles empty record collections safely without crashing", () => {
      const emptyInput: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-EMPTY",
          message: "No records supplied",
          invoice_id: "INV-MISSING",
        },
        records: {
          purchase_orders: [],
          invoices: [],
          dispatches: [],
          receipts: [],
          payments: [],
          credit_notes: [],
        },
      };

      const findings = runDeterministicInvestigation(emptyInput);
      expect(findings.length).toBe(1);
      expect(findings[0].status).toBe(FindingState.NOT_FOUND_IN_PROVIDED_DATA);
      expect(findings[0].statement).toContain("Invoice 'INV-MISSING' was not found in the provided dataset.");
      expect(findings[0].source_record_ids).toHaveLength(0);
    });
  });

  describe("Scenario 12: Determinism & Idempotency", () => {
    it("produces identical logical findings across repeated executions with the same input", () => {
      const input = case02 as unknown as ValidatedInvestigationInput;
      const run1 = runDeterministicInvestigation(input);
      const run2 = runDeterministicInvestigation(input);
      const run3 = runDeterministicInvestigation(input);

      expect(run1).toEqual(run2);
      expect(run2).toEqual(run3);
    });
  });

  describe("Scenario 13: Finding State Correctness", () => {
    it("ensures every finding uses an approved canonical state", () => {
      const validStates = new Set([
        FindingState.SUPPORTED_BY_RECORDS,
        FindingState.CONFLICTING_RECORDS,
        FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        FindingState.UNRESOLVED,
      ]);

      const inputs = [case01, case02, case03, case04] as unknown as ValidatedInvestigationInput[];
      for (const input of inputs) {
        const findings = runDeterministicInvestigation(input);
        for (const f of findings) {
          expect(validStates.has(f.status)).toBe(true);
        }
      }
    });
  });

  describe("Scenario 14: No Intent Inference / Absence ≠ Reality (Safeguards)", () => {
    it("verifies findings do not accuse any party of fraud, theft, guilt, or deliberate misconduct", () => {
      const prohibitedWords = ["fraud", "guilty", "theft", "illegal", "stole", "deliberate", "cheating"];
      const inputs = [case01, case02, case03, case04] as unknown as ValidatedInvestigationInput[];

      for (const input of inputs) {
        const findings = runDeterministicInvestigation(input);
        for (const f of findings) {
          const text = `${f.statement} ${f.assumptions.join(" ")} ${f.limitations.join(" ")} ${f.next_step || ""}`.toLowerCase();
          for (const word of prohibitedWords) {
            expect(
              text.includes(word),
              `Finding ${f.finding_id} improperly uses prohibited word '${word}'`
            ).toBe(false);
          }
        }
      }
    });

    it("verifies invoice line arithmetic discrepancy is detected deterministically without accusing fraud", () => {
      const arithRes = calculateInvoiceLineArithmetic(100, 150, 14000, "INR");
      expect(arithRes.valid).toBe(true);
      expect(arithRes.matches).toBe(false);
      expect(arithRes.difference).toBe(1000);
      expect(arithRes.expectedAmount).toBe(15000);
    });
  });

  describe("Scenario 15: Over-Delivery Handling", () => {
    it("computes negative quantity difference for over-delivery without clamping to zero", () => {
      const comp = compareInvoiceAndReceiptQuantities(80, 100, "pcs", "pcs");
      expect(comp.safe).toBe(true);
      expect(comp.difference).toBe(-20);
      expect(comp.expression).toBe("80 - 100");
      expect(comp.unit).toBe("pcs");
    });

    it("produces CONFLICTING_RECORDS finding with FND-QTY-OVER and exact citations", () => {
      const input: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-OVER-001",
          message: "Received 100 pcs against invoice of 80 pcs.",
          invoice_id: "INV-OVER-1",
        },
        records: {
          purchase_orders: [],
          invoices: [
            {
              record_id: "INV-REC-OVER",
              invoice_id: "INV-OVER-1",
              item_id: "ITEM-OVER",
              invoiced_qty: 80,
              unit: "pcs",
              unit_price: 150,
              line_amount: 12000,
              currency: "INR",
              date: "2026-10-10",
            },
          ],
          dispatches: [
            {
              record_id: "DSPT-REC-OVER",
              shipment_id: "SHP-OVER-1",
              invoice_id: "INV-OVER-1",
              item_id: "ITEM-OVER",
              dispatched_qty: 100,
              unit: "pcs",
              dispatch_date: "2026-10-11",
              date: "2026-10-11",
            },
          ],
          receipts: [
            {
              record_id: "POD-REC-OVER",
              shipment_id: "SHP-OVER-1",
              invoice_id: "INV-OVER-1",
              item_id: "ITEM-OVER",
              received_qty: 100,
              unit: "pcs",
              signed: true,
              receipt_date: "2026-10-12",
              date: "2026-10-12",
            },
          ],
          payments: [],
          credit_notes: [],
        },
      };

      const findings = runDeterministicInvestigation(input);
      const overFinding = findings.find((f) => f.finding_id.includes("QTY-OVER"));
      expect(overFinding).toBeDefined();
      expect(overFinding?.status).toBe(FindingState.CONFLICTING_RECORDS);
      expect(overFinding?.statement).toContain("exceeding invoiced quantity of 80 pcs by 20 pcs");
      expect(overFinding?.calculation?.result).toBe(-20);
      expect(overFinding?.calculation?.expression).toBe("80 - 100");
      expect(overFinding?.calculation?.unit).toBe("pcs");
      expect(overFinding?.source_record_ids).toEqual(["INV-REC-OVER", "POD-REC-OVER"]);
    });
  });

  describe("Scenario 16: Positive Credit Note Reconciliation on Short Delivery", () => {
    it("detects approved credit note and produces SUPPORTED_BY_RECORDS finding with citations", () => {
      const input: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-SHORT-CN",
          message: "Short delivery of 20 units with credit note issued.",
          invoice_id: "INV-CN-001",
        },
        records: {
          purchase_orders: [],
          invoices: [
            {
              record_id: "INV-REC-CN",
              invoice_id: "INV-CN-001",
              item_id: "ITEM-CN",
              invoiced_qty: 100,
              unit: "pcs",
              unit_price: 150,
              line_amount: 15000,
              currency: "INR",
              date: "2026-10-10",
            },
          ],
          dispatches: [
            {
              record_id: "DSPT-REC-CN",
              shipment_id: "SHP-CN-001",
              invoice_id: "INV-CN-001",
              item_id: "ITEM-CN",
              dispatched_qty: 100,
              unit: "pcs",
              dispatch_date: "2026-10-11",
              date: "2026-10-11",
            },
          ],
          receipts: [
            {
              record_id: "POD-REC-CN",
              shipment_id: "SHP-CN-001",
              invoice_id: "INV-CN-001",
              item_id: "ITEM-CN",
              received_qty: 80,
              unit: "pcs",
              signed: true,
              receipt_date: "2026-10-12",
              date: "2026-10-12",
            },
          ],
          payments: [
            {
              record_id: "PAY-REC-CN",
              invoice_id: "INV-CN-001",
              amount: 12000,
              currency: "INR",
              payment_date: "2026-10-15",
              date: "2026-10-15",
            },
          ],
          credit_notes: [
            {
              record_id: "CN-REC-001",
              invoice_id: "INV-CN-001",
              amount: 3000,
              currency: "INR",
              date: "2026-10-14",
              reason: "Short delivery of 20 pcs @ ₹150",
            },
          ],
        },
      };

      const findings = runDeterministicInvestigation(input);

      // Verify short delivery finding
      const shortFinding = findings.find((f) => f.finding_id.includes("QTY-SHORT"));
      expect(shortFinding).toBeDefined();
      expect(shortFinding?.status).toBe(FindingState.CONFLICTING_RECORDS);
      expect(shortFinding?.calculation?.result).toBe(20);

      // Verify positive credit note finding
      const cnFinding = findings.find((f) => f.finding_id.includes("CN-FOUND"));
      expect(cnFinding).toBeDefined();
      expect(cnFinding?.status).toBe(FindingState.SUPPORTED_BY_RECORDS);
      expect(cnFinding?.statement).toContain("Credit notes totaling 3000 INR are recorded against invoice INV-CN-001");
      expect(cnFinding?.calculation?.result).toBe(3000);
      expect(cnFinding?.calculation?.unit).toBe("INR");
      expect(cnFinding?.source_record_ids).toEqual(["INV-REC-CN", "CN-REC-001"]);
    });

    it("reconciles financial balance to zero when approved credit note covers the remaining balance", () => {
      const result = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [{ amount: 3000, currency: "INR", status: "approved" }],
        "INR"
      );
      expect(result.valid).toBe(true);
      expect(result.invoiceAmount).toBe(15000);
      expect(result.totalPayments).toBe(12000);
      expect(result.totalApprovedCredits).toBe(3000);
      expect(result.balanceBeforeUnapprovedCredits).toBe(0);
      expect(result.currency).toBe("INR");
    });
  });

  describe("Scenario 17: Currency Correctness & Compatibility Validation", () => {
    it("rejects reconciliation when payment currency does not match invoice currency", () => {
      const result = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "USD" }],
        [],
        "INR"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Currency mismatch: payment currency 'USD' does not match expected invoice currency 'INR'.");
      expect(result.totalPayments).toBe(0);
    });

    it("rejects reconciliation when credit note currency does not match invoice currency", () => {
      const result = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [{ amount: 3000, currency: "EUR", status: "approved" }],
        "INR"
      );
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Currency mismatch: credit note currency 'EUR' does not match expected invoice currency 'INR'.");
      expect(result.totalApprovedCredits).toBe(0);
    });

    it("rejects reconciliation on invalid or missing currency inputs", () => {
      const emptyExpected = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [],
        ""
      );
      expect(emptyExpected.valid).toBe(false);
      expect(emptyExpected.error).toContain("Invalid or missing expected currency.");

      const missingPayCur = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "   " }],
        [],
        "INR"
      );
      expect(missingPayCur.valid).toBe(false);
      expect(missingPayCur.error).toContain("Invalid or missing payment currency.");

      const missingCnCur = calculateFinancialReconciliation(
        15000,
        [{ amount: 12000, currency: "INR" }],
        [{ amount: 3000, currency: "", status: "approved" }],
        "INR"
      );
      expect(missingCnCur.valid).toBe(false);
      expect(missingCnCur.error).toContain("Invalid or missing credit note currency.");
    });
  });

  describe("Scenario 18: Duplicate Record IDs Detection (Rule 1)", () => {
    it("detects duplicate record_ids across input records and produces CONFLICTING_RECORDS finding", () => {
      const input: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-DUP-TEST",
          message: "Testing duplicate record ID detection.",
          invoice_id: "INV-DUP-1",
        },
        records: {
          purchase_orders: [],
          invoices: [
            {
              record_id: "INV-REC-DUP",
              invoice_id: "INV-DUP-1",
              item_id: "ITEM-A",
              invoiced_qty: 100,
              unit: "pcs",
              unit_price: 100,
              line_amount: 10000,
              currency: "INR",
              date: "2026-10-01",
            },
            {
              record_id: "INV-REC-DUP", // DUPLICATE ID
              invoice_id: "INV-DUP-2",
              item_id: "ITEM-B",
              invoiced_qty: 50,
              unit: "pcs",
              unit_price: 100,
              line_amount: 5000,
              currency: "INR",
              date: "2026-10-02",
            },
          ],
          dispatches: [],
          receipts: [],
          payments: [],
          credit_notes: [],
        },
      };

      const findings = runDeterministicInvestigation(input);
      expect(findings).toHaveLength(1);
      expect(findings[0].finding_id).toBe("FND-DUP-RECORDS");
      expect(findings[0].status).toBe(FindingState.CONFLICTING_RECORDS);
      expect(findings[0].statement).toContain("Duplicate record IDs (INV-REC-DUP) detected");
      expect(findings[0].source_record_ids).toEqual(["INV-REC-DUP"]);
    });
  });

  describe("Scenario 19: Duplicate Invoices with Same invoice_id (Rule 11)", () => {
    it("emits UNRESOLVED finding when multiple distinct records share the same invoice_id", () => {
      const input: ValidatedInvestigationInput = {
        dispute: {
          dispute_id: "DSP-DUP-INV",
          message: "Dispute referencing invoice with duplicate business ID in dataset.",
          invoice_id: "INV-DUP-999",
        },
        records: {
          purchase_orders: [],
          invoices: [
            {
              record_id: "INV-REC-DUP-A",
              invoice_id: "INV-DUP-999",
              item_id: "ITEM-DUP",
              invoiced_qty: 100,
              unit: "pcs",
              unit_price: 100,
              line_amount: 10000,
              currency: "INR",
              date: "2026-10-01",
            },
            {
              record_id: "INV-REC-DUP-B",
              invoice_id: "INV-DUP-999",
              item_id: "ITEM-DUP",
              invoiced_qty: 120,
              unit: "pcs",
              unit_price: 100,
              line_amount: 12000,
              currency: "INR",
              date: "2026-10-05",
            },
          ],
          dispatches: [],
          receipts: [],
          payments: [],
          credit_notes: [],
        },
      };

      const match = matchRecords(input.dispute, input.records);
      expect(match.status).toBe("AMBIGUOUS_MATCH");
      expect(match.invoice).toBeUndefined();
      expect(match.candidateInvoices).toHaveLength(2);

      const findings = runDeterministicInvestigation(input);
      expect(findings).toHaveLength(1);
      const ambigFinding = findings[0];
      expect(ambigFinding.status).toBe(FindingState.UNRESOLVED);
      expect(ambigFinding.statement).toContain("Multiple candidate invoices (INV-REC-DUP-A, INV-REC-DUP-B) share invoice_id 'INV-DUP-999'");
      expect(ambigFinding.source_record_ids).toEqual(["INV-REC-DUP-A", "INV-REC-DUP-B"]);
    });
  });
});


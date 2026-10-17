/**
 * ProofTrail — Synthetic Case Registry
 * Catalog of verified synthetic dispute cases adhering strictly to:
 * - docs/design.md (Section 4 & 7)
 * - docs/06_SYNTHETIC_TEST_CASES.md
 * - Canonical JSON fixtures in tests/fixtures/
 */

import { type DisputeInput, type Finding } from "@/types";
import case01Fixture from "../../../../tests/fixtures/case_01_clean_delivery.json";
import case02Fixture from "../../../../tests/fixtures/case_02_short_delivery.json";
import case03Fixture from "../../../../tests/fixtures/case_03_ambiguous_shipment.json";
import case04Fixture from "../../../../tests/fixtures/case_04_missing_receipt.json";

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  recordRef?: string;
  amountOrQty?: string;
  description: string;
}

export interface CaseData {
  caseId: string;
  invoiceId: string;
  buyerName: string;
  disputeType: string;
  recordedBalance: number;
  status: "Needs human review" | "Investigated" | "Ready for review" | "Clean agreement";
  updatedDate: string;
  dispute: DisputeInput;
  reconciliation: {
    invoice_id: string;
    buyer_name: string;
    currency: string;
    invoice_amount: number;
    recorded_payments: number;
    approved_credits: number;
    recorded_balance: number;
    unit_price?: number;
    invoiced_quantity?: number;
    accepted_quantity?: number;
    disputed_quantity?: number;
    potential_credit_amount?: number;
    note?: string;
  };
  findings: Finding[];
  sourceRecords: {
    invoices?: Array<Record<string, unknown>>;
    deliveries?: Array<Record<string, unknown>>;
    payments?: Array<Record<string, unknown>>;
    credit_notes?: Array<Record<string, unknown>>;
    purchase_orders?: Array<Record<string, unknown>>;
    dispatches?: Array<Record<string, unknown>>;
  };
  timeline: TimelineEvent[];
}

export const SYNTHETIC_CASES: CaseData[] = [
  // Case 1: Hero Demo Case (INV-1048 - Aarav Industrial Supplies)
  {
    caseId: "PT-2026-004",
    invoiceId: "INV-1048",
    buyerName: "Aarav Industrial Supplies",
    disputeType: "Short delivery (10 units)",
    recordedBalance: 18000,
    status: "Needs human review",
    updatedDate: "2026-10-17",
    dispute: {
      dispute_id: "DSP-2026-004",
      message: "We received only 110 of the 120 units invoiced on INV-1048. Please issue a credit note for 10 units (₹4,000.00).",
      claimed_issue: "short_delivery",
      invoice_id: "INV-1048",
      shipment_id: "DEL-209",
    },
    reconciliation: {
      invoice_id: "INV-1048",
      buyer_name: "Aarav Industrial Supplies",
      currency: "INR",
      invoice_amount: 48000,
      recorded_payments: 30000,
      approved_credits: 0,
      recorded_balance: 18000,
      unit_price: 400,
      invoiced_quantity: 120,
      accepted_quantity: 110,
      disputed_quantity: 10,
      potential_credit_amount: 4000,
      note: "Potential credit of ₹4,000 for 10 units shortage is NOT deducted from recorded balance until credit note is issued.",
    },
    findings: [
      {
        finding_id: "FND-1048-01",
        claim_id: "CLM-1048-01",
        statement: "Invoice lists 120 units @ ₹400 billed totaling ₹48,000.00; line-item arithmetic verified.",
        status: "SUPPORTED_BY_RECORDS",
        source_record_ids: ["INV-1048", "ORD-1048"],
        calculation: {
          expression: "120 * 400",
          result: 48000,
          unit: "INR",
        },
        assumptions: ["Standard pricing matched against Purchase Order ORD-1048."],
        limitations: [],
        next_step: null,
      },
      {
        finding_id: "FND-1048-02",
        claim_id: "CLM-1048-02",
        statement: "Signed Proof of Delivery DEL-209 indicates 110 units accepted vs 120 units billed. A 10-unit discrepancy exists.",
        status: "CONFLICTING_RECORDS",
        source_record_ids: ["DEL-209", "INV-1048"],
        calculation: {
          expression: "(120 - 110) * 400",
          result: 4000,
          unit: "INR",
        },
        assumptions: ["Shortage occurred prior to or at time of warehouse dock receipt."],
        limitations: ["Receiving note notes carton damage on outer packaging."],
        next_step: "Review the delivery acceptance record with the responsible warehouse dock operator.",
      },
      {
        finding_id: "FND-1048-03",
        claim_id: "CLM-1048-03",
        statement: "No approved or issued credit note found in supplied dataset for the ₹4,000.00 shortage.",
        status: "NOT_FOUND_IN_PROVIDED_DATA",
        source_record_ids: ["INV-1048"],
        calculation: {
          expression: "10 * 400",
          result: 4000,
          unit: "INR",
        },
        assumptions: [],
        limitations: ["Absence in supplied ERP batch does not prove credit note was never drafted externally."],
        next_step: "Check for an authorised credit note before adjusting the recorded balance.",
      },
      {
        finding_id: "FND-1048-04",
        claim_id: "CLM-1048-04",
        statement: "Recorded NEFT payment of ₹30,000.00 leaves ₹18,000.00 balance; ₹4,000 credit remains pending authorization.",
        status: "UNRESOLVED",
        source_record_ids: ["INV-1048", "PAY-771"],
        calculation: {
          expression: "48000 - 30000",
          result: 18000,
          unit: "INR",
        },
        assumptions: ["Payment PAY-771 explicitly cited invoice reference INV-1048."],
        limitations: ["Unapproved credits cannot reduce the legal recorded balance."],
        next_step: "Confirm whether the 10-unit difference was short delivery, damage, or a later adjustment.",
      },
    ],
    sourceRecords: {
      invoices: [
        {
          record_id: "INV-1048",
          invoice_id: "INV-1048",
          po_id: "ORD-1048",
          buyer_id: "AARAV-IND",
          date: "2026-10-13",
          total_amount: 48000,
          line_amount: 48000,
          currency: "INR",
          invoiced_qty: 120,
          unit_price: 400,
          description: "Precision Steel Bearings (120 units @ ₹400)",
        },
      ],
      deliveries: [
        {
          record_id: "DEL-209",
          delivery_id: "DEL-209",
          shipment_id: "SHP-1048",
          date: "2026-10-14",
          invoiced_quantity: 120,
          received_quantity: 110,
          accepted_quantity: 110,
          discrepancy_quantity: 10,
          status: "Accepted with shortage notation",
        },
      ],
      payments: [
        {
          record_id: "PAY-771",
          payment_id: "PAY-771",
          invoice_id: "INV-1048",
          date: "2026-10-16",
          amount: 30000,
          currency: "INR",
          reference: "NEFT-UTR-SBIN-88912-AARAV",
        },
      ],
      purchase_orders: [
        {
          record_id: "ORD-1048",
          po_id: "ORD-1048",
          buyer_name: "Aarav Industrial Supplies",
          date: "2026-10-12",
          ordered_qty: 120,
          unit_price: 400,
          currency: "INR",
        },
      ],
      credit_notes: [],
    },
    timeline: [
      {
        id: "evt-1",
        title: "Purchase Order Placed",
        date: "2026-10-12",
        recordRef: "ORD-1048",
        amountOrQty: "120 units @ ₹400",
        description: "Standard commercial contract for precision steel bearings.",
      },
      {
        id: "evt-2",
        title: "Commercial Tax Invoice Issued",
        date: "2026-10-13",
        recordRef: "INV-1048",
        amountOrQty: "₹48,000.00",
        description: "Invoiced 120 units at unit price of ₹400.00.",
      },
      {
        id: "evt-3",
        title: "Delivery Consignment Received",
        date: "2026-10-14",
        recordRef: "DEL-209",
        amountOrQty: "110 of 120 units",
        description: "Receiving dock accepted 110 units; 10 units discrepancy marked.",
      },
      {
        id: "evt-4",
        title: "Part Payment Credited",
        date: "2026-10-16",
        recordRef: "PAY-771",
        amountOrQty: "₹30,000.00",
        description: "NEFT bank transfer confirmed under UTR-SBIN-88912-AARAV.",
      },
      {
        id: "evt-5",
        title: "Buyer Short-Delivery Claim Received",
        date: "2026-10-17",
        recordRef: "DSP-2026-004",
        amountOrQty: "-10 units requested",
        description: "Buyer requested ₹4,000 credit note for missing 10 units.",
      },
    ],
  },

  // Case 2: Standard Discrepancy (INV-002 - Kaveri Components)
  {
    caseId: "PT-2026-003",
    invoiceId: "INV-002",
    buyerName: "Kaveri Components Pvt Ltd",
    disputeType: "Short delivery (20 pcs)",
    recordedBalance: 3000,
    status: "Needs human review",
    updatedDate: "2026-10-16",
    dispute: case02Fixture.dispute as DisputeInput,
    reconciliation: {
      invoice_id: "INV-002",
      buyer_name: "Kaveri Components Pvt Ltd",
      currency: "INR",
      invoice_amount: 15000,
      recorded_payments: 12000,
      approved_credits: 0,
      recorded_balance: 3000,
      unit_price: 150,
      invoiced_quantity: 100,
      accepted_quantity: 80,
      disputed_quantity: 20,
      potential_credit_amount: 3000,
      note: "Balance before unapproved credit notes.",
    },
    findings: case02Fixture.expected_results.expected_findings as Finding[],
    sourceRecords: {
      invoices: case02Fixture.records.invoices,
      deliveries: case02Fixture.records.receipts,
      payments: case02Fixture.records.payments,
      credit_notes: case02Fixture.records.credit_notes,
      purchase_orders: case02Fixture.records.purchase_orders,
      dispatches: case02Fixture.records.dispatches,
    },
    timeline: [
      {
        id: "evt-201",
        title: "PO Created",
        date: "2026-10-01",
        recordRef: "PO-REC-002",
        amountOrQty: "100 pcs @ ₹150",
        description: "Standard purchase order.",
      },
      {
        id: "evt-202",
        title: "Invoice Billed",
        date: "2026-10-05",
        recordRef: "INV-REC-002",
        amountOrQty: "₹15,000.00",
        description: "Invoiced 100 pcs.",
      },
      {
        id: "evt-203",
        title: "Signed Receipt Endorsed",
        date: "2026-10-08",
        recordRef: "POD-REC-002",
        amountOrQty: "80 pcs accepted",
        description: "Signed delivery note indicates 80 pcs received.",
      },
      {
        id: "evt-204",
        title: "Payment Credited",
        date: "2026-10-15",
        recordRef: "PAY-REC-002",
        amountOrQty: "₹12,000.00",
        description: "Payment leaves ₹3,000 deduction unverified.",
      },
    ],
  },

  // Case 3: Clean Agreement (INV-001 - Zenith Manufacturing)
  {
    caseId: "PT-2026-001",
    invoiceId: "INV-001",
    buyerName: "Zenith Manufacturing Ltd",
    disputeType: "Clean delivery verification",
    recordedBalance: 0,
    status: "Clean agreement",
    updatedDate: "2026-10-15",
    dispute: case01Fixture.dispute as DisputeInput,
    reconciliation: {
      invoice_id: "INV-001",
      buyer_name: "Zenith Manufacturing Ltd",
      currency: "INR",
      invoice_amount: 15000,
      recorded_payments: 15000,
      approved_credits: 0,
      recorded_balance: 0,
      unit_price: 150,
      invoiced_quantity: 100,
      accepted_quantity: 100,
      disputed_quantity: 0,
      potential_credit_amount: 0,
      note: "Full agreement; zero outstanding balance.",
    },
    findings: case01Fixture.expected_results.expected_findings as Finding[],
    sourceRecords: {
      invoices: case01Fixture.records.invoices,
      deliveries: case01Fixture.records.receipts,
      payments: case01Fixture.records.payments,
      credit_notes: case01Fixture.records.credit_notes,
      purchase_orders: case01Fixture.records.purchase_orders,
      dispatches: case01Fixture.records.dispatches,
    },
    timeline: [
      {
        id: "evt-101",
        title: "Order Issued",
        date: "2026-10-01",
        recordRef: "PO-REC-001",
        amountOrQty: "100 pcs",
        description: "Purchase order terms agreed.",
      },
      {
        id: "evt-102",
        title: "Invoice Generated",
        date: "2026-10-05",
        recordRef: "INV-REC-001",
        amountOrQty: "₹15,000.00",
        description: "100 pcs invoiced.",
      },
      {
        id: "evt-103",
        title: "Proof of Delivery Signed",
        date: "2026-10-08",
        recordRef: "POD-REC-001",
        amountOrQty: "100 pcs accepted",
        description: "Full consignment accepted with zero shortage.",
      },
      {
        id: "evt-104",
        title: "Payment Received",
        date: "2026-10-15",
        recordRef: "PAY-REC-001",
        amountOrQty: "₹15,000.00",
        description: "Full invoice balance cleared.",
      },
    ],
  },

  // Case 4: Ambiguous Match (INV-003 - Northstar Engineering)
  {
    caseId: "PT-2026-002",
    invoiceId: "INV-003",
    buyerName: "Northstar Engineering Works",
    disputeType: "Ambiguous shipment link",
    recordedBalance: 5400,
    status: "Needs human review",
    updatedDate: "2026-10-14",
    dispute: case03Fixture.dispute as DisputeInput,
    reconciliation: {
      invoice_id: "INV-003",
      buyer_name: "Northstar Engineering Works",
      currency: "INR",
      invoice_amount: 18000,
      recorded_payments: 12600,
      approved_credits: 0,
      recorded_balance: 5400,
      unit_price: 180,
      invoiced_quantity: 100,
      accepted_quantity: 70,
      disputed_quantity: 30,
      potential_credit_amount: 5400,
      note: "Multiple receipts detected with contradictory quantities.",
    },
    findings: case03Fixture.expected_results.expected_findings as Finding[],
    sourceRecords: {
      invoices: case03Fixture.records.invoices,
      deliveries: case03Fixture.records.receipts,
      payments: case03Fixture.records.payments,
      credit_notes: case03Fixture.records.credit_notes,
      purchase_orders: case03Fixture.records.purchase_orders,
      dispatches: case03Fixture.records.dispatches,
    },
    timeline: [
      {
        id: "evt-301",
        title: "PO Recorded",
        date: "2026-10-02",
        recordRef: "PO-REC-003",
        amountOrQty: "100 pcs",
        description: "Initial purchase order.",
      },
      {
        id: "evt-302",
        title: "Invoice Billed",
        date: "2026-10-06",
        recordRef: "INV-REC-003",
        amountOrQty: "₹18,000.00",
        description: "100 pcs invoiced at ₹180.",
      },
      {
        id: "evt-303",
        title: "Split Receipts Received",
        date: "2026-10-10",
        recordRef: "POD-REC-003A / 003B",
        amountOrQty: "Ambiguous",
        description: "Multiple receipts with conflicting totals require operator review.",
      },
    ],
  },
];

export function getCaseById(caseIdOrInvoiceId: string): CaseData | undefined {
  return SYNTHETIC_CASES.find(
    (c) =>
      c.caseId.toLowerCase() === caseIdOrInvoiceId.toLowerCase() ||
      c.invoiceId.toLowerCase() === caseIdOrInvoiceId.toLowerCase()
  );
}

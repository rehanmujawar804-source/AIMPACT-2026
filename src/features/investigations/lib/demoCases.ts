/**
 * ProofTrail — Canonical Demonstration Cases
 * Source of truth: docs/DEVELOPMENT_ROADMAP.md, docs/06_SYNTHETIC_TEST_CASES.md, docs/08_DEMO_AND_JUDGE_DEFENSE.md
 *
 * Defines the three canonical benchmark dispute cases for live demo and evaluation:
 * 1. case_01: Short Delivery (INV-1048 · Invoiced 120 vs Accepted 110 · Disputed credit ₹4,000 NOT DEDUCTED)
 * 2. case_02: Clean Agreement (INV-1039 · Invoiced 100 = Accepted 100 · Full payment ₹35,000 · Zero balance)
 * 3. case_03: Missing POD (INV-1031 · Dispatched 50 · Signed POD absent from provided records · ₹25,000 balance)
 *
 * All findings and disputes strictly adhere to FindingSchema and DisputeInputSchema in src/types/index.ts.
 */

import { FindingState, type DisputeInput, type Finding } from "@/types";

export type DemoCaseId = "case_01" | "case_02" | "case_03";

export interface CommercialInvoiceRecord {
  record_id: string;
  date: string;
  total_amount: number;
  invoice_id?: string;
  buyer_name?: string;
  currency?: string;
  quantity?: number;
  unit_price?: number;
  payment_terms?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CommercialDeliveryRecord {
  record_id: string;
  delivery_id?: string;
  shipment_id?: string;
  date: string;
  carrier?: string;
  shipped_quantity?: number;
  accepted_quantity: number;
  damaged_quantity?: number;
  short_quantity?: number;
  received_by?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CommercialPaymentRecord {
  record_id: string;
  payment_id?: string;
  date: string;
  amount: number;
  reference?: string;
  utr?: string;
  status?: string;
  [key: string]: unknown;
}

export interface CommercialCreditNoteRecord {
  record_id: string;
  credit_note_id?: string;
  date: string;
  amount: number;
  reason?: string;
  [key: string]: unknown;
}

export interface DemoCaseData {
  id: DemoCaseId;
  name: string;
  badgeLabel: string;
  invoice_id: string;
  buyer_name: string;
  investigation_id: string;
  statusBadge: {
    label: string;
    variant: "warning" | "success" | "danger" | "neutral";
    bgClass: string;
    textClass: string;
    borderClass: string;
    dotClass: string;
  };
  dispute: DisputeInput;
  reconciliation: {
    invoice_id: string;
    buyer_name: string;
    currency: string;
    invoice_amount: number;
    recorded_payments: number;
    approved_credits: number;
    recorded_balance: number;
    unit_price: number;
    invoiced_quantity: number;
    accepted_quantity: number;
    disputed_quantity: number;
    potential_credit_amount: number;
    note: string;
  };
  findings: Finding[];
  source_records: {
    invoices: CommercialInvoiceRecord[];
    deliveries: CommercialDeliveryRecord[];
    payments: CommercialPaymentRecord[];
    credit_notes: CommercialCreditNoteRecord[];
  };
  processing_mode: "hybrid" | "rules_only";
  metadata: {
    dispute_type: string;
    scenario: string;
  };
}

export const DEMO_CASES: Record<DemoCaseId, DemoCaseData> = {
  case_01: {
    id: "case_01",
    name: "Case 1 · Short Delivery",
    badgeLabel: "INV-1048 · Short Delivery",
    invoice_id: "INV-1048",
    buyer_name: "Aarav Industrial Supplies",
    investigation_id: "INV-DISP-2026-004",
    statusBadge: {
      label: "Needs Human Review",
      variant: "warning",
      bgClass: "bg-amber-50",
      textClass: "text-amber-800",
      borderClass: "border-amber-200",
      dotClass: "bg-amber-500",
    },
    dispute: {
      dispute_id: "DSP-2026-004",
      message: "We received only 110 units instead of the 120 invoiced on INV-1048. Please issue a credit note for the missing 10 units.",
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
      note: "Recorded balance calculated before any unapproved credit adjustments",
    },
    findings: [
      {
        finding_id: "FND-2026-001",
        claim_id: "CLM-001",
        statement: "Delivery quantity discrepancy of 10 units between Invoice INV-1048 (120 units) and Delivery Receipt DEL-209 (110 units).",
        status: FindingState.CONFLICTING_RECORDS,
        source_record_ids: ["INV-1048", "DEL-209"],
        calculation: {
          expression: "120 - 110",
          result: 10,
          unit: "units",
        },
        assumptions: [
          "Invoice INV-1048 and Proof of Delivery DEL-209 refer to the same consignment line-item ITEM-STEEL-BRG-12.",
        ],
        limitations: [
          "Physical condition of goods or cause of difference cannot be established from shipping documentation alone.",
        ],
        next_step: "Confirm delivery acceptance record with warehouse operator before approving credit adjustment.",
      },
      {
        finding_id: "FND-2026-002",
        claim_id: "CLM-002",
        statement: "Part payment of ₹30,000 is verified and recorded against Invoice INV-1048.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["PAY-771", "INV-1048"],
        calculation: {
          expression: "48000 - 30000",
          result: 18000,
          unit: "INR",
        },
        assumptions: [
          "Bank reference UTR-SBIN-88912-AARAV is verified and credited against INV-1048.",
        ],
        limitations: [],
        next_step: null,
      },
      {
        finding_id: "FND-2026-003",
        claim_id: "CLM-003",
        statement: "No authorised credit note found in supplied records for the requested 10-unit deduction (₹4,000).",
        status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        source_record_ids: ["INV-1048"],
        calculation: null,
        assumptions: [
          "Credit note search scoped to commercial records provided in active dataset.",
        ],
        limitations: [
          "Absence in supplied dataset does not prove a credit note does not exist in an external system or pending approval.",
        ],
        next_step: "Check accounts receivable queue to determine if a credit note has been initiated.",
      },
      {
        finding_id: "FND-2026-004",
        claim_id: "CLM-004",
        statement: "Root cause of 10-unit variance (dispatch shortage vs carrier transit loss vs dock rejection) cannot be resolved from supplied records.",
        status: FindingState.UNRESOLVED,
        source_record_ids: ["INV-1048", "DEL-209"],
        calculation: null,
        assumptions: [
          "No transporter carrier damage receipt or bilty shortage endorsement provided.",
        ],
        limitations: [
          "Documentation confirms accepted quantity was 110, but provides no transit loss inspection record.",
        ],
        next_step: "Request transporter consignment endorsement and dock discrepancy log.",
      },
    ],
    source_records: {
      invoices: [
        {
          record_id: "INV-1048",
          date: "2026-10-13",
          order_id: "ORD-1048",
          item_id: "ITEM-STEEL-BRG-12",
          item_description: "Precision Steel Bearings (12mm)",
          quantity: 120,
          unit: "units",
          unit_price: 400,
          total_amount: 48000,
        },
      ],
      deliveries: [
        {
          record_id: "DEL-209",
          date: "2026-10-14",
          order_id: "ORD-1048",
          invoice_id: "INV-1048",
          delivered_quantity: 110,
          accepted_quantity: 110,
          unit: "units",
          signatory: "R. Sharma (Receiving Dock 2)",
        },
      ],
      payments: [
        {
          record_id: "PAY-771",
          date: "2026-10-16",
          invoice_id: "INV-1048",
          amount: 30000,
          payment_method: "NEFT/RTGS",
          reference: "UTR-SBIN-88912-AARAV",
        },
      ],
      credit_notes: [],
    },
    processing_mode: "hybrid",
    metadata: {
      dispute_type: "short_delivery",
      scenario: "Quantity discrepancy between invoice (120) and delivery receipt (110). Buyer requested credit is isolated and not deducted.",
    },
  },

  case_02: {
    id: "case_02",
    name: "Case 2 · Clean Agreement",
    badgeLabel: "INV-1039 · Clean Agreement",
    invoice_id: "INV-1039",
    buyer_name: "Kaveri Components Pvt Ltd",
    investigation_id: "INV-DISP-2026-002",
    statusBadge: {
      label: "Settled Agreement",
      variant: "success",
      bgClass: "bg-emerald-50",
      textClass: "text-emerald-800",
      borderClass: "border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    dispute: {
      dispute_id: "DSP-2026-002",
      message: "Invoice INV-1039 payment of ₹35,000 has been remitted against 100 received units of Precision Castings. Please confirm receipt and account clearance.",
      claimed_issue: "account_reconciliation",
      invoice_id: "INV-1039",
      shipment_id: "DEL-194",
    },
    reconciliation: {
      invoice_id: "INV-1039",
      buyer_name: "Kaveri Components Pvt Ltd",
      currency: "INR",
      invoice_amount: 35000,
      recorded_payments: 35000,
      approved_credits: 0,
      recorded_balance: 0,
      unit_price: 350,
      invoiced_quantity: 100,
      accepted_quantity: 100,
      disputed_quantity: 0,
      potential_credit_amount: 0,
      note: "Commercial ledger fully settled. Invoiced quantity, accepted delivery, and payment records agree.",
    },
    findings: [
      {
        finding_id: "FND-1039-001",
        claim_id: "CLM-001",
        statement: "Delivery quantity of 100 units on Receipt DEL-194 fully matches Invoiced quantity of 100 units on INV-1039.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["INV-1039", "DEL-194"],
        calculation: {
          expression: "100 - 100",
          result: 0,
          unit: "units",
        },
        assumptions: [
          "Invoice INV-1039 and Proof of Delivery DEL-194 refer to item ITEM-CASTING-08.",
        ],
        limitations: [],
        next_step: null,
      },
      {
        finding_id: "FND-1039-002",
        claim_id: "CLM-002",
        statement: "Full payment of ₹35,000 verified and credited against Invoice INV-1039 via Bank UTR-HDFC-99104-KAVERI.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["PAY-642", "INV-1039"],
        calculation: {
          expression: "35000 - 35000",
          result: 0,
          unit: "INR",
        },
        assumptions: [
          "Bank remittance reference matches Kaveri Components account ledger.",
        ],
        limitations: [],
        next_step: null,
      },
      {
        finding_id: "FND-1039-003",
        claim_id: "CLM-003",
        statement: "Commercial ledger balance is zero. Commercial transaction is fully settled with zero outstanding discrepancies.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["INV-1039", "PAY-642"],
        calculation: null,
        assumptions: [
          "No pending return debit notes or quality rejections recorded in dataset.",
        ],
        limitations: [],
        next_step: "Archive completed transaction file and issue zero-balance statement if requested.",
      },
    ],
    source_records: {
      invoices: [
        {
          record_id: "INV-1039",
          date: "2026-10-10",
          order_id: "ORD-1039",
          item_id: "ITEM-CASTING-08",
          item_description: "Precision Aluminum Castings",
          quantity: 100,
          unit: "units",
          unit_price: 350,
          total_amount: 35000,
        },
      ],
      deliveries: [
        {
          record_id: "DEL-194",
          date: "2026-10-12",
          order_id: "ORD-1039",
          invoice_id: "INV-1039",
          delivered_quantity: 100,
          accepted_quantity: 100,
          unit: "units",
          signatory: "M. Iyer (Warehouse In-Charge)",
        },
      ],
      payments: [
        {
          record_id: "PAY-642",
          date: "2026-10-15",
          invoice_id: "INV-1039",
          amount: 35000,
          payment_method: "NEFT/RTGS",
          reference: "UTR-HDFC-99104-KAVERI",
        },
      ],
      credit_notes: [],
    },
    processing_mode: "hybrid",
    metadata: {
      dispute_type: "clean_agreement",
      scenario: "Clean delivery and reconciliation where all commercial records agree with zero shortages.",
    },
  },

  case_03: {
    id: "case_03",
    name: "Case 3 · Missing POD",
    badgeLabel: "INV-1031 · Missing POD",
    invoice_id: "INV-1031",
    buyer_name: "Northstar Engineering Works",
    investigation_id: "INV-DISP-2026-003",
    statusBadge: {
      label: "Missing Delivery Proof",
      variant: "warning",
      bgClass: "bg-amber-50",
      textClass: "text-amber-800",
      borderClass: "border-amber-200",
      dotClass: "bg-amber-500",
    },
    dispute: {
      dispute_id: "DSP-2026-003",
      message: "Invoice INV-1031 for ₹25,000 remains unpaid because we have no record of delivery at our warehouse. We cannot verify receipt without a signed Proof of Delivery.",
      claimed_issue: "missing_proof_of_delivery",
      invoice_id: "INV-1031",
      shipment_id: "DSP-310",
    },
    reconciliation: {
      invoice_id: "INV-1031",
      buyer_name: "Northstar Engineering Works",
      currency: "INR",
      invoice_amount: 25000,
      recorded_payments: 0,
      approved_credits: 0,
      recorded_balance: 25000,
      unit_price: 500,
      invoiced_quantity: 50,
      accepted_quantity: 0,
      disputed_quantity: 50,
      potential_credit_amount: 25000,
      note: "Full invoice amount withheld by buyer pending verified proof of delivery. Unapproved deduction not applied.",
    },
    findings: [
      {
        finding_id: "FND-1031-001",
        claim_id: "CLM-001",
        statement: "No signed proof of delivery or recipient receipt record found in the supplied commercial dataset for Invoice INV-1031.",
        status: FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        source_record_ids: ["INV-1031"],
        calculation: null,
        assumptions: [
          "Search scoped to all receiving dock records and delivery vouchers provided in active dataset.",
        ],
        limitations: [
          "Absence in supplied dataset does not prove physical non-delivery; document may be retained by transporter or pending scan.",
        ],
        next_step: "Request signed consignment copy or bilty endorsement from freight carrier TransLogistics Express.",
      },
      {
        finding_id: "FND-1031-002",
        claim_id: "CLM-002",
        statement: "Supplier dispatch record DSP-310 confirms 50 units were released from factory warehouse for shipment to Northstar Engineering Works.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["INV-1031", "DSP-310"],
        calculation: null,
        assumptions: [
          "Gate pass GP-8812 confirms goods exited supplier premises on 2026-10-08.",
        ],
        limitations: [
          "Dispatch documentation establishes departure from supplier facility only; does not establish arrival at buyer facility.",
        ],
        next_step: "Verify carrier tracking status on consignment CON-7701.",
      },
      {
        finding_id: "FND-1031-003",
        claim_id: "CLM-003",
        statement: "Delivery status of 50 units remains unresolved. Conflicting claims between factory dispatch and missing recipient acknowledgement cannot be reconciled without transport documentation.",
        status: FindingState.UNRESOLVED,
        source_record_ids: ["INV-1031", "DSP-310"],
        calculation: null,
        assumptions: [
          "No transit loss or damage incident report filed.",
        ],
        limitations: [
          "Carrier delivery receipt is required to establish recipient possession.",
        ],
        next_step: "Contact Northstar receiving department with carrier consignment slip CON-7701.",
      },
      {
        finding_id: "FND-1031-004",
        claim_id: "CLM-004",
        statement: "Zero payments recorded against Invoice INV-1031. Outstanding recorded balance remains ₹25,000.00.",
        status: FindingState.SUPPORTED_BY_RECORDS,
        source_record_ids: ["INV-1031"],
        calculation: {
          expression: "25000 - 0",
          result: 25000,
          unit: "INR",
        },
        assumptions: [
          "Bank statement reconciliation complete up to 2026-10-16.",
        ],
        limitations: [],
        next_step: "Do not approve buyer deduction or write-off until delivery investigation concludes.",
      },
    ],
    source_records: {
      invoices: [
        {
          record_id: "INV-1031",
          date: "2026-10-08",
          order_id: "ORD-1031",
          item_id: "ITEM-VALVE-50",
          item_description: "Industrial Control Valves (50mm)",
          quantity: 50,
          unit: "units",
          unit_price: 500,
          total_amount: 25000,
        },
      ],
      deliveries: [
        {
          record_id: "DSP-310",
          date: "2026-10-09",
          order_id: "ORD-1031",
          invoice_id: "INV-1031",
          delivered_quantity: 50,
          accepted_quantity: 0,
          unit: "units",
          signatory: "Dispatch Supervisor P. Verma (Factory Gate 1 - Consignment CON-7701)",
        },
      ],
      payments: [],
      credit_notes: [],
    },
    processing_mode: "hybrid",
    metadata: {
      dispute_type: "missing_proof_of_delivery",
      scenario: "Dispatch record exists, but signed receipt is absent from supplied dataset. Demonstrates restrained uncertainty and NOT_FOUND_IN_PROVIDED_DATA state.",
    },
  },
};

export const DEFAULT_CASE_ID = "case_01";

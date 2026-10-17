/**
 * ProofTrail — Commercial Record Parser & Validator (Milestone 3)
 * Source of truth: docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Sections 3 & 4)
 *
 * Supports CSV and JSON inputs across six commercial record categories:
 * 1. purchase_orders
 * 2. invoices
 * 3. dispatches
 * 4. receipts (proof of delivery / accepted goods)
 * 5. payments
 * 6. credit_notes
 *
 * Safeguards:
 * - Partial imports: valid rows are imported even if some rows fail validation
 * - Duplicate protection: intra-file duplicates and clashes with existing records are rejected
 * - Structural validity vs verification: imported records are strictly marked as structurally valid,
 *   never as verified evidence
 * - Non-invention: missing optional values remain null/undefined, never fabricated
 */

import { z } from "zod";
import { BaseRecordSchema } from "@/types";

export type RecordCategory =
  | "purchase_orders"
  | "invoices"
  | "dispatches"
  | "receipts"
  | "payments"
  | "credit_notes";

export const RECORD_CATEGORIES: RecordCategory[] = [
  "purchase_orders",
  "invoices",
  "dispatches",
  "receipts",
  "payments",
  "credit_notes",
];

export const CATEGORY_LABELS: Record<RecordCategory, string> = {
  purchase_orders: "Purchase Order",
  invoices: "Commercial Invoice",
  dispatches: "Dispatch Note",
  receipts: "Proof of Delivery / Receipt",
  payments: "Bank Payment",
  credit_notes: "Credit Note",
};

// --- Category Validation Schemas (Extending BaseRecordSchema) ---

export const PurchaseOrderSchema = BaseRecordSchema.extend({
  po_id: z.string().min(1).optional(),
  buyer_id: z.string().optional(),
  supplier_id: z.string().optional(),
  item_id: z.string().optional(),
  ordered_qty: z.coerce.number().positive("ordered_qty must be greater than 0"),
  unit: z.string().min(1, "unit is required"),
  unit_price: z.coerce.number().nonnegative("unit_price must be nonnegative").optional(),
  currency: z.string().min(1).default("INR"),
}).passthrough();

export const InvoiceSchema = BaseRecordSchema.extend({
  invoice_id: z.string().min(1).optional(),
  po_id: z.string().optional(),
  shipment_id: z.string().optional(),
  item_id: z.string().optional(),
  quantity: z.coerce.number().positive().optional(),
  invoiced_qty: z.coerce.number().positive().optional(),
  unit: z.string().optional(),
  unit_price: z.coerce.number().nonnegative().optional(),
  total_amount: z.coerce.number().nonnegative("total_amount must be nonnegative"),
  currency: z.string().min(1).default("INR"),
}).passthrough();

export const DispatchSchema = BaseRecordSchema.extend({
  shipment_id: z.string().min(1).optional(),
  invoice_id: z.string().optional(),
  item_id: z.string().optional(),
  carrier: z.string().optional(),
  dispatched_qty: z.coerce.number().positive("dispatched_qty must be greater than 0"),
  unit: z.string().min(1, "unit is required"),
}).passthrough();

export const ReceiptSchema = BaseRecordSchema.extend({
  shipment_id: z.string().min(1).optional(),
  delivery_id: z.string().optional(),
  invoice_id: z.string().optional(),
  item_id: z.string().optional(),
  received_qty: z.coerce.number().nonnegative("received_qty must be nonnegative").optional(),
  accepted_quantity: z.coerce.number().nonnegative().optional(),
  unit: z.string().min(1, "unit is required"),
  signed: z.coerce.boolean().optional(),
  signatory: z.string().optional(),
}).passthrough();

export const PaymentSchema = BaseRecordSchema.extend({
  payment_id: z.string().optional(),
  invoice_id: z.string().optional(),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  currency: z.string().min(1).default("INR"),
  reference: z.string().optional(),
  payment_method: z.string().optional(),
}).passthrough();

export const CreditNoteSchema = BaseRecordSchema.extend({
  credit_note_id: z.string().optional(),
  invoice_id: z.string().optional(),
  amount: z.coerce.number().positive("amount must be greater than 0"),
  currency: z.string().min(1).default("INR"),
  reason: z.string().optional(),
  approved: z.coerce.boolean().default(false),
}).passthrough();

export const CATEGORY_SCHEMAS: Record<RecordCategory, z.ZodTypeAny> = {
  purchase_orders: PurchaseOrderSchema,
  invoices: InvoiceSchema,
  dispatches: DispatchSchema,
  receipts: ReceiptSchema,
  payments: PaymentSchema,
  credit_notes: CreditNoteSchema,
};

// --- Standard Output Types ---

export interface RowError {
  row: number; // 1-based index (e.g. Row 2 in CSV)
  record_id?: string;
  category?: string;
  field?: string;
  message: string;
  raw?: Record<string, unknown> | string;
}

export interface ValidatedRecord {
  record_id: string;
  category: RecordCategory;
  date: string;
  provenance: "imported_local";
  validation_status: "structurally_valid";
  raw_data: Record<string, unknown>;
  [key: string]: unknown;
}

export interface ParseResult {
  success: boolean;
  file_name?: string;
  file_format: "json" | "csv" | "unsupported";
  total_rows: number;
  valid_count: number;
  invalid_count: number;
  valid_records: ValidatedRecord[];
  rejected_rows: RowError[];
  category_counts: Record<RecordCategory, number>;
  error_message?: string;
}

export interface ParseOptions {
  fileName?: string;
  defaultCategory?: RecordCategory;
  existingRecordIds?: Set<string> | string[];
}

/**
 * Normalizes user-supplied category names into canonical RecordCategory
 */
export function normalizeCategory(val: unknown): RecordCategory | null {
  if (typeof val !== "string") return null;
  const cleaned = val.trim().toLowerCase().replace(/[\s-_]+/g, "");

  if (cleaned.includes("purchaseorder") || cleaned === "po" || cleaned === "purchaseorders") {
    return "purchase_orders";
  }
  if (cleaned.includes("invoice") || cleaned === "inv" || cleaned === "invoices") {
    return "invoices";
  }
  if (cleaned.includes("dispatch") || cleaned === "dspt" || cleaned === "dispatches") {
    return "dispatches";
  }
  if (
    cleaned.includes("receipt") ||
    cleaned.includes("delivery") ||
    cleaned.includes("pod") ||
    cleaned === "deliveries"
  ) {
    return "receipts";
  }
  if (cleaned.includes("payment") || cleaned === "pay" || cleaned === "payments") {
    return "payments";
  }
  if (cleaned.includes("creditnote") || cleaned === "cn" || cleaned === "creditnotes") {
    return "credit_notes";
  }

  return null;
}

/**
 * Robust CSV Line Tokenizer that handles commas, whitespace, and quoted strings
 */
export function tokenizeCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
}

/**
 * Parse CSV content into structured objects with 1-based row tracking
 */
export function parseCSVToObjects(
  content: string
): { headers: string[]; rows: { rowNum: number; data: Record<string, string> }[]; parseError?: string } {
  const trimmed = content.trim();
  if (!trimmed) {
    return { headers: [], rows: [], parseError: "File content is empty." };
  }

  const lines = trimmed.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      headers: [],
      rows: [],
      parseError: "CSV must contain at least a header row and one data row.",
    };
  }

  const rawHeaders = tokenizeCSVLine(lines[0]);
  const headers = rawHeaders.map((h) => h.replace(/^["']|["']$/g, "").trim().toLowerCase());

  const rows: { rowNum: number; data: Record<string, string> }[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rowNum = i + 1; // 1-indexed (row 1 is header)
    const tokens = tokenizeCSVLine(lines[i]);
    const rowObj: Record<string, string> = {};

    headers.forEach((h, colIndex) => {
      rowObj[h] = tokens[colIndex] !== undefined ? tokens[colIndex] : "";
    });

    rows.push({ rowNum, data: rowObj });
  }

  return { headers, rows };
}

/**
 * Main parser entry point for CSV and JSON records
 */
export function parseRecords(rawContent: string, options: ParseOptions = {}): ParseResult {
  const emptyCategoryCounts: Record<RecordCategory, number> = {
    purchase_orders: 0,
    invoices: 0,
    dispatches: 0,
    receipts: 0,
    payments: 0,
    credit_notes: 0,
  };

  const fileName = options.fileName || "records.json";
  const existingSet = new Set<string>(
    options.existingRecordIds ? Array.from(options.existingRecordIds) : []
  );
  const seenInFileSet = new Map<string, number>(); // record_id -> first row number

  const trimmed = rawContent.trim();
  if (!trimmed) {
    return {
      success: false,
      file_name: fileName,
      file_format: "unsupported",
      total_rows: 0,
      valid_count: 0,
      invalid_count: 0,
      valid_records: [],
      rejected_rows: [],
      category_counts: emptyCategoryCounts,
      error_message: "The uploaded file is empty (0 bytes).",
    };
  }

  const isJSON = fileName.toLowerCase().endsWith(".json") || (trimmed.startsWith("{") || trimmed.startsWith("["));
  const isCSV = fileName.toLowerCase().endsWith(".csv") || (!isJSON && trimmed.includes(","));

  if (!isJSON && !isCSV) {
    return {
      success: false,
      file_name: fileName,
      file_format: "unsupported",
      total_rows: 0,
      valid_count: 0,
      invalid_count: 0,
      valid_records: [],
      rejected_rows: [],
      category_counts: emptyCategoryCounts,
      error_message: `Unsupported file format for '${fileName}'. Please upload a .json or .csv file.`,
    };
  }

  // --- Parse Raw Rows ---
  interface CandidateRow {
    rowNum: number;
    category?: RecordCategory;
    data: Record<string, unknown>;
  }

  const candidateRows: CandidateRow[] = [];
  const rejectedRows: RowError[] = [];

  if (isJSON) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawContent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        file_name: fileName,
        file_format: "json",
        total_rows: 0,
        valid_count: 0,
        invalid_count: 0,
        valid_records: [],
        rejected_rows: [],
        category_counts: emptyCategoryCounts,
        error_message: `Malformed JSON: Unable to parse file. ${msg}`,
      };
    }

    if (Array.isArray(parsed)) {
      parsed.forEach((item, idx) => {
        const rowNum = idx + 1;
        if (typeof item === "object" && item !== null) {
          const rec = item as Record<string, unknown>;
          const cat =
            normalizeCategory(rec.record_category || rec.category || rec.type) ||
            options.defaultCategory;
          candidateRows.push({ rowNum, category: cat, data: rec });
        } else {
          rejectedRows.push({
            row: rowNum,
            message: "Row is not a valid JSON record object.",
            raw: String(item),
          });
        }
      });
    } else if (typeof parsed === "object" && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      let rowCounter = 1;

      // Check if canonical collection format { purchase_orders: [...], invoices: [...] }
      let hasCollectionKeys = false;
      for (const cat of RECORD_CATEGORIES) {
        if (Array.isArray(obj[cat])) {
          hasCollectionKeys = true;
          const items = obj[cat] as Array<unknown>;
          items.forEach((item) => {
            if (typeof item === "object" && item !== null) {
              candidateRows.push({
                rowNum: rowCounter++,
                category: cat,
                data: item as Record<string, unknown>,
              });
            } else {
              rejectedRows.push({
                row: rowCounter++,
                category: cat,
                message: `Item in ${cat} collection is not a valid record object.`,
                raw: String(item),
              });
            }
          });
        }
      }

      // Handle single record object format
      if (!hasCollectionKeys) {
        const cat =
          normalizeCategory(obj.record_category || obj.category || obj.type) ||
          options.defaultCategory;
        candidateRows.push({ rowNum: 1, category: cat, data: obj });
      }
    } else {
      return {
        success: false,
        file_name: fileName,
        file_format: "json",
        total_rows: 0,
        valid_count: 0,
        invalid_count: 0,
        valid_records: [],
        rejected_rows: [],
        category_counts: emptyCategoryCounts,
        error_message: "JSON root must be an array of records or a record collection object.",
      };
    }
  } else {
    // CSV parsing
    const { headers, rows, parseError } = parseCSVToObjects(rawContent);
    if (parseError) {
      return {
        success: false,
        file_name: fileName,
        file_format: "csv",
        total_rows: 0,
        valid_count: 0,
        invalid_count: 0,
        valid_records: [],
        rejected_rows: [],
        category_counts: emptyCategoryCounts,
        error_message: `CSV Error: ${parseError}`,
      };
    }

    const hasCategoryColumn =
      headers.includes("record_category") ||
      headers.includes("category") ||
      headers.includes("type");

    rows.forEach(({ rowNum, data }) => {
      let cat: RecordCategory | null = null;
      if (hasCategoryColumn) {
        cat = normalizeCategory(data.record_category || data.category || data.type);
      }
      if (!cat && options.defaultCategory) {
        cat = options.defaultCategory;
      }

      // Clean empty string attributes so Zod optionals receive undefined rather than invalid types
      const cleanedData: Record<string, unknown> = {};
      Object.entries(data).forEach(([k, v]) => {
        cleanedData[k] = v === "" ? undefined : v;
      });

      // Special alias mapping for CSV convenience
      if (cleanedData.quantity && !cleanedData.ordered_qty) cleanedData.ordered_qty = cleanedData.quantity;
      if (cleanedData.quantity && !cleanedData.invoiced_qty) cleanedData.invoiced_qty = cleanedData.quantity;
      if (cleanedData.quantity && !cleanedData.dispatched_qty) cleanedData.dispatched_qty = cleanedData.quantity;
      if (cleanedData.quantity && !cleanedData.received_qty) cleanedData.received_qty = cleanedData.quantity;
      if (cleanedData.amount && !cleanedData.total_amount) cleanedData.total_amount = cleanedData.amount;

      candidateRows.push({ rowNum, category: cat || undefined, data: cleanedData });
    });
  }

  // --- Validate Rows with Zod & Duplicate Protection ---
  const validRecords: ValidatedRecord[] = [];
  const categoryCounts = { ...emptyCategoryCounts };
  const totalRows = candidateRows.length + rejectedRows.length;

  candidateRows.forEach(({ rowNum, category, data }) => {
    // 1. Verify Category Presence
    if (!category || !RECORD_CATEGORIES.includes(category)) {
      rejectedRows.push({
        row: rowNum,
        record_id: typeof data.record_id === "string" ? data.record_id : undefined,
        message:
          "Missing or unknown record category. Must be one of: purchase_orders, invoices, dispatches, receipts, payments, credit_notes.",
        raw: data,
      });
      return;
    }

    // 2. Validate with Category Schema
    const schema = CATEGORY_SCHEMAS[category];
    const validationResult = schema.safeParse(data);

    if (!validationResult.success) {
      const issue = validationResult.error.issues[0];
      const fieldPath = issue.path.join(".");
      rejectedRows.push({
        row: rowNum,
        category,
        record_id: typeof data.record_id === "string" ? data.record_id : undefined,
        field: fieldPath || undefined,
        message: `${fieldPath ? `Field '${fieldPath}': ` : ""}${issue.message}`,
        raw: data,
      });
      return;
    }

    const validatedData = validationResult.data as Record<string, unknown>;
    const recordId = String(validatedData.record_id);

    // 3. Safeguard: Intra-File Duplicate Protection
    if (seenInFileSet.has(recordId)) {
      const firstRow = seenInFileSet.get(recordId);
      rejectedRows.push({
        row: rowNum,
        category,
        record_id: recordId,
        message: `Duplicate record ID '${recordId}' found within file (first appeared at row ${firstRow}). Skipped to preserve record uniqueness.`,
        raw: data,
      });
      return;
    }
    seenInFileSet.set(recordId, rowNum);

    // 4. Safeguard: Clash Protection with Existing Evidence
    if (existingSet.has(recordId)) {
      rejectedRows.push({
        row: rowNum,
        category,
        record_id: recordId,
        message: `Record ID '${recordId}' already exists in imported evidence. Skipped to prevent accidental overwrite.`,
        raw: data,
      });
      return;
    }

    // 5. Successful Structural Validation
    categoryCounts[category]++;
    validRecords.push({
      ...validatedData,
      record_id: recordId,
      category,
      date: String(validatedData.date),
      provenance: "imported_local",
      validation_status: "structurally_valid",
      raw_data: validatedData,
    });
  });

  return {
    success: validRecords.length > 0 || totalRows === 0,
    file_name: fileName,
    file_format: isJSON ? "json" : "csv",
    total_rows: totalRows,
    valid_count: validRecords.length,
    invalid_count: rejectedRows.length,
    valid_records: validRecords,
    rejected_rows: rejectedRows.sort((a, b) => a.row - b.row),
    category_counts: categoryCounts,
  };
}

/**
 * Built-in sample demonstration payloads for CSV and JSON import
 */
export const SAMPLE_DATA_SNIPPETS: { label: string; format: "json" | "csv"; defaultCategory?: RecordCategory; content: string }[] = [
  {
    label: "Canonical Multi-Category JSON",
    format: "json",
    content: JSON.stringify(
      {
        purchase_orders: [
          {
            record_id: "PO-REC-2026-901",
            po_id: "PO-901",
            buyer_id: "BUY-AARAV",
            item_id: "ITEM-STEEL-BRG-12",
            ordered_qty: 120,
            unit: "units",
            unit_price: 400,
            currency: "INR",
            date: "2026-10-10",
          },
        ],
        dispatches: [
          {
            record_id: "DSPT-2026-441",
            shipment_id: "SHP-441",
            invoice_id: "INV-1048",
            dispatched_qty: 120,
            unit: "units",
            carrier: "BlueDart Logistics",
            date: "2026-10-12",
          },
        ],
        receipts: [
          {
            record_id: "POD-2026-882",
            shipment_id: "SHP-441",
            invoice_id: "INV-1048",
            accepted_quantity: 110,
            received_qty: 110,
            unit: "units",
            signed: true,
            signatory: "K. Patel (Gate 3)",
            date: "2026-10-14",
          },
        ],
        credit_notes: [
          {
            record_id: "CN-PEND-001",
            invoice_id: "INV-1048",
            amount: 4000,
            currency: "INR",
            reason: "Short delivery adjustment request (10 units)",
            approved: false,
            date: "2026-10-17",
          },
        ],
      },
      null,
      2
    ),
  },
  {
    label: "Invoices CSV (Single Category)",
    format: "csv",
    defaultCategory: "invoices",
    content: `record_id,date,invoice_id,total_amount,quantity,unit_price,currency\nINV-REC-201,2026-10-11,INV-201,48000,120,400,INR\nINV-REC-202,2026-10-12,INV-202,35000,100,350,INR\nINV-REC-203,2026-10-13,INV-203,25000,50,500,INR`,
  },
  {
    label: "Multi-Category CSV with Record Category Column",
    format: "csv",
    content: `record_category,record_id,date,ordered_qty,dispatched_qty,received_qty,total_amount,amount,unit,currency\npurchase_orders,PO-REC-301,2026-10-09,150,,,,,,pcs,INR\ndispatches,DSPT-REC-301,2026-10-11,,150,,,,pcs,INR\nreceipts,POD-REC-301,2026-10-14,,,140,,,pcs,INR\npayments,PAY-REC-301,2026-10-15,,,,45000,,INR\ncredit_notes,CN-REC-301,2026-10-16,,,,,3000,,INR`,
  },
];

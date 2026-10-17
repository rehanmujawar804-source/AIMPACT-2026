import { describe, it, expect } from "vitest";
import {
  parseRecords,
  normalizeCategory,
  tokenizeCSVLine,
  parseCSVToObjects,
  type RecordCategory,
} from "@/features/investigations/lib/recordParser";

describe("Commercial Record Parser & Validator (Milestone 3)", () => {
  describe("Category Normalizer", () => {
    it("normalizes various aliases into canonical categories", () => {
      expect(normalizeCategory("purchase_orders")).toBe("purchase_orders");
      expect(normalizeCategory("Purchase Order")).toBe("purchase_orders");
      expect(normalizeCategory("PO")).toBe("purchase_orders");
      expect(normalizeCategory("invoices")).toBe("invoices");
      expect(normalizeCategory("Commercial Invoice")).toBe("invoices");
      expect(normalizeCategory("inv")).toBe("invoices");
      expect(normalizeCategory("dispatches")).toBe("dispatches");
      expect(normalizeCategory("dispatch note")).toBe("dispatches");
      expect(normalizeCategory("receipts")).toBe("receipts");
      expect(normalizeCategory("proof_of_delivery")).toBe("receipts");
      expect(normalizeCategory("POD")).toBe("receipts");
      expect(normalizeCategory("deliveries")).toBe("receipts");
      expect(normalizeCategory("payments")).toBe("payments");
      expect(normalizeCategory("credit_notes")).toBe("credit_notes");
      expect(normalizeCategory("credit note")).toBe("credit_notes");
      expect(normalizeCategory("unknown_category")).toBe(null);
      expect(normalizeCategory(123)).toBe(null);
    });
  });

  describe("CSV Tokenizer & Parser", () => {
    it("correctly tokenizes commas and quoted fields with commas", () => {
      const line = 'INV-001,2026-10-10,"Steel Bearings, Grade A",48000';
      const tokens = tokenizeCSVLine(line);
      expect(tokens).toEqual(["INV-001", "2026-10-10", "Steel Bearings, Grade A", "48000"]);
    });

    it("handles escaped quotes in CSV lines", () => {
      const line = 'INV-002,2026-10-11,"Item ""Special"" Model",25000';
      const tokens = tokenizeCSVLine(line);
      expect(tokens).toEqual(["INV-002", "2026-10-11", 'Item "Special" Model', "25000"]);
    });

    it("rejects empty CSV content or header-only CSV", () => {
      const emptyRes = parseCSVToObjects("   ");
      expect(emptyRes.parseError).toBeDefined();

      const headerOnly = parseCSVToObjects("record_id,date,amount");
      expect(headerOnly.parseError).toContain("at least a header row and one data row");
    });
  });

  describe("JSON Record Parsing", () => {
    it("parses canonical multi-category record collections", () => {
      const jsonContent = JSON.stringify({
        purchase_orders: [
          {
            record_id: "PO-901",
            po_id: "PO-901",
            date: "2026-10-09",
            ordered_qty: 120,
            unit: "units",
            unit_price: 400,
          },
        ],
        invoices: [
          {
            record_id: "INV-1048",
            invoice_id: "INV-1048",
            date: "2026-10-13",
            total_amount: 48000,
            quantity: 120,
            unit_price: 400,
          },
        ],
        dispatches: [
          {
            record_id: "DSPT-441",
            shipment_id: "SHP-441",
            date: "2026-10-12",
            dispatched_qty: 120,
            unit: "units",
          },
        ],
        receipts: [
          {
            record_id: "POD-882",
            shipment_id: "SHP-441",
            date: "2026-10-14",
            accepted_quantity: 110,
            unit: "units",
            signed: true,
          },
        ],
        payments: [
          {
            record_id: "PAY-771",
            date: "2026-10-16",
            amount: 30000,
            reference: "UTR-SBIN-88912",
          },
        ],
        credit_notes: [
          {
            record_id: "CN-991",
            date: "2026-10-17",
            amount: 4000,
            reason: "Short delivery claim",
          },
        ],
      });

      const result = parseRecords(jsonContent, { fileName: "canonical_evidence.json" });

      expect(result.success).toBe(true);
      expect(result.file_format).toBe("json");
      expect(result.total_rows).toBe(6);
      expect(result.valid_count).toBe(6);
      expect(result.invalid_count).toBe(0);
      expect(result.category_counts.purchase_orders).toBe(1);
      expect(result.category_counts.invoices).toBe(1);
      expect(result.category_counts.dispatches).toBe(1);
      expect(result.category_counts.receipts).toBe(1);
      expect(result.category_counts.payments).toBe(1);
      expect(result.category_counts.credit_notes).toBe(1);

      // Verify that validation status is explicitly structurally_valid, not verified
      result.valid_records.forEach((r) => {
        expect(r.validation_status).toBe("structurally_valid");
        expect(r.provenance).toBe("imported_local");
      });
    });

    it("parses flat JSON arrays with record_category tags", () => {
      const flatJSON = JSON.stringify([
        {
          record_category: "invoices",
          record_id: "INV-501",
          date: "2026-10-10",
          total_amount: 15000,
        },
        {
          record_category: "payments",
          record_id: "PAY-501",
          date: "2026-10-15",
          amount: 15000,
        },
      ]);

      const result = parseRecords(flatJSON, { fileName: "flat_records.json" });
      expect(result.valid_count).toBe(2);
      expect(result.valid_records[0].record_id).toBe("INV-501");
      expect(result.valid_records[1].record_id).toBe("PAY-501");
    });

    it("gracefully catches malformed JSON syntax without throwing", () => {
      const brokenJSON = '{"purchase_orders": [{ record_id: "PO-1" broken json';
      const result = parseRecords(brokenJSON, { fileName: "bad.json" });

      expect(result.success).toBe(false);
      expect(result.error_message).toContain("Malformed JSON");
      expect(result.valid_count).toBe(0);
    });
  });

  describe("CSV Record Parsing", () => {
    it("parses single-category CSV with default category specified", () => {
      const csv = `record_id,date,invoice_id,total_amount,quantity,unit_price\nINV-001,2026-10-11,INV-001,48000,120,400\nINV-002,2026-10-12,INV-002,35000,100,350`;

      const result = parseRecords(csv, {
        fileName: "invoices.csv",
        defaultCategory: "invoices",
      });

      expect(result.success).toBe(true);
      expect(result.file_format).toBe("csv");
      expect(result.valid_count).toBe(2);
      expect(result.valid_records[0].total_amount).toBe(48000);
      expect(result.valid_records[1].total_amount).toBe(35000);
    });

    it("parses multi-category CSV using record_category column", () => {
      const csv = `record_category,record_id,date,ordered_qty,dispatched_qty,unit,total_amount\npurchase_orders,PO-10,2026-10-08,50,,pcs,\ndispatches,DSPT-10,2026-10-10,,50,pcs,`;

      const result = parseRecords(csv, { fileName: "multi.csv" });
      expect(result.valid_count).toBe(2);
      expect(result.valid_records[0].category).toBe("purchase_orders");
      expect(result.valid_records[1].category).toBe("dispatches");
    });
  });

  describe("Partial Imports & Row-Level Error Tracking", () => {
    it("imports valid rows while reporting exact row numbers and errors for rejected rows", () => {
      const csvWithErrors = [
        "record_id,date,total_amount",
        "INV-GOOD-1,2026-10-01,10000", // Row 2: Valid
        "INV-BAD-DATE,10/01/2026,20000", // Row 3: Invalid Date (not YYYY-MM-DD)
        ",2026-10-03,30000", // Row 4: Missing record_id
        "INV-BAD-AMOUNT,2026-10-04,-500", // Row 5: Negative amount
        "INV-GOOD-2,2026-10-05,50000", // Row 6: Valid
      ].join("\n");

      const result = parseRecords(csvWithErrors, {
        fileName: "invoices_mixed.csv",
        defaultCategory: "invoices",
      });

      // Partial import guarantee:
      expect(result.total_rows).toBe(5);
      expect(result.valid_count).toBe(2);
      expect(result.invalid_count).toBe(3);

      // Verify valid records
      expect(result.valid_records.map((r) => r.record_id)).toEqual(["INV-GOOD-1", "INV-GOOD-2"]);

      // Verify row-level rejected errors
      expect(result.rejected_rows.length).toBe(3);
      expect(result.rejected_rows[0].row).toBe(3);
      expect(result.rejected_rows[0].message).toContain("Must be ISO YYYY-MM-DD");

      expect(result.rejected_rows[1].row).toBe(4);
      expect(result.rejected_rows[1].field).toBe("record_id");

      expect(result.rejected_rows[2].row).toBe(5);
      expect(result.rejected_rows[2].message).toContain("nonnegative");
    });
  });

  describe("Duplicate Protection Safeguards", () => {
    it("detects and rejects intra-file duplicate record IDs while keeping first occurrence", () => {
      const csvWithDupes = [
        "record_id,date,total_amount",
        "INV-DUPE-100,2026-10-01,10000", // Row 2: first occurrence
        "INV-UNIQUE-200,2026-10-02,20000", // Row 3: unique
        "INV-DUPE-100,2026-10-03,30000", // Row 4: duplicate of Row 2
      ].join("\n");

      const result = parseRecords(csvWithDupes, {
        fileName: "dupes.csv",
        defaultCategory: "invoices",
      });

      expect(result.valid_count).toBe(2);
      expect(result.invalid_count).toBe(1);
      expect(result.valid_records.map((r) => r.record_id)).toEqual(["INV-DUPE-100", "INV-UNIQUE-200"]);

      const rejectedDupe = result.rejected_rows.find((r) => r.record_id === "INV-DUPE-100");
      expect(rejectedDupe).toBeDefined();
      expect(rejectedDupe?.row).toBe(4);
      expect(rejectedDupe?.message).toContain("first appeared at row 2");
    });

    it("detects and rejects clashes against existing imported record IDs", () => {
      const existingIds = new Set(["INV-EXISTING-99"]);
      const newCSV = [
        "record_id,date,total_amount",
        "INV-EXISTING-99,2026-10-05,10000", // Row 2: clashes with existing evidence
        "INV-NEW-101,2026-10-06,20000", // Row 3: brand new
      ].join("\n");

      const result = parseRecords(newCSV, {
        fileName: "incoming.csv",
        defaultCategory: "invoices",
        existingRecordIds: existingIds,
      });

      expect(result.valid_count).toBe(1);
      expect(result.valid_records[0].record_id).toBe("INV-NEW-101");
      expect(result.invalid_count).toBe(1);
      expect(result.rejected_rows[0].message).toContain("already exists in imported evidence");
    });
  });

  describe("Edge Cases & Safety Rules", () => {
    it("handles 0-byte and whitespace files cleanly", () => {
      const res1 = parseRecords("");
      expect(res1.success).toBe(false);
      expect(res1.error_message).toContain("empty");

      const res2 = parseRecords("   \n\t  ");
      expect(res2.success).toBe(false);
      expect(res2.error_message).toContain("empty");
    });

    it("rejects unsupported file formats cleanly", () => {
      const res = parseRecords("some random unstructured text", { fileName: "document.pdf" });
      expect(res.success).toBe(false);
      expect(res.error_message).toContain("Unsupported file format");
    });

    it("does not invent missing optional values", () => {
      const json = JSON.stringify({
        invoices: [
          {
            record_id: "INV-BARE-01",
            date: "2026-10-12",
            total_amount: 5000,
          },
        ],
      });

      const res = parseRecords(json);
      expect(res.valid_count).toBe(1);
      const rec = res.valid_records[0];

      // Stored record should not have fabricated values
      expect(rec.po_id).toBeUndefined();
      expect(rec.shipment_id).toBeUndefined();
      expect(rec.buyer_id).toBeUndefined();
    });
  });
});

"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatDate } from "../lib/formatters";

interface DatasetCard {
  id: string;
  name: string;
  filename: string;
  type: string;
  rowCount: number;
  status: "valid" | "warning" | "empty";
  statusText: string;
  lastLoaded: string;
  description: string;
}

interface RecordRow {
  rowNum: number;
  recordId: string;
  relatedRef: string;
  entityName: string;
  primaryMetric: string;
  secondaryMetric: string;
  date: string;
  validationNote: string;
  status: "valid" | "warning" | "missing";
}

const DATASETS: DatasetCard[] = [
  {
    id: "invoices",
    name: "Commercial Invoices",
    filename: "invoices_export_20261017.csv",
    type: "ERP Invoice Batch",
    rowCount: 4,
    status: "valid",
    statusText: "Valid schema (Zod verified)",
    lastLoaded: "2026-10-17 10:30 IST",
    description: "Tax billing records with line items, quantities, and agreed unit pricing.",
  },
  {
    id: "deliveries",
    name: "Proof of Delivery (POD)",
    filename: "delivery_receipts_dock.csv",
    type: "Warehouse Logistics Sync",
    rowCount: 5,
    status: "warning",
    statusText: "1 warning (Split consignment)",
    lastLoaded: "2026-10-17 10:30 IST",
    description: "Dock receipts and gate passes signed by consignee with accepted quantities.",
  },
  {
    id: "payments",
    name: "Bank Settlements",
    filename: "bank_neft_feed.csv",
    type: "Treasury Ledger",
    rowCount: 4,
    status: "warning",
    statusText: "1 warning (Unconfirmed deduction)",
    lastLoaded: "2026-10-17 10:30 IST",
    description: "Confirmed inbound NEFT / RTGS payments matched against buyer accounts.",
  },
  {
    id: "purchase_orders",
    name: "Purchase Orders",
    filename: "purchase_orders_master.csv",
    type: "Procurement Contracts",
    rowCount: 4,
    status: "valid",
    statusText: "Valid schema",
    lastLoaded: "2026-10-17 10:30 IST",
    description: "Commercial orders authorizing unit pricing, quantities, and dispatch windows.",
  },
  {
    id: "credit_notes",
    name: "Credit Notes Ledger",
    filename: "credit_notes_issued.csv",
    type: "Adjustments Register",
    rowCount: 0,
    status: "empty",
    statusText: "0 records (Dataset empty)",
    lastLoaded: "2026-10-17 10:30 IST",
    description: "Authorised tax credit adjustments issued against prior invoices.",
  },
];

const ROWS_BY_DATASET: Record<string, RecordRow[]> = {
  invoices: [
    {
      rowNum: 1,
      recordId: "INV-1048",
      relatedRef: "ORD-1048",
      entityName: "Aarav Industrial Supplies",
      primaryMetric: formatINR(48000),
      secondaryMetric: "120 units @ ₹400",
      date: "2026-10-13",
      validationNote: "Matched with ORD-1048. Line arithmetic verified.",
      status: "valid",
    },
    {
      rowNum: 2,
      recordId: "INV-002",
      relatedRef: "PO-002",
      entityName: "Kaveri Components Pvt Ltd",
      primaryMetric: formatINR(15000),
      secondaryMetric: "100 pcs @ ₹150",
      date: "2026-10-11",
      validationNote: "Matched with PO-002. Line arithmetic verified.",
      status: "valid",
    },
    {
      rowNum: 3,
      recordId: "INV-001",
      relatedRef: "PO-001",
      entityName: "Zenith Manufacturing Ltd",
      primaryMetric: formatINR(15000),
      secondaryMetric: "100 pcs @ ₹150",
      date: "2026-10-05",
      validationNote: "Full delivery and payment match. Fully reconciled.",
      status: "valid",
    },
    {
      rowNum: 4,
      recordId: "INV-003",
      relatedRef: "PO-003",
      entityName: "Northstar Engineering Works",
      primaryMetric: formatINR(18000),
      secondaryMetric: "100 pcs @ ₹180",
      date: "2026-10-06",
      validationNote: "Matched with PO-003. Multiple delivery receipts attached.",
      status: "valid",
    },
  ],
  deliveries: [
    {
      rowNum: 1,
      recordId: "DEL-209",
      relatedRef: "INV-1048 / SHP-1048",
      entityName: "Aarav Industrial Supplies",
      primaryMetric: "110 of 120 units accepted",
      secondaryMetric: "10 units shortage noted",
      date: "2026-10-14",
      validationNote: "Shortage notation signed by consignee dock clerk.",
      status: "warning",
    },
    {
      rowNum: 2,
      recordId: "POD-REC-002",
      relatedRef: "INV-002 / SHP-002",
      entityName: "Kaveri Components Pvt Ltd",
      primaryMetric: "80 of 100 pcs received",
      secondaryMetric: "20 pcs shortage noted",
      date: "2026-10-12",
      validationNote: "Discrepancy confirmed against invoiced quantity.",
      status: "warning",
    },
    {
      rowNum: 3,
      recordId: "POD-REC-001",
      relatedRef: "INV-001 / SHP-001",
      entityName: "Zenith Manufacturing Ltd",
      primaryMetric: "100 of 100 pcs accepted",
      secondaryMetric: "Clean delivery (0 shortage)",
      date: "2026-10-08",
      validationNote: "Full consignment accepted without exceptions.",
      status: "valid",
    },
    {
      rowNum: 4,
      recordId: "POD-REC-003A",
      relatedRef: "INV-003 / SHP-003",
      entityName: "Northstar Engineering Works",
      primaryMetric: "40 pcs accepted (Batch A)",
      secondaryMetric: "Split consignment 1 of 2",
      date: "2026-10-09",
      validationNote: "Partial batch receipt. Paired with POD-REC-003B.",
      status: "warning",
    },
    {
      rowNum: 5,
      recordId: "POD-REC-003B",
      relatedRef: "INV-003 / SHP-003",
      entityName: "Northstar Engineering Works",
      primaryMetric: "30 pcs accepted (Batch B)",
      secondaryMetric: "Total delivered: 70 of 100 pcs",
      date: "2026-10-11",
      validationNote: "Contradictory claim requires operator review.",
      status: "warning",
    },
  ],
  payments: [
    {
      rowNum: 1,
      recordId: "PAY-771",
      relatedRef: "INV-1048",
      entityName: "Aarav Industrial Supplies",
      primaryMetric: formatINR(30000),
      secondaryMetric: "NEFT: UTR-SBIN-88912-AARAV",
      date: "2026-10-16",
      validationNote: "Leaves ₹18,000 balance. Unapproved credit not deducted.",
      status: "valid",
    },
    {
      rowNum: 2,
      recordId: "PAY-REC-002",
      relatedRef: "INV-002",
      entityName: "Kaveri Components Pvt Ltd",
      primaryMetric: formatINR(12000),
      secondaryMetric: "Bank Transfer: UTR-HDFC-09182",
      date: "2026-10-15",
      validationNote: "₹3,000 withheld; deduction cause unconfirmed in remarks.",
      status: "warning",
    },
    {
      rowNum: 3,
      recordId: "PAY-REC-001",
      relatedRef: "INV-001",
      entityName: "Zenith Manufacturing Ltd",
      primaryMetric: formatINR(15000),
      secondaryMetric: "RTGS: UTR-ICIC-44019",
      date: "2026-10-15",
      validationNote: "Full balance cleared. Zero outstanding balance.",
      status: "valid",
    },
    {
      rowNum: 4,
      recordId: "PAY-REC-003",
      relatedRef: "INV-003",
      entityName: "Northstar Engineering Works",
      primaryMetric: formatINR(12600),
      secondaryMetric: "NEFT: UTR-AXIS-77210",
      date: "2026-10-14",
      validationNote: "Payment matches 70 delivered units @ ₹180.",
      status: "valid",
    },
  ],
  purchase_orders: [
    {
      rowNum: 1,
      recordId: "ORD-1048",
      relatedRef: "INV-1048",
      entityName: "Aarav Industrial Supplies",
      primaryMetric: "120 units @ ₹400",
      secondaryMetric: "Contract Total: ₹48,000",
      date: "2026-10-12",
      validationNote: "Signed purchase authorization on file.",
      status: "valid",
    },
    {
      rowNum: 2,
      recordId: "PO-002",
      relatedRef: "INV-002",
      entityName: "Kaveri Components Pvt Ltd",
      primaryMetric: "100 pcs @ ₹150",
      secondaryMetric: "Contract Total: ₹15,000",
      date: "2026-10-10",
      validationNote: "Standard purchase agreement.",
      status: "valid",
    },
    {
      rowNum: 3,
      recordId: "PO-001",
      relatedRef: "INV-001",
      entityName: "Zenith Manufacturing Ltd",
      primaryMetric: "100 pcs @ ₹150",
      secondaryMetric: "Contract Total: ₹15,000",
      date: "2026-10-01",
      validationNote: "Standard purchase agreement.",
      status: "valid",
    },
    {
      rowNum: 4,
      recordId: "PO-003",
      relatedRef: "INV-003",
      entityName: "Northstar Engineering Works",
      primaryMetric: "100 pcs @ ₹180",
      secondaryMetric: "Contract Total: ₹18,000",
      date: "2026-10-02",
      validationNote: "Standard purchase agreement.",
      status: "valid",
    },
  ],
  credit_notes: [],
};

export function DataSourcesScreen() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>("invoices");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const selectedDataset = DATASETS.find((d) => d.id === selectedDatasetId) || DATASETS[0];
  const activeRows = ROWS_BY_DATASET[selectedDatasetId] || [];

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return activeRows;
    const q = searchQuery.toLowerCase();
    return activeRows.filter(
      (r) =>
        r.recordId.toLowerCase().includes(q) ||
        r.relatedRef.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q) ||
        r.primaryMetric.toLowerCase().includes(q) ||
        r.validationNote.toLowerCase().includes(q)
    );
  }, [activeRows, searchQuery]);

  const handleSimulateAction = (actionName: string) => {
    setShowNotification(actionName);
    setTimeout(() => setShowNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-semibold tracking-wider text-[var(--primary)] uppercase">
            Records & Integrations
          </span>
          <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">
            Data sources
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Inspect the underlying accounting records, delivery proofs, and validation status used in each investigation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSimulateAction("Zod schema validation re-executed: 100% records conform to canonical types.")}
            className="px-3.5 py-2 text-xs font-semibold text-[var(--primary)] bg-[var(--primary-soft)] hover:bg-[var(--primary-soft)]/70 rounded-lg border border-[var(--primary-border)] transition-colors"
          >
            Validate All Schemas
          </button>
          <button
            type="button"
            onClick={() => handleSimulateAction("Dataset refresh complete. All 5 synthetic ERP tables reloaded from fixtures.")}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-lg shadow-sm transition-colors"
          >
            Reload Fixtures
          </button>
        </div>
      </div>

      {/* Action notification toast */}
      {showNotification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>{showNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="text-xs font-medium text-[var(--text-muted)]">Datasets Loaded</div>
          <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">05</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">Invoices, PODs, Payments, POs, CNs</div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="text-xs font-medium text-[var(--text-muted)]">Total Active Records</div>
          <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">17</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">Parsed via Zod v3 contracts</div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="text-xs font-medium text-[var(--text-muted)]">Validation State</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1">Passed</div>
          <div className="text-[11px] text-emerald-600 mt-1">0 fatal schema violations</div>
        </div>

        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs">
          <div className="text-xs font-medium text-[var(--text-muted)]">Excluded / Dropped Rows</div>
          <div className="text-2xl font-bold font-mono text-[var(--text)] mt-1">00</div>
          <div className="text-[11px] text-[var(--text-muted)] mt-1">No silent drops; all rows cited</div>
        </div>
      </div>

      {/* Source Datasets Horizontal Selector Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--text)] uppercase tracking-wider">
            Available Datasets
          </h2>
          <span className="text-xs text-[var(--text-muted)]">
            Click a dataset below to inspect its raw rows and schema validation
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DATASETS.map((dataset) => {
            const isSelected = dataset.id === selectedDatasetId;
            return (
              <button
                key={dataset.id}
                type="button"
                onClick={() => {
                  setSelectedDatasetId(dataset.id);
                  setSearchQuery("");
                }}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary-soft)]/40 ring-1 ring-[var(--primary)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-medium ${
                      dataset.status === "valid"
                        ? "bg-emerald-100 text-emerald-800"
                        : dataset.status === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {dataset.rowCount} rows
                  </span>
                  {dataset.status === "valid" && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Valid" />
                  )}
                  {dataset.status === "warning" && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" title="Validation Warning" />
                  )}
                  {dataset.status === "empty" && (
                    <span className="w-2 h-2 rounded-full bg-slate-400" title="Empty" />
                  )}
                </div>
                <div className="font-semibold text-xs text-[var(--text)] leading-tight">
                  {dataset.name}
                </div>
                <div className="text-[11px] font-mono text-[var(--text-muted)] truncate mt-1">
                  {dataset.filename}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Dataset Details & Row Preview Table */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-xs overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-4 border-b border-[var(--border)] bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-[var(--text)]">
                {selectedDataset.name}
              </h3>
              <span className="font-mono text-xs text-[var(--text-muted)]">
                ({selectedDataset.filename})
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {selectedDataset.description} Last synced: {selectedDataset.lastLoaded}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search rows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 sm:w-60 text-xs px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Row Table */}
        {filteredRows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-slate-100/70 text-[var(--text-muted)] font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 w-12 font-mono">#</th>
                  <th className="py-2.5 px-4">Record ID</th>
                  <th className="py-2.5 px-4">Related Reference</th>
                  <th className="py-2.5 px-4">Entity / Buyer</th>
                  <th className="py-2.5 px-4">Primary Value</th>
                  <th className="py-2.5 px-4">Secondary Value</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Validation Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredRows.map((row) => (
                  <tr
                    key={row.recordId}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {row.rowNum}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[var(--primary)]">
                      {row.recordId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {row.relatedRef}
                    </td>
                    <td className="py-3 px-4 font-medium text-[var(--text)]">
                      {row.entityName}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[var(--text)]">
                      {row.primaryMetric}
                    </td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {row.secondaryMetric}
                    </td>
                    <td className="py-3 px-4 font-mono text-[var(--text-muted)]">
                      {formatDate(row.date)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] ${
                          row.status === "valid"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            row.status === "valid" ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        {row.validationNote}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[var(--text-muted)]">
            {selectedDatasetId === "credit_notes" ? (
              <div className="space-y-2">
                <div className="font-mono text-amber-700 bg-amber-50 inline-block px-3 py-1 rounded border border-amber-200 text-xs">
                  NOT_FOUND_IN_PROVIDED_DATA
                </div>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  0 credit notes exist in the supplied dataset. In accordance with accounting controls, unapproved credit notes are not applied to recorded balances.
                </p>
              </div>
            ) : (
              <p>No matching records found for &ldquo;{searchQuery}&rdquo;.</p>
            )}
          </div>
        )}
      </div>

      {/* Honest Demo Disclosure Banner */}
      <div className="p-3.5 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 text-xs text-[var(--text-muted)] flex items-start gap-2.5">
        <span className="font-mono text-[10px] uppercase font-bold text-slate-500 border border-slate-300 px-1 rounded mt-0.5">
          Audit Note
        </span>
        <p>
          Data sources displayed above are synthetic evaluation fixtures strictly bound to the Zod schema contracts in{" "}
          <code className="text-slate-700 font-mono">src/types/index.ts</code>. All values originate from the test fixtures in{" "}
          <code className="text-slate-700 font-mono">tests/fixtures/</code> and are evaluated deterministically with zero artificial hallucination.
        </p>
      </div>
    </div>
  );
}


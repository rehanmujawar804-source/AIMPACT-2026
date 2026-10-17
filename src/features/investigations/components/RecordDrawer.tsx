"use client";

import React, { useEffect } from "react";
import { formatINR, formatDate } from "../lib/formatters";

export interface RecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  recordId: string | null;
  sourceRecords: {
    purchase_orders?: Array<Record<string, unknown>>;
    invoices?: Array<Record<string, unknown>>;
    dispatches?: Array<Record<string, unknown>>;
    deliveries?: Array<Record<string, unknown>>;
    receipts?: Array<Record<string, unknown>>;
    payments?: Array<Record<string, unknown>>;
    credit_notes?: Array<Record<string, unknown>>;
    imported?: Array<Record<string, unknown>>;
  };
}

export function RecordDrawer({
  isOpen,
  onClose,
  recordId,
  sourceRecords,
}: RecordDrawerProps) {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !recordId) {
    return null;
  }

  // Look up record across all collections
  let matchedRecord: Record<string, unknown> | null = null;
  let recordType: string = "Unknown Document";

  if (sourceRecords.purchase_orders) {
    const found = sourceRecords.purchase_orders.find(
      (r) => r.record_id === recordId || r.po_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Purchase Order";
    }
  }

  if (!matchedRecord && sourceRecords.invoices) {
    const found = sourceRecords.invoices.find(
      (r) => r.record_id === recordId || r.invoice_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Commercial Tax Invoice";
    }
  }

  if (!matchedRecord && sourceRecords.dispatches) {
    const found = sourceRecords.dispatches.find(
      (r) => r.record_id === recordId || r.shipment_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Dispatch / Carrier Note";
    }
  }

  if (!matchedRecord && (sourceRecords.deliveries || sourceRecords.receipts)) {
    const list = sourceRecords.deliveries || sourceRecords.receipts;
    const found = list?.find(
      (r) => r.record_id === recordId || r.delivery_id === recordId || r.shipment_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Proof of Delivery / Consignment Receipt";
    }
  }

  if (!matchedRecord && sourceRecords.payments) {
    const found = sourceRecords.payments.find(
      (r) => r.record_id === recordId || r.payment_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Bank Payment Receipt";
    }
  }

  if (!matchedRecord && sourceRecords.credit_notes) {
    const found = sourceRecords.credit_notes.find(
      (r) => r.record_id === recordId || r.credit_note_id === recordId
    );
    if (found) {
      matchedRecord = found;
      recordType = "Credit Note";
    }
  }

  if (!matchedRecord && sourceRecords.imported) {
    const found = sourceRecords.imported.find((r) => r.record_id === recordId);
    if (found) {
      matchedRecord = found;
      const cat = String(found.category || "");
      if (cat.includes("order")) recordType = "Purchase Order (Imported)";
      else if (cat.includes("invoice")) recordType = "Commercial Invoice (Imported)";
      else if (cat.includes("dispatch")) recordType = "Dispatch Note (Imported)";
      else if (cat.includes("receipt") || cat.includes("delivery")) recordType = "Proof of Delivery (Imported)";
      else if (cat.includes("payment")) recordType = "Bank Payment (Imported)";
      else if (cat.includes("credit")) recordType = "Credit Note (Imported)";
      else recordType = "Imported Commercial Record";
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      aria-labelledby="record-drawer-title"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wider">
                  Source Document Inspection
                </span>
              </div>
              <h2
                id="record-drawer-title"
                className="text-lg font-bold text-[var(--text)] mt-1 font-mono"
              >
                {recordId}
              </h2>
              <span className="inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {recordType}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
              aria-label="Close document drawer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {matchedRecord ? (
              <div>
                <p className="text-xs text-[var(--text-secondary)] mb-4">
                  Raw attributes verified in the commercial dataset for citation tracking:
                </p>

                <dl className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] overflow-hidden">
                  {Object.entries(matchedRecord).map(([key, value]) => {
                    let displayValue = String(value);

                    // Formatted numbers & dates
                    if (key.includes("amount") || key.includes("price")) {
                      displayValue = formatINR(Number(value));
                    } else if (key.includes("date")) {
                      displayValue = formatDate(String(value));
                    }

                    return (
                      <div
                        key={key}
                        className="p-3 bg-white hover:bg-slate-50 flex items-start justify-between text-xs gap-3"
                      >
                        <dt className="font-mono text-[var(--text-muted)] capitalize">
                          {key.replace(/_/g, " ")}:
                        </dt>
                        <dd className="font-mono font-medium text-[var(--text)] text-right break-all">
                          {displayValue}
                        </dd>
                      </div>
                    );
                  })}
                </dl>

                {/* Milestone 3 Safeguards: Specific Category & Provenance Notices */}
                {recordType.includes("Dispatch") && (
                  <div className="mt-4 p-3.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-900 space-y-1 text-xs">
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-blue-900">
                      <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Dispatch Record Notice
                    </span>
                    <p className="text-[11px] text-blue-800 leading-relaxed">
                      This record documents supplier carrier dispatch. Under ProofTrail audit principles, a dispatch record does NOT constitute proof of delivery (POD) or receipt acceptance by the buyer.
                    </p>
                  </div>
                )}

                {recordType.includes("Credit Note") && (
                  <div className="mt-4 p-3.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 space-y-1 text-xs">
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-amber-900">
                      <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      Credit Note Notice
                    </span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      In accordance with ProofTrail reconciliation rules, an unapproved credit note request is not deducted from authoritative balances until formal credit authorization is confirmed.
                    </p>
                  </div>
                )}

                {matchedRecord.provenance === "imported_local" && (
                  <div className="mt-4 p-3.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-900 space-y-1 text-xs">
                    <span className="font-semibold text-xs flex items-center gap-1.5 text-indigo-900">
                      <svg className="w-4 h-4 text-indigo-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Imported Evidence · Structurally Valid
                    </span>
                    <p className="text-[11px] text-indigo-800 leading-relaxed">
                      This record passed local schema validation. Structural validity establishes correct formatting, not verified proof of external claims or dispute resolution.
                    </p>
                  </div>
                )}

                <div className="mt-4 p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] space-y-2 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--text)] block uppercase tracking-wider text-[10px]">
                    Traceability Note
                  </span>
                  <p>
                    {matchedRecord.provenance === "imported_local"
                      ? "Loaded from local user-imported file. Its record identifier is tracked in the Evidence Inventory."
                      : "This record was loaded directly from the validated commercial dataset. Its record identifier is referenced as mathematical proof for the corresponding finding."}
                  </p>
                </div>
              </div>
            ) : (
              /* Safe handling for missing/unfound record IDs */
              <div className="p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 space-y-2">
                <div className="flex items-center gap-2 font-semibold text-xs">
                  <svg className="w-4 h-4 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Record Absent from Provided Dataset</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  The cited record ID <code className="font-mono font-bold">{recordId}</code> could not be found among the
                  currently uploaded invoice, delivery, or payment records.
                </p>
                <p className="text-[11px] text-amber-700 italic pt-1">
                  In accordance with ProofTrail evidence rules, this absence indicates missing documentation
                  (<code>NOT_FOUND_IN_PROVIDED_DATA</code>), not proof that the document does not exist in reality.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              ProofTrail · Inspection Desk
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-xs font-medium text-slate-800 transition-colors"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

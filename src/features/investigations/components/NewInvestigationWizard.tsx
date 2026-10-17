"use client";

import React, { useState } from "react";
import { formatINR } from "../lib/formatters";
import { SYNTHETIC_CASES, CaseData } from "../lib/caseRegistry";

export interface NewInvestigationWizardProps {
  onComplete: (caseId: string) => void;
  onCancel: () => void;
}

export function NewInvestigationWizard({
  onComplete,
  onCancel,
}: NewInvestigationWizardProps) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [selectedCaseTemplate, setSelectedCaseTemplate] = useState<CaseData>(SYNTHETIC_CASES[0]);

  // Step 1: Records loaded state
  const [hasLoadedRecords, setHasLoadedRecords] = useState(true);

  // Step 2: Dispute form inputs
  const [buyerMessage, setBuyerMessage] = useState(
    selectedCaseTemplate.dispute.message
  );
  const [invoiceId, setInvoiceId] = useState(selectedCaseTemplate.invoiceId);
  const [shipmentId, setShipmentId] = useState(
    selectedCaseTemplate.dispute.shipment_id || "DEL-209"
  );
  const [disputeDate, setDisputeDate] = useState("2026-10-17");
  const [stepError, setStepError] = useState("");

  // Step 3: Running progress state
  const [isRunning, setIsRunning] = useState(false);
  const [progressStep, setProgressStep] = useState(0);

  const handleTemplateChange = (caseId: string) => {
    const found = SYNTHETIC_CASES.find((c) => c.caseId === caseId) || SYNTHETIC_CASES[0];
    setSelectedCaseTemplate(found);
    setBuyerMessage(found.dispute.message);
    setInvoiceId(found.invoiceId);
    setShipmentId(found.dispute.shipment_id || "DEL-209");
  };

  const handleNextStep1 = () => {
    if (!hasLoadedRecords) {
      setStepError("Please load records before proceeding.");
      return;
    }
    setStepError("");
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    if (!buyerMessage.trim()) {
      setStepError("Buyer's dispute message is required.");
      return;
    }
    if (!invoiceId.trim()) {
      setStepError("Invoice reference is required.");
      return;
    }
    setStepError("");
    setCurrentStep(3);
  };

  const handleRunInvestigation = () => {
    setIsRunning(true);
    setProgressStep(1);

    // Step-by-step progress simulation (finishes promptly in ~1.5s as requested by spec)
    setTimeout(() => setProgressStep(2), 350);
    setTimeout(() => setProgressStep(3), 700);
    setTimeout(() => setProgressStep(4), 1050);
    setTimeout(() => {
      setProgressStep(5);
      setTimeout(() => {
        onComplete(selectedCaseTemplate.caseId);
      }, 400);
    }, 1400);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header with 3-Step Progress Indicator */}
      <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--border)]">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
              NEW INVESTIGATION
            </span>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)] mt-0.5">
              Create Commercial Dispute Investigation
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[var(--text-muted)] hover:text-slate-800 transition-colors"
          >
            Cancel & Exit
          </button>
        </div>

        {/* Stepper Tabs */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-5">
          {/* Step 1 */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ${
              currentStep === 1
                ? "bg-blue-50 border-blue-200 text-[var(--primary)] font-semibold"
                : currentStep > 1
                ? "bg-[var(--success-soft)] border-green-200 text-[var(--success)]"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 1
                  ? "bg-[var(--primary)] text-white"
                  : currentStep > 1
                  ? "bg-[var(--success)] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 1 ? "✓" : "1"}
            </span>
            <div>
              <span className="block text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-normal">
                Step 1
              </span>
              <span>Add Records</span>
            </div>
          </div>

          {/* Step 2 */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ${
              currentStep === 2
                ? "bg-blue-50 border-blue-200 text-[var(--primary)] font-semibold"
                : currentStep > 2
                ? "bg-[var(--success-soft)] border-green-200 text-[var(--success)]"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 2
                  ? "bg-[var(--primary)] text-white"
                  : currentStep > 2
                  ? "bg-[var(--success)] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {currentStep > 2 ? "✓" : "2"}
            </span>
            <div>
              <span className="block text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-normal">
                Step 2
              </span>
              <span>Describe Claim</span>
            </div>
          </div>

          {/* Step 3 */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg border text-xs transition-colors ${
              currentStep === 3
                ? "bg-blue-50 border-blue-200 text-[var(--primary)] font-semibold"
                : "bg-slate-50 border-slate-200 text-slate-400"
            }`}
          >
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                currentStep === 3
                  ? "bg-[var(--primary)] text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              3
            </span>
            <div>
              <span className="block text-[11px] text-[var(--text-muted)] uppercase tracking-wider font-normal">
                Step 3
              </span>
              <span>Review & Run</span>
            </div>
          </div>
        </div>
      </div>

      {stepError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{stepError}</span>
        </div>
      )}

      {/* STEP 1: ADD RECORDS */}
      {currentStep === 1 && (
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-[var(--text)]">
                1. Upload or Select Commercial Records
              </h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Load invoices, purchase orders, delivery receipts, and payment records into the investigation sandbox.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setHasLoadedRecords(true);
                setStepError("");
              }}
              className="px-3.5 py-1.5 rounded-lg bg-[var(--primary-soft)] text-[var(--primary)] border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors"
            >
              ✓ Use Demo Benchmark Dataset
            </button>
          </div>

          {/* Quick Case Template Pre-select */}
          <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)] space-y-2">
            <label htmlFor="wizard-case-template-select" className="text-xs font-medium text-[var(--text)] block">
              Pre-load Case Scenario:
            </label>
            <select
              id="wizard-case-template-select"
              value={selectedCaseTemplate.caseId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-[var(--border-strong)] bg-white text-xs text-[var(--text)] font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
            >
              {SYNTHETIC_CASES.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.invoiceId} — {c.buyerName} ({c.disputeType})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[var(--text-muted)] italic">
              Pre-loads verified transaction records for this scenario to avoid manual CSV upload.
            </p>
          </div>

          {/* File Rows Preview Table */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Loaded Datasets & Schema Status
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-[var(--border)] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-blue-600 font-bold">📄 invoices.csv</span>
                  <span className="text-[11px] text-slate-500">100 rows</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Schema Valid
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-blue-600 font-bold">📄 deliveries.csv</span>
                  <span className="text-[11px] text-slate-500">80 rows</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Schema Valid
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-blue-600 font-bold">📄 payments.csv</span>
                  <span className="text-[11px] text-slate-500">45 rows</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Schema Valid
                </span>
              </div>

              <div className="p-3 rounded-lg border border-[var(--border)] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-blue-600 font-bold">📄 orders.csv</span>
                  <span className="text-[11px] text-slate-500">100 rows</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Schema Valid
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNextStep1}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
            >
              Continue to Describe Dispute →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DESCRIBE DISPUTE */}
      {currentStep === 2 && (
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">
              2. Describe the Buyer Dispute
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Enter the buyer&apos;s complaint verbatim. The system will match it against candidate invoices.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Form Column */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <label htmlFor="wizard-buyer-msg-input" className="block font-medium text-[var(--text)] mb-1">
                  Buyer Dispute Message (Verbatim Text) <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="wizard-buyer-msg-input"
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  rows={4}
                  className="w-full p-2.5 rounded-lg border border-[var(--border-strong)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 font-sans"
                  placeholder="e.g. We received only 110 units instead of 120. Please issue a credit note for the missing 10 units."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="wizard-invoice-ref-input" className="block font-medium text-[var(--text)] mb-1">
                    Invoice Reference <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="wizard-invoice-ref-input"
                    type="text"
                    value={invoiceId}
                    onChange={(e) => setInvoiceId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-strong)] font-mono text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                    placeholder="e.g. INV-1048"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-shipment-ref-input" className="block font-medium text-[var(--text)] mb-1">
                    Shipment / Delivery Ref
                  </label>
                  <input
                    id="wizard-shipment-ref-input"
                    type="text"
                    value={shipmentId}
                    onChange={(e) => setShipmentId(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[var(--border-strong)] font-mono text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                    placeholder="e.g. DEL-209"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="wizard-dispute-date-input" className="block font-medium text-[var(--text)] mb-1">
                  Dispute Received Date
                </label>
                <input
                  id="wizard-dispute-date-input"
                  type="date"
                  value={disputeDate}
                  onChange={(e) => setDisputeDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-[var(--border-strong)] font-mono text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                />
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-[var(--text-secondary)]">
                <strong>Privacy Notice:</strong> Use synthetic data only for this demo. Never upload confidential customer financial data.
              </div>
            </div>

            {/* Candidate Matching Preview Column */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Candidate Invoice Match
              </h4>

              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-[var(--primary)]">
                    {invoiceId || selectedCaseTemplate.invoiceId}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-mono font-semibold">
                    100% ID Match
                  </span>
                </div>

                <div className="space-y-1 text-slate-700">
                  <p><strong>Buyer:</strong> {selectedCaseTemplate.buyerName}</p>
                  <p><strong>Invoice Total:</strong> {formatINR(selectedCaseTemplate.reconciliation.invoice_amount)}</p>
                  <p><strong>Payments:</strong> {formatINR(selectedCaseTemplate.reconciliation.recorded_payments)}</p>
                  <p><strong>Recorded Balance:</strong> {formatINR(selectedCaseTemplate.recordedBalance)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50"
            >
              ← Back to Records
            </button>
            <button
              type="button"
              onClick={handleNextStep2}
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
            >
              Review Investigation →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW AND RUN */}
      {currentStep === 3 && (
        <div className="bg-[var(--surface)] p-6 rounded-xl border border-[var(--border)] shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-semibold text-[var(--text)]">
              3. Review & Run Investigation
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verify preflight parameters before executing deterministic rules and evidence correlation.
            </p>
          </div>

          {/* Preflight Summary Card */}
          <div className="p-5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">Target Invoice</span>
                <span className="font-mono font-bold text-sm text-[var(--primary)] mt-1 block">
                  {invoiceId}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">Buyer Counterparty</span>
                <span className="font-semibold text-slate-800 mt-1 block">
                  {selectedCaseTemplate.buyerName}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">Invoice Amount</span>
                <span className="font-mono font-bold text-slate-800 mt-1 block">
                  {formatINR(selectedCaseTemplate.reconciliation.invoice_amount)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">Recorded Payments</span>
                <span className="font-mono font-bold text-emerald-700 mt-1 block">
                  {formatINR(selectedCaseTemplate.reconciliation.recorded_payments)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block mb-1">
                Parsed Dispute Statement
              </span>
              <p className="italic text-slate-700 bg-white p-3 rounded-lg border border-[var(--border)]">
                &ldquo;{buyerMessage}&rdquo;
              </p>
            </div>
          </div>

          {/* Execution Progress Stepper */}
          {isRunning ? (
            <div className="p-6 rounded-xl border border-blue-200 bg-blue-50/50 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-ping" />
                Executing Deterministic Investigation Pipeline...
              </h4>

              <div className="space-y-2 text-xs">
                <div className={`flex items-center gap-2 ${progressStep >= 1 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span>{progressStep >= 1 ? "✓" : "○"}</span>
                  <span>1. Validating records against canonical schemas</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 2 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span>{progressStep >= 2 ? "✓" : "○"}</span>
                  <span>2. Reconciling financial amounts and unit compatibility</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 3 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span>{progressStep >= 3 ? "✓" : "○"}</span>
                  <span>3. Correlating buyer claim against signed proof of delivery</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 4 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span>{progressStep >= 4 ? "✓" : "○"}</span>
                  <span>4. Assembling source-linked findings and limitations</span>
                </div>
                <div className={`flex items-center gap-2 ${progressStep >= 5 ? "text-emerald-700 font-medium" : "text-slate-400"}`}>
                  <span>{progressStep >= 5 ? "✓" : "○"}</span>
                  <span>5. Preparing forensic evidence brief</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleRunInvestigation}
                className="px-5 py-2.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
              >
                Run Investigation →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


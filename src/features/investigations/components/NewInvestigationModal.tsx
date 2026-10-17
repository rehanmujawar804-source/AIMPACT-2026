"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatINR, formatDate } from "../lib/formatters";

export interface NewInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDispute?: (message: string) => void;
  defaultMessage: string;
  invoiceId: string;
  buyerName: string;
  sourceRecords: {
    invoices?: Array<Record<string, unknown>>;
    deliveries?: Array<Record<string, unknown>>;
    payments?: Array<Record<string, unknown>>;
    credit_notes?: Array<Record<string, unknown>>;
  };
}

type ModalWorkflowStep = "setup" | "preflight" | "running";

const STEPPER_STAGES = [
  {
    id: 1,
    title: "Validating records",
    detail: "Checking schemas, quantities, and record identifiers across supplied files",
  },
  {
    id: 2,
    title: "Reconciling amounts",
    detail: "Verifying commercial invoice values, ledger payments, and credit notes",
  },
  {
    id: 3,
    title: "Interpreting the claim",
    detail: "Extracting claimed shortage, item references, and dispute parameters",
  },
  {
    id: 4,
    title: "Linking evidence",
    detail: "Correlating delivery receipt DEL-209 with invoice INV-1048",
  },
  {
    id: 5,
    title: "Preparing the investigation brief",
    detail: "Assembling deterministic calculations, source citations, and next steps",
  },
];

export function NewInvestigationModal({
  isOpen,
  onClose,
  onApplyDispute,
  defaultMessage,
  invoiceId,
  buyerName,
  sourceRecords,
}: NewInvestigationModalProps) {
  // Modal internal workflow state
  const [currentStep, setCurrentStep] = useState<ModalWorkflowStep>("setup");
  const [draftMessage, setDraftMessage] = useState(defaultMessage);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Stepper progress state
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isSimulationComplete, setIsSimulationComplete] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync draft message when defaultMessage changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setDraftMessage(defaultMessage);
      setCurrentStep("setup");
      setValidationError(null);
      setActiveStageIndex(0);
      setIsSimulationComplete(false);
    }
  }, [isOpen, defaultMessage]);

  // Clean up any running timer on unmount or close
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        // If simulation is actively running (not complete), prevent accidental close
        if (currentStep === "running" && !isSimulationComplete) {
          return;
        }
        handleModalClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentStep, isSimulationComplete]);

  // Focus textarea when entering setup step
  useEffect(() => {
    if (isOpen && currentStep === "setup") {
      textareaRef.current?.focus();
    }
  }, [isOpen, currentStep]);

  if (!isOpen) {
    return null;
  }

  const handleModalClose = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setValidationError(null);
    setCurrentStep("setup");
    onClose();
  };

  // Step 1: Proceed to Preflight
  const handleProceedToPreflight = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = draftMessage.trim();
    if (!trimmed) {
      setValidationError("Dispute message cannot be empty. Please enter the buyer's claim statement.");
      textareaRef.current?.focus();
      return;
    }
    setValidationError(null);
    setCurrentStep("preflight");
  };

  // Step 2 -> Step 3: Run Simulated Investigation
  const handleStartInvestigation = () => {
    setCurrentStep("running");
    setActiveStageIndex(0);
    setIsSimulationComplete(false);

    // Sequence stages smoothly at ~350ms per step
    const runNextStage = (stageIdx: number) => {
      if (stageIdx < STEPPER_STAGES.length - 1) {
        timerRef.current = setTimeout(() => {
          setActiveStageIndex(stageIdx + 1);
          runNextStage(stageIdx + 1);
        }, 360);
      } else {
        timerRef.current = setTimeout(() => {
          setIsSimulationComplete(true);
        }, 400);
      }
    };

    runNextStage(0);
  };

  // Step 3 Completion: Apply edits & view desk
  const handleFinishAndOpenDesk = () => {
    if (onApplyDispute && draftMessage.trim()) {
      onApplyDispute(draftMessage.trim());
    }
    handleModalClose();
  };

  // Count available evidence records
  const invoiceCount = sourceRecords.invoices?.length || 0;
  const deliveryCount = sourceRecords.deliveries?.length || 0;
  const paymentCount = sourceRecords.payments?.length || 0;
  const creditNoteCount = sourceRecords.credit_notes?.length || 0;
  const totalRecordsCount = invoiceCount + deliveryCount + paymentCount + creditNoteCount;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-investigation-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (currentStep !== "running" || isSimulationComplete) {
            handleModalClose();
          }
        }}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden flex flex-col z-10 transition-all max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--surface-muted)] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs shadow-xs">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h2
                id="new-investigation-title"
                className="text-base font-bold text-[var(--text)] tracking-tight"
              >
                {currentStep === "setup" && "New Dispute Investigation"}
                {currentStep === "preflight" && "Preflight Investigation Review"}
                {currentStep === "running" && (isSimulationComplete ? "Investigation Brief Assembled" : "Analyzing Dispute Evidence")}
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                {currentStep === "setup" && "Provide dispute claim details and review available evidence records."}
                {currentStep === "preflight" && "Verify evidence scope and dispute parameters before running deterministic rules."}
                {currentStep === "running" && (isSimulationComplete ? "Review completed verification and return to the investigation workspace." : "Executing deterministic reconciliation and record linkage pipeline.")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            disabled={currentStep === "running" && !isSimulationComplete}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-[var(--text)]">
          {/* ============================================================== */}
          {/* STAGE 1: SETUP FORM                                            */}
          {/* ============================================================== */}
          {currentStep === "setup" && (
            <form onSubmit={handleProceedToPreflight} className="space-y-5">
              {/* Transaction Reference Card (Read-only in M1) */}
              <div className="p-3.5 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                    Target Commercial Transaction
                  </span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                    Case Scope: INV-1048
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Disputed Invoice:</span>
                    <span className="font-mono font-bold text-sm text-[var(--text)]">{invoiceId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Buyer Counterparty:</span>
                    <span className="font-semibold text-sm text-[var(--text)]">{buyerName}</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] italic pt-1 border-t border-[var(--border)]">
                  • In Milestone 1, transaction scope is tied to benchmark case {invoiceId}. (Multi-case selection will be enabled in M2).
                </p>
              </div>

              {/* Dispute Message Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="dispute-message-input" className="font-semibold text-[var(--text)]">
                    Buyer&apos;s Dispute Claim (Verbatim Statement) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    {draftMessage.length} characters
                  </span>
                </div>
                <p className="text-[11px] text-[var(--text-secondary)]">
                  Enter or edit the customer&apos;s complaint. ProofTrail preserves the original text verbatim without automated paraphrasing.
                </p>
                <textarea
                  id="dispute-message-input"
                  ref={textareaRef}
                  value={draftMessage}
                  onChange={(e) => {
                    setDraftMessage(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  rows={4}
                  className={`w-full rounded-xl border p-3 text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] transition-all font-sans leading-relaxed ${
                    validationError
                      ? "border-rose-400 bg-rose-50/30"
                      : "border-[var(--border-strong)] bg-white"
                  }`}
                  placeholder="e.g., We received only 110 units instead of 120 invoiced on INV-1048..."
                  required
                />
                {validationError && (
                  <p className="text-rose-600 font-medium text-[11px] flex items-center gap-1 mt-1">
                    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span>{validationError}</span>
                  </p>
                )}
              </div>

              {/* Read-Only Commercial Evidence Summary */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text)]">
                    Available Evidence Records ({totalRecordsCount} Loaded)
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] font-mono">
                    Pre-loaded Dataset
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-lg border border-[var(--border)] bg-white text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Invoices</span>
                    <span className="font-mono font-bold text-sm text-[var(--primary)]">{invoiceCount}</span>
                    <span className="text-[10px] text-slate-400 block truncate">INV-1048</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[var(--border)] bg-white text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Deliveries</span>
                    <span className="font-mono font-bold text-sm text-[var(--primary)]">{deliveryCount}</span>
                    <span className="text-[10px] text-slate-400 block truncate">DEL-209</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-[var(--border)] bg-white text-center">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">Payments</span>
                    <span className="font-mono font-bold text-sm text-[var(--success)]">{paymentCount}</span>
                    <span className="text-[10px] text-slate-400 block truncate">PAY-771</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/60 text-center">
                    <span className="text-[10px] text-amber-800 uppercase tracking-wider block">Credit Notes</span>
                    <span className="font-mono font-bold text-sm text-amber-800">0</span>
                    <span className="text-[10px] text-amber-600 italic block">None Found</span>
                  </div>
                </div>
                <p className="text-[11px] text-[var(--text-muted)] italic">
                  • File uploads and CSV drag-and-drop will be integrated in subsequent roadmap milestones.
                </p>
              </div>

              {/* Setup Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <span>Continue to Preflight Review</span>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </form>
          )}

          {/* ============================================================== */}
          {/* STAGE 2: PREFLIGHT REVIEW                                      */}
          {/* ============================================================== */}
          {currentStep === "preflight" && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <span className="font-semibold text-xs text-[var(--text)]">Preflight Verification Checklist</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-100 text-blue-800 font-medium">
                    Ready to Analyze
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">Invoice:</span>
                    <span className="font-mono font-bold text-[var(--text)]">{invoiceId} ({buyerName})</span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">Total Billed:</span>
                    <span className="font-mono font-semibold text-[var(--text)]">₹48,000.00 (120 units @ ₹400)</span>
                  </div>
                  <div className="flex items-start justify-between text-xs">
                    <span className="text-[var(--text-secondary)] font-medium">Recorded Evidence:</span>
                    <span className="font-mono text-slate-700">1 Invoice, 1 Delivery Receipt, 1 Payment</span>
                  </div>
                </div>

                {/* Dispute Quote Preview */}
                <div className="pt-2 border-t border-[var(--border)] space-y-1">
                  <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider block">
                    Dispute Statement for Claim Extraction:
                  </span>
                  <blockquote className="p-2.5 rounded-lg bg-white border border-slate-200 text-xs italic text-[var(--text)] leading-relaxed">
                    &ldquo;{draftMessage}&rdquo;
                  </blockquote>
                </div>
              </div>

              {/* Data Quality & Evidence Scope Alert */}
              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 space-y-1 text-amber-900">
                <div className="flex items-center gap-1.5 font-semibold text-xs">
                  <svg className="w-4 h-4 text-amber-700 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>Evidence Limitation Notice</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  0 credit note records found in the current dataset. In accordance with ProofTrail audit rules, any unapproved requested credit will remain isolated and will <strong>NOT</strong> be deducted from the recorded balance.
                </p>
              </div>

              {/* Preflight Footer Actions */}
              <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep("setup")}
                  className="px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50 transition-colors flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Back to Edit</span>
                </button>
                <button
                  type="button"
                  onClick={handleStartInvestigation}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Run Investigation</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STAGE 3: SIMULATED PROGRESS STEPPER & COMPLETION               */}
          {/* ============================================================== */}
          {currentStep === "running" && (
            <div className="space-y-5 py-2">
              {/* Stepper Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <span className="text-[var(--text-secondary)] font-medium">
                    {isSimulationComplete ? "Verification Pipeline Complete" : `Step ${activeStageIndex + 1} of ${STEPPER_STAGES.length}`}
                  </span>
                  <span className="text-[var(--primary)] font-bold">
                    {isSimulationComplete ? "100%" : `${Math.round(((activeStageIndex + 1) / STEPPER_STAGES.length) * 100)}%`}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                  <div
                    className="h-full bg-[var(--primary)] transition-all duration-300 ease-out rounded-full"
                    style={{
                      width: isSimulationComplete
                        ? "100%"
                        : `${((activeStageIndex + 1) / STEPPER_STAGES.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* 5-Step Stage Progression List */}
              <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-xl overflow-hidden bg-white shadow-xs">
                {STEPPER_STAGES.map((stage, idx) => {
                  const isFinished = isSimulationComplete || idx < activeStageIndex;
                  const isActive = !isSimulationComplete && idx === activeStageIndex;
                  const isPending = !isSimulationComplete && idx > activeStageIndex;

                  return (
                    <div
                      key={stage.id}
                      className={`p-3.5 flex items-start gap-3 transition-colors ${
                        isActive
                          ? "bg-[var(--primary-soft)]/40 border-l-4 border-l-[var(--primary)]"
                          : isFinished
                          ? "bg-white"
                          : "bg-slate-50/50 opacity-60"
                      }`}
                    >
                      {/* Icon Indicator */}
                      <div className="mt-0.5 flex-shrink-0">
                        {isFinished && (
                          <div className="w-5 h-5 rounded-full bg-[var(--success-soft)] text-[var(--success)] flex items-center justify-center font-bold text-xs border border-green-200">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                        {isActive && (
                          <div className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center font-bold text-xs shadow-xs animate-pulse">
                            <span className="w-2 h-2 rounded-full bg-white" />
                          </div>
                        )}
                        {isPending && (
                          <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-mono text-[10px]">
                            {stage.id}
                          </div>
                        )}
                      </div>

                      {/* Text Description */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs font-semibold ${
                              isActive
                                ? "text-[var(--primary)]"
                                : isFinished
                                ? "text-[var(--text)]"
                                : "text-slate-500"
                            }`}
                          >
                            {stage.title}
                          </p>
                          {isActive && (
                            <span className="text-[10px] font-mono font-medium text-[var(--primary)] px-2 py-0.5 rounded bg-blue-100/70">
                              Running...
                            </span>
                          )}
                          {isFinished && (
                            <span className="text-[10px] font-mono font-medium text-[var(--success)]">
                              Verified
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 leading-tight">
                          {stage.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Completion Banner & Data-Integrity Honest Disclosure */}
              {isSimulationComplete && (
                <div className="space-y-3 pt-1 animate-fade-in">
                  <div className="p-4 rounded-xl border border-green-200 bg-[var(--success-soft)]/70 text-green-950 space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      <svg className="w-4 h-4 text-[var(--success)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Verification Sequence Successfully Completed</span>
                    </div>
                    <p className="text-[11px] text-green-900 leading-relaxed">
                      All deterministic checks have passed against commercial records for <strong>{invoiceId}</strong>. Quantities, amounts, and source record citations are formatted and ready for inspection.
                    </p>
                  </div>

                  {/* CRITICAL DATA-INTEGRITY RULE: Honest Frontend Simulation Notice */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Evidence Discipline Notice
                    </span>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      This sequence was simulated in local frontend state. Your edited claim text will update the inspection desk view. In accordance with ProofTrail audit rules, static findings will be computed by live backend route handlers in Phase 3.
                    </p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep("setup");
                        setIsSimulationComplete(false);
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-100 transition-colors"
                    >
                      Re-run Setup
                    </button>
                    <button
                      type="button"
                      onClick={handleFinishAndOpenDesk}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <span>View Investigation Desk</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

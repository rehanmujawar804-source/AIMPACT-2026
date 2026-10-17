"use client";

import React, { useState, useMemo } from "react";
import { type DisputeInput, type Finding } from "@/types";
import { SummaryStrip } from "./SummaryStrip";
import { ClaimCard } from "./ClaimCard";
import { FindingsList } from "./FindingsList";
import { RecordDrawer } from "./RecordDrawer";
import { ReconciliationTable } from "./ReconciliationTable";
import { NextSteps } from "./NextSteps";
import { Timeline } from "./Timeline";
import { formatDate, formatINR } from "../lib/formatters";
import { downloadEvidenceBrief } from "../lib/exportBrief";
import { SYNTHETIC_CASES, CaseData, getCaseById } from "../lib/caseRegistry";

export interface InvestigationDeskProps {
  initialCaseId?: string;
  onNavigate?: (screen: string) => void;
}

export function InvestigationDesk({
  initialCaseId = "PT-2026-004",
  onNavigate,
}: InvestigationDeskProps) {
  // Case selection state
  const [selectedCaseId, setSelectedCaseId] = useState(initialCaseId);
  const activeCase: CaseData = useMemo(() => {
    return getCaseById(selectedCaseId) || SYNTHETIC_CASES[0];
  }, [selectedCaseId]);

  // Working state for active dispute in current session
  const [dispute, setDispute] = useState<DisputeInput>(activeCase.dispute);

  // When switching cases, update dispute state
  React.useEffect(() => {
    setDispute(activeCase.dispute);
    setIsReviewed(activeCase.status === "Investigated" || activeCase.status === "Clean agreement");
  }, [activeCase]);

  // Human review state toggle
  const [isReviewed, setIsReviewed] = useState(false);

  // State for source record inspection drawer
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Notification message for actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive unique next verification steps from findings
  const nextSteps = useMemo(() => {
    const steps: string[] = [];
    activeCase.findings.forEach((f) => {
      if (f.next_step && !steps.includes(f.next_step)) {
        steps.push(f.next_step);
      }
    });
    return steps;
  }, [activeCase.findings]);

  // Handler to open document inspection drawer
  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDrawerOpen(true);
  };

  // Export Brief handler
  const handleExportBrief = () => {
    downloadEvidenceBrief({
      investigationId: activeCase.caseId,
      dispute,
      reconciliation: activeCase.reconciliation,
      findings: activeCase.findings,
      nextSteps,
    });
    showToast(`Evidence brief downloaded for ${activeCase.invoiceId}`);
  };

  // Review toggle handler
  const handleToggleReviewed = () => {
    const nextVal = !isReviewed;
    setIsReviewed(nextVal);
    showToast(nextVal ? "Investigation marked as reviewed by human operator" : "Investigation marked as pending review");
  };

  const reconciliation = activeCase.reconciliation;
  const sourceRecords = activeCase.sourceRecords;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg bg-slate-900 text-white text-xs shadow-lg flex items-center gap-2 border border-slate-700 animate-fade-in">
          <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Case Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("investigations")}
              className="hover:text-[var(--primary)] transition-colors"
            >
              Investigations
            </button>
            <span>/</span>
            <span className="font-mono text-slate-700 font-semibold">{activeCase.caseId}</span>
          </nav>

          <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
            Invoice Dispute Investigation
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            <span className="font-semibold text-slate-800">{reconciliation.invoice_id}</span> ·{" "}
            <span>{reconciliation.buyer_name}</span> · Opened {formatDate(activeCase.updatedDate)}
          </p>
        </div>

        {/* Case Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Case Selector Dropdown */}
          <div className="flex items-center gap-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg px-2.5 py-1 text-xs shadow-2xs">
            <label htmlFor="case-select-dropdown" className="text-[11px] font-medium text-[var(--text-muted)]">
              Switch Case:
            </label>
            <select
              id="case-select-dropdown"
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="bg-transparent font-medium text-[var(--text)] focus:outline-none cursor-pointer"
            >
              {SYNTHETIC_CASES.map((c) => (
                <option key={c.caseId} value={c.caseId}>
                  {c.invoiceId} — {c.buyerName} ({c.disputeType})
                </option>
              ))}
            </select>
          </div>

          {/* Status Badge */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
              isReviewed
                ? "bg-[var(--success-soft)] text-[var(--success)] border-green-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isReviewed ? "bg-[var(--success)]" : "bg-amber-500"}`}
              aria-hidden="true"
            />
            <span>{isReviewed ? "Reviewed & Confirmed" : "Needs Human Review"}</span>
          </span>

          {/* Mark Reviewed Button */}
          <button
            type="button"
            onClick={handleToggleReviewed}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors shadow-2xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 ${
              isReviewed
                ? "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                : "bg-white border-[var(--border-strong)] text-[var(--text)] hover:bg-slate-50"
            }`}
          >
            {isReviewed ? "Reopen Review" : "Mark Reviewed"}
          </button>

          {/* Export Brief Button */}
          <button
            type="button"
            onClick={handleExportBrief}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Full-Width Financial Summary Strip */}
      <SummaryStrip
        invoiceAmount={reconciliation.invoice_amount}
        recordedPayments={reconciliation.recorded_payments}
        recordedBalance={reconciliation.recorded_balance}
        invoiceId={reconciliation.invoice_id}
        buyerName={reconciliation.buyer_name}
      />

      {/* Two-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Evidence & Findings) ~ 58% Width */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Buyer's Claim Quote Card */}
          <ClaimCard
            dispute={dispute}
            disputedQuantity={reconciliation.disputed_quantity}
            onUpdateDispute={setDispute}
          />

          {/* 2. Structured Findings List */}
          <FindingsList
            findings={activeCase.findings}
            onSelectRecordId={handleSelectRecord}
          />

          {/* 3. Next Verification Steps Checklist */}
          <NextSteps steps={nextSteps} />
        </div>

        {/* Right Column (Ledger Reconciliation & Records Overview) ~ 42% Width */}
        <div className="lg:col-span-5 space-y-6">
          {/* Commercial Records Overview Card */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                Supplied Commercial Records
              </h3>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Click to inspect
              </span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">
              The investigation correlates the following verified documents from the supplier dataset:
            </p>

            <div className="space-y-2 pt-1">
              {/* Invoice Record Row */}
              {sourceRecords.invoices && sourceRecords.invoices.length > 0 ? (
                sourceRecords.invoices.map((inv) => (
                  <button
                    key={String(inv.record_id || inv.invoice_id)}
                    type="button"
                    onClick={() => handleSelectRecord(String(inv.record_id || inv.invoice_id))}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {String(inv.record_id || inv.invoice_id)}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Commercial Invoice ({formatDate(String(inv.date || inv.invoice_date))})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-[var(--text)]">
                      {formatINR(Number(inv.total_amount || inv.line_amount))}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 italic">
                  No invoice records in active set
                </div>
              )}

              {/* Delivery Receipt Row */}
              {sourceRecords.deliveries && sourceRecords.deliveries.length > 0 ? (
                sourceRecords.deliveries.map((del) => (
                  <button
                    key={String(del.record_id || del.delivery_id)}
                    type="button"
                    onClick={() => handleSelectRecord(String(del.record_id || del.delivery_id))}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {String(del.record_id || del.delivery_id)}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Proof of Delivery ({formatDate(String(del.date || del.delivery_date || del.receipt_date))})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-slate-700">
                      Accepted: {String(del.accepted_quantity ?? del.received_quantity ?? "")} units
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 flex items-center justify-between text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    Delivery Receipts
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 italic">
                    0 records (NOT_FOUND_IN_PROVIDED_DATA)
                  </span>
                </div>
              )}

              {/* Payment Record Row */}
              {sourceRecords.payments && sourceRecords.payments.length > 0 ? (
                sourceRecords.payments.map((pay) => (
                  <button
                    key={String(pay.record_id || pay.payment_id)}
                    type="button"
                    onClick={() => handleSelectRecord(String(pay.record_id || pay.payment_id))}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {String(pay.record_id || pay.payment_id)}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Bank Payment ({formatDate(String(pay.date || pay.payment_date))})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-[var(--success)]">
                      {formatINR(Number(pay.amount))}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-slate-300 text-xs text-slate-500 italic">
                  No payment records attached
                </div>
              )}

              {/* Credit Notes Row */}
              {sourceRecords.credit_notes && sourceRecords.credit_notes.length > 0 ? (
                sourceRecords.credit_notes.map((cn) => (
                  <button
                    key={String(cn.record_id || cn.credit_note_id)}
                    type="button"
                    onClick={() => handleSelectRecord(String(cn.record_id || cn.credit_note_id))}
                    className="w-full p-2.5 rounded-lg border border-purple-200 bg-purple-50/40 text-left text-xs flex items-center justify-between"
                  >
                    <span className="font-mono font-bold text-purple-800">
                      {String(cn.record_id || cn.credit_note_id)}
                    </span>
                    <span className="font-mono font-medium text-purple-900">
                      {formatINR(Number(cn.amount))}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 flex items-center justify-between text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    Credit Notes
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 italic">
                    0 records in dataset
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Transparent Reconciliation Breakdown Table */}
          <ReconciliationTable
            invoiceAmount={reconciliation.invoice_amount}
            recordedPayments={reconciliation.recorded_payments}
            approvedCredits={reconciliation.approved_credits}
            recordedBalance={reconciliation.recorded_balance}
            potentialCreditAmount={reconciliation.potential_credit_amount}
            disputedQuantity={reconciliation.disputed_quantity}
            unitPrice={reconciliation.unit_price}
            note={reconciliation.note}
          />

          {/* Transaction Timeline */}
          {activeCase.timeline && (
            <Timeline
              events={activeCase.timeline}
              onSelectRecordId={handleSelectRecord}
            />
          )}
        </div>
      </div>

      {/* Slide-Over Record Drawer */}
      <RecordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recordId={selectedRecordId}
        sourceRecords={sourceRecords}
      />
    </div>
  );
}

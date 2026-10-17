"use client";

import React, { useState, useMemo } from "react";
import { type DisputeInput, type Finding } from "@/types";
import { SummaryStrip } from "./SummaryStrip";
import { ClaimCard } from "./ClaimCard";
import { FindingsList } from "./FindingsList";
import { RecordDrawer } from "./RecordDrawer";
import { ReconciliationTable } from "./ReconciliationTable";
import { NextSteps } from "./NextSteps";
import { formatDate, formatINR } from "../lib/formatters";

// Direct decoupled mock fixture import (Phase 2 boundary)
import mockPayload from "../../../../tests/fixtures/mock_investigation_response.json";

export function InvestigationDesk() {
  // State for active dispute (supports safe inline edits in local session)
  const [dispute, setDispute] = useState<DisputeInput>(mockPayload.dispute as DisputeInput);

  // State for source record inspection drawer
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Extract findings typed against canonical Finding contract
  const findings = useMemo(() => mockPayload.findings as Finding[], []);

  // Derive unique next verification steps from findings
  const nextSteps = useMemo(() => {
    const steps: string[] = [];
    findings.forEach((f) => {
      if (f.next_step && !steps.includes(f.next_step)) {
        steps.push(f.next_step);
      }
    });
    return steps;
  }, [findings]);

  // Handler to open document inspection drawer
  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDrawerOpen(true);
  };

  const reconciliation = mockPayload.reconciliation;
  const sourceRecords = mockPayload.source_records;

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shadow-xs">
            PT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[var(--text)]">
                ProofTrail
              </h1>
              <span className="text-slate-300">/</span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                {mockPayload.investigation_id}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              Evidence-First B2B Dispute Investigation
            </p>
          </div>
        </div>

        {/* Header Badges & Actions */}
        <div className="flex items-center gap-3">
          {/* Static Case Indicator */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[var(--text-secondary)]">Case:</span>
            <span className="font-semibold text-[var(--text)]">
              INV-1048 · Short Delivery
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            Needs Human Review
          </span>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-[var(--primary)] border border-blue-100 hidden md:inline">
            Mode: Hybrid · Rules Verified
          </span>
        </div>
      </header>

      {/* Main Investigation Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Case Metadata Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
              Invoice Dispute Investigation
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Buyer: <strong className="text-[var(--text)]">{reconciliation.buyer_name}</strong> · Disputed Invoice: <code className="font-mono text-slate-800 font-bold">{reconciliation.invoice_id}</code>
            </p>
          </div>

          <div className="text-xs text-[var(--text-muted)] flex items-center gap-2">
            <span>Synthetic Benchmark Dataset</span>
            <span>•</span>
            <span>Rules-Only Deterministic Math</span>
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
          {/* Left Column (Evidence & Findings) ~ 60% Width */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Buyer's Claim Quote Card */}
            <ClaimCard
              dispute={dispute}
              disputedQuantity={reconciliation.disputed_quantity}
              onUpdateDispute={setDispute}
            />

            {/* 2. Structured Findings List */}
            <FindingsList
              findings={findings}
              onSelectRecordId={handleSelectRecord}
            />

            {/* 3. Next Verification Steps Checklist */}
            <NextSteps steps={nextSteps} />
          </div>

          {/* Right Column (Ledger Reconciliation & Records Overview) ~ 40% Width */}
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
                {sourceRecords.invoices?.map((inv) => (
                  <button
                    key={inv.record_id}
                    type="button"
                    onClick={() => handleSelectRecord(inv.record_id)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {inv.record_id}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Commercial Invoice ({formatDate(inv.date)})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-[var(--text)]">
                      {formatINR(Number(inv.total_amount))}
                    </span>
                  </button>
                ))}

                {/* Delivery Receipt Row */}
                {sourceRecords.deliveries?.map((del) => (
                  <button
                    key={del.record_id}
                    type="button"
                    onClick={() => handleSelectRecord(del.record_id)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {del.record_id}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Proof of Delivery ({formatDate(del.date)})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-slate-700">
                      Accepted: {del.accepted_quantity} units
                    </span>
                  </button>
                ))}

                {/* Payment Record Row */}
                {sourceRecords.payments?.map((pay) => (
                  <button
                    key={pay.record_id}
                    type="button"
                    onClick={() => handleSelectRecord(pay.record_id)}
                    className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group"
                  >
                    <div>
                      <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {pay.record_id}
                      </span>
                      <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                        Bank Payment ({formatDate(pay.date)})
                      </span>
                    </div>
                    <span className="font-mono font-medium text-[var(--success)]">
                      {formatINR(Number(pay.amount))}
                    </span>
                  </button>
                ))}

                {/* Missing Credit Note Indicator */}
                <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 flex items-center justify-between text-xs text-amber-900">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Credit Notes
                  </span>
                  <span className="text-[11px] font-mono text-amber-700 italic">
                    0 records in dataset
                  </span>
                </div>
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
          </div>
        </div>
      </main>

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

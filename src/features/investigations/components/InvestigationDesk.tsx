"use client";

import React, { useState, useMemo } from "react";
import { type DisputeInput, type Finding } from "@/types";
import { SummaryStrip } from "./SummaryStrip";
import { ClaimCard } from "./ClaimCard";
import { FindingsList } from "./FindingsList";
import { RecordDrawer } from "./RecordDrawer";
import { ReconciliationTable } from "./ReconciliationTable";
import { NextSteps } from "./NextSteps";
import { NewInvestigationModal } from "./NewInvestigationModal";
import { RecordImportModal } from "./RecordImportModal";
import { formatDate, formatINR } from "../lib/formatters";
import { DEMO_CASES, DEFAULT_CASE_ID, type DemoCaseId } from "../lib/demoCases";
import { type ValidatedRecord } from "../lib/recordParser";

const CASE_OPTIONS: { id: DemoCaseId; label: string }[] = [
  { id: "case_01", label: "Case 1 · Short Delivery (INV-1048)" },
  { id: "case_02", label: "Case 2 · Clean Agreement (INV-1039)" },
  { id: "case_03", label: "Case 3 · Missing POD (INV-1031)" },
];

export function InvestigationDesk() {
  // Milestone 2: Active demo case selection
  const [activeCaseId, setActiveCaseId] = useState<DemoCaseId>(DEFAULT_CASE_ID);

  // Preserve user inline edits per case within session
  const [customDisputes, setCustomDisputes] = useState<Partial<Record<DemoCaseId, DisputeInput>>>({});

  // Active case data bundle from authoritative single source of truth
  const activeCase = DEMO_CASES[activeCaseId] || DEMO_CASES[DEFAULT_CASE_ID];

  // Active dispute input (preserves local edits per case)
  const activeDispute = customDisputes[activeCaseId] || activeCase.dispute;

  // Active findings from case data
  const findings = useMemo(() => activeCase.findings as Finding[], [activeCase]);

  // Active reconciliation and source records
  const reconciliation = activeCase.reconciliation;
  const sourceRecords = activeCase.source_records;

  // Milestone 3: Local Imported Evidence State (isolated from demo cases)
  const [importedEvidence, setImportedEvidence] = useState<ValidatedRecord[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [evidenceViewTab, setEvidenceViewTab] = useState<"case" | "imported">("case");

  // State for source record inspection drawer
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // State for New Investigation modal workflow (Milestone 1)
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

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

  // Total case records count
  const totalCaseRecordsCount = useMemo(() => {
    return (
      (sourceRecords.invoices?.length || 0) +
      (sourceRecords.deliveries?.length || 0) +
      (sourceRecords.payments?.length || 0) +
      (sourceRecords.credit_notes?.length || 0)
    );
  }, [sourceRecords]);

  // Existing record IDs across active case and existing imported evidence (for duplicate clash detection)
  const existingRecordIds = useMemo(() => {
    const set = new Set<string>();
    sourceRecords.invoices?.forEach((r) => set.add(r.record_id));
    sourceRecords.deliveries?.forEach((r) => set.add(r.record_id));
    sourceRecords.payments?.forEach((r) => set.add(r.record_id));
    sourceRecords.credit_notes?.forEach((r) => set.add(r.record_id));
    importedEvidence.forEach((r) => set.add(r.record_id));
    return set;
  }, [sourceRecords, importedEvidence]);

  // Handler for switching demo case (preserves imported evidence safely)
  const handleCaseChange = (newCaseId: DemoCaseId) => {
    setActiveCaseId(newCaseId);
    setSelectedRecordId(null);
    setIsDrawerOpen(false);
  };

  // Handler for updating dispute claim locally
  const handleUpdateDispute = (updated: DisputeInput) => {
    setCustomDisputes((prev) => ({
      ...prev,
      [activeCaseId]: updated,
    }));
  };

  // Handler to open document inspection drawer
  const handleSelectRecord = (recordId: string) => {
    setSelectedRecordId(recordId);
    setIsDrawerOpen(true);
  };

  // Handler to commit imported records
  const handleImportRecords = (newRecords: ValidatedRecord[]) => {
    setImportedEvidence((prev) => [...prev, ...newRecords]);
    setEvidenceViewTab("imported");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col font-sans">
      {/* Top Application Bar */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm shadow-xs flex-shrink-0">
            PT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-[var(--text)]">
                ProofTrail
              </h1>
              <span className="text-slate-300">/</span>
              <span className="font-mono text-xs font-semibold text-slate-700">
                {activeCase.investigation_id}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
              Evidence-First B2B Dispute Investigation
            </p>
          </div>
        </div>

        {/* Header Badges & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Milestone 2: Interactive Demo Case Switcher */}
          <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200/90 rounded-lg px-2.5 py-1 text-xs shadow-2xs transition-colors">
            <label
              htmlFor="demo-case-selector"
              className="flex items-center gap-1.5 font-medium text-slate-600 cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${activeCase.statusBadge.dotClass}`} />
              <span className="hidden md:inline text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Case:
              </span>
            </label>
            <select
              id="demo-case-selector"
              aria-label="Select Demo Investigation Case"
              value={activeCaseId}
              onChange={(e) => handleCaseChange(e.target.value as DemoCaseId)}
              className="bg-transparent font-semibold text-slate-900 border-none outline-none focus:ring-0 cursor-pointer text-xs pr-1"
            >
              {CASE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Dynamic Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium border ${activeCase.statusBadge.bgClass} ${activeCase.statusBadge.textClass} ${activeCase.statusBadge.borderClass}`}
          >
            {activeCase.statusBadge.label}
          </span>

          <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-[var(--primary)] border border-blue-100 hidden lg:inline">
            Mode: Hybrid · Rules Verified
          </span>

          {/* Milestone 3 Action: Import Records */}
          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-white hover:bg-slate-50 text-[var(--text)] text-xs font-semibold shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 cursor-pointer flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="hidden sm:inline">Import Records</span>
            <span className="sm:hidden">Import</span>
            {importedEvidence.length > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-800 font-mono text-[10px]">
                {importedEvidence.length}
              </span>
            )}
          </button>

          {/* Milestone 1 Primary Action: + New Investigation */}
          <button
            type="button"
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white text-xs font-semibold shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 cursor-pointer flex-shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New Investigation</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </header>

      {/* Main Investigation Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Case Metadata Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-[var(--border)]">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-[var(--text)]">
                {activeCase.name}
              </h2>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {activeCase.investigation_id}
              </span>
            </div>
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
            {/* 1. Buyer's Claim Quote Card (keyed to reset draft on case switch) */}
            <ClaimCard
              key={activeCaseId}
              dispute={activeDispute}
              disputedQuantity={reconciliation.disputed_quantity}
              onUpdateDispute={handleUpdateDispute}
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
            {/* Commercial Evidence Inventory Card (Milestone 3 Enhanced) */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                    Commercial Evidence Inventory
                  </h3>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">
                    Click record to inspect raw attributes
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)] cursor-pointer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Import Files</span>
                </button>
              </div>

              {/* Segmented Control / Tabs: Case Dataset vs Imported Records */}
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <div className="flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setEvidenceViewTab("case")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
                      evidenceViewTab === "case"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Case Records ({totalCaseRecordsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setEvidenceViewTab("imported")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      evidenceViewTab === "imported"
                        ? "bg-white text-slate-900 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <span>Imported Records</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                        importedEvidence.length > 0
                          ? "bg-indigo-100 text-indigo-800 font-bold"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {importedEvidence.length}
                    </span>
                  </button>
                </div>

                {evidenceViewTab === "imported" && importedEvidence.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setImportedEvidence([])}
                    className="text-[11px] text-rose-600 hover:text-rose-800 hover:underline font-medium cursor-pointer"
                  >
                    Clear Imported
                  </button>
                )}
              </div>

              {/* View 1: Case Dataset Evidence */}
              {evidenceViewTab === "case" && (
                <div className="space-y-2 pt-1">
                  {/* Invoice Record Row */}
                  {sourceRecords.invoices?.map((inv) => (
                    <button
                      key={inv.record_id}
                      type="button"
                      onClick={() => handleSelectRecord(inv.record_id)}
                      className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group cursor-pointer"
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
                  {sourceRecords.deliveries && sourceRecords.deliveries.length > 0 ? (
                    sourceRecords.deliveries.map((del) => (
                      <button
                        key={del.record_id}
                        type="button"
                        onClick={() => handleSelectRecord(del.record_id)}
                        className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group cursor-pointer"
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
                    ))
                  ) : (
                    /* Missing Delivery Indicator (e.g. Case 3 Missing POD) */
                    <div className="p-2.5 rounded-lg border border-dashed border-rose-300 bg-rose-50/60 flex items-center justify-between text-xs text-rose-900">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        Proof of Delivery (POD)
                      </span>
                      <span className="text-[11px] font-mono text-rose-700 italic font-semibold">
                        Missing from records
                      </span>
                    </div>
                  )}

                  {/* Payment Record Row */}
                  {sourceRecords.payments && sourceRecords.payments.length > 0 ? (
                    sourceRecords.payments.map((pay) => (
                      <button
                        key={pay.record_id}
                        type="button"
                        onClick={() => handleSelectRecord(pay.record_id)}
                        className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group cursor-pointer"
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
                    ))
                  ) : (
                    /* Zero Payments Indicator (e.g. Case 3) */
                    <div className="p-2.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 flex items-center justify-between text-xs text-slate-700">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                        Bank Payments
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 italic">
                        ₹0 recorded (payment withheld)
                      </span>
                    </div>
                  )}

                  {/* Credit Notes Indicator / Rows */}
                  {sourceRecords.credit_notes && sourceRecords.credit_notes.length > 0 ? (
                    sourceRecords.credit_notes.map((cn) => (
                      <button
                        key={cn.record_id}
                        type="button"
                        onClick={() => handleSelectRecord(cn.record_id)}
                        className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group cursor-pointer"
                      >
                        <div>
                          <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                            {cn.record_id}
                          </span>
                          <span className="text-[var(--text-muted)] ml-2 text-[11px]">
                            Approved Credit Note ({formatDate(cn.date)})
                          </span>
                        </div>
                        <span className="font-mono font-medium text-[var(--success)]">
                          {formatINR(Number(cn.amount))}
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="p-2.5 rounded-lg border border-dashed border-amber-300 bg-amber-50/50 flex items-center justify-between text-xs text-amber-900">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Credit Notes
                      </span>
                      <span className="text-[11px] font-mono text-amber-700 italic">
                        0 records in dataset
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* View 2: Imported Evidence Inventory (Milestone 3) */}
              {evidenceViewTab === "imported" && (
                <div className="space-y-2 pt-1">
                  {importedEvidence.length === 0 ? (
                    <div className="p-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center space-y-2">
                      <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 mx-auto flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No imported records yet</p>
                      <p className="text-[11px] text-slate-500">
                        Upload or paste JSON or CSV commercial documents to validate and inspect them here.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsImportModalOpen(true)}
                        className="mt-1 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open Import Tool</span>
                      </button>
                    </div>
                  ) : (
                    importedEvidence.map((rec) => (
                      <button
                        key={rec.record_id}
                        type="button"
                        onClick={() => handleSelectRecord(rec.record_id)}
                        className="w-full p-2.5 rounded-lg border border-[var(--border)] hover:border-[var(--primary)] bg-white hover:bg-[var(--primary-soft)]/40 text-left transition-colors flex items-center justify-between text-xs group cursor-pointer"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                              {rec.record_id}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 capitalize">
                              {rec.category.replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                            <span>Date: {formatDate(rec.date)}</span>
                            <span>•</span>
                            <span className="text-emerald-700 font-medium">Structurally Valid</span>
                          </div>
                        </div>

                        <div className="text-right">
                          {rec.total_amount !== undefined && (
                            <span className="font-mono font-medium text-[var(--text)] block">
                              {formatINR(Number(rec.total_amount))}
                            </span>
                          )}
                          {rec.amount !== undefined && (
                            <span className="font-mono font-medium text-[var(--success)] block">
                              {formatINR(Number(rec.amount))}
                            </span>
                          )}
                          {rec.ordered_qty !== undefined && (
                            <span className="font-mono font-medium text-slate-700 block">
                              Ordered: {String(rec.ordered_qty)} {String(rec.unit || "")}
                            </span>
                          )}
                          {rec.dispatched_qty !== undefined && (
                            <span className="font-mono font-medium text-blue-700 block">
                              Dispatched: {String(rec.dispatched_qty)} {String(rec.unit || "")}
                            </span>
                          )}
                          {rec.received_qty !== undefined && (
                            <span className="font-mono font-medium text-emerald-700 block">
                              Received: {String(rec.received_qty)} {String(rec.unit || "")}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
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

      {/* Slide-Over Record Drawer (inspects case records and imported evidence) */}
      <RecordDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        recordId={selectedRecordId}
        sourceRecords={{
          ...sourceRecords,
          imported: importedEvidence.map((r) => r.raw_data || r),
        }}
      />

      {/* Milestone 3: Record Import Modal Workflow */}
      <RecordImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportRecords}
        existingRecordIds={existingRecordIds}
      />

      {/* New Investigation Modal Workflow (Milestone 1) */}
      <NewInvestigationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onApplyDispute={(msg) => {
          handleUpdateDispute({
            ...activeDispute,
            message: msg,
          });
        }}
        defaultMessage={activeDispute.message}
        invoiceId={reconciliation.invoice_id}
        buyerName={reconciliation.buyer_name}
        sourceRecords={sourceRecords}
      />
    </div>
  );
}

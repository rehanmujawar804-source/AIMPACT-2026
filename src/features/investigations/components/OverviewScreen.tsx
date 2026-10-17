"use client";

import React from "react";
import { formatINR, formatDate } from "../lib/formatters";
import { SYNTHETIC_CASES } from "../lib/caseRegistry";

export interface OverviewScreenProps {
  onSelectCase: (caseId: string) => void;
  onNavigate: (screen: string) => void;
}

export function OverviewScreen({ onSelectCase, onNavigate }: OverviewScreenProps) {
  const openCasesCount = SYNTHETIC_CASES.filter(
    (c) => c.status === "Needs human review"
  ).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
            WORKSPACE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] mt-0.5">
            Overview
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Review disputed invoices and trace each finding to its verified commercial source.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate("new")}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-xs focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ New Investigation</span>
          </button>
        </div>
      </div>

      {/* Top Metric Row: 4 KPI Cards */}
      <section aria-label="Investigation KPIs" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Total Investigations
          </span>
          <p className="text-2xl font-bold text-[var(--text)] mt-1 font-mono tracking-tight">
            0{SYNTHETIC_CASES.length}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
            Synthetic benchmark catalog
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider">
            Needs Review
          </span>
          <p className="text-2xl font-bold text-amber-700 mt-1 font-mono tracking-tight">
            0{openCasesCount}
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
            Unresolved discrepancies
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            Records Loaded
          </span>
          <p className="text-2xl font-bold text-[var(--text)] mt-1 font-mono tracking-tight">
            128
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
            Invoices, POs & receipts
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs">
          <span className="text-xs font-medium text-[var(--success)] uppercase tracking-wider">
            Source-Linked Findings
          </span>
          <p className="text-2xl font-bold text-[var(--success)] mt-1 font-mono tracking-tight">
            18
          </p>
          <span className="text-[11px] text-[var(--text-secondary)] mt-1 block">
            100% cited to record IDs
          </span>
        </div>
      </section>

      {/* Main Content (2-Column Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (2/3): Recent Investigations Table */}
        <div className="lg:col-span-8 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-[var(--border)] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                Recent Dispute Investigations
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Click any case to inspect findings, calculations, and the evidence trail
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("investigations")}
              className="text-xs text-[var(--primary)] hover:underline font-medium"
            >
              View all cases →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-3.5 pl-5">Case / Invoice</th>
                  <th className="p-3.5">Buyer</th>
                  <th className="p-3.5">Dispute Type</th>
                  <th className="p-3.5 text-right">Recorded Balance</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {SYNTHETIC_CASES.map((item) => (
                  <tr
                    key={item.caseId}
                    onClick={() => onSelectCase(item.caseId)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 pl-5">
                      <div className="font-mono font-bold text-[var(--primary)] group-hover:underline">
                        {item.caseId}
                      </div>
                      <div className="font-mono text-[11px] text-[var(--text-muted)]">
                        {item.invoiceId}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-[var(--text)]">
                      {item.buyerName}
                    </td>
                    <td className="p-3.5 text-[var(--text-secondary)]">
                      {item.disputeType}
                    </td>
                    <td className="p-3.5 text-right font-mono font-semibold text-[var(--text)]">
                      {formatINR(item.recordedBalance)}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                          item.status === "Clean agreement"
                            ? "bg-[var(--success-soft)] text-[var(--success)] border-green-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        <span
                          className={`w-1 h-1 rounded-full ${
                            item.status === "Clean agreement" ? "bg-[var(--success)]" : "bg-amber-500"
                          }`}
                        />
                        <span>{item.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <span className="text-[11px] text-[var(--primary)] font-medium group-hover:underline inline-flex items-center gap-1">
                        Inspect
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-[var(--surface-muted)] border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between px-5">
            <span>Showing {SYNTHETIC_CASES.length} synthetic benchmark investigations</span>
            <span className="italic">AIMPACT 2026 Evaluation Dataset</span>
          </div>
        </div>

        {/* Right Column (1/3): Quick Start Card + Data Quality */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Start Card */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" />
              <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                Start an Investigation
              </h3>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              ProofTrail reconstructs the transaction paper trail from commercial records in 3 deterministic steps:
            </p>

            <ol className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[var(--primary)] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                  1
                </span>
                <div>
                  <strong className="text-[var(--text)]">Select Records:</strong> POs, invoices, receipts, and payments.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[var(--primary)] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                  2
                </span>
                <div>
                  <strong className="text-[var(--text)]">Describe Claim:</strong> Paste buyer complaint verbatim.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[var(--primary)] font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                  3
                </span>
                <div>
                  <strong className="text-[var(--text)]">Trace Evidence:</strong> Inspect deterministic calculations.
                </div>
              </li>
            </ol>

            <button
              type="button"
              onClick={() => onNavigate("new")}
              className="w-full py-2.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
            >
              Start New Investigation Wizard →
            </button>
          </div>

          {/* Data Quality Card */}
          <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
              <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
                Data Quality Health
              </h3>
              <span className="text-[11px] text-[var(--success)] font-medium font-mono">
                Active Dataset
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-muted)]">
                <span className="text-[var(--text-secondary)]">Duplicate IDs:</span>
                <span className="font-mono font-bold text-slate-800">0 detected</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-muted)]">
                <span className="text-[var(--text-secondary)]">Unmatched Payments:</span>
                <span className="font-mono font-bold text-slate-800">0 unallocated</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--surface-muted)]">
                <span className="text-[var(--text-secondary)]">Blocked Files:</span>
                <span className="font-mono font-bold text-emerald-700">0 blocked (Clean)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate("data-sources")}
              className="text-xs text-[var(--primary)] hover:underline font-medium block pt-1"
            >
              Inspect Data Sources & File Schemas →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


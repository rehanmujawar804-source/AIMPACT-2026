"use client";

import React, { useState, useMemo } from "react";
import { formatINR, formatDate } from "../lib/formatters";
import { SYNTHETIC_CASES, CaseData } from "../lib/caseRegistry";

export interface InvestigationListScreenProps {
  onSelectCase: (caseId: string) => void;
  onNavigate: (screen: string) => void;
}

export function InvestigationListScreen({
  onSelectCase,
  onNavigate,
}: InvestigationListScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");

  // Filter and sort cases
  const filteredCases = useMemo(() => {
    return SYNTHETIC_CASES.filter((c) => {
      // Search matching
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.caseId.toLowerCase().includes(query) ||
        c.invoiceId.toLowerCase().includes(query) ||
        c.buyerName.toLowerCase().includes(query) ||
        c.disputeType.toLowerCase().includes(query);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "needs_review" && c.status === "Needs human review") ||
        (statusFilter === "clean" && c.status === "Clean agreement");

      return matchesSearch && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === "balance_desc") {
        return b.recordedBalance - a.recordedBalance;
      }
      // default: recent
      return new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();
    });
  }, [searchQuery, statusFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--primary)] font-semibold">
            WORKSPACE
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text)] mt-0.5">
            Investigations
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-1">
            Search, filter, and review commercial invoice disputes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate("new")}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-xs"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ New Investigation</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[var(--surface)] p-4 rounded-xl border border-[var(--border)] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <svg
            className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice, buyer name, or case ID..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-strong)] text-xs text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="filter-status-select" className="text-slate-500 font-medium">Status:</label>
          <select
            id="filter-status-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-xs text-[var(--text)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer"
          >
            <option value="all">All Statuses ({SYNTHETIC_CASES.length})</option>
            <option value="needs_review">Needs Review</option>
            <option value="clean">Clean Agreement</option>
          </select>
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2">
          <label htmlFor="sort-by-select" className="text-slate-500 font-medium">Sort by:</label>
          <select
            id="sort-by-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-lg border border-[var(--border-strong)] px-2.5 py-1.5 text-xs text-[var(--text)] bg-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 cursor-pointer"
          >
            <option value="recent">Most Recent Date</option>
            <option value="balance_desc">Balance (High to Low)</option>
          </select>
        </div>
      </div>

      {/* Cases Table */}
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-xs overflow-hidden">
        {filteredCases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[var(--surface-muted)] text-[var(--text-muted)] font-semibold border-b border-[var(--border)]">
                <tr>
                  <th className="p-3.5 pl-5">Case ID</th>
                  <th className="p-3.5">Invoice Reference</th>
                  <th className="p-3.5">Buyer Counterparty</th>
                  <th className="p-3.5">Dispute Type</th>
                  <th className="p-3.5 text-right">Recorded Balance</th>
                  <th className="p-3.5">Review Status</th>
                  <th className="p-3.5">Last Updated</th>
                  <th className="p-3.5 pr-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredCases.map((item) => (
                  <tr
                    key={item.caseId}
                    onClick={() => onSelectCase(item.caseId)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    <td className="p-3.5 pl-5 font-mono font-bold text-[var(--primary)] group-hover:underline">
                      {item.caseId}
                    </td>
                    <td className="p-3.5 font-mono font-medium text-slate-800">
                      {item.invoiceId}
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
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
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
                    <td className="p-3.5 font-mono text-[var(--text-muted)]">
                      {formatDate(item.updatedDate)}
                    </td>
                    <td className="p-3.5 pr-5 text-right">
                      <span className="text-xs text-[var(--primary)] font-medium group-hover:underline inline-flex items-center gap-1">
                        Open Desk
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty Search State */
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h4 className="text-sm font-semibold text-[var(--text)]">No matching investigations found</h4>
            <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
              No dispute cases match your search query &ldquo;{searchQuery}&rdquo;. Try clearing filters.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
              className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50 font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}

        <div className="p-3 bg-[var(--surface-muted)] border-t border-[var(--border)] text-[11px] text-[var(--text-muted)] flex items-center justify-between px-5">
          <span>Showing {filteredCases.length} of {SYNTHETIC_CASES.length} cases</span>
          <span className="italic">Demo Data · AIMPACT 2026</span>
        </div>
      </div>
    </div>
  );
}


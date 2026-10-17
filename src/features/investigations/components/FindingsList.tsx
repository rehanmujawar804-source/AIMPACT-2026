"use client";

import React from "react";
import { type Finding } from "@/types";
import { getStatusPresentationSafe } from "../lib/statusAdapter";

export interface FindingsListProps {
  findings: Finding[];
  onSelectRecordId: (recordId: string) => void;
}

export function FindingsList({
  findings,
  onSelectRecordId,
}: FindingsListProps) {
  if (!findings || findings.length === 0) {
    return (
      <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 text-center text-[var(--text-muted)] text-sm">
        No findings generated for this investigation.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-[var(--text)] tracking-tight">
          Evidence Findings & Traceability
        </h3>
        <span className="text-xs font-medium text-[var(--text-secondary)]">
          {findings.length} Verified {findings.length === 1 ? "Item" : "Items"}
        </span>
      </div>

      <div className="space-y-3">
        {findings.map((finding) => {
          const presentation = getStatusPresentationSafe(finding.status);

          return (
            <article
              key={finding.finding_id}
              className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm hover:border-[var(--border-strong)] transition-all"
            >
              {/* Finding Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[var(--text-muted)]">
                    {finding.finding_id}
                  </span>
                  {finding.claim_id && (
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {finding.claim_id}
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${presentation.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${presentation.dotClass}`} />
                  <span>{presentation.label}</span>
                </div>
              </div>

              {/* Finding Statement */}
              <p className="text-sm font-medium text-[var(--text)] mt-3 leading-relaxed">
                {finding.statement}
              </p>

              {/* Calculation Block (Deterministic) */}
              {finding.calculation && (
                <div className="mt-3 p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] uppercase tracking-wider mb-1">
                    <span>Deterministic Calculation</span>
                    <span className="font-mono text-slate-700">
                      Unit: {finding.calculation.unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-sm font-semibold text-[var(--text)]">
                    <span className="text-[var(--primary)]">{finding.calculation.expression}</span>
                    <span className="text-slate-400">=</span>
                    <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
                      {finding.calculation.result} {finding.calculation.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Assumptions & Limitations */}
              {((finding.assumptions && finding.assumptions.length > 0) ||
                (finding.limitations && finding.limitations.length > 0)) && (
                <div className="mt-3 space-y-1.5 text-xs text-[var(--text-secondary)]">
                  {finding.assumptions && finding.assumptions.map((assumption, idx) => (
                    <p key={`asm-${idx}`} className="flex items-start gap-1.5">
                      <span className="text-[var(--primary)] font-bold">•</span>
                      <span>
                        <strong className="text-[var(--text)]">Assumption:</strong> {assumption}
                      </span>
                    </p>
                  ))}
                  {finding.limitations && finding.limitations.map((limitation, idx) => (
                    <p key={`lim-${idx}`} className="flex items-start gap-1.5 text-amber-800 bg-amber-50/60 p-1.5 rounded">
                      <span className="text-amber-600 font-bold">!</span>
                      <span>
                        <strong>Limitation:</strong> {limitation}
                      </span>
                    </p>
                  ))}
                </div>
              )}

              {/* Source Records & Next Step Footer */}
              <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-2">
                {/* Source Record Citation Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mr-1">
                    Source Citations:
                  </span>
                  {finding.source_record_ids && finding.source_record_ids.length > 0 ? (
                    finding.source_record_ids.map((sourceId) => (
                      <button
                        key={sourceId}
                        type="button"
                        onClick={() => onSelectRecordId(sourceId)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-medium bg-slate-100 hover:bg-[var(--primary-soft)] text-slate-800 hover:text-[var(--primary)] border border-slate-200 hover:border-blue-200 transition-colors"
                        title={`Click to inspect source record ${sourceId}`}
                      >
                        <svg
                          className="w-3 h-3 text-[var(--text-muted)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        <span>{sourceId}</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] italic">
                      No explicit source records linked
                    </span>
                  )}
                </div>

                {/* Inline Next Step Indicator */}
                {finding.next_step && (
                  <span className="text-[11px] text-[var(--primary)] font-medium bg-[var(--primary-soft)] px-2 py-0.5 rounded">
                    Action required
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { TimelineEvent } from "../lib/caseRegistry";
import { formatDate } from "../lib/formatters";

export interface TimelineProps {
  events: TimelineEvent[];
  onSelectRecordId?: (recordId: string) => void;
}

export function Timeline({ events, onSelectRecordId }: TimelineProps) {
  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
            Transaction Timeline
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Chronological paper trail correlating commercial events
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold">
          {events.length} Events
        </span>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {events.map((evt, idx) => {
          const isLast = idx === events.length - 1;

          return (
            <div key={evt.id} className="relative group">
              {/* Dot */}
              <span
                className={`absolute -left-6 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-xs ${
                  isLast ? "bg-[var(--primary)] ring-4 ring-blue-50" : "bg-slate-400"
                }`}
                aria-hidden="true"
              />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                <span className="text-xs font-semibold text-[var(--text)]">
                  {evt.title}
                </span>
                <span className="text-[11px] font-mono text-[var(--text-muted)]">
                  {formatDate(evt.date)}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                {evt.recordRef && (
                  <button
                    type="button"
                    onClick={() => onSelectRecordId && onSelectRecordId(evt.recordRef!)}
                    className="text-[11px] font-mono font-medium text-[var(--primary)] hover:underline focus:outline-none"
                    title={`Click to inspect ${evt.recordRef}`}
                  >
                    {evt.recordRef}
                  </button>
                )}
                {evt.amountOrQty && (
                  <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-medium">
                    {evt.amountOrQty}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                {evt.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}


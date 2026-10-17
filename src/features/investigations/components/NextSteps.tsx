"use client";

import React, { useState } from "react";

export interface NextStepsProps {
  steps: string[];
}

export function NextSteps({ steps }: NextStepsProps) {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  if (!steps || steps.length === 0) {
    return null;
  }

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const completedCount = Object.values(completedSteps).filter(Boolean).length;

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)]" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
            What to Verify Next
          </h3>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          {completedCount} of {steps.length} completed
        </span>
      </div>

      <p className="text-xs text-[var(--text-secondary)]">
        Practical operational steps required before accepting a commercial deduction or closing the dispute:
      </p>

      <ul className="space-y-2 mt-2">
        {steps.map((step, idx) => {
          const isDone = !!completedSteps[idx];

          return (
            <li
              key={idx}
              className={`p-3 rounded-lg border text-xs flex items-start gap-3 transition-colors ${
                isDone
                  ? "bg-[var(--success-soft)] border-green-200 text-green-900"
                  : "bg-[var(--surface-muted)] border-[var(--border)] text-[var(--text)] hover:border-slate-300"
              }`}
            >
              <input
                type="checkbox"
                id={`next-step-${idx}`}
                checked={isDone}
                onChange={() => toggleStep(idx)}
                className="mt-0.5 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)] h-4 w-4 cursor-pointer"
              />
              <label
                htmlFor={`next-step-${idx}`}
                className={`leading-relaxed cursor-pointer select-none flex-1 ${
                  isDone ? "line-through text-slate-500" : ""
                }`}
              >
                {step}
              </label>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-[var(--text-muted)] italic pt-1">
        • Operational guidance derived directly from limitations noted in the evidence findings.
      </p>
    </div>
  );
}


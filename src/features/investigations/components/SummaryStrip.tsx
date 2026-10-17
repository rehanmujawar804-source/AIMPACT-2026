"use client";

import React from "react";
import { formatINR } from "../lib/formatters";

export interface SummaryStripProps {
  invoiceAmount: number;
  recordedPayments: number;
  recordedBalance: number;
  invoiceId?: string;
  buyerName?: string;
}

export function SummaryStrip({
  invoiceAmount,
  recordedPayments,
  recordedBalance,
  invoiceId,
  buyerName,
}: SummaryStripProps) {
  return (
    <section
      aria-label="Investigation Financial Summary"
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
    >
      {/* 1. Invoice Total Card */}
      <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
          <span className="uppercase tracking-wider">Invoice Amount</span>
          {invoiceId && (
            <span className="font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
              {invoiceId}
            </span>
          )}
        </div>
        <p className="text-2xl lg:text-3xl font-semibold text-[var(--text)] mt-2 tracking-tight">
          {formatINR(invoiceAmount)}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5 flex items-center gap-1.5">
          <span>Total commercial invoice value</span>
          {buyerName && <span className="truncate">· {buyerName}</span>}
        </p>
      </div>

      {/* 2. Recorded Payments Card */}
      <div className="bg-[var(--surface)] p-5 rounded-xl border border-[var(--border)] shadow-sm hover:border-[var(--border-strong)] transition-colors">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
          <span className="uppercase tracking-wider">Payments Recorded</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--success-soft)] text-[var(--success)]">
            Verified In Ledger
          </span>
        </div>
        <p className="text-2xl lg:text-3xl font-semibold text-[var(--success)] mt-2 tracking-tight">
          {formatINR(recordedPayments)}
        </p>
        <p className="text-xs text-[var(--text-secondary)] mt-1.5">
          Bank transaction confirmed and credited
        </p>
      </div>

      {/* 3. Recorded Balance Card (Authoritative) */}
      <div className="bg-[var(--surface)] p-5 rounded-xl border-2 border-[var(--primary)] bg-gradient-to-br from-white to-[var(--primary-soft)] shadow-sm">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--primary)]">
          <span className="uppercase tracking-wider font-semibold">Recorded Balance</span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--primary)] text-white font-medium">
            Authoritative
          </span>
        </div>
        <p className="text-2xl lg:text-3xl font-bold text-[var(--text)] mt-2 tracking-tight">
          {formatINR(recordedBalance)}
        </p>
        <div className="mt-1.5 pt-1.5 border-t border-blue-100/80 flex items-center gap-1.5 text-xs font-medium text-amber-700">
          <svg
            className="w-3.5 h-3.5 text-amber-600 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span className="leading-tight">
            Before any unapproved credit adjustments
          </span>
        </div>
      </div>
    </section>
  );
}

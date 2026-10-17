"use client";

import React from "react";
import { formatINR } from "../lib/formatters";

export interface ReconciliationTableProps {
  invoiceAmount: number;
  recordedPayments: number;
  approvedCredits: number;
  recordedBalance: number;
  potentialCreditAmount?: number;
  disputedQuantity?: number;
  unitPrice?: number;
  note?: string;
}

export function ReconciliationTable({
  invoiceAmount,
  recordedPayments,
  approvedCredits,
  recordedBalance,
  potentialCreditAmount,
  disputedQuantity,
  unitPrice,
  note,
}: ReconciliationTableProps) {
  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
            Financial Ledger Reconciliation
          </h3>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Deterministic balance calculation based on verified commercial records
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 text-[var(--primary)] font-semibold border border-blue-100">
          INR (₹)
        </span>
      </div>

      {/* Transparent Ledger Table */}
      <div className="overflow-hidden rounded-lg border border-[var(--border)]">
        <table className="w-full text-xs text-left">
          <tbody className="divide-y divide-[var(--border)] font-mono">
            <tr className="bg-white">
              <td className="p-3 text-[var(--text-secondary)] font-sans">
                1. Commercial Invoice Total
              </td>
              <td className="p-3 text-right font-medium text-[var(--text)]">
                {formatINR(invoiceAmount)}
              </td>
            </tr>

            <tr className="bg-white">
              <td className="p-3 text-[var(--text-secondary)] font-sans flex items-center gap-1.5">
                <span>2. Less: Recorded Payments</span>
                <span className="text-[10px] text-[var(--success)] font-medium font-mono">
                  (Bank UTR)
                </span>
              </td>
              <td className="p-3 text-right font-medium text-[var(--danger)]">
                - {formatINR(recordedPayments)}
              </td>
            </tr>

            <tr className="bg-white">
              <td className="p-3 text-[var(--text-secondary)] font-sans">
                3. Less: Approved Credit Notes
              </td>
              <td className="p-3 text-right font-medium text-[var(--text-muted)]">
                - {formatINR(approvedCredits)}
              </td>
            </tr>

            <tr className="bg-[var(--primary-soft)]/50 font-bold border-t-2 border-[var(--border-strong)]">
              <td className="p-3 text-[var(--text)] font-sans">
                Recorded Outstanding Balance
              </td>
              <td className="p-3 text-right text-sm text-[var(--primary)]">
                {formatINR(recordedBalance)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strict Commercial Rule: Unapproved Requested Credit Callout */}
      {potentialCreditAmount !== undefined && potentialCreditAmount > 0 && (
        <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/70 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Buyer Requested Credit
            </span>
            <span className="font-mono text-xs font-bold text-amber-900">
              {formatINR(potentialCreditAmount)}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-amber-800">
            <span>
              {disputedQuantity !== undefined && unitPrice !== undefined
                ? `Disputed ${disputedQuantity} units × ${formatINR(unitPrice)}`
                : "Requested deduction"}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 font-semibold text-[10px] uppercase tracking-wide">
              Not Deducted
            </span>
          </div>

          <p className="text-[11px] text-amber-800 leading-relaxed pt-1 border-t border-amber-200/70">
            {note ||
              "Under ProofTrail audit rules, an unapproved credit request is not subtracted from the recorded balance until an authorized credit note is issued."}
          </p>
        </div>
      )}
    </div>
  );
}

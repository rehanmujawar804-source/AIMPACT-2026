"use client";

import React, { useState } from "react";
import { type DisputeInput } from "@/types";

export interface ClaimCardProps {
  dispute: DisputeInput;
  disputedQuantity?: number;
  onUpdateDispute: (updated: DisputeInput) => void;
}

export function ClaimCard({
  dispute,
  disputedQuantity,
  onUpdateDispute,
}: ClaimCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasBeenEdited, setHasBeenEdited] = useState(false);
  const [draftMessage, setDraftMessage] = useState(dispute.message);
  const [draftIssue, setDraftIssue] = useState(dispute.claimed_issue || "short_delivery");
  const [draftInvoiceId, setDraftInvoiceId] = useState(dispute.invoice_id || "");
  const [draftShipmentId, setDraftShipmentId] = useState(dispute.shipment_id || "");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateDispute({
      ...dispute,
      message: draftMessage,
      claimed_issue: draftIssue,
      invoice_id: draftInvoiceId || null,
      shipment_id: draftShipmentId || null,
    });
    setHasBeenEdited(true);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDraftMessage(dispute.message);
    setDraftIssue(dispute.claimed_issue || "short_delivery");
    setDraftInvoiceId(dispute.invoice_id || "");
    setDraftShipmentId(dispute.shipment_id || "");
    setIsEditing(false);
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--purple)]" />
          <h3 className="text-sm font-semibold text-[var(--text)] tracking-tight">
            Buyer&apos;s Dispute Claim
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--purple-soft)] text-[var(--purple)] font-medium">
            AI-extracted · Reviewable
          </span>
          {hasBeenEdited && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium border border-amber-200">
              Edited manually
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
          className="text-xs font-medium text-[var(--primary)] hover:text-[var(--primary-hover)] px-2.5 py-1 rounded hover:bg-[var(--primary-soft)] transition-colors"
        >
          {isEditing ? "Cancel" : "Edit Claim"}
        </button>
      </div>

      {isEditing ? (
        /* Manual Edit Form */
        <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[var(--text)] mb-1">
              Dispute Message (Original Buyer Text)
            </label>
            <textarea
              value={draftMessage}
              onChange={(e) => setDraftMessage(e.target.value)}
              rows={3}
              className="w-full rounded-lg border border-[var(--border-strong)] p-2.5 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-sans"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">
                Claimed Issue
              </label>
              <input
                type="text"
                value={draftIssue}
                onChange={(e) => setDraftIssue(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-strong)] p-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">
                Invoice Reference
              </label>
              <input
                type="text"
                value={draftInvoiceId}
                onChange={(e) => setDraftInvoiceId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-strong)] p-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>
            <div>
              <label className="block font-medium text-[var(--text)] mb-1">
                Shipment / POD Ref
              </label>
              <input
                type="text"
                value={draftShipmentId}
                onChange={(e) => setDraftShipmentId(e.target.value)}
                className="w-full rounded-lg border border-[var(--border-strong)] p-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-[var(--text-muted)] italic">
              Manual claim changes update this inspection view only. They do not re-run external AI extraction.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-medium hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Read-only Display View */
        <div className="mt-3 space-y-3">
          {/* Quote Panel */}
          <div className="relative pl-3 border-l-2 border-[var(--primary)] py-0.5 bg-[var(--surface-muted)] p-3 rounded-r-lg">
            <p className="text-xs text-[var(--text)] italic leading-relaxed">
              &ldquo;{dispute.message}&rdquo;
            </p>
          </div>

          {/* Extracted Parameter Chips */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
            <span className="text-[11px] font-medium text-[var(--text-muted)] uppercase tracking-wider mr-1">
              Parsed Claim:
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-medium">
              <span className="text-[var(--text-muted)]">Type:</span>
              <span className="capitalize">{dispute.claimed_issue?.replace("_", " ") || "Short Delivery"}</span>
            </span>

            {disputedQuantity !== undefined && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                <span className="text-amber-600">Claimed Short:</span>
                <span className="font-semibold">{disputedQuantity} units</span>
              </span>
            )}

            {dispute.invoice_id && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">
                <span className="text-[var(--text-muted)]">Inv:</span>
                <span>{dispute.invoice_id}</span>
              </span>
            )}

            {dispute.shipment_id && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-mono text-[11px]">
                <span className="text-[var(--text-muted)]">Delivery:</span>
                <span>{dispute.shipment_id}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

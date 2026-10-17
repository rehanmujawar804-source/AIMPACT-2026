/**
 * ProofTrail — Status Presentation Adapter
 * Source of truth: Decision D11 (docs/DEVELOPMENT_ROADMAP.md)
 * 
 * Maps canonical wire FindingState values from src/types/index.ts to user-facing
 * display labels, badge styles, and semantic color variants.
 * 
 * Wire values (canonical contract):
 *   - SUPPORTED_BY_RECORDS
 *   - CONFLICTING_RECORDS
 *   - NOT_FOUND_IN_PROVIDED_DATA
 *   - UNRESOLVED
 */

import { FindingState, type FindingStateType } from "@/types";

export type StatusVariant = "success" | "danger" | "warning" | "neutral";

export interface StatusPresentation {
  label: string;
  variant: StatusVariant;
  badgeClass: string;
  dotClass: string;
  description: string;
}

/**
 * Strict presentation map using only canonical wire contract keys.
 */
export const STATUS_PRESENTATION_MAP: Record<FindingStateType, StatusPresentation> = {
  [FindingState.SUPPORTED_BY_RECORDS]: {
    label: "Supported",
    variant: "success",
    badgeClass: "bg-[var(--success-soft)] text-[var(--success)] border border-[#bbf7d0]",
    dotClass: "bg-[var(--success)]",
    description: "Directly confirmed by supplied commercial records.",
  },
  [FindingState.CONFLICTING_RECORDS]: {
    label: "Conflicting",
    variant: "danger",
    badgeClass: "bg-[var(--danger-soft)] text-[var(--danger)] border border-[#fecaca]",
    dotClass: "bg-[var(--danger)]",
    description: "Supplied records actively contradict each other.",
  },
  [FindingState.NOT_FOUND_IN_PROVIDED_DATA]: {
    label: "Missing",
    variant: "warning",
    badgeClass: "bg-[var(--warning-soft)] text-[var(--warning)] border border-[#fde68a]",
    dotClass: "bg-[var(--warning)]",
    description: "Record or evidence is absent from the provided dataset.",
  },
  [FindingState.UNRESOLVED]: {
    label: "Unresolved",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-700 border border-slate-200",
    dotClass: "bg-slate-500",
    description: "Ambiguity or insufficient evidence prevents a definitive conclusion.",
  },
};

/**
 * Maps a canonical wire FindingState to its user-facing visual presentation.
 * Returns null if the status is not a recognized canonical FindingState.
 */
export function getStatusPresentation(
  status: FindingStateType | string | null | undefined
): StatusPresentation | null {
  if (!status || typeof status !== "string") {
    return null;
  }
  return STATUS_PRESENTATION_MAP[status as FindingStateType] ?? null;
}

/**
 * Safe presentation getter that provides a visible fallback when an unknown status
 * is received, ensuring contract violations are flagged visibly rather than masked.
 */
export function getStatusPresentationSafe(
  status: FindingStateType | string | null | undefined
): StatusPresentation {
  const presentation = getStatusPresentation(status);
  if (presentation) {
    return presentation;
  }
  return {
    label: status ? `Unknown (${status})` : "Unspecified",
    variant: "neutral",
    badgeClass: "bg-slate-100 text-slate-600 border border-dashed border-slate-300",
    dotClass: "bg-slate-400",
    description: "Status is unrecognized or does not conform to the canonical contract.",
  };
}


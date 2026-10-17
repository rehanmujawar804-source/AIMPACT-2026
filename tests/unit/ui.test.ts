import { describe, it, expect } from "vitest";
import {
  getStatusPresentation,
  getStatusPresentationSafe,
  STATUS_PRESENTATION_MAP,
} from "../../src/features/investigations/lib/statusAdapter";
import { formatINR, formatDate } from "../../src/features/investigations/lib/formatters";
import { SYNTHETIC_CASES, getCaseById } from "../../src/features/investigations/lib/caseRegistry";
import { FindingState } from "@/types";

describe("Phase 3 UI — Decision D11 Status Adapter", () => {
  it("maps SUPPORTED_BY_RECORDS to supported badge with green styling", () => {
    const badge = getStatusPresentationSafe(FindingState.SUPPORTED_BY_RECORDS);
    expect(badge.label).toBe("Supported");
    expect(badge.variant).toBe("success");
    expect(badge.badgeClass).toContain("success");
    expect(badge.dotClass).toContain("success");
  });

  it("maps CONFLICTING_RECORDS to conflicting badge with red styling", () => {
    const badge = getStatusPresentationSafe(FindingState.CONFLICTING_RECORDS);
    expect(badge.label).toBe("Conflicting");
    expect(badge.variant).toBe("danger");
    expect(badge.badgeClass).toContain("danger");
    expect(badge.dotClass).toContain("danger");
  });

  it("maps NOT_FOUND_IN_PROVIDED_DATA to missing badge with amber styling", () => {
    const badge = getStatusPresentationSafe(FindingState.NOT_FOUND_IN_PROVIDED_DATA);
    expect(badge.label).toBe("Missing");
    expect(badge.variant).toBe("warning");
    expect(badge.badgeClass).toContain("warning");
    expect(badge.dotClass).toContain("warning");
  });

  it("maps UNRESOLVED to unresolved badge with neutral styling", () => {
    const badge = getStatusPresentationSafe(FindingState.UNRESOLVED);
    expect(badge.label).toBe("Unresolved");
    expect(badge.variant).toBe("neutral");
  });

  it("returns null for unrecognized or null wire status in getStatusPresentation", () => {
    expect(getStatusPresentation(null)).toBeNull();
    expect(getStatusPresentation(undefined)).toBeNull();
    expect(getStatusPresentation("NON_EXISTENT_STATUS" as any)).toBeNull();
  });

  it("safely handles unknown or invalid wire status strings with safe fallback", () => {
    const badge = getStatusPresentationSafe("CUSTOM_INVALID" as any);
    expect(badge.label).toBe("Unknown (CUSTOM_INVALID)");
    expect(badge.variant).toBe("neutral");
    expect(badge.badgeClass).toContain("border-dashed");
  });

  it("ensures all canonical FindingState enum members have presentation mappings", () => {
    for (const key of Object.values(FindingState)) {
      expect(STATUS_PRESENTATION_MAP[key]).toBeDefined();
      expect(STATUS_PRESENTATION_MAP[key].label).toBeTruthy();
      expect(STATUS_PRESENTATION_MAP[key].description).toBeTruthy();
    }
  });
});

describe("Phase 3 UI — Formatters", () => {
  it("formats INR currency values accurately with Rupee symbol and 2 decimal places", () => {
    const formatted = formatINR(18000);
    expect(formatted).toContain("18,000");
    expect(formatted).toContain("₹");

    const zero = formatINR(0);
    expect(zero).toBe("₹0.00");

    const large = formatINR(48000.5);
    expect(large).toContain("48,000.50");

    expect(formatINR(null)).toBe("₹0.00");
    expect(formatINR(undefined)).toBe("₹0.00");
  });

  it("formats dates into readable DD MMM YYYY format", () => {
    expect(formatDate("2026-10-17")).toBe("17 Oct 2026");
    expect(formatDate("2026-10-13")).toBe("13 Oct 2026");
    expect(formatDate(undefined)).toBe("N/A");
    expect(formatDate(null)).toBe("N/A");
    expect(formatDate("invalid-date")).toBe("invalid-date");
  });
});

describe("Phase 3 UI — Synthetic Case Registry & Business Rules", () => {
  it("contains all 4 required synthetic benchmark cases", () => {
    expect(SYNTHETIC_CASES.length).toBeGreaterThanOrEqual(4);
    const invoiceIds = SYNTHETIC_CASES.map((c) => c.invoiceId);
    expect(invoiceIds).toContain("INV-1048");
    expect(invoiceIds).toContain("INV-002");
    expect(invoiceIds).toContain("INV-001");
    expect(invoiceIds).toContain("INV-003");
  });

  it("verifies accounting reconciliation formula holds for all cases", () => {
    for (const c of SYNTHETIC_CASES) {
      const rec = c.reconciliation;
      const calculatedExpected =
        rec.invoice_amount - rec.recorded_payments - rec.approved_credits;
      expect(rec.recorded_balance).toBe(calculatedExpected);
    }
  });

  it("strictly enforces hero case INV-1048 unapproved credit business rule", () => {
    const heroCase = getCaseById("INV-1048");
    expect(heroCase).toBeDefined();
    if (!heroCase) return;

    expect(heroCase.reconciliation.invoice_amount).toBe(48000);
    expect(heroCase.reconciliation.recorded_payments).toBe(30000);
    expect(heroCase.reconciliation.approved_credits).toBe(0);
    // Recorded balance must be 18,000, NOT 14,000
    expect(heroCase.reconciliation.recorded_balance).toBe(18000);
    expect(heroCase.reconciliation.potential_credit_amount).toBe(4000);
  });

  it("looks up cases case-insensitively by both caseId and invoiceId", () => {
    expect(getCaseById("pt-2026-004")?.invoiceId).toBe("INV-1048");
    expect(getCaseById("inv-1048")?.caseId).toBe("PT-2026-004");
    expect(getCaseById("NON-EXISTENT")).toBeUndefined();
  });
});


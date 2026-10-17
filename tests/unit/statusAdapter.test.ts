import { describe, it, expect } from "vitest";
import { FindingState } from "@/types";
import {
  getStatusPresentation,
  getStatusPresentationSafe,
  STATUS_PRESENTATION_MAP,
} from "@/features/investigations/lib/statusAdapter";

describe("Status Presentation Adapter (Decision D11)", () => {
  describe("Canonical Status Mappings", () => {
    it("maps SUPPORTED_BY_RECORDS to 'Supported' with success variant", () => {
      const presentation = getStatusPresentation(FindingState.SUPPORTED_BY_RECORDS);
      expect(presentation).not.toBeNull();
      expect(presentation?.label).toBe("Supported");
      expect(presentation?.variant).toBe("success");
      expect(presentation?.badgeClass).toContain("var(--success");
    });

    it("maps CONFLICTING_RECORDS to 'Conflicting' with danger variant", () => {
      const presentation = getStatusPresentation(FindingState.CONFLICTING_RECORDS);
      expect(presentation).not.toBeNull();
      expect(presentation?.label).toBe("Conflicting");
      expect(presentation?.variant).toBe("danger");
      expect(presentation?.badgeClass).toContain("var(--danger");
    });

    it("maps NOT_FOUND_IN_PROVIDED_DATA to 'Missing' with warning variant", () => {
      const presentation = getStatusPresentation(FindingState.NOT_FOUND_IN_PROVIDED_DATA);
      expect(presentation).not.toBeNull();
      expect(presentation?.label).toBe("Missing");
      expect(presentation?.variant).toBe("warning");
      expect(presentation?.badgeClass).toContain("var(--warning");
    });

    it("maps UNRESOLVED to 'Unresolved' with neutral variant", () => {
      const presentation = getStatusPresentation(FindingState.UNRESOLVED);
      expect(presentation).not.toBeNull();
      expect(presentation?.label).toBe("Unresolved");
      expect(presentation?.variant).toBe("neutral");
      expect(presentation?.badgeClass).toContain("slate");
    });
  });

  describe("STATUS_PRESENTATION_MAP Completeness", () => {
    it("contains exactly the four canonical finding states", () => {
      const mappedKeys = Object.keys(STATUS_PRESENTATION_MAP).sort();
      const canonicalKeys = [
        FindingState.SUPPORTED_BY_RECORDS,
        FindingState.CONFLICTING_RECORDS,
        FindingState.NOT_FOUND_IN_PROVIDED_DATA,
        FindingState.UNRESOLVED,
      ].sort();
      expect(mappedKeys).toEqual(canonicalKeys);
    });
  });

  describe("Safe Fallback and Invalid Input Handling", () => {
    it("returns null for unrecognized or non-canonical statuses in getStatusPresentation", () => {
      expect(getStatusPresentation("FRAUD")).toBeNull();
      expect(getStatusPresentation("SUPPORTED")).toBeNull(); // Legacy docs/design.md label
      expect(getStatusPresentation("")).toBeNull();
      expect(getStatusPresentation(null)).toBeNull();
      expect(getStatusPresentation(undefined)).toBeNull();
    });

    it("returns explicit visible fallback in getStatusPresentationSafe without masking violation", () => {
      const safeUnknown = getStatusPresentationSafe("UNSUPPORTED_STATUS");
      expect(safeUnknown.label).toBe("Unknown (UNSUPPORTED_STATUS)");
      expect(safeUnknown.variant).toBe("neutral");
      expect(safeUnknown.badgeClass).toContain("border-dashed");

      const safeNull = getStatusPresentationSafe(null);
      expect(safeNull.label).toBe("Unspecified");
    });
  });
});

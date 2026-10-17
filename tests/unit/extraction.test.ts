/**
 * ProofTrail — Extraction Unit Tests (Swara — Phase 4, Stream C)
 *
 * Source of truth:
 *   docs/05_AI_ROLE_AND_EVALUATION.md (Sections 3, 4, 9, 10, 12)
 *   docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Section 5)
 *   docs/DEVELOPMENT_ROADMAP.md (Phase 4 verification criteria)
 *
 * Coverage:
 *   1. validateClaimExtraction — valid mock AI fixture → typed object
 *   2. validateClaimExtraction — missing required fields → null
 *   3. validateClaimExtraction — wrong status enum value → null
 *   4. buildClaimExtractionSystemPrompt — returns non-empty string with key rules
 *   5. buildClaimExtractionUserMessage — includes dispute_id and message text
 *   6. extractClaim — no provider configured → mode:"fallback", needs_human_review:true
 *   7. extractClaim — short-delivery message → derived qty and invoice ref
 *   8. extractClaim — empty message → mode:"failed", extraction:null
 *   9. Mock AI fixture conformance — ClaimExtractionSchema.parse succeeds
 *
 * Note: Tests for the live AI provider paths (openai/anthropic/gemini) are
 * omitted here because they require real API keys and live network access.
 * The documented approach is to test the public surface (validateClaimExtraction,
 * buildClaimExtractionSystemPrompt, buildClaimExtractionUserMessage, and
 * extractClaim with useMockFallback=true) which exercies the full fallback path.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { ClaimExtractionSchema } from "@/types";
import {
  validateClaimExtraction,
  extractClaim,
} from "@/lib/ai/claimExtractor";
import {
  buildClaimExtractionSystemPrompt,
  buildClaimExtractionUserMessage,
  EXTRACTION_MAX_TOKENS,
  EXTRACTION_TEMPERATURE,
} from "@/lib/ai/prompts";

// Load the fixture statically — import resolves at build time, no fs call needed
import mockAiResponse from "../../tests/fixtures/mock_ai_response.json";

// ============================================================================
// Test Suite 1: validateClaimExtraction
// ============================================================================

describe("validateClaimExtraction", () => {
  it("1. accepts the mock AI fixture as a valid ClaimExtraction", () => {
    const result = validateClaimExtraction(mockAiResponse);
    expect(result).not.toBeNull();
    expect(result?.dispute_id).toBe("DSP-002");
    expect(result?.issue_type).toBe("short_delivery");
    expect(result?.claimed_qty).toBe(20);
    expect(result?.unit).toBe("pcs");
    expect(result?.mentioned_invoice_id).toBe("INV-002");
    expect(result?.mentioned_shipment_id).toBe("SHP-002");
    expect(result?.needs_human_review).toBe(true);
  });

  it("2. returns null when required field dispute_id is missing", () => {
    const invalid = { ...mockAiResponse, dispute_id: undefined };
    const result = validateClaimExtraction(invalid);
    expect(result).toBeNull();
  });

  it("3. returns null when field_provenance.claimed_qty has an invalid enum value", () => {
    const invalid = {
      ...mockAiResponse,
      field_provenance: {
        ...mockAiResponse.field_provenance,
        claimed_qty: "guessed", // not in the schema enum
      },
    };
    const result = validateClaimExtraction(invalid);
    expect(result).toBeNull();
  });

  it("4. returns null when the input is null", () => {
    expect(validateClaimExtraction(null)).toBeNull();
  });

  it("5. returns null when the input is an empty object", () => {
    expect(validateClaimExtraction({})).toBeNull();
  });

  it("6. returns null when needs_human_review is missing (required boolean)", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { needs_human_review, ...withoutReview } = mockAiResponse;
    const result = validateClaimExtraction(withoutReview);
    expect(result).toBeNull();
  });

  it("7. returns null when field_provenance is entirely absent", () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { field_provenance, ...withoutProvenance } = mockAiResponse;
    const result = validateClaimExtraction(withoutProvenance);
    expect(result).toBeNull();
  });

  it("8. accepts null for optional nullable fields (claimed_qty, unit, claimed_amount, etc.)", () => {
    const minimalValid = {
      dispute_id: "DSP-TEST",
      issue_type: "short_delivery",
      claimed_qty: null,
      unit: null,
      claimed_amount: null,
      currency: "INR",
      mentioned_invoice_id: null,
      mentioned_shipment_id: null,
      claim_text_span: null,
      field_provenance: {
        claimed_qty: "unknown",
        unit: "unknown",
        claimed_amount: "unknown",
        mentioned_invoice_id: "unknown",
        mentioned_shipment_id: "unknown",
      },
      missing_fields: ["claimed_qty", "unit"],
      needs_human_review: true,
    };
    const result = validateClaimExtraction(minimalValid);
    expect(result).not.toBeNull();
    expect(result?.dispute_id).toBe("DSP-TEST");
  });
});

// ============================================================================
// Test Suite 2: Mock AI fixture schema conformance
// ============================================================================

describe("mock_ai_response.json fixture conformance", () => {
  it("9. ClaimExtractionSchema.parse succeeds on the fixture file", () => {
    // This validates that the fixture used in tests is a valid ClaimExtraction.
    // If this fails, the fixture needs to be corrected before tests can proceed.
    expect(() => ClaimExtractionSchema.parse(mockAiResponse)).not.toThrow();
  });

  it("10. fixture has all required top-level fields", () => {
    const parsed = ClaimExtractionSchema.parse(mockAiResponse);
    expect(parsed.dispute_id).toBeDefined();
    expect(parsed.issue_type).toBeDefined();
    expect(parsed.field_provenance).toBeDefined();
    expect(typeof parsed.needs_human_review).toBe("boolean");
    expect(Array.isArray(parsed.missing_fields)).toBe(true);
  });
});

// ============================================================================
// Test Suite 3: buildClaimExtractionSystemPrompt
// ============================================================================

describe("buildClaimExtractionSystemPrompt", () => {
  it("11. returns a non-empty string", () => {
    const prompt = buildClaimExtractionSystemPrompt();
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("12. contains the dispute_id field instruction", () => {
    const prompt = buildClaimExtractionSystemPrompt();
    expect(prompt).toContain("dispute_id");
  });

  it("13. contains provenance enum values", () => {
    const prompt = buildClaimExtractionSystemPrompt();
    expect(prompt).toContain("explicit");
    expect(prompt).toContain("derived");
    expect(prompt).toContain("inferred");
    expect(prompt).toContain("unknown");
  });

  it("14. explicitly forbids inventing invoice or shipment IDs", () => {
    const prompt = buildClaimExtractionSystemPrompt();
    // Rule 3 in the prompt explicitly forbids inventing IDs
    expect(prompt.toLowerCase()).toMatch(/do not invent|not invent/);
  });

  it("15. instructs model to return only JSON (no prose)", () => {
    const prompt = buildClaimExtractionSystemPrompt();
    expect(prompt.toLowerCase()).toMatch(/return only|only.*json/);
  });
});

// ============================================================================
// Test Suite 4: buildClaimExtractionUserMessage
// ============================================================================

describe("buildClaimExtractionUserMessage", () => {
  it("16. includes the dispute_id in the output", () => {
    const msg = buildClaimExtractionUserMessage("DSP-TEST-001", "Sample message");
    expect(msg).toContain("DSP-TEST-001");
  });

  it("17. includes the dispute message content in the output", () => {
    const disputeMessage = "We only received 80 units instead of 100.";
    const msg = buildClaimExtractionUserMessage("DSP-X", disputeMessage);
    expect(msg).toContain(disputeMessage);
  });

  it("18. uses different dispute_ids without cross-contamination", () => {
    const msg1 = buildClaimExtractionUserMessage("DSP-AAA", "message A");
    const msg2 = buildClaimExtractionUserMessage("DSP-BBB", "message B");
    expect(msg1).toContain("DSP-AAA");
    expect(msg1).not.toContain("DSP-BBB");
    expect(msg2).toContain("DSP-BBB");
    expect(msg2).not.toContain("DSP-AAA");
  });
});

// ============================================================================
// Test Suite 5: Prompt constants
// ============================================================================

describe("Prompt constants", () => {
  it("19. EXTRACTION_MAX_TOKENS is a positive integer", () => {
    expect(typeof EXTRACTION_MAX_TOKENS).toBe("number");
    expect(EXTRACTION_MAX_TOKENS).toBeGreaterThan(0);
    expect(Number.isInteger(EXTRACTION_MAX_TOKENS)).toBe(true);
  });

  it("20. EXTRACTION_TEMPERATURE is 0 (deterministic extraction)", () => {
    expect(EXTRACTION_TEMPERATURE).toBe(0);
  });
});

// ============================================================================
// Test Suite 6: extractClaim — mock fallback path (no provider configured)
// ============================================================================

describe("extractClaim — mock fallback (no live AI provider)", () => {
  /**
   * All tests in this suite run with no AI_PROVIDER configured,
   * which causes extractClaim to follow the heuristic mock fallback path.
   * This exercises the full fallback code path documented in docs/05 Section 9.
   */
  beforeEach(() => {
    // Ensure no provider is active for these tests
    delete process.env.AI_PROVIDER;
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.GEMINI_API_KEY;
  });

  it("21. returns mode:'fallback' when no provider is configured", async () => {
    const result = await extractClaim(
      "We received only 80 of the 100 units invoiced on INV-002.",
      "DSP-002",
      true
    );
    expect(result.mode).toBe("fallback");
    expect(result.providerUsed).toBe("mock");
  });

  it("22. fallback always sets needs_human_review:true", async () => {
    const result = await extractClaim(
      "We received only 80 of the 100 units invoiced on INV-002.",
      "DSP-002",
      true
    );
    expect(result.extraction?.needs_human_review).toBe(true);
  });

  it("23. fallback extraction passes schema validation (schemaValid:true)", async () => {
    const result = await extractClaim(
      "We received only 80 of the 100 units invoiced on INV-002.",
      "DSP-002",
      true
    );
    expect(result.schemaValid).toBe(true);
    expect(result.extraction).not.toBeNull();
  });

  it("24. fallback derives shortage quantity from 'received X of Y' pattern", async () => {
    const result = await extractClaim(
      "We received only 80 of the 100 units invoiced on INV-002. Please issue a credit note for 20 units.",
      "DSP-002",
      true
    );
    // 100 - 80 = 20
    expect(result.extraction?.claimed_qty).toBe(20);
    expect(result.extraction?.field_provenance?.claimed_qty).toBe("derived");
  });

  it("25. fallback extracts mentioned_invoice_id from 'INV-002' pattern", async () => {
    const result = await extractClaim(
      "received only 80 of 100 units invoiced on INV-002",
      "DSP-002",
      true
    );
    expect(result.extraction?.mentioned_invoice_id).toBe("INV-002");
  });

  it("26. fallback dispute_id matches the passed disputeId argument", async () => {
    const result = await extractClaim(
      "Short delivery on our latest order.",
      "DSP-CUSTOM-99",
      true
    );
    expect(result.extraction?.dispute_id).toBe("DSP-CUSTOM-99");
  });

  it("27. returns mode:'failed', extraction:null on empty message", async () => {
    const result = await extractClaim("", "DSP-002", true);
    expect(result.mode).toBe("failed");
    expect(result.extraction).toBeNull();
    expect(result.schemaValid).toBe(false);
  });

  it("28. returns mode:'failed', extraction:null on whitespace-only message", async () => {
    const result = await extractClaim("   \t\n  ", "DSP-002", true);
    expect(result.mode).toBe("failed");
    expect(result.extraction).toBeNull();
  });

  it("29. returns mode:'failed' when mock fallback is disabled and no provider is set", async () => {
    const result = await extractClaim(
      "Short delivery for INV-002.",
      "DSP-002",
      false // useMockFallback = false
    );
    expect(result.mode).toBe("failed");
    expect(result.extraction).toBeNull();
  });

  it("30. fallback missing_fields includes 'mentioned_invoice_id' when no invoice mentioned", async () => {
    const result = await extractClaim(
      "We received fewer items than expected.",
      "DSP-003",
      true
    );
    // No INV-xxx mentioned → missing_fields should include mentioned_invoice_id
    expect(result.extraction?.missing_fields).toContain("mentioned_invoice_id");
  });

  it("31. attemptsUsed is 0 when no provider is configured (no attempts made)", async () => {
    const result = await extractClaim(
      "Sample dispute message.",
      "DSP-TEST",
      true
    );
    expect(result.attemptsUsed).toBe(0);
  });

  it("32. fallbackReason is set to a non-empty string on fallback", async () => {
    const result = await extractClaim(
      "Short delivery on INV-002.",
      "DSP-002",
      true
    );
    expect(result.fallbackReason).not.toBeNull();
    expect((result.fallbackReason ?? "").length).toBeGreaterThan(0);
  });
});


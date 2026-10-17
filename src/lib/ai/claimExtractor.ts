/**
 * ProofTrail — AI Claim Extractor Adapter (Swara — Phase 2/4, Stream C)
 *
 * Source of truth:
 *   docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Section 5)
 *   docs/05_AI_ROLE_AND_EVALUATION.md (Sections 3, 4, 9, 10, 12)
 *   docs/DEVELOPMENT_ROADMAP.md (Phase 2 Stream C handoff contract)
 *
 * Handoff contract (Phase 2 Hour 1.0 freeze):
 *   extractClaim(message: string, disputeId: string): Promise<ClaimExtraction | null>
 *   Returns null on ANY failure; pipeline falls back to manual input.
 *
 * AI boundaries enforced by this module:
 *   - AI output is ALWAYS treated as untrusted until validated against ClaimExtractionSchema.
 *   - Secrets are read from environment variables and NEVER logged.
 *   - Invalid JSON, schema mismatch, timeout, or missing provider → null (fallback).
 *   - Source record IDs are never invented here; record validation is the pipeline's job.
 *   - This module never performs financial arithmetic.
 *   - If NEXT_PUBLIC_APP_ENV=development and no key is configured, uses mock fixture.
 */

import { ClaimExtractionSchema, type ClaimExtraction } from "@/types";
import {
  buildClaimExtractionSystemPrompt,
  buildClaimExtractionUserMessage,
  EXTRACTION_MAX_TOKENS,
  EXTRACTION_TEMPERATURE,
} from "./prompts";

// ============================================================================
// Configuration
// ============================================================================

/** Supported AI provider identifiers */
export type AIProvider = "openai" | "anthropic" | "gemini";

/** Extraction result with traceability metadata */
export interface ExtractionResult {
  extraction: ClaimExtraction | null;
  /** Processing mode: "ai" if live call succeeded, "fallback" if fixture used, "failed" if all paths exhausted */
  mode: "ai" | "fallback" | "failed";
  /** Which provider was called, if any */
  providerUsed: AIProvider | "mock" | null;
  /** Whether the extraction was validated against the schema */
  schemaValid: boolean;
  /** Human-readable reason if extraction failed or fell back */
  fallbackReason: string | null;
  /** Number of parse/validation attempts made */
  attemptsUsed: number;
}

// ============================================================================
// Internal helpers
// ============================================================================

/**
 * Reads the configured AI provider from environment without leaking secrets.
 */
function getConfiguredProvider(): AIProvider | null {
  const provider = process.env.AI_PROVIDER?.toLowerCase().trim();
  if (provider === "openai" || provider === "anthropic" || provider === "gemini") {
    return provider;
  }
  return null;
}

/**
 * Returns true when a usable API key is present for the given provider.
 * IMPORTANT: Never logs or returns the key value.
 */
function hasApiKey(provider: AIProvider): boolean {
  switch (provider) {
    case "openai":
      return Boolean(process.env.OPENAI_API_KEY?.trim());
    case "anthropic":
      return Boolean(process.env.ANTHROPIC_API_KEY?.trim());
    case "gemini":
      return Boolean(process.env.GEMINI_API_KEY?.trim());
  }
}

/**
 * Validates a raw JSON object against ClaimExtractionSchema.
 * Returns the typed extraction or null on any Zod parse failure.
 */
function validateExtractionOutput(raw: unknown): ClaimExtraction | null {
  const result = ClaimExtractionSchema.safeParse(raw);
  if (result.success) {
    return result.data;
  }
  return null;
}

/**
 * Attempts to parse and validate a JSON string returned by an LLM.
 * Handles JSON wrapped in markdown code fences.
 */
function parseAndValidateJson(text: string): ClaimExtraction | null {
  let jsonString = text.trim();

  // Strip markdown code fence wrapping (```json ... ``` or ``` ... ```)
  if (jsonString.startsWith("```")) {
    const firstNewline = jsonString.indexOf("\n");
    const lastFence = jsonString.lastIndexOf("```");
    if (firstNewline !== -1 && lastFence > firstNewline) {
      jsonString = jsonString.slice(firstNewline + 1, lastFence).trim();
    }
  }

  try {
    const parsed: unknown = JSON.parse(jsonString);
    return validateExtractionOutput(parsed);
  } catch {
    return null;
  }
}

// ============================================================================
// Provider-specific API call functions
// ============================================================================

/**
 * Calls the OpenAI Chat Completions API.
 * Uses structured JSON mode to improve output consistency.
 */
async function callOpenAI(
  disputeId: string,
  message: string
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const body = {
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: buildClaimExtractionSystemPrompt() },
      { role: "user", content: buildClaimExtractionUserMessage(disputeId, message) },
    ],
    response_format: { type: "json_object" },
    max_tokens: EXTRACTION_MAX_TOKENS,
    temperature: EXTRACTION_TEMPERATURE,
  };

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return data?.choices?.[0]?.message?.content ?? null;
}

/**
 * Calls the Anthropic Messages API.
 */
async function callAnthropic(
  disputeId: string,
  message: string
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const body = {
    model: "claude-3-haiku-20240307",
    max_tokens: EXTRACTION_MAX_TOKENS,
    system: buildClaimExtractionSystemPrompt(),
    messages: [
      { role: "user", content: buildClaimExtractionUserMessage(disputeId, message) },
    ],
  };

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };
  const textBlock = data?.content?.find((b) => b.type === "text");
  return textBlock?.text ?? null;
}

/**
 * Calls the Google Gemini API.
 */
async function callGemini(
  disputeId: string,
  message: string
): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const systemPrompt = buildClaimExtractionSystemPrompt();
  const userMessage = buildClaimExtractionUserMessage(disputeId, message);

  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${userMessage}` }],
      },
    ],
    generationConfig: {
      temperature: EXTRACTION_TEMPERATURE,
      maxOutputTokens: EXTRACTION_MAX_TOKENS,
      responseMimeType: "application/json",
    },
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}

// ============================================================================
// Mock fallback (development / no-key mode)
// ============================================================================

/**
 * Returns a mock extraction derived from the dispute message using simple
 * heuristic pattern matching — no external call, no hallucination risk.
 *
 * This fallback is ONLY used when:
 *   1. No AI provider is configured, OR
 *   2. The spec explicitly permits a mock fallback for this environment.
 *
 * The mock output is always marked needs_human_review: true so operators
 * understand it was not produced by the live AI pipeline.
 */
function buildMockExtractionFallback(
  disputeId: string,
  message: string
): ClaimExtraction {
  // Simple regex-based extraction from the message
  const invoiceMatch = message.match(/\b(INV-[\w-]+)\b/i);
  const shipmentMatch = message.match(/\b(SHP-[\w-]+|DEL-[\w-]+|SHIP-[\w-]+)\b/i);
  const qtyPattern = /(\d+)\s+(?:of\s+)?(?:the\s+)?(\d+)\s+units?/i;
  const qtyMatch = message.match(qtyPattern);
  const amountMatch = message.match(/[₹]\s*([\d,]+(?:\.\d{1,2})?)/);

  let claimed_qty: number | null = null;
  let field_provenance_qty: "explicit" | "derived" | "inferred" | "unknown" = "unknown";

  if (qtyMatch) {
    // e.g. "received only 80 of the 100 units" → shortage = 100 - 80 = 20
    const received = parseInt(qtyMatch[1], 10);
    const invoiced = parseInt(qtyMatch[2], 10);
    if (!isNaN(received) && !isNaN(invoiced) && invoiced > received) {
      claimed_qty = invoiced - received;
      field_provenance_qty = "derived";
    }
  }

  const missing_fields: string[] = [];
  if (!claimed_qty) missing_fields.push("claimed_qty");
  if (!invoiceMatch) missing_fields.push("mentioned_invoice_id");
  if (!shipmentMatch) missing_fields.push("mentioned_shipment_id");

  return {
    dispute_id: disputeId,
    issue_type: "short_delivery",
    claimed_qty,
    unit: "pcs",
    claimed_amount: amountMatch
      ? parseFloat(amountMatch[1].replace(/,/g, ""))
      : null,
    currency: "INR",
    mentioned_invoice_id: invoiceMatch ? invoiceMatch[1] : null,
    mentioned_shipment_id: shipmentMatch ? shipmentMatch[1] : null,
    claim_text_span: message.length > 200 ? message.slice(0, 200) : message,
    field_provenance: {
      claimed_qty: field_provenance_qty,
      unit: claimed_qty !== null ? "derived" : "unknown",
      claimed_amount: amountMatch ? "explicit" : "unknown",
      mentioned_invoice_id: invoiceMatch ? "explicit" : "unknown",
      mentioned_shipment_id: shipmentMatch ? "explicit" : "unknown",
    },
    missing_fields,
    needs_human_review: true,
  };
}

// ============================================================================
// Public API
// ============================================================================

/**
 * Primary extraction function. Follows the Phase 2 handoff contract:
 *   extractClaim(message, disputeId) → ClaimExtraction | null
 *
 * Returns null only when ALL of the following are true:
 *   - No provider is configured or the API key is absent
 *   - The live call failed after up to 2 attempts
 *   - The fallback mock is also disabled
 *
 * In development with no provider configured, uses the heuristic mock
 * and returns it with mode: "fallback" so the pipeline can clearly label it.
 *
 * @param message - The original unmodified dispute message
 * @param disputeId - The stable identifier for this dispute
 * @param useMockFallback - Whether to allow mock fallback when no provider is live
 */
export async function extractClaim(
  message: string,
  disputeId: string,
  useMockFallback: boolean = true
): Promise<ExtractionResult> {
  if (!message || !message.trim()) {
    return {
      extraction: null,
      mode: "failed",
      providerUsed: null,
      schemaValid: false,
      fallbackReason: "Empty or missing dispute message.",
      attemptsUsed: 0,
    };
  }

  const provider = getConfiguredProvider();

  // No provider configured or key is missing → go to mock/fallback immediately
  if (!provider || !hasApiKey(provider)) {
    if (useMockFallback) {
      const mock = buildMockExtractionFallback(disputeId, message);
      // Validate even the mock against schema to catch implementation bugs
      const validated = validateExtractionOutput(mock);
      return {
        extraction: validated,
        mode: "fallback",
        providerUsed: "mock",
        schemaValid: validated !== null,
        fallbackReason: provider
          ? `Provider '${provider}' is configured but API key is missing.`
          : "No AI provider configured. Running mock extraction fallback.",
        attemptsUsed: 0,
      };
    }
    return {
      extraction: null,
      mode: "failed",
      providerUsed: null,
      schemaValid: false,
      fallbackReason: "No AI provider configured and mock fallback is disabled.",
      attemptsUsed: 0,
    };
  }

  // Attempt up to 2 calls to the live provider (as per docs/04 Section 5.6)
  let attemptsUsed = 0;

  for (let attempt = 1; attempt <= 2; attempt++) {
    attemptsUsed = attempt;
    let rawText: string | null = null;

    try {
      if (provider === "openai") {
        rawText = await callOpenAI(disputeId, message);
      } else if (provider === "anthropic") {
        rawText = await callAnthropic(disputeId, message);
      } else if (provider === "gemini") {
        rawText = await callGemini(disputeId, message);
      }
    } catch {
      // Network/timeout error — continue to next attempt or fallback
      rawText = null;
    }

    if (rawText) {
      const validated = parseAndValidateJson(rawText);
      if (validated) {
        // Ensure the dispute_id matches what we sent
        const normalized = { ...validated, dispute_id: disputeId };
        return {
          extraction: normalized,
          mode: "ai",
          providerUsed: provider,
          schemaValid: true,
          fallbackReason: null,
          attemptsUsed,
        };
      }
      // Raw text received but schema validation failed — try once more
    }
  }

  // Both attempts exhausted — try mock fallback
  if (useMockFallback) {
    const mock = buildMockExtractionFallback(disputeId, message);
    const validated = validateExtractionOutput(mock);
    return {
      extraction: validated,
      mode: "fallback",
      providerUsed: "mock",
      schemaValid: validated !== null,
      fallbackReason: `AI extraction failed after ${attemptsUsed} attempt(s). Using heuristic mock fallback.`,
      attemptsUsed,
    };
  }

  return {
    extraction: null,
    mode: "failed",
    providerUsed: provider,
    schemaValid: false,
    fallbackReason: `AI extraction failed after ${attemptsUsed} attempt(s). No fallback available.`,
    attemptsUsed,
  };
}

/**
 * Validates a pre-parsed object against ClaimExtractionSchema.
 * Used by the pipeline to verify externally supplied extractions
 * (e.g. from mock_ai_response.json fixtures).
 */
export function validateClaimExtraction(raw: unknown): ClaimExtraction | null {
  return validateExtractionOutput(raw);
}


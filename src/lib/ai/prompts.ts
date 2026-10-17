/**
 * ProofTrail — Claim Extraction Prompts
 * Source of truth: docs/05_AI_ROLE_AND_EVALUATION.md (Section 10)
 *                  docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md (Section 5)
 *
 * Prompts enforce exact JSON output against ClaimExtractionSchema.
 * These prompts do NOT allow the model to invent record IDs, amounts,
 * invoice references, or conclusions unsupported by the message.
 */

/**
 * Builds the structured claim extraction system prompt.
 * Embedding the schema description directly reduces hallucination risk.
 */
export function buildClaimExtractionSystemPrompt(): string {
  return `You extract structured information from a short-delivery dispute message.

Your task is to represent what the message explicitly says. You must NOT decide whether the dispute is valid.

Return ONLY a JSON object — no markdown, no explanation, no preamble — that conforms EXACTLY to this schema:

{
  "dispute_id": string,              // echo back the dispute_id provided in the input
  "issue_type": string,              // e.g. "short_delivery", "damage", "payment_dispute" — infer from context; default "short_delivery"
  "claimed_qty": number | null,      // quantity discrepancy explicitly stated or clearly derivable; null if not established
  "unit": string | null,             // unit of measure (e.g. "pcs", "units", "kg"); null if unstated
  "claimed_amount": number | null,   // monetary claim amount in numbers; null if not established
  "currency": string,                // currency code; default "INR" if India context or unstated
  "mentioned_invoice_id": string | null,   // exact invoice ID string from the message; null if absent
  "mentioned_shipment_id": string | null,  // exact shipment ID string from the message; null if absent
  "claim_text_span": string | null,        // the exact quoted text span that best supports the primary claim
  "field_provenance": {              // provenance for each extracted field
    "claimed_qty": "explicit" | "derived" | "inferred" | "unknown",
    "unit": "explicit" | "derived" | "inferred" | "unknown",
    "claimed_amount": "explicit" | "derived" | "inferred" | "unknown",
    "mentioned_invoice_id": "explicit" | "derived" | "inferred" | "unknown",
    "mentioned_shipment_id": "explicit" | "derived" | "inferred" | "unknown"
  },
  "missing_fields": string[],        // list of field names that could not be determined from the message
  "needs_human_review": boolean      // true if any value is uncertain, derived, or ambiguous
}

Provenance definitions:
- "explicit": value is directly stated in the message (e.g. "20 units", "INV-002")
- "derived": value is mathematically derived from directly stated numbers (e.g. 100 - 80 = 20)
- "inferred": value is suggested by interpretation and requires human confirmation
- "unknown": cannot be determined from the message

Hard rules — violating any is an error:
1. Use ONLY information supported by the dispute message.
2. Return null for any field that is not established by the message.
3. Do NOT invent invoice IDs, shipment IDs, prices, amounts, or record references.
4. If quantities can be derived (e.g. "received 80 of 100"), you MAY set claimed_qty with provenance "derived".
5. If multiple interpretations are plausible, set needs_human_review: true.
6. Do NOT determine fault, fraud, intent, or legal responsibility.
7. Do NOT treat a claim as verified merely because it is stated.
8. Return ONLY the JSON object — no additional text.`;
}

/**
 * Builds the user message for claim extraction.
 * @param disputeId - The stable identifier for this dispute input
 * @param message - The original buyer dispute message, unmodified
 */
export function buildClaimExtractionUserMessage(
  disputeId: string,
  message: string
): string {
  return `dispute_id: ${disputeId}

Dispute message:
"""
${message}
"""

Extract the structured claim from this message. Return only the JSON object.`;
}

/**
 * Returns the maximum token budget for an extraction response.
 * Keeps responses concise and avoids padded prose.
 */
export const EXTRACTION_MAX_TOKENS = 512;

/**
 * Returns the temperature setting for extraction.
 * Low temperature (0) enforces deterministic, consistent extraction.
 */
export const EXTRACTION_TEMPERATURE = 0;


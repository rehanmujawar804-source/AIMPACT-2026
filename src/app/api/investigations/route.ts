import { NextRequest, NextResponse } from "next/server";
import { InvestigationRequestSchema } from "@/types";
import { runInvestigationPipeline } from "@/lib/pipeline";

/**
 * ProofTrail — POST /api/investigations
 *
 * Accepts an investigation request (dispute + records + optional mode),
 * runs the full pipeline, and returns source-linked findings.
 *
 * Response codes:
 *   200 — Investigation completed (may include findings in any canonical state)
 *   400 — Request body failed schema validation
 *   500 — Unhandled internal error (all known paths produce 200 with error findings)
 *
 * Source of truth: docs/DEVELOPMENT_ROADMAP.md Phase 2 Stream D
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;

  // Step 1: Parse JSON body
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: "invalid_json",
        message: "Request body could not be parsed as JSON.",
      },
      { status: 400 }
    );
  }

  // Step 2: Validate request schema
  const parseResult = InvestigationRequestSchema.safeParse(body);
  if (!parseResult.success) {
    const issues = parseResult.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    return NextResponse.json(
      {
        error: "validation_error",
        message: "Request body does not conform to InvestigationRequestSchema.",
        validation_issues: issues,
      },
      { status: 400 }
    );
  }

  // Step 3: Run investigation pipeline
  try {
    const response = await runInvestigationPipeline(parseResult.data);
    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    // Should not be reached — pipeline is designed to return error findings, not throw.
    // Log minimally without exposing stack traces or environment secrets.
    const message = err instanceof Error ? err.message : "Unknown pipeline error";
    return NextResponse.json(
      {
        error: "internal_error",
        message: `Unhandled pipeline error: ${message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/investigations
 * Returns the current implementation status of the investigations endpoint.
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: "operational",
    phase: 4,
    description: "Investigation pipeline with AI claim extraction and deterministic rules engine.",
    supported_modes: ["rules_only", "hybrid"],
    endpoints: [
      {
        method: "POST",
        path: "/api/investigations",
        body_schema: "InvestigationRequestSchema",
        description: "Submit a dispute + records to run a full investigation.",
      },
    ],
  });
}

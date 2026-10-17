import { NextResponse } from "next/server";

/**
 * ProofTrail — Evaluation API Route Placeholder
 * Status: PHASE 0 PLACEHOLDER — Not implemented yet.
 * Implementation will occur in Phase 5 according to docs/05_AI_ROLE_AND_EVALUATION.md.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "unimplemented",
      phase: 0,
      message: "Evaluation API is a placeholder. Implementation begins in Phase 5.",
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      status: "unimplemented",
      phase: 0,
      message: "Evaluation execution is not implemented in Phase 0.",
    },
    { status: 501 }
  );
}

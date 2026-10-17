import { NextResponse } from "next/server";

/**
 * ProofTrail — Investigations API Route Placeholder
 * Status: PHASE 0 PLACEHOLDER — Not implemented yet.
 * Implementation will occur in Phase 2 / Phase 3 according to docs/04_DATA_CONTRACTS_AND_ARCHITECTURE.md.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "unimplemented",
      phase: 0,
      message: "Investigation API is a placeholder. Implementation begins in Phase 2.",
    },
    { status: 501 }
  );
}

export async function POST() {
  return NextResponse.json(
    {
      status: "unimplemented",
      phase: 0,
      message: "Investigation execution is not implemented in Phase 0.",
    },
    { status: 501 }
  );
}

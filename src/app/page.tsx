export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 border-b border-[var(--border)] bg-[var(--surface)] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
            PT
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight leading-none text-[var(--text)]">
              ProofTrail
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              AIMPACT 2026 · Evidence-First Investigation Assistant
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--warning-soft)] text-[var(--warning)] border border-[#fde68a]">
            Phase 0: Foundation Established
          </span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Banner Card */}
        <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-[var(--text)]">
                Project Foundation & Repository Status
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1.5 max-w-3xl leading-relaxed">
                ProofTrail investigates short-delivery quantity disputes between small B2B suppliers and buyers.
                This Phase 0 setup establishes the TypeScript, Next.js, and Vitest foundation, validates the environment,
                and locks in canonical contracts before implementation begins.
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-semibold rounded bg-[var(--primary-soft)] text-[var(--primary)] border border-blue-100 whitespace-nowrap">
              8-Hour Hackathon Build
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Stack</span>
              <p className="text-sm font-semibold text-[var(--text)] mt-1">Next.js App Router</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">TypeScript & Tailwind CSS</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Validation</span>
              <p className="text-sm font-semibold text-[var(--text)] mt-1">Zod Schemas</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Runtime contract enforcement</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Testing</span>
              <p className="text-sm font-semibold text-[var(--text)] mt-1">Vitest Suite</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Automated unit test runner</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Architecture</span>
              <p className="text-sm font-semibold text-[var(--text)] mt-1">Modular Monolith</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">Single-repo fast integration</p>
            </div>
          </div>
        </section>

        {/* Two-Column Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Finding States & Core Rules */}
          <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Canonical Finding States (Non-negotiable)
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Every finding must strictly adhere to one of the four contract states defined in docs/04:
            </p>

            <ul className="mt-4 space-y-2.5 text-xs">
              <li className="p-2.5 rounded-lg bg-[var(--success-soft)] border border-[#bbf7d0] flex items-center justify-between">
                <span className="font-mono font-medium text-[var(--success)]">SUPPORTED_BY_RECORDS</span>
                <span className="text-[var(--text-secondary)]">Directly proven by supplied evidence</span>
              </li>
              <li className="p-2.5 rounded-lg bg-[var(--danger-soft)] border border-[#fecaca] flex items-center justify-between">
                <span className="font-mono font-medium text-[var(--danger)]">CONFLICTING_RECORDS</span>
                <span className="text-[var(--text-secondary)]">Supplied records contradict each other</span>
              </li>
              <li className="p-2.5 rounded-lg bg-[var(--warning-soft)] border border-[#fde68a] flex items-center justify-between">
                <span className="font-mono font-medium text-[var(--warning)]">NOT_FOUND_IN_PROVIDED_DATA</span>
                <span className="text-[var(--text-secondary)]">Missing from current dataset</span>
              </li>
              <li className="p-2.5 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
                <span className="font-mono font-medium text-slate-700">UNRESOLVED</span>
                <span className="text-[var(--text-secondary)]">Ambiguous or insufficient evidence</span>
              </li>
            </ul>

            <div className="mt-4 pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1">
              <p>• Never claim fraud or illegal conduct.</p>
              <p>• Missing in dataset ≠ does not exist in real world.</p>
              <p>• All arithmetic is deterministic code, not LLM output.</p>
            </div>
          </section>

          {/* Team Collaboration Roles */}
          <section className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
            <h3 className="text-base font-semibold text-[var(--text)]">
              Team Workflow & Ownership
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              Provisional 4-person division of responsibilities (docs/TEAM_WORKFLOW.md):
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text)]">Member 1 — Rehan</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">Lead / Integration</span>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">Product integration, canonical contracts, end-to-end flow.</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text)]">Member 2 — Maaz</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">feat/rules-engine</span>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">Deterministic rules engine, synthetic test fixtures, arithmetic checks.</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text)]">Member 3 — Bhavika</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">feat/investigation-ui</span>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">Investigation desk UI, claim findings list, reconciliation views.</p>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-muted)] border border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[var(--text)]">Member 4 — Swara</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">feat/claim-extraction</span>
                </div>
                <p className="text-[var(--text-secondary)] mt-1">AI claim extraction, evaluation against rules-only baseline.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Feature Status Notice */}
        <section className="p-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-xs text-[var(--text-secondary)] flex items-center justify-between">
          <span>
            <strong className="text-[var(--text)]">Phase 0 Complete:</strong> Product features (claim extraction, verification engine, evaluation runner) are purposefully not implemented yet and await Phase 1.
          </span>
          <span className="font-mono text-[11px] text-[var(--primary)] font-semibold">
            Next: Phase 1 — Canonical Contracts & Fixtures
          </span>
        </section>
      </div>
    </main>
  );
}

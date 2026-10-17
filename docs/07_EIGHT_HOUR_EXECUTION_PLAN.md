# 07 — Eight-Hour Execution Plan

## Team principle
One source of truth, small contracts, early integration. Avoid four separate prototypes that only meet at the end.

Suggested role split (adapt to actual strengths):
- **Product/integration lead:** lock user flow, schemas, acceptance criteria, integration, final narrative.
- **Data/evaluation owner:** synthetic cases, ground truth, metrics, test report.
- **Frontend owner:** dispute input, record preview, evidence trace, finding status UI.
- **Backend/rules owner:** schema validation, matching, deterministic checks, API.

AI extraction can be implemented by whichever teammate is strongest at API/model integration. Do not create a separate AI service if it slows integration.

## Timeline

### 00:00–00:30 — Freeze scope
- Confirm one dispute type.
- Agree JSON schemas and status vocabulary.
- Agree API request/response shape.
- Create one canonical sample case and one ambiguous case.
- Create Git branches/issues or assign files.

**Gate:** no one begins extra features before the contract is agreed.

### 00:30–01:30 — Build independent components
- Data owner: generate labelled fixtures and expected results.
- Backend: validation, matching, calculations, finding objects.
- Frontend: static layout with mocked response.
- AI owner: claim extraction to schema; fallback manual form.

### 01:30–02:30 — First vertical slice
- Connect UI to backend.
- Run one clean case and one short-delivery case end-to-end.
- Verify source IDs render and calculations match expected values.

**Gate at 02:30:** working end-to-end slice or stop new work and integrate immediately.

### 02:30–03:00 — Integration checkpoint
- Merge only working code.
- Fix contract mismatches.
- Confirm fallback works without model connectivity.

**Hard rule:** if no vertical slice exists by 03:00, cut AI-generated prose/export and prioritize deterministic evidence trace.

### 03:00–04:30 — Evaluation
- Run all available labelled cases.
- Compare rules-only and hybrid.
- Record failures; do not hide failed cases.
- Fix critical false assertions and source-link errors.

### 04:30–05:30 — Improve the differentiator
- Make each finding clickable to its source rows.
- Display why a record was matched.
- Make unresolved cases visually clear.
- Add one adversarial example.

### 05:30–06:00 — Feature freeze
Only fix:
- crashes,
- wrong arithmetic,
- broken source links,
- unsafe overclaims,
- demo blockers.

No new major feature after this point.

### 06:00–07:00 — Demo preparation
- Prepare clean, discrepancy, and ambiguous examples.
- Prepare a short results table with actual measured values.
- Prepare architecture and limitations slide/diagram.
- Verify the demo runs from a clean start.

### 07:00–08:00 — Rehearsal and contingency
- One teammate presents; another operates the demo.
- Rehearse likely judge questions.
- Test offline/manual fallback.
- Save a short screen recording or screenshots if permitted.
- Keep a backup static output from the same synthetic data.

## Git discipline
- Commit a working baseline early.
- Keep schema contracts in one shared file.
- Integrate frequently.
- Avoid committing API keys or real business data.
- Keep `main` runnable.
- Every feature needs an owner and a test.

## Feature-cut order if behind schedule
1. Cut export/download.
2. Cut Hinglish support.
3. Cut alternate candidate ranking UI.
4. Cut LLM-only comparison if not needed.
5. Keep: deterministic checks, source links, uncertainty, hybrid-vs-rules test, reliable demo.

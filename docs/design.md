# ProofTrail — Product & UI Design Specification

> **Purpose:** Build a polished, demo-ready web app for AIMPACT 2026 that helps a small Indian B2B supplier investigate a disputed invoice using source-linked evidence.
>
> **Core principle:** Evidence before conclusions. AI interprets free-text claims; deterministic code calculates money; the user approves every conclusion and communication.

---

## 1. Product brief

### What ProofTrail does
A supplier imports structured commercial records (orders, invoices, deliveries, payments, and optional credit notes), enters a buyer's dispute message, selects the relevant invoice, and runs an investigation. ProofTrail:

1. Validates the imported records and flags data-quality issues.
2. Reconciles invoice totals, recorded payments, approved credits, and outstanding balance using deterministic logic.
3. Extracts the buyer's claim into structured fields.
4. Links each claim to relevant source records.
5. Labels each finding **SUPPORTED**, **CONTRADICTED**, **MISSING**, or **AMBIGUOUS**.
6. Produces a compact evidence brief with source links and the next question or record to verify.

### Product boundaries
- This is an **evidence investigation workspace**, not a generic accounting dashboard or collections CRM.
- Do not automate collections, send messages, determine legal liability, assess legal eligibility, or submit claims.
- Do not treat a requested credit as an approved/issued credit.
- “Not found” means missing from the supplied records, not necessarily false.
- Use synthetic data in the demo. Do not ask for or expose real customer information.
- The optional follow-up message is secondary and must remain editable; cut it before compromising the evidence workflow.

### Primary user
An owner or accounts operator at a small Indian B2B supplier/distributor who has spreadsheet/CSV records and needs to understand a specific buyer invoice dispute.

### Main user outcome
Within a few minutes, the user can answer:
- What balance do our supplied records support?
- What exactly is the buyer claiming?
- Which records support or contradict each claim?
- What is missing, conflicting, or uncertain?
- What should a human verify next?

---

## 2. Design direction

### Visual concept: “Financial investigation desk”
Design a calm, precise, premium SaaS workspace that combines the trustworthiness of accounting software with the traceability of an evidence-management tool.

**Avoid:** generic AI gradients, glowing neon, giant hero illustrations, crypto aesthetics, excessive glassmorphism, overly colourful dashboards, fake accuracy scores, decorative charts, and cluttered tables.

**Aim for:** excellent hierarchy, crisp typography, restrained colour, compact data-dense layouts, obvious source traceability, and reassuring empty/loading/error states.

### Brand personality
- **Trustworthy:** restrained palette and transparent calculations.
- **Analytical:** aligned numbers, clear tables, consistent labels.
- **Human-controlled:** uncertainty is visible and review actions are explicit.
- **Modern Indian B2B:** use INR formatting (₹), Indian date formats where useful, and realistic synthetic supplier data.

### Colour tokens
Use CSS variables and keep the palette consistent.

```css
:root {
  --bg: #F5F7FA;             /* app canvas */
  --surface: #FFFFFF;        /* cards and panels */
  --surface-muted: #F8FAFC;
  --sidebar: #111827;        /* deep slate */
  --sidebar-hover: #1F2937;
  --text: #172033;
  --text-secondary: #667085;
  --text-muted: #98A2B3;
  --border: #E4E7EC;
  --border-strong: #D0D5DD;
  --primary: #2457D6;        /* calm investigative blue */
  --primary-hover: #1D46B3;
  --primary-soft: #EEF4FF;
  --success: #16845B;
  --success-soft: #E8F7EF;
  --warning: #B76E00;
  --warning-soft: #FFF4D6;
  --danger: #C43232;
  --danger-soft: #FEECEC;
  --purple: #6941C6;         /* AI-assistance only */
  --purple-soft: #F2EDFF;
}
```

**Usage rules**
- Blue = primary action, active navigation, selected source.
- Green = a finding is supported or a step is complete; never use green to imply overall case success.
- Amber = missing information, attention needed, or ambiguous evidence.
- Red = a concrete contradiction or data validation error; not a general warning.
- Purple = AI-extracted or AI-suggested content only. Never use purple as proof.
- Neutral grey = ordinary metadata and inactive states.
- Never communicate a status by colour alone; always include text and/or an icon.

### Typography
- Use **Inter** if available; otherwise use a clean system sans-serif.
- App title/primary page heading: 24–28px, semibold.
- Section headings: 15–18px, semibold.
- Body: 14px; secondary text: 12–13px.
- Dense table content: 13px with comfortable row height.
- KPI figures: 28–32px, semibold, tabular numerals.
- Avoid very light font weights and tiny labels.

### Layout and spacing
- Desktop-first at 1440×900, fully responsive down to mobile.
- Sidebar: 232px expanded; can collapse to 72px.
- Top bar: 64px.
- Main content max-width: 1440px; use a 24px page gutter.
- Use a 4px spacing scale (4, 8, 12, 16, 20, 24, 32).
- Cards: white background, 1px border, 12px radius, very subtle shadow only when useful.
- Buttons: 8px radius, 40px standard height; 32px compact.
- Keep tables dense but breathable; avoid oversized cards that waste space.

### Icons
Use Lucide icons consistently. Suggested: `shield-check`, `file-search`, `files`, `receipt`, `truck`, `wallet`, `alert-triangle`, `check-circle-2`, `circle-help`, `arrow-up-right`, `upload`, `search`, `filter`, `download`, `clock-3`, `git-compare`, `sparkles`, `panel-left`, `chevron-right`, `external-link`, `refresh-cw`.

---

## 3. Information architecture

Use a persistent left navigation with these items:

1. **Overview** — recent investigations, case summary, quick start.
2. **Investigations** — all cases and their status.
3. **Data sources** — uploaded CSV files, validation and row counts.
4. **Benchmark** — demo evaluation panel with clearly labelled synthetic test results.
5. **Settings** — demo-only preferences and data reset.

Primary CTA in the sidebar or page header: **New investigation**.

For the 8-hour prototype, implement the first three screens fully. Benchmark can be a small honest page or a compact section; Settings can be minimal. Do not build authentication, multi-tenancy, billing, OCR, PDF import, WhatsApp/email integrations, or a full accounting ledger.

### Suggested routes
- `/` — Overview
- `/investigations` — Investigation list
- `/investigations/new` — New investigation wizard
- `/investigations/:id` — Investigation workspace / evidence brief
- `/data-sources` — CSV upload and validation
- `/benchmark` — synthetic benchmark results
- `/settings` — minimal settings

If routing adds too much complexity, implement a single-page flow with working navigation state rather than dead links.

---

## 4. Screen specifications

## 4.1 Overview dashboard (`/`)

### Header
- Eyebrow: `WORKSPACE`
- Heading: **Overview**
- Supporting text: `Review disputed invoices and trace each finding to its source.`
- Right side: primary button **+ New investigation**

### Top metric row
Show four compact KPI cards:
1. **Open investigations** — e.g. `04`
2. **Needs review** — e.g. `02`
3. **Records loaded** — e.g. `128`
4. **Findings with source links** — e.g. `18`

These are synthetic demo values and must be labelled as demo/sample data somewhere on the page. Do not display invented money recovered, time saved, or success-rate claims.

### Main content
Use a two-column layout:
- Left (roughly 2/3): **Recent investigations** table.
- Right (roughly 1/3): **Start an investigation** compact step card and **Data quality** summary.

Investigation table columns:
- Case / invoice
- Buyer
- Dispute type
- Recorded balance
- Status
- Updated

Example rows:
- `PT-2026-004` · `INV-1048` · `Aarav Industrial Supplies` · Short delivery · `₹18,000` · Needs review
- `PT-2026-003` · `INV-1039` · `Kaveri Components` · Payment not found · `₹7,500` · Investigated
- `PT-2026-002` · `INV-1031` · `Northstar Packaging` · Price mismatch · `₹0` · Ready for review

Use plausible fictional Indian business names only. Clicking a row opens the corresponding investigation.

### Data quality card
Show simple counts: `2 duplicate IDs`, `1 unmatched payment`, `0 files blocked`. Use neutral warning treatment and a link to Data sources. The counts must match the synthetic fixture data, not be hard-coded to contradict it.

### Empty state
If there are no investigations, show a clean empty state with a file-search icon, one sentence explaining the workflow, and a **Start your first investigation** CTA. Do not show a blank table.

---

## 4.2 New investigation flow (`/investigations/new`)

Build a 3-step wizard with a clear progress indicator:
1. **Add records**
2. **Describe the dispute**
3. **Review and run**

Keep it short and usable in a live demo.

### Step 1 — Add records
Show a prominent drag-and-drop CSV area plus a secondary **Use demo dataset** button.

Supported file types:
- `orders.csv`
- `invoices.csv`
- `deliveries.csv`
- `payments.csv`
- `credit_notes.csv` (optional)

For prototype speed, allow the user to load a bundled synthetic dataset in one click. If CSV parsing is implemented, use Papa Parse or an equivalent reliable CSV parser.

Show each file as a compact file row:
- file icon + filename
- detected row count
- validation state
- `View rows` action
- remove/re-upload action

Required schema preview:
- Orders: `order_id`, `buyer_name`, `order_date`, `item_id`, `quantity`, `unit_price`
- Invoices: `invoice_id`, `order_id`, `invoice_date`, `quantity`, `unit_price`, `total_amount`
- Deliveries: `delivery_id`, `order_id`, `invoice_id`, `delivered_quantity`, `accepted_quantity`, `delivery_date`
- Payments: `payment_id`, `invoice_id`, `payment_date`, `amount`, `reference`
- Credit notes: `credit_note_id`, `invoice_id`, `amount`, `status`, `issued_date`

Validate columns, IDs, dates, numeric fields, duplicate IDs, orphan references, and missing required values. Never silently discard invalid rows. Show warnings with row numbers and let the user inspect them.

CTA: **Continue to dispute**

### Step 2 — Describe the dispute
Layout: form on left, invoice selection on right.

Fields:
- **Buyer’s message** (large textarea)
- **Invoice / transaction** (select only after candidates are loaded)
- Optional: `Expected invoice reference` if buyer mentions one
- Optional: `Dispute date`

Example message:
> “We received only 110 units instead of 120. Please issue a credit for the missing 10 units.”

Show a small privacy note: `Use synthetic data for this demo. Only upload business records you are authorised to process.`

Invoice selection must not silently choose between multiple plausible invoices. If two candidates match, show both with reference, buyer, date, and amount, and require explicit selection.

CTA: **Review investigation**

### Step 3 — Review and run
Show a concise preflight summary:
- Selected invoice
- Buyer
- Invoice amount
- Recorded payments
- Approved credits
- Expected source files
- Data-quality warnings

Primary CTA: **Run investigation**. Secondary: **Back**.

On click, show a short stepper or progress list:
1. Validating records
2. Reconciling amounts
3. Interpreting buyer’s claim
4. Linking evidence
5. Preparing brief

Do not fake a long loading animation. For a local demo, finish promptly and clearly show completion or a fallback mode.

---

## 4.3 Investigation workspace (`/investigations/:id`)

This is the **hero screen** and must receive the most polish. It should be easy for judges to understand in 10 seconds.

### Page header
Breadcrumb: `Investigations / PT-2026-004`

Title: **Invoice dispute investigation**
Subheading: `INV-1048 · Aarav Industrial Supplies · Opened 17 Oct 2026`

Right-side actions:
- `Export brief` (functional download if feasible)
- `More` menu only if it contains working actions; otherwise omit

Display a compact status badge: `Needs human review`.

### Investigation summary strip
Three cards:
1. **Invoice amount** — `₹48,000`
2. **Payments recorded** — `₹30,000`
3. **Recorded balance** — `₹18,000`

Under the balance, show `Before any unapproved credit adjustment`. Do not subtract a requested or pending credit. Use Indian number formatting and calculate values from fixture data, not from AI output.

### Two-column main workspace
Left column (approx. 58%):
1. **Buyer’s claim** card
2. **Claim findings** list/table
3. **What to verify next** card

Right column (approx. 42%):
1. **Transaction timeline**
2. **Evidence records** panel
3. **Reconciliation breakdown**

#### Buyer’s claim card
Show the original message in a quote-style neutral panel. Under it, show extracted claim chips:
- Claim type: `Short delivery`
- Quantity claimed: `10 units`
- Invoice reference: `INV-1048`
- AI interpretation label: `AI-extracted · Reviewable`

Do not show an invented confidence percentage. If extraction is uncertain, say **Needs confirmation** and ask the user to confirm or edit the extracted fields.

#### Claim findings
Each finding is a distinct row/card with:
- Claim statement
- Status label
- Short plain-language explanation
- Source record chips (clickable)
- `View evidence` action
- Optional `Mark reviewed` action

Use the four statuses consistently:
- **SUPPORTED** — green badge; supplied records support the claim.
- **CONTRADICTED** — red badge; supplied records conflict with the claim.
- **MISSING** — amber badge; required evidence is not present in the supplied records.
- **AMBIGUOUS** — amber/purple-neutral badge; multiple plausible interpretations or links need human review.

For the synthetic example:
1. `Invoice lists 120 units` — SUPPORTED — source `Invoice INV-1048`.
2. `Delivery record shows 110 accepted units` — SUPPORTED — source `Delivery DEL-209`.
3. `A 10-unit quantity discrepancy exists` — SUPPORTED — sources invoice + delivery.
4. `A credit has been approved and issued` — MISSING — no authorised issued credit note found.

Important: “The buyer says 10 units were damaged” is not established solely by a delivery quantity discrepancy. Keep **short delivery** and **damage** as different claims. If the message specifically claims damage, mark damage evidence MISSING unless an appropriate record supports it.

#### What to verify next
A highlighted but restrained panel titled **Next verification steps**:
- `Confirm whether the 10-unit difference was a short delivery, damage, or a later adjustment.`
- `Check for an authorised credit note before adjusting the recorded balance.`
- `Review the delivery acceptance record with the responsible operator.`

These are operational prompts, not legal or accounting advice. Each item can have a checkbox to mark it reviewed.

#### Transaction timeline
A vertical timeline with connected events:
- Order created — `ORD-1048` — 12 Oct 2026
- Invoice issued — `INV-1048` — 13 Oct 2026 — `₹48,000`
- Delivery accepted — `DEL-209` — 14 Oct 2026 — `110 of 120 units`
- Payment recorded — `PAY-771` — 16 Oct 2026 — `₹30,000`
- Buyer dispute received — 17 Oct 2026

Each timeline event links to its source record. Dates and values should come from the fixture data.

#### Evidence records panel
A compact searchable list of relevant records:
- Invoice `INV-1048`
- Delivery `DEL-209`
- Payment `PAY-771`
- Credit note search result: `No approved credit note found in supplied records`

Clicking a source opens a side drawer with:
- Record type and ID
- Source filename and row number
- Key fields in a clean definition list
- Why the record is relevant to this finding
- `Close` action

Every material factual statement must link to a source record or be explicitly marked as unverified/missing.

#### Reconciliation breakdown
Use a compact table, not a pie chart:
- Invoice total: `₹48,000`
- Less: recorded payments: `−₹30,000`
- Less: approved credits: `₹0`
- **Recorded balance: ₹18,000**

Show a formula caption: `Invoice total − recorded payments − approved credits = recorded balance`. Use integer paise or a decimal-safe approach in code. Never calculate financial values in the LLM.

### Review state
At the bottom of the investigation, provide:
- `Mark investigation reviewed` primary/secondary action
- `Export evidence brief`
- Optional `Create editable response draft` only if core features are complete

Never auto-send a message. If a response draft is included, it must be editable and clearly state that a human should verify it before use.

---

## 4.4 Investigations list (`/investigations`)

Heading: **Investigations**
Description: `Search and review invoice disputes.`

Controls:
- Search by invoice ID, buyer, or case ID
- Filter by status: All, Needs review, Investigated
- Filter by dispute type
- Sort by most recently updated

Table columns:
- Case ID
- Invoice
- Buyer
- Dispute type
- Recorded balance
- Status
- Last updated
- Row action

Include a visible `Demo data` note. Keep the table responsive; on mobile convert each row to a stacked card.

---

## 4.5 Data sources (`/data-sources`)

Heading: **Data sources**
Description: `Inspect the records used in each investigation.`

Top summary:
- Files loaded
- Total rows
- Validation warnings
- Rejected rows (only if any are genuinely rejected)

Each source file card includes:
- File name and type
- Row count
- Validation state
- Last loaded timestamp
- `Preview rows`
- `Re-upload` / `Remove` actions

Data preview table:
- Sticky header
- Search within rows
- Row number
- Invalid cells highlighted with an icon and explanatory tooltip/text
- Clear duplicate/orphan warnings

Do not silently drop records. If a row is excluded from reconciliation, show why and allow the user to inspect it.

---

## 4.6 Benchmark (`/benchmark`) — optional if time allows

Purpose: show that the team considered evaluation, not to imply production accuracy.

Heading: **Synthetic benchmark**
Notice: `Illustrative test cases only — not evidence of real-world performance.`

Show three comparison cards:
- Rules-only baseline
- LLM-only baseline
- Hybrid approach

Only show metrics that have actually been calculated from the implemented labelled cases. Do not fabricate percentages or present placeholder numbers as measured results. If the evaluation script is not implemented, show the test plan and metric definitions instead of fake charts.

Useful metrics:
- Arithmetic exact match
- Discrepancy precision/recall
- False-positive rate on clean cases
- Claim extraction accuracy
- Evidence-link precision
- Unsupported assertions per brief
- Ambiguity handling

Use a simple table or horizontal bars only when real measured values exist. Include the number of cases tested.

---

## 5. Reusable component inventory

Build components with consistent states and props. Suggested components:

- `AppShell` — sidebar, top bar, responsive main area
- `SidebarNav` — active route, collapse state
- `PageHeader` — title, description, actions
- `MetricCard` — label, value, optional helper text
- `StatusBadge` — supported / contradicted / missing / ambiguous / needs review
- `InvestigationTable`
- `FileDropzone`
- `SourceFileRow`
- `ValidationSummary`
- `ValidationIssueList`
- `ClaimMessageCard`
- `ClaimExtractionChips`
- `FindingCard`
- `EvidenceSourceChip`
- `SourceDetailDrawer`
- `TransactionTimeline`
- `ReconciliationTable`
- `NextVerificationPanel`
- `EmptyState`
- `LoadingStepper`
- `Toast / InlineAlert`
- `ConfirmDialog` for destructive remove/reset actions

Use semantic HTML, keyboard-accessible buttons, visible focus rings, descriptive labels, and accessible modal/drawer behaviour.

---

## 6. Interaction and state requirements

Every visible control must work. Do not create decorative buttons that do nothing.

### Required interactions
- Sidebar navigation changes pages.
- `New investigation` opens the creation flow.
- `Use demo dataset` loads the bundled synthetic records.
- CSV upload validates and lists files.
- `View rows` opens a preview.
- Selecting an invoice updates the preflight summary.
- `Run investigation` runs reconciliation and produces findings.
- Clicking evidence chips opens the matching source detail drawer.
- Search and filters update the investigation list.
- `Mark reviewed` updates the visible case state.
- `Export brief` downloads a generated Markdown or text report if feasible.
- Clear/reset actions require confirmation.
- Errors are shown inline with a next step; never fail silently.

### States to design
- First-use empty state
- File drag-over
- Uploading / parsing
- Validation passed
- Validation warning
- Invalid schema
- No invoice candidates
- Multiple invoice candidates
- AI extraction success
- AI unavailable / timeout → labelled rule-only fallback
- Ambiguous evidence
- No approved credit note found
- Investigation completed
- Export failed / succeeded

### AI behaviour
Use a constrained JSON schema for claim extraction, e.g.:

```json
{
  "claim_type": "short_delivery",
  "invoice_reference": "INV-1048",
  "claimed_quantity": 10,
  "claimed_amount": null,
  "claim_date": null,
  "uncertainties": ["The message mentions damage but no damage evidence is present."]
}
```

Validate all model output before use. Retry once on malformed output; then fall back to keyword/rule extraction and label the mode. AI may extract and suggest. It must not:
- calculate invoice totals or balances
- invent source IDs
- assign the final evidence status
- decide liability
- issue a credit
- send a communication

The **verdict layer is rule-based** and uses validated source links. The interface must visibly distinguish `AI-extracted` from `Verified from records`.

---

## 7. Data contracts and example fixture

Use a shared, documented data contract across the UI, parser, reconciliation engine, and AI integration. Avoid field-name drift.

### Core types (TypeScript direction)

```ts
type FindingStatus =
  | "SUPPORTED"
  | "CONTRADICTED"
  | "MISSING"
  | "AMBIGUOUS";

type SourceRef = {
  sourceType: "order" | "invoice" | "delivery" | "payment" | "credit_note";
  sourceId: string;
  fileName: string;
  rowNumber: number;
  fields: Record<string, string | number | null>;
};

type ExtractedClaim = {
  claimType: string;
  invoiceReference?: string | null;
  claimedQuantity?: number | null;
  claimedAmountPaise?: number | null;
  claimDate?: string | null;
  uncertainties: string[];
  extractionMode: "ai" | "rules" | "manual";
};

type Finding = {
  id: string;
  claim: string;
  status: FindingStatus;
  explanation: string;
  sourceRefs: SourceRef[];
  missingEvidence: string[];
  needsHumanReview: boolean;
};

type Reconciliation = {
  invoiceTotalPaise: number;
  recordedPaymentsPaise: number;
  approvedCreditsPaise: number;
  recordedBalancePaise: number;
  sourceRefs: SourceRef[];
};

type Investigation = {
  id: string;
  invoiceId: string;
  buyerName: string;
  buyerMessage: string;
  status: "needs_review" | "investigated";
  createdAt: string;
  claim: ExtractedClaim;
  reconciliation: Reconciliation;
  findings: Finding[];
};
```

Represent money internally as integer paise or a decimal-safe type; format only for display. Do not use floating-point arithmetic for money.

### Synthetic demo case
Use this case as the default happy path:
- Invoice: `INV-1048`
- Buyer: `Aarav Industrial Supplies`
- Invoice quantity: 120 units
- Unit price: ₹400
- Invoice total: ₹48,000
- Accepted delivery quantity: 110 units
- Recorded payment: ₹30,000
- Approved credits: ₹0
- Recorded balance: ₹18,000
- Buyer message: `We received only 110 units instead of 120. Please issue a credit for the missing 10 units.`

Correct system interpretation:
- The invoice records 120 units.
- The delivery record records 110 accepted units.
- A 10-unit discrepancy exists in the supplied records.
- The recorded balance before any approved credit is ₹18,000.
- A credit request is not proof of an approved or issued credit.
- The system cannot infer damage, legal liability, or whether a credit should be issued.

Add a few more synthetic cases for the list view: fully paid, partial payment, unmatched payment claim, duplicate/revised invoice, rate mismatch, and ambiguous invoice reference. Ensure each case has a known expected result.

---

## 8. Technical implementation guidance for Antigravity

### Preferred stack
Use the existing repository's stack if one is already configured. Otherwise:
- React + TypeScript + Vite
- Tailwind CSS
- Lucide React icons
- React Router if multiple routes are implemented
- Papa Parse for CSV parsing
- Recharts only if a real, useful benchmark visual is available; otherwise avoid charts
- `zod` (or equivalent) for runtime schema validation
- Existing supported AI API integration only if credentials are configured; never hard-code API keys

Keep the architecture simple and demo-safe. Do not introduce a database or backend unless the repository already has one and it is straightforward to use. Use local in-memory state or local demo fixtures for the hackathon prototype.

### Suggested structure

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    layout/
      AppShell.tsx
      SidebarNav.tsx
      PageHeader.tsx
    ui/
      Button.tsx
      Card.tsx
      StatusBadge.tsx
      DataTable.tsx
      Drawer.tsx
      EmptyState.tsx
      InlineAlert.tsx
    investigation/
      ClaimMessageCard.tsx
      FindingCard.tsx
      EvidenceSourceChip.tsx
      SourceDetailDrawer.tsx
      TransactionTimeline.tsx
      ReconciliationTable.tsx
      NextVerificationPanel.tsx
    data-sources/
      FileDropzone.tsx
      SourceFileRow.tsx
      ValidationIssueList.tsx
  pages/
    OverviewPage.tsx
    InvestigationsPage.tsx
    NewInvestigationPage.tsx
    InvestigationDetailPage.tsx
    DataSourcesPage.tsx
    BenchmarkPage.tsx
  data/
    demoData.ts
    benchmarkCases.ts
  lib/
    csv/
      parseCsv.ts
      validateRows.ts
    reconciliation/
      calculateBalance.ts
      matchRecords.ts
      buildFindings.ts
    ai/
      extractClaim.ts
      schema.ts
    export/
      exportBrief.ts
  types/
    investigation.ts
  styles/
    globals.css
```

Adjust this structure to the repository rather than blindly duplicating existing files.

### Separation of concerns
- CSV parser loads raw data.
- Validator checks schemas and row integrity.
- Matcher links records; exact matching first, normalized matching second, fuzzy suggestions last.
- Reconciliation engine calculates money and quantity differences deterministically.
- AI extractor interprets the free-text message into structured claim fields.
- Verdict builder assigns status from rules and validated sources.
- UI renders findings and source references.
- Exporter builds the brief from the same investigation object displayed in the UI.

Never let the LLM produce the recorded balance or final verdict.

---

## 9. Accessibility and responsive behaviour

- Ensure WCAG-conscious contrast for text and status badges.
- All actions must be keyboard accessible.
- Use visible focus rings; do not remove outlines without a replacement.
- Add accessible labels to icon-only buttons.
- Statuses must include text, not colour alone.
- On screens under 1024px, collapse the sidebar.
- On mobile, use a top navigation/menu and stack panels vertically.
- Make data tables horizontally scrollable or convert rows into cards.
- The source drawer becomes a full-screen sheet on mobile.
- Preserve the most important information at the top: invoice ID, recorded balance, and investigation status.

---

## 10. Motion and polish

Use restrained micro-interactions only:
- 120–180ms hover and focus transitions
- Subtle row hover and selected-source highlighting
- Stepper progress transitions
- Drawer slide-in
- Skeleton rows while parsing or running
- Success toast after a completed action

Respect reduced-motion preferences. Avoid animated backgrounds, floating blobs, excessive spring animations, and confetti.

---

## 11. Demo flow for judges

The entire demo should be reproducible in roughly 90–120 seconds:

1. Open Overview and click **New investigation**.
2. Click **Use demo dataset**.
3. Paste/show the sample buyer message and select `INV-1048`.
4. Click **Run investigation**.
5. Show the three deterministic summary numbers: ₹48,000 invoice, ₹30,000 payment, ₹18,000 recorded balance.
6. Click the short-delivery finding and open its invoice/delivery sources.
7. Show the missing credit-note finding and explain that a request is not an approved credit.
8. Point to **What to verify next**.
9. Optionally export the brief.

The judge should see evidence links and uncertainty handling, not just an AI-generated paragraph.

---

## 12. Definition of done

### Must have
- [ ] Clean, cohesive app shell and responsive layout.
- [ ] Overview and investigations list populated with labelled synthetic data.
- [ ] New investigation flow with demo dataset.
- [ ] Correct deterministic balance calculation.
- [ ] Claim extraction (AI if configured, otherwise labelled rule/manual fallback).
- [ ] Four evidence statuses.
- [ ] Clickable source references that open actual source details.
- [ ] Visible missing/ambiguous evidence.
- [ ] Working navigation, search/filter, and review action.
- [ ] No dead buttons or fake metrics.
- [ ] No unsupported legal or financial conclusions.
- [ ] Build runs without errors.

### Nice to have only after the core works
- [ ] CSV upload and validation for all supported files.
- [ ] Downloadable Markdown/text evidence brief.
- [ ] Benchmark comparison using genuinely measured results.
- [ ] Editable response draft.

### Cut first if time is tight
1. Response drafting.
2. Fancy charts and dashboard analytics.
3. Fuzzy matching polish.
4. Settings.
5. Any ingestion type beyond structured CSV.

Do **not** cut deterministic reconciliation, source links, missing/ambiguous states, or the end-to-end investigation.

---

## 13. Final instructions to the coding agent

Build the actual working application, not just a static mockup.

1. Inspect the repository and reuse its existing stack, components, and conventions.
2. Implement the hero investigation workspace first, then the end-to-end demo flow.
3. Use the visual design tokens in this document consistently.
4. Seed the app with the synthetic `INV-1048` case and several additional cases.
5. Make all key interactions functional and keep shared data contracts consistent.
6. Calculate every financial figure in deterministic code.
7. Make source records inspectable from every finding.
8. Show honest fallbacks and uncertainty; never fabricate AI success or benchmark metrics.
9. Run the app/build, test the main demo path, and fix errors before finishing.
10. At completion, report what is implemented, what is mocked, what requires credentials, and any remaining limitations.

**Priority order:** correctness → evidence traceability → end-to-end functionality → visual polish → optional features.

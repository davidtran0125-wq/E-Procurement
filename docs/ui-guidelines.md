# ProcureLink UI guidelines (for Phase 2+)

Visual source of truth: `docs/04-design-brief.md` §3. Use tokens in `css/styles.css` (`var(--primary)` etc.), never hex inline. No gradients, no left-border accent cards, no emoji. Prefer classes over `style=""`.

## Page structure
- `.page-h` > `<div><h1>…</h1><div class="sub">…</div></div>` + `.acts` (buttons, right-aligned; wraps on mobile).
- Sections: `App.card(title, body, actions)` (`.card`, `.card-h`, `.card-a`). Layout: `.grid` (auto cards), `.grid-2` (2fr/1fr, stacks <900px), `.grid-k` (KPI row, 2-up on phones), `.stack` (vertical 16px rhythm), `.form-grid`, `.filters`.
- KPI: `App.kpi(label, value, note, tone)`; tone = success|warning|danger.

## Data display
- Material IDs: always `App.mid(id)` (chip link to Material 360). Other doc numbers: `App.docid(id)` or `<a class="mono">`.
- Status: `App.pill(text, tone)` — always text + colour.
- Tables: `App.table(cols, rows, {min, empty, label})`. Numbers/money columns get `cls: 'num'` (right-aligned, tabular, no wrap). Wide tables scroll inside `.tbl-wrap` (keyboard-focusable region); the page must never scroll horizontally. Pass `label` for screen readers.
- Money: `App.vnd`, `App.ty`, `App.num`, `App.pct` — do not hand-format.
- Charts: `App.chart.line({... label})` (SVG, `role="img"` + `aria-label` required) and `App.chart.bars(rows, fmt)` (HTML div bars).

## States
- Empty: `App.emptyState(title, note, actionHtml)` or `.empty` inside tables.
- Loading: `App.loading(label)`.
- Error: `App.errorState(message, retryHtml)` (`.alert-danger`, `role="alert"`). Other alerts: `.alert-info|warning|success`.
- Confirmation: `App.toast(msg)` or `data-act="toast" data-msg="…"`.

## Controls & forms
- Buttons: `.btn` (secondary), `.btn-p` (primary, one per area), `.btn-sm` (32px, in cards/rows), `.btn-d` (destructive). `.linkish` for text buttons.
- Fields: `.field` > `<label for>` + input + `.hint` / `.err` (link via `aria-describedby`, set `aria-invalid`). Segmented: `.seg`. Checkboxes: `.chk` label wrapper.
- Tabs: `App.tabs(id, [[key, label, html]])` (ARIA tabs built in).

## Accessibility & responsive
- Every input has a label; icon-only buttons have `aria-label`. Touch targets ≥36px. Contrast ≥4.5:1 (use `--muted` #5F6672 as the lightest text).
- Focus ring is global (`:focus-visible`); do not remove outlines.
- Breakpoint 900px: sidebar becomes a drawer (`App.setMenu(open)`; closes on Esc, scrim click and navigation). Verify at 390 / 768 / 1440.

## Access & shell
- Register pages with `roles: [...]` when they show internal data. `App.render()` redirects other roles to `App.HOME[role]` with a "No access" notice.
- Signed-in user: `App.state.user` (restored from `pl.user`). Shell labels go through `App.t(label)` (EN/VI, `pl.lang`). Text search uses `App.matches(text, q)` (accent-, case- and space-insensitive).

## Spacing & layout utilities (Phase 2)
- Spacing: `.mt-0`, `.mt-s` (8px), `.mt` (12px) instead of `style="margin-top:…"`. Sub-headings inside cards: `h3.h-sub`.
- Action rows: `.row-acts` (right), `.row-acts.start` (left), `.row-acts.between` (label left, actions right; in `ul.plain` rows get dividers).
- Inline chips in text: `.chips.chips-inline`. Inputs in tables: `.inp.w-full`, `.inp.inp-num` (right-aligned numbers), `.inp.inp-score`.
- Editable grids: define column templates as a class (e.g. `.tc-cols`) and min width (`.tbl-640`); only data-driven widths (bar fills) may stay inline.
- Text buttons inside tables (`.tbl .linkish`) get a 36px target.

## Workflow screens (Phase 3)
- Small buttons (`.btn-sm`) are 36px high to meet the target size rule.
- Progress: `ol.steps` renders a connected stepper — each `li` holds `.st-n` (number or check) + `.st-l`; mark `done` / `cur` (+ `aria-current="step"`) and add a `.sr` "(done)" for screen readers. Keep `.steps` `position: relative` so `.sr` text stays clipped.
- Long detail pages (tender detail) get a sticky `nav.sec-nav` of buttons (`data-sec="<card id>"`) that scroll to and focus the card; cards get `id` + `tabindex="-1"`. Do not use `href="#…"` (the router owns the hash).
- Comparison matrices: `App.table(..., { cls: 'mtx' })` — sticky first column, shaded summary rows (label cell in `<b>`), the lowest compliant price wrapped in `.best` plus a "Lowest" pill (never colour alone). `App.table` accepts `opts.cls` (added to `.tbl-wrap`) and headers carry `role="columnheader"`.
- Inbox pattern: `.ap-split` (list | sticky detail at ≥1200px, stacked below) with `ul.ap-list > li.ap-item` (checkbox · main · `.ap-side` value/SLA/Review). Selected item: `.sel` + `aria-current`.
- Decisions: wrap in `.decide-panel` with an `h3` "Your decision"; the comment always has a `.hint` explaining when it is required, the `.err` is appended to `aria-describedby`; primary action last in `.decide-acts`.
- Validation: `.err` text is prefixed with "!" via CSS; invalid textarea/select/`.inp` get the danger border through `aria-invalid="true"`.
- Empty states (`.state`) render as a dashed, tinted box so they read as intentional. `.dl` stacks to one column under 480px.

## Documents, matching & insights (Phase 4)
- Money KPI rows (PO detail): `.grid-k.kpi-money` scales the value so "₫" never orphans.
- Totals: `dl.dl-tot` (or `.dl-num` for budget figures) — labels left, figures right/tabular; mark the grand total `dt.tot` + `dd.tot` (ruled). Print totals add `.po-tot` (right-aligned block).
- Legend swatches inside text: `<span class="sw sb-inv|sb-warn|sb-pr|sb-rest" aria-hidden="true">` matching the `.stack-bar` segments (PR budget card).
- PO detail lists: `ul.plain.grn-list` (receipts + QC pills), `ul.plain.ncr-list`, `ol.plain.rev-list` (revision timeline, newest first, current dot in primary).
- Match grids: wrap variances with `.var.var-ok` / `.var.var-bad` (always the signed % text + `.sr` "within/outside tolerance"); the offending invoice figure gets `.var-cell`; result pills are prefixed "✓"/"!". Pass `cls: 'match-grid'` so rows with an exception get a light danger tint. The match card spans the full width above the 2-column area so variance columns are visible without scrolling at 1440.
- Charts: `App.chart.line({... name, series: [{name, values (null = gap)}]})` adds up to 3 extra series in brief order (orange, aqua, yellow) with an HTML legend (`.chart-legend`) and direct end labels in ink; put the series values in the `label` too. `bars` rows with `dim` render a grey bar with muted text (no opacity).
- Segmented controls whose labels must not wrap: `.seg.seg-nw`. Dates in tables: `<span class="nowrap">`.
- Print (`@media print`, `@page A4 14mm/12mm`): app chrome, crumbs and `.no-print` hidden, white page, table min-widths dropped, rows/signature block don't split, pill colours kept (`print-color-adjust: exact`).

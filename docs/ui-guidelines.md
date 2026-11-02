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

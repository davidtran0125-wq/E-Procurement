# ProcureLink UI spec (single source)

Tokens live in `css/styles.css` (`:root`). No hex inline, no gradients, no emoji, no `style=""` except data-driven bar widths.

## 1. Language (js/i18n.js)
- Bilingual, **Vietnamese by default**; header/login switch `VI | EN` (`data-act="lang"`) stores `pl.lang` and re-renders. Numbers, money and dates always use vi-VN.
- Every UI string goes through `App.t(key, params)` — dotted keys (`vd.e.mstReq`), `{name}` placeholders. Fallback: current language → English → key (dev hosts log `[i18n] missing key`).
- Register keys next to the page: `I18N.add({ 'xx.key': ['English', 'Tiếng Việt'] })` (always both).
- Data values (statuses, types, categories, known data text) are translated with `App.tv(value)`; `App.pill()` does it automatically. Add values with `I18N.values({...})`, patterned data text with `I18N.patterns([[regex, replacement]])`.
- Not translated: vendor/item names, doc codes (PR-, PO-, CT-, TND-, CERT-…), standard terms (OTIF, VAT, GRN, NCR, MST, SLA, ISO). English data descriptions are wrapped in `lang="en"`.
- Validation errors are stored as keys (or `[key, params]`) and translated at render time.
- `npm test` fails if any literal `t('key')` in `js/` is missing from vi or en.

## 2. Page layout
`App.layout({ title | titleHtml, crumbs, subtitle, actions, alerts, kpis, subnav, blocks })` renders, in this order:
1. **Header** — h1 (22px), subtitle (13px), actions right (wrap on mobile). One primary button.
2. **KPI row** — `App.kpi(label, value, noteHtml, tone)`, max 5 equal tiles in one row (2 per row ≤900px).
3. **Sub-nav** — `App.subnav(base, [[sub, labelKey, badge?]], cur, qs)` → tabs routed as `#/base/sub` (first item = `#/base`). Resolve with `App.sub(items, sub)`; unknown subs fall back to the first and show `App.unknownSub(items, sub)`.
4. **Blocks** — `App.block(title, body, { span: 12 | 6 | 4, actions })` in a 12-column grid. Rows stretch to equal height. 4 → 6 below 1200px; all 12 below 900px.

Rule: the main tab of a module shows only its core (KPI row + main list/primary block). Settings, rules, logs, history, attachments, evaluations, forms and exports are sub-functions.

## 3. Scales
- Spacing: 4 · 8 · 12 · 16 · 24 (`--s1..--s5`). Grid gap 16, block padding 24 (16 on mobile).
- Type: 12 · 13 · 14 · 16 · 22 (`--fs-xs..--fs-xl`). Block title 16, KPI value 22.
- Buttons: `.btn` 40px, `.btn-sm` 36px, `.btn-p` primary, `.btn-d` destructive. Pills: `App.pill(text, tone)` 12px.
- Tables: `App.table(cols, rows, {min, empty, label})`; numbers `cls: 'num'`; wide tables scroll inside `.tbl-wrap` — the page never scrolls horizontally.
- Forms: `App.field(id, label, value, {options, req, hint, err, ph, area, mode, type})`.

## 4. Robustness
- Router error boundary: a throwing `render`/`mount` shows an alert inside the shell; other screens keep working. Unknown routes, IDs (`#/vendors/V-9999`, `#/contracts/X`, `material360?id=X`) and subs render a message, never a blank page.
- Google Fonts loads non-blocking; the system font stack is the fallback.
- Verify over HTTP (`node server.js`), not `file://`: deep link + reload on every route, VI and EN, 1440 and 390, zero console errors, no horizontal scroll.

## 5. Sub-function map (batch 1)
| Module | Main | Sub-functions |
|---|---|---|
| Dashboard | Action required | analytics, tenders, prices |
| Notifications | Inbox | rules |
| Material IDs | List | new, rules (numbering + VAT), workflow, log |
| Material 360° (`?id=`) | Linked tiles, master data, certificates + alt UoM, purchase chain | price, vendors, docs, files |
| Vendors | List | new · profile `V-x`: overview, materials, docs, settings (status, bank, delete), edit |
| Evaluation | Progress | scorecard (`?vendor=`), templates, history |
| Contracts | List | new, offcontract · detail `CT-x`: overview, prices, terms, files |
| Certificates | Register | review (`?id=`), expiring, blocks, upload |

Older conventions (`App.card`, `.grid-2`, `.grid-k`, `App.tabs`) remain for pages not yet migrated (tenders, PR, PO, invoices, approvals, price, reports, supplier, admin).

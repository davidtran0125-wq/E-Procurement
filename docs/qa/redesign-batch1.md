# QA — Redesign batch 1 (Agent 2)

Date: 02/11/2026 · Build: `9af7c5c` (plus Agent 3's uncommitted CSS/markup in the working tree) · Served with `node server.js` over HTTP · Playwright headless Chromium · VI and EN · 1440px and 390px.

## Verdict

**PASS WITH FIXES. No blockers.** One Major (language toggle loses unsaved form input) and eight Minor/Cosmetic findings. Fix RB1-01 before the next Railway deploy, because it breaks the decision "toggle the language mid-flow without losing work".

What was run:
- **Route sweep:** 40 batch-1 routes and sub-functions, plus 4 bad IDs/subs. Each was deep-linked, then reloaded, in VI/EN × 1440/390 (176 loads). Results: **0 console errors or warnings**, 0 router crashes, 0 horizontal page scroll. Every bad ID or sub shows a translated message, never a blank page.
- **Click fuzz:** every button, checkbox and `data-act` link inside `#main` on every batch-1 route was clicked, VI and EN (110 controls each), on a freshly loaded page each time. 0 console errors. The only controls that could not be clicked were `Delete` buttons that are correctly disabled because the vendor has open POs. On the list they show a tooltip, and the settings page shows an alert.
- **Scripted flows:**
  - Login: all 3 roles, plus switch workspace. Errors for missing consent, non-Gmail, not on allowlist, wrong role. Bad invite code, then valid invite. Privacy notice, terms and help.
  - Vendors: list search by Material ID. Edit vendor with bad MST, duplicate MST, missing required field, save, cancel. New-vendor validation. Status change. Onboarding reject (short reason, then valid).
  - Material IDs: new request (duplicate-reason validation, save draft), search, single-source filter.
  - Material 360°: switching the material keeps the sub.
  - Evaluation: scorecard range/required/comment errors, then submit; KPIs update. New period. Template add/save validation, duplicate.
  - Contracts: new-contract validation. Upload validation, then upload; the file appears. Security amount range check.
  - Certificates: review reject without reason, approve with checks unticked, approve. Upload validation. Search and the mandatory filter.
  - Dashboard and notifications: filters, the notification type filter (9 → 1), mark all read. Global search, including the `/` shortcut.
  - Back and forward between sub-nav tabs. The 390px menu.
- **Translation scan:**
  - VI: text nodes, `aria-label`, `placeholder`, `title`, options, toasts and inline errors were scanned for English words. Only RB1-04 and RB1-08 were found.
  - EN: the same was scanned for Vietnamese outside names, data text and doc codes. Only RB1-03 and the RB1-06 placeholders were found.
- **Equal blocks:** every row of `.blocks` at 1440 has equal heights (for example 342/342, 354/354, 497/497, 315/315, 310/310, 293/293, 206/206).
- **Reachability:** 54 checks covering F-05..F-39 (EN text probes) plus the F-01..F-04 login flows all pass. See the table below.

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| RB1-01 | Major | `js/app.js:232` (`a === 'lang'`) | Toggling VI/EN mid-form throws away input the user has not saved, because `render()` rebuilds `#main` from page state and most forms only copy DOM values into state on submit. Reproduced on: vendor **edit** (every field except MST and name), vendor **new** (every field except MST and name), Material ID **new**, contract **new**, contract file **upload**, certificate **upload**. These keep their values: scorecard comment and scores, list filters and search, the dashboard filters. | In the `lang` branch, snapshot the form controls before `render()` and restore them after it: `const snap = [...document.querySelectorAll('#main input[id], #main select[id], #main textarea[id]')].map((e) => [e.id, e.type === 'checkbox' \|\| e.type === 'radio' ? e.checked : e.value, e.type]);` then after `render()`: `snap.forEach(([id, v, ty]) => { const e = document.getElementById(id); if (!e) return; if (ty === 'checkbox' \|\| ty === 'radio') e.checked = v; else e.value = v; });`. Pages read the DOM on submit (`readForm`/`read`), so restoring the DOM is enough. |
| RB1-02 | Minor | `js/pages/login.js:110-126` | Login and invite errors are stored as already-translated strings (`st.err = t('lg.e.…')`). After an error, switching VI → EN leaves the message in Vietnamese. This breaks spec §1: "Validation errors are stored as keys". | Store `st.err = ['lg.e.role', { name: u.name, roles: u.roles }]` (and the same for `st.inviteErr`). Translate in `render()`: `const E = (x) => !x ? '' : Array.isArray(x) ? t(x[0], x[1].roles ? { ...x[1], role: t('ws.' + st.role), roles: x[1].roles.map((r) => t('ws.' + r)).join(', ') } : x[1]) : t(x);`. |
| RB1-03 | Minor | `js/pages/vendors.js:88-97, 294, 297` | `gdtLookup()` returns Vietnamese status text (`'Đang hoạt động'`, `'Ngừng hoạt động'`), which is put raw into the EN toasts `vd.mstResult` and `vd.mstMatch`. EN users see "MST 0315284671 · Đang hoạt động · registered name matches". | Return a code (`status: 'active' \| 'inactive'`) and add `'vd.gdt.active': ['Active (operating)', 'Đang hoạt động'], 'vd.gdt.inactive': ['Ceased operating', 'Ngừng hoạt động']`. Use `t('vd.gdt.' + r.status)` in both toasts and in the MST box. Set `mstVerified: r.status === 'active'`. |
| RB1-04 | Minor | `js/pages/material360.js:128` (purchase chain) | The Delivery step prints `grn.title` raw. In VI it shows "Thép D16 · 50 tấn **on time & in full**", even though `i18n.js:178` already has the translation. | Change `grn ? grn.title : ''` to `grn ? tv(grn.title) : ''`. |
| RB1-05 | Minor | `js/pages/contracts.js:69, 97-98` | The new-contract form defaults to CON-24102 (VAT 8%) starting 01/01/2027. That start date always fails `ct.e.vat8`, and choosing 10% then fails `ct.e.vatMatch`, so a 2027 contract can never be created for any 8% material. The blank form also shows the VAT error alongside the required-field errors. | In `validate`, accept the standard rate after the reduction ends: `const expect = m && m.vat === 8 && validDate(f.start) && App.dt(f.start) > App.dt('31/12/2026') ? 10 : m && m.vat; if (m && +f.vat !== expect) e.vat = ['ct.e.vatMatch', { id: m.id, v: expect }];`. Default `vat` in `blank()` to that `expect` value. |
| RB1-06 | Minor | `js/pages/login.js:9, 24, 27` | The placeholders `[TÊN CÔNG TY]` / `[YOUR COMPANY]` are visible on the live login: consent line, privacy notice, Terms toast. Users read them as unfinished UI. | Add `DATA.company = 'Công ty CP ProcureLink Demo'` (or the real legal name) to `js/data.js`. Change the three keys to use `{co}` and pass `{ co: window.DATA.company }`. |
| RB1-07 | Cosmetic | `js/i18n.js:111`, `js/pages/vendors.js:47` | `Probation` is translated as "Thử thách" ("challenge"). That wording is unnatural for a vendor status. | Use "Theo dõi" (watch list) everywhere: `Probation: 'Theo dõi'`, `vd.toProbation` → `'Duyệt → Theo dõi'`. |
| RB1-08 | Cosmetic | `js/data.js:238, 244, 459` | The `(portal)` suffix in `by` text appears in English on VI screens (vendor settings bank change; PO confirmation). | Add the pattern `[/^(.*) \(portal\)$/, '$1 (cổng NCC)']` to `I18N.patterns`, and render `by` through `tv()` (vendors.js settings block). |
| RB1-09 | Cosmetic | `css/styles.css` `.subnav` (Agent 3) | At 390px the sub-nav overflows inside itself (scrollWidth 607 vs 358). Tabs to the right, such as Settings and Edit on a vendor, are hidden with nothing showing that the bar scrolls. The page itself does not scroll horizontally. | Add a right-edge fade, `mask-image: linear-gradient(90deg, #000 85%, transparent)`, while scrollable. Alternatively, scroll the active tab into view on mount: `document.querySelector('.subnav .on')?.scrollIntoView({ inline: 'center', block: 'nearest' })`. |

Checked and OK (not findings):
- Back and forward restore the correct sub-tab, and deep link + reload works on every sub.
- The `?vendor=` / `?id=` query survives sub-nav clicks.
- The language choice persists (`pl.lang`).
- The search query, filters and scorecard draft survive a language toggle.
- All inline validation errors on batch-1 screens re-translate on toggle (they are stored as keys), except login (RB1-02).
- Toasts disappear after 2.6s.
- The `/` shortcut focuses search.
- At 390px the menu opens and closes on navigation.

## Feature reachability (F-01..F-39)

| F | Feature | Where now | OK |
|---|---|---|---|
| F-01 | Gmail sign-in, allowlist | `#/login` | ✓ (all errors tested) |
| F-02 | Role routing, switch workspace | login → `#/dashboard`, `#/supplier`, `#/admin/users`; sidebar Switch | ✓ |
| F-03 | Accept supplier invitation | `#/login` → "Have an invitation" | ✓ |
| F-04 | Privacy notice & consent | `#/login` consent + notice | ✓ (RB1-06) |
| F-05 | Dashboard KPIs, filters, charts, Export/New PR | `#/dashboard` (KPIs, filters) · `#/dashboard/analytics` (charts) | ✓ |
| F-06 | Action required + bell | `#/dashboard`, `#/notifications` (filter, mark read) | ✓ |
| F-07 | Tenders closing | `#/dashboard/tenders` | ✓ |
| F-08 | Price alerts by Material ID | `#/dashboard/prices` | ✓ |
| F-09 | Shell: search, menu, language, approvals badge | header / sidebar, `#/search?q=` | ✓ |
| F-10 | Material ID list, filters, Import/Export | `#/materials` | ✓ |
| F-11 | Numbering rules, change log | `#/materials/rules`, `#/materials/log` | ✓ |
| F-12 | New Material ID request | `#/materials/new` | ✓ |
| F-13 | Mandatory certificates per Material ID | `#/material360?id=` (main) | ✓ |
| F-14 | Default VAT, 8% reduction | `#/materials/rules`, Material 360° master data | ✓ |
| F-15 | Duplicate check | `#/materials/new` | ✓ |
| F-16 | Material ID approval workflow | `#/materials/workflow` | ✓ |
| F-17 | Material 360° profile and links | `#/material360?id=` | ✓ (RB1-04) |
| F-18 | Approved vendors, supply risk | `#/material360/vendors?id=` | ✓ |
| F-19 | Purchase chain, price, docs | Material 360° main · `/price` · `/docs` · `/files` | ✓ |
| F-20 | Vendor list, Edit/Delete/New/Import | `#/vendors`, `#/vendors/new` | ✓ |
| F-21 | Vendor risk, re-check | `#/vendors` | ✓ |
| F-22 | Create/edit vendor | `#/vendors/new`, `#/vendors/V-x/edit` | ✓ (RB1-01) |
| F-23 | MST check | vendor edit / profile | ✓ (RB1-03) |
| F-24 | Bank change pending Finance | `#/vendors/V-x/settings` | ✓ (RB1-08) |
| F-25 | Material IDs supplied | `#/vendors/V-x/materials` | ✓ |
| F-26 | Status and delete | `#/vendors/V-x/settings` | ✓ |
| F-27 | Criteria templates, grade thresholds | `#/evaluation/templates` | ✓ |
| F-28 | Vendor scorecard | `#/evaluation/scorecard?vendor=` | ✓ |
| F-29 | Periods and progress | `#/evaluation`, `#/evaluation/history` | ✓ |
| F-30 | Contract list, off-contract banner | `#/contracts`, `#/contracts/offcontract`, `#/contracts/new` | ✓ (RB1-05) |
| F-31 | Contract header actions (Amend/Renew/Release PO) | `#/contracts/CT-x` | ✓ |
| F-32 | Prices by Material ID, price adjustment | `#/contracts/CT-x/prices` | ✓ |
| F-33 | Volume commitment, POs released | `#/contracts/CT-x` | ✓ |
| F-34 | Terms, performance security | `#/contracts/CT-x/terms` | ✓ |
| F-35 | E-signature, versioned files, Upload | `#/contracts/CT-x/files` | ✓ |
| F-36 | Certificate register | `#/certificates`, `/upload` | ✓ |
| F-37 | Review supplier upload | `#/certificates/review?id=` | ✓ |
| F-38 | Block on expired mandatory certificate | `#/certificates/blocks` | ✓ |
| F-39 | 90-day expiry timeline | `#/certificates/expiring` | ✓ |

## Fix status (Agent 1)

| ID | Status | Fix |
|---|---|---|
| RB1-01 | Fixed | `js/app.js` lang toggle snapshots every `#main` input/select/textarea (value or checked) before `render()` and restores it after. |
| RB1-02 | Fixed | Login/invite errors stored as keys (`'lg.e.x'` or `['lg.e.role', {name, role, roles}]`), translated in `render()`. |
| RB1-03 | Fixed | `gdtLookup()` returns `code: 'active' \| 'inactive'`; MST box and both toasts use `vd.gdt.active/inactive`; `mstVerified` from the code. |
| RB1-04 | Fixed | Material 360° purchase chain prints `tv(grn.title)`. |
| RB1-05 | Fixed | `vatFor(material, start)`: 8% materials expect 10% for contracts starting after 31/12/2026; the blank form defaults to it (no VAT error on a blank form). |
| RB1-06 | Fixed | `DATA.company = { name, mst, address, dpoEmail }` kept but empty. Consent line, privacy intro and Terms toast use neutral wording until `name` is set (then `{co}` variants); the privacy Contact row and invoice buyer-name line are hidden while empty. No raw `[YOUR COMPANY]` placeholder is user-facing. |
| RB1-07 | Fixed | Probation → "Theo dõi"; `vd.toProbation` → "Duyệt → Theo dõi". |
| RB1-08 | Fixed | Pattern `(.*) (portal)` → `$1 (cổng NCC)`; vendor settings bank `by` rendered via `tv()` (PO confirmations in batch 2). |
| RB1-09 | Fixed | Overflowing `.subnav` gets edge fades (`.more-r` / `.more-l` mask) updated on scroll/resize, and the active tab is scrolled into view. Vendor list column minimums cut to 1100px (fits at 1440 without inner scroll). |

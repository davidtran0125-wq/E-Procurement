# QA — Redesign batch 2 (Agent 2)

Date: 03/11/2026 · Build: `1c2267a` + Agent 3's `e87ee02` · Served with `node server.js` over HTTP · Playwright headless Chromium · VI and EN · 1440px and 390px.

## Verdict

**PASS WITH FIXES. Two Major findings must be fixed before deploy (RB2-01, RB2-02).** Both are stale-state bugs where the screen acts on a different record than the URL names. In the flow they led to approving the wrong PR and creating a tender from the wrong PR. RB2-03 is also Major: supplier-portal events show up in English on the Vietnamese procurement screens. The other findings are Minor or Cosmetic.

What was run:
- **Route sweep:** 55 batch-2 routes and sub-functions, plus 9 bad IDs/subs. Each was deep-linked, then reloaded, in VI/EN × 1440/390 (256 loads). Results: **0 console errors or warnings**, 0 crashes, 0 blank pages, 0 horizontal page scroll. At 390 no element overflows outside `.tbl-wrap`/`.subnav`. Every block row at 1440 has equal heights. Bad IDs show a translated `alert-danger`; bad subs show `unknownSub` (alert-warning) and fall back to the first tab.
- **Click fuzz:** every button, link, tab and checkbox in `#main` on all 55 routes was clicked on a freshly loaded page each time: **666 controls × VI and EN**, 0 errors, 0 crashes. The 12 disabled controls are correctly disabled (bulk approve with nothing selected, SoD-blocked Approve). All 42 resulting toasts and inline errors are fully translated in both languages.
- **End-to-end flow through the real login UI** (users switched with the sidebar Switch, data kept in memory), run in VI and again in EN. Every step passed:
  1. Lê Quốc Huy creates a PR (CON-24102 × 30). The language was toggled mid-form and the input was kept.
  2. The dept-head step is approved. Only the Admin workspace can do this (see RB2-07).
  3. Minh Anh creates tender TND-2026-036 from an approved PR.
  4. Minh Anh submits the TND-2026-029 award recommendation (with justification). It is SoD-routed to Đỗ Hoàng Nam, who approves it, and the tender becomes Awarded.
  5. Award → Create PO opens `#/po?tender=`.
  6. A PO is created from the PR for Minh Phát. Its approval is SoD-routed to Đỗ Hoàng Nam. He approves it, and it is sent.
  7. Võ Thị Lan confirms in the supplier portal. The buyer sees "Đã xác nhận bởi Võ Thị Lan (cổng NCC)".
  8. Trần Bảo Ngọc (not the buyer) records a GRN with 30 delivered, 27 accepted and 3 rejected, after the required-field validation and the CO/CQ check. This creates NCR-2026-018 (Return to vendor). The language was toggled mid-form.
  9. The supplier submits an e-invoice against GRN-2026-1540.
  10. The 3-way match shows "3 blocked · NCR open" and ✓ Khớp. The invoice is marked Ready for payment, then exported to accounting.
- **Other checks:** back/forward across PO sub-tabs restores the correct tab. Deep link + reload works on every sub. Approvals history re-translates on toggle.
- **Translation scan:**
  - VI: every text node, placeholder, aria-label and title was scanned for ASCII words. Only data text and the issues below were found.
  - EN: the same was scanned for Vietnamese diacritics. Only names, data text and the issues below were found.
  - Terminology is consistent with batch 1: mã vật tư, NCC, PR/PO, GRN, NCR, chưa VAT, Theo dõi, cổng NCC, Chờ tôi duyệt. Procurement terms read naturally: tờ trình trao thầu, niêm phong, mở thầu, bảo đảm dự thầu, đối chiếu 3 bên, dung sai, chứng từ giảm trừ, hóa đơn thay thế.
- **Batch-1 regression:** the batch-1 screens were reached during the flow (dashboard, notifications, vendors, Material 360°) with 0 errors. RB1-01 is now partly regressed for checkbox groups (RB2-05).

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| RB2-01 | Major | `js/pages/approvals.js` render (`if (p.id && p.id !== st.lastId)`) and mount (`k === 'open'`) | `?id=` is ignored when it equals the last deep-linked id. Repro: open `#/approvals?id=PR-2026-0438`, click INV-2026-0322 in the queue (the URL keeps `?id=PR-2026-0438`), go to the dashboard, open `#/approvals?id=PR-2026-0438` again. **INV-2026-0322 is selected.** Switching users has the same effect: Admin opened the PR from a link and approved **PR-2026-0431** instead. | In `open`, update the URL as well: `history.replaceState(null, '', '#/approvals' + (sub ? '/' + sub : '') + '?id=' + encodeURIComponent(b.dataset.id))`. Set `st.lastId = b.dataset.id`. In render, always honour the link: `if (p.id && p.id !== st.sel && p.id !== st.lastId \|\| p.id && App.routeChanged) …`. The simplest version: reset `st.lastId = null` in the router's hashchange for any route other than approvals, so that the next `?id=` always selects. |
| RB2-02 | Major | `js/pages/tenders.js:153-156, 465` | `st.nf` (the new-tender form) survives a change of `?pr=` / `?mat=`, because `st.cur` stays `'new'` while the user visits other modules. Repro: `#/tenders/new?pr=PR-2026-0436`, then go to `#/pr`, then `#/tenders/new?mat=CON-24102`. The form still shows PR-2026-0436 and has no Material field. In the flow, saving created TND-2026-036 from the wrong PR, and that PR became "In tender". | Key the form on its source. In render: `const src = (p.pr \|\| '') + '\|' + (p.mat \|\| ''); if (st.nf && st.nfSrc !== src) st.nf = null; st.nfSrc = src;` before `if (!st.nf)`. Apply the same to `po.js` `st.nf` (`?pr/?tender/?contract`). |
| RB2-03 | Major | `js/pages/supplier.js:41` (`notify`), lines 317/413/420/428/433/440/448 | Supplier actions write English notifications into `DATA.notifications`. The VI procurement dashboard and `#/notifications` then show the type filter "Supplier portal" and text such as "INV-2026-0325 submitted by Minh Phát via portal · GRN-2026-1528 · 230.250.000 ₫ excl. VAT". The supplier portal itself is still English in VI: `Purchase orders`, `Printable PO`, `Submit e-invoice`, the type options `Gốc / Adjustment / Thay thế`, and toasts such as "PO-2026-0890 confirmed · buyer notified". | Store each notification as a key with params (`{ key: 'sp.n.inv', p: { id, v, grn, net } }`) and render it with `t()`. Add `'Supplier portal': 'Cổng NCC'` to `I18N.values`. Until the supplier module is migrated (batch 3), at minimum add `I18N.patterns` for the 7 notify templates. |
| RB2-04 | Minor | `js/pages/po.js:219, 274` | Changing the vendor in the new-PO form keeps the previous vendor's payment terms. Repro: `po/new?pr=PR-2026-0436` defaults to V-1004 (45 days). Choosing V-1003 (master: 30 days) still shows "45 ngày sau hóa đơn". The flow PO for Minh Phát was issued as 45 days, but the invoice due date uses the vendor master (+30 days), so the PO and the invoice disagree. | In the `data-pn=vendor` change handler, recompute `f.terms = ((App.vendor(f.vendor) \|\| {}).terms \|\| '30 days').split(' ·')[0].replace(/^(\d+) days$/, '$1 days after invoice')` before `App.render()`. Do this only if the user has not edited the terms (keep a `f.termsEdited` flag set in `readNew`). |
| RB2-05 | Minor | `js/app.js:247` (lang toggle snapshot) | The RB1-01 fix only restores controls that have an `id`. Checkbox groups that use `name=` lose their ticks on a VI/EN toggle: GRN document checks (`#po-grn [name=checks]`) and delegation types (`#ap-dlg [name=types]`). | Snapshot by name+value too: `document.querySelectorAll('#main input[type=checkbox][name], #main input[type=radio][name]')` → key `name + '=' + value`; restore with `querySelector('#main input[name="'+n+'"][value="'+v+'"]').checked = c`. |
| RB2-06 | Minor | `js/pages/po.js:37, 307` (`po.submitted`) | The submit toast always says "→ Procurement Lead approval / Trưởng phòng Mua sắm duyệt". In the flow the PO was SoD-routed to Đỗ Hoàng Nam (the buyer is the Lead), and > 2 tỷ goes to the Finance Director. | Use the computed approval: `t('po.submitted', { id, v: vnd(net), a: approval.assignee })` with `'{id} submitted · {v} excl. VAT → {a}'` / `'Đã gửi {id} · {v} chưa VAT → {a} duyệt'`. |
| RB2-07 | Minor (pre-existing, not a regression) | `js/pages/pr.js:79` | The PR step "Dept head" is assigned to the department name (`pr.dept`, for example "Kho A"). No procurement user has it in their queue, so only the Admin workspace can approve step 1 of a new PR. | Map departments to a head user (`D().deptHeads = { 'Kho A': 'Lê Quốc Huy', … }`) and assign `[ 'Dept head', D().deptHeads[pr.dept] \|\| pr.dept ]`. Apply the requester ≠ approver SoD to it. |
| RB2-08 | Minor | `js/pages/tenders.js` detail header actions | "Nhắc nhà thầu / Remind bidders" is the header action on closed and awarded tenders (TND-2026-027 Awarded, TND-2026-029 closed with 4/4 bids). | Show it only when `doc.status` is Open/Q&A and `daysTo(close) >= 0`. Otherwise show the award action (Create PO when awarded). |
| RB2-09 | Minor | `js/app.js` short-money helper (`App.ty`) | EN shows the Vietnamese unit "tỷ ₫" in KPIs, reports and aria-labels ("0,7 tỷ ₫", "Spend YTD 186,4 tỷ ₫", "≤ 2 tỷ · + Procurement Lead"). Spec §1 keeps vi-VN number formatting, not Vietnamese words. | In `ty()`: `state.lang === 'en' ? n + ' bn ₫' : n + ' tỷ ₫'`. Do the same for the reports/cycle band labels. |
| RB2-10 | Cosmetic | `js/data.js` (budgets, PO titles, Q&A), `js/pages/invoices.js` | The following data text is untranslated: <br>• VI: the budget "Nhà xưởng C2 · **Steel**" (reports/budget, PR cost centre), the PO titles "**Release** CT-2026-008 · thép D16/D20" (PO list), the Q&A answer "…theo spec **Material ID**", and "· **top** 5" on reports/spend. <br>• EN: the GDT error "Không tìm thấy hóa đơn trên hệ thống GDT" (INV-2026-0321). | Change the data to "Thép" / "Phát hành CT-2026-008 · …" / "mã vật tư" and use a key for "top 5". For the GDT message, add an `I18N.values` entry: `'Không tìm thấy hóa đơn trên hệ thống GDT'` → EN "Invoice not found in the GDT system" (store it as the EN source and render with `tv()`). |

Checked and OK (not findings):
- Batch-2 screens keep data units (tấn, bộ, cái, chuyến) and Vietnamese legal invoice field names (Mẫu số, Ký hiệu, Mã CQT) in EN. Both are acceptable under spec §1.
- SoD is enforced throughout the flow: the evaluator cannot approve the award, the buyer is warned on the GRN, and the PO approval is routed away from the buyer.
- "Only approved PRs" is enforced on PO and tender creation.
- The NCR quantity is blocked from invoicing.
- Sealed bids (TND-2026-031) hide prices until opening.

## Feature reachability (F-40..F-86)

56 EN text probes, plus the flow above. ✓ = present at the location.

| F | Feature | Where now | OK |
|---|---|---|---|
| F-40 | Tender list, filters, New | `#/tenders`, `#/tenders/new` | ✓ (RB2-02) |
| F-41 | Sealed bids | `#/tenders/TND-2026-031/bids` | ✓ |
| F-42 | Progress, settings, files | `#/tenders/TND-x` · `/settings` · `/files` | ✓ |
| F-43 | Two-person opening & minutes | `#/tenders/TND-2026-027/bids` | ✓ |
| F-44 | Q&A & addenda | `#/tenders/TND-2026-032/qa` | ✓ |
| F-45 | Committee & COI | `#/tenders/TND-x` (overview) | ✓ |
| F-46 | Technical evaluation | `#/tenders/TND-2026-029/evaluation` | ✓ |
| F-47 | Price comparison & bid security | `/evaluation`, KPI row | ✓ |
| F-48 | Award recommendation & notices | `#/tenders/TND-x/award` (notices after approval) | ✓ (tested in the flow) |
| F-49 | e-Auction & foreign-currency bids | `#/tenders/TND-2026-034/settings`, `TND-2026-032/settings` | ✓ |
| F-50 | PR info | `#/pr/new` | ✓ |
| F-51 | Budget check | `#/pr/PR-x/route`, PR form | ✓ |
| F-52 | Lines by Material ID | `#/pr/new` | ✓ |
| F-53 | Buying-method suggestion | `#/pr/new` | ✓ |
| F-54 | Approval route preview | `#/pr/new`, `/route` | ✓ (RB2-07) |
| F-55 | PR attachments | `#/pr/PR-x/files` | ✓ |
| F-56 | Inbox & bulk approve | `#/approvals` | ✓ |
| F-57 | Item detail | `#/approvals?id=` | ✓ (RB2-01) |
| F-58 | Approve / Reject / Return | `#/approvals` | ✓ |
| F-59 | Delegation | `#/approvals/delegation`, `/delegated` | ✓ (RB2-05) |
| F-60 | SoD | `#/approvals/delegation`, queue badge | ✓ |
| F-61 | PO list | `#/po` | ✓ |
| F-62 | PO from source | `#/po/new?pr=\|tender=\|contract=`, `#/po?tender=` | ✓ (RB2-04, RB2-06) |
| F-63 | PO detail & confirmation | `#/po/PO-x` | ✓ |
| F-64 | Schedule & GRN | `#/po/PO-x/receipts` | ✓ |
| F-65 | QC & NCR | `#/po/PO-x/receipts` | ✓ |
| F-66 | 3-way summary | `#/po/PO-x/match` | ✓ |
| F-67 | Change orders & revisions | `#/po/PO-x/revisions` | ✓ |
| F-68 | Cancel PO / open qty | `#/po/PO-x/revisions` | ✓ |
| F-69 | Print & attachments | `#/po/PO-x/print`, `/files` | ✓ |
| F-70 | E-invoice inbox | `#/invoices`, `/rules` | ✓ |
| F-71 | Legal checks | `#/invoices/INV-x` | ✓ |
| F-72 | 3-way match per line | `#/invoices/INV-x/match` | ✓ |
| F-73 | Exception handling | `#/invoices/INV-x` (credit note, accept → approvals) | ✓ |
| F-74 | 2-way match for services | `#/invoices` | ✓ |
| F-75 | Payment status & export | `#/invoices/INV-x` (Ready, Export) | ✓ (tested in the flow) |
| F-76 | Material ID picker & filters | `#/price?id=` | ✓ |
| F-77 | Price KPIs | `#/price` | ✓ |
| F-78 | Chart by vendor & comparison | `#/price/trend`, `/vendors` | ✓ |
| F-79 | Price alert rule | `#/price/rule` | ✓ |
| F-80 | Price records | `#/price` | ✓ |
| F-81 | OTIF filters & KPIs | `#/reports` | ✓ |
| F-82 | OTIF by vendor | `#/reports` | ✓ |
| F-83 | Saving KPIs | `#/reports/saving` | ✓ |
| F-84 | Saving method & records | `#/reports/saving` | ✓ |
| F-85 | Spend analysis | `#/reports/spend` | ✓ (RB2-09) |
| F-86 | Budget vs committed/actual | `#/reports/budget` | ✓ |

R-requirements observed in this pass: the following still hold.
- R-05: sealed bids.
- R-06: on behalf of.
- R-12: Create PO only after award approval.
- R-18: SoD.
- R-22/R-23: e-auction and foreign currency.
- R-03: the 8% VAT banner.
- R-25: consent on every login.

The NCR-blocks-invoice and tolerance rules also hold. RB2-04 weakens payment-term consistency.

## Fix status (Agent 1)

| ID | Status | Fix |
|---|---|---|
| RB2-01 | Fixed | `approvals.js`: opening an item from the queue rewrites the URL to `?id=<item>` (`window.history.replaceState`) and sets `lastId`; leaving My approvals (any other hash) clears `lastId`, so the next `?id=` always selects. Verified: repro now selects PR-2026-0438. |
| RB2-02 | Fixed | `tenders.js` new-tender form keyed on `?pr=|?mat=` (`st.nfSrc`); `po.js` new-PO form keyed on `?pr=|?tender=|?contract=`, draft form keyed on its PO id. |
| RB2-03 | Fixed (batch 3) | Notifications can be stored as `{ k, p }` and are rendered with `App.ntext()` (dashboard / notifications). Supplier-portal, PO-declined and certificate notifications now use keys; the supplier portal is fully translated in batch 3. |
| RB2-04 | Fixed | Vendor change recomputes payment terms from the vendor master unless the user edited the terms (`termsEdited`). |
| RB2-05 | Fixed | Language toggle also snapshots/restores id-less checkbox and radio groups by name + value. |
| RB2-06 | Fixed | `po.submitted` names the computed approver (`→ {a} duyệt`). |
| RB2-07 | Fixed | `DATA.deptHeads` maps departments to head users; the dept-head step is assigned to that user, with requester ≠ approver SoD (`pr.sod.head`). |
| RB2-08 | Fixed | "Remind bidders" only while Open/Q&A and before closing; Awarded → Create PO, Evaluation/closed → Award. |
| RB2-09 | Fixed | `App.ty()` / `App.tyU()` print "bn ₫" in EN; EN keys and report band labels (`I18N.valuesEn`) no longer show "tỷ". |
| RB2-10 | Fixed | Data changed to "Thép", "Phát hành CT-…", "thông số mã vật tư"; "top 5" translated; new `I18N.valuesEn` (VI data → EN) used for the GDT message and the release PO titles. |
| Agent 3 | Fixed | PO receipts tab keeps one primary "Ghi nhận nhập kho" (block action only); price "vs 90-day average" note shortened to "BQ {a} · {n} bản ghi". |

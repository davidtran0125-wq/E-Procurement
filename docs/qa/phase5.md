# ProcureLink — QA Phase 5 (Agent 2) · final

**Verdict: PASS WITH FIXES — release after P5-01.** 1 Blocker · 5 Major · 6 Minor · 1 Info.

**Scope:** F-87 to F-108 (Supplier portal, Admin console), then a final end-to-end pass over the whole app and the R-01..R-25 coverage table. I read js/pages/supplier.js, js/pages/admin.js and the parts of js/app.js, js/sourcing.js, login.js, invoices.js, pr.js, po.js and approvals.js that consume the admin settings. I tested in headless Chromium (Playwright, `file://`):
- Swept all `#/supplier/...` and `#/admin/...` routes × 3 roles × 1440/390 px.
- Ran every supplier form (bid, addendum ack, PO confirm/decline, date change, ASN, NCR response, e-invoice, profile/MST, Material ID proposal) and every admin form (invite, suspend, delete personal data, access policy, allowlist, privacy publish, matrix, delegation, tolerances, SoD, notification rules, integrations retry) at 1440 and 390 px, including the empty-submit validation of each.
- Checked the effect of each supplier/admin action on the procurement screens and the audit log.
- `npm test` passes: 23 assets and 29 pages registered.

No code files were edited. These data decisions are accepted and consistent: PO-2026-0889 (CT-2026-008 release, 20 tấn CON-24020 × 14.354.500 = 287.090.000 + VAT 10% 28.709.000 = 315.799.000 ₫); TND-031 Addendum 01; Minh Phát receipt RC-031-001; V-1001 pending bank Vietcombank ···· 5307; INV-0314 hidden from Minh Phát.

**What holds**
- **Console and layout:** no console errors on any route or form. No horizontal page scroll at 390 px on any phase-5 route or open form.
- **Role guard:** Supplier → any `#/admin/*`, `#/dashboard`, `#/po`, `#/invoices`, `#/tenders/*` redirects to `#/supplier` with "No access". Admin and Procurement → `#/supplier/*` redirect home. Procurement → `#/admin/*` redirects to the dashboard. Admin can open procurement pages. Unknown/foreign documents (`#/supplier/pos/PO-2026-0874`, `#/supplier/invitations/TND-2026-029`) show "not found in your portal".
- **Supplier data isolation:** full text dumps of all 13 supplier pages for V-1001 and V-1003 contain no other vendor's name, ID, invoice or price. Minh Phát sees only INV-0319/0318 (INV-0314 hidden). Result notices show own rank only ("1 of 4"). Q&A is anonymous. Spot quotation shows only its own price.
- **Sealed bids (R-05):** while TND-031 is open, Procurement sees no price (no 15.450.000 / 1.854.000.000 anywhere); "Open bids" is disabled. Revise / withdraw / resubmit update the bidder row (receipt, time) but never the price. Closed TND-024 shows "Bidding closed" and no buttons.
- **Bid form (F-88..F-91):** submit is blocked until Addendum 01 is acknowledged; security < 35.000.000, validity < 03/02/2027 and a non-PDF file are rejected; all commitments incl. privacy consent required. Line math 120 × 15.450.000 = 1.854.000.000; VAT 10% locked for metals, 8% "reduced, until 31/12/2026" for CON-24102/24330. Revision keeps RC-031-001 (v2); withdraw + resubmit issues RC-031-005 (v3). Audit: "Sealed bid … (content sealed)", "Addendum 01 acknowledged", "Sealed bid withdrawn".
- **Overview (F-87):** Open POs 4 = 287.090.000 + 1.216.000.000 + 460.500.000 + 703.237.500 = 2.666.827.500 ₫; OTIF 95,8% (46/48); scorecard 4,32 A; 5 actions, 3 notifications.
- **PO (F-92/93):** decline needs ≥ 10 characters; confirm → procurement PO-0889 "Confirmed by Võ Thị Lan (portal)"; decline → "declined by supplier" + notification. Date change → PO-0877 "Supplier asks 14/11/2026 · review". ASN validates qty ≤ open qty, vehicle and mill certificate.
- **Contracts (F-94):** CT-2026-008 505 + 135 = 640 / 1.200 = 53%; after the PO-0889 release 660 / 1.200 = 55% on the procurement side.
- **NCR (F-96):** comment ≥ 10 chars; the response shows on PO-0866 and in notifications.
- **Profile (F-97/98):** MST format check ("10 digits, or 10 + -NNN"); legal rep required; bank 5307 "Pending Finance verification" and the same on Vendors V-1001 and My approvals (Finance call-back, SoD note); checklist 6/8 = 75%; CON-24325 proposal "awaiting buyer approval".
- **Admin:** invite rejects non-Gmail and empty name, sends with 7-day expiry; delete personal data refuses an Active user, needs a reason, anonymises to U-0003 (`u-0003@deleted.invalid`); idle timeout 5–240; allowlist accepts Gmail/Workspace only; privacy publish needs a 10-char summary; matrix band 2 > band 1; delegation ≤ 14 days; tolerance price 0–5%; SoD mode change; Retry fails while the Material ID is unmapped. **Every one of these writes an audit entry** (Settings / Data privacy) and the count goes 18.420 → 18.421+.
- **Tolerances flow to Invoices:** the banner and per-line variance use `DATA.tolerance` (but see P5-05).

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| P5-01 | Blocker | js/pages/supplier.js `submitInv()` (≈ line 304) + js/pages/invoices.js detail actions (line 106) | **A supplier e-invoice can never be paid.** The portal invoice is stored with `stage: 0`, status "Submitted · to match". On `#/invoices/INV-2026-0325` every line shows "✓ Matched" and legal checks pass, but the action bar only offers buttons for `stage === 2` or exceptions, so there is no "Mark ready for payment" and no way to advance it. The main flow e-invoice → 3-way match → ready for payment breaks at the last step. | In invoices.js before computing `acts`: `if (lok && allOk && v.stage < 2) { v.stage = 2; d.status = 'Matched'; }` (auto-match when checks pass), and if any line fails set `d.status = 'Exception · ' + (priceExc ? 'price ' + sg(priceExc.pd) : 'qty')`, `v.stage = 1`, `v.assigned = <buyer of the PO>`. Supplier list then follows from `stageOf(d)`. |
| P5-02 | Major | js/pages/supplier.js line 270 `invoicedQtyGrn` | **GRN-2026-1490 can be invoiced twice.** Replacement invoices are excluded from the invoiced qty, and the original (00001229) is not in the data, so INV-0318 (Replacement, 45 tấn, Matched) counts as 0 and the GRN is offered as "45 accepted, not invoiced". | Count replacements and drop the invoice they replace: `const replaced = new Set(Object.values(D().invoices).filter((v) => v.type === 'Replacement' && v.orig).map((v) => v.orig.split(' (')[0]));` then filter `v.grn === gid && !replaced.has(v.kh + ' · ' + v.no)`. |
| P5-03 | Major | js/pages/pr.js lines 40–42, 107; js/pages/po.js lines 157, 179, 211 | **Approval matrix changes have no effect (F-102, R-06).** Admin saved bands ≤ 100tr / ≤ 1 tỷ and capex 1 tỷ (toast: "applies to new PRs, POs and change orders"), but PR and PO routing still use the hard-coded 200.000.000 / 2.000.000.000 / 1.000.000.000. `DATA.approvalBands` / `approvalRules` are read only by admin.js. | Replace the literals with `const B1 = D().approvalBands[0][0], B2 = D().approvalBands[1][0], CX = D().approvalRules[0].above;` and use them in the route steps, the band legend (pr.js 107) and po.js route text. Skip rules with `approvalRules[i].on === false`. |
| P5-04 | Major | js/pages/approvals.js line 16 `blocked()` | **SoD mode is not enforced (F-103, R-18).** Switching "Requester ≠ approver…" to Warn is saved and audited and shown as "Warn" in My approvals, but PO-2026-0877 Rev.2 is still "Blocked — SoD". The mode is ignored. | `const sodMode = () => ((D().sodRules.find((r) => /^Requester ≠ approver/.test(r[0])) || [])[1]);` `const blocked = (a) => a.sod && sodMode() !== 'Warn' && (!a.override \|\| a.by === S.me());` and when mode is Warn render an `alert-warning` "SoD warning — you raised this item; approval is logged" instead of the danger banner, and audit the approval as an override. |
| P5-05 | Major | js/pages/invoices.js (status derivation) / admin.js `ad-tol` toast | **Tolerance change does not re-match.** With price tolerance set to 2%, INV-2026-0320 (+1,2%) still shows "Exception · price +1,2%" and "On hold", while the toast says "invoices are re-matched with the new values". The stored `d.status` is never recomputed. | When rendering an invoice with status `Exception · price…` and no approval in flight, recompute: if every line now has `res === 'Matched'` set `d.status = 'Matched'; v.stage = 2; v.hold = null; v.resolveBy = null`. Same check in the list/KPI pass. (Alternatively change the toast to "applies to invoices received from now on" — but then the spec F-104 wording must change.) |
| P5-06 | Major | js/pages/login.js `onsubmit`; js/pages/supplier.js line 376; js/pages/admin.js line 36 | **Privacy re-acceptance is not recorded (F-101, R-25).** Publishing v2.2 sets `u.consentVer = 'Re-acceptance pending'`, but nothing reads it: sign-in does not record the new acceptance (`accepted` stays 0), and the supplier profile then says "Privacy notice **v2.2** accepted 12/01/2026" — a false consent record. | login.js success branch: `if (u.consentVer === 'Re-acceptance pending' \|\| !u.consentVer) { u.consent = D.today; u.consentVer = D.privacy.current; D.privacy.accepted++; App.src.audit('Data privacy', 'Privacy notice ' + u.consentVer + ' accepted', u.email); }`. supplier.js 376: show `esc(u.consentVer \|\| 'v2.1')`, and when pending show "v2.2 not accepted yet — accept to keep using the portal" with an Accept button. |
| P5-07 | Minor | js/pages/supplier.js lines 128, 376; js/pages/admin.js lines 29, 40 | **Wrong legal basis.** These cite "Nghị định 13/2023"; R-25 and the login page use Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (in force 01/01/2026). | Replace "Nghị định 13/2023" with "Luật BVDLCN 91/2025/QH15" in all four places. |
| P5-08 | Minor | js/pages/supplier.js handlers for `sp-ncr`, `sp-chg`, `sp-asn`, `sp-inv`, `sp-prof`, `sp-prop`, `sp-cert`, `mst` | **Several supplier actions are not in the audit log (F-108).** Only bids, addenda, PO confirm/decline and bank change are audited. NCR response, date-change request, ASN, e-invoice submission, profile save, MST check, Material ID proposal and certificate upload leave no entry. | Add `S.audit('Orders', 'NCR response · ' + action, ncrId)`, `S.audit('Orders', 'Delivery date change requested → ' + to, po)`, `S.audit('Orders', 'ASN sent', po)`, `S.audit('Invoices', id + ' submitted via portal', id)`, `S.audit('Settings', 'Company profile saved', VID())`, `S.audit('Settings', 'Material ID proposed · ' + mat, VID())`, `S.audit('Settings', 'Certificate uploaded · ' + type, VID())` in the respective success branches (add "Invoices" to the audit type filter). |
| P5-09 | Minor | js/sourcing.js line 71 `audit`; js/pages/admin.js `retry` | **Audit times use the wall clock.** Entries get `new Date().toTimeString()` (e.g. 11:44) while the demo clock/toasts say 10:30, so the log is out of order against the documents it references. | Use one demo clock: export the supplier `clock()` logic as `App.now()` in sourcing.js and use it in `audit` and `retry`. |
| P5-10 | Minor | js/pages/admin.js (`toleranceRule`, `notifRules`/`digest`, `catAdmin`, `access.idle/reauth`) | **Saved settings that nothing reads.** Over-tolerance behaviour, "NCR blocks match", "price to history", "2-way for SRV-", notification rules/digest, category match type and session timeouts are saved and audited but no screen uses them. Acceptable for a mock, but misleading next to P5-03..05. | Either read them (`invoices.js`: skip NCR block when `!toleranceRule.ncrBlocks`; use `catAdmin[cat].match` for 2-way) or add a note on each card: "Configuration only in this demo — enforced by the backend". |
| P5-11 | Minor | js/pages/supplier.js `parsed()` | Parsed Mã CQT is a padded placeholder (`003B9D34ACAAAAAAAAAAAA…`). | Build a 34-char hex code from the invoice number, e.g. `'00' + (hash(no) .toString(16).toUpperCase()).padStart(32, '0').slice(-32)`. |
| P5-12 | Minor | js/pages/po.js NCR row text | Duplicated label: "Supplier: Supplier responded 02/11/2026 10:33: Return and credit note — …". | Render `Supplier response ${at}: ${action} — ${comment}` (drop the "Supplier:" prefix or the stored "Supplier responded"). |
| P5-13 | Info | docs/01-feature-catalogue-and-flows.md F-91 | Catalogue says bid validity 60 days; F-42 / R-09 and the tender data use ≥ 90 days. The app shows "valid for 90 days" (consistent with the tender). | Change F-91 (and flow step 5) to "hiệu lực 90 ngày". |

## Coverage F-87..F-108

| F | Status | Notes |
|---|---|---|
| F-87 | PASS | Header V-1001, Gmail, last sign-in; 5 KPIs correct; 5 actions with due/buttons; 3 notifications; quick links Bidding / Orders / Invoices / My company. |
| F-88 | PASS | Line prices excl. VAT, VAT locked 10% for metals, lead time, No bid, VAT split, totals; countdown "3 d 6 h left". |
| F-89 | PASS | Security ≥ 35.000.000, valid ≥ 03/02/2027, PDF; return ≤ 14 days text; typed, versioned attachments with Material IDs. |
| F-90 | PASS | Addendum 01 ack (required before submit); Q&A by line, anonymous. |
| F-91 | PASS | Commitments incl. privacy consent; draft / submit / revise / withdraw; receipt + time; locked after close. Legal text P5-07. |
| F-92 | PASS | PO-0889 Confirm / Decline (reason) within 48 h; flows to PO screen and notifications. |
| F-93 | PASS | PO table, date-change request (buyer review), ASN validation, GRN list On time / In full. Audit P5-08. |
| F-94 | PASS | TND-024 rank 1/4, CT-2026-008 53%, renewal upload. |
| F-95 | FAIL → fix | GRN choice, Original/Adjustment/Replacement, XML+PDF, parsed fields, checks, line → Material ID / PO line / GRN, timeline. Double invoicing (P5-02); invoice cannot reach Ready for payment (P5-01). |
| F-96 | PASS | NCR-017 details, Replace / Return & credit note / Discount + comment; rejected qty not invoiceable. |
| F-97 | PASS | 75%, MST check, legal rep, Gmail (read-only sign-in), bank 5307 pending Finance. |
| F-98 | PASS WITH FIXES | Offered Material IDs + proposal; checklist 8 items; Manage consent. Consent version shown wrong after re-publish (P5-06). |
| F-99 | PASS | KPIs, filters, consent date, invite, edit roles, suspend, export / delete personal data (suspend first, anonymised), DSR list. |
| F-100 | PASS WITH FIXES | Policy form validated and audited; allowlist add/remove. Settings not enforced (P5-10). |
| F-101 | PASS WITH FIXES | v2.1 current, publish v2.2 with summary; re-acceptance not recorded (P5-06). |
| F-102 | FAIL → fix | Bands, extra steps, delegation (≤ 14 days, cap) validated and audited; delegation works in My approvals; bands not used by PR/PO (P5-03). |
| F-103 | FAIL → fix | 6 rules, Block/Warn, 30-day counts, add rule, override log; mode not enforced (P5-04). |
| F-104 | PASS WITH FIXES | ±0,5% / ±2% validated; values drive the match grid; existing exceptions not re-matched (P5-05); other flags unused (P5-10). |
| F-105 | PASS WITH FIXES | 8 events, remind/escalate, channels (≥ 1 required), digest 07:30, add rule; not consumed (P5-10). |
| F-106 | PASS | CAT-NNNNN, CON/EQP/SRV/LOG owner + match type, templates, numbering incl. RC-, Rev.N, NCR-, INV-, V-NNNN. |
| F-107 | PASS | 4 status cards, accounting 1 error, Material ID ↔ item code (2 unmapped, format check), vendor codes, Retry fails until mapped. |
| F-108 | PASS WITH FIXES | Read-only, 10 years, 18.420+, filters by user and type, Export, Load more; gaps P5-08, clock P5-09. |

## Final end-to-end pass

| Step | Result |
|---|---|
| PR → approval | PASS (phase 3; SoD routing to Đỗ Hoàng Nam; re-checked My approvals renders, delegation applies). |
| Tender → supplier bid | PASS. Minh Phát acknowledges Addendum 01, revises, withdraws, resubmits on TND-031; Procurement sees receipts only. |
| Bid opening → award | PASS. TND-031 "Open bids" disabled until 05/11 17:00; TND-029 two-key opening and TND-024 award (phase 3). |
| Award → PO | PASS. TND-024 → PO-0877 (award fully ordered); CT-2026-008 release PO-0889. |
| Supplier confirm | PASS. PO-0889 confirmed in portal → "Confirmed by Võ Thị Lan (portal)" on the PO. |
| GRN / NCR | PASS. GRN-2026-1540 20 tấn on PO-0889 (receiver Đỗ Hoàng Nam); NCR-017 supplier response visible to the buyer. |
| E-invoice (supplier) | PASS WITH FIXES. INV-2026-0325 on GRN-1540, parsed, checks green, notification to the buyer. P5-02. |
| 3-way match → ready for payment | **FAIL (P5-01).** Lines match but the invoice stays "Submitted · to match"; no Ready-for-payment action. Seeded invoices (INV-0319) still go Matched → Ready → Export. |
| Reports | PASS. OTIF / saving / spend / budget as in phase 4; contract consumption follows the new release (55%). |

## Requirements coverage R-01..R-25 (final)

| R | Pri | Status | Evidence / open finding |
|---|---|---|---|
| R-01 | MUST | PASS WITH FIXES | Inbox, legal checks, GDT lookup, portal XML submission. P5-01, P5-02. |
| R-02 | MUST | PASS WITH FIXES | Line match with tolerances, exception queue, SRV 2-way (INV-0324). P5-01, P5-05. |
| R-03 | MUST | PASS | VAT per Material ID and line, 8% reduced until 31/12/2026, 10% steel; bid and PO splits correct. |
| R-04 | MUST | PASS | MST format + GDT check on vendor and supplier profile; duplicates blocked (phase 2). |
| R-05 | MUST | PASS | No price visible to Procurement before close; recorded opening; supplier sees only own bid. |
| R-06 | MUST | PASS WITH FIXES | One inbox, delegation with cap/types. Matrix edits not applied (P5-03). |
| R-07 | MUST | PASS | GRN accepted/rejected, NCR, return/replace, supplier NCR response, OTIF by accepted qty. |
| R-08 | SHOULD | PASS | Invitation code sign-in, onboarding checklist 6/8, Material ID proposal, bank change pending Finance. |
| R-09 | SHOULD | PASS | Bid security 1% ≥ 90 days, returned ≤ 14 days; performance security on contracts. |
| R-10 | SHOULD | PASS | Two-envelope TND-029 with COI (phase 3). |
| R-11 | SHOULD | PASS | Q&A by line, anonymous; addendum acknowledgment gate. |
| R-12 | SHOULD | PASS | Award via approval; result notices with own rank only. |
| R-13 | SHOULD | PASS | Change orders / Rev history / cancel; supplier re-confirmation and decline. |
| R-14 | SHOULD | PASS | Budget committed/actual (phase 4, P4-07 fixed). |
| R-15 | SHOULD | PASS WITH FIXES | Bell + notification page; supplier actions notify the buyer. Rules not consumed (P5-10). |
| R-16 | SHOULD | PASS | Risk column and reasons (phase 2). |
| R-17 | SHOULD | PASS | Spend cube, concentration, off-contract (phase 4). |
| R-18 | SHOULD | PASS WITH FIXES | Blocks on PR/CO/invoice exception, override log. Mode not enforced (P5-04). |
| R-19 | SHOULD | PASS | Typed, versioned attachments incl. supplier bid files. |
| R-20 | SHOULD | PASS | Integrations page, mapping, sync log, retry. |
| R-21 | COULD | PASS | PO print; supplier print preview of PO-0889 matches the PO. |
| R-22 | COULD | PASS | e-Auction TND-034 settings (phase 3). |
| R-23 | COULD | PASS | USD/EUR with rate source (TND-032). |
| R-24 | COULD | PASS | Saving types, Finance validation. |
| R-25 | COULD | PASS WITH FIXES | Consent at sign-in and bid, export/delete personal data, notice versions. P5-06, P5-07. |

## Fix status (Agent 1)

All findings fixed as specified. Re-tested with Playwright headless Chromium (served by `server.js`), 21/21 checks pass, 0 console errors; `npm test` passes (23 assets, 29 pages).

| ID | Status | Fix |
|---|---|---|
| P5-01 | Fixed | invoices.js `rematch()`: a portal invoice whose legal checks and lines pass goes to Matched (stage 2); otherwise `Exception · price ±x%` / `qty`, stage 1, on hold, assigned to the PO buyer, resolve by +3 days. INV-2026-0325 → Matched → Ready for payment → Exported; supplier list follows. Ready / Export are audited (type Invoices). |
| P5-02 | Fixed | supplier.js `invoicedQtyGrn` counts replacements and drops the invoice they replace; GRN-2026-1490 no longer offered. |
| P5-03 | Fixed | pr.js route + band legend and po.js route / text / step count read `approvalBands` and `approvalRules[0].above`; capex and budget rules skipped when `on === false`. |
| P5-04 | Fixed | approvals.js `sodMode()`; Warn → no block, "SoD warning" pill and warning banner; approval written to the SoD override log and audit (Overrides). |
| P5-05 | Fixed | `rematch()` in list and detail: an `Exception · price…` without an approval in flight goes to Matched when all lines pass (INV-2026-0320 at ±2%). |
| P5-06 | Fixed | login.js records acceptance of the current notice (missing or "Re-acceptance pending"), `privacy.accepted++`, audit Data privacy. Profile shows the accepted version, or "v2.2 not accepted yet" with an Accept button. Login notice link shows the current version. |
| P5-07 | Fixed | "Luật BVDLCN 91/2025/QH15" in supplier.js (2) and admin.js (2). |
| P5-08 | Fixed | Audit entries for NCR response, date-change request, ASN, e-invoice submission, profile save, MST check, Material ID proposal, certificate upload, privacy acceptance; "Invoices" added to the audit type filter. |
| P5-09 | Fixed | `App.now()` demo clock (02/11/2026 from 10:31) in sourcing.js, used by `audit`, the supplier portal, admin Retry and invoice export. |
| P5-10 | Labelled | Access idle/re-auth, outside-tolerance behaviour and rule flags, notification rules/digest, category owner/match type: "Configuration only in this demo — enforced by the backend". |
| P5-11 | Fixed | Mã CQT = "00" + 32 hex hashed from the invoice number (e.g. 008148D6DD13B5D6623959AADA308D7005). |
| P5-12 | Fixed | po.js NCR row: "Supplier response 02/11/2026 10:3x: Return and credit note — …". |
| P5-13 | Fixed | Catalogue F-91 and flow step 5: "hiệu lực 90 ngày". |

**End-to-end re-test:** sign-in (UI) → PR approval → TND-031 sealed / TND-024 award → supplier addendum ack → supplier confirms PO-0889 → GRN-2026-1540 20 tấn → supplier e-invoice INV-2026-0325 (parsed, submitted) → auto 3-way match Matched → Ready for payment → Export → supplier sees Ready for payment. Then tolerance 2% (INV-0320 Matched), SoD Warn (no block), matrix 100tr / 1 tỷ (PR legend), privacy v2.2 publish → profile pending → sign-in records v2.2.
**Regression:** 47 routes × 1440/390 (procurement, supplier, admin) = 94 renders, no horizontal scroll, no console errors, no unexpected "not found" (the GDT "Mã CQT not found" text on Integrations is seeded data).

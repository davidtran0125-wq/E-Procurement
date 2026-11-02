# ProcureLink — QA Phase 4 (Agent 2)

**Verdict: PASS WITH FIXES.** 0 Blocker · 4 Major · 9 Minor.

**Scope:** F-61 to F-86 (Purchase orders and goods receipt, Invoices and 3-way match, Price history, Reports), plus the phase-4 parts of R-01, R-02, R-03, R-07, R-13, R-14, R-17, R-21, R-23 and R-24. I read js/pages/po.js, invoices.js, price.js and reports.js. I checked every figure on screen by hand against docs/04-design-brief.md §5. I tested in headless Chromium (Playwright, `file://`):
- I swept the phase-4 routes × 3 roles × 1440/390 px, and re-ran the phase 1–3 routes.
- I ran these flows:
  - Create PO from a PR, a tender award and a contract release, then submit;
  - record a GRN with a rejection, which raises an NCR;
  - a change order, with its validation and re-approval;
  - cancel the open quantity;
  - print the PO;
  - invoice actions: accept variance → My approvals, credit note, mark ready for payment;
  - Finance validating a saving record.
- `npm test` passes: 21 assets and 18 pages registered.

No code files were edited. As briefed, these data decisions are accepted and I checked only that they are consistent, which they are:
- INV-0322 is the Sao Việt container exception: 12 × 19.000.000 vs 18.500.000 = +2,7%, 6.000.000 ₫ over PO.
- The An Khang exception is on INV-0320 / GRN-1518: 55 × 1.700.000 vs 1.680.000 = +1,2%, 1.100.000 ₫ over PO.
- INV-0319 is on GRN-1532, 50 tấn × 15.200.000, Matched.
- INV-0324 is an SRV 2-way match against SES-2026-0141.
- The buyer company and MST are placeholders.

**What holds**
- **Console and layout:**
  - There are no console errors on any route except P4-01.
  - At 390 px there is no horizontal page scroll on any phase-4 route, the GRN form, the change-order form, the cancel form or the print preview.
- **Role guard:** Supplier: `#/po*`, `#/invoices*`, `#/price`, `#/reports` and `#/po/<id>/print` redirect to `#/supplier`. Procurement and Admin can open all of them. An unknown `INV-2026-9` shows "not found" with a back link.
- **VAT splits (R-14):**
  - Steel is 10%: PO-0877 1.216.000.000 + 121.600.000 = 1.337.600.000 ₫, PO-0866, INV-0319 and INV-0318.
  - Other lines are 8% "reduced, until 31/12/2026": PO-0861, 0848, 0874, 0870 and 0882; INV-0320, 0321, 0322, 0323, 0324 and 0314.
  - All amounts check out, and the PO total equals the print total.
- **3-way match (R-02):**
  - Price tolerance is ±0,5% and qty is ±2% for tấn/m³ (exact for count units).
  - INV-0323: line 1 matches (2 × 6.615.000; 11 already invoiced of 13). Line 2 (970.000 ₫) is "No Material ID", which fails legal check 6. 13.230.000 + 970.000 = 14.200.000 ₫.
  - INV-0321: a missing Mã CQT fails the GDT lookup and blocks matching.
  - Due dates = invoice date + vendor terms. All 6 checked are correct, e.g. 26/10 + 45 = 10/12/2026.
- **POs:**
  - List chips add up to 20. Open value 4,6 tỷ = the 12 open (non-Draft, non-Closed) POs, and it recomputes to 4,4 tỷ / 11 after a cancel.
  - Accepted % = accepted ÷ PO qty (PO-0861 55/120 = 46%).
  - "Still to invoice" is correct (PO-0861 65 × 1.680.000 = 109.200.000; PO-0848 200 m³ = 264.000.000).
  - The GRN form validates delivered = accepted + rejected, needs a reason when qty is rejected, and needs the CO/CQ and mill certificate for CON-24015. It shows the buyer≠receiver SoD warning. A rejection raises NCR-2026-018 (Replace), and OTIF marks the line "In full: No".
  - The change order blocks qty below received/invoiced (60). A value increase creates Rev.1 "Pending approval", routed to Đỗ Hoàng Nam (raiser cannot approve).
  - Cancel needs a reason of at least 10 characters. The value is recomputed (60 × 1.680.000 = 100.800.000).
  - The print preview shows the revision number, both delivery dates, the VAT split, and the signed/confirmed footer.
  - Create PO from PR-0436 submits to Đỗ Hoàng Nam (SoD) as "Pending approval".
- **Price history:**
  - Δ vs previous PO is correct for every CON-24015 row (−2,7 / −5,0 / +0,9 / −0,4 / −2,9 / −7,6%).
  - vs 90-day: 15.200.000 vs 16.050.000 = −5,3%, which raises an alert (rule ±5%).
  - Invoice price records exist for INV-0320 and INV-0322.
- **Reports:**
  - Saving records: (16.450.000 − 15.200.000) × 80 = 100.000.000; × 45 = 37.012.500; 30.000 × 300 = 9.000.000; 1.500.000 × 12 = 18.000.000; 8.000.000 × 2 = 16.000.000; 400.000 × 36 = 14.400.000; TND-029 54.100.000 (matches phase 3).
  - Saving by category: 5,1 + 2,6 + 1,0 + 1,0 = 9,7 tỷ = 5,2%, the same as the dashboard.
  - OTIF 91,4%: on time 94,0% of 1.284 → 77 late; in full 96,8% → 41 short. It equals the dashboard.
  - Spend: top 5 = 77,17 tỷ = 41,4% of 186,4 tỷ, and all rows add up to 186,4.
  - Budget rows are "Budget − Invoiced − Committed", and Dự án Kho B 4,45 tỷ equals PR-0452 from phase 3.
  - "Validate" is shown only to Finance (Đỗ Hoàng Nam), and it sets "Validated by Finance · 02/11/2026".
- **Cross-screen:**
  - Dashboard and My approvals show INV-2026-0322 +2,7% vs PO-0874.
  - PO-0877 Rev.2 is "Blocked — SoD" for its raiser.
  - Material 360° CON-24015 last price is 15.200.000 / PO-0877 and it lists INV-0318/0319.
  - The contracts off-contract banner (PO-0861, +6,4% vs 1.580.000) equals Price history (+6,4%).
- **Regression:** the phase 1–3 routes (dashboard, search, materials, Material 360°, vendors, evaluation, contracts, certificates, tenders incl. TND-029/031, PR incl. PR-0452, approvals, supplier) render with no errors.

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| P4-01 | Major | js/pages/po.js `build()` (line ~99) | **`#/po/new?tender=TND-2026-029` crashes.** The error is "Cannot read properties of null (reading 'pick')". This tender's award is not yet approved, so `t.award` is null, and that link comes from the phase-3 "Create PO" path. Any tender without an award crashes the same way. | In the tender branch: `const a = t.award; if (!a \|\| a.status !== 'Approved') { f.err = 'Award for ' + ref + ' is not approved yet — Create PO is available after approval.'; return f; }`. Then render `f.err` as an `alert-warning` above the form and disable Submit. |
| P4-02 | Major | js/pages/invoices.js `to-ap` handler | **The invoice exception can be self-approved (R-18).** "Accept variance → My approvals" on INV-2026-0320 pushes `{by: 'Nguyễn Minh Anh', assignee: 'Nguyễn Minh Anh'}`. Her badge goes from 6 to 7, and the item has no SoD block. The buyer who raises the exception approves it herself. | Route it to someone who is not the raiser: `assignee: S.me() === 'Nguyễn Minh Anh' ? 'Đỗ Hoàng Nam' : 'Nguyễn Minh Anh'`. Alternatively, set `sod: true` when `by === assignee`, so approvals.js `blocked()` applies (see P3-01). Change the banner to "Release needs the Procurement Lead (not the raiser)". |
| P4-03 | Major | js/pages/po.js GRN save / status derivation | **The PO reads "Delivered" while a rejected quantity is still open.** On PO-0877 I recorded GRN-1540 for the 30 tấn slot: accepted 28, rejected 2, Replace → NCR-018. The status becomes "Delivered" (list: Partially received 3→2, Delivered 8→9) and "Record goods receipt" disappears, so the 2 tấn replacement can never be received. The NCR text says "the quantity stays open on the PO". The header still says "30 tấn due 06/11". PO-0866, in the same state, stays "Partially received". | Base the status on accepted qty: `const open = lines.some((l) => accepted(l) < l.qty)`. Set `status = open ? 'Partially received' : 'Delivered'`. While an NCR with action Replace or Return is open, keep a schedule slot `{qty: rejected, promised: ncr.due, ncr: id}` selectable in `#pg-slot`. Rebuild the header summary from the schedule after save. |
| P4-04 | Major | js/pages/price.js KPI tiles | **The averages don't come from the records shown.** "Weighted by quantity · N records in view" doesn't match the records: CON-24015 shows 16.170.000, but its 11 records weight to 16.009.000. CON-24102 shows 1.605.000, but its 2 records (55 × 1.700.000, 120 × 1.680.000) give 1.686.000. LOG-61012 shows 16.700.000 and a 90-day average of 16.990.000, but every record in view is ≥ 18.500.000. The "+8,9% price alert" therefore rests on numbers the user cannot trace (F-77, R-17). | Compute both from the filtered rows: `avg = Σ(qty×price)/Σqty` over rows with a qty, and `avg90` = the same over rows dated ≥ today − 90 days. If the monthly series is intended, label it "Monthly series average (incl. records outside this sample)" and drop "· N records in view". |
| P4-05 | Minor | js/pages/invoices.js KPI "To match" | KPI "To match 9 · 3 in this sample" (2 after marking INV-0319 ready), but the tab reads "To match (0)". The KPI counts Matched invoices, while `tabOf` puts Matched in `matched`, which is not a tab. | Count with the same function: `list().filter((d) => tabOf(d) === 'match').length`. Either add a "Matched" tab, or map Matched to `'match'` in `tabOf` so that the KPI and tab agree. |
| P4-06 | Minor | js/pages/price.js vendor comparison | (a) "Latest price" is not the latest record. An Khang shows 16.450.000 (PO-0791, 12/09) instead of its 30/09 bid 16.380.000. Tân Long shows 16.300.000 (quote 22/07) instead of the 30/09 bid 15.980.000. (b) CON-24102 shows "Minh Phát · 0 records · 1.640.000 ₫ · Cheapest", which is a price with no record behind it. | Take the latest by date: `rows.filter((r) => r.v === vid).sort(byDateDesc)[0].price`. Hide vendors with 0 records, or show "—", and exclude them from "Cheapest". |
| P4-07 | Minor | js/pages/reports.js budget table | Nhà xưởng C2 · Steel has Committed = 1.216.000.000 ₫, the full PO-0877 value. But 760.000.000 is already invoiced (INV-0319), and the footnote says "committed = open PO value not yet invoiced". PO-0866 (C2, 460.500.000, nothing invoiced) is not included. | Use committed = 456.000.000 + 460.500.000 = 916.500.000 ₫ and available = 6.000 − 2.900 − 916,5 = 2.183.500.000 ₫. That assumes the 2,9 tỷ actual already includes INV-0319. Otherwise move 760tr into actual. Better: derive it from `D().pos` by site. |
| P4-08 | Minor | js/pages/po.js cancel / close | After "Cancel open quantity" on PO-0861, the PO is "Closed", but NCR-2026-014 (Return, 5 tấn) is still open and "Still to invoice 5 tấn · 8.400.000 ₫" remains. On PO-0866, "Nothing open to cancel — every scheduled delivery has been received" shows while 15 tấn is rejected and open under NCR-017. | Close only when there is no open NCR and nothing left to invoice; otherwise set "Delivered". Count NCR quantities with action Replace or Return in the open qty for the cancel form (`Line 1 · 15 tấn open (NCR-2026-017)`). |
| P4-09 | Minor | js/pages/reports.js off-contract table vs contracts.js | The two screens use different definitions. Reports lists PO-0791, 0866 and 0870 and omits PO-0861. Contracts' banner names only PO-0861 (CON-24102 after CT-2025-007 expired). PO-0870 (Hưng Long, SRV-52003) is listed as off-contract against CT-2026-011, but SAV-2026-120 credits that same contract for its price (49,5 → 48tr). | Pick one rule and apply it on both screens: "Material ID bought outside an active contract, or after its contract expired". Add the PO-0861 row ("CT-2025-007 expired 30/09/2026"). Set PO-0870 `contract: 'CT-2026-011'` (source shown as "Contract CT-2026-011") and remove it from the off-contract list. |
| P4-10 | Minor | js/pages/reports.js OTIF by vendor | Minh Phát: 24 deliveries at 97,9% / 97,9% / 95,8% is impossible, because 97,9% of 24 = 23,5. All the other vendors are integral. | Use 48 deliveries (47/48 = 97,9%, 46/48 = 95,8%), or 24 with 23/24 = 95,8% on time, 24/24 = 100% in full and 23/24 = 95,8% OTIF. |
| P4-11 | Minor | js/pages/po.js PO header "Invoiced" | "Invoiced" is valued at the PO price, not the invoice amount. PO-0861 shows 92.400.000 ₫ against INV-0320 93.500.000. PO-0874 shows "100% · 222.000.000 ₫" against INV-0322 228.000.000, which is an exception not yet accepted. | Label it "Invoiced (at PO price)", or sum the invoice subtotals. Count only Matched / Ready / Paid invoices in the %, and show exceptions separately ("228tr in exception"). |
| P4-12 | Minor | js/data.js PO-2026-0870 | HVAC maintenance "T11" with promised date 10/11/2026 is already "Delivered" on 02/11, with GRN "Archived" and SES accepted 1 · 1 · 0. A November service can't be accepted at the start of November. | Set status "Confirmed", leave the schedule row "Open", and set Accepted to 0%. Alternatively, make it the T10 service with promised date 31/10/2026. |
| P4-13 | Minor | js/pages/po.js `existingFor` / tender source | `#/po/new?tender=TND-2026-024` offers a second full 80 tấn PO at 1.216.000.000 ₫, even though PO-0877 already covers the award. The page only shows the note "Already issued…". | Pre-fill qty = award qty − sum of qty on non-cancelled POs from that tender (0 here). Block Submit when every line is 0, with the message "Award fully ordered on PO-2026-0877". |

## Coverage

| F | Status | Notes |
|---|---|---|
| F-61 | PASS | Chips with counts (20), search, vendor/site filters, "Not confirmed · 3 days", Open NCR KPI updates (2 → 3 after a GRN rejection). Status issue in P4-03. |
| F-62 | PASS WITH FIXES | PR → PO with vendor terms, price check vs last and 90-day, approval route with SoD. Contract release shows the ceiling and "contract left". Tender source: an unapproved award crashes (P4-01), and a fully ordered award can be ordered again (P4-13). |
| F-63 | PASS | Status bar, VAT split per rate, Accepted/Invoiced tiles (P4-11), header and supplier confirmation. |
| F-64 | PASS WITH FIXES | GRN validation, buyer≠receiver warning, OTIF columns. The open quantity after a rejection is lost (P4-03). |
| F-65 | PASS | NCR is raised with action, due date and supplier channel, and blocks matching for the rejected qty. Close NCR is present. |
| F-66 | PASS | Per-line PO qty / accepted / invoiced / still to invoice. |
| F-67 | PASS | Rev history; value increase → re-approval by someone other than the raiser; date-only change needs no approval; minimum qty enforced. |
| F-68 | PASS WITH FIXES | Reason required, value recomputed, Rev bumped. Closes despite an open NCR (P4-08). |
| F-69 | PASS | Bilingual print with Rev, VAT and signatures. Typed, versioned attachments with Material IDs. |
| F-70 | PASS | Inbox, source, Original/Replacement, tolerance banner. KPI vs tab mismatch (P4-05). |
| F-71 | PASS | Six checks; GDT fail and the unmapped line block matching. |
| F-72 | PASS | Tolerances correct; open NCR qty shown as blocked. |
| F-73 | PASS WITH FIXES | Assigned buyer + SLA, credit note (removed from the queue), accept → My approvals. Self-approval possible (P4-02). |
| F-74 | PASS | INV-0324 is a 2-way match vs SES with SLA 99,2% ≥ 98,0%. |
| F-75 | PASS | Stepper, due date = date + terms, Ready for payment, accounting mapping. |
| F-76 | PASS | Material ID / period / vendor / source filters; Open Material 360°. |
| F-77 | FAIL → fix | Averages don't trace to the records (P4-04). |
| F-78 | PASS WITH FIXES | Chart and vendor comparison; "latest" is wrong (P4-06). |
| F-79 | PASS | ±5% rule shown and editable; alert fires at −5,3% / +6,4%. |
| F-80 | PASS | Records with source, document, Δ vs previous PO and use; invoice records added. |
| F-81 | PASS | OTIF 91,4% with definition and trend, equal to the dashboard. |
| F-82 | PASS WITH FIXES | Labels and risk threshold; Minh Phát counts (P4-10). |
| F-83 | PASS | 9,7 tỷ / 5,2%; Finance-validated is shown separately; cost avoidance is shown separately. |
| F-84 | PASS | Formula per Material ID line; Draft → Submitted → Validated; only Finance can validate. |
| F-85 | PASS | Spend cube by vendor / Material ID / project; concentration 41,4%; off-contract table (P4-09). |
| F-86 | PASS WITH FIXES | Budget formula correct except Nhà xưởng C2 committed (P4-07). |

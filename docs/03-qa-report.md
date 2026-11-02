# ProcureLink — QA round 2 (Agent 3)

**Verdict: PASS** — 0 Blocker · 0 Major · 6 Minor remaining (none blocks hand-off).

Audited: live artifact version 1793580741-5393 (17 boards + canvas.json), fix reports fix1-W1…W4.md, BRIEF.md §8, requirements.md. I re-fetched every file, re-ran `scratchpad/qa/check.py`, re-ran the chip, layout and a11y scans, regenerated the text dumps (`scratchpad/qa/txt2/`), and diffed them against round 1 (`scratchpad/qa/diff_*.txt`). Nothing was edited or published.

## 1. Technical re-check (all 17 files)

| Check | Result |
|---|---|
| support.js, tag balance, quoted attributes, one `data-dc-script` with valid `data-props` | all OK |
| `$preview.height` = canvas `h` | **17/17 match** (Tenders 3050, PurchaseOrders 3050, Approvals 1450, Material360 1700, Vendors 1700, …) |
| Holes are dotted paths; every hole root returned by `renderVals()` (node run) | all OK, no runtime errors |
| `<sc-for>` in table/svg; innerHTML/iframe/emoji; external URLs | none |
| hrefs → existing boards / `#id`s | all resolve. `href="#"` only on Login: Terms, Help (R2-05) |
| Nav v3 (ICON, mk with badge, g1–g4, aside, header) | identical on all 13 Procurement boards; badge `<sc-if>` has `hint-placeholder-val`; Main header differs only by the bell `<a>` (intended) |
| Material ID chips | no compact variants left. The only non-canonical chips are the allowed title chips (MaterialMaster 15px, PriceHistory 13px, now a link) |
| Phone width / labels / icon buttons / svg roles / contrast | no findings (VendorEvaluation overflow fixed) |
| canvas.json | rows don't overlap (row 3 ends at 7350, row-4 note at 7470, boards at 7750). VendorEvaluation y = 2200. `order` still starts with Main (R2-01) |

## 2. Round-1 issues — verified on the live files

| Q | Status | Evidence |
|---|---|---|
| Q-01 | Resolved | All `$preview` heights equal canvas `h` |
| Q-02 | Resolved | PR: "Create PR PR-2026-0452 · Dự án Kho B · giai đoạn 2 · created 31/10/2026", needed by 15/12/2026, phase-2 justification. TND-031 and Material360 still reference PR-2026-0440 "In tender" |
| Q-03 | Resolved | Approvals: TND-029 item gone; V-1001 "new account BIDV ···· 0937" added (matches Supplier portal and Admin audit 30/10 16:40). Queue = 6 = badge = Main strip |
| Q-04 | Resolved | Approvals: EQP-31520 · Lê Quốc Huy · "Step 2 of 3", matching the MaterialMaster row "Pending approval · Step 2 of 3" |
| Q-05 | Resolved | Approvals "PO-2026-0877 Rev.2 … sod: true", blocked text "You raised this change order…". PO revision history: Rev.2 "Pending approval · 80 → 85 tấn · 1.216.000.000 → 1.292.000.000" above Rev.1 |
| Q-06 | Resolved | Approvals "Capex rule: EQP- above 1 tỷ ₫ adds the Finance Director". Tenders "the ≤ 2 tỷ band needs the Procurement Lead … Đỗ Hoàng Nam approves" |
| Q-07 | Resolved | Contracts released POs: PO-2026-0858 replaces PO-0877; "+ 8 earlier POs · 435 tấn" (45 + 60 + 100 + 435 = 640) |
| Q-08 | Resolved | INV-2026-0320 GRN-2026-1518, 93.500.000 + 7.480.000 (55 × 1.700.000, 8%). Reports CON-24102 row 60 tấn / 6.900.000, last |
| Q-09 | Resolved | Reports LOG-61045 PO-2026-0812; CON-24020 180 tấn / 171.000.000; order 528 · 201,6 · 171 · 100 · 52 · 51 · 42 · 6,9 tr |
| Q-10 | Resolved | Supplier portal: no TND-2026-036 anywhere; "1 open"; KPI Open invitations 1 |
| Q-11 | Resolved | MaterialMaster EQP-31007 1.610.000.000 · "Maintenance · pending signature"; Contracts CT-2026-014 "Generator maintenance – Đại Phong · Service SLA · 240 tr ₫" |
| Q-12 | Resolved | MaterialMaster CON-24325 1.150.000 |
| Q-13 | Resolved | Badge "6" in g1 "My approvals" on all 13 boards |
| Q-14 | Resolved | Tenders `#tnd-031` card: RC-031-001…004 with times, Bắc Sơn warning pill, Tân Phước "Not submitted · reminder 04/11 17:00", "Prices hidden until 05/11/2026 17:00" (see R2-03 for one label) |
| Q-15 | Resolved | Vendors: format helper "10 digits · 10 + 3 for a branch…" + danger alert "MST 0312456789 already belongs to V-1003 Đại Phong — Save was blocked." |
| Q-16 | Resolved | PurchaseOrders `#po-0882` "Create PO · draft PO-2026-0882": source (Approved PR / Tender award / Contract release), PR-2026-0436, vendor V-1004 + "Risk: Low", ship-to, terms, date, EQP-31402 2 × 193.000.000 + VAT 8% 30.880.000 = 416.880.000, price check −1,5%, route, Save/Submit. "New PO" links to it |
| Q-17 | Resolved | VendorEvaluation: criteria grid in `overflow-x: auto` > `min-width: 520px`; score grid `minmax(0, …)`. Scan finds no overflow |
| Q-18 | Resolved | Main: PR-0431 → Approvals.dc.html, "2 closing this week", English titles, "Monday, 02/11/2026" |
| Q-19 | Resolved | PR line 2 PO-2026-0858 · 14/10, "440 tấn left after line 1"; route SLAs "2 working days" |
| Q-20 | Resolved | Approvals: Dept head step, disabled "Approve selected · under 50.000.000 ₫", VAT column 8% (one leftover timestamp, R2-04) |
| Q-21 | Resolved | No compact chips left |
| Q-22 | Resolved | Contracts legend + released-PO chips; PriceHistory title chip is a link |
| Q-23 | Resolved | Supplier status track "Matched → Ready for payment"; INV-0318 "Matched"; INV-0314 "Ready for payment · exported 30/10"; Vietcombank •••• 5307 |
| Q-24 | Resolved | Reports Minh Phát "48 deliveries · on-time 97,9% · in-full 97,9%" |
| Q-25 | Resolved | Certificates CQ-MP-2610-118; new block rule sentence |
| Q-26 | Resolved | Vendors V-1008 CON-24015 + CON-24020; V-1007 "Invited 30/10 · not signed in yet" |
| Q-27 | Resolved | Material360 "27 of 29 deliveries", "1 open · 1,22 tỷ ₫", NCR-2026-009 and CQ attachment rows |
| Q-28 | Resolved | VendorEvaluation Quality "1 NCR (NCR-2026-009, accepted with discount) · 100% accepted qty" |
| Q-29 | Resolved | Login `#privacy-notice` section; "Privacy notice" and footer "Privacy" link to it |
| Q-30 | Resolved | Admin audit 01/11/2026 09:30 price-envelope opening; "Showing 11"; PR-0438 "86.000.000 ₫ (PO-2026-0846)" |
| Q-31 | Resolved | PO print "MST 0315 284 671" |
| Q-32 | Resolved, with a side effect | CT-2026-008 "Expiring" on Contracts, but other screens still say "Active" (R2-02) |
| Q-33 | Resolved | TND-031 note "CON-24015 line benchmarks CT-2026-008 (Q4 15.627.500 ₫)" |
| Q-34 | Resolved | INV-2026-0323 "1 line: No Material ID" |
| Q-35 | Partly open | VendorEvaluation y fixed; `order` not swapped (R2-01) |
| Q-36 | Partly open | BRIEF §8 points to the QA rulings and nav v3; requirements.md unchanged (R2-06) |

**Regression scan.** Diffs show only the intended edits. No other text, data or layout changed. These checks hold:
- the new data reconciles (Rev.2 85 × 15.200.000 = 1.292.000.000; Create-PO VAT and total; INV-0320; Reports reorder);
- the approvals count is 6 on the badge, Main and the tab;
- the TND-031 receipts agree with the Supplier portal (RC-031-002 · 31/10 14:22) and Admin (reminder 04/11 17:00);
- EQP-31520 agrees with MaterialMaster.

## 3. Remaining issues (all Minor), grouped by file

| ID | Sev | File(s) | Problem | Exact fix |
|---|---|---|---|---|
| R2-01 | Minor | canvas.json (orchestrator) | `order` starts with Main, but the titles number Login 01, Dashboard 02. | Swap the first two entries: `"Login.dc.html", "Main.dc.html", …`. Optional: `"is_interactive": true` on all 17 boards. |
| R2-02 | Minor | Material360, SupplierPortal | Since Q-32, Contracts shows CT-2026-008 as **Expiring**, but Material360's tile says "Active · CT-2026-008" and the Supplier portal Contracts card shows a green "Active" pill. | Material360 Contracts tile `sub: 'Expiring 31/12 · CT-2026-008'`. SupplierPortal: the Contracts card pill "Active" → "Expiring", colours #8A4B00 on #FDF1DC. |
| R2-03 | Minor | Tenders | TND-031 sealed card: Tân Long's sub-line shows "Construction" where the other bidders show a vendor ID. | Tân Long row `vid: 'V-1011'` (unused ID). |
| R2-04 | Minor | Approvals | The PR-0431 chain step 2 (Minh Anh) says "Since 31/10/2026 14:20", but the new Dept-head step 1 was approved at 16:05. | Chain row n '2' meta → `'Since 31/10/2026 16:05 · SLA ends 02/11/2026 17:00'`. |
| R2-05 | Minor | Login | Footer "Terms" and "Help" are still `href="#"`. | Change both to `<span style="color: #4B5563">Terms</span>` / `Help`, or link them to `#privacy-notice` until real pages exist. |
| R2-06 | Minor | requirements.md (Agent 1 / orchestrator) | The specs still say R-02 price tolerance 0%, R-13 "Rev.1" for the qty change, and R-17 top-10. | R-02 → ±0,5%. R-13 → Rev.2 (Rev.1 = date change). R-17 → top-5. Note 3 example → `PO-2026-0877 Rev.2`. |

## 4. Requirements coverage (live screens)

| R | Status | Evidence |
|---|---|---|
| R-01 | PASS | Invoices inbox, legal checks 6/6, stepper, INV-0321 blocked, INV-0323 "1 line: No Material ID". Supplier portal Submit e-invoice (XML + PDF, type, status track) |
| R-02 | PASS | Invoices match grid, ±0,5% / ±2%, INV-0322 exception, 2-way SRV, Export to accounting. Admin tolerances |
| R-03 | PASS | VAT per Material ID (MaterialMaster); per line and split by rate on PR, PO, Create PO, Tenders, Invoices, Approvals; post-2026 banner; "excl. VAT" labels |
| R-04 | PASS | Vendors MST check + format helper + duplicate block alert; Supplier profile format hint and GDT result |
| R-05 | PASS | TND-031 sealed card with names and receipts; TND-029 two-person bid opening minutes; Supplier receipt/revise/withdraw; audit unseal events |
| R-06 | PASS | Approvals queue (6) with value/SLA/step, mandatory comment, chain, delegation "on behalf of", disabled bulk approve, nav badge 6, Material ID chips with last/90-day price |
| R-07 | PASS | PO GRN-1518 accepted/rejected + NCR-014; Supplier NCR-017 response; OTIF by accepted qty; VendorEvaluation NCR source; Material360 NCR-2026-009 row |
| R-08 | PARTIAL | Supplier onboarding checklist 6/8, bank change pending, Material IDs offered. No V-1007 review checklist (V-1007 has not signed in; acceptable) |
| R-09 | PASS | Tenders bid security settings/row/release; Contracts performance security 975.000.000 with 30-day alert |
| R-10 | PASS | Tenders two envelopes, per-evaluator scores, COI declarations |
| R-11 | PASS | Tenders anonymous Q&A + Addendum No. 1 acknowledgments; Supplier Q&A by line |
| R-12 | PASS | Tờ trình with ranking, saving, justification, route, rank notices, Create PO disabled; Supplier result notice |
| R-13 | PASS | PO Change order / Cancel; revision history Rev.2 pending (qty diff) + Rev.1; Approvals Rev.2 |
| R-14 | PASS | PR budget card + override rule; Reports budget by project; Approvals budget impact |
| R-15 | PASS | Main bell → Action required (type filter, read/unread); Admin rules + daily digest |
| R-16 | PASS | Vendors risk column + re-check; Material360 supply risk; MaterialMaster single-source; Create PO "Risk: Low" pill + High-risk warning note |
| R-17 | PASS | Reports top-5 concentration, off-contract list, contract coverage, cycle time |
| R-18 | PASS | Admin SoD rules + override log; Approvals "Blocked — SoD" on PO-0877 Rev.2 |
| R-19 | PASS | Typed, versioned attachments on PR/Tenders/PO/Contracts/MaterialMaster/Supplier; Material360 attachment row |
| R-20 | PASS | Admin Integrations cards, mappings with unmapped count, sync log + Retry |
| R-21 | PASS | PO print preview with MST 0315 284 671, VAT, signatures; supplier download note |
| R-22 | PARTIAL (COULD) | TND-034 e-Auction settings only; no live or rank view |
| R-23 | PARTIAL (COULD) | TND-032 VND/USD note only |
| R-24 | PASS | Reports saving types + Finance validation, reported vs validated |
| R-25 | PASS | Login consent line + privacy notice section; Supplier bid consent; Admin consent v2.1 + export/delete |

Totals: **22 PASS · 3 PARTIAL (R-08, and the COULD items R-22, R-23) · 0 FAIL.**

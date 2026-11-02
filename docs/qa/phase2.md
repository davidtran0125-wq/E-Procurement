# ProcureLink — QA Phase 2 (Agent 2)

**Verdict: PASS WITH FIXES.** 0 Blocker · 3 Major · 11 Minor.

**Scope:** F-20 to F-39 (Vendors, Vendor evaluation, Contracts, Certificates), plus the phase-2 parts of R-04, R-07 (evaluation data source), R-08, R-09 (performance security), R-16 and R-19. I read js/data.js (phase-2 block) and js/pages/vendors.js, evaluation.js, contracts.js and certificates.js, and checked the numbers by hand against docs/04-design-brief.md §5 and the F-catalogue. I tested in headless Chromium (Playwright, `file://`):
- I swept 22 routes × 3 roles × 1440/390 px.
- I tested every form: the vendor create/edit form with MST checks, onboarding, links, status and delete; the scorecard and the template editor; new contract, performance security and document upload; certificate review and upload.
- I re-ran the phase-1 routes.

No code files were edited. The grade change for V-1003/V-1005 (A→B, A ≥ 4,20) is accepted as briefed.

**What holds**
- **Console:** no errors or warnings on any route or form flow.
- **390 px:** no horizontal page scroll on any phase-2 route, form or review panel. The mobile menu lists Vendors, Evaluation, Contracts and Certificates.
- **Role guard:**
  - Supplier: every phase-2 route redirects to `#/supplier`.
  - Procurement: `#/admin/templates` redirects home.
  - Admin: opens everything.
  - An unknown `V-9999` or `CT-9` shows an error state with a back link.
- **MST (R-04):**
  - Format errors are inline.
  - `0312 456 789` is blocked with "MST 0312456789 already belongs to V-1003 Đại Phong — Save was blocked". The same block works on edit (V-1003 → Minh Phát's MST).
  - A branch `0312456789-001` needs a parent vendor whose first 10 digits match.
  - A 12-digit personal ID is accepted.
  - Check MST shows the registered name, address, status and date, and warns on a name mismatch. `0109999999` returns "Ngừng hoạt động".
  - A link cannot be approved while the MST is not verified.
- **Scorecards (F-28):**
  - V-1001: 4,5·30% + 4,6·25% + 4,2·20% + 4,0·10% + 4,0·10% + 3,6·5% = **4,32 · A**, +0,08 vs Q2 (4,24).
  - V-1002 = 3,98 B and V-1009 = 3,90 B, both recomputed correctly.
  - Progress shows 3 submitted · 2 draft · 2 not started, as specified.
  - Submit needs every manual score and a comment of at least 10 characters. A score above 5 is rejected. Submitting V-1010 updated its vendor score to 3,80 B.
- **Template (F-27):**
  - Weights must total 100%, and the running sum updates live.
  - Thresholds read A ≥ 4,20 · B 3,50–4,19 · C 3,00–3,49 · D < 3,00.
  - The auto sources include "NCR rate & accepted qty" and OTIF by **accepted** qty (R-07).
- **CT-2026-008:**
  - Released 505 + 135 = 640 of 1.200 tấn (53%). Minimum 960 tấn = 80%. Forecast 860 tấn triggers a warning.
  - Expiry in 59 days triggers the 60-day reminder.
  - Q4 = Q3 × 0,95 (index −6,8% capped at −5,0%).
  - 11 released POs.
  - Security 975.000.000 ₫ = 5,0% ("Within 2–10%"). The security form rejects 0,5% and an expiry before the contract end.
- **Contract register:**
  - KPIs read 12/17 active, 48,6 tỷ ₫, and 2 expiring within 60 days (CT-2026-008, CT-2025-019).
  - The off-contract banner shows PO-2026-0861 at +6,4% after CT-2025-007.
  - New contract validates dates (31/02 is rejected), ceiling ≥ qty × price, and the vendor–Material ID link, then saves CT-2026-015 as a Draft.
- **Certificates:**
  - F-38: one blocked pair, Bắc Sơn – CON-24015 (ISO 9001 expired 15/10/2026), with "Renewal pending review".
  - F-37:
    - The review shows 3 automatic checks and 2 manual checks. Reject needs a reason.
    - "Approve & unblock" makes CERT-0109 Valid and marks CERT-0108 Superseded.
    - It unblocks the V-1008 link, and Material 360° then shows Bắc Sơn as Probation.
  - Upload rejects a duplicate number, a past expiry and a non-PDF file.
  - F-39: the 90-day timeline lists 5 certificates sorted by days left, orange at ≤ 30 days.
- **Cross-screen consistency:**
  - Vendor scores, grades and OTIF match §5.
  - V-1003 delete is blocked by PO-2026-0869.
  - V-1001 has a bank change pending Finance (BIDV ···· 0937), with "Open in My approvals".
  - V-1007 shows the onboarding checklist (2 items Missing). Approve stays disabled until all items are OK, and Reject needs a reason.
  - The links from Material 360° to vendors, contracts and certificates all resolve.
- **Phase-1 regression:**
  - Dashboard KPIs are unchanged (186,4 tỷ, 9,7 tỷ / 5,2%, 91,4%, 38/12, 7/2).
  - CON-24015 Material 360° numbers are unchanged.
  - The new-request form, global search (CT-2026-008 and Bắc Sơn → `#/vendors/V-1008`) and the EN/VI switch work.

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| P2-01 | Major | js/pages/evaluation.js `total()`, `tc-save` | A **submitted, locked** scorecard is recomputed from the template's current weights. I changed the TPL-CON weights to 20/35 (sum still 100) and saved: V-1001's submitted Q3 scorecard changed to 4,33 (+0,09), while the vendor master still shows 4,32. The guard only blocks adding or removing criteria. | On submit, store `sc.weights = t.criteria.map(c => c.w)`. In `total()`, use `sc.weights` when it is present: `total(t, scores, w = t.criteria.map(c=>c.w))`. In `tc-save`, also refuse a **weight** change when the template has Submitted or Draft scorecards in the open period: "Weights are locked while Q3/2026 is in progress — Duplicate the template." |
| P2-02 | Major | js/pages/vendors.js `render()` / module `st` | Form state leaks across vendor profiles. I opened "Edit vendor" on V-1003, then went to `#/vendors/V-1005`. The page still shows **"Edit vendor · V-1003"**, and Save there would overwrite V-1003. The same leak affects `st.confirmDel` and `st.rejecting`/`st.reject`. | In `render(p, sub)`, track the current route the way contracts.js does: `const key = id \|\| 'list'; if (st.cur !== key) { st.cur = key; st.form = null; st.errs = {}; st.mst = null; st.dup = null; st.confirmDel = null; st.rejecting = false; st.reject = ''; }` |
| P2-03 | Major | js/pages/certificates.js KPI row; js/data.js `certStats` | The KPIs mix the full register with the sample. Valid shows 214 (`certStats`), but Expiring, Expired and Pending review show the sample counts **2 / 2 / 2**. F-36 and `certStats` say **3 / 4 / 5**. | Show `certStats` for all four (`num(D().certStats.expiring)`, `.expired`, `.pending`) and move the sample counts to the sub-line: `${n('Expiring')} in this sample · …`. Decrement the matching `certStats` counter when a review is approved or rejected, so the KPIs still react. |
| P2-04 | Minor | js/data.js `CT-2026-008.releases` | The released value adds up to **10,45 tỷ ₫**: 460 × 16.450.000 + 45 × 15.627.500 + 135 × 16.160.000 = 10.451.837.500. F-33 says **10,31 tỷ ₫ / 11 PO**. | Reconcile with the catalogue. Set the CON-24020 line to `q3: 15110000, q4: 14354500` and the PO-2026-0590 price to `15110000`. The total then becomes 10.310.087.500 → "10,3 tỷ". Alternatively, amend F-33 to 10,45 tỷ. |
| P2-05 | Minor | js/pages/contracts.js KPI "Average consumption" | The KPI shows **51%** (the sample mean, which includes the unsigned CT-2026-014 at 0%). F-30 says **58%**. The other KPIs use the full-universe `contractStats`. | Add `avgUse: 58` to `D.contractStats` and show `pct(D().contractStats.avgUse,0)` with the sub-line `${pct(avg,0)} in this sample`. Exclude `Pending signature` and `Draft` from the sample mean. |
| P2-06 | Minor | js/pages/contracts.js detail "VAT", `blank()`, `saveNew()` | Contract VAT 8% shows as a bare "8%". The brief requires "8% (reduced, until 31/12/2026)". CT-2026-011 and CT-2026-014 run into 2027 at 8%. The new-contract form defaults to VAT 8 for an 01/01–31/12/2027 term, and it accepts any VAT whatever the Material ID's VAT (R-03). For example, CON-24015 steel at 8% is accepted. | Add `const vatLabel = (v) => v === 8 ? '8% (reduced, until 31/12/2026)' : v + '%'` and use it in the summary, KPI and list. In `blank()`, default `vat` to `App.material(mat).vat`. In `saveNew()`, add `if (+f.vat !== m.vat) e.vat = \`VAT must match ${m.id} (${m.vat}%)\`` and `if (+f.vat === 8 && App.dt(f.start) > App.dt('31/12/2026')) e.vat = '8% applies only until 31/12/2026'`. |
| P2-07 | Minor | js/pages/contracts.js upload `ver` | The version number is a count of files of that type. Uploading a "Signed contract" to CT-2026-008, which already has **v3**, creates **v2**. | `const ver = 'v' + (Math.max(0, ...c.files.filter(y => y.type === x.type).map(y => +String(y.ver).slice(1) \|\| 0)) + 1);` |
| P2-08 | Minor | js/pages/evaluation.js `render()` | After `#/admin/templates`, opening `#/evaluation` lands on the "Criteria templates" view without the scorecard, because `st.tab` keeps the admin value. | `if (admin) { st.tab = 'templates'; st.fromAdmin = true; } else if (st.fromAdmin) { st.tab = 'scorecards'; st.fromAdmin = false; }` |
| P2-09 | Minor | js/pages/evaluation.js `progress()` Score column | Draft scorecards show a partial total with a grade: V-1011 reads "3,19 · C" and V-1010 "3,55 · B" while scores are missing. That looks like a real downgrade. | When `!complete(s.scores)`, render `${num(x,2)} <span class="small muted">(incomplete)</span>` without a grade. |
| P2-10 | Minor | js/pages/certificates.js `review()` / `decide()` | Approving always needs "Validity gap noted" ticked. For a first certificate with no predecessor (CERT-0117 Phú Mỹ), the label reads "old certificate expired —" but the tick is still required. | Render the gap checkbox only when `c.replaces` is set, and require only `r.acc`, plus `r.gap` when `c.replaces` is set. |
| P2-11 | Minor | js/data.js CT-2025-019, CT-2026-011, docs CT rows; contracts.js KPI | Data and labels do not reconcile: (a) CT-2025-019 shows 214 of 260 trips released, but only 1 PO (12 trips, "0,2 tỷ ₫ · **1 POs**"). (b) Its performance security expires 20/11/2026, before the contract end, which breaks the rule the Edit-security form enforces. (c) The `docs` CT dates differ from the contract starts: CT-2025-019 01/01/2026 vs 01/01/2025, and CT-2026-011 01/01/2026 vs 01/04/2026. | (a) Pluralise as `${n} PO${n===1?'':'s'}` and add a sub-line "+ 202 trips released before 2026 (history)", or add release rows. (b) Keep the 18-day alert as a demo, but add the note "Extension requested 28/10/2026", or set the expiry to `31/01/2027`. (c) Set the docs `date` to the contract `start`. |
| P2-12 | Minor | js/data.js V-1001 links / scorecard `basis` | Vendor V-1001 shows 3 Material IDs supplied. Its scorecard basis says "18 POs · **5 Material IDs**", and F-25 cites 6. | Link V-1001 to 2–3 more Material IDs in `materials[].vendors` (for example CON-24330 and CON-24325 as Approved), or change the basis to "18 POs · 3 Material IDs". |
| P2-13 | Minor | js/pages/vendors.js `save()` | After an invalid submit, focus falls to `<body>`. The page scrolls to the alert, but keyboard and screen-reader users lose their place. Contracts, evaluation and certificates focus the first invalid field. | After `App.render()`, use `const x = document.querySelector('#vf [aria-invalid=true]') \|\| document.querySelector('#vf .alert-danger'); if (x) { x.setAttribute('tabindex','-1'); x.focus(); }` |
| P2-14 | Minor | js/pages/vendors.js, evaluation.js, contracts.js, certificates.js `<h1>` | In VI mode the sidebar is translated, but the phase-2 page headings stay English ("Contracts", "Vendors", …). | Wrap the headings in `App.t(...)` and add `Vendors: 'Nhà cung cấp', 'Vendor evaluation': 'Đánh giá NCC', Contracts: 'Hợp đồng', Certificates: 'Chứng chỉ', 'Evaluation templates': 'Mẫu tiêu chí đánh giá'` to the VI dictionary in app.js. |

## Coverage

| F | Status | Notes |
|---|---|---|
| F-20 | PASS | KPIs 142 / 118 / 6. Search by name, MST (with or without spaces), Gmail and Material ID, without accents. Filters for category, status, risk and grade. Material ID chips, score, OTIF. Edit/Delete per row, New vendor, Import Excel. |
| F-21 | PASS | Risk Low/Medium/High/Pending with reasons (single source, expired certificate, OTIF < 85%, NCR). "Last checked 02/11/2026". Re-check per vendor and for all vendors. |
| F-22 | PARTIAL | All fields and Save/Cancel work. Edit state leaks to other profiles (P2-02), and focus is lost after an error (P2-13). |
| F-23 | PASS | 10 digits, 10+3 under the parent, 12-digit personal ID. Tax lookup with name-mismatch warning. Re-check MST. Duplicate block with the exact message. |
| F-24 | PASS | Current account vs pending BIDV ···· 0937 "Pending Finance verification", call-back note, link to My approvals. |
| F-25 | PASS | Linked Material IDs with Remove. Propose EQP-31520, then approve per Material ID (needs a verified MST and a non-pending vendor). Sample count differs from the spec (P2-12). |
| F-26 | PASS | Active/Probation/Blocked/Preferred toggle updates the Material ID links. Delete is disabled with the PO-2026-0869 hint for V-1003. The confirm step works. |
| F-27 | PARTIAL | Template choice, add/rename/re-weight/delete, Auto/Manual sources, 100% rule, thresholds, Duplicate/Save. Weight edits rewrite submitted scorecards (P2-01). |
| F-28 | PASS | V-1001 4,32 A, +0,08. Weight, basis, score, weighted score, comment. Save draft / Submit with validation. "18 POs · 5 Material IDs" (see P2-12). |
| F-29 | PARTIAL | Q3/Q2/Q1 periods, Start new period, the 3 views, progress 3/2/2 with View/Continue/Evaluate. The view stays on templates after the admin route (P2-08), and draft totals show a grade (P2-09). |
| F-30 | PARTIAL | 12/17, 48,6 tỷ, 2 expiring, search, type/status/owner filters, off-contract banner, New contract/Export. Average consumption 51% vs 58% (P2-05). |
| F-31 | PASS | CT-2026-008 header (Framework, Expiring, E-signed v3, 19,5 tỷ, VAT 10%). Amend, Renew, Release PO (disabled when not active). 60-day reminder. Forecast 860 vs 960 tấn. |
| F-32 | PASS | Q3 vs Q4 per Material ID, −5,0% via Phụ lục 01 (index −6,8%, cap ±5%), rule that PO price may not exceed the contract price. |
| F-33 | PARTIAL | 640/1.200 (53%), minimum 960 = 80%, split per Material ID, 11 POs listed. Released value 10,45 vs 10,31 tỷ (P2-04). |
| F-34 | PASS | Key terms (30 days, 0,1%/day max 8%, 7-day replacement, DAP). Security 975 M = 5% within 2–10%, bank/ref, 30-day alert. Edit form validated (R-09). |
| F-35 | PARTIAL | E-signature status (external tool), typed documents with version, Signed / Uploaded by supplier labels, Material ID chips, Upload with validation. Version numbering is wrong (P2-07). |
| F-36 | PARTIAL | Search by number, vendor and Material ID; type/holder/status filters, "Mandatory only", scope, issuer, expiry, verifier, Upload/Export. KPIs show sample counts (P2-03). |
| F-37 | PARTIAL | PDF preview, editable fields, auto and manual checklist, reject reason required, comment, "Approve & unblock" works end to end. Gap tick is wrongly required (P2-10). |
| F-38 | PASS | The rule text and the blocked pair Bắc Sơn – CON-24015 are shown. Open POs continue. Material 360° shows the same Blocked link, which lifts after approval. |
| F-39 | PASS | Bars for 90 days with days left, orange at ≤ 30 days, the 60/30-day reminder note, Material ID chips. |

**Totals:** 11 PASS · 9 PARTIAL · 0 FAIL.

Requirements:
- **R-04:** pass, except the edit-form leak (P2-02).
- **R-07:** the evaluation data source passes (NCR rate, OTIF by accepted qty).
- **R-08:** the bank-change and onboarding parts pass.
- **R-09:** the performance security on contracts passes.
- **R-16:** pass.
- **R-19:** pass for contracts, except version numbering (P2-07).

**Regression (phase 1):** no new defects. Every phase-1 route renders without console errors at 1440 and 390 px. The role guard (P1-02) now also covers the phase-2 routes.

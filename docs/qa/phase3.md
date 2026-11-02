# ProcureLink — QA Phase 3 (Agent 2)

**Verdict: PASS WITH FIXES.** 0 Blocker · 4 Major · 13 Minor.

**Scope:** F-40 to F-60 (Tenders, Purchase requests, Approvals), plus the phase-3 parts of R-03, R-05, R-06, R-09 (bid security), R-10, R-11, R-12, R-14, R-18, R-19 and R-22/R-23. I read js/sourcing.js, js/pages/tenders.js, pr.js and approvals.js, and the phase-3 block of js/data.js, and checked the numbers by hand against docs/04-design-brief.md §5 and the F-catalogue. I tested in headless Chromium (Playwright, `file://`):
- I swept 36 routes × 3 roles × 1440/390 px.
- I ran these flows:
  - the PR editor: Material ID lookup, lines, validation, over budget, attachments, save and submit;
  - new tender from a PR and from a Material ID, then invite;
  - the TND-029 award: justification, submit, approve as Đỗ Hoàng Nam, notices, Create PO;
  - My approvals: approve, reject or return, delegation, Admin SoD override, history.
- I re-ran the phase-1 and phase-2 routes.

No code files were edited. As briefed, the TND-029 figures are computed from data.js: award 1.465.900.000 ₫, saving 54.100.000 ₫ = 3,6%, bid security 15.000.000 ₫. They differ from the catalogue F-47/F-48 figures; that difference is accepted and not reported. I checked only that they are internally consistent, and they are.

**What holds**
- **Console:** no errors or warnings on any route or flow.
- **390 px:** no horizontal page scroll on any phase-3 route or form. Wide tables and the stepper scroll inside their own region.
- **Role guard:**
  - Supplier: `#/tenders*`, `#/pr*` and `#/approvals` redirect to `#/supplier`.
  - Procurement and Admin can open all of them.
  - An unknown `TND-9` or `PR-9` shows an error state with a back link.
- **Sealed bids (R-05):**
  - TND-031 shows "Bids · sealed · 4 of 5" with bidder, receipt no., time and status only. The Price column reads "Sealed".
  - "Open bids" is disabled until 05/11/2026 17:00, and the matrix shows "Locked until bid opening".
  - No TND-031 price exists in data.js, so none can appear on the tender list, Material 360°, the dashboard or in search.
- **TND-029 consistency:**
  - The opening-minutes totals equal the matrix subtotals (1.465.900.000 / 1.466.950.000 / 1.472.250.000 ₫).
  - Long Hậu fails the technical envelope (65,0 < 70), so its price envelope is not opened.
  - Phước Thành has no bid security, so it is Non-compliant: not ranked, and not "Lowest" on CON-24325 even though its price is lower.
  - Scores: 82,0 × 40% + 100 × 60% = 92,80 (Rank 1) and 76,0 × 40% + 99,93 × 60% = 90,36 (Rank 2).
  - The default award goes to Tân Phước on every line: 1.465.900.000 ₫, baseline 1.520.000.000 ₫, saving 54.100.000 ₫ = 3,6%.
  - CON-24330 is marked "Not lowest" (An Khang is lower), and the justification is then mandatory (at least 20 characters). Picking An Khang on that line recomputes to 1.453.150.000 ₫ / 4,4%, and the justification becomes optional.
  - Bid security reads 15.000.000 ₫ in the KPI, Settings, the matrix threshold and the minutes.
- **Award → approval (R-12, R-18):**
  - Submit → status "Award pending", and the item goes into Đỗ Hoàng Nam's queue. His badge shows 1; Nguyễn Minh Anh's stays at 6 because she evaluated the tender.
  - Approve → "Awarded" and stepper step 7. Notices go out: winners hold their bid security, Long Hậu's is released by 16/11/2026 (≤ 14 days), and Phước Thành's shows "—".
  - Create PO and Create contract are enabled only after approval.
- **PR-2026-0452 (F-50…F-55):**
  - VAT 10% on 2.438.000.000 + VAT 8% on 1.566.500.000 = 4.004.500.000 ₫ excl. VAT.
  - Budget: 12 tỷ − 2,15 − 5,4 = 4,45 tỷ available; after this PR 445.500.000 ₫ (3,7%).
  - The CON-24015 line shows "Release PO from contract CT-2026-008 · còn 560 / 1.200 tấn". CON-24102 at 588tr shows "Tender required, value > 500tr".
  - Typing "bê tông" suggests exactly 3 IDs (CON-24325, CON-24330, SRV-52210).
  - Raising qty to 200 tấn goes over budget by 770.500.000 ₫. That adds a Budget override step and makes the justification mandatory.
  - Uploads reject a duplicate name and a .exe. A new BOQ is versioned v3.
- **My approvals (F-56…F-60):**
  - The queue shows "Waiting for me (6)", in sync with the menu badge (6 → 5 → 4 as items are decided).
  - SLA labels read "Due in 6 h 30 min" etc. "Approving as … · next: Đỗ Hoàng Nam" is shown.
  - Reject or Return needs a comment of at least 10 characters, and the error is focused.
  - PO-2026-0877 Rev.2 shows "Blocked — SoD" and its Approve button is disabled. The Admin override needs a reason and is written to the audit list.
  - Delegation rejects more than 14 days and a cap above 2 tỷ. History shows "on behalf of".
  - The 4 SoD rules are listed.
- **Cross-screen consistency and regression:**
  - Dashboard KPIs are unchanged (186,4 tỷ, 9,7 tỷ / 5,2%, 91,4%, 38/12, 7/2). "New PR" opens `#/pr/new`.
  - Material 360° "Start tender" / "Create PR" and the tile links (`#/tenders?q=`, `#/pr?q=`) resolve.
  - The contracts off-contract banner links to `#/tenders/new?mat=CON-24102`, and that form works.
  - Vendor V-1001's "Open in My approvals" deep-links to the item.
  - Phase-1 and phase-2 routes render with no errors.

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| P3-01 | Major | js/pages/approvals.js `ap-ovr` submit, `blocked()` | **SoD can be bypassed by the person it blocks.** Nguyễn Minh Anh holds both the procurement and admin roles. In the Admin workspace she overrode the SoD block on **her own** change order PO-2026-0877 Rev.2 and then approved it herself (history: "Approved · Nguyễn Minh Anh"). R-18 says the requester must never approve, and an override must come from someone else. | Make the block also hold the raiser: `const blocked = (a) => a.sod && (!a.override \|\| a.by === S.me());`. In the `ap-ovr` handler, before saving, add `if (a.by === S.me()) { st.oerr = 'You raised this item — another Admin must override.'; App.render(); return; }`. Render the override form only when `App.state.role === 'admin' && a.by !== S.me()`. |
| P3-02 | Major | js/pages/pr.js `save()` | **A submitted PR never reaches any approver.** I submitted PR-2026-0453 (and PR-2026-0452). The status becomes "Submitted", but no item is pushed to `DATA.approvals` or `approvalChains`, so it appears in no queue or badge and can never be approved (R-06 flow ends here). | In the `if (submit)` branch, before navigating: `d.status = 'Awaiting approval'; D().approvals = D().approvals.filter((x) => x.id !== id); D().approvals.push({ id, type: 'PR approval', title: d.title, mats: d.mats, value: net, by: f.requester, step: 'Step 1 of ' + R.steps.length, sla: App.addDays(D().today, 2) + ' 17:00', assignee: R.steps[0][1] }); D().approvalChains[id] = [[f.requester + ' · Requester', 'Submitted', D().today + ' 10:30', f.override \|\| '']].concat(R.steps.map(([s, who], k) => [who.split(' (')[0] + ' · ' + s, k ? 'Next' : 'Waiting', '', '']));` |
| P3-03 | Major | js/pages/pr.js `save()` | **Submitting an existing draft leaves a stale editor.** PR-2026-0452: Submit sets `st.ed = null` and `location.hash` to the **same** hash, so no hashchange fires. The screen keeps the editable form with the "Draft" pill (the data says Submitted), and the user can submit again. | Replace `location.hash = '#/pr/' + id;` with `const h = '#/pr/' + id; if (location.hash === h) App.render(); else location.hash = h;`. Use it in both the submit branch and the new-draft branch. |
| P3-04 | Major | js/pages/pr.js and tenders.js `change` handlers | **The first click on Save/Submit is swallowed after editing a field.** Typing in a qty/price field (PR) or qty/secPct/delivery/PR (new tender), then clicking the button directly, fires `change` on blur. That re-renders and replaces the button mid-click. Observed: PR-0452 SRV-52210 qty 49 → 50 + "Save draft" → nothing saved and no toast. `#/tenders/new?mat=CON-24102` qty 300 + "Save draft tender" → nothing happened; a second click saved it. | In each `mount`, add `root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit], [data-pr=save]')) st.hold = true; });`. In the `change` handlers, after copying values into state (`readEd(root)` / `Object.assign(st.nf, S.read(...))`), run `if (st.hold) { st.hold = false; return; }` before `App.render()`. Save and submit read from the DOM anyway. |
| P3-05 | Minor | js/pages/pr.js `route()` | When the requester is the Procurement Lead, her step is reassigned to Đỗ Hoàng Nam, who also holds the Finance Director step and the Budget override. PR-0452 shows 3 of 4 steps (when over budget) for one person, against "an approver who already approved a step is skipped". | After building `steps`, dedupe by approver: `const seen = new Set(); steps.forEach((s) => { const n = s[1].split(' (')[0].split(' ·')[0]; if (seen.has(n)) s[1] += ' — skipped (already approved earlier step)'; seen.add(n); });` and count only the steps that are not skipped in "Step i of n". |
| P3-06 | Minor | js/data.js docs `PR-2026-0440` | The list and Material 360° show 3.434.000.000 ₫, but the PR detail lines add up to 1.824 + 504 + 1.122 = **3.450.000.000 ₫**. | Set `value: 3450000000` on the PR-2026-0440 doc. |
| P3-07 | Minor | js/data.js `PR-2026-0438` (prs, approvals, chains) | (a) 12 × 7.166.667 = 86.000.004 ₫ on the detail page, but 86.000.000 ₫ in the list and queue. (b) At ≤ 200tr, `route()` gives 1 step (Dept head), while the approval item says "Step 2 of 2" with a Procurement Lead step. | Change the line to `{ mat: 'EQP-31501', qty: 10, price: 8600000 }` (= 86.000.000). Then either set the approval to `step: 'Step 1 of 1'` with chain `['Nguyễn Minh Anh · Dept head (Kho A acting)', 'Waiting', …]`, or keep 2 steps and raise the value above 200tr consistently on the doc, approval and line. |
| P3-08 | Minor | js/pages/tenders.js `invitedCard()` | The card title uses `doc.invited`, but lists only approved-link vendors: TND-024 "(4)" lists 3, TND-034 "(4)" lists 1 (Sao Việt), TND-032 "(3)" lists 2. | Use `rows.length` in the title. When `rows.length < doc.invited`, append a line `<li class="small muted">+${doc.invited - rows.length} invited outside the approved list (by exception)</li>`. |
| P3-09 | Minor | js/pages/tenders.js `detail()` | Awarded TND-024 and TND-027 show no winner, value or Create PO, although data.js has `award: { vendor, value }`. The stepper leaves "Award" as current instead of done. | When `!evalBlocks && t.award && t.award.status === 'Approved'`, add `card('Award', `<dl class="dl"><dt>Awarded to</dt><dd><a href="#/vendors/${t.award.vendor}">${esc(App.vendor(t.award.vendor).name)}</a></dd><dt>Value</dt><dd>${vnd(t.award.value)} excl. VAT</dd></dl><div class="row-acts"><a class="btn btn-p" href="#/po?tender=${doc.id}">Create PO</a></div>`)` to `left`. In `progress()`, mark every step done when `doc.status === 'Awarded'` (`progress(7)`). |
| P3-10 | Minor | js/pages/approvals.js `decideOne()`; js/data.js N-805; js/pages/tenders.js list KPI | Notifications and notes don't follow decisions. After approving PR-0431, N-801 "waits for your approval" stays unread on the dashboard. N-805 says Nguyễn Minh Anh's TND-029 scores are missing, but they are shown (84/78/72/66). After the award, Material 360° still shows "Evaluation due 04/11/2026", and the tender KPI note is hard-coded. | In `decideOne()`, add `D().notifications.filter((n) => n.doc === a.id).forEach((n) => { n.read = true; });`. In the award branch, add `doc.note = 'Awarded ' + NOW.slice(0, 10);`. Change N-805 to "TND-2026-029 award recommendation due 04/11/2026 — submit the Tờ trình". Compute the "In evaluation" KPI note from the docs with status Evaluation/Award pending. |
| P3-11 | Minor | js/pages/approvals.js award branch | The banner says "Awarded prices written to Price history", but nothing is written: Material 360° CON-24330 keeps its last price of 1.320.000 ₫ / PO-2026-0848. | On approval: `t.lines.forEach((l, i) => { const b = t.bidders.find((x) => x.vid === t.award.pick[i]); const m = App.material(l.mat); m.last = b.prices[i]; m.lastPo = a.id; m.lastVendor = b.vid; });`. Alternatively, change the text to "…will be written to Price history when the PO is issued". |
| P3-12 | Minor | js/pages/pr.js `save()` | The over-budget error (`#pr-override`) sits in the Budget card, **outside** `#pr-form`. `S.focusErr('#pr-form')` finds nothing, so focus stays on the body and the only error is off-screen at 390 px. | `if (Object.keys(e).length === 1 && e.override) { const o = document.getElementById('pr-override'); o.focus(); o.scrollIntoView({ block: 'center' }); } else S.focusErr('#pr-form');` |
| P3-13 | Minor | js/pages/pr.js `render()` | After "Return for changes" (PR-0438 → Returned), the PR is read-only with no edit or resubmit action and no return comment. The requester cannot act on F-58 "Request changes". | Treat `Returned` like Draft: `if (['Draft', 'Returned'].includes(d.status) && D().prs[d.id])`. Show the last history comment above the form: `D().approvalHistory.filter((h) => h.id === d.id).pop()`. |
| P3-14 | Minor | js/pages/tenders.js `newPage()` | The only and default source PR is PR-2026-0436 (386tr, sourcing "RFQ ≤ 500tr"). The hint says "Approved PRs that need a tender (value > 500tr…)", and the method defaults to Sealed bid. | Change the hint to "Approved PRs without an active contract". Default `method: est <= 500000000 ? 'RFQ' : 'Sealed bid'` and `secPct: est <= 500000000 ? '0' : '1'`. |
| P3-15 | Minor | js/pages/tenders.js `TABS`/`cnt` | A tender in "Award pending" is in no tab: Evaluation (0) after submit, so it is only visible under All. | Make the Evaluation tab match both: `cnt('Evaluation')` → `all.filter((d) => ['Evaluation', 'Award pending'].includes(d.status)).length`, with the same rule in the row filter. |
| P3-16 | Minor | js/pages/pr.js `startEdit()` | `files: pr.files` shares the stored array, so an upload in the draft editor is kept even if the user leaves with Cancel and never saves. | `files: pr.files.slice()`. |
| P3-17 | Minor | js/data.js TND-031 bidder V-1008 | The warning "ISO 9001 expired — blocked for CON-24015" is static. After the phase-2 flow (CERT-0109 "Approve & unblock"), TND-031 still shows it, while Material 360° shows Bắc Sơn as Probation. | Remove the `warn` from data. In `sealedCard`/`invitedCard`, derive it: `const blk = App.material('CON-24015').vendors.find((v) => v[0] === b.vid && v[1] === 'Blocked'); b.warn = blk ? 'Certificate block — CON-24015' : b.warn;`. Do this for any line Material ID. |

Not a defect: "Create PO" goes to `#/po?tender=…`, which is "Not built yet" (Purchase orders are phase 4).

## Coverage

| F | Status | Notes |
|---|---|---|
| F-40 | PASS | Tabs with counts. Search by ID, title, Material ID, material name or bidder ("Tân Phước" finds 029 and 031). Method filter. "8% reduction ends 31/12/2026" on packages delivered after 2026 (030, 033, 034, 035). New tender and Export work. "Award pending" has no tab (P3-15). |
| F-41 | PASS | TND-031: 4 of 5 bids, no prices anywhere, Open bids disabled, matrix locked until 05/11/2026 17:00. The Bắc Sơn warning is static (P3-17). |
| F-42 | PASS | 7-step stepper. Settings: two envelopes, bid security, 40/60, price-score formula, 90 days, currency, visibility. Settings lock once bidding starts. Typed, versioned attachments with Material ID chips. |
| F-43 | PASS | Minutes name 2 openers with COI. Technical envelopes open 17:05 (+5 minutes), price envelopes only for bidders who passed. Both are audit logged. |
| F-44 | PASS | Q&A is anonymous and per Material ID line. Addendum No. 1 shows 4/4 acknowledgements by Gmail + portal. Publishing an answer is validated. "Open Q&A log" works. |
| F-45 | PASS | 5 members with COI status; Remind for Lê Quốc Huy. The note says a member without COI cannot score. |
| F-46 | PASS | Two evaluators, consolidated average, pass mark 70: 3 Pass, Long Hậu Fail. |
| F-47 | PASS | Matrix per Material ID: qty, VAT, last-PO baseline, unit and line totals, "Lowest" among compliant bids, subtotal/VAT/total, bid security row (Phước Thành Non-compliant), weighted score, ranking. Figures are from data.js as accepted. |
| F-48 | PARTIAL | Award per line, not-lowest justification, SoD route to Đỗ Hoàng Nam, notices, bid security release ≤ 14 days, Create PO only after approval. Awarded tenders 024/027 show no award (P3-09). Price history is not written (P3-11). |
| F-49 | PASS | TND-034 reverse auction 09:00–10:00, 0,5% decrement (92.500 ₫), 5-minute extend, rank only. TND-032 accepts VND or USD at the bank selling rate. |
| F-50 | PARTIAL | All header fields, last-saved time, Save draft and Submit. Submit does not reach approvals (P3-02), leaves a stale editor (P3-03), and the first click can be lost (P3-04). |
| F-51 | PASS | 12 / 2,15 / 5,4 / 4,45 tỷ, −4,0045 tỷ, 445.500.000 ₫ (3,7%), stacked bar. Over budget adds the Budget override step and a mandatory justification (focus issue P3-12). |
| F-52 | PASS | "bê tông" suggests 3 IDs. UoM/VAT/last-PO price auto-fill. Add/remove line, Import BOQ, Request new Material ID, totals split 10% / 8%. An unknown ID is rejected. |
| F-53 | PASS | CT-2026-008 · còn 560 / 1.200 tấn (consumed across lines). "Tender required, value > 500tr". RFQ ≤ 500tr. |
| F-54 | PARTIAL | Bands, steps, SLA 2 working days and SoD note are shown. One person holds 3 steps on PR-0452 (P3-05). PR-0438 route and queue disagree (P3-07). |
| F-55 | PASS | Typed upload with version, uploader, "Uploaded by supplier" and Material ID chips. Duplicate and wrong-type files are rejected (draft side effect P3-16). |
| F-56 | PASS | Waiting for me (6) / Delegated / History. Type filter, SLA, value, requester, step. Badge stays in sync. Bulk approve is limited to < 50.000.000 ₫ without SoD (0 eligible in seed). |
| F-57 | PASS | PR-0431: Material ID line with est./last price + source + 90-day avg (+14,9%), VAT, budget impact 2,9 → 1,05 tỷ, chain with the capex rule, attachments. |
| F-58 | PASS | Approve / Reject / Return, with a comment ≥ 10 characters for reject/return. "Approving as … next: …". Multi-step advance (0431 → Đỗ Hoàng Nam). The Returned PR cannot be edited (P3-13). |
| F-59 | PASS | Lê Quốc Huy 10/11–14/11/2026, cap 500.000.000 ₫, PR approval + PO change order, above cap → Đỗ Hoàng Nam. Edit/Cancel work, validation ≤ 14 days and cap ≤ 2 tỷ. History shows "on behalf of". |
| F-60 | PARTIAL | "Blocked — SoD" with Approve disabled, 4 rules, Admin override logged. A dual-role user can override and approve their own item (P3-01). |

## Fix status (Agent 1)

All 17 findings fixed. Re-tested in headless Chromium (Playwright, `file://`), 1440/390 px, procurement + admin: no console errors, no horizontal scroll on phase 1–3 routes.

| ID | Status | Fix / re-test |
|---|---|---|
| P3-01 | Fixed | `blocked()` also holds the raiser even after an override; the override form is rendered only for an Admin who did not raise the item, and the handler rejects a self-override. Re-test: Nguyễn Minh Anh (Admin workspace) sees no override form on PO-2026-0877 Rev.2; Approve stays disabled. |
| P3-02 | Fixed | Submit sets "Awaiting approval", pushes the PR approval item (step 1 of n, SLA +2 days) and the approval chain. Re-test: PR-0452 appears in `DATA.approvals` with its chain. |
| P3-03 | Fixed | Navigation re-renders when the hash is unchanged. Re-test: PR-0452 submit shows the read-only view. |
| P3-04 | Fixed | `mousedown` on submit/save sets `st.hold`; the blur `change` handler stores the values but skips the re-render (PR and New tender). Re-test: qty 49→50 + Save draft saves on first click; `#/tenders/new?mat=CON-24102` qty 300 + Save creates TND-2026-036 on first click. |
| P3-05 | Fixed | `route()` marks repeated approvers "skipped (already approved earlier step)"; step numbering counts active steps only (PR-0452: 2 steps). |
| P3-06 | Fixed | PR-2026-0440 value 3.450.000.000 ₫. |
| P3-07 | Fixed | PR-0438 line 10 × 8.600.000 = 86.000.000 ₫; approval "Step 1 of 1", chain Dept head (Kho A acting). |
| P3-08 | Fixed | Title uses listed rows; "+n invited outside the approved list (by exception)". |
| P3-09 | Fixed | Awarded TND-024/027 show an Award card (vendor, value, Create PO); stepper all done. |
| P3-10 | Fixed | Decisions mark the item's notifications read; award sets `note = 'Awarded …'`; N-805 text changed; "In evaluation" KPI note computed from data. |
| P3-11 | Fixed | Award approval writes awarded price/vendor/tender to the Material ID (CON-24330 → 1.270.000 ₫ / TND-2026-029). |
| P3-12 | Fixed | Over-budget-only error focuses and scrolls to `#pr-override`. |
| P3-13 | Fixed | Returned PRs open in the editor with the return comment shown; resubmit pushes a fresh approval. |
| P3-14 | Fixed | Hint "Approved PRs without an active contract"; ≤ 500tr defaults to RFQ / 0% security. |
| P3-15 | Fixed | Evaluation tab and count include "Award pending". |
| P3-16 | Fixed | Editor copies `pr.files`. |
| P3-17 | Fixed | Static warn removed; derived from the Material ID vendor link status for every tender line (shows "Certificate block — CON-24015" until CERT-0109 is approved). |


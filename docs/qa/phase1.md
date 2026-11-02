# ProcureLink — QA Phase 1 (Agent 2)

**Verdict: PASS WITH FIXES.** 0 Blocker · 4 Major · 9 Minor.

**Scope:** F-01 to F-19, plus the phase-1 parts of R-03, R-15, R-16 and R-25. I read the code (js/app.js, js/data.js, js/pages/*.js) and loaded `DATA` in node to check the numbers. I tested in headless Chromium (Playwright) from `file://`. I swept every phase-1 route at 1440 px and 390 px, then tested the login, filters, the new-request form, tabs, the "/" shortcut and the mobile menu. No code files were edited.

**What holds**
- **Console:** no errors or warnings on any route.
- **390 px:** no horizontal page scroll. Tables scroll inside `.tbl-wrap`. The mobile menu opens and closes on navigation.
- **Search:** HTML in the query is escaped (an `<img onerror>` query rendered no image).
- **KPI sums:**
  - Category spend 92,6 + 48,3 + 24,1 + 21,4 = 186,4 tỷ.
  - Saving 9,7 tỷ = 5,2%. YoY +8,9% = (186,4 − 171,2) / 171,2.
  - Open PRs 38 (12 awaiting approval). Active tenders 7, with 2 closing this week.
  - OTIF series matches §5.
- **Price alerts:** LOG-61012 +8,9%, CON-24102 +6,4%, CON-24015 −5,3% and EQP-31244 +5,2% all match §5.
- **CON-24015 (Material 360°):**
  - 12-month average 16.170.000 is the true mean of the series.
  - Saving (16.450.000 − 15.200.000) × 80 = 100.000.000 ₫.
  - PO-0858 is 45 × 15.627.500 = 703.237.500. PO-0791 is 60 × 16.450.000 = 987.000.000. PR-0412 is 80 × 16.450.000 = 1.316.000.000.
  - OTIF 27 of 29 = 93,1%.
- **Steel VAT:** CON-24015 and CON-24020 are 10% and not eligible for the 8% reduction. The form blocks 8% on metal items and blocks 8% when the item is not eligible.
- **Duplicate check:** the CB500-V draft matches CON-24015 at 92%, as in the spec.
- **Number formats:** vi-VN throughout (`15.200.000 ₫`, `186,4 tỷ ₫`, `91,4%`).
- **Approvals badge:** 6 in the sidebar and in its aria-label ("6 waiting").
- **Bell:** shows 6 unread, and the count updates after "Mark read" and "Mark all read".

## Findings

| ID | Sev | File | Problem | Exact fix |
|---|---|---|---|---|
| P1-01 | Major | js/app.js `shell()` / `USERS`; js/pages/dashboard.js line "Good morning" | The header and greeting always show the default user for the workspace. Signing in as quochuy.le@gmail.com still shows "Nguyễn Minh Anh · Procurement Lead". Accepting the invitation for kho.phumy@gmail.com (V-1007 Phú Mỹ) shows "Võ Thị Lan · Thép Minh Phát". `App.state.user` is set at login but never used, and it is lost on reload. | In `App.login(role, user)`, store `localStorage['pl.user']=user.email`. Restore `state.user` from `DATA.users` at boot. In `shell()`, use `state.user.name` / `state.user.title` (fall back to `USERS[ws]`). In dashboard.js, use `App.state.user.name`. Pass `u` from both login branches in login.js. |
| P1-02 | Major | js/app.js `render()`; pages with `ws:'procurement'` | There is no role check. With the supplier role, `#/dashboard`, `#/materials` and `#/material360` open and show internal prices and the procurement sidebar (`ws` from the page overrides the role). This breaks F-02. | In `render()`, add `const allowed = found && (!found.p.roles \|\| found.p.roles.includes(state.role));`. If not allowed, show `<h1>No access</h1>` with a link to `HOME[state.role]`. Give dashboard, notifications, search and material360 `roles:['procurement','admin']`, and materials `roles:['procurement','admin']`. Use `ws = state.role==='admin' && found.p.ws ? found.p.ws : state.role`, or drop `ws` for suppliers. |
| P1-03 | Major | js/pages/materials.js `mount` `change` handler | Every `change` event on name, group, diameter, cat, uom, vat or vat8 calls `App.render()`, which replaces the form. If the user edits the VN description and then clicks another field, focus goes to `<body>` and the next keystrokes are lost (seen in the test: HS stayed `7214.20`). The click that caused the blur can also be swallowed, including a click on Submit. | Do not re-render the whole app on `change`. Recompute only the duplicate block and the VAT hint, e.g. `st.f=readForm(root); root.querySelector('#nm-dup-box').outerHTML = dupBox(st.f)`. Alternatively, save `document.activeElement.id` before `App.render()` and focus it again afterwards. Only re-render fully for `cat` (the ID changes). |
| P1-04 | Major | js/pages/materials.js `save()` | "Save draft" takes the next number (`c.next += 1`). The test saved EQP-31521 as a draft and moved the counter to 31522. F-11 says the number is held on submit and assigned on approval, so drafts must not use numbers. | In `save('Draft')`, set `id = 'DRAFT-' + Date.now().toString(36)` (or `null`, shown as "Draft · no number"). Do not increment `c.next`. Increment only when `status === 'Pending approval'`. |
| P1-05 | Minor | js/data.js `notifications` N-788 | "GRN-2026-1532 received 50 tấn … on time & in full" has type **PO overdue**. It is a receipt, not an overdue item, but it appears under the "PO overdue" filter and red pill. | Change N-788 to `type:'Delivery'` and add `Delivery:'success'` to `typeTone` in dashboard.js. Or remove it from the Action required list (`n.type!=='Delivery'`). |
| P1-06 | Minor | js/pages/dashboard.js KPI OTIF | When a category is above target (Services 96%), the KPI reads "Target 95% · -1,0 pts below". | `${otif90 >= K.otifTarget ? num(otif90-K.otifTarget,1)+' pts above' : num(K.otifTarget-otif90,1)+' pts below'}` |
| P1-07 | Minor | js/pages/material360.js (delta tile) | When there is no price change (EQP-31007), the tile shows "Last price −0,0%". | When `Math.abs(d) < 0.05`, render `±0,0%`. Otherwise use the sign rule `d>0?'+':'−'`. |
| P1-08 | Minor | js/pages/dashboard.js search; js/pages/materials.js filter | Search is accent-sensitive and the MST must keep its spaces. "thep" returns 0 results (should find Thép). "0312456789" returns 0 (only "0312 456 789" works). | Normalise both sides: `const n = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/gi,'d').replace(/\s+/g,'').toLowerCase();` Use `n(x).includes(n(q))` in `hit()` and in the materials `q` filter. |
| P1-09 | Minor | js/app.js shell (F-09) | F-09 asks for an EN/VI language switch in the shell. There is none. | Add `<button class="btn btn-sm" data-act="lang" aria-pressed>EN · VI</button>` in `.top-r` and store `pl.lang`. In phase 1, a minimal version can switch the page headings and the Material ID description column (VN/EN) only. |
| P1-10 | Minor | js/pages/material360.js linked documents (F-19) | The tabs are only All (n), Attachments and Invoices. F-19 lists Attachment / Tender / PO / PR / NCR. "All (14)" lists 11 rows, because the count includes the 3 attachments but the All tab does not show them. | Build the tabs from the document types present (`PR`, `TND`, `PO`, `GRN`, `CT`, `INV`, `NCR`) plus Attachments. Add the attachment rows to the All table (or count `All` as documents only). |
| P1-11 | Minor | js/data.js materials `lastPo` | Some last-PO numbers do not exist in `docs`, so they have no record and search finds nothing: PO-2026-0702, 0844, 0855, 0790, 0781, 0772, 0760, 0870, 0831. EQP-31007 shows "POs 0 total" but "OTIF 3 of 3" and its last PO is PO-2026-0702. | Add minimal PO records (vendor, date, material, quantity, value excl. VAT, status Closed/Delivered) for these numbers in `docs`, or add a `history` count to the tile ("POs 0 open · 3 total"). |
| P1-12 | Minor | js/pages/dashboard.js `st` | One filter state object is shared by Dashboard "Action required" and `#/notifications`. Choosing "Unread" on the dashboard carries over to the notification centre. | Use separate state objects (`stDash`, `stNotif`) and pass them to `notifFilters`, `filterNotifs` and `wireNotifs`. |
| P1-13 | Minor | js/pages/materials.js request form | Changing the category keeps the steel group ("EQP-31521 · Thép xây dựng"). Required certificates are always shown as "checked at" a fixed text. In material360.js the certificate stage prints in lowercase ("checked at grn", "valid on po date"). | On a `cat` change, reset `group` (use `''` with the category's first group as the hint). In material360.js, print the certificate check text as stored in the data (`'At GRN'`, `'Valid on PO date'`), without `.toLowerCase()`. |

Phase-2 routes linked from phase 1 (`#/approvals`, `#/po`, `#/tenders`, `#/pr`, `#/contracts`, `#/price`, …) show a clean "Not built yet" page. That is expected for phase 1 and not logged as a finding.

## Coverage

| F | Status | Notes |
|---|---|---|
| F-01 | PASS | Accepts only Gmail addresses on the allowlist. Errors work for: non-Gmail, not on the allowlist, wrong role, no consent. |
| F-02 | PARTIAL | Role cards, routing to the right home and "Switch workspace" work. No access control by role (P1-02), and the header shows the wrong identity (P1-01). |
| F-03 | PARTIAL | Invitation code check, consent and activation work. The user lands in the portal as the wrong user (P1-01). |
| F-04 | PASS | Consent line, Privacy notice v2.1 panel (data, purpose, retention, rights), Privacy/Terms/Help links. `[YOUR COMPANY]` placeholders are allowed by the brief. |
| F-05 | PASS | 5 KPIs match §5. Period and category filters recompute correctly. OTIF and spend charts, Export, New PR. P1-06 is cosmetic. |
| F-06 | PASS | Bell shows 6 unread, type filter, unread/read filter, Mark read / Mark all read, action buttons. Data issue P1-05. |
| F-07 | PASS | Bids/invited, sealed, Open/Q&A. Filtered by category. |
| F-08 | PASS | Alerts above ±5% with the correct deltas, last vendor and source PO, "Open price history". |
| F-09 | PARTIAL | Search across Material ID, documents and vendors, "/" shortcut, sidebar groups, badge 6. No EN/VI switch (P1-09). Search is accent-sensitive (P1-08). |
| F-10 | PASS | KPI counters 1.284 / 1.236 / 9 / 37. Search, category, group, status and VAT filters, "Single source only" (5 items), Import/Export. |
| F-11 | PARTIAL | Format, ranges, next number and change log are shown. Drafts take a number (P1-04). |
| F-12 | PARTIAL | All fields, Save draft and Submit work, and validation works. Edits are lost after a re-render (P1-03). |
| F-13 | PASS | Required certificates with check points on the form and on Material 360°, link to the Certificate register. |
| F-14 | PASS | VAT 0/5/8/10/KCT, eligible for 8% Yes/No, metal excluded, "Confirmed by Finance" shown. |
| F-15 | PASS | Warning matches the spec ("Possible duplicate … CON-24015, 92% match"). A reason of at least 10 characters is required. |
| F-16 | PASS | 3-step route, SoD note, EQP-31520 "Step 2 of 3". |
| F-17 | PASS | Header, Price history / Start tender / Create PR, 10 "Linked by Material ID" tiles, Master data with Edit, Material ID picker. Unknown IDs handled. |
| F-18 | PASS | 4 vendors, "Not single source · 3 eligible", V-1008 blocked for an expired ISO 9001. Single-source warning on EQP-31007. |
| F-19 | PARTIAL | Purchase chain, saving box and 12-month chart are correct. Linked-document tabs and counts are incomplete (P1-10). |

**Totals:** 13 PASS · 6 PARTIAL · 0 FAIL.

Requirements:
- **R-03:** VAT per Material ID and the "excl. VAT" labels pass.
- **R-15:** the notification panel passes. The rules are shown read-only.
- **R-16:** single-source warning on Material 360° passes.
- **R-25:** the Login part passes.

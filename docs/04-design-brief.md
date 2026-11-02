# ProcureLink — shared design brief (for all agents)

## 1. What we are building
A static hi-fi mockup (one artboard per screen) of a procurement web app on a **Design canvas artifact**.
- Artifact URL (use on every publish): `https://claude.ai/artifact/GKdEjNcvRcNcbC941ePmEF`
- **ROOT folder (everyone uses this one):** `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/artifact-files/7c12cca8-22ac-4106-a459-d416738d51b0`
  - index: `<ROOT>/project/canvas.json`; artboards: `<ROOT>/project/<Name>.dc.html`
  - NEW file → Write it at `<ROOT>/project/<Name>.dc.html`.
  - EXISTING file (Main, Login, Material360, Vendors, VendorEvaluation, PriceHistory, or one another agent wrote) → FIRST fetch the live copy: Artifact `{action:"read", url, path:"project/<Name>.dc.html"}` (it saves to `<ROOT>/project/<Name>.dc.html`), then Read + Edit that saved file. The user may have edited it in the canvas, so never edit from memory.
  - (An older copy of the first six screens is at `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/canvas/project/` — read-only reference, do not publish from there.)
- Clients/roles: **Procurement**, **Supplier**, **Admin**. Sign-in with **Gmail**. **All data is linked by Material ID.**
- User choices: bilingual = **English UI labels, Vietnamese sample data**; all modules; light, compact enterprise look; static mockups (links between artboards are fine).
- Today = 02/11/2026. Numbers in vi-VN format (15.200.000 ₫, 9,7 tỷ ₫, 91,4%).

## 2. Publishing rules (Design canvas type)
- Publish with the Artifact tool: `{url, root: <ROOT>, file_path: <ABS path of one changed file under ROOT>, files: {"project/Other.dc.html": "project/Other.dc.html", ...}}`. Write ONE file, publish it, then the next. Send only files you changed. Never send index.html, SKILL.md or anything under artifact-type/.
- A hook blocks `edits` on publish: change files with Write/Edit, then publish.
- `project/canvas.json` is owned by the orchestrator. Do NOT edit it unless your task explicitly says so. If you need a NEW artboard, say so in your report (name, title, height) — or, only if your task allows, add a `boards` entry + `order` slot keeping every other key.
- If a publish is refused because the file changed, re-read that file from the artifact (Artifact read with `path`), redo your edit, publish again.
- Full format rules: `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/artifact-files/7c12cca8-22ac-4106-a459-d416738d51b0/artifact-type/reference/format.md` — READ IT before writing an artboard.

### Rules that fail silently (must follow)
- Keep `<script src="./support.js"></script>` in `<head>` exactly. Close every non-void element; quote every attribute.
- `{{hole}}` is a dotted lookup into `renderVals()` only — never an expression (`{{a+b}}`, `{{!x}}`, `{{fn()}}` fail).
- Repeats: `<sc-for list="{{items}}" as="it" hint-placeholder-count="N">`; branches: `<sc-if value="{{flag}}" hint-placeholder-val="{{ true }}">`.
- **Never put `<sc-for>` inside `<table>/<tbody>/<svg>`.** Tables are CSS-grid rows of `<div>`s inside `<div style="overflow-x: auto"><div style="min-width: Npx">…`.
- Varying styles in loops: interpolate into the inline style string, e.g. `style="…; background: {{r.sbg}}; color: {{r.sfg}}"`.
- Always include `<script type="text/x-dc" data-dc-script data-props='{"$preview":{"width":1440,"height":H}}'>` with `class Component extends DCLogic { renderVals() { … } }` (classic JS, no imports). H = that board's `h` in canvas.json.
- All UI is markup — never innerHTML/appendChild. No `<iframe>`, no emoji, no network except the Google Fonts link below.
- Every artboard is a PAGE: fluid root, `min-height: 100vh`, no fixed px root width; grids use `repeat(auto-fit, minmax(min(<n>px, 100%), 1fr))`; wide tables scroll inside their box.
- Real controls: `<button>`, `<a href>`, `<input>`/`<select>` with `<label>`; `aria-label` on icon-only buttons; decorative SVG `aria-hidden="true"`; charts `role="img" aria-label="…"`. Touch targets ≥ 36–44 px. Text contrast ≥ 4.5:1.

## 3. Visual system (copy exactly)
- Fonts (in `<helmet>`): `<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&amp;family=IBM+Plex+Mono:wght@400;500;600&amp;display=swap" rel="stylesheet">` — UI `'Be Vietnam Pro', system-ui, -apple-system, 'Segoe UI', sans-serif`; IDs/doc numbers `'IBM Plex Mono', ui-monospace, monospace`. Base 14px.
- Colors: page bg #F4F5F7 · surface #FFFFFF · border #E3E6EB · divider #EEF0F3 · input border #D9DDE3 · table header bg #F9FAFB · ink #111827 · ink-2 #374151 / #4B5563 · muted #5F6672 · primary #1E46A8 (hover #15357F) · primary-soft #EAF0FB.
- Status pills (always text + color): success #17663A on #E7F5EC · warning #8A4B00 on #FDF1DC · danger #A3211B on #FCE9E7 · info #1E46A8 on #EAF0FB · neutral #374151 on #EEF0F3.
- **Material ID chip** (use everywhere a Material ID appears, always a link): `<a href="Material360.dc.html" style="font-family: 'IBM Plex Mono', ui-monospace, monospace; font-size: 12px; font-weight: 500; color: #1E46A8; background: #EEF3FC; border: 1px solid #D5E0F5; border-radius: 6px; padding: 2px 6px; text-decoration: none; white-space: nowrap">CON-24015</a>`
- Card: `background:#FFFFFF; border:1px solid #E3E6EB; border-radius:10px; padding:20px`. KPI tile: label 13px muted · value 24–26px 700 tabular-nums · note 12px.
- Buttons: primary `height:40px; padding:0 16px; border:0; border-radius:8px; background:#1E46A8; color:#FFF; font-weight:600; font-size:13px`; secondary = white bg + 1px #D9DDE3 border + ink text.
- Charts: inline SVG with `viewBox`, `width:100%; height:auto`; polylines/points computed in `renderVals()` and bound as `points="{{x}}"`; gridlines #EEF0F3, baseline #D9DDE3, axis text 11px #5F6672. One series = #2a78d6. Categorical order: #2a78d6 blue, #eb6834 orange, #1baf7a aqua, #eda100 yellow. ≥2 series → legend + direct end labels in ink color. Bars = HTML divs (`width: {{b.pct}}%`), 4px radius. Dashed target line #5F6672. No dual axes.
- No gradients, no left-border accent cards, no lorem ipsum. Unknown real facts → visible placeholders like `[YOUR COMPANY]`.

## 4. Page shell
Copy the shell markup (outer flex root, `<aside>` sidebar, top `<header>`, `<main>`) from `project/PriceHistory.dc.html`; change the page content inside `<main>` and set `const active = '<key>'`. Set the sidebar `hint-placeholder-count` to 4 for g1, g2 and g3.
**Canonical Procurement nav JS (v2 — use exactly this, it replaces the ICON/g1–g4 code in PriceHistory):**
```js
    const ICON = {
      dashboard: 'M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z',
      approvals: 'M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9',
      materials: 'M3 3h8l10 10-8 8L3 11V3zM7.5 7.5h.01',
      material: 'M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9',
      vendors: 'M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 9h4a1 1 0 0 1 1 1v11M3 21h18M8 8h3M8 12h3M8 16h3',
      evaluation: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3z',
      contracts: 'M14 3H6v18h12V7l-4-4zM14 3v4h4M9 10h6M8 17c1.5-2 2.5-2 3 0s1.5 2 3 0',
      certs: 'M12 15a6 6 0 1 0 0-12a6 6 0 1 0 0 12zM8.5 14L7 21l5-3 5 3-1.5-7',
      tenders: 'M9 3h6v3H9zM7 4.5H5V21h14V4.5h-2M9 12h6M9 16h4',
      pr: 'M14 3H6v18h12V7l-4-4zM14 3v4h4M12 11v6M9 14h6',
      po: 'M6 3h12v18l-3-2-3 2-3-2-3 2V3zM9 8h6M9 12h6M9 16h3',
      invoices: 'M4 5h16v14H4zM4 9h16M8 14h3M14 14h2',
      price: 'M3 17l6-6 4 4 8-8M15 7h6v6',
      reports: 'M5 20V11M11 20V5M17 20v-6M3 20h18'
    };
    // const active = '<key>';  mk() exactly as in PriceHistory
      g1: mk([['dashboard', 'Dashboard', 'Main.dc.html'], ['approvals', 'My approvals', 'Approvals.dc.html'], ['materials', 'Material IDs', 'MaterialMaster.dc.html'], ['material', 'Material 360°', 'Material360.dc.html']]),
      g2: mk([['vendors', 'Vendors', 'Vendors.dc.html'], ['evaluation', 'Vendor evaluation', 'VendorEvaluation.dc.html'], ['contracts', 'Contracts', 'Contracts.dc.html'], ['certs', 'Certificates', 'Certificates.dc.html']]),
      g3: mk([['tenders', 'Tenders', 'Tenders.dc.html'], ['pr', 'Purchase requests', 'PurchaseRequest.dc.html'], ['po', 'Purchase orders', 'PurchaseOrders.dc.html'], ['invoices', 'Invoices & matching', 'Invoices.dc.html']]),
      g4: mk([['price', 'Price history', 'PriceHistory.dc.html'], ['reports', 'Reports', 'Reports.dc.html']]),
```
- Footer link: Admin console → Admin.dc.html.
- **Supplier portal** uses its own nav (workspace pill "Supplier", user Võ Thị Lan · Công ty TNHH Thép Minh Phát): Overview, Invitations to bid, My quotations, Purchase orders, Deliveries, Contracts, Certificates, Scorecard, Company profile.
- **Admin console** uses its own nav (workspace pill "Admin", user Phạm Thu Trang · System Admin): Users & roles, Access policy, Approval matrix, Material master (→ MaterialMaster.dc.html), Categories, Evaluation templates, Numbering & ID rules, Integrations, Audit log; plus "Back to Procurement" → Main.dc.html.

## 5. Data dictionary (keep every screen consistent)
Material IDs (format `CAT-NNNNN`; CON = Construction/Xây dựng, EQP = Equipment/Thiết bị, SRV = Services/Dịch vụ, LOG = Logistics):
- CON-24015 Thép cây D16 CB400-V · tấn · last 15.200.000 ₫ (PO-2026-0877) · 90-day avg 16.050.000 · 12-mo avg 16.170.000
- CON-24020 Thép cây D20 CB400-V · tấn
- CON-24102 Xi măng PCB40 · tấn · last 1.680.000 ₫ (PO-2026-0861, +6,4%)
- CON-24330 Bê tông thương phẩm M300 · m³
- EQP-31007 Máy phát điện 500kVA · bộ · EQP-31244 Bơm ly tâm 75kW · cái · 182.000.000 ₫ (+5,2%) · EQP-31310 Máy nén khí trục vít 37kW · EQP-31402 Tủ điện phân phối MSB · EQP-31455 Biến tần 55kW · EQP-31501 Quạt hút công nghiệp
- SRV-52003 Bảo trì hệ thống HVAC · tháng · SRV-52118 Dịch vụ vệ sinh công nghiệp · tháng
- LOG-61012 Vận chuyển container 40ft HCM–HN · chuyến · 18.500.000 ₫ (+8,9%) · LOG-61045 Thuê kho bãi · m²/tháng

Vendors: V-1001 Công ty TNHH Thép Minh Phát (Construction, score 4,32 A, OTIF 95,8%, sales.minhphat@gmail.com, contact Võ Thị Lan) · V-1002 CTCP VLXD An Khang (3,98, 91,2%) · V-1003 Công ty TNHH Thiết bị Công nghiệp Đại Phong (Equipment, 4,05, 89,5%, daiphong.equip@gmail.com, contact Phạm Văn Đức, MST 0312 456 789) · V-1004 CTCP Cơ điện Trường Sơn (Equip/Services 3,82) · V-1005 Công ty TNHH Dịch vụ Kỹ thuật Hưng Long (Services 4,10, 96,0%) · V-1006 CTCP Logistics Sao Việt (Logistics 3,65, 86,7%) · V-1007 Công ty TNHH Kho vận Phú Mỹ (Pending approval) · V-1008 CTCP Kim khí Bắc Sơn (Probation 3,40, 84,0%) · V-1009 Công ty TNHH Bê tông Tân Phước (3,90, 92,4%) · also Công ty TNHH Thép Tân Long (3,71).

Documents:
- PR-2026-0412 Nhà xưởng C2 · 80 tấn CON-24015 → TND-2026-024 (awarded Minh Phát 15.200.000) → PO-2026-0877 (21/10/2026, 80 tấn, 1.216.000.000 ₫ before VAT; GRN-2026-1532 50 tấn on 28/10 on time & in full; 30 tấn due 06/11). Baseline 16.450.000 (PO-2026-0791, An Khang, 12/09) → saving 100.000.000 ₫.
- PR-2026-0440 Dự án Kho B (20/10) → TND-2026-031 "Thép & xi măng – Dự án Kho B" (Construction, open, closes 05/11/2026, 5 invited, 4 bids; lines CON-24015 120 tấn, CON-24102 300 tấn, CON-24330 850 m³). Bidders: Minh Phát, An Khang, Tân Long, Bắc Sơn; Tân Phước invited, not yet submitted.
- PR-2026-0431 Máy phát điện 500kVA – Nhà máy Bình Dương · 1,85 tỷ ₫ · requested by Lê Quốc Huy · awaiting approval.
- PO-2026-0869 Đại Phong · sent 29/10, not confirmed (3 days overdue). PO-2026-0861 An Khang CON-24102.
- TND-2026-029 Bê tông M300 (evaluation due 04/11) · TND-2026-032 Bơm ly tâm 75kW ×6 (Equipment, Q&A, closes 12/11) · TND-2026-033 Bảo trì HVAC văn phòng 2027 (Services, closes 07/11) · TND-2026-034 Container 40ft HCM–HN Q1/2027 (Logistics, closes 10/11) · TND-2026-027 logistics (awarded).
- Contracts (new): CT-2026-008 Framework – Thép Minh Phát 2026 (CON-24015, CON-24020; 1.200 tấn commitment, 640 tấn released; 01/01–31/12/2026) · CT-2026-011 HVAC maintenance SLA – Hưng Long (SRV-52003) · CT-2025-019 Rate card Logistics Sao Việt (LOG-61012; expires 31/12/2026) · others as needed (prefix CT-YYYY-NNN).

KPIs: Spend YTD 186,4 tỷ ₫ (Construction 92,6 · Equipment 48,3 · Services 24,1 · Logistics 21,4) · Saving YTD 9,7 tỷ ₫ = 5,2% · OTIF 90-day 91,4% (target 95%) · monthly OTIF Nov-25→Oct-26: 88,2 89,5 87,9 90,4 91,0 89,8 92,1 91,6 92,8 90,9 92,4 91,0 · Open PRs 38 (12 awaiting approval) · Active tenders 7.

People: Nguyễn Minh Anh (Procurement Lead) · Lê Quốc Huy (Buyer – Equipment) · Trần Bảo Ngọc (Buyer – Services & Logistics) · Đỗ Hoàng Nam (Finance Director, approver) · Phạm Thu Trang (System Admin) · Võ Thị Lan (supplier user, Minh Phát) · Phạm Văn Đức (supplier user, Đại Phong).

Formulas: Saving = (Baseline price − Awarded price) × Qty; baseline = last PO price of the same Material ID (fallback: average of first-round bids). OTIF = deliveries that are on time (received ≤ promised date) AND in full (received qty ≥ scheduled qty) ÷ all deliveries.

## 6. Canvas boards (w = 1440 each, all `expand: fill`)
Done: Login, Main (Dashboard), Material360, Vendors, VendorEvaluation, PriceHistory.
Pending (already registered in canvas.json — just write the file): Tenders (h 1550), PurchaseRequest (h 1350), PurchaseOrders (h 1450), Reports (h 1750), SupplierPortal (h 1450), Admin (h 1450), MaterialMaster (h 1350), Contracts (h 1400), Certificates (h 1350), Invoices (h 1400, "16 · Invoices & 3-way match"), Approvals (h 1200, "17 · My approvals").
If your page ends up much taller than its `h`, say so in your report (orchestrator resizes); over-tall is fine, clipped is not.

Extra data for new screens: TND-2026-029 "Bê tông thương phẩm – Nhà xưởng C2" (Construction, closed 30/10, in evaluation, evaluation due 04/11; lines CON-24330 Bê tông M300 850 m³, CON-24325 Bê tông M250 120 m³, SRV-52210 Dịch vụ bơm bê tông 40 ca; bidders Công ty TNHH Bê tông Tân Phước, CTCP VLXD An Khang, CTCP Xây lắp Phước Thành, Công ty TNHH Bê tông Long Hậu) — use it for the open bid-comparison matrix. TND-2026-031 is still **sealed** until 05/11/2026 17:00 (show "4 of 5 bids received · sealed", no prices). New prefixes: INV-2026-NNNN (invoices), NCR-2026-NNN (non-conformance), CT-YYYY-NNN (contracts), PO revisions "Rev.1". VAT: steel (CON-24015, CON-24020) is 10%; any 8% elsewhere is labelled "8% (reduced, until 31/12/2026)".
Requirements from Agent 1: `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/team/requirements.md`.

## 7. Team report files
- Agent 1 → `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/team/requirements.md`
- Agent 2 → `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/team/implementation-<batch>.md`
- Agent 3 → `/tmp/claude-0/-home-claude/6c8ee611-dc9b-5b1a-8c8a-b9cabfd9fe69/scratchpad/team/qa-round<N>.md`

## 8. Update after QA round 1
- Procurement nav is now **v3** = v2 + the approvals count badge described in qa-round1.md Q-13 (apply exactly as written there).
- Data rulings in qa-round1.md §2 override anything above in this brief.

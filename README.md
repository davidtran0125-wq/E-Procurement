# E-Procurement

Static single-page web app (no build step) implementing the ProcureLink e-procurement spec in `docs/`.
Open `index.html` in a browser, or run `npx serve .` / `python3 -m http.server`.

- `js/data.js` — shared mock data (Vietnamese sample data, linked by Material ID)
- `js/app.js` — hash router, shell (sidebar/header), helpers
- `js/pages/*.js` — one module per screen, registered via `App.page(key, {title, role, render})`
- `css/styles.css` — design system (docs/04-design-brief.md §3)
- `docs/qa/` — QA reports per phase

## Run with Node.js

Requires Node.js 18+ (no dependencies to install).

```bash
npm start        # http://localhost:3000  (PORT=8080 npm start to change port)
npm test         # smoke test: serves the app and loads every script
```

## GitHub Pages (online demo)

`.github/workflows/ci.yml` runs `npm test` on every push and deploys `main` to GitHub Pages.
First time only: repo **Settings → Pages → Source: GitHub Actions**.
Demo URL: `https://<owner>.github.io/<repo>/` — sign in with any role on the login page (mock data, nothing is saved).

## Route map

| Workspace | Routes |
|---|---|
| Sign-in | `#/login` |
| Procurement | `#/dashboard`, `#/notifications`, `#/search?q=`, `#/approvals(/delegated\|history\|delegation)(?id=)`, `#/materials`, `#/material360?id=`, `#/vendors(/<V-id>)`, `#/evaluation`, `#/contracts(/<CT>)`, `#/certificates`, `#/tenders(/new\|/<TND>(/bids\|evaluation\|award\|qa\|files\|settings))`, `#/pr(/new\|/<PR>(/route\|files))`, `#/po(/new?pr=\|tender=\|contract=)`, `#/po/<PO>(/receipts\|match\|revisions\|print\|files)`, `#/invoices(/rules\|/<INV>(/match\|history))`, `#/price(/trend\|vendors\|rule)(?id=)`, `#/reports(/saving\|spend\|coverage\|cycle\|budget)` |
| Supplier portal (F-87..F-98) | `#/supplier`, `#/supplier/invitations(/<TND>)`, `#/supplier/quotations`, `#/supplier/pos(/<PO>(/print))`, `#/supplier/deliveries`, `#/supplier/invoices`, `#/supplier/contracts`, `#/supplier/certificates`, `#/supplier/scorecard`, `#/supplier/profile` |
| Admin console (F-99..F-108) | `#/admin/users`, `#/admin/access`, `#/admin/matrix`, `#/materials`, `#/admin/categories`, `#/admin/templates`, `#/admin/numbering`, `#/admin/tolerances`, `#/admin/integrations`, `#/admin/rules`, `#/admin/sod`, `#/admin/audit` |

Supplier and admin actions write to the shared `window.DATA`, so they show up on the procurement screens. Examples: bids, Q&A and addendum acks appear on the tender; PO confirmations draw contract releases; ASNs, date-change requests (→ My approvals) and NCR responses appear on the PO; e-invoices land in Invoices; certificate renewals go to Certificates review; bank changes go to My approvals; tolerances, delegation and the approval matrix drive Invoices and Approvals; and everything is written to the audit log.

## Docker

```bash
docker build -t procurelink .
docker run -p 3000:3000 procurelink     # http://localhost:3000
```

## Deploy on Railway

`railway.json` tells Railway to build the `Dockerfile`; the server reads Railway's `PORT`.

1. railway.com → **New Project → Deploy from GitHub repo** → pick `davidtran0125-wq/E-Procurement`.
2. Service → **Settings → Networking → Generate Domain** to get a public URL.
3. Every push to `main` redeploys automatically.

CLI alternative: `npm i -g @railway/cli && railway login && railway init && railway up`.

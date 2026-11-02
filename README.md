# E-Procurement (ProcureLink)

Static single-page web app (no build step) implementing the ProcureLink e-procurement spec in `docs/`.
Open `index.html` in a browser, or run `npx serve .` / `python3 -m http.server`.

- `js/data.js` — shared mock data (Vietnamese sample data, linked by Material ID)
- `js/app.js` — hash router, shell (sidebar/header), helpers
- `js/pages/*.js` — one module per screen, registered via `App.page(key, {title, role, render})`
- `css/styles.css` — design system (docs/04-design-brief.md §3)
- `docs/qa/` — QA reports per phase

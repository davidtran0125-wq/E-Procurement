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

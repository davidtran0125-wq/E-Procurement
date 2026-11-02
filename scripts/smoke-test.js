// Smoke test: start the server, fetch index.html and every script/stylesheet it references,
// then evaluate all scripts in a minimal sandbox to catch syntax/load errors. No dependencies.
const vm = require('vm');
const { createServer } = require('../server.js');

(async () => {
  const srv = createServer().listen(0);
  const base = `http://127.0.0.1:${srv.address().port}`;
  let failed = 0;
  const get = async (p) => { const r = await fetch(base + p); if (!r.ok) throw new Error(`${p} → HTTP ${r.status}`); return r.text(); };
  try {
    const html = await get('/');
    const assets = [...html.matchAll(/(?:src|href)="((?:js|css)\/[^"]+)"/g)].map((m) => '/' + m[1]);
    const noop = () => {};
    const el = () => ({ addEventListener: noop, appendChild: noop, classList: { add: noop, remove: noop, toggle: noop }, setAttribute: noop, querySelector: () => null, querySelectorAll: () => [] });
    const store = {};
    const ctx = {
      console, setTimeout, clearTimeout, URLSearchParams, Intl,
      localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = String(v); }, removeItem: (k) => { delete store[k]; } },
      location: { hash: '' }, history: { replaceState: noop },
      document: { readyState: 'loading', addEventListener: noop, getElementById: () => null, createElement: el, querySelector: () => null, querySelectorAll: () => [], body: el(), documentElement: el() },
      addEventListener: noop, scrollTo: noop, matchMedia: () => ({ matches: false, addEventListener: noop })
    };
    ctx.window = ctx; vm.createContext(ctx);
    for (const a of assets) {
      try {
        const src = await get(a);
        if (a.endsWith('.js')) vm.runInContext(src, ctx, { filename: a });
        console.log('ok  ', a);
      } catch (e) { failed++; console.error('FAIL', a, '-', e.message); }
    }
    const pages = Object.keys((ctx.App && ctx.App.pages) || {});
    console.log(`\n${assets.length} assets, ${pages.length} pages registered: ${pages.join(', ')}`);
    if (!pages.includes('login')) { failed++; console.error('FAIL login page not registered'); }
  } catch (e) { failed++; console.error('FAIL', e.message); }
  srv.close();
  process.exit(failed ? 1 : 0);
})();

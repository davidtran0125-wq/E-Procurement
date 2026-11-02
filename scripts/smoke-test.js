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
    // i18n: every literal App.t / t('key') used in js/ must exist in both dictionaries (vi + en)
    const fs = require('fs'); const path = require('path');
    const I = ctx.I18N; const files = [];
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((f) => { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (f.name.endsWith('.js')) files.push(p); });
    walk(path.join(__dirname, '..', 'js'));
    const missing = [];
    let used = 0;
    for (const f of files) {
      const src = fs.readFileSync(f, 'utf8');
      for (const m of src.matchAll(/(?:\bApp\.t|(?<![\w.$])t)\(\s*'((?:[^'\\]|\\.)+)'\s*[,)]/g)) {
        used++;
        const k = m[1].replace(/\\'/g, "'");
        ['vi', 'en'].forEach((l) => { if (!I || I.dict[l][k] == null) missing.push(`${path.relative(process.cwd(), f)}: ${l} '${k}'`); });
      }
    }
    if (!I) { failed++; console.error('FAIL I18N not loaded'); }
    else if (missing.length) { failed++; console.error(`FAIL i18n: ${missing.length} missing key(s)\n  ` + [...new Set(missing)].join('\n  ')); }
    else console.log(`i18n: ${used} literal keys used, all present in vi and en (${Object.keys(I.dict.vi).length} keys)`);
  } catch (e) { failed++; console.error('FAIL', e.message); }
  srv.close();
  process.exit(failed ? 1 : 0);
})();

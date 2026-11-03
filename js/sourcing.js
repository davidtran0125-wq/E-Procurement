/* Shared helpers for phase-3 sourcing pages (tenders, purchase requests, approvals). */
(function () {
  const { esc, num, mid, pill, table } = App;
  const T = (k, p) => App.t(k, p);
  const D = () => window.DATA;
  const me = () => (App.state.user && App.state.user.name) || (App.state.role === 'admin' ? 'Phạm Thu Trang' : App.state.role === 'supplier' ? 'Võ Thị Lan' : 'Nguyễn Minh Anh');
  I18N.add({
    'src.vat8': ['8% (reduced, until 31/12/2026)', '8% (giảm, đến 31/12/2026)'], 'src.vat8s': ['reduced to 31/12/2026', 'giảm đến 31/12/2026'],
    'src.f.type': ['Type', 'Loại'], 'src.f.file': ['File', 'Tệp'], 'src.f.ver': ['Version', 'Phiên bản'], 'src.f.by': ['Uploaded by', 'Người tải lên'], 'src.f.mats': ['Material IDs', 'Mã vật tư'],
    'src.f.supplier': ['Uploaded by supplier', 'NCC tải lên'], 'src.f.empty': ['No attachments yet', 'Chưa có tệp đính kèm'], 'src.f.title': ['Attachments ({n})', 'Tệp đính kèm ({n})'], 'src.f.label': ['Attachments', 'Tệp đính kèm'],
    'src.f.name': ['File name', 'Tên tệp'], 'src.f.ph': ['e.g. spec_rev2.pdf', 'vd. spec_rev2.pdf'], 'src.f.hint': ['PDF, XLSX, DOCX or DWG', 'PDF, XLSX, DOCX hoặc DWG'],
    'src.e.name': ['Enter the file name.', 'Nhập tên tệp.'], 'src.e.ext': ['Only PDF, XLSX, DOCX or DWG files.', 'Chỉ nhận tệp PDF, XLSX, DOCX hoặc DWG.'],
    'src.e.dup': ['A file with this name is already attached. Upload it as a new version with a new name.', 'Đã có tệp trùng tên. Hãy tải lên phiên bản mới với tên mới.'],
    'src.uploaded': ['{n} uploaded as {t} {v}', 'Đã tải lên {n} · {t} {v}']
  });
  I18N.values({ BOQ: 'BOQ (bảng khối lượng)', Addendum: 'Phụ lục hồ sơ mời thầu', Other: 'Khác', 'Bid opening minutes': 'Biên bản mở thầu', 'CO/CQ': 'CO/CQ', Catalogue: 'Catalogue', Photos: 'Ảnh chụp' });
  const vatLabel = (v) => (+v === 8 ? App.t('src.vat8') : v + '%');
  // Table cell: rate on line 1, the reduced-rate condition as a small second line (keeps VAT columns narrow)
  const vatCell = (v) => (+v === 8 ? `8%<div class="small muted">${App.esc(App.t('src.vat8s'))}</div>` : App.esc(v + '%'));
  // Errors may be stored as i18n keys ('pr.e.x') or [key, params]; plain text passes through
  const errText = (x) => (!x ? '' : Array.isArray(x) ? App.t(x[0], x[1]) : /^[a-z0-9]+(\.[\w-]+)+$/.test(x) ? App.t(x) : x);
  const validDate = (s) => { if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s || '')) return false; const [d, m, y] = s.split('/').map(Number); const x = new Date(y, m - 1, d); return x.getDate() === d && x.getMonth() === m - 1; };
  const money = (s) => Number(String(s).replace(/[.\s₫]/g, '').replace(',', '.'));
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { if (el.type === 'checkbox') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.value.trim(); }); return o; };
  function field(pre, errs, n, label, val, o = {}) {
    const err = errs[n]; const id = `${pre}-${n}`;
    const desc = [o.hint ? `${id}-h` : '', err ? `${id}-e` : ''].filter(Boolean).join(' ');
    const attrs = `id="${id}" name="${n}"${err ? ' aria-invalid="true"' : ''}${desc ? ` aria-describedby="${desc}"` : ''}${o.dis ? ' disabled' : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, App.tv(x)]; return `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : o.area ? `<textarea ${attrs}>${esc(val)}</textarea>`
        : `<input ${attrs} value="${esc(val)}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.mode ? ` inputmode="${o.mode}"` : ''}>`;
    return `<div class="field"><label for="${id}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint" id="${id}-h">${esc(o.hint)}</span>` : ''}${err ? `<span class="err" id="${id}-e" role="alert">${esc(errText(err))}</span>` : ''}</div>`;
  }
  const focusErr = (sel) => { const x = document.querySelector(`${sel} [aria-invalid=true]`) || document.querySelector(`${sel} .alert-danger`); if (x) { if (!x.matches('input,select,textarea,button')) x.setAttribute('tabindex', '-1'); x.focus(); x.scrollIntoView({ block: 'center' }); } };
  const docOf = (id) => D().docs.find((d) => d.id === id);
  const prLink = (id) => (id && docOf(id) ? `<a class="mono" href="#/pr/${esc(id)}">${esc(id)}</a>` : id ? `<span class="mono">${esc(id)}</span>` : '—');
  const tndLink = (id) => `<a class="mono" href="#/tenders/${esc(id)}">${esc(id)}</a>`;
  const nextVer = (files, type) => 'v' + (Math.max(0, ...files.filter((y) => y.type === type).map((y) => +String(y.ver).slice(1) || 0)) + 1);

  /* Typed, versioned attachments (R-19). state = { open, errs } kept by the caller; key identifies the forms. */
  const TYPES = ['Specification / drawing', 'BOQ', 'Quotation', 'Addendum', 'Other'];
  function files(key, list, mats, up, types = TYPES, opts = {}) {
    const body = table([
      { h: T('src.f.type'), r: (f) => esc(App.tv(f.type)), w: 'minmax(140px,1.2fr)' },
      { h: T('src.f.file'), r: (f) => `<span class="mono small">${esc(f.name)}</span>${f.supplier ? ' ' + pill(T('src.f.supplier'), 'info') : ''}`, w: 'minmax(200px,2fr)' },
      { h: T('src.f.ver'), k: 'ver', w: '80px' }, { h: T('src.f.by'), r: (f) => `${esc(App.tv(f.by))}<div class="small muted">${esc(f.date)}</div>`, w: 'minmax(140px,1.2fr)' },
      { h: T('src.f.mats'), r: (f) => (f.mats && f.mats.length ? `<span class="chips chips-inline">${f.mats.map(mid).join('')}</span>` : '—'), w: 'minmax(160px,1.6fr)' }
    ], list.slice().reverse(), { empty: T('src.f.empty'), label: T('src.f.label') });
    const e = (up && up.errs) || {};
    const form = up ? `<form id="${key}-up" class="stack mt" novalidate><div class="form-grid">${field(key + '-up', e, 'type', T('src.f.type'), up.type || types[0], { options: types })}${field(key + '-up', e, 'name', T('src.f.name'), up.name || '', { req: true, ph: T('src.f.ph'), hint: T('src.f.hint') })}</div>
      ${mats.length ? `<fieldset class="fs"><legend>${esc(T('src.f.mats'))}</legend>${mats.map((m) => `<label class="chk"><input type="checkbox" name="mats" value="${esc(m)}"${(up.mats || []).includes(m) ? ' checked' : ''}> ${esc(m)}</label>`).join('')}</fieldset>` : ''}
      <div class="row-acts"><button type="button" class="btn btn-sm" data-files="cancel" data-key="${key}">${esc(T('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(T('c.upload'))}</button></div></form>` : '';
    const acts = up ? '' : `<button class="btn btn-sm" data-files="open" data-key="${key}">${esc(T('c.upload'))}</button>`;
    return App.block(T('src.f.title', { n: list.length }), body + form, { actions: acts, span: opts.span });
  }
  function upload(root, key, list) {
    const x = read(root, `#${key}-up`); const errs = {};
    if (!x.name) errs.name = 'src.e.name'; else if (!/\.(pdf|xlsx|docx|dwg)$/i.test(x.name)) errs.name = 'src.e.ext';
    else if (list.some((f) => f.name.toLowerCase() === x.name.toLowerCase())) errs.name = 'src.e.dup';
    if (Object.keys(errs).length) return { errs, type: x.type, name: x.name, mats: x.mats || [] };
    const ver = nextVer(list, x.type);
    list.push({ type: x.type, name: x.name, ver, by: me(), date: D().today, mats: x.mats || [] });
    App.toast(T('src.uploaded', { n: x.name, t: App.tv(x.type), v: ver }));
    return null;
  }

  /* Approval queue helpers shared with the shell badge */
  const assignee = (a) => a.assignee || 'Nguyễn Minh Anh';
  const dlgActive = () => { const g = D().delegation; return !!(g && App.daysTo(g.from) <= 0 && App.daysTo(g.until) >= 0); };
  /* Items the delegate may act on: delegator's items of the chosen types up to the cap (R-06) */
  const delegable = (a) => { const g = D().delegation; return dlgActive() && assignee(a) === 'Nguyễn Minh Anh' && g.types.includes(a.type) && (a.value == null || a.value <= g.cap); };
  const myQueue = () => (App.state.role === 'admin' ? D().approvals : D().approvals.filter((a) => assignee(a) === me() || (D().delegation && D().delegation.to === me() && delegable(a))));

  /* P4-09 · one off-contract rule for Contracts and Reports: a Material ID bought outside an active contract that covers it
     (spot PO or another vendor), or after its contract expired. Tender-awarded POs are competitive and are not counted. */
  function offContract() {
    return D().docs.filter((d) => d.type === 'PO' && !/Draft|Pending|Cancelled/.test(d.status)).flatMap((d) => d.mats.map((m) => {
      const p = D().pos[d.id]; if (p && p.tender) return null;
      const cov = D().contracts.filter((x) => x.lines.some((l) => l.mat === m));
      const act = cov.find((x) => App.dt(x.start) <= App.dt(d.date) && App.dt(x.end) >= App.dt(d.date));
      if (act) return p && p.contract === act.id ? null : (act.vendor !== d.vendor || !p || !p.contract) ? { d, m, c: act, why: act.vendor !== d.vendor ? 'Other vendor' : 'Spot PO, not released from the contract' } : null;
      const exp = cov.filter((x) => App.dt(x.end) < App.dt(d.date)).sort((a, b) => App.dt(b.end) - App.dt(a.end))[0];
      return exp ? { d, m, c: exp, why: `${exp.id} expired ${exp.end}` } : null;
    })).filter(Boolean);
  }
  /* Audit log writer (F-108): every admin setting change, supplier bid action and override lands here */
  /* P5-09 · one demo clock (02/11/2026 from 10:31, one minute per event) for audit, notifications and supplier actions */
  let tick = 30;
  App.now = () => { tick += 1; const h = 10 + Math.floor(tick / 60), m = tick % 60; return `${D().today} ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`; };
  // action = English text, or [i18nKey, params] (stored as k/p and rendered in the viewer's language; `action` keeps the English copy for search)
  const audit = (type, action, ref) => { const kp = Array.isArray(action) ? { k: action[0], p: action[1] || {}, action: I18N.t('en', action[0], action[1]) } : { action }; (D().audit = D().audit || []).unshift(Object.assign({ at: App.now(), user: me() + (App.state.user && App.state.user.vendor ? ` (${App.state.user.vendor})` : ''), type, ref: ref || '' }, kp)); if (D().auditStats) D().auditStats.total++; };
  App.src = { errText, me, offContract, audit, vatLabel, vatCell, validDate, money, read, field, focusErr, docOf, prLink, tndLink, files, upload, nextVer, assignee, myQueue, dlgActive, delegable,
    bar: (p, tone) => `<div class="bar" role="img" aria-label="${esc(num(p, 0))}%"><span class="${tone || ''}" style="width:${Math.max(0, Math.min(100, p)).toFixed(1)}%"></span></div>` };
})();

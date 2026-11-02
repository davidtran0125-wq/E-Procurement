/* Shared helpers for phase-3 sourcing pages (tenders, purchase requests, approvals). */
(function () {
  const { esc, num, mid, pill, table, card } = App;
  const D = () => window.DATA;
  const me = () => (App.state.user && App.state.user.name) || (App.state.role === 'admin' ? 'Phạm Thu Trang' : App.state.role === 'supplier' ? 'Võ Thị Lan' : 'Nguyễn Minh Anh');
  const vatLabel = (v) => (+v === 8 ? '8% (reduced, until 31/12/2026)' : v + '%');
  const validDate = (s) => { if (!/^\d{2}\/\d{2}\/\d{4}$/.test(s || '')) return false; const [d, m, y] = s.split('/').map(Number); const x = new Date(y, m - 1, d); return x.getDate() === d && x.getMonth() === m - 1; };
  const money = (s) => Number(String(s).replace(/[.\s₫]/g, '').replace(',', '.'));
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { if (el.type === 'checkbox') { (o[el.name] = o[el.name] || []); if (el.checked) o[el.name].push(el.value); } else o[el.name] = el.value.trim(); }); return o; };
  function field(pre, errs, n, label, val, o = {}) {
    const err = errs[n]; const id = `${pre}-${n}`;
    const desc = [o.hint ? `${id}-h` : '', err ? `${id}-e` : ''].filter(Boolean).join(' ');
    const attrs = `id="${id}" name="${n}"${err ? ' aria-invalid="true"' : ''}${desc ? ` aria-describedby="${desc}"` : ''}${o.dis ? ' disabled' : ''}`;
    const input = o.options ? `<select ${attrs}>${o.options.map((x) => { const [v, l] = Array.isArray(x) ? x : [x, x]; return `<option value="${esc(v)}"${String(val) === String(v) ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`
      : o.area ? `<textarea ${attrs}>${esc(val)}</textarea>`
        : `<input ${attrs} value="${esc(val)}"${o.ph ? ` placeholder="${esc(o.ph)}"` : ''}${o.mode ? ` inputmode="${o.mode}"` : ''}>`;
    return `<div class="field"><label for="${id}">${esc(label)}${o.req ? ' *' : ''}</label>${input}${o.hint ? `<span class="hint" id="${id}-h">${esc(o.hint)}</span>` : ''}${err ? `<span class="err" id="${id}-e" role="alert">${esc(err)}</span>` : ''}</div>`;
  }
  const focusErr = (sel) => { const x = document.querySelector(`${sel} [aria-invalid=true]`) || document.querySelector(`${sel} .alert-danger`); if (x) { if (!x.matches('input,select,textarea,button')) x.setAttribute('tabindex', '-1'); x.focus(); x.scrollIntoView({ block: 'center' }); } };
  const docOf = (id) => D().docs.find((d) => d.id === id);
  const prLink = (id) => (id && docOf(id) ? `<a class="mono" href="#/pr/${esc(id)}">${esc(id)}</a>` : id ? `<span class="mono">${esc(id)}</span>` : '—');
  const tndLink = (id) => `<a class="mono" href="#/tenders/${esc(id)}">${esc(id)}</a>`;
  const nextVer = (files, type) => 'v' + (Math.max(0, ...files.filter((y) => y.type === type).map((y) => +String(y.ver).slice(1) || 0)) + 1);

  /* Typed, versioned attachments (R-19). state = { open, errs } kept by the caller; key identifies the forms. */
  const TYPES = ['Specification / drawing', 'BOQ', 'Quotation', 'Addendum', 'Other'];
  function files(key, list, mats, up, types = TYPES) {
    const body = table([
      { h: 'Type', r: (f) => esc(f.type), w: 'minmax(140px,1.2fr)' },
      { h: 'File', r: (f) => `<span class="mono small">${esc(f.name)}</span>${f.supplier ? ' ' + pill('Uploaded by supplier', 'info') : ''}`, w: 'minmax(200px,2fr)' },
      { h: 'Version', k: 'ver', w: '80px' }, { h: 'Uploaded by', r: (f) => `${esc(f.by)}<div class="small muted">${esc(f.date)}</div>`, w: 'minmax(140px,1.2fr)' },
      { h: 'Material IDs', r: (f) => (f.mats && f.mats.length ? `<span class="chips chips-inline">${f.mats.map(mid).join('')}</span>` : '—'), w: 'minmax(160px,1.6fr)' }
    ], list.slice().reverse(), { min: 820, empty: 'No attachments yet', label: 'Attachments' });
    const e = (up && up.errs) || {};
    const form = up ? `<form id="${key}-up" class="stack mt" novalidate><div class="form-grid">${field(key + '-up', e, 'type', 'Type', up.type || types[0], { options: types })}${field(key + '-up', e, 'name', 'File name', up.name || '', { req: true, ph: 'e.g. spec_rev2.pdf', hint: 'PDF, XLSX, DOCX or DWG' })}</div>
      ${mats.length ? `<fieldset class="fs"><legend>Material IDs</legend>${mats.map((m) => `<label class="chk"><input type="checkbox" name="mats" value="${esc(m)}"${(up.mats || []).includes(m) ? ' checked' : ''}> ${esc(m)}</label>`).join('')}</fieldset>` : ''}
      <div class="row-acts"><button type="button" class="btn btn-sm" data-files="cancel" data-key="${key}">Cancel</button><button type="submit" class="btn btn-sm btn-p">Upload</button></div></form>` : '';
    return card(`Attachments (${list.length})`, body + form, up ? '' : `<button class="btn btn-sm" data-files="open" data-key="${key}">Upload</button>`);
  }
  function upload(root, key, list) {
    const x = read(root, `#${key}-up`); const errs = {};
    if (!x.name) errs.name = 'Enter the file name.'; else if (!/\.(pdf|xlsx|docx|dwg)$/i.test(x.name)) errs.name = 'Only PDF, XLSX, DOCX or DWG files.';
    else if (list.some((f) => f.name.toLowerCase() === x.name.toLowerCase())) errs.name = 'A file with this name is already attached. Upload it as a new version with a new name.';
    if (Object.keys(errs).length) return { errs, type: x.type, name: x.name, mats: x.mats || [] };
    const ver = nextVer(list, x.type);
    list.push({ type: x.type, name: x.name, ver, by: me(), date: D().today, mats: x.mats || [] });
    App.toast(`${x.name} uploaded as ${x.type} ${ver}`);
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
  const audit = (type, action, ref) => { (D().audit = D().audit || []).unshift({ at: App.now(), user: me() + (App.state.user && App.state.user.vendor ? ` (${App.state.user.vendor})` : ''), type, action, ref: ref || '' }); if (D().auditStats) D().auditStats.total++; };
  App.src = { me, offContract, audit, vatLabel, validDate, money, read, field, focusErr, docOf, prLink, tndLink, files, upload, nextVer, assignee, myQueue, dlgActive, delegable,
    bar: (p, tone) => `<div class="bar" role="img" aria-label="${esc(num(p, 0))}%"><span class="${tone || ''}" style="width:${Math.max(0, Math.min(100, p)).toFixed(1)}%"></span></div>` };
})();

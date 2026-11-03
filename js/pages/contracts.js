/* Module 6 · Contracts — F-30 list & KPIs (off-contract detection), F-31 detail & actions, F-32 prices per Material ID & index adjustment,
   F-33 commitment vs released & released POs, F-34 terms & performance security 2–10% with 30-day alert (R-09),
   F-35 e-signature status & typed, versioned documents (R-19).
   Routes: #/contracts (list) · /new · /offcontract · #/contracts/<id> (overview) · sub-functions /prices, /terms, /files */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'ct.title': ['Contracts', 'Hợp đồng'], 'ct.subtitle': ['Framework, fixed-price, SLA and rate-card contracts · prices and commitments per Material ID', 'Hợp đồng khung, giá cố định, SLA và bảng đơn giá · giá và cam kết theo mã vật tư'],
    'ct.new': ['New contract', 'Tạo hợp đồng'], 'ct.sub.list': ['List', 'Danh sách'], 'ct.sub.new': ['New contract', 'Tạo hợp đồng'], 'ct.sub.off': ['Off-contract buying', 'Mua ngoài hợp đồng'],
    'ct.k.active': ['Active contracts', 'Hợp đồng hiệu lực'], 'ct.k.allVendors': ['All vendors', 'Tất cả NCC'], 'ct.k.value': ['Contract value', 'Giá trị hợp đồng'], 'ct.k.ceilings': ['Ceilings, excl. VAT', 'Giá trị trần, chưa VAT'],
    'ct.k.expiring': ['Expiring ≤ 60 days', 'Hết hạn ≤ 60 ngày'], 'ct.k.avg': ['Average consumption', 'Mức sử dụng bình quân'], 'ct.k.avgN': ['{p} in this sample · released ÷ committed', '{p} trong dữ liệu mẫu · đã phát hành ÷ cam kết'],
    'ct.vat8': ['8% (reduced, until 31/12/2026)', '8% (giảm, đến 31/12/2026)'],
    'ct.form': ['New contract', 'Tạo hợp đồng'], 'ct.formNote': ['Number {id} is assigned on save. Signing happens in the external e-signature tool; ProcureLink stores the status and the signed file.', 'Số {id} được cấp khi lưu. Việc ký thực hiện trên công cụ ký điện tử bên ngoài; ProcureLink lưu trạng thái và tệp đã ký.'],
    'ct.f.type': ['Contract type', 'Loại hợp đồng'], 'ct.f.start': ['Start date', 'Ngày bắt đầu'], 'ct.f.end': ['End date', 'Ngày kết thúc'], 'ct.f.ceiling': ['Ceiling value (₫, excl. VAT)', 'Giá trị trần (₫, chưa VAT)'],
    'ct.f.mat': ['Material ID (line 1)', 'Mã vật tư (dòng 1)'], 'ct.f.commit': ['Committed qty', 'SL cam kết'], 'ct.f.price': ['Contract unit price (₫)', 'Đơn giá hợp đồng (₫)'], 'ct.save': ['Save contract', 'Lưu hợp đồng'],
    'ct.e.endAfter': ['End date must be after the start date.', 'Ngày kết thúc phải sau ngày bắt đầu.'], 'ct.e.value': ['Enter a value above 0.', 'Nhập giá trị lớn hơn 0.'], 'ct.e.qty': ['Enter a quantity above 0.', 'Nhập số lượng lớn hơn 0.'],
    'ct.e.price': ['Enter a unit price above 0.', 'Nhập đơn giá lớn hơn 0.'], 'ct.e.ceiling': ['Ceiling is below committed qty × unit price.', 'Giá trị trần thấp hơn SL cam kết × đơn giá.'], 'ct.e.vatMatch': ['VAT must match {id} ({v}%)', 'VAT phải khớp {id} ({v}%)'],
    'ct.e.vat8': ['8% applies only until 31/12/2026', '8% chỉ áp dụng đến 31/12/2026'], 'ct.e.link': ['{v} is not an approved vendor for {m}. Approve the vendor – Material ID link first.', '{v} chưa được duyệt cho {m}. Hãy duyệt liên kết NCC – mã vật tư trước.'],
    'ct.savedDraft': ['{id} saved as draft', 'Đã lưu {id} dạng nháp'],
    'ct.searchLbl': ['Search contracts', 'Tìm hợp đồng'], 'ct.searchPh': ['Search contract no., vendor or Material ID', 'Tìm số hợp đồng, NCC hoặc mã vật tư'], 'ct.c.contract': ['Contract', 'Hợp đồng'], 'ct.c.period': ['Period', 'Thời hạn'],
    'ct.expiredAgo': ['Expired {n} days ago', 'Đã hết hạn {n} ngày'], 'ct.left': ['{n} days left', 'Còn {n} ngày'], 'ct.c.ceiling': ['Ceiling', 'Giá trị trần'], 'ct.c.used': ['Used', 'Đã dùng'], 'ct.usedLbl': ['{p} used', 'Đã dùng {p}'],
    'ct.empty': ['No contracts match these filters', 'Không có hợp đồng phù hợp bộ lọc'], 'ct.showing': ['Showing {n} of {total} contracts (sample loaded) · values excl. VAT', 'Hiển thị {n} / {total} hợp đồng (dữ liệu mẫu) · giá trị chưa VAT'],
    'ct.off': ['Off-contract purchase', 'Mua ngoài hợp đồng'], 'ct.offMain': ['{po} buys {m} at {p} (+6,4% vs {b}) after {ct} expired 30/09/2026. Renew the contract or', '{po} mua {m} với giá {p} (+6,4% so với {b}) sau khi {ct} hết hạn 30/09/2026. Hãy gia hạn hợp đồng hoặc'],
    'ct.offTender': ['tender the volume', 'mời thầu khối lượng này'], 'ct.offAlso': ['Also off-contract (same rule as Reports):', 'Cũng mua ngoài hợp đồng (cùng quy tắc với Báo cáo):'], 'ct.offRule': ['A PO is off-contract when its Material ID has no active contract with that vendor on the PO date.', 'PO được coi là ngoài hợp đồng khi mã vật tư không có hợp đồng hiệu lực với NCC đó vào ngày PO.'],
    'ct.sub.overview': ['Overview', 'Tổng quan'], 'ct.sub.prices': ['Prices & releases', 'Giá & PO phát hành'], 'ct.sub.terms': ['Terms & security', 'Điều khoản & bảo đảm'], 'ct.sub.files': ['Documents', 'Tài liệu'],
    'ct.amend': ['Amend (Phụ lục)', 'Lập Phụ lục'], 'ct.amendMsg': ['Amendment (Phụ lục) draft created for {id} · index adjustment capped at ±5% per period', 'Đã tạo dự thảo Phụ lục cho {id} · điều chỉnh chỉ số tối đa ±5% mỗi kỳ'], 'ct.renew': ['Renew', 'Gia hạn'],
    'ct.renewMsg': ['Renewal draft created from {id} · lines and prices copied', 'Đã tạo dự thảo gia hạn từ {id} · đã sao chép dòng và giá'], 'ct.release': ['Release PO from contract', 'Phát hành PO từ hợp đồng'], 'ct.releaseTip': ['Only an active contract can release POs', 'Chỉ hợp đồng hiệu lực mới phát hành PO'],
    'ct.a.expired': ['Expired {d} — no new releases. POs for {m} are now off-contract.', 'Hết hạn {d} — không phát hành thêm. PO cho {m} hiện là ngoài hợp đồng.'],
    'ct.a.expiring': ['Expires {d} ({n} days). Renewal reminder sent to {o} at 60 days; another at 30 days; escalates to the Procurement Lead at 7 days.', 'Hết hạn {d} (còn {n} ngày). Đã nhắc gia hạn {o} ở mốc 60 ngày; nhắc lại ở 30 ngày; chuyển Trưởng phòng Mua sắm ở 7 ngày.'],
    'ct.a.forecast': ['Forecast {f} {u} by {d} is below the minimum {min} {u} ({p}% of {c}). Plan releases or renegotiate.', 'Dự báo {f} {u} đến {d} thấp hơn mức tối thiểu {min} {u} ({p}% của {c}). Lên kế hoạch phát hành hoặc đàm phán lại.'],
    'ct.a.sec': ['Performance security {ref} expires {d} ({n} days).', 'Bảo đảm thực hiện HĐ {ref} hết hạn {d} (còn {n} ngày).'], 'ct.a.secAsk': ['Ask the vendor for an extension.', 'Đề nghị NCC gia hạn.'],
    'ct.k.ceiling': ['Ceiling', 'Giá trị trần'], 'ct.k.vat': ['VAT {v} excl.', 'Chưa gồm VAT {v}'], 'ct.k.released': ['Released', 'Đã phát hành'], 'ct.k.of': ['of {c} · {p}', 'trên {c} · {p}'], 'ct.k.relValue': ['Released value', 'Giá trị đã phát hành'],
    'ct.k.pos': ['{n} POs', '{n} PO'], 'ct.k.days': ['Days to expiry', 'Số ngày đến hạn'], 'ct.k.expired': ['Expired', 'Đã hết hạn'],
    'ct.summary': ['Summary', 'Tóm tắt'], 'ct.esign': ['E-signature', 'Chữ ký điện tử'], 'ct.consumption': ['Commitment vs released', 'Cam kết và đã phát hành'], 'ct.releasedOf': ['{a} / {b} {u} released ({p})', 'Đã phát hành {a} / {b} {u} ({p})'],
    'ct.minimum': [' · minimum {q} {u} = {p}%', ' · tối thiểu {q} {u} = {p}%'], 'ct.relNote': ['Released value {v} across {n} POs{h} · consumption is counted per Material ID.', 'Giá trị đã phát hành {v} qua {n} PO{h} · mức sử dụng tính theo mã vật tư.'],
    'ct.prices': ['Prices by Material ID', 'Giá theo mã vật tư'], 'ct.q4': ['Q4/2026 (current)', 'Q4/2026 (hiện hành)'], 'ct.change': ['Change', 'Thay đổi'], 'ct.releases': ['Released POs ({n})', 'PO đã phát hành ({n})'],
    'ct.qty': ['Qty', 'SL'], 'ct.unitPrice': ['Unit price', 'Đơn giá'], 'ct.noReleases': ['No POs released yet', 'Chưa phát hành PO nào'], 'ct.terms': ['Terms', 'Điều khoản'], 'ct.security': ['Performance security (bảo đảm thực hiện hợp đồng)', 'Bảo đảm thực hiện hợp đồng'],
    'ct.amount': ['Amount', 'Số tiền'], 'ct.ofCeiling': ['of ceiling', 'giá trị trần'], 'ct.outside': ['Outside 2–10%', 'Ngoài 2–10%'], 'ct.within': ['Within 2–10%', 'Trong 2–10%'], 'ct.bankRef': ['Bank / ref.', 'Ngân hàng / số'],
    'ct.validTo': ['Valid to', 'Hiệu lực đến'], 'ct.daysLeft': ['{n} days left', 'Còn {n} ngày'], 'ct.alertOn': ['alert on {d} (30 days before)', 'cảnh báo ngày {d} (trước 30 ngày)'], 'ct.amountF': ['Amount (₫)', 'Số tiền (₫)'],
    'ct.amountHint': ['2–10% of {c} = {a} – {b}', '2–10% của {c} = {a} – {b}'], 'ct.bankF': ['Issuing bank', 'Ngân hàng phát hành'], 'ct.validHint': ['Must cover the contract end date', 'Phải bao phủ ngày kết thúc hợp đồng'],
    'ct.saveSec': ['Save security', 'Lưu bảo đảm'], 'ct.editSec': ['Edit security', 'Sửa bảo đảm'], 'ct.docs': ['Documents ({n})', 'Tài liệu ({n})'], 'ct.label': ['Label', 'Nhãn'], 'ct.noDocs': ['No documents yet', 'Chưa có tài liệu'],
    'ct.docType': ['Document type', 'Loại tài liệu'], 'ct.fileName': ['File name', 'Tên tệp'], 'ct.fileHint': ['PDF, DOCX or XLSX · same type gets the next version', 'PDF, DOCX hoặc XLSX · cùng loại sẽ tăng phiên bản'], 'ct.matTag': ['Material ID tag', 'Gắn mã vật tư'],
    'ct.notFound': ['Contract {id} was not found.', 'Không tìm thấy hợp đồng {id}.'], 'ct.back': ['Back to contracts', 'Về danh sách hợp đồng'],
    'ct.e.amount': ['Enter an amount.', 'Nhập số tiền.'], 'ct.e.range': ['Must be 2–10% of the contract value (now {p}%).', 'Phải bằng 2–10% giá trị hợp đồng (hiện {p}%).'], 'ct.e.bank': ['Issuing bank is required.', 'Bắt buộc nhập ngân hàng phát hành.'],
    'ct.e.cover': ['Must be valid until at least the contract end ({d}).', 'Phải có hiệu lực ít nhất đến ngày kết thúc hợp đồng ({d}).'], 'ct.secSaved': ['Performance security saved · alert set for {d}', 'Đã lưu bảo đảm · cảnh báo đặt ngày {d}'],
    'ct.e.file': ['Enter a file name ending in .pdf, .docx or .xlsx.', 'Nhập tên tệp có đuôi .pdf, .docx hoặc .xlsx.'], 'ct.uploaded': ['{n} uploaded as {t} {v}', 'Đã tải {n} lên dạng {t} {v}'], 'ct.namePh': ['e.g. CT-2026-008_PL02.pdf', 'VD: CT-2026-008_PL02.pdf']
  });
  const TYPES = ['Framework', 'Fixed price', 'Service SLA', 'Rate card'];
  const DOC_TYPES = ['Signed contract', 'Phụ lục (amendment)', 'Performance security', 'Specification / drawing', 'BOQ', 'Quotation', 'Mill certificate', 'Biên bản giao nhận'];
  const st = { q: '', ctype: 'all', status: 'all', owner: 'all', form: null, errs: {}, sec: null, secErrs: {}, up: null, upErrs: {} };
  const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const validDate = (s) => { const m = DATE.exec(s); if (!m) return false; const d = App.dt(s); return d.getDate() === +m[1] && d.getMonth() + 1 === +m[2]; };
  const doc = (id) => D().docs.find((d) => d.id === id);
  const statusOf = (c) => (doc(c.id) || {}).status || 'Draft';
  const sTone = (s) => ({ Active: 'success', Expiring: 'warning', Expired: 'danger', 'Pending signature': 'info' }[s] || 'neutral');
  const used = (c) => { const cm = c.lines.reduce((a, l) => a + l.commit, 0); return cm ? c.lines.reduce((a, l) => a + l.released, 0) / cm * 100 : 0; };
  const uom = (l) => (App.material(l.mat) || {}).uom || '';
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const bar = (p, warn) => `<div class="bar" role="img" aria-label="${esc(t('ct.usedLbl', { p: pct(p, 0) }))}"><span class="${warn ? 'warn' : ''}" style="width:${Math.min(100, p).toFixed(1)}%"></span></div>`;
  const E = (e) => (e ? (Array.isArray(e) ? t(e[0], e[1]) : t(e)) : '');
  const fld = (pre, errs, n, label, val, o = {}) => App.field(`${pre}-${n}`, t(label), val, Object.assign({ name: n, err: E(errs[n]) }, o));
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { o[el.name] = el.value.trim(); }); return o; };
  const money = (s) => Number(String(s).replace(/[.\s₫]/g, '').replace(',', '.'));
  const vname = (id) => App.vshort(App.vendor(id)) || id;

  /* ---------- New contract (L-05 step 1) ---------- */
  const vatLabel = (v) => (+v === 8 ? t('ct.vat8') : v + '%');
  // RB1-05: the 8% reduction ends 31/12/2026; contracts starting later use the standard 10%
  const vatFor = (m, start) => (m && m.vat === 8 && validDate(start) && App.dt(start) > App.dt('31/12/2026') ? 10 : m ? m.vat : 10);
  const blank = () => ({ ctype: 'Framework', vendor: 'V-1002', start: '01/01/2027', end: '31/12/2027', ceiling: '', vat: String(vatFor(App.material('CON-24102'), '01/01/2027')), owner: me(), mat: 'CON-24102', commit: '', price: '' });
  function newForm() {
    const f = st.form || (st.form = blank()); const e = st.errs;
    return block(t('ct.form'), `<form id="ct-new" novalidate class="stack"><div class="alert alert-info">${esc(t('ct.formNote', { id: nextId() }))}</div>
      <div class="form-grid">
        ${fld('cn', e, 'ctype', 'ct.f.type', f.ctype, { options: TYPES, req: true })}
        ${fld('cn', e, 'vendor', 'c.vendor', f.vendor, { options: D().vendors.filter((v) => v.status !== 'Blocked').map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]), req: true })}
        ${fld('cn', e, 'start', 'ct.f.start', f.start, { req: true, ph: 'dd/mm/yyyy' })}
        ${fld('cn', e, 'end', 'ct.f.end', f.end, { req: true, ph: 'dd/mm/yyyy' })}
        ${fld('cn', e, 'ceiling', 'ct.f.ceiling', f.ceiling, { req: true, mode: 'numeric', ph: '1.500.000.000' })}
        ${fld('cn', e, 'vat', 'VAT', f.vat, { options: [['8', t('ct.vat8')], ['10', '10%'], ['5', '5%'], ['0', '0%']] })}
        ${fld('cn', e, 'owner', 'c.owner', f.owner, { options: D().users.filter((u) => u.roles.includes('procurement')).map((u) => [u.name, u.name]) })}
        ${fld('cn', e, 'mat', 'ct.f.mat', f.mat, { options: D().materials.filter((m) => m.status === 'Active').map((m) => [m.id, `${m.id} · ${m.name}`]), req: true })}
        ${fld('cn', e, 'commit', 'ct.f.commit', f.commit, { req: true, mode: 'decimal' })}
        ${fld('cn', e, 'price', 'ct.f.price', f.price, { req: true, mode: 'numeric' })}
      </div>
      <div class="row-acts"><a class="btn" href="#/contracts" data-ct="cancel">${esc(t('c.cancel'))}</a><button type="submit" class="btn btn-p">${esc(t('ct.save'))}</button></div></form>`);
  }
  function nextId() { const n = Math.max(0, ...D().contracts.filter((c) => c.id.startsWith('CT-2026')).map((c) => +c.id.slice(8))) + 1; return 'CT-2026-' + String(n).padStart(3, '0'); }
  function saveNew(root) {
    const f = read(root, '#ct-new'); st.form = f; const e = {};
    ['start', 'end'].forEach((k) => { if (!validDate(f[k])) e[k] = 'c.dateFmt'; });
    if (!e.start && !e.end && App.dt(f.end) <= App.dt(f.start)) e.end = 'ct.e.endAfter';
    if (!(money(f.ceiling) > 0)) e.ceiling = 'ct.e.value';
    if (!(Number(f.commit.replace(',', '.')) > 0)) e.commit = 'ct.e.qty';
    if (!(money(f.price) > 0)) e.price = 'ct.e.price';
    const m = App.material(f.mat);
    if (!e.price && !e.commit && !e.ceiling && money(f.price) * Number(f.commit.replace(',', '.')) > money(f.ceiling)) e.ceiling = 'ct.e.ceiling';
    const expect = vatFor(m, f.start);
    if (+f.vat === 8 && validDate(f.start) && App.dt(f.start) > App.dt('31/12/2026')) e.vat = 'ct.e.vat8';
    else if (m && +f.vat !== expect) e.vat = ['ct.e.vatMatch', { id: m.id, v: expect }];
    if (m && !m.vendors.some((v) => v[0] === f.vendor && v[1] !== 'Blocked')) e.mat = ['ct.e.link', { v: f.vendor, m: m.id }];
    st.errs = e; if (Object.keys(e).length) { App.render(); const x = document.querySelector('#ct-new [aria-invalid=true]'); x && x.focus(); return; }
    const id = nextId(); const ceiling = money(f.ceiling);
    D().contracts.push({ id, ctype: f.ctype, vendor: f.vendor, start: f.start, end: f.end, ceiling, vat: +f.vat, owner: f.owner, esign: 'Draft · not sent for signature', minPct: 0, forecast: null,
      lines: [{ mat: f.mat, commit: Number(f.commit.replace(',', '.')), released: 0, q3: null, q4: money(f.price) }], adjust: '—', terms: [['Payment', '30 days after invoice']],
      security: { amount: Math.round(ceiling * 0.05), bank: '—', ref: 'Pending', expiry: App.addDays(f.end, 30) }, releases: [], files: [] });
    D().docs.push({ id, type: 'CT', title: `${tv(f.ctype)} – ${vname(f.vendor)}`, date: D().today, status: 'Draft', mats: [f.mat], vendor: f.vendor, value: ceiling });
    st.form = null; st.errs = {}; location.hash = '#/contracts/' + id; App.toast(t('ct.savedDraft', { id }));
  }

  /* ---------- List (F-30) ---------- */
  function list() {
    const q = st.q.trim(); const C = D().contracts;
    const rows = C.filter((c) => { const v = App.vendor(c.vendor) || {}; return (!q || [c.id, v.name, c.vendor, ...c.lines.map((l) => l.mat)].some((x) => App.matches(x, q)))
      && (st.ctype === 'all' || c.ctype === st.ctype) && (st.status === 'all' || statusOf(c) === st.status) && (st.owner === 'all' || c.owner === st.owner); });
    const sel = (k, label, opts) => `<label class="sr" for="cl-${k}">${esc(label)}</label><select class="inp" id="cl-${k}" data-cf="${k}"><option value="all">${esc(t('c.allOf', { label }))}</option>${opts.map((o) => `<option value="${esc(o)}"${st[k] === o ? ' selected' : ''}>${esc(tv(o))}</option>`).join('')}</select>`;
    return block(t('ct.title'), `<div class="filters"><label class="sr" for="cl-q">${esc(t('ct.searchLbl'))}</label><input class="inp grow" id="cl-q" data-cf="q" type="search" value="${esc(st.q)}" placeholder="${esc(t('ct.searchPh'))}">
      ${sel('ctype', t('c.type'), TYPES)}${sel('status', t('c.status'), [...new Set(C.map(statusOf))])}${sel('owner', t('c.owner'), [...new Set(C.map((c) => c.owner))])}</div>
      ${table([
        { h: t('ct.c.contract'), r: (c) => `<a class="mono" href="#/contracts/${esc(c.id)}">${esc(c.id)}</a><div class="small muted">${esc(tv(c.ctype))}</div>`, w: '130px' },
        { h: t('c.vendor'), r: (c) => `<a href="#/vendors/${esc(c.vendor)}">${esc(vname(c.vendor))}</a><div class="small muted">${esc(tv((doc(c.id) || {}).title || ''))}</div>`, w: 'minmax(180px,2fr)' },
        { h: t('c.mids'), r: (c) => `<div class="chips">${c.lines.map((l) => mid(l.mat)).join('')}</div>`, w: 'minmax(130px,1.2fr)' },
        { h: t('ct.c.period'), r: (c) => { const d = App.daysTo(c.end); return `${esc(c.start)} – ${esc(c.end)}<div class="small ${d < 0 ? 'tone-danger' : d <= 60 ? 'tone-warning' : 'muted'}">${esc(d < 0 ? t('ct.expiredAgo', { n: -d }) : t('ct.left', { n: d }))}</div>`; }, w: 'minmax(170px,1.3fr)' },
        { h: t('ct.c.ceiling'), r: (c) => ty(c.ceiling), cls: 'num', w: '110px' },
        { h: t('ct.c.used'), r: (c) => `${bar(used(c), c.minPct && used(c) < c.minPct)}<div class="small">${pct(used(c), 0)}</div>`, w: '110px' },
        { h: t('c.owner'), k: 'owner', w: 'minmax(120px,1fr)' },
        { h: t('c.status'), r: (c) => pill(statusOf(c), sTone(statusOf(c))), w: '130px' }
      ], rows, { empty: t('ct.empty'), label: t('ct.title') })}
      <p class="small muted">${esc(t('ct.showing', { n: rows.length, total: D().contractStats.total }))}</p>`, { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('c.exported', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }
  function offContract() {
    const o = App.src && App.src.offContract ? App.src.offContract().filter((x) => x.d.id !== 'PO-2026-0861') : [];
    return block(t('ct.off'), `<div class="alert alert-warning" role="status">${esc(t('ct.offMain', { po: 'PO-2026-0861', m: 'CON-24102', p: vnd(1680000), b: vnd(1580000), ct: 'CT-2025-007' }))} <a href="#/tenders/new?mat=CON-24102">${esc(t('ct.offTender'))}</a>.</div>
      <p class="small m-0">${mid('CON-24102')} · <a class="mono" href="#/po/PO-2026-0861">PO-2026-0861</a> · <a class="mono" href="#/contracts/CT-2025-007">CT-2025-007</a></p>
      ${o.length ? `<div><b class="small">${esc(t('ct.offAlso'))}</b><ul class="plain small">${o.map((x) => `<li><a class="mono" href="#/po/${esc(x.d.id)}">${esc(x.d.id)}</a> ${esc(x.m)} · ${esc(tv(x.why))}</li>`).join('')}</ul></div>` : ''}
      <p class="small muted m-0">${esc(t('ct.offRule'))}</p>`);
  }

  /* ---------- Detail (F-31..F-35) ---------- */
  const DSUBS = [['', 'ct.sub.overview'], ['prices', 'ct.sub.prices'], ['terms', 'ct.sub.terms'], ['files', 'ct.sub.files']];
  function detail(c, subArg) {
    const cur = App.sub(DSUBS, subArg || '');
    const v = App.vendor(c.vendor) || { id: c.vendor, name: c.vendor }; const s = statusOf(c); const dl = App.daysTo(c.end);
    const commit = c.lines.reduce((a, l) => a + l.commit, 0), rel = c.lines.reduce((a, l) => a + l.released, 0); const u = uom(c.lines[0]);
    const relValue = c.releases.reduce((a, r) => a + r[2] * r[3], 0); const minQty = commit * c.minPct / 100; const relPct = commit ? rel / commit * 100 : 0;
    const sec = c.security; const secPct = sec.amount / c.ceiling * 100; const secDays = App.daysTo(sec.expiry);
    const kpis = [kpi(t('ct.k.ceiling'), ty(c.ceiling), esc(t('ct.k.vat', { v: vatLabel(c.vat) }))), kpi(t('ct.k.released'), `${num(rel)} ${esc(u)}`, esc(t('ct.k.of', { c: num(commit), p: pct(relPct, 0) })), c.minPct && relPct < c.minPct ? 'warning' : ''),
      kpi(t('ct.k.relValue'), relValue ? ty(relValue) : '—', esc(t('ct.k.pos', { n: c.releases.length }) + (c.histNote ? ' · ' + tv(c.histNote) : ''))), kpi(t('ct.k.days'), dl < 0 ? esc(t('ct.k.expired')) : String(dl), esc(c.end), dl < 0 ? 'danger' : dl <= 60 ? 'warning' : '')];
    let blocks; let ovAlerts = '';
    if (cur === 'prices') {
      blocks = [block(t('ct.prices'), table([
        { h: t('c.mid'), r: (l) => mid(l.mat), w: '120px' }, { h: t('c.description'), r: (l) => esc((App.material(l.mat) || {}).name || ''), w: 'minmax(160px,2fr)' },
        { h: 'Q3/2026', r: (l) => (l.q3 ? vnd(l.q3) : '—'), cls: 'num', w: '140px' }, { h: t('ct.q4'), r: (l) => (l.q4 ? vnd(l.q4) : '—'), cls: 'num', w: '160px' },
        { h: t('ct.change'), r: (l) => (l.q3 && l.q4 ? `${l.q4 < l.q3 ? '−' : '+'}${pct(Math.abs(l.q4 - l.q3) / l.q3 * 100)}` : '—'), cls: 'num', w: '100px' }
      ], c.lines, { min: 620, label: t('ct.prices') }) + `<p class="small muted m-0">${esc(tv(c.adjust))}</p>`),
      block(t('ct.releases', { n: c.releases.length }), table([
        { h: 'PO', r: (r) => (doc(r[0]) ? `<a class="mono" href="#/po/${esc(r[0])}">${esc(r[0])}</a>` : `<span class="mono">${esc(r[0])}</span>`), w: '130px' }, { h: t('c.date'), r: (r) => esc(r[4]), w: '110px' },
        { h: t('c.mid'), r: (r) => mid(r[1]), w: '120px' }, { h: t('ct.qty'), r: (r) => `${num(r[2])} ${esc((App.material(r[1]) || {}).uom || '')}`, cls: 'num', w: '100px' },
        { h: t('ct.unitPrice'), r: (r) => vnd(r[3]), cls: 'num', w: '140px' }, { h: t('c.value'), r: (r) => vnd(r[2] * r[3]), cls: 'num', w: '160px' }
      ], c.releases.slice().reverse(), { min: 760, empty: t('ct.noReleases'), label: t('ct.releases', { n: c.releases.length }) }))];
    } else if (cur === 'terms') {
      const se = st.secErrs; const sv = st.sec || { amount: num(sec.amount), bank: sec.bank, expiry: sec.expiry };
      blocks = [block(t('ct.terms'), `<dl class="dl">${c.terms.map(([k, x]) => `<dt>${esc(tv(k))}</dt><dd>${esc(tv(x))}</dd>`).join('')}</dl>`, { span: 6 }),
        block(t('ct.security'), `<dl class="dl"><dt>${esc(t('ct.amount'))}</dt><dd>${vnd(sec.amount)} · <b>${pct(secPct)}</b> ${esc(t('ct.ofCeiling'))} ${secPct < 2 || secPct > 10 ? pill(t('ct.outside'), 'danger') : pill(t('ct.within'), 'success')}</dd><dt>${esc(t('ct.bankRef'))}</dt><dd>${esc(sec.bank)} · <span class="mono">${esc(tv(sec.ref))}</span></dd>
          <dt>${esc(t('ct.validTo'))}</dt><dd>${esc(sec.expiry)} ${secDays < 0 ? pill('Expired', 'danger') : secDays <= 30 ? pill(t('ct.daysLeft', { n: secDays }), 'danger') : `<span class="small muted">${esc(t('ct.alertOn', { d: App.addDays(sec.expiry, -30) }))}</span>`}</dd></dl>
          ${st.sec ? `<form id="ct-sec" novalidate class="stack"><div class="form-grid">${fld('cs', se, 'amount', 'ct.amountF', sv.amount, { req: true, mode: 'numeric', hint: t('ct.amountHint', { c: vnd(c.ceiling), a: vnd(c.ceiling * 0.02), b: vnd(c.ceiling * 0.1) }) })}${fld('cs', se, 'bank', 'ct.bankF', sv.bank, { req: true })}${fld('cs', se, 'expiry', 'ct.validTo', sv.expiry, { req: true, ph: 'dd/mm/yyyy', hint: t('ct.validHint') })}</div>
            <div class="row-acts"><button type="button" class="btn btn-sm" data-ct="sec-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('ct.saveSec'))}</button></div></form>` : ''}`,
        { span: 6, actions: st.sec ? '' : `<button class="btn btn-sm" data-ct="sec-edit">${esc(t('ct.editSec'))}</button>` })];
    } else if (cur === 'files') {
      const ue = st.upErrs; const uv = st.up || { type: 'Signed contract', name: '', mat: '' };
      blocks = [block(t('ct.docs', { n: c.files.length }), table([
        { h: t('c.type'), r: (f) => esc(tv(f.type)), w: 'minmax(140px,1.3fr)' }, { h: t('c.file'), r: (f) => `<span class="mono small">${esc(f.name)}</span>`, w: 'minmax(200px,2fr)' }, { h: t('c.version'), k: 'ver', w: '90px' },
        { h: t('c.uploaded'), r: (f) => `${esc(f.date)}<div class="small muted">${esc(f.by)}</div>`, w: 'minmax(130px,1.2fr)' }, { h: t('ct.label'), r: (f) => pill(f.tag, f.tag === 'Signed' ? 'success' : f.tag === 'Uploaded by supplier' ? 'info' : 'neutral'), w: '170px' },
        { h: t('c.mids'), r: (f) => (f.mats.length ? `<div class="chips">${f.mats.map(mid).join('')}</div>` : '<span class="muted">—</span>'), w: 'minmax(130px,1.2fr)' }
      ], c.files.slice().reverse(), { min: 980, empty: t('ct.noDocs'), label: t('ct.docs', { n: c.files.length }) })
        + (st.up ? `<form id="ct-up" novalidate class="stack"><div class="form-grid">${fld('cu', ue, 'type', 'ct.docType', uv.type, { options: DOC_TYPES, req: true })}${fld('cu', ue, 'name', 'ct.fileName', uv.name, { req: true, ph: t('ct.namePh'), hint: t('ct.fileHint') })}${fld('cu', ue, 'mat', 'ct.matTag', uv.mat, { options: [['', t('c.noneOpt')]].concat(c.lines.map((l) => [l.mat, l.mat])) })}</div>
          <div class="row-acts"><button type="button" class="btn btn-sm" data-ct="up-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('c.upload'))}</button></div></form>` : ''),
      { actions: st.up ? '' : `<button class="btn btn-sm" data-ct="up">${esc(t('c.upload'))}</button>` })];
    } else {
      ovAlerts = [
        dl < 0 ? `<div class="alert alert-danger" role="alert">${esc(t('ct.a.expired', { d: c.end, m: c.lines.map((l) => l.mat).join(', ') }))}</div>`
          : dl <= 60 ? `<div class="alert alert-warning" role="status">${esc(t('ct.a.expiring', { d: c.end, n: dl, o: c.owner }))}</div>` : '',
        c.minPct && c.forecast != null && c.forecast < minQty ? `<div class="alert alert-warning" role="status">${esc(t('ct.a.forecast', { f: num(c.forecast), u, d: c.end, min: num(minQty), p: c.minPct, c: num(commit) }))}</div>` : '',
        secDays >= 0 && secDays <= 30 ? `<div class="alert alert-danger" role="alert">${esc(t('ct.a.sec', { ref: sec.ref, d: sec.expiry, n: secDays }))} ${esc(sec.note ? tv(sec.note) + '.' : t('ct.a.secAsk'))}</div>` : ''
      ].join('');
      const summary = block(t('ct.summary'), `<dl class="dl"><dt>${esc(t('c.type'))}</dt><dd>${esc(tv(c.ctype))}</dd><dt>${esc(t('c.vendor'))}</dt><dd><a href="#/vendors/${esc(v.id)}">${esc(v.id)} ${esc(App.vshort(v))}</a></dd><dt>${esc(t('ct.c.period'))}</dt><dd>${esc(c.start)} – ${esc(c.end)}</dd>
        <dt>${esc(t('ct.c.ceiling'))}</dt><dd>${vnd(c.ceiling)} <span class="small muted">(${ty(c.ceiling)})</span></dd><dt>VAT</dt><dd>${esc(vatLabel(c.vat))}</dd><dt>${esc(t('c.owner'))}</dt><dd>${esc(c.owner)}</dd><dt>${esc(t('ct.esign'))}</dt><dd>${esc(tv(c.esign))}</dd></dl>`, { span: 6 });
      const consumption = block(t('ct.consumption'), `<p><b>${esc(t('ct.releasedOf', { a: num(rel), b: num(commit), u, p: pct(relPct, 0) }))}</b>${c.minPct ? esc(t('ct.minimum', { q: num(minQty), u, p: c.minPct })) : ''}</p>${bar(relPct, c.minPct && relPct < c.minPct)}
        <div class="stack">${c.lines.map((l) => `<div><div class="small">${mid(l.mat)} ${num(l.released)} / ${num(l.commit)} ${esc(uom(l))} · ${pct(l.commit ? l.released / l.commit * 100 : 0, 0)}</div>${bar(l.commit ? l.released / l.commit * 100 : 0)}</div>`).join('')}</div>
        <p class="small muted">${esc(t('ct.relNote', { v: relValue ? ty(relValue) : '—', n: c.releases.length, h: c.histNote ? ' (' + tv(c.histNote) + ')' : '' }))}</p>`, { span: 6 });
      blocks = [summary, consumption];
    }
    const base = 'contracts/' + c.id;
    return layout({
      crumbs: `<a href="#/contracts">${esc(t('ct.title'))}</a> / ${esc(c.id)}`, titleHtml: `<span class="mono">${esc(c.id)}</span> ${esc(tv((doc(c.id) || {}).title || ''))}`,
      subtitle: `${esc(tv(c.ctype))} · <a href="#/vendors/${esc(v.id)}">${esc(v.name)}</a> · ${pill(s, sTone(s))} · ${esc(tv(c.esign))}`,
      actions: `<button class="btn" data-act="toast" data-msg="${esc(t('ct.amendMsg', { id: c.id }))}">${esc(t('ct.amend'))}</button><button class="btn" data-act="toast" data-msg="${esc(t('ct.renewMsg', { id: c.id }))}">${esc(t('ct.renew'))}</button>
        ${s === 'Active' || s === 'Expiring' ? `<a class="btn btn-p" href="#/po?contract=${esc(c.id)}">${esc(t('ct.release'))}</a>` : `<button class="btn btn-p" disabled title="${esc(t('ct.releaseTip'))}">${esc(t('ct.release'))}</button>`}`,
      alerts: App.unknownSub(DSUBS, subArg) + ovAlerts, kpis, subnav: App.subnav(base, DSUBS, cur), blocks
    });
  }

  const LSUBS = [['', 'ct.sub.list'], ['new', 'ct.sub.new'], ['offcontract', 'ct.sub.off']];
  App.page('contracts', {
    titleKey: 'ct.title', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/');
      const isList = !parts[0] || parts[0] === 'new' || parts[0] === 'offcontract';
      const id = isList ? p.id : parts[0];
      if (id) {
        const c = D().contracts.find((x) => x.id === id); if (st.cur !== id) { st.cur = id; st.sec = null; st.up = null; st.secErrs = {}; st.upErrs = {}; }
        return c ? detail(c, isList ? '' : parts.slice(1).join('/')) : layout({ title: t('ct.title'), blocks: [block(null, App.errorState(t('ct.notFound', { id })) + `<p class="m-0"><a class="btn" href="#/contracts">${esc(t('ct.back'))}</a></p>`)] });
      }
      const cur = parts[0] || '';
      const C = D().contracts; const exp = C.filter((c) => { const d = App.daysTo(c.end); return d >= 0 && d <= 60; });
      const avg = C.filter((c) => !['Expired', 'Pending signature', 'Draft'].includes(statusOf(c))).reduce((a, c, _, A) => a + used(c) / A.length, 0);
      return layout({
        title: t('ct.title'), subtitle: esc(t('ct.subtitle')),
        actions: cur === 'new' ? '' : `<a class="btn btn-p" href="#/contracts/new">${esc(t('ct.new'))}</a>`,
        kpis: [kpi(t('ct.k.active'), `${D().contractStats.active} / ${D().contractStats.total}`, esc(t('ct.k.allVendors'))), kpi(t('ct.k.value'), num(D().contractStats.value, 1) + App.tyU(), esc(t('ct.k.ceilings'))),
          kpi(t('ct.k.expiring'), String(exp.length), esc(exp.map((c) => c.id).join(', ') || t('c.none')), exp.length ? 'warning' : ''), kpi(t('ct.k.avg'), pct(D().contractStats.avgUse, 0), esc(t('ct.k.avgN', { p: pct(avg, 0) })))],
        subnav: App.subnav('contracts', LSUBS, cur), blocks: [cur === 'new' ? newForm() : cur === 'offcontract' ? offContract() : list()]
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.cf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('cl-q'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } } });
      root.addEventListener('change', (e) => { const k = e.target.dataset.cf; if (k && k !== 'q') { st[k] = e.target.value; App.render(); } });
      root.addEventListener('submit', (e) => {
        const f = e.target; if (!['ct-new', 'ct-sec', 'ct-up'].includes(f.id)) return; e.preventDefault();
        if (f.id === 'ct-new') return saveNew(root);
        const c = D().contracts.find((x) => x.id === st.cur); if (!c) return;
        if (f.id === 'ct-sec') {
          const x = read(root, '#ct-sec'); st.sec = x; const er = {}; const amt = money(x.amount); const pc = amt / c.ceiling * 100;
          if (!(amt > 0)) er.amount = 'ct.e.amount'; else if (pc < 2 || pc > 10) er.amount = ['ct.e.range', { p: num(pc, 1) }];
          if (!x.bank) er.bank = 'ct.e.bank';
          if (!validDate(x.expiry)) er.expiry = 'c.dateFmt'; else if (App.dt(x.expiry) < App.dt(c.end)) er.expiry = ['ct.e.cover', { d: c.end }];
          st.secErrs = er; if (Object.keys(er).length) { App.render(); const q = document.querySelector('#ct-sec [aria-invalid=true]'); q && q.focus(); return; }
          Object.assign(c.security, { amount: amt, bank: x.bank, expiry: x.expiry }); st.sec = null; App.render(); App.toast(t('ct.secSaved', { d: App.addDays(x.expiry, -30) }));
        } else {
          const x = read(root, '#ct-up'); st.up = x; const er = {};
          if (!/^[\w.\- ()]+\.(pdf|docx|xlsx)$/i.test(x.name)) er.name = 'ct.e.file';
          st.upErrs = er; if (Object.keys(er).length) { App.render(); const n = document.getElementById('cu-name'); n && n.focus(); return; }
          const ver = 'v' + (Math.max(0, ...c.files.filter((y) => y.type === x.type).map((y) => +String(y.ver).slice(1) || 0)) + 1);
          c.files.push({ type: x.type, name: x.name, ver, by: me(), date: D().today, mats: x.mat ? [x.mat] : [], tag: x.type === 'Signed contract' || x.type.startsWith('Phụ lục') ? 'Signed' : 'Uploaded' });
          st.up = null; App.render(); App.toast(t('ct.uploaded', { n: x.name, t: tv(x.type), v: ver }));
        }
      });
      root.addEventListener('click', (e) => {
        const el = e.target.closest('[data-ct]'); if (!el) return; const a = el.dataset.ct;
        const c = D().contracts.find((x) => x.id === st.cur);
        if (a === 'cancel') { st.form = null; st.errs = {}; }
        else if (a === 'sec-edit' && c) { st.sec = { amount: num(c.security.amount), bank: c.security.bank, expiry: c.security.expiry }; st.secErrs = {}; App.render(); const i = document.getElementById('cs-amount'); i && i.focus(); }
        else if (a === 'sec-cancel') { st.sec = null; st.secErrs = {}; App.render(); }
        else if (a === 'up') { st.up = { type: 'Signed contract', name: '', mat: '' }; st.upErrs = {}; App.render(); const i = document.getElementById('cu-type'); i && i.focus(); }
        else if (a === 'up-cancel') { st.up = null; st.upErrs = {}; App.render(); }
      });
    }
  });
})();

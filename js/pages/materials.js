/* Module 3 · Material ID — F-10 list & filters, F-11 numbering & change log, F-12 new request, F-13 required certificates,
   F-14 VAT default & 8% reduction, F-15 duplicate check, F-16 approval workflow.
   Routes: #/materials (list) · sub-functions: /new (request form), /rules (numbering & VAT), /workflow (approval), /log (change log) */
(function () {
  const { esc, num, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'mt.title': ['Material IDs', 'Mã vật tư'], 'mt.subtitle': ['Master data · every vendor, tender, PR, PO and invoice line links to a Material ID', 'Dữ liệu gốc · mọi NCC, gói thầu, PR, PO và dòng hóa đơn đều gắn với mã vật tư'],
    'mt.new': ['New Material ID', 'Tạo mã vật tư'], 'mt.sub.list': ['List', 'Danh sách'], 'mt.sub.new': ['New request', 'Đề nghị mới'], 'mt.sub.rules': ['Numbering & VAT', 'Đánh số & VAT'], 'mt.sub.workflow': ['Approval workflow', 'Quy trình duyệt'], 'mt.sub.log': ['Change log', 'Nhật ký thay đổi'],
    'mt.k.total': ['Material IDs', 'Mã vật tư'], 'mt.k.active': ['Active', 'Đang hoạt động'], 'mt.k.activeN': ['Usable on PR / PO', 'Dùng được trên PR / PO'], 'mt.k.pending': ['Pending approval', 'Chờ duyệt'], 'mt.k.single': ['Single source', 'Một nguồn'], 'mt.k.singleN': ['Only 1 approved vendor', 'Chỉ 1 NCC được duyệt'],
    'mt.vat8': ['8% (reduced, until 31/12/2026)', '8% (giảm, đến 31/12/2026)'], 'mt.kct': ['KCT (not subject)', 'KCT (không chịu thuế)'],
    'mt.e.name': ['Vietnamese description is required.', 'Bắt buộc nhập mô tả tiếng Việt.'], 'mt.e.en': ['English description is required.', 'Bắt buộc nhập mô tả tiếng Anh.'], 'mt.e.group': ['Material group is required.', 'Bắt buộc nhập nhóm vật tư.'],
    'mt.e.uom': ['Base UoM is required.', 'Bắt buộc nhập ĐVT cơ sở.'], 'mt.e.hs': ['HS code format: 4 digits, optional .NN (e.g. 7214.20).', 'Mã HS: 4 chữ số, có thể thêm .NN (VD: 7214.20).'], 'mt.e.lead': ['Lead time must be 0 or more days.', 'Thời gian giao phải từ 0 ngày trở lên.'],
    'mt.e.moq': ['MOQ is required.', 'Bắt buộc nhập MOQ.'], 'mt.e.metal': ['Metal products are excluded from the 8% reduction (NQ 204/2025). Use 10%.', 'Sản phẩm kim loại không được giảm thuế 8% (NQ 204/2025). Dùng 10%.'],
    'mt.e.vat8': ['An item eligible for the reduction must default to 8%.', 'Mặt hàng được giảm thuế phải có VAT mặc định 8%.'], 'mt.e.vat': ['8% is only allowed for items eligible for the reduction.', 'Chỉ mặt hàng được giảm thuế mới dùng 8%.'],
    'mt.e.dup': ['Explain why this is not a duplicate (at least 10 characters).', 'Giải thích vì sao không trùng (ít nhất 10 ký tự).'],
    'mt.vat8Metal': ['Metal products are excluded (NQ 204/2025) → 10%', 'Sản phẩm kim loại bị loại trừ (NQ 204/2025) → 10%'], 'mt.vat8Hint': ['NQ 204/2025 · valid until 31/12/2026', 'NQ 204/2025 · hiệu lực đến 31/12/2026'],
    'mt.dupTitle': ['Possible duplicate · same group, diameter and UoM', 'Có thể trùng · cùng nhóm, đường kính và ĐVT'], 'mt.match': ['{n}% match', 'khớp {n}%'], 'mt.dupWhy': ['Why is this not a duplicate?', 'Vì sao không trùng?'],
    'mt.dupPh': ['e.g. Grade differs: CB500-V vs CB400-V', 'VD: Khác mác: CB500-V và CB400-V'], 'mt.noDup': ['No duplicates found in this group.', 'Không phát hiện trùng trong nhóm này.'],
    'mt.form': ['New Material ID request', 'Đề nghị tạo mã vật tư'], 'mt.reserve': ['Material ID {id} will be reserved on submit and assigned on approval. Drafts do not take a number. Numbers are never reused.', 'Mã {id} sẽ được giữ khi gửi duyệt và cấp khi được duyệt. Bản nháp không lấy số. Số không bao giờ dùng lại.'],
    'mt.f.cat': ['Category', 'Nhóm hàng'], 'mt.f.group': ['Material group', 'Nhóm vật tư'], 'mt.f.name': ['Description (VN)', 'Mô tả (tiếng Việt)'], 'mt.f.en': ['Description (EN)', 'Mô tả (tiếng Anh)'], 'mt.f.uom': ['Base UoM', 'ĐVT cơ sở'],
    'mt.f.alt': ['Alt-UoM conversion', 'Quy đổi ĐVT'], 'mt.f.altHint': ['e.g. 1 tấn = 54 cây', 'VD: 1 tấn = 54 cây'], 'mt.f.diameter': ['Spec · diameter (mm)', 'Thông số · đường kính (mm)'], 'mt.f.grade': ['Spec · grade', 'Thông số · mác'], 'mt.f.hs': ['HS code', 'Mã HS'],
    'mt.f.lead': ['Lead time (days)', 'Thời gian giao (ngày)'], 'mt.f.moq': ['MOQ', 'MOQ'], 'mt.f.eg': ['e.g. {v}', 'VD: {v}'], 'mt.f.certs': ['Required certificates · where each is checked', 'Chứng chỉ bắt buộc · nơi kiểm tra'],
    'mt.f.vat': ['Default VAT rate', 'Thuế suất VAT mặc định'], 'mt.f.vat8': ['Eligible for 8% reduction', 'Được giảm thuế 8%'], 'mt.f.fin': ['Confirmed by Finance', 'Tài chính xác nhận'], 'mt.f.finPend': ['Pending · Đỗ Hoàng Nam', 'Đang chờ · Đỗ Hoàng Nam'],
    'mt.f.finHint': ['Admin assigns the code only after Finance confirms VAT.', 'Quản trị chỉ cấp mã sau khi Tài chính xác nhận VAT.'], 'mt.f.attType': ['Attachment type', 'Loại tệp đính kèm'], 'mt.f.att': ['File (v1)', 'Tệp (v1)'],
    'mt.check': ['Run duplicate check', 'Kiểm tra trùng'], 'mt.submit': ['Submit for approval', 'Gửi duyệt'],
    'mt.route': ['Route: Requester → Material master owner (duplicate, spec, VAT, certificates) → Admin assigns code. SoD: the requester cannot approve their own request.', 'Luồng: Người đề nghị → Chủ quản danh mục (trùng, thông số, VAT, chứng chỉ) → Quản trị cấp mã. SoD: người đề nghị không tự duyệt.'],
    'mt.searchPh': ['Search ID, description VN/EN, HS code', 'Tìm mã, mô tả Việt/Anh, mã HS'], 'mt.group': ['Group', 'Nhóm'], 'mt.singleOnly': ['Single source only', 'Chỉ hàng một nguồn'],
    'mt.c.catGroup': ['Category · group', 'Nhóm hàng · nhóm'], 'mt.c.reduced': ['reduced to 31/12', 'giảm đến 31/12'], 'mt.c.finPending': ['Finance pending', 'Chờ Tài chính'], 'mt.c.contracts': ['Contracts', 'Hợp đồng'],
    'mt.empty': ['No Material IDs match these filters', 'Không có mã vật tư phù hợp bộ lọc'], 'mt.showing': ['Showing {n} of {total} Material IDs (sample loaded) · prices excl. VAT', 'Hiển thị {n} / {total} mã vật tư (dữ liệu mẫu) · giá chưa VAT'],
    'mt.importMsg': ['Import Excel: template MaterialID_import_v3.xlsx', 'Nhập Excel: mẫu MaterialID_import_v3.xlsx'],
    'mt.numbering': ['Numbering rules', 'Quy tắc đánh số'], 'mt.numberingNote': ['Format CAT-NNNNN. Number reserved on submit, assigned on approval, never reused (e.g. LOG-61013 blocked as duplicate of LOG-61012).', 'Định dạng CAT-NNNNN. Số được giữ khi gửi duyệt, cấp khi duyệt, không dùng lại (VD: LOG-61013 bị chặn vì trùng LOG-61012).'],
    'mt.range': ['Range', 'Dải số'], 'mt.next': ['Next', 'Số tiếp theo'],
    'mt.flow': ['Approval workflow', 'Quy trình phê duyệt'], 'mt.fl.req': ['Requester', 'Người đề nghị'], 'mt.fl.reqN': ['Submits; number reserved', 'Gửi duyệt; số được giữ'], 'mt.fl.owner': ['Material master owner', 'Chủ quản danh mục'],
    'mt.fl.ownerN': ['Duplicate, spec, VAT, certificates', 'Kiểm tra trùng, thông số, VAT, chứng chỉ'], 'mt.fl.admin': ['Admin', 'Quản trị'], 'mt.fl.adminN': ['Assigns code after Finance confirms VAT', 'Cấp mã sau khi Tài chính xác nhận VAT'],
    'mt.fl.sod': ['SoD: a requester cannot approve their own request. Pending:', 'SoD: người đề nghị không tự duyệt. Đang chờ:'], 'mt.myApprovals': ['My approvals', 'Chờ tôi duyệt'],
    'mt.vatRules': ['VAT rules', 'Quy tắc VAT'], 'mt.v1': ['VAT is an attribute of the Material ID; every PR, bid, PO and invoice line inherits it.', 'VAT là thuộc tính của mã vật tư; mọi dòng PR, hồ sơ thầu, PO và hóa đơn đều kế thừa.'],
    'mt.v2': ['8% reduction (NQ 204/2025/QH15, NĐ 174/2025) valid until 31/12/2026, labelled "8% (reduced, until 31/12/2026)".', 'Giảm thuế 8% (NQ 204/2025/QH15, NĐ 174/2025) hiệu lực đến 31/12/2026, ghi là "8% (giảm, đến 31/12/2026)".'],
    'mt.v3': ['Metal products are excluded and stay at 10%:', 'Sản phẩm kim loại bị loại trừ và giữ 10%:'], 'mt.v4': ['"Confirmed by Finance" is required before the code is assigned.', 'Cần "Tài chính xác nhận" trước khi cấp mã.'],
    'mt.log': ['Change log · last 7 days', 'Nhật ký thay đổi · 7 ngày gần nhất'],
    'mt.dupFound': ['Possible duplicate found', 'Phát hiện khả năng trùng'], 'mt.noDupT': ['No duplicates found', 'Không phát hiện trùng'], 'mt.draftSaved': ['Draft saved · no number yet ({id})', 'Đã lưu nháp · chưa lấy số ({id})'], 'mt.submitted': ['{id} submitted · Step 1 of 3', 'Đã gửi {id} · Bước 1/3'],
    'mt.fixErrors': ['Fix the highlighted fields.', 'Vui lòng sửa các trường được đánh dấu.']
  });
  const CATS = ['CON', 'EQP', 'SRV', 'LOG'];
  const METAL = /thép|kim loại|steel/i;
  const st = { q: '', cat: 'all', group: 'all', status: 'all', vat: 'all', single: false, f: null, errs: {}, dupReason: '' };

  const vatLabel = (m) => (m.vat === 'KCT' ? 'KCT' : m.vat === 8 ? t('mt.vat8') : m.vat + '%');
  const statusTone = (s) => (s === 'Active' ? 'success' : s === 'Blocked' ? 'danger' : s === 'Draft' ? 'neutral' : 'warning');
  const eligibleVendors = (m) => m.vendors.filter((v) => v[1] !== 'Blocked');
  App.vatLabel = vatLabel;

  const certAt = (c) => (c.startsWith('CO') || c === 'Test report' ? 'At GRN' : c.startsWith('Hợp') ? 'Valid on PO date' : 'At tender and PO date');
  const groupsOf = (cat) => [...new Set(D().materials.filter((m) => m.cat === cat).map((m) => m.group))];
  const blank = () => ({ cat: 'CON', group: 'Thép xây dựng', name: 'Thép cây D16 CB500-V', en: 'Rebar D16 CB500-V', uom: 'tấn', alt: '1 tấn = 54 cây', diameter: '16', grade: 'CB500-V', hs: '7214.20', lead: '7', moq: '5 tấn',
    certs: ['CO/CQ per lot', 'Hợp quy QCVN 7:2019/BKHCN'], vat: '10', vat8: 'No', attType: 'Spec sheet', attName: 'TCVN1651-2_CB500V.pdf' });

  function nextId(cat) { const c = D().categories.find((x) => x.code === cat); return `${cat}-${c.next}`; }

  /* Duplicate check: same category + group + UoM → base 60; same main spec (diameter) +20; name token overlap ×20 */
  function dupCheck(f) {
    const tok = (s) => new Set(String(s).toLowerCase().split(/[\s,]+/).filter(Boolean));
    const a = tok(f.name);
    return D().materials.filter((m) => m.status !== 'Blocked' && m.cat === f.cat && m.group === f.group && m.uom === f.uom).map((m) => {
      const b = tok(m.name); const inter = [...a].filter((x) => b.has(x)).length; const jac = inter / new Set([...a, ...b]).size;
      const dia = (m.spec.find((s) => s[0] === 'Diameter') || [])[1];
      const score = Math.round(60 + (dia && f.diameter && parseInt(dia, 10) === parseInt(f.diameter, 10) ? 20 : 0) + jac * 20);
      return { m, score };
    }).filter((x) => x.score >= 75).sort((x, y) => y.score - x.score);
  }

  // Errors are stored as i18n keys and translated at render time (language switch keeps them correct)
  function validate(f, submit) {
    const e = {};
    if (!f.name.trim()) e.name = 'mt.e.name';
    if (!f.en.trim()) e.en = 'mt.e.en';
    if (!f.group.trim()) e.group = 'mt.e.group';
    if (!f.uom.trim()) e.uom = 'mt.e.uom';
    if (submit) {
      if (f.hs && !/^\d{4}(\.\d{2}){0,2}$/.test(f.hs) && f.hs !== '—') e.hs = 'mt.e.hs';
      if (f.lead === '' || isNaN(+f.lead) || +f.lead < 0) e.lead = 'mt.e.lead';
      if (!f.moq.trim()) e.moq = 'mt.e.moq';
      if (f.vat8 === 'Yes' && METAL.test(f.group + ' ' + f.name)) e.vat8 = 'mt.e.metal';
      if (f.vat8 === 'Yes' && f.vat !== '8') e.vat8 = 'mt.e.vat8';
      if (f.vat === '8' && f.vat8 !== 'Yes') e.vat = 'mt.e.vat';
      const dups = dupCheck(f);
      if (dups.length && st.dupReason.trim().length < 10) e.dup = 'mt.e.dup';
    }
    return e;
  }

  function readForm(root) {
    const g = (n) => { const el = root.querySelector(`[name="${n}"]`); return el ? el.value : ''; };
    return { cat: g('cat'), group: g('group'), name: g('name'), en: g('en'), uom: g('uom'), alt: g('alt'), diameter: g('diameter'), grade: g('grade'), hs: g('hs'), lead: g('lead'), moq: g('moq'),
      certs: [...root.querySelectorAll('[name=certs]:checked')].map((c) => c.value), vat: g('vat'), vat8: g('vat8'), attType: g('attType'), attName: g('attName') };
  }
  const fld = (name, label, f, o = {}) => App.field('nm-' + name, t(label), f[name], Object.assign({ name, err: st.errs[name] ? t(st.errs[name]) : '' }, o));

  const vat8Hint = (metal) => t(metal ? 'mt.vat8Metal' : 'mt.vat8Hint');
  function dupBox(f) {
    const dups = dupCheck(f);
    return `<div id="nm-dup-box">${dups.length ? `<div class="alert alert-warning" role="status"><b>${esc(t('mt.dupTitle'))}</b><ul class="plain">${dups.map((d) => `<li>${mid(d.m.id)} ${esc(d.m.name)} · <b>${esc(t('mt.match', { n: d.score }))}</b></li>`).join('')}</ul>
          <div class="field"><label for="nm-dup">${esc(t('mt.dupWhy'))} *</label><input id="nm-dup" name="dupReason" value="${esc(st.dupReason)}" placeholder="${esc(t('mt.dupPh'))}">${st.errs.dup ? `<span class="err" role="alert">${esc(t(st.errs.dup))}</span>` : ''}</div></div>` : `<div class="alert alert-success">${esc(t('mt.noDup'))}</div>`}</div>`;
  }

  function requestForm() {
    const f = st.f || (st.f = blank()); const metal = METAL.test(f.group + ' ' + f.name);
    const certOpts = ['CO/CQ per lot', 'Hợp quy QCVN 7:2019/BKHCN', 'ISO 9001', 'Test report'];
    return block(t('mt.form'), `
      <form id="nm-form" novalidate class="stack">
        <div class="alert alert-info">${esc(t('mt.reserve', { id: nextId(f.cat) }))}</div>
        <div class="form-grid">
          ${fld('cat', 'mt.f.cat', f, { options: CATS.map((k) => [k, `${k} · ${t('cat.' + k)}`]), req: true })}
          ${fld('group', 'mt.f.group', f, { req: true, hint: t('mt.f.eg', { v: groupsOf(f.cat).slice(0, 3).join(', ') || 'Thép xây dựng' }), ph: groupsOf(f.cat)[0] || '' })}
          ${fld('name', 'mt.f.name', f, { req: true })}
          ${fld('en', 'mt.f.en', f, { req: true })}
          ${fld('uom', 'mt.f.uom', f, { req: true })}
          ${fld('alt', 'mt.f.alt', f, { hint: t('mt.f.altHint') })}
          ${fld('diameter', 'mt.f.diameter', f)}
          ${fld('grade', 'mt.f.grade', f)}
          ${fld('hs', 'mt.f.hs', f, { mono: true })}
          ${fld('lead', 'mt.f.lead', f)}
          ${fld('moq', 'mt.f.moq', f)}
        </div>
        <fieldset class="fs"><legend>${esc(t('mt.f.certs'))}</legend>${certOpts.map((c) => `<label class="chk"><input type="checkbox" name="certs" value="${esc(c)}"${f.certs.includes(c) ? ' checked' : ''}> ${esc(tv(c))} <span class="muted small">· ${esc(tv(certAt(c)))}</span></label>`).join('')}</fieldset>
        <div class="form-grid">
          ${fld('vat', 'mt.f.vat', f, { options: [['0', '0%'], ['5', '5%'], ['8', t('mt.vat8')], ['10', '10%'], ['KCT', t('mt.kct')]], req: true })}
          ${fld('vat8', 'mt.f.vat8', f, { options: [['No', t('c.no')], ['Yes', t('c.yes')]], hint: vat8Hint(metal) })}
          <div class="field"><span class="lbl">${esc(t('mt.f.fin'))}</span><span>${pill(t('mt.f.finPend'), 'warning')}</span><span class="hint">${esc(t('mt.f.finHint'))}</span></div>
        </div>
        <div class="form-grid">${fld('attType', 'mt.f.attType', f, { options: ['Spec sheet', 'Datasheet', 'Certificate', 'Drawing'] })}${fld('attName', 'mt.f.att', f)}</div>
        ${dupBox(f)}
        <div class="row-acts"><a class="btn" href="#/materials" data-mm="cancel">${esc(t('c.cancel'))}</a><button type="button" class="btn" data-mm="check">${esc(t('mt.check'))}</button><button type="button" class="btn" data-mm="draft">${esc(t('c.saveDraft'))}</button><button type="submit" class="btn btn-p">${esc(t('mt.submit'))}</button></div>
        <p class="muted small">${esc(t('mt.route'))}</p>
      </form>`);
  }

  function list() {
    const q = st.q.trim();
    const rows = D().materials.filter((m) => (!q || [m.id, m.name, m.en, m.hs, m.group].some((x) => App.matches(x, q)))
      && (st.cat === 'all' || m.cat === st.cat) && (st.group === 'all' || m.group === st.group) && (st.status === 'all' || m.status === st.status)
      && (st.vat === 'all' || String(m.vat) === st.vat) && (!st.single || (m.status === 'Active' && eligibleVendors(m).length === 1)));
    const groups = [...new Set(D().materials.map((m) => m.group))].sort();
    const sel = (k, label, opts) => `<label class="sr" for="mf-${k}">${esc(label)}</label><select class="inp" id="mf-${k}" data-mf="${k}"><option value="all">${esc(t('c.allOf', { label }))}</option>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, tv(o)]; return `<option value="${esc(v)}"${st[k] === v ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    return block(t('mt.title'), `<div class="filters">
        <label class="sr" for="mf-q">${esc(t('c.search'))}</label><input class="inp grow" id="mf-q" data-mf="q" type="search" value="${esc(st.q)}" placeholder="${esc(t('mt.searchPh'))}">
        ${sel('cat', t('c.category'), CATS.map((k) => [k, t('cat.' + k)]))}${sel('group', t('mt.group'), groups)}${sel('status', t('c.status'), ['Active', 'Pending approval', 'Draft', 'Blocked'])}
        ${sel('vat', 'VAT', [['0', '0%'], ['5', '5%'], ['8', '8%'], ['10', '10%'], ['KCT', 'KCT']])}
        <label class="chk"><input type="checkbox" data-mf="single"${st.single ? ' checked' : ''}> ${esc(t('mt.singleOnly'))}</label></div>
      ${table([
        { h: t('c.mid'), r: (m) => mid(m.id), w: '120px' },
        { h: t('c.description'), r: (m) => `${esc(m.name)}<div class="small muted" lang="en">${esc(m.en)}</div>`, w: 'minmax(200px,2.2fr)' },
        { h: t('mt.c.catGroup'), r: (m) => `${esc(t('cat.' + m.cat))}<div class="small muted">${esc(m.group)}</div>` },
        { h: t('c.uom'), k: 'uom', w: '80px' },
        { h: 'VAT', r: (m) => `${esc(m.vat === 'KCT' ? 'KCT' : m.vat + '%')}${m.vat === 8 ? `<div class="small muted">${esc(t('mt.c.reduced'))}</div>` : ''}${m.vatConfirmed ? '' : `<div class="small tone-warning">${esc(t('mt.c.finPending'))}</div>`}`, w: '110px' },
        { h: t('c.lastPrice'), r: (m) => (m.last ? vnd(m.last) + `<div class="small muted mono">${esc(m.lastPo)}</div>` : '<span class="muted">—</span>'), cls: 'num', w: '150px' },
        { h: t('c.vendors'), r: (m) => { const n = eligibleVendors(m).length; return `${n}${m.status === 'Active' && n === 1 ? ' ' + pill(t('mt.k.single'), 'warning') : ''}`; }, w: '130px' },
        { h: t('mt.c.contracts'), r: (m) => (m.contracts.length ? m.contracts.map((c) => `<a class="mono small" href="#/contracts/${esc(c)}">${esc(c)}</a>`).join('<br>') : '<span class="muted">—</span>'), w: '120px' },
        { h: t('c.status'), r: (m) => pill(m.status, statusTone(m.status)) + (m.step ? `<div class="small muted">${esc(tv(m.step))}</div>` : ''), w: '140px' }
      ], rows, { min: 1180, empty: t('mt.empty'), label: t('mt.title') })}
      <p class="muted small">${esc(t('mt.showing', { n: rows.length, total: num(D().materialStats.total) }))}</p>`,
    { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('mt.importMsg'))}">${esc(t('c.import'))}</button><button class="btn btn-sm" data-act="toast" data-msg="${esc(t('c.exported', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }

  const numbering = () => block(t('mt.numbering'), `<p class="small">${esc(t('mt.numberingNote'))}</p>` + table([
    { h: t('c.category'), r: (c) => `<b class="mono">${c.code}</b> ${esc(t('cat.' + c.code))}` }, { h: t('mt.range'), r: (c) => `<span class="mono small">${c.range[0]}–${c.range[1]}</span>` }, { h: t('mt.next'), r: (c) => `<span class="mono small">${c.code}-${c.next}</span>` }
  ], D().categories, { min: 340, label: t('mt.numbering') }), { span: 6 });
  const vatRules = () => block(t('mt.vatRules'), `<ul class="plain small rule-list"><li>${esc(t('mt.v1'))}</li><li>${esc(t('mt.v2'))}</li><li>${esc(t('mt.v3'))} ${mid('CON-24015')} ${mid('CON-24020')}</li><li>${esc(t('mt.v4'))}</li></ul>`, { span: 6 });
  const flow = () => block(t('mt.flow'), `<ol class="flow"><li><b>${esc(t('mt.fl.req'))}</b><span class="small muted">${esc(t('mt.fl.reqN'))}</span></li><li><b>${esc(t('mt.fl.owner'))}</b><span class="small muted">${esc(t('mt.fl.ownerN'))}</span></li><li><b>${esc(t('mt.fl.admin'))}</b><span class="small muted">${esc(t('mt.fl.adminN'))}</span></li></ol>
      <p class="small muted">${esc(t('mt.fl.sod'))} ${D().materials.filter((m) => m.status === 'Pending approval').map((m) => mid(m.id) + ' ' + esc(tv(m.step || ''))).join(', ') || esc(t('c.none'))}</p>`, { actions: `<a class="btn btn-sm" href="#/approvals">${esc(t('mt.myApprovals'))}</a>` });
  const log = () => block(t('mt.log'), `<ul class="log">${D().materialLog.map((l) => `<li><span class="small muted">${esc(l.at)} · ${esc(l.who)}</span><div>${mid(l.mat)} ${esc(tv(l.what))}</div></li>`).join('')}</ul>`);

  const SUBS = [['', 'mt.sub.list'], ['new', 'mt.sub.new'], ['rules', 'mt.sub.rules'], ['workflow', 'mt.sub.workflow'], ['log', 'mt.sub.log']];
  App.page('materials', {
    titleKey: 'mt.title', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const cur = App.sub(SUBS, subArg || '');
      const S = D().materialStats;
      const pend = D().materials.filter((m) => m.status === 'Pending approval').length;
      const blocks = cur === 'new' ? [requestForm()] : cur === 'rules' ? [numbering(), vatRules()] : cur === 'workflow' ? [flow()] : cur === 'log' ? [log()] : [list()];
      return layout({
        title: t('mt.title'), subtitle: esc(t('mt.subtitle')),
        actions: cur === 'new' ? '' : `<a class="btn btn-p" href="#/materials/new">${esc(t('mt.new'))}</a>`,
        alerts: App.unknownSub(SUBS, subArg),
        kpis: [kpi(t('mt.k.total'), num(S.total), esc(t('c.allCats'))), kpi(t('mt.k.active'), num(S.active), esc(t('mt.k.activeN'))), kpi(t('mt.k.pending'), num(S.pending), esc(t('c.inSample', { n: pend })), 'warning'), kpi(t('mt.k.single'), num(S.singleSource), esc(t('mt.k.singleN')), 'warning')],
        subnav: App.subnav('materials', SUBS, cur), blocks
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => {
        if (e.target.dataset.mf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('mf-q'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } }
        if (e.target.name === 'dupReason') st.dupReason = e.target.value;
      });
      root.addEventListener('change', (e) => {
        const k = e.target.dataset.mf;
        if (k && k !== 'q') { st[k] = k === 'single' ? e.target.checked : e.target.value; App.render(); return; }
        const form = e.target.closest('#nm-form');
        if (form && ['cat', 'group', 'uom', 'vat', 'vat8', 'diameter', 'name'].includes(e.target.name)) {
          st.f = readForm(root);
          if (e.target.name === 'vat8' && st.f.vat8 === 'Yes' && !METAL.test(st.f.group + st.f.name)) { st.f.vat = '8'; root.querySelector('#nm-vat').value = '8'; }
          if (e.target.name === 'cat') {
            // New category: new number and group list; clear the old group (P1-13). Full re-render, then restore focus.
            st.f.group = '';
            App.render(); const c = document.getElementById('nm-cat'); c && c.focus();
            return;
          }
          // Update only the parts that depend on the changed field, so focus and the user's next click are kept (P1-03).
          const box = root.querySelector('#nm-dup-box'); if (box) box.outerHTML = dupBox(st.f);
          const h = root.querySelector('#nm-vat8-h'); if (h) h.textContent = vat8Hint(METAL.test(st.f.group + ' ' + st.f.name));
        }
      });
      root.addEventListener('click', (e) => {
        const el = e.target.closest('[data-mm]'); if (!el) return;
        const a = el.dataset.mm;
        if (a === 'cancel') { st.f = null; st.errs = {}; st.dupReason = ''; }
        if (a === 'check') { st.f = readForm(root); App.render(); App.toast(t(dupCheck(st.f).length ? 'mt.dupFound' : 'mt.noDupT')); }
        if (a === 'draft') { st.f = readForm(root); st.errs = validate(st.f, false); if (!Object.keys(st.errs).length) save('Draft'); else { App.render(); App.toast(t('mt.fixErrors')); } }
      });
      root.addEventListener('submit', (e) => {
        if (e.target.id !== 'nm-form') return; e.preventDefault();
        st.f = readForm(root); st.errs = validate(st.f, true);
        if (Object.keys(st.errs).length) { App.render(); const er = document.querySelector('.err'); er && er.scrollIntoView({ block: 'center' }); return; }
        save('Pending approval');
      });
    }
  });

  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  function save(status) {
    // Drafts never use a number (F-11, P1-04); the number is reserved only on submit.
    const f = st.f; const c = D().categories.find((x) => x.code === f.cat);
    let id;
    if (status === 'Draft') id = 'DRAFT-' + Date.now().toString(36).toUpperCase();
    else { id = `${f.cat}-${c.next}`; c.next += 1; }
    D().materials.unshift({ id, cat: f.cat, group: f.group, name: f.name, en: f.en, uom: f.uom, alt: f.alt ? [[f.alt.split('=')[1] ? f.alt.split('=')[1].trim().replace(/^[\d.,]+\s*/, '') : f.alt, f.alt]] : [], status, step: status === 'Draft' ? null : 'Step 1 of 3',
      hs: f.hs, lead: +f.lead || 0, moq: f.moq, spec: [['Diameter', f.diameter ? f.diameter + ' mm' : '—'], ['Grade', f.grade || '—']].filter((s) => s[1] !== '—'),
      vat: f.vat === 'KCT' ? 'KCT' : +f.vat, vat8: f.vat8 === 'Yes', vatConfirmed: null, last: null, lastPo: null, avg90: null, avg12: null, vendors: [], contracts: [],
      certs: f.certs.map((x) => [x, certAt(x)]),
      otif: [0, 0], spendYtd: 0, owner: me(), created: D().today, dupNote: st.dupReason });
    D().materialLog.unshift({ at: D().today + ' 10:30', mat: id, who: me(), what: status === 'Draft' ? 'Saved as draft' : 'Submitted for approval · number reserved · routed to Material master owner' });
    D().attachments.push({ id: 'ATT-' + id, mat: id, type: f.attType, name: f.attName, ver: 'v1', date: D().today });
    st.f = null; st.errs = {}; st.dupReason = '';
    location.hash = '#/materials'; App.render(); App.toast(status === 'Draft' ? t('mt.draftSaved', { id }) : t('mt.submitted', { id }));
  }
})();

/* Module 7 · Certificates — F-36 register (per vendor & Material ID), F-37 review supplier uploads (Approve & unblock),
   F-38 block rule for expired mandatory certificates, F-39 90-day expiry timeline with 60/30-day reminders.
   Routes: #/certificates (?vendor=, ?mat=, ?id=) · sub-functions /review(?id=), /expiring, /blocks, /upload */
(function () {
  const { esc, num, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'ce.title': ['Certificates', 'Chứng chỉ'], 'ce.subtitle': ['Vendor certificates by Material ID · mandatory ones block the vendor – Material ID pair when they expire', 'Chứng chỉ NCC theo mã vật tư · chứng chỉ bắt buộc hết hạn sẽ chặn cặp NCC – mã vật tư'],
    'ce.uploadBtn': ['Upload certificate', 'Tải lên chứng chỉ'], 'ce.sub.register': ['Register', 'Sổ chứng chỉ'], 'ce.sub.review': ['Review uploads', 'Duyệt tệp tải lên'], 'ce.sub.expiring': ['Expiring', 'Sắp hết hạn'], 'ce.sub.blocks': ['Block rule', 'Quy tắc chặn'], 'ce.sub.upload': ['Upload', 'Tải lên'],
    'ce.k.valid': ['Valid', 'Còn hiệu lực'], 'ce.k.expiring': ['Expiring ≤ 30 days', 'Hết hạn ≤ 30 ngày'], 'ce.k.expired': ['Expired', 'Hết hạn'], 'ce.k.blocked': ['{n} blocked pairs', '{n} cặp bị chặn'], 'ce.k.pending': ['Pending review', 'Chờ xem xét'], 'ce.k.uploads': ['supplier uploads', 'NCC tải lên'],
    'ce.expiredAgo': ['expired {n} days ago', 'đã hết hạn {n} ngày'], 'ce.left': ['{n} days left', 'còn {n} ngày'],
    'ce.register': ['Certificate register', 'Sổ chứng chỉ'], 'ce.searchLbl': ['Search certificates', 'Tìm chứng chỉ'], 'ce.searchPh': ['Search number, vendor or Material ID', 'Tìm số, NCC hoặc mã vật tư'], 'ce.holder': ['Holder', 'Chủ sở hữu'],
    'ce.mandOnly': ['Mandatory only', 'Chỉ chứng chỉ bắt buộc'], 'ce.c.cert': ['Certificate', 'Chứng chỉ'], 'ce.c.scope': ['Scope · Material IDs', 'Phạm vi · mã vật tư'], 'ce.mandFor': ['Mandatory for {m}', 'Bắt buộc cho {m}'], 'ce.notMand': ['Not mandatory', 'Không bắt buộc'],
    'ce.c.issuer': ['Issuer', 'Tổ chức cấp'], 'ce.c.expiry': ['Expiry', 'Hết hạn'], 'ce.c.verified': ['Verified', 'Xác minh'], 'ce.uploadedAt': ['Uploaded {v}', 'Tải lên {v}'], 'ce.review': ['Review', 'Xem xét'],
    'ce.empty': ['No certificates match these filters', 'Không có chứng chỉ phù hợp bộ lọc'], 'ce.showing': ['Showing {n} of {total} certificates (sample loaded)', 'Hiển thị {n} / {total} chứng chỉ (dữ liệu mẫu)'],
    'ce.rvTitle': ['Review upload · {t} · {v}', 'Xem xét tệp · {t} · {v}'], 'ce.preview': ['PDF preview · page 1 of 2 · uploaded {v}', 'Xem trước PDF · trang 1/2 · tải lên {v}'], 'ce.previewLbl': ['PDF preview', 'Xem trước PDF'],
    'ce.f.no': ['Certificate number', 'Số chứng chỉ'], 'ce.f.body': ['Certification body', 'Tổ chức chứng nhận'], 'ce.f.holder': ['Holder (as printed)', 'Chủ sở hữu (theo chứng chỉ)'], 'ce.f.expiry': ['Expiry date', 'Ngày hết hạn'],
    'ce.scope': ['Scope', 'Phạm vi'], 'ce.replaces': ['replaces {id}', 'thay thế {id}'], 'ce.checklist': ['Checklist', 'Danh mục kiểm tra'], 'ce.ck.holder': ['Holder name matches the vendor master', 'Tên chủ sở hữu khớp hồ sơ NCC'],
    'ce.ck.scope': ['Scope covers {m} requiring {t}', 'Phạm vi bao gồm {m} cần {t}'], 'ce.ck.theMats': ['the Material IDs', 'các mã vật tư'], 'ce.ck.expiry': ['Expiry date is after today', 'Ngày hết hạn sau hôm nay'],
    'ce.pass': ['Pass', 'Đạt'], 'ce.fail': ['Fail', 'Không đạt'], 'ce.auto': ['auto', 'tự động'], 'ce.ck.acc': ['Certification body is accredited (BoA / IAF member) checked', 'Đã kiểm tra tổ chức chứng nhận được công nhận (BoA / thành viên IAF)'],
    'ce.ck.gap': ['Validity gap noted (old certificate expired {d})', 'Đã ghi nhận khoảng trống hiệu lực (chứng chỉ cũ hết hạn {d})'], 'ce.f.reason': ['Reject reason (required to reject)', 'Lý do từ chối (bắt buộc khi từ chối)'], 'ce.f.comment': ['Comment to supplier', 'Ghi chú gửi NCC'],
    'ce.approve': ['Approve & unblock', 'Duyệt & bỏ chặn'], 'ce.approveNote': ['Approving sets the certificate Valid, records you as verifier and lifts the block on {id} for the Material IDs it covers.', 'Khi duyệt, chứng chỉ chuyển Còn hiệu lực, ghi nhận bạn là người xác minh và bỏ chặn {id} cho các mã vật tư trong phạm vi.'],
    'ce.e.no': ['Certificate number is required.', 'Bắt buộc nhập số chứng chỉ.'], 'ce.e.body': ['Certification body is required.', 'Bắt buộc nhập tổ chức chứng nhận.'], 'ce.e.after': ['Expiry must be after today.', 'Ngày hết hạn phải sau hôm nay.'],
    'ce.e.holder': ['Holder must match the vendor master ({v}).', 'Chủ sở hữu phải khớp hồ sơ NCC ({v}).'], 'ce.e.both': ['Tick both manual checks before approving.', 'Đánh dấu cả hai kiểm tra thủ công trước khi duyệt.'], 'ce.e.acc': ['Tick the accreditation check before approving.', 'Đánh dấu kiểm tra công nhận trước khi duyệt.'],
    'ce.e.reason': ['Choose a reason to reject.', 'Chọn lý do từ chối.'], 'ce.rejected': ['{t} rejected · {c} notified', 'Đã từ chối {t} · đã thông báo {c}'], 'ce.approved': ['{t} approved', 'Đã duyệt {t}'], 'ce.unblocked': [' · {id} unblocked for {m}', ' · đã bỏ chặn {id} cho {m}'],
    'ce.upTitle': ['Upload certificate', 'Tải lên chứng chỉ'], 'ce.f.vendor': ['Holder (vendor)', 'Chủ sở hữu (NCC)'], 'ce.f.type': ['Certificate type', 'Loại chứng chỉ'], 'ce.f.scope': ['Scope · Material ID', 'Phạm vi · mã vật tư'], 'ce.f.file': ['File', 'Tệp'],
    'ce.f.fileHint': ['PDF · stored as v1', 'PDF · lưu là v1'], 'ce.upForReview': ['Upload for review', 'Tải lên để duyệt'], 'ce.e.expired': ['This certificate has already expired.', 'Chứng chỉ này đã hết hạn.'], 'ce.e.pdf': ['Upload a PDF file.', 'Hãy tải lên tệp PDF.'],
    'ce.e.dupNo': ['This certificate number is already registered.', 'Số chứng chỉ này đã được đăng ký.'], 'ce.uploadedT': ['{id} uploaded · Pending review', 'Đã tải lên {id} · Chờ xem xét'],
    'ce.timeline': ['Expiring in the next 90 days', 'Hết hạn trong 90 ngày tới'], 'ce.daysLeftLbl': ['{n} days left', 'còn {n} ngày'], 'ce.tlNote': ['Orange = 30 days or less. The vendor and the certificate owner are reminded at 60 and 30 days; on expiry the status becomes Expired.', 'Màu cam = còn 30 ngày trở xuống. NCC và người phụ trách được nhắc ở mốc 60 và 30 ngày; khi hết hạn trạng thái chuyển Hết hạn.'],
    'ce.tlNone': ['Nothing expires in the next 90 days', 'Không có chứng chỉ hết hạn trong 90 ngày tới'], 'ce.d': ['{n} d · {e}', '{n} ngày · {e}'],
    'ce.block': ['Block rule · expired mandatory certificates', 'Quy tắc chặn · chứng chỉ bắt buộc hết hạn'], 'ce.blockNote': ['When a certificate that a Material ID requires expires, the vendor is blocked for that Material ID: no new POs or awards, its bid on that line is marked Non-compliant at opening, and open POs continue.', 'Khi chứng chỉ mà mã vật tư yêu cầu hết hạn, NCC bị chặn với mã đó: không tạo PO hay trao thầu mới, hồ sơ thầu dòng đó bị đánh dấu Không đạt khi mở thầu; PO đang mở vẫn tiếp tục.'],
    'ce.reason': ['Reason', 'Lý do'], 'ce.expiredOn': ['{t} expired {d}', '{t} hết hạn {d}'], 'ce.renewPending': ['Renewal pending review', 'Bản gia hạn chờ xem xét'], 'ce.blockedPairs': ['Blocked vendor – Material ID pairs', 'Các cặp NCC – mã vật tư bị chặn'], 'ce.noBlock': ['No vendor – Material ID pair is blocked.', 'Không có cặp NCC – mã vật tư nào bị chặn.'],
    'ce.pending': ['Pending supplier uploads', 'Tệp NCC tải lên chờ duyệt'], 'ce.noPending': ['No uploads waiting for review.', 'Không có tệp nào chờ duyệt.']
  });
  const TYPES = ['ISO 9001', 'ISO 14001', 'ISO 45001', 'Hợp quy QCVN 7:2019/BKHCN', 'Hợp quy QCVN 16:2023/BXD', 'CO/CQ per lot', 'Test report'];
  const REJECT = ['Holder name does not match the vendor master', 'Scope does not cover the Material ID', 'Certificate expired or dates unreadable', 'Certification body not accredited', 'Other (see comment)'];
  const st = { q: '', type: 'all', holder: 'all', status: 'all', mand: false, review: null, rv: null, rerr: {}, up: null, uerr: {} };
  const DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const validDate = (s) => { const m = DATE.exec(s); if (!m) return false; const d = App.dt(s); return d.getDate() === +m[1] && d.getMonth() + 1 === +m[2]; };
  const me = () => (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh';
  const requiredFor = (c) => c.mats.filter((m) => (App.material(m) || { certs: [] }).certs.some(([n]) => n === c.type));
  const statusOf = (c) => { if (['Pending review', 'Rejected', 'Superseded'].includes(c.status)) return c.status; const d = App.daysTo(c.expiry); return d < 0 ? 'Expired' : d <= 30 ? 'Expiring' : 'Valid'; };
  const sTone = (s) => ({ Valid: 'success', Expiring: 'warning', Expired: 'danger', 'Pending review': 'info', Rejected: 'danger' }[s] || 'neutral');
  const daysNote = (c) => { const d = App.daysTo(c.expiry); return d < 0 ? `<span class="small tone-danger">${esc(t('ce.expiredAgo', { n: -d }))}</span>` : `<span class="small ${d <= 60 ? 'tone-warning' : 'muted'}">${esc(t('ce.left', { n: d }))}</span>`; };
  const vname = (id) => App.vshort(App.vendor(id)) || id;
  // Blocked pairs (F-38): an expired certificate that a Material ID in scope requires blocks that vendor – Material ID pair, unless a valid replacement exists.
  const blocks = () => D().certificates.filter((c) => statusOf(c) === 'Expired').flatMap((c) => requiredFor(c).filter((m) => !D().certificates.some((x) => x !== c && x.vendor === c.vendor && x.type === c.type && x.mats.includes(m) && ['Valid', 'Expiring'].includes(statusOf(x)))).map((m) => ({ c, m })));
  const E = (e) => (e ? (Array.isArray(e) ? t(e[0], e[1]) : t(e)) : '');
  const fld = (pre, errs, n, label, val, o = {}) => App.field(`${pre}-${n}`, t(label), val, Object.assign({ name: n, err: E(errs[n]) }, o));
  const read = (root, sel) => { const o = {}; root.querySelectorAll(`${sel} [name]`).forEach((el) => { o[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim(); }); return o; };

  /* ---------- Register (F-36) ---------- */
  function register() {
    const q = st.q.trim(); const C = D().certificates;
    const rows = C.filter((c) => { const v = App.vendor(c.vendor) || {}; return (!q || [c.id, c.no, c.type, v.name, c.vendor, ...c.mats].some((x) => App.matches(x, q)))
      && (st.type === 'all' || c.type === st.type) && (st.holder === 'all' || c.vendor === st.holder) && (st.status === 'all' || statusOf(c) === st.status) && (!st.mand || requiredFor(c).length); });
    const sel = (k, label, opts) => `<label class="sr" for="cf-${k}">${esc(label)}</label><select class="inp" id="cf-${k}" data-cf="${k}"><option value="all">${esc(t('c.allOf', { label }))}</option>${opts.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, tv(o)]; return `<option value="${esc(v)}"${st[k] === v ? ' selected' : ''}>${esc(l)}</option>`; }).join('')}</select>`;
    return block(t('ce.register'), `<div class="filters"><label class="sr" for="cf-q">${esc(t('ce.searchLbl'))}</label><input class="inp grow" id="cf-q" data-cf="q" type="search" value="${esc(st.q)}" placeholder="${esc(t('ce.searchPh'))}">
      ${sel('type', t('c.type'), [...new Set(C.map((c) => c.type))])}${sel('holder', t('ce.holder'), [...new Set(C.map((c) => c.vendor))].map((id) => [id, `${id} · ${vname(id)}`]))}${sel('status', t('c.status'), ['Valid', 'Expiring', 'Expired', 'Pending review', 'Superseded', 'Rejected'])}
      <label class="chk"><input type="checkbox" data-cf="mand"${st.mand ? ' checked' : ''}> ${esc(t('ce.mandOnly'))}</label></div>
      ${table([
        { h: t('ce.c.cert'), r: (c) => `<b>${esc(tv(c.type))}</b><div class="small muted mono">${esc(c.no)}</div>`, w: 'minmax(170px,1.8fr)' },
        { h: t('ce.holder'), r: (c) => `<a href="#/vendors/${esc(c.vendor)}"><span class="mono small">${esc(c.vendor)}</span> ${esc(vname(c.vendor))}</a>`, w: 'minmax(150px,1.3fr)' },
        { h: t('ce.c.scope'), r: (c) => `<div class="chips">${c.mats.map(mid).join('')}</div>${requiredFor(c).length ? `<div class="small">${esc(t('ce.mandFor', { m: requiredFor(c).join(', ') }))}</div>` : `<div class="small muted">${esc(t('ce.notMand'))}</div>`}`, w: 'minmax(190px,1.7fr)' },
        { h: t('ce.c.issuer'), r: (c) => esc(c.issuer), w: 'minmax(140px,1.2fr)' },
        { h: t('ce.c.expiry'), r: (c) => `${esc(c.expiry)}<div>${daysNote(c)}</div>`, w: '140px' },
        { h: t('ce.c.verified'), r: (c) => (c.verified ? `<span class="small">${esc(c.verified)}</span>` : c.uploaded ? `<span class="small muted">${esc(t('ce.uploadedAt', { v: tv(c.uploaded) }))}</span>` : '—'), w: 'minmax(150px,1.3fr)' },
        { h: t('c.status'), r: (c) => pill(statusOf(c), sTone(statusOf(c))) + (statusOf(c) === 'Pending review' ? `<div><a class="small" href="#/certificates/review?id=${esc(c.id)}">${esc(t('ce.review'))}</a></div>` : ''), w: '150px' }
      ], rows, { empty: t('ce.empty'), label: t('ce.register') })}
      <p class="small muted">${esc(t('ce.showing', { n: rows.length, total: num(Object.values(D().certStats).reduce((a, x) => a + x, 0)) }))}</p>`,
    { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('c.exported', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }

  /* ---------- Review upload (F-37) ---------- */
  function pendingList() {
    const P = D().certificates.filter((c) => c.status === 'Pending review');
    return block(t('ce.pending'), P.length ? table([
      { h: t('ce.c.cert'), r: (c) => `<b>${esc(tv(c.type))}</b><div class="small muted mono">${esc(c.no)}</div>`, w: 'minmax(190px,1.8fr)' },
      { h: t('ce.holder'), r: (c) => `<span class="mono small">${esc(c.vendor)}</span> ${esc(vname(c.vendor))}`, w: 'minmax(150px,1.3fr)' },
      { h: t('ce.c.scope'), r: (c) => `<div class="chips">${c.mats.map(mid).join('')}</div>`, w: 'minmax(150px,1.3fr)' },
      { h: t('c.uploaded'), r: (c) => esc(c.uploaded ? tv(c.uploaded) : '—'), w: 'minmax(150px,1.3fr)' },
      { h: '', r: (c) => `<a class="btn btn-sm btn-p" href="#/certificates/review?id=${esc(c.id)}">${esc(t('ce.review'))}</a>`, w: '110px' }
    ], P, { min: 760, label: t('ce.pending') }) : `<div class="empty">${esc(t('ce.noPending'))}</div>`);
  }
  function review() {
    const c = D().certificates.find((x) => x.id === st.review); if (!c) return pendingList();
    const v = App.vendor(c.vendor) || { id: c.vendor, name: c.vendor, contact: '' }; const r = st.rv || (st.rv = { no: c.no, issuer: c.issuer, holder: v.name, expiry: c.expiry, acc: false, gap: false, reason: '', comment: '' }); const e = st.rerr;
    const need = D().materials.filter((m) => m.vendors.some((x) => x[0] === v.id) && m.certs.some(([n]) => n === c.type)).map((m) => m.id);
    const auto = [[t('ce.ck.holder'), App.norm(r.holder) === App.norm(v.name)], [t('ce.ck.scope', { m: need.length ? need.join(', ') : t('ce.ck.theMats'), t: tv(c.type) }), need.every((m) => c.mats.includes(m))], [t('ce.ck.expiry'), validDate(r.expiry) && App.daysTo(r.expiry) > 0]];
    const old = c.replaces && D().certificates.find((x) => x.id === c.replaces);
    return block(t('ce.rvTitle', { t: tv(c.type), v: v.name }), `<form id="cert-rv" novalidate class="stack">
      <div class="split-2"><div class="state" aria-label="${esc(t('ce.previewLbl'))}"><b>${esc(c.file || c.no + '.pdf')}</b><span class="muted small">${esc(t('ce.preview', { v: tv(c.uploaded) || '' }))}</span></div>
        <div class="stack">${fld('rv', e, 'no', 'ce.f.no', r.no, { req: true })}${fld('rv', e, 'issuer', 'ce.f.body', r.issuer, { req: true })}${fld('rv', e, 'holder', 'ce.f.holder', r.holder, { req: true })}${fld('rv', e, 'expiry', 'ce.f.expiry', r.expiry, { req: true, ph: 'dd/mm/yyyy' })}</div></div>
      <div><b class="small">${esc(t('ce.scope'))}</b> <span class="chips chips-inline">${c.mats.map(mid).join('')}</span>${c.replaces ? ` <span class="small muted">· ${esc(t('ce.replaces', { id: c.replaces }))}</span>` : ''}</div>
      <fieldset class="fs"><legend>${esc(t('ce.checklist'))}</legend>
        ${auto.map(([l, ok]) => `<div class="small">${pill(t(ok ? 'ce.pass' : 'ce.fail'), ok ? 'success' : 'danger')} ${esc(l)} <span class="muted">· ${esc(t('ce.auto'))}</span></div>`).join('')}
        <label class="chk"><input type="checkbox" name="acc"${r.acc ? ' checked' : ''}> ${esc(t('ce.ck.acc'))}</label>
        ${old ? `<label class="chk"><input type="checkbox" name="gap"${r.gap ? ' checked' : ''}> ${esc(t('ce.ck.gap', { d: old.expiry }))}</label>` : ''}
        ${e.checks ? `<span class="err" role="alert">${esc(E(e.checks))}</span>` : ''}</fieldset>
      <div class="form-grid">${fld('rv', e, 'reason', 'ce.f.reason', r.reason, { options: [['', t('c.choose')]].concat(REJECT.map((x) => [x, tv(x)])) })}${fld('rv', e, 'comment', 'ce.f.comment', r.comment, { area: true })}</div>
      <div class="row-acts"><a class="btn" href="#/certificates/review" data-cert="rv-close">${esc(t('c.close'))}</a><button type="button" class="btn btn-d" data-cert="reject">${esc(t('c.reject'))}</button><button type="submit" class="btn btn-p">${esc(t('ce.approve'))}</button></div>
      <p class="small muted m-0">${esc(t('ce.approveNote', { id: v.id }))}</p></form>`);
  }
  function decide(root, approve) {
    const c = D().certificates.find((x) => x.id === st.review); if (!c) return; const v = App.vendor(c.vendor) || { id: c.vendor, name: c.vendor, contact: '', riskReasons: [] };
    const r = Object.assign(st.rv, read(root, '#cert-rv')); const e = {};
    if (approve) {
      if (!r.no) e.no = 'ce.e.no'; if (!r.issuer) e.issuer = 'ce.e.body';
      if (!validDate(r.expiry)) e.expiry = 'c.dateFmt'; else if (App.daysTo(r.expiry) <= 0) e.expiry = 'ce.e.after';
      if (App.norm(r.holder) !== App.norm(v.name)) e.holder = ['ce.e.holder', { v: v.name }];
      if (!r.acc || (c.replaces && !r.gap)) e.checks = c.replaces ? 'ce.e.both' : 'ce.e.acc';
    } else if (!r.reason) e.reason = 'ce.e.reason';
    st.rerr = e; if (Object.keys(e).length) { App.render(); const x = document.querySelector('#cert-rv [aria-invalid=true], #cert-rv .err'); if (x) { if (x.focus) x.focus(); x.scrollIntoView({ block: 'center' }); } return; }
    const cs = D().certStats; if (cs.pending > 0) cs.pending--;
    if (!approve) { c.status = 'Rejected'; c.rejectReason = r.reason; st.review = null; st.rv = null; location.hash = '#/certificates/review'; App.toast(t('ce.rejected', { t: tv(c.type), c: v.contact })); return; }
    cs.valid++;
    Object.assign(c, { no: r.no, issuer: r.issuer, expiry: r.expiry, status: 'Valid', verified: `${me()} · ${D().today}` });
    const old = c.replaces && D().certificates.find((x) => x.id === c.replaces); if (old) old.status = 'Superseded';
    const unblocked = [];
    c.mats.forEach((m) => { const mat = App.material(m); const link = mat && mat.vendors.find((x) => x[0] === v.id); if (link && link[1] === 'Blocked') { link[1] = v.status === 'Probation' ? 'Probation' : 'Approved'; link.length = 5; unblocked.push(m); } });
    if (v.riskReasons) v.riskReasons = v.riskReasons.filter((x) => !x.includes(c.type));
    D().notifications.unshift({ id: 'N-' + Date.now(), type: 'Certificate', text: `${c.type} of ${v.name} verified — ${unblocked.length ? 'unblocked for ' + unblocked.join(', ') : 'no block to lift'}`, doc: v.id, mats: c.mats, at: D().today + ' 10:30', read: true, action: 'Open', href: '#/certificates' });
    st.review = null; st.rv = null; location.hash = '#/certificates'; App.toast(t('ce.approved', { t: tv(c.type) }) + (unblocked.length ? t('ce.unblocked', { id: v.id, m: unblocked.join(', ') }) : ''));
  }

  /* ---------- Upload (F-36) ---------- */
  function upload() {
    const u = st.up || (st.up = { vendor: 'V-1001', type: 'ISO 9001', no: '', issuer: '', mat: 'CON-24015', expiry: '', file: '' }); const e = st.uerr;
    return block(t('ce.upTitle'), `<form id="cert-up" novalidate class="stack"><div class="form-grid">
      ${fld('cu', e, 'vendor', 'ce.f.vendor', u.vendor, { options: D().vendors.map((v) => [v.id, `${v.id} · ${App.vshort(v)}`]), req: true })}
      ${fld('cu', e, 'type', 'ce.f.type', u.type, { options: TYPES, req: true })}
      ${fld('cu', e, 'no', 'ce.f.no', u.no, { req: true })}
      ${fld('cu', e, 'issuer', 'ce.f.body', u.issuer, { req: true })}
      ${fld('cu', e, 'mat', 'ce.f.scope', u.mat, { options: D().materials.filter((m) => m.status === 'Active').map((m) => [m.id, `${m.id} · ${m.name}`]), req: true })}
      ${fld('cu', e, 'expiry', 'ce.f.expiry', u.expiry, { req: true, ph: 'dd/mm/yyyy' })}
      ${fld('cu', e, 'file', 'ce.f.file', u.file, { req: true, ph: 'ISO9001_2026.pdf', hint: t('ce.f.fileHint') })}</div>
      <div class="row-acts"><a class="btn" href="#/certificates" data-cert="up-cancel">${esc(t('c.cancel'))}</a><button type="submit" class="btn btn-p">${esc(t('ce.upForReview'))}</button></div></form>`);
  }

  /* ---------- Timeline (F-39) & block rule (F-38) ---------- */
  function timeline() {
    const rows = D().certificates.filter((c) => !['Superseded', 'Rejected', 'Pending review'].includes(c.status)).map((c) => ({ c, d: App.daysTo(c.expiry) })).filter((x) => x.d >= 0 && x.d <= 90).sort((a, b) => a.d - b.d);
    return block(t('ce.timeline'), rows.length ? `<div class="hbars">${rows.map(({ c, d }) => `<div class="hbar"><div class="hbar-l"><b>${esc(tv(c.type))}</b> · <a href="#/vendors/${esc(c.vendor)}">${esc(vname(c.vendor))}</a> <span class="chips chips-inline">${c.mats.map(mid).join('')}</span></div>
        <div class="bar" role="img" aria-label="${esc(t('ce.daysLeftLbl', { n: d }))}"><span class="${d <= 30 ? 'warn' : ''}" style="width:${Math.max(3, (d / 90) * 100).toFixed(1)}%"></span></div><div class="hbar-v num ${d <= 30 ? 'tone-warning' : ''}">${esc(t('ce.d', { n: d, e: c.expiry }))}</div></div>`).join('')}</div>
      <p class="small muted">${esc(t('ce.tlNote'))}</p>` : `<div class="empty">${esc(t('ce.tlNone'))}</div>`);
  }
  function blockRule() {
    const B = blocks();
    return block(t('ce.block'), `<p class="small">${esc(t('ce.blockNote'))}</p>
      ${B.length ? table([
        { h: t('c.vendor'), r: (b) => `<a href="#/vendors/${esc(b.c.vendor)}">${esc(vname(b.c.vendor))}</a>`, w: 'minmax(110px,1fr)' }, { h: t('c.mid'), r: (b) => mid(b.m), w: '120px' },
        { h: t('ce.reason'), r: (b) => { const rn = D().certificates.find((x) => x.replaces === b.c.id && x.status === 'Pending review'); return `${esc(t('ce.expiredOn', { t: tv(b.c.type), d: b.c.expiry }))}${rn ? `<div><a class="small" href="#/certificates/review?id=${esc(rn.id)}">${esc(t('ce.renewPending'))}</a></div>` : ''}`; }, w: 'minmax(170px,1.6fr)' }
      ], B, { min: 420, label: t('ce.blockedPairs') }) : `<div class="alert alert-success">${esc(t('ce.noBlock'))}</div>`}`);
  }

  const SUBS = [['', 'ce.sub.register'], ['review', 'ce.sub.review'], ['expiring', 'ce.sub.expiring'], ['blocks', 'ce.sub.blocks'], ['upload', 'ce.sub.upload']];
  App.page('certificates', {
    titleKey: 'ce.title', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      if (p.vendor && st.lastV !== p.vendor) { st.holder = p.vendor; st.lastV = p.vendor; }
      if (p.mat && st.lastM !== p.mat) { st.q = p.mat; st.lastM = p.mat; }
      let cur = App.sub(SUBS, subArg || '');
      if (p.id) {
        const c = D().certificates.find((x) => x.id === p.id);
        if (c && c.status === 'Pending review') { cur = 'review'; if (st.review !== c.id) { st.review = c.id; st.rv = null; st.rerr = {}; } } else if (c && st.lastId !== p.id) { st.q = c.no; }
        st.lastId = p.id;
      } else if (cur === 'review') { st.review = null; st.rv = null; }
      const C = D().certificates; const n = (s) => C.filter((c) => statusOf(c) === s).length; const npend = n('Pending review');
      const items = SUBS.map((x) => (x[0] === 'review' && npend ? [x[0], x[1], String(npend)] : x));
      const bl = cur === 'review' ? [review()] : cur === 'expiring' ? [timeline()] : cur === 'blocks' ? [blockRule()] : cur === 'upload' ? [upload()] : [register()];
      return layout({
        title: t('ce.title'), subtitle: esc(t('ce.subtitle')),
        actions: cur === 'upload' ? '' : `<a class="btn btn-p" href="#/certificates/upload">${esc(t('ce.uploadBtn'))}</a>`,
        alerts: App.unknownSub(SUBS, subArg),
        kpis: [kpi(t('ce.k.valid'), num(D().certStats.valid), esc(t('c.inSample', { n: n('Valid') })), 'success'), kpi(t('ce.k.expiring'), num(D().certStats.expiring), esc(t('c.inSample', { n: n('Expiring') }) + ' · ' + C.filter((c) => statusOf(c) === 'Expiring').map((c) => vname(c.vendor)).join(', ')), 'warning'),
          kpi(t('ce.k.expired'), num(D().certStats.expired), esc(t('c.inSample', { n: n('Expired') }) + ' · ' + t('ce.k.blocked', { n: blocks().length })), 'danger'), kpi(t('ce.k.pending'), num(D().certStats.pending), esc(t('c.inSample', { n: npend }) + ' · ' + t('ce.k.uploads')))],
        subnav: App.subnav('certificates', items, cur), blocks: bl
      });
    },
    mount(root) {
      root.addEventListener('input', (e) => { if (e.target.dataset.cf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('cf-q'); if (i) { i.focus(); i.setSelectionRange(pos, pos); } } });
      root.addEventListener('change', (e) => { const k = e.target.dataset.cf; if (k && k !== 'q') { st[k] = k === 'mand' ? e.target.checked : e.target.value; App.render(); } });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'cert-rv') { e.preventDefault(); decide(root, true); }
        if (e.target.id === 'cert-up') {
          e.preventDefault(); const u = st.up = read(root, '#cert-up'); const er = {};
          if (!u.no) er.no = 'ce.e.no'; if (!u.issuer) er.issuer = 'ce.e.body';
          if (!validDate(u.expiry)) er.expiry = 'c.dateFmt'; else if (App.daysTo(u.expiry) <= 0) er.expiry = 'ce.e.expired';
          if (!/\.pdf$/i.test(u.file)) er.file = 'ce.e.pdf';
          if (D().certificates.some((c) => c.no.toLowerCase() === u.no.toLowerCase())) er.no = 'ce.e.dupNo';
          st.uerr = er; if (Object.keys(er).length) { App.render(); const x = document.querySelector('#cert-up [aria-invalid=true]'); x && x.focus(); return; }
          const id = 'CERT-' + String(Math.max(...D().certificates.map((c) => +c.id.slice(5))) + 1).padStart(4, '0');
          D().certificates.push({ id, type: u.type, no: u.no, vendor: u.vendor, mats: [u.mat], issuer: u.issuer, issued: D().today, expiry: u.expiry, status: 'Pending review', uploaded: `${me()} · ${D().today}`, file: u.file });
          st.up = null; st.uerr = {}; location.hash = '#/certificates/review'; App.toast(t('ce.uploadedT', { id }));
        }
      });
      root.addEventListener('click', (e) => {
        const el = e.target.closest('[data-cert]'); if (!el) return; const a = el.dataset.cert;
        if (a === 'rv-close') { st.review = null; st.rv = null; st.rerr = {}; }
        else if (a === 'reject') decide(root, false);
        else if (a === 'up-cancel') { st.up = null; st.uerr = {}; }
      });
    }
  });
})();

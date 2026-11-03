/* Module 10 · Approvals — F-56 inbox (Waiting for me / Delegated / History) with type filter, SLA age, step and bulk approve under 50.000.000 ₫,
   F-57 item detail (Material ID lines with last price + 90-day avg, budget impact, approval chain), F-58 Approve / Reject / Return with mandatory comment,
   F-59 delegation with "on behalf of" (R-06), F-60 SoD block + Admin override (R-18).
   Routes: #/approvals (?id=), #/approvals/delegated, #/approvals/history, #/approvals/delegation */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'ap.subtitle': ['Approving as {me}{admin} · SLA 2 working days per step', 'Duyệt với tư cách {me}{admin} · SLA 2 ngày làm việc mỗi bước'], 'ap.adminView': [' · Admin view of all pending items', ' · Quản trị xem mọi mục đang chờ'],
    'ap.sub.inbox': ['Waiting for me', 'Chờ tôi duyệt'], 'ap.sub.delegated': ['Delegated', 'Được ủy quyền'], 'ap.sub.history': ['History', 'Lịch sử'], 'ap.sub.settings': ['Delegation & SoD', 'Ủy quyền & SoD'],
    'ap.k.mine': ['Waiting for me', 'Chờ tôi duyệt'], 'ap.k.mineN': ['Same as the menu badge', 'Bằng số trên menu'], 'ap.k.due': ['Due within 24 h', 'Đến hạn trong 24 giờ'], 'ap.k.sod': ['Blocked — SoD', 'Bị chặn — SoD'], 'ap.k.sodN': ['Routed to another approver', 'Chuyển người duyệt khác'],
    'ap.k.dlg': ['Delegation', 'Ủy quyền'], 'ap.k.notSet': ['Not set', 'Chưa thiết lập'],
    'ap.sla.over': ['Overdue {h} h', 'Quá hạn {h} giờ'], 'ap.sla.h': ['Due in {h} h {m} min', 'Còn {h} giờ {m} phút'], 'ap.sla.d': ['Due in {d} d {h} h', 'Còn {d} ngày {h} giờ'],
    'ap.select': ['Select {id}', 'Chọn {id}'], 'ap.notElig': ['(not eligible for bulk approve)', '(không được duyệt hàng loạt)'], 'ap.sodWarn': ['SoD warning', 'Cảnh báo SoD'], 'ap.onBehalf': ['On behalf of {n}', 'Thay mặt {n}'],
    'ap.stepN': ['step {i}/{n}', 'bước {i}/{n}'], 'ap.review': ['Review', 'Xem xét'], 'ap.reviewing': ['Reviewing', 'Đang xem'], 'ap.reviewId': ['Review {id}', 'Xem xét {id}'], 'ap.queue': ['Approval queue', 'Hàng chờ duyệt'],
    'ap.allTypes': ['All types', 'Mọi loại'], 'ap.none': ['Nothing waiting for you', 'Không có mục nào chờ bạn'], 'ap.noneN': ['New items appear here and on the badge.', 'Mục mới sẽ hiện ở đây và trên menu.'],
    'ap.noDlg': ['No delegated items', 'Không có mục được ủy quyền'], 'ap.dlgRuns': ['Delegation to {to} runs {f} – {u}.', 'Ủy quyền cho {to} từ {f} – {u}.'], 'ap.noDlgSet': ['No delegation is set.', 'Chưa thiết lập ủy quyền.'],
    'ap.bulkNote': ['Bulk approve is allowed only for items under {v} without an SoD block. {n} eligible.', 'Chỉ duyệt hàng loạt các mục dưới {v} và không bị chặn SoD. {n} mục đủ điều kiện.'], 'ap.bulk': ['Approve selected · under 50.000.000 ₫', 'Duyệt mục đã chọn · dưới 50.000.000 ₫'],
    'ap.h.item': ['Item', 'Mục'], 'ap.h.decision': ['Decision', 'Quyết định'], 'ap.h.by': ['By', 'Người duyệt'], 'ap.h.comment': ['Comment', 'Ghi chú'], 'ap.h.ob': ['on behalf of {n}', 'thay mặt {n}'], 'ap.h.title': ['History ({n})', 'Lịch sử ({n})'],
    'ap.details': ['Details', 'Chi tiết'], 'ap.choose': ['Choose an item', 'Chọn một mục'], 'ap.chooseN': ['Open an item to see its lines, budget impact and approval chain.', 'Mở một mục để xem dòng, ảnh hưởng ngân sách và luồng duyệt.'],
    'ap.c.qty': ['Qty', 'SL'], 'ap.c.est': ['Est. price', 'Đơn giá ước tính'], 'ap.c.last': ['Last price', 'Giá gần nhất'], 'ap.c.avg': ['90-day avg', 'BQ 90 ngày'], 'ap.lines': ['Lines by Material ID', 'Dòng theo mã vật tư'],
    'ap.chip': ['last {l} · 90-day {a}', 'gần nhất {l} · 90 ngày {a}'], 'ap.budget': ['Budget impact', 'Ảnh hưởng ngân sách'], 'ap.b.line': ['Budget line', 'Dòng ngân sách'], 'ap.b.avail': ['Available', 'Còn khả dụng'], 'ap.b.this': ['This item', 'Mục này'], 'ap.b.after': ['After approval', 'Sau khi duyệt'],
    'ap.chain': ['Approval chain', 'Luồng duyệt'], 'ap.sodWarnTxt': ['you raised this item; approval is logged as an override (SoD rule set to Warn in Admin).', 'bạn là người tạo mục này; việc duyệt được ghi nhận là vượt quy tắc (quy tắc SoD đang ở chế độ Cảnh báo).'],
    'ap.sodBlock': ['Blocked — SoD.', 'Bị chặn — SoD.'], 'ap.sodBlockN': ['You raised this change order, so you cannot approve it. It is routed to Đỗ Hoàng Nam. Only an Admin can override, and the override is logged.', 'Bạn tạo lệnh thay đổi này nên không được duyệt. Mục được chuyển cho Đỗ Hoàng Nam. Chỉ Quản trị được vượt quy tắc và việc này được ghi nhật ký.'],
    'ap.ovr.reason': ['Override reason (Admin)', 'Lý do vượt quy tắc (Quản trị)'], 'ap.ovr.btn': ['Override SoD', 'Vượt quy tắc SoD'], 'ap.ovr.done': ['SoD overridden by {by} · {at}: “{r}” (audit logged)', 'SoD được vượt bởi {by} · {at}: “{r}” (đã ghi nhật ký)'],
    'ap.dec.h': ['Your decision', 'Quyết định của bạn'], 'ap.dec.c': ['Comment', 'Ghi chú'], 'ap.dec.hint': ['Optional to approve · required (at least 10 characters) to reject or return.', 'Không bắt buộc khi duyệt · bắt buộc (ít nhất 10 ký tự) khi từ chối hoặc trả lại.'],
    'ap.dec.as': ['Approving as {me}', 'Duyệt với tư cách {me}'], 'ap.dec.ob': [' on behalf of {n}', ' thay mặt {n}'], 'ap.dec.step': [' · step {i} of {n} · next: {x}', ' · bước {i}/{n} · tiếp theo: {x}'], 'ap.dec.final': ['final approval', 'duyệt cuối'],
    'ap.return': ['Return for changes', 'Trả lại để sửa'], 'ap.reject': ['Reject', 'Từ chối'], 'ap.approve': ['Approve', 'Duyệt'],
    'ap.open.pr': ['Open PR', 'Mở PR'], 'ap.open.tender': ['Open tender', 'Mở gói thầu'], 'ap.open.vendor': ['Open vendor', 'Mở NCC'], 'ap.open.po': ['Open PO', 'Mở PO'], 'ap.open.inv': ['Open invoice', 'Mở hóa đơn'],
    'ap.files': ['Attachments', 'Tệp đính kèm'], 'ap.reqBy': ['Requested by {by} · {v} · {step}', 'Người đề nghị {by} · {v} · {step}'], 'ap.noValue': ['no value', 'không có giá trị'], 'ap.exVat': ['{v} excl. VAT', '{v} chưa VAT'],
    'ap.dl.title': ['Delegate approvals', 'Ủy quyền duyệt'], 'ap.dl.to': ['Delegate to', 'Ủy quyền cho'], 'ap.dl.from': ['From', 'Từ ngày'], 'ap.dl.until': ['Until', 'Đến ngày'], 'ap.dl.max14': ['At most 14 days', 'Tối đa 14 ngày'],
    'ap.dl.cap': ['Value cap (₫)', 'Hạn mức giá trị (₫)'], 'ap.dl.capHint': ['At most 2.000.000.000 ₫ (your own limit)', 'Tối đa 2.000.000.000 ₫ (hạn mức của bạn)'], 'ap.dl.types': ['Document types', 'Loại chứng từ'], 'ap.dl.save': ['Save delegation', 'Lưu ủy quyền'],
    'ap.dl.card': ['Delegation', 'Ủy quyền'], 'ap.dl.delegate': ['Delegate', 'Người được ủy quyền'], 'ap.dl.period': ['Period', 'Thời gian'], 'ap.dl.active': ['Active', 'Đang hiệu lực'], 'ap.dl.sched': ['Scheduled', 'Đã lên lịch'], 'ap.dl.capL': ['Cap', 'Hạn mức'],
    'ap.dl.typesL': ['Types', 'Loại'], 'ap.dl.above': ['Above cap', 'Trên hạn mức'], 'ap.dl.goes': ['Goes to {n}', 'Chuyển cho {n}'], 'ap.dl.note': ['Items the delegate approves show “on behalf of {n}” in the history. The delegate cannot approve their own requests.', 'Mục do người được ủy quyền duyệt hiển thị “thay mặt {n}” trong lịch sử. Người được ủy quyền không được duyệt đề nghị của chính mình.'],
    'ap.dl.cancel': ['Cancel delegation', 'Hủy ủy quyền'], 'ap.dl.none': ['No delegation', 'Chưa ủy quyền'], 'ap.dl.noneN': ['Delegate while you are away: up to 14 days, capped value, chosen document types.', 'Ủy quyền khi vắng mặt: tối đa 14 ngày, có hạn mức giá trị, theo loại chứng từ.'],
    'ap.dl.e.to': ['Choose another internal user.', 'Chọn người dùng nội bộ khác.'], 'ap.dl.e.past': ['Start cannot be in the past.', 'Ngày bắt đầu không được ở quá khứ.'], 'ap.dl.e.order': ['Until must be on or after From.', 'Ngày kết thúc phải từ ngày bắt đầu trở đi.'],
    'ap.dl.e.max': ['Delegation can run at most 14 days (this is {d}).', 'Ủy quyền tối đa 14 ngày (hiện là {d}).'], 'ap.dl.e.cap': ['Enter a cap above 0.', 'Nhập hạn mức lớn hơn 0.'], 'ap.dl.e.capMax': ['The cap cannot exceed 2.000.000.000 ₫.', 'Hạn mức không được vượt 2.000.000.000 ₫.'], 'ap.dl.e.types': ['Choose at least one document type.', 'Chọn ít nhất một loại chứng từ.'],
    'ap.dl.saved': ['Approvals delegated to {to} · {f} – {u}', 'Đã ủy quyền duyệt cho {to} · {f} – {u}'], 'ap.dl.cancelled': ['Delegation cancelled', 'Đã hủy ủy quyền'],
    'ap.sod.title': ['SoD rules', 'Quy tắc SoD'], 'ap.sod.note': ['Applies to new Material ID requests too. Only an Admin can override; every override is written to the audit log.', 'Áp dụng cả cho đề nghị mã vật tư mới. Chỉ Quản trị được vượt quy tắc; mọi lần vượt đều ghi nhật ký.'], 'ap.sod.ovr': ['Overrides', 'Các lần vượt quy tắc'],
    'ap.e.self': ['You raised this item — another Admin must override.', 'Bạn tạo mục này — cần Quản trị khác vượt quy tắc.'], 'ap.e.reason': ['Give a reason of at least 10 characters.', 'Nhập lý do ít nhất 10 ký tự.'], 'ap.overridden': ['SoD overridden on {id} · audit logged', 'Đã vượt SoD cho {id} · đã ghi nhật ký'],
    'ap.e.reject': ['A comment of at least 10 characters is required to reject.', 'Cần ghi chú ít nhất 10 ký tự để từ chối.'], 'ap.e.return': ['A comment of at least 10 characters is required to return.', 'Cần ghi chú ít nhất 10 ký tự để trả lại.'],
    'ap.msg.step': ['{id} approved · step {i} of {n} → {a}', 'Đã duyệt {id} · bước {i}/{n} → {a}'], 'ap.msg.Approved': ['{id} approved', 'Đã duyệt {id}'], 'ap.msg.Rejected': ['{id} rejected', 'Đã từ chối {id}'], 'ap.msg.Returned': ['{id} returned', 'Đã trả lại {id}'],
    'ap.msg.ob': [' on behalf of {n}', ' thay mặt {n}'], 'ap.bulkDone': ['{n} item(s) approved', 'Đã duyệt {n} mục'], 'ap.bulkComment': ['Bulk approved (under 50.000.000 ₫)', 'Duyệt hàng loạt (dưới 50.000.000 ₫)']
  });
  I18N.values({
    'Award recommendation': 'Đề xuất trao thầu', 'PO approval': 'Duyệt PO', 'PO change order': 'Lệnh thay đổi PO', 'New Material ID': 'Mã vật tư mới', 'Vendor change': 'Thay đổi NCC', 'Delivery date change': 'Đổi ngày giao',
    Waiting: 'Đang chờ', Next: 'Tiếp theo', Raised: 'Đã tạo', 'Blocked — SoD': 'Bị chặn — SoD', Block: 'Chặn', Warn: 'Cảnh báo',
    'Material master owner': 'Chủ quản danh mục', 'Admin (publish)': 'Quản trị (công bố)', 'Approver step 1': 'Người duyệt bước 1', Supplier: 'Nhà cung cấp', 'Finance verification': 'Tài chính xác minh', 'Dept head (Kho A acting)': 'Trưởng bộ phận (quyền Kho A)',
    'Capex rule: EQP- above 1 tỷ ₫ adds the Finance Director': 'Quy tắc capex: EQP- trên 1 tỷ ₫ thêm Giám đốc Tài chính', 'Duplicate check passed': 'Đã qua kiểm tra trùng', 'Blocked — SoD: you raised this change order': 'Bị chặn — SoD: bạn đã tạo lệnh thay đổi này',
    'SoD: evaluator ≠ award approver': 'SoD: người chấm ≠ người duyệt trao thầu', 'Thép Minh Phát · new account Vietcombank ···· 5307': 'Thép Minh Phát · tài khoản mới Vietcombank ···· 5307', 'Container HCM–HN · price +2,7% vs PO': 'Container HCM–HN · giá +2,7% so với PO',
    'Capex rule: EQP- above 1 tỷ ₫': 'Quy tắc capex: EQP- trên 1 tỷ ₫', 'Requester cannot approve own change order → Đỗ Hoàng Nam': 'Người tạo không được tự duyệt lệnh thay đổi → Đỗ Hoàng Nam', 'Call-back to registered phone required': 'Cần gọi lại số điện thoại đã đăng ký',
    'Number reserved': 'Đã giữ số', 'SLA 2 working days': 'SLA 2 ngày làm việc', 'SoD: raiser cannot approve': 'SoD: người tạo không được duyệt', 'SLA 2 working days · SoD: raiser cannot approve': 'SLA 2 ngày làm việc · SoD: người tạo không được duyệt',
    'Accept price variance': 'Chấp nhận chênh lệch giá', 'Requester ≠ approver of the same PR / change order / Material ID request': 'Người đề nghị ≠ người duyệt cùng PR / lệnh thay đổi / đề nghị mã vật tư', 'Vendor creator ≠ vendor approver': 'Người tạo NCC ≠ người duyệt NCC',
    'PO buyer ≠ GRN receiver': 'Người mua PO ≠ người nhận GRN', 'Tender evaluator ≠ award approver': 'Người chấm thầu ≠ người duyệt trao thầu', 'SoD Warn mode · approved with warning': 'Chế độ Cảnh báo SoD · duyệt kèm cảnh báo', 'Tender creator ≠ sole evaluator': 'Người lập gói thầu ≠ người chấm duy nhất', 'Vendor master editor ≠ payment approver': 'Người sửa hồ sơ NCC ≠ người duyệt thanh toán',
    'Requester on leave; Finance Director approved by phone — logged per policy.': 'Người đề nghị nghỉ phép; Giám đốc Tài chính duyệt qua điện thoại — ghi nhận theo chính sách.'
  });
  I18N.patterns([[/^Step (\d+) of (\d+)$/, 'Bước $1/$2'], [/^Since (.+?) · SLA ends (.+)$/, 'Từ $1 · hết SLA $2'], [/^Since (.+)$/, 'Từ $1'], [/^SLA ends (.+)$/, 'Hết SLA $1'], [/^(.+) · (.+) on behalf of (.+)$/, '$1 · $2 thay mặt $3'],
    [/^Accepted by buyer (.+)$/, 'Người mua chấp nhận $1']]);
  const NOW = '02/11/2026 10:30';
  const st = { type: 'all', sel: null, picked: [], comment: '', cerr: '', dlg: null, derr: {}, ovr: null, oerr: '', lastId: null };
  const TYPES = ['PR approval', 'Award recommendation', 'PO approval', 'PO change order', 'New Material ID', 'Vendor change', 'Invoice exception', 'Delivery date change'];

  const ts = (s) => { const [d, tm = '00:00'] = s.split(' '); const x = App.dt(d); const [h, m] = tm.split(':').map(Number); x.setHours(h, m); return x; };
  const hoursLeft = (a) => (ts(a.sla) - ts(NOW)) / 36e5;
  const slaText = (a) => { const h = hoursLeft(a); if (h < 0) return [t('ap.sla.over', { h: Math.round(-h) }), 'danger']; if (h < 24) return [t('ap.sla.h', { h: Math.floor(h), m: Math.round((h % 1) * 60) }), 'warning']; return [t('ap.sla.d', { d: Math.floor(h / 24), h: Math.round(h % 24) }), 'neutral']; };
  const stepOf = (a) => { const m = /Step (\d+) of (\d+)/.exec(a.step || ''); return m ? [+m[1], +m[2]] : [1, 1]; };
  /* P5-04 · SoD mode from Admin › SoD rules: Warn lets the item through with a logged warning */
  const sodMode = () => ((D().sodRules.find((r) => /^Requester ≠ approver/.test(r[0])) || [])[1]);
  const sodWarn = (a) => a.sod && sodMode() === 'Warn';
  const blocked = (a) => a.sod && sodMode() !== 'Warn' && (!a.override || a.by === S.me());
  const eligible = (a) => a.value != null && a.value < D().bulkLimit && !blocked(a);
  const onBehalf = (a) => (S.assignee(a) !== S.me() && App.state.role !== 'admin' ? S.assignee(a) : null);
  const chipPrice = (id) => { const m = App.material(id); return m ? `${mid(id)} <span class="small muted">${esc(t('ap.chip', { l: m.last ? vnd(m.last) : '—', a: m.avg90 ? vnd(m.avg90) : '—' }))}</span>` : mid(id); };
  const nextName = (a) => { const c = D().approvalChains[a.id] || []; const n = c.find((r) => r[1] === 'Next'); return n ? n[0].split(' · ')[0] : null; };
  const whoText = (s) => s.split(' · ').map((x) => tv(x)).join(' · ');

  function queueRows(items) {
    return items.map((a) => {
      const [sl, tone] = slaText(a); const sel = st.sel === a.id; const ok = eligible(a); const [i, n] = stepOf(a);
      return `<li class="ap-item${sel ? ' sel' : ''}">
        <label class="chk ap-pick"><input type="checkbox" data-ap-pick="${esc(a.id)}"${st.picked.includes(a.id) ? ' checked' : ''}${ok ? '' : ' disabled'} aria-label="${esc(t('ap.select', { id: a.id }) + (ok ? '' : ' ' + t('ap.notElig')))}"></label>
        <div class="ap-main"><div class="ap-top"><button class="linkish mono" data-ap="open" data-id="${esc(a.id)}"${sel ? ' aria-current="true"' : ''}>${esc(a.id)}</button> ${blocked(a) ? pill(t('ap.k.sod'), 'danger') : sodWarn(a) ? pill(t('ap.sodWarn'), 'warning') : ''}${onBehalf(a) ? ' ' + pill(t('ap.onBehalf', { n: onBehalf(a) }), 'info') : ''}</div>
          <div class="ap-title">${esc(tv(a.title))}</div><div class="small muted">${esc(tv(a.type))} · ${esc(a.by)} · ${esc(t('ap.stepN', { i, n }))}</div>${a.mats.length ? `<div class="chips">${a.mats.map(chipPrice).join('')}</div>` : ''}</div>
        <div class="ap-side"><div class="num"><b>${a.value != null ? vnd(a.value) : '—'}</b></div>${pill(sl, tone)}<div class="small muted">SLA ${esc(a.sla)}</div><button class="btn btn-sm${sel ? ' btn-p' : ''}" data-ap="open" data-id="${esc(a.id)}" aria-label="${esc(t('ap.reviewId', { id: a.id }))}">${esc(t(sel ? 'ap.reviewing' : 'ap.review'))}</button></div></li>`;
    }).join('');
  }
  function queue(items, tab) {
    const filtered = items.filter((a) => st.type === 'all' || a.type === st.type);
    const picked = st.picked.filter((id) => filtered.some((a) => a.id === id && eligible(a)));
    const g = D().delegation;
    return block(`${t(tab === 'mine' ? 'ap.sub.inbox' : 'ap.sub.delegated')} (${items.length})`, `<div class="filters"><label class="sr" for="ap-type">${esc(t('c.type'))}</label><select class="inp" id="ap-type" data-apf="type"><option value="all">${esc(t('ap.allTypes'))}</option>${TYPES.map((x) => `<option value="${esc(x)}"${st.type === x ? ' selected' : ''}>${esc(tv(x))}</option>`).join('')}</select></div>
      ${filtered.length ? `<ul class="ap-list" aria-label="${esc(t('ap.queue'))}">${queueRows(filtered)}</ul>`
        : tab === 'mine' ? App.emptyState(t('ap.none'), t('ap.noneN')) : App.emptyState(t('ap.noDlg'), g ? t('ap.dlgRuns', { to: g.to, f: g.from, u: g.until }) : t('ap.noDlgSet'))}
      <div class="row-acts between mt"><span class="small muted">${esc(t('ap.bulkNote', { v: vnd(D().bulkLimit), n: filtered.filter(eligible).length }))}</span>
      <button class="btn btn-p btn-sm" data-ap="bulk"${picked.length ? '' : ' disabled'}>${esc(t('ap.bulk'))}${picked.length ? ` (${picked.length})` : ''}</button></div>`, { span: 6 });
  }

  function history() {
    return block(t('ap.h.title', { n: D().approvalHistory.length }), table([
      { h: t('ap.h.item'), r: (h) => `<span class="mono">${esc(h.id)}</span><div class="small">${esc(tv(h.title))}</div>`, w: 'minmax(200px,2fr)' }, { h: t('c.type'), r: (h) => esc(tv(h.type)), w: 'minmax(130px,1.2fr)' },
      { h: t('ap.h.decision'), r: (h) => pill(h.decision, h.decision === 'Approved' ? 'success' : h.decision === 'Rejected' ? 'danger' : 'warning'), w: '120px' },
      { h: t('ap.h.by'), r: (h) => `${esc(h.by)}${h.onBehalf ? `<div class="small">${esc(t('ap.h.ob', { n: h.onBehalf }))}</div>` : ''}<div class="small muted">${esc(h.at)}</div>`, w: 'minmax(170px,1.5fr)' },
      { h: t('ap.h.comment'), r: (h) => esc(h.comment ? tv(h.comment) : '—'), w: 'minmax(180px,2fr)' }
    ], D().approvalHistory.slice().reverse(), { label: t('ap.sub.history') }));
  }

  /* F-57 detail */
  function detail(a) {
    if (!a) return block(t('ap.details'), App.emptyState(t('ap.choose'), t('ap.chooseN')), { span: 6 });
    const pr = D().prs[a.id]; const chain = D().approvalChains[a.id] || [];
    const lines = pr ? table([
      { h: t('c.mid'), r: (l) => `${mid(l.mat)}<div class="small">${esc(App.material(l.mat).name)}</div>`, w: 'minmax(150px,2fr)' },
      { h: t('ap.c.qty'), r: (l) => `${num(l.qty)} ${esc(App.material(l.mat).uom)}<div class="small muted">VAT ${esc(App.material(l.mat).vat)}%</div>`, cls: 'num', w: '80px' },
      { h: t('ap.c.est'), r: (l) => { const m = App.material(l.mat); return `${vnd(l.price)}${m.avg90 ? `<div class="small ${l.price > m.avg90 * 1.05 ? 'tone-warning' : 'muted'}">${l.price >= m.avg90 ? '+' : '−'}${pct(Math.abs(l.price / m.avg90 - 1) * 100)} ${esc(t('ap.c.avg'))}</div>` : ''}`; }, cls: 'num', w: '150px' },
      { h: t('ap.c.last'), r: (l) => { const m = App.material(l.mat); return m.last ? `${vnd(m.last)}<div class="small muted">${esc(m.lastPo)} · ${esc(App.vshort(App.vendor(m.lastVendor)))}</div>` : '—'; }, cls: 'num', w: '140px' }
    ], pr.lines, { label: t('ap.lines') }) : a.mats.length ? `<div class="chips">${a.mats.map(chipPrice).join('')}</div>` : '';
    const b = pr && D().budgets[pr.cc]; const avail = b ? b.budget - b.invoiced - b.committed : 0;
    const budget = b ? `<h3 class="h-sub">${esc(t('ap.budget'))}</h3><dl class="dl"><dt>${esc(t('ap.b.line'))}</dt><dd>${esc(tv(b.name))}</dd><dt>${esc(t('ap.b.avail'))}</dt><dd>${vnd(avail)}</dd><dt>${esc(t('ap.b.this'))}</dt><dd>−${vnd(a.value)}</dd><dt>${esc(t('ap.b.after'))}</dt><dd><b>${vnd(avail - a.value)}</b></dd></dl>` : '';
    const chainHtml = chain.length ? `<h3 class="h-sub">${esc(t('ap.chain'))}</h3><ol class="chain">${chain.map(([w, s, at, c]) => `<li${s === 'Waiting' ? ' class="on"' : ''}><b>${esc(whoText(w))}</b>${pill(s, s === 'Approved' || s === 'Submitted' || s === 'Raised' ? 'success' : s === 'Waiting' ? 'info' : /Blocked/.test(s) ? 'danger' : 'neutral')}<span class="small muted">${esc(tv(at))}</span>${c ? `<span class="small">“${esc(tv(c))}”</span>` : ''}</li>`).join('')}</ol>` : '';
    const nx = nextName(a); const [i, n] = stepOf(a);
    const sod = sodWarn(a) ? `<div class="alert alert-warning" role="status"><b>${esc(t('ap.sodWarn'))}</b> — ${esc(t('ap.sodWarnTxt'))}</div>` : blocked(a) ? `<div class="alert alert-danger" role="alert"><b>${esc(t('ap.sodBlock'))}</b> ${esc(t('ap.sodBlockN'))}</div>
      ${App.state.role === 'admin' && a.by !== S.me() ? `<form id="ap-ovr" class="stack" novalidate><div class="field"><label for="ap-ovr-r">${esc(t('ap.ovr.reason'))} *</label><textarea id="ap-ovr-r"${st.oerr ? ' aria-invalid="true" aria-describedby="ap-ovr-e"' : ''}>${esc(st.ovr || '')}</textarea>${st.oerr ? `<span class="err" id="ap-ovr-e" role="alert">${esc(t(st.oerr))}</span>` : ''}</div><div class="row-acts"><button type="submit" class="btn btn-d btn-sm">${esc(t('ap.ovr.btn'))}</button></div></form>` : ''}` : a.override ? `<div class="alert alert-warning" role="status">${esc(t('ap.ovr.done', { by: a.override.by, at: a.override.at, r: a.override.reason }))}</div>` : '';
    const ob = onBehalf(a);
    const decide = `<form id="ap-form" class="stack decide-panel" novalidate aria-labelledby="ap-dec-h"><h3 id="ap-dec-h" class="h-sub mt-0">${esc(t('ap.dec.h'))}</h3><div class="field"><label for="ap-c">${esc(t('ap.dec.c'))}</label><textarea id="ap-c" aria-describedby="ap-c-h${st.cerr ? ' ap-c-e' : ''}"${st.cerr ? ' aria-invalid="true"' : ''}>${esc(st.comment)}</textarea><span class="hint" id="ap-c-h">${esc(t('ap.dec.hint'))}</span>${st.cerr ? `<span class="err" id="ap-c-e" role="alert">${esc(t(st.cerr))}</span>` : ''}</div>
      <p class="small mt-0">${esc(t('ap.dec.as', { me: S.me() }) + (ob ? t('ap.dec.ob', { n: ob }) : '') + t('ap.dec.step', { i, n, x: i < n && nx ? tv(nx) : t('ap.dec.final') }))}</p>
      <div class="row-acts decide-acts"><button type="button" class="btn" data-ap="decide" data-d="Returned">${esc(t('ap.return'))}</button><button type="button" class="btn btn-d" data-ap="decide" data-d="Rejected">${esc(t('ap.reject'))}</button><button type="button" class="btn btn-p" data-ap="decide" data-d="Approved"${blocked(a) ? ' disabled' : ''}>${esc(t('ap.approve'))}</button></div></form>`;
    const lk = (href, k) => `<a class="btn btn-sm" href="${href}">${esc(t(k))}</a>`;
    const link = a.type === 'PR approval' ? lk(`#/pr/${esc(a.id)}`, 'ap.open.pr') : a.type === 'Award recommendation' ? lk(`#/tenders/${esc(a.id)}/award`, 'ap.open.tender') : a.type === 'New Material ID' ? `<a class="btn btn-sm" href="#/material360?id=${esc(a.id)}">${esc(t('nav.material360'))}</a>` : a.type === 'Vendor change' ? lk(`#/vendors/${esc(a.id)}`, 'ap.open.vendor') : /^PO /.test(a.type) ? lk(`#/po/${esc(a.id.split(' ')[0])}`, 'ap.open.po') : a.type === 'Invoice exception' ? lk(`#/invoices/${esc(a.id)}/match`, 'ap.open.inv') : a.type === 'Delivery date change' && a.req ? lk(`#/po/${esc(a.req.po)}/receipts`, 'ap.open.po') : '';
    const files = pr && pr.files.length ? `<h3 class="h-sub">${esc(t('ap.files'))}</h3><ul class="plain small">${pr.files.map((f) => `<li>${esc(tv(f.type))} · <span class="mono">${esc(f.name)}</span> ${esc(f.ver)}${f.supplier ? ' ' + pill(t('src.f.supplier'), 'info') : ''}</li>`).join('')}</ul>` : '';
    return block(`${a.id} · ${tv(a.type)}`, `<p class="mt-0"><b>${esc(tv(a.title))}</b><br><span class="small muted">${esc(t('ap.reqBy', { by: a.by, v: a.value != null ? t('ap.exVat', { v: vnd(a.value) }) : t('ap.noValue'), step: tv(a.step) }))}${a.note ? ' · ' + esc(tv(a.note)) : ''}</span></p>
      ${sod}${lines}${budget}${chainHtml}${files}${decide}`, { span: 6, actions: link });
  }

  /* F-59 delegation */
  function delegation() {
    const g = D().delegation;
    if (st.dlg) {
      const f = st.dlg; const e = st.derr; const users = D().users.filter((u) => u.roles.includes('procurement') && u.name !== S.me());
      return block(t('ap.dl.title'), `<form id="ap-dlg" class="stack" novalidate>${S.field('dl', e, 'to', t('ap.dl.to'), f.to, { options: users.map((u) => [u.name, `${u.name} · ${tv(u.title)}`]) })}
        <div class="form-grid">${S.field('dl', e, 'from', t('ap.dl.from'), f.from, { req: true, ph: 'dd/mm/yyyy' })}${S.field('dl', e, 'until', t('ap.dl.until'), f.until, { req: true, ph: 'dd/mm/yyyy', hint: t('ap.dl.max14') })}</div>
        ${S.field('dl', e, 'cap', t('ap.dl.cap'), f.cap, { mode: 'numeric', hint: t('ap.dl.capHint') })}
        <fieldset class="fs"${e.types ? ' aria-describedby="dl-types-e"' : ''}><legend>${esc(t('ap.dl.types'))}</legend>${TYPES.map((x) => `<label class="chk"><input type="checkbox" name="types" value="${esc(x)}"${f.types.includes(x) ? ' checked' : ''}> ${esc(tv(x))}</label>`).join('')}${e.types ? `<span class="err" id="dl-types-e" role="alert">${esc(S.errText(e.types))}</span>` : ''}</fieldset>
        <div class="row-acts"><button type="button" class="btn btn-sm" data-ap="dlg-cancel">${esc(t('c.cancel'))}</button><button type="submit" class="btn btn-sm btn-p">${esc(t('ap.dl.save'))}</button></div></form>`, { span: 6 });
    }
    return block(t('ap.dl.card'), g ? `<dl class="dl"><dt>${esc(t('ap.dl.delegate'))}</dt><dd>${esc(g.to)}</dd><dt>${esc(t('ap.dl.period'))}</dt><dd>${esc(g.from)} – ${esc(g.until)} ${pill(t(S.dlgActive() ? 'ap.dl.active' : 'ap.dl.sched'), S.dlgActive() ? 'success' : 'info')}</dd><dt>${esc(t('ap.dl.capL'))}</dt><dd>≤ ${vnd(g.cap)}</dd><dt>${esc(t('ap.dl.typesL'))}</dt><dd>${g.types.map((x) => esc(tv(x))).join(', ')}</dd><dt>${esc(t('ap.dl.above'))}</dt><dd>${esc(t('ap.dl.goes', { n: g.above }))}</dd></dl>
      <p class="small muted">${esc(t('ap.dl.note', { n: 'Nguyễn Minh Anh' }))}</p>
      <div class="row-acts"><button class="btn btn-sm btn-d" data-ap="dlg-del">${esc(t('ap.dl.cancel'))}</button><button class="btn btn-sm" data-ap="dlg-edit">${esc(t('c.edit'))}</button></div>`
      : `${App.emptyState(t('ap.dl.none'), t('ap.dl.noneN'))}<div class="row-acts"><button class="btn btn-sm btn-p" data-ap="dlg-edit">${esc(t('ap.dl.title'))}</button></div>`, { span: 6 });
  }
  function saveDlg(root) {
    const f = Object.assign(st.dlg, S.read(root, '#ap-dlg')); f.types = f.types || []; const e = {};
    if (!f.to || f.to === S.me()) e.to = 'ap.dl.e.to';
    if (!S.validDate(f.from)) e.from = 'c.dateFmt'; else if (App.daysTo(f.from) < 0) e.from = 'ap.dl.e.past';
    if (!S.validDate(f.until)) e.until = 'c.dateFmt';
    else if (!e.from) { const d = Math.round((App.dt(f.until) - App.dt(f.from)) / 864e5) + 1; if (d < 1) e.until = 'ap.dl.e.order'; else if (d > 14) e.until = ['ap.dl.e.max', { d }]; }
    const cap = S.money(f.cap); if (!(cap > 0)) e.cap = 'ap.dl.e.cap'; else if (cap > 2000000000) e.cap = 'ap.dl.e.capMax';
    if (!f.types.length) e.types = 'ap.dl.e.types';
    st.derr = e; if (Object.keys(e).length) { App.render(); S.focusErr('#ap-dlg'); return; }
    D().delegation = { to: f.to, from: f.from, until: f.until, cap, types: f.types, above: 'Đỗ Hoàng Nam' }; st.dlg = null; App.render(); App.toast(t('ap.dl.saved', { to: f.to, f: f.from, u: f.until }));
  }

  function sodBlock() {
    const log = D().sodLog || [];
    return block(t('ap.sod.title'), `<ul class="plain small">${D().sodRules.map(([r, a]) => `<li>${esc(tv(r))} ${pill(a, a === 'Block' ? 'danger' : 'warning')}</li>`).join('')}</ul><p class="small muted">${esc(t('ap.sod.note'))}</p>
      ${log.length ? `<h3 class="h-sub">${esc(t('ap.sod.ovr'))}</h3><ul class="plain small">${log.map((x) => `<li>${esc(x.at)} · ${esc(x.by)} · ${esc(x.id)} — ${esc(tv(x.reason))}</li>`).join('')}</ul>` : ''}`, { span: 6 });
  }

  function decideOne(a, d, comment) {
    const me = S.me(); const ob = onBehalf(a); const [i, n] = stepOf(a); const chain = D().approvalChains[a.id] || [];
    D().approvalHistory.push({ id: a.id, type: a.type, title: a.title, decision: d, by: me, onBehalf: ob, at: NOW, comment });
    const w = chain.find((r) => r[1] === 'Waiting'); if (w) { w[1] = d; w[2] = NOW + (ob ? ` · ${me} on behalf of ${ob}` : ''); w[3] = comment; }
    const doc = S.docOf(a.id);
    D().notifications.filter((x) => x.doc === a.id).forEach((x) => { x.read = true; });
    if (d === 'Approved' && i < n) {
      const nx = chain.find((r) => r[1] === 'Next'); if (nx) { nx[1] = 'Waiting'; nx[2] = 'Since ' + NOW; }
      a.step = `Step ${i + 1} of ${n}`; a.assignee = nx ? nx[0].split(' · ')[0] : nextName(a) || 'Đỗ Hoàng Nam';
      return t('ap.msg.step', { id: a.id, i: i + 1, n, a: a.assignee });
    }
    D().approvals.splice(D().approvals.indexOf(a), 1);
    if (App.po) App.po.onDecide(a, d); if (App.inv) App.inv.onDecide(a, d);
    if (a.type === 'Award recommendation') {
      const tn = D().tenders[a.id];
      if (d === 'Approved') {
        Object.assign(tn.award, { status: 'Approved', approver: me, at: NOW }); doc.status = 'Awarded'; tn.step = 6; doc.note = 'Awarded ' + NOW.slice(0, 10);
        if (tn.bidders) tn.lines.forEach((l, k) => { const b = tn.bidders.find((x) => x.vid === tn.award.pick[k]); const m = App.material(l.mat); if (b && m) { m.last = b.prices[k]; m.lastPo = a.id; m.lastVendor = b.vid; } });
      } else { tn.award = null; doc.status = 'Evaluation'; }
    } else if (doc && doc.type === 'PR') doc.status = d === 'Approved' ? 'Approved' : d;
    return t('ap.msg.' + d, { id: a.id }) + (ob ? t('ap.msg.ob', { n: ob }) : '');
  }

  // RB2-01: leaving My approvals forgets the last deep link, so the next ?id= always selects its item
  window.addEventListener('hashchange', () => { if (!/^#\/approvals(\/|\?|$)/.test(location.hash)) st.lastId = null; });
  const SUBS = [['', 'ap.sub.inbox'], ['delegated', 'ap.sub.delegated'], ['history', 'ap.sub.history'], ['delegation', 'ap.sub.settings']];
  App.page('approvals', {
    titleKey: 'nav.approvals', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const cur = App.sub(SUBS, subArg || '');
      if (p.id && p.id !== st.lastId) { st.lastId = p.id; st.sel = p.id; st.comment = ''; st.cerr = ''; }
      const mine = S.myQueue(); const dlg = D().approvals.filter((a) => S.delegable(a));
      const items = cur === 'delegated' ? dlg : mine;
      if (!items.some((a) => a.id === st.sel)) st.sel = items[0] ? items[0].id : null;
      const sel = items.find((a) => a.id === st.sel);
      const due = mine.filter((a) => hoursLeft(a) < 24); const g = D().delegation;
      const blocks = cur === 'history' ? [history()] : cur === 'delegation' ? [delegation(), sodBlock()] : [queue(items, cur === 'delegated' ? 'delegated' : 'mine'), detail(sel)];
      return layout({
        title: t('nav.approvals'), subtitle: esc(t('ap.subtitle', { me: S.me(), admin: App.state.role === 'admin' ? t('ap.adminView') : '' })),
        kpis: [kpi(t('ap.k.mine'), String(mine.length), esc(t('ap.k.mineN'))), kpi(t('ap.k.due'), String(due.length), esc(due.map((a) => a.id).join(', ') || t('c.none')), due.length ? 'warning' : ''),
          kpi(t('ap.k.sod'), String(mine.filter(blocked).length), esc(t('ap.k.sodN')), mine.some(blocked) ? 'danger' : ''), kpi(t('ap.k.dlg'), g ? esc(g.to) : esc(t('c.none')), esc(g ? `${g.from} – ${g.until}` : t('ap.k.notSet')))],
        alerts: App.unknownSub(SUBS, subArg),
        subnav: App.subnav('approvals', [['', 'ap.sub.inbox', mine.length || ''], ['delegated', 'ap.sub.delegated', dlg.length || ''], ['history', 'ap.sub.history'], ['delegation', 'ap.sub.settings']], cur), blocks
      });
    },
    mount(root) {
      root.addEventListener('change', (e) => {
        if (e.target.dataset.apf === 'type') { st.type = e.target.value; App.render(); }
        if (e.target.dataset.apPick) { const id = e.target.dataset.apPick; st.picked = e.target.checked ? [...st.picked, id] : st.picked.filter((x) => x !== id); App.render(); const x = document.querySelector(`[data-ap-pick="${id}"]`); x && x.focus(); }
      });
      root.addEventListener('input', (e) => { if (e.target.id === 'ap-c') st.comment = e.target.value; if (e.target.id === 'ap-ovr-r') st.ovr = e.target.value; });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'ap-dlg') { e.preventDefault(); saveDlg(root); }
        if (e.target.id === 'ap-form') e.preventDefault();
        if (e.target.id === 'ap-ovr') {
          e.preventDefault(); const a = D().approvals.find((x) => x.id === st.sel); const r = (st.ovr || '').trim();
          if (a.by === S.me()) { st.oerr = 'ap.e.self'; App.render(); return; }
          if (r.length < 10) { st.oerr = 'ap.e.reason'; App.render(); document.getElementById('ap-ovr-r').focus(); return; }
          a.override = { by: S.me(), at: NOW, reason: r }; (D().sodLog = D().sodLog || []).push({ id: a.id, by: S.me(), at: NOW, reason: r }); st.ovr = null; st.oerr = ''; App.render(); App.toast(t('ap.overridden', { id: a.id }));
        }
      });
      root.addEventListener('click', (e) => {
        const b = e.target.closest('[data-ap]'); if (!b) return; const k = b.dataset.ap;
        if (k === 'open') { st.sel = b.dataset.id; st.lastId = b.dataset.id; st.comment = ''; st.cerr = ''; const sb = (location.hash.match(/^#\/approvals(\/[^?]*)?/) || [])[1] || ''; window.history.replaceState(null, '', '#/approvals' + sb + '?id=' + encodeURIComponent(b.dataset.id)); App.render(); const f = document.getElementById('ap-c'); if (f) { f.closest('.card').scrollIntoView({ block: 'start' }); f.focus({ preventScroll: true }); } }
        else if (k === 'decide') {
          const a = D().approvals.find((x) => x.id === st.sel); if (!a) return; const d = b.dataset.d; const c = (st.comment || '').trim();
          if (d !== 'Approved' && c.length < 10) { st.cerr = d === 'Rejected' ? 'ap.e.reject' : 'ap.e.return'; App.render(); document.getElementById('ap-c').focus(); return; }
          if (d === 'Approved' && blocked(a)) return;
          if (d === 'Approved' && sodWarn(a)) { (D().sodLog = D().sodLog || []).push({ id: a.id, by: S.me(), at: App.now(), reason: 'SoD Warn mode · approved with warning' }); S.audit('Overrides', 'SoD warning acknowledged · approved', a.id); }
          const msg = decideOne(a, d, c); st.comment = ''; st.cerr = ''; st.sel = null; st.picked = st.picked.filter((x) => x !== a.id); App.render(); App.toast(msg);
        }
        else if (k === 'bulk') {
          const ids = st.picked.filter((id) => { const a = D().approvals.find((x) => x.id === id); return a && eligible(a); });
          ids.forEach((id) => decideOne(D().approvals.find((x) => x.id === id), 'Approved', t('ap.bulkComment'))); st.picked = []; App.render(); App.toast(t('ap.bulkDone', { n: ids.length }));
        }
        else if (k === 'dlg-edit') { const g = D().delegation || { to: 'Lê Quốc Huy', from: '10/11/2026', until: '14/11/2026', cap: 500000000, types: ['PR approval', 'PO change order'] }; st.dlg = { to: g.to, from: g.from, until: g.until, cap: num(g.cap), types: g.types.slice() }; st.derr = {}; App.render(); document.getElementById('dl-to').focus(); }
        else if (k === 'dlg-cancel') { st.dlg = null; App.render(); }
        else if (k === 'dlg-del') { D().delegation = null; App.render(); App.toast(t('ap.dl.cancelled')); }
      });
    }
  });
})();

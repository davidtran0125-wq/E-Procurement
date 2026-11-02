/* Module 2 · Dashboard & notifications — F-05 KPIs/filters/charts, F-06 Action required + bell (R-15), F-07 tenders closing,
   F-08 price alerts by Material ID, F-09 shell search.
   Routes: #/dashboard (sub: analytics | tenders | prices), #/notifications (sub: rules), #/search?q= */
(function () {
  const { esc, num, pct, vnd, mid, pill, table, kpi, block, layout, t, tv } = App;
  const D = () => window.DATA;
  I18N.add({
    'db.title': ['Dashboard', 'Bảng điều khiển'], 'db.hello': ['{date} · Good morning, {name}', '{date} · Chào buổi sáng, {name}'], 'db.today': ['Monday, 02/11/2026', 'Thứ Hai, 02/11/2026'],
    'db.export': ['Export report', 'Xuất báo cáo'], 'db.exported': ['Report exported: Dashboard_{p}_{c}.xlsx', 'Đã xuất báo cáo: Dashboard_{p}_{c}.xlsx'], 'db.newPr': ['New PR', 'Tạo PR'],
    'db.period': ['Period', 'Kỳ'], 'db.p.ytd': ['Year to date (01–10/2026)', 'Từ đầu năm (01–10/2026)'], 'db.p.q3': ['Q3 2026', 'Quý 3/2026'], 'db.p.oct': ['October 2026', 'Tháng 10/2026'],
    'db.ps.ytd': ['YTD', 'lũy kế'], 'db.ps.q3': ['Q3', 'Q3'], 'db.ps.oct': ['Oct', 'T10'],
    'db.sub.overview': ['Action required', 'Việc cần làm'], 'db.sub.analytics': ['Analytics', 'Phân tích'], 'db.sub.tenders': ['Tenders closing', 'Gói thầu sắp đóng'], 'db.sub.prices': ['Price alerts', 'Cảnh báo giá'],
    'db.k.spend': ['Spend {p}', 'Chi tiêu {p}'], 'db.k.saving': ['Saving {p}', 'Tiết kiệm {p}'], 'db.k.otif': ['OTIF 90 days', 'OTIF 90 ngày'], 'db.k.openPr': ['Open PRs', 'PR đang mở'], 'db.k.tenders': ['Active tenders', 'Gói thầu đang mở'],
    'db.k.yoy': ['+{v}% vs same period 2025', '+{v}% so với cùng kỳ 2025'], 'db.k.savingNote': ['{p} of sourced spend · target {t}%', '{p} chi tiêu qua đấu thầu · mục tiêu {t}%'],
    'db.k.above': ['Target {t}% · {v} pts above', 'Mục tiêu {t}% · cao hơn {v} điểm'], 'db.k.below': ['Target {t}% · {v} pts below', 'Mục tiêu {t}% · thấp hơn {v} điểm'],
    'db.k.awaiting': ['{n} awaiting approval', '{n} chờ phê duyệt'], 'db.k.closing': ['{n} closing this week', '{n} đóng thầu tuần này'],
    'db.otif': ['OTIF – last 12 months', 'OTIF – 12 tháng gần nhất'], 'db.otifTarget': ['Target 95%', 'Mục tiêu 95%'], 'db.otifReport': ['OTIF report', 'Báo cáo OTIF'],
    'db.otifLabel': ['OTIF by month from {a} to {b}, between {min} and {max}, target 95%', 'OTIF theo tháng từ {a} đến {b}, trong khoảng {min} – {max}, mục tiêu 95%'],
    'db.otifNote': ['On time = received ≤ promised date · In full = accepted qty ≥ scheduled qty.', 'Đúng hạn = nhận ≤ ngày cam kết · Đủ = SL chấp nhận ≥ SL theo lịch.'], 'db.otifCat': ['{c} 90-day OTIF: {v}.', 'OTIF 90 ngày nhóm {c}: {v}.'], 'db.allCats': ['All categories.', 'Tất cả nhóm hàng.'],
    'db.spend': ['Spend by category', 'Chi tiêu theo nhóm hàng'], 'db.spendNote': ['{p} · PO value excl. VAT', '{p} · giá trị PO chưa VAT'], 'db.activeVendors': ['{n} active vendors · {p}', '{n} NCC hoạt động · {p}'],
    'db.action': ['Action required', 'Việc cần làm'], 'db.unread': ['{n} unread', '{n} chưa đọc'], 'db.markAll': ['Mark all read', 'Đánh dấu đã đọc tất cả'], 'db.markedAll': ['All notifications marked as read', 'Đã đánh dấu tất cả thông báo là đã đọc'],
    'db.tenders': ['Tenders closing soon', 'Gói thầu sắp đóng'], 'db.allTenders': ['All tenders', 'Tất cả gói thầu'], 'db.t.tender': ['Tender', 'Gói thầu'], 'db.t.closes': ['Closes', 'Đóng thầu'],
    'db.t.bids': ['Bids / invited', 'Hồ sơ / mời'], 'db.t.sealed': ['sealed', 'niêm phong'], 'db.t.closed': ['Closed', 'Đã đóng'], 'db.t.in': ['in {n} days', 'còn {n} ngày'], 'db.t.empty': ['No tenders closing in this category', 'Không có gói thầu sắp đóng trong nhóm này'],
    'db.prices': ['Price alerts by Material ID (±{v}% vs 90-day avg)', 'Cảnh báo giá theo mã vật tư (±{v}% so với BQ 90 ngày)'], 'db.openPrice': ['Open price history', 'Mở lịch sử giá'],
    'db.p.avg': ['90-day avg', 'BQ 90 ngày'], 'db.p.src': ['Last vendor · source', 'NCC gần nhất · chứng từ'], 'db.p.empty': ['No price alerts in this category', 'Không có cảnh báo giá trong nhóm này'],
    'nt.title': ['Notifications', 'Thông báo'], 'nt.sub': ['{n} unread · in-app and Gmail', '{n} chưa đọc · trong ứng dụng và Gmail'], 'nt.digest': ['Daily digest', 'Bản tin hằng ngày'], 'nt.digestOn': ['Daily digest at 08:00 turned on', 'Đã bật bản tin hằng ngày lúc 08:00'],
    'nt.sub.inbox': ['Inbox', 'Hộp thư'], 'nt.sub.rules': ['Reminder rules', 'Quy tắc nhắc'], 'nt.centre': ['Notification centre', 'Trung tâm thông báo'], 'nt.rules': ['Reminder & escalation rules', 'Quy tắc nhắc & chuyển cấp'], 'nt.editRules': ['Edit rules', 'Sửa quy tắc'],
    'nt.r1': ['PO unconfirmed 48 h → remind supplier · 72 h → escalate to buyer (PO-2026-0869)', 'PO chưa xác nhận 48 giờ → nhắc NCC · 72 giờ → chuyển cấp cho người mua (PO-2026-0869)'],
    'nt.r2': ['Certificate / contract expiry → 60 and 30 days before', 'Chứng chỉ / hợp đồng hết hạn → trước 60 và 30 ngày'], 'nt.r3': ['Tender closing → 24 h before', 'Đóng thầu → trước 24 giờ'],
    'nt.r4': ['Price alert → last price differs from 90-day average by more than ±{v}%', 'Cảnh báo giá → giá gần nhất lệch bình quân 90 ngày quá ±{v}%'],
    'nt.empty': ['Nothing here. You are all caught up.', 'Không có gì mới. Bạn đã xử lý hết.'], 'nt.unreadSr': ['Unread', 'Chưa đọc'], 'nt.markRead': ['Mark read', 'Đánh dấu đã đọc'], 'nt.markUnread': ['Mark unread', 'Đánh dấu chưa đọc'],
    'nt.type': ['Type', 'Loại'], 'nt.allTypes': ['All types', 'Tất cả loại'], 'nt.readState': ['Read state', 'Trạng thái đọc'], 'nt.all': ['All', 'Tất cả'], 'nt.unread': ['Unread', 'Chưa đọc'], 'nt.read': ['Read', 'Đã đọc'],
    'sr.title': ['Search', 'Tìm kiếm'], 'sr.results': ['{n} results for “{q}”', '{n} kết quả cho “{q}”'], 'sr.hint': ['Type a Material ID, document number, vendor or MST', 'Nhập mã vật tư, số chứng từ, nhà cung cấp hoặc MST'],
    'sr.ph': ['e.g. CON-24015, PO-2026-0877, Minh Phát', 'VD: CON-24015, PO-2026-0877, Minh Phát'], 'sr.go': ['Search', 'Tìm'], 'sr.mats': ['Material IDs ({n})', 'Mã vật tư ({n})'], 'sr.vens': ['Vendors ({n})', 'Nhà cung cấp ({n})'], 'sr.docs': ['Documents ({n})', 'Chứng từ ({n})'],
    'sr.noMats': ['No Material IDs', 'Không có mã vật tư'], 'sr.noVens': ['No vendors', 'Không có nhà cung cấp'], 'sr.noDocs': ['No documents', 'Không có chứng từ']
  });
  const CATS = ['CON', 'EQP', 'SRV', 'LOG'];
  const PERIODS = { ytd: [0, 10], q3: [6, 9], oct: [9, 10] };
  const st = { period: 'ytd', cat: 'all' };
  // Separate filter state for Dashboard "Action required" and the notification centre (P1-12)
  const stDash = { type: 'all', show: 'all' }, stNotif = { type: 'all', show: 'all' };
  const parseD = (s) => { const [d, m, y] = s.split(' ')[0].split('/').map(Number); return new Date(y, m - 1, d); };
  const TODAY = new Date(2026, 10, 2);
  const daysTo = (s) => Math.round((parseD(s) - TODAY) / 864e5);
  const typeTone = { 'PR approval': 'info', 'PO overdue': 'danger', 'Invoice exception': 'warning', Evaluation: 'info', Tender: 'neutral', 'Price alert': 'warning', Certificate: 'danger', Delivery: 'success' };

  /* ---- price alerts: |last − avg90| / avg90 > threshold ---- */
  function priceAlerts(cat) {
    return D().materials.filter((m) => m.last && m.avg90 && (cat === 'all' || m.cat === cat))
      .map((m) => ({ m, d: ((m.last - m.avg90) / m.avg90) * 100 }))
      .filter((x) => Math.abs(x.d) > D().priceAlertThreshold).sort((a, b) => Math.abs(b.d) - Math.abs(a.d));
  }

  function notifList(items, opts = {}) {
    if (!items.length) return `<div class="empty">${esc(t('nt.empty'))}</div>`;
    return `<ul class="nlist">${items.map((n) => `<li class="nitem${n.read ? '' : ' unread'}">
      <span class="ndot" aria-hidden="true"></span>
      <div class="nbody"><div class="nmeta">${pill(n.type, typeTone[n.type] || 'neutral')} <span class="mono small">${esc(n.doc)}</span> <span class="muted small">· ${esc(n.at)}</span>${n.read ? '' : ` <span class="sr">${esc(t('nt.unreadSr'))}</span>`}</div>
        <div>${esc(tv(n.text))}</div>${n.mats && n.mats.length ? `<div class="chips">${n.mats.map(mid).join(' ')}</div>` : ''}</div>
      <div class="nacts"><a class="btn btn-sm${n.read ? '' : ' btn-p'}" href="${esc(n.href)}" data-nopen="${n.id}">${esc(tv(n.action))}</a>${opts.toggle ? `<button class="btn btn-sm" data-ntoggle="${n.id}">${esc(t(n.read ? 'nt.markUnread' : 'nt.markRead'))}</button>` : ''}</div></li>`).join('')}</ul>`;
  }
  const filterNotifs = (s, base) => base.filter((n) => (s.type === 'all' || n.type === s.type) && (s.show === 'all' || (s.show === 'unread' ? !n.read : n.read)));
  function notifFilters(s) {
    const types = [...new Set(D().notifications.map((n) => n.type))];
    return `<div class="filters"><label class="sr" for="nf-type">${esc(t('nt.type'))}</label><select class="inp" id="nf-type" data-nf="type"><option value="all">${esc(t('nt.allTypes'))}</option>${types.map((x) => `<option value="${esc(x)}"${s.type === x ? ' selected' : ''}>${esc(tv(x))}</option>`).join('')}</select>
      <div class="seg" role="group" aria-label="${esc(t('nt.readState'))}">${['all', 'unread', 'read'].map((k) => `<button data-nshow="${k}" aria-pressed="${s.show === k}">${esc(t('nt.' + k))}</button>`).join('')}</div></div>`;
  }
  function wireNotifs(root, s) {
    root.addEventListener('change', (e) => { if (e.target.dataset.nf) { s.type = e.target.value; App.render(); } });
    root.addEventListener('click', (e) => {
      const el = e.target.closest('[data-ntoggle],[data-nshow],[data-nopen],[data-nall]'); if (!el) return;
      if (el.dataset.nshow) { s.show = el.dataset.nshow; App.render(); }
      else if (el.dataset.ntoggle) { const n = D().notifications.find((x) => x.id === el.dataset.ntoggle); if (n) n.read = !n.read; App.render(); }
      else if (el.dataset.nopen) { const n = D().notifications.find((x) => x.id === el.dataset.nopen); if (n) n.read = true; }
      else if (el.dataset.nall != null) { D().notifications.forEach((n) => { n.read = true; }); App.render(); App.toast(t('db.markedAll')); }
    });
  }

  /* ---------------- Dashboard ---------------- */
  const SUBS = [['', 'db.sub.overview'], ['analytics', 'db.sub.analytics'], ['tenders', 'db.sub.tenders'], ['prices', 'db.sub.prices']];
  function dashboard(p, subArg) {
    const cur = App.sub(SUBS, subArg || '');
    const K = D().kpi, [a, b] = PERIODS[st.period]; const plabel = t('db.p.' + st.period); const ps = t('db.ps.' + st.period);
    const cats = st.cat === 'all' ? Object.keys(K.byCat) : [st.cat];
    const sum = (arr) => arr.reduce((s, v) => s + v, 0);
    const spendOf = (c) => sum(K.byCat[c].spend.slice(a, b));
    const spend = sum(cats.map(spendOf));
    const saving = st.cat === 'all' ? K.savingYtd * (spend / K.spendYtd) : K.byCat[st.cat].saving * (spendOf(st.cat) / sum(K.byCat[st.cat].spend));
    const savingPct = (saving / spend) * 100;
    const otif90 = st.cat === 'all' ? K.otif90 : K.byCat[st.cat].otif;
    const openPr = st.cat === 'all' ? K.openPr : K.byCat[st.cat].openPr;
    const prAw = st.cat === 'all' ? K.prAwaiting : K.byCat[st.cat].prAwaiting;
    const tenders = D().docs.filter((d) => d.type === 'TND' && !['Awarded', 'Cancelled'].includes(d.status) && (st.cat === 'all' || d.cat === st.cat));
    const unread = D().notifications.filter((n) => !n.read).length;
    const yoy = st.period === 'ytd' && st.cat === 'all' ? t('db.k.yoy', { v: num(((K.spendYtd - K.spendPrevYtd) / K.spendPrevYtd) * 100, 1) }) : esc(plabel);

    const kpis = [
      kpi(t('db.k.spend', { p: ps }), num(spend, 1) + ' tỷ ₫', yoy + ' · ' + t('c.exclVat')),
      kpi(t('db.k.saving', { p: ps }), num(saving, 1) + ' tỷ ₫', esc(t('db.k.savingNote', { p: pct(savingPct), t: K.savingTarget })), savingPct >= K.savingTarget ? 'success' : 'warning'),
      kpi(t('db.k.otif'), pct(otif90), esc(t(otif90 >= K.otifTarget ? 'db.k.above' : 'db.k.below', { t: K.otifTarget, v: num(Math.abs(otif90 - K.otifTarget), 1) })), otif90 >= K.otifTarget ? 'success' : 'warning'),
      kpi(t('db.k.openPr'), num(openPr), `<a href="#/approvals">${esc(t('db.k.awaiting', { n: prAw }))}</a>`),
      kpi(t('db.k.tenders'), num(tenders.length), esc(t('db.k.closing', { n: tenders.filter((x) => x.close && daysTo(x.close) >= 0 && daysTo(x.close) <= 6).length })))
    ];

    let blocks;
    if (cur === 'analytics') {
      const O = D().otif;
      const otifChart = block(t('db.otif'), App.chart.line({ labels: O.months, values: O.values, target: O.target, targetLabel: t('db.otifTarget'), min: 85, max: 97, fmt: (v) => pct(v), label: t('db.otifLabel', { a: O.months[0], b: O.months[11], min: pct(Math.min(...O.values)), max: pct(Math.max(...O.values)) }) })
        + `<p class="muted small">${esc(t('db.otifNote'))} ${esc(st.cat !== 'all' ? t('db.otifCat', { c: t('cat.' + st.cat), v: pct(otif90) }) : t('db.allCats'))}</p>`, { span: 6, actions: `<a class="btn btn-sm" href="#/reports">${esc(t('db.otifReport'))}</a>` });
      const all = sum(Object.keys(K.byCat).map(spendOf));
      const rows = Object.keys(K.byCat).map((c) => ({ label: t('cat.' + c), value: spendOf(c), note: t('db.activeVendors', { n: K.byCat[c].vendors, p: pct((spendOf(c) / all) * 100) }), dim: st.cat !== 'all' && st.cat !== c })).sort((x, y) => y.value - x.value);
      const spendCard = block(t('db.spend'), App.chart.bars(rows, (v) => num(v, 1) + ' tỷ ₫') + `<p class="muted small">${esc(t('db.spendNote', { p: plabel }))}</p>`, { span: 6 });
      blocks = [otifChart, spendCard];
    } else if (cur === 'tenders') {
      blocks = [block(t('db.tenders'), table([
        { h: t('db.t.tender'), r: (x) => `<a class="mono" href="#/tenders/${esc(x.id)}">${esc(x.id)}</a><div class="small">${esc(x.title)}</div>`, w: 'minmax(200px,2fr)' },
        { h: t('c.category'), r: (x) => esc(t('cat.' + x.cat)) },
        { h: t('db.t.closes'), r: (x) => `${esc(x.close)}<div class="small muted">${esc(daysTo(x.close) <= 0 ? t('db.t.closed') : t('db.t.in', { n: daysTo(x.close) }))}</div>` },
        { h: t('db.t.bids'), r: (x) => `${x.bids} / ${x.invited}${x.sealed ? ' · ' + esc(t('db.t.sealed')) : ''}`, cls: 'num' },
        { h: t('c.status'), r: (x) => pill(x.status, x.status === 'Q&A' ? 'warning' : x.status === 'Evaluation' ? 'neutral' : 'info') }
      ], tenders.filter((x) => daysTo(x.close) > 0).sort((x, y) => parseD(x.close) - parseD(y.close)), { min: 620, empty: t('db.t.empty'), label: t('db.tenders') }), { actions: `<a class="btn btn-sm" href="#/tenders">${esc(t('db.allTenders'))}</a>` })];
    } else if (cur === 'prices') {
      blocks = [block(t('db.prices', { v: D().priceAlertThreshold }), table([
        { h: t('c.mid'), r: (x) => `${mid(x.m.id)}<div class="small">${esc(x.m.name)}</div>`, w: 'minmax(190px,2fr)' },
        { h: t('c.lastPrice'), r: (x) => vnd(x.m.last) + `<div class="small muted">/${esc(x.m.uom)}</div>`, cls: 'num' },
        { h: t('db.p.avg'), r: (x) => vnd(x.m.avg90), cls: 'num' },
        { h: 'Δ', r: (x) => `<span class="${x.d > 0 ? 'tone-danger' : 'tone-success'}"><b>${x.d > 0 ? '+' : '−'}${pct(Math.abs(x.d))}</b></span>`, cls: 'num', w: '90px' },
        { h: t('db.p.src'), r: (x) => `${esc((App.vendor(x.m.lastVendor) || {}).name || '')}<div class="mono small">${esc(x.m.lastPo)}</div>`, w: 'minmax(180px,1.6fr)' }
      ], priceAlerts(st.cat), { min: 760, empty: t('db.p.empty'), label: t('db.sub.prices') }) + `<p class="muted small">${esc(t('c.pricesExcl'))}</p>`, { actions: `<a class="btn btn-sm" href="#/price">${esc(t('db.openPrice'))}</a>` })];
    } else {
      const acts = filterNotifs(stDash, D().notifications.filter((n) => n.type !== 'Price alert' && n.type !== 'Certificate'));
      blocks = [block(t('db.action'), notifFilters(stDash) + notifList(acts, { toggle: true }), { actions: `${pill(t('db.unread', { n: unread }), 'danger')}<button class="btn btn-sm" data-nall>${esc(t('db.markAll'))}</button>` })];
    }
    const filters = `<div class="field inline"><label for="db-period">${esc(t('db.period'))}</label><select id="db-period" class="inp" data-db="period">${Object.keys(PERIODS).map((k) => `<option value="${k}"${st.period === k ? ' selected' : ''}>${esc(t('db.p.' + k))}</option>`).join('')}</select></div>
      <div class="field inline"><label for="db-cat">${esc(t('c.category'))}</label><select id="db-cat" class="inp" data-db="cat"><option value="all">${esc(t('c.allCats'))}</option>${CATS.map((k) => `<option value="${k}"${st.cat === k ? ' selected' : ''}>${esc(t('cat.' + k))}</option>`).join('')}</select></div>`;
    return layout({
      title: t('db.title'), subtitle: esc(t('db.hello', { date: t('db.today'), name: (App.state.user && App.state.user.name) || 'Nguyễn Minh Anh' })),
      actions: `${filters}<button class="btn" data-act="toast" data-msg="${esc(t('db.exported', { p: st.period, c: st.cat }))}">${esc(t('db.export'))}</button><a class="btn btn-p" href="#/pr/new">${esc(t('db.newPr'))}</a>`,
      alerts: App.unknownSub(SUBS, subArg), kpis, subnav: App.subnav('dashboard', SUBS, cur), blocks
    });
  }
  App.page('dashboard', {
    titleKey: 'db.title', ws: 'procurement', roles: ['procurement', 'admin'], render: dashboard,
    mount(root) {
      root.addEventListener('change', (e) => { const k = e.target.dataset.db; if (k) { st[k] = e.target.value; App.render(); } });
      wireNotifs(root, stDash);
    }
  });

  /* ---------------- Notifications (bell panel, R-15) ---------------- */
  const NSUBS = [['', 'nt.sub.inbox'], ['rules', 'nt.sub.rules']];
  App.page('notifications', {
    titleKey: 'nt.title', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const cur = App.sub(NSUBS, subArg || '');
      const unread = D().notifications.filter((n) => !n.read).length;
      const blocks = cur === 'rules'
        ? [block(t('nt.rules'), `<ul class="plain rule-list">${['nt.r1', 'nt.r2', 'nt.r3'].map((k) => `<li>${esc(t(k))}</li>`).join('')}<li>${esc(t('nt.r4', { v: D().priceAlertThreshold }))}</li></ul>`, { actions: `<a class="btn btn-sm" href="#/admin/rules">${esc(t('nt.editRules'))}</a>` })]
        : [block(t('nt.centre'), notifFilters(stNotif) + notifList(filterNotifs(stNotif, D().notifications), { toggle: true }))];
      return layout({
        title: t('nt.title'), subtitle: esc(t('nt.sub', { n: unread })),
        actions: `<button class="btn" data-nall>${esc(t('db.markAll'))}</button><button class="btn" data-act="toast" data-msg="${esc(t('nt.digestOn'))}">${esc(t('nt.digest'))}</button>`,
        alerts: App.unknownSub(NSUBS, subArg), subnav: App.subnav('notifications', NSUBS, cur), blocks
      });
    },
    mount: (root) => wireNotifs(root, stNotif)
  });

  /* ---------------- Global search (F-09) ---------------- */
  App.page('search', {
    titleKey: 'sr.title', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p) {
      const q = (p.q || '').trim();
      const hit = (...f) => f.some((x) => x && App.matches(x, q));
      const mats = q ? D().materials.filter((m) => hit(m.id, m.name, m.en, m.group, m.hs)) : [];
      const vens = q ? D().vendors.filter((v) => hit(v.id, v.name, v.mst, v.email, v.contact, v.cat)) : [];
      const docs = q ? D().docs.filter((d) => hit(d.id, d.title, d.status, ...(d.mats || []))) : [];
      const total = mats.length + vens.length + docs.length;
      const route = { PR: 'pr', TND: 'tenders', PO: 'po', GRN: 'po', CT: 'contracts', INV: 'invoices', NCR: 'po' };
      const form = block(null, `<form class="filters" data-act="search"><label class="sr" for="sq">${esc(t('sr.title'))}</label><input id="sq" class="inp grow" type="search" value="${esc(q)}" placeholder="${esc(t('sr.ph'))}"><button class="btn btn-p">${esc(t('sr.go'))}</button></form>`);
      const blocks = q ? [form,
        block(t('sr.mats', { n: mats.length }), table([
          { h: t('c.mid'), r: (m) => mid(m.id), w: '130px' }, { h: t('c.description'), r: (m) => `${esc(m.name)}<div class="small muted" lang="en">${esc(m.en)}</div>`, w: 'minmax(200px,2fr)' },
          { h: t('c.uom'), k: 'uom', w: '90px' }, { h: t('c.status'), r: (m) => pill(m.status, m.status === 'Active' ? 'success' : m.status === 'Blocked' ? 'danger' : 'warning') }
        ], mats, { min: 560, empty: t('sr.noMats'), label: t('c.mids') })),
        block(t('sr.vens', { n: vens.length }), table([
          { h: t('c.vendor'), r: (v) => `<a href="#/vendors/${esc(v.id)}"><span class="mono small">${esc(v.id)}</span> ${esc(v.name)}</a>`, w: 'minmax(240px,2fr)' }, { h: t('c.category'), r: (v) => esc(tv(v.cat)) }, { h: 'MST', r: (v) => `<span class="mono small">${esc(v.mst)}</span>` },
          { h: t('c.status'), r: (v) => pill(v.status, v.status === 'Preferred' ? 'success' : v.status === 'Probation' ? 'warning' : v.status === 'Approved' ? 'info' : 'neutral') }
        ], vens, { min: 620, empty: t('sr.noVens'), label: t('c.vendors') }), { actions: `<a class="btn btn-sm" href="#/vendors">${esc(t('c.vendors'))}</a>` }),
        block(t('sr.docs', { n: docs.length }), table([
          { h: t('c.number'), r: (d) => `<a class="mono" href="#/${route[d.type]}${['CT', 'PR', 'TND', 'PO', 'INV'].includes(d.type) ? '/' + d.id : d.po ? '/' + d.po : ''}">${esc(d.id)}</a>`, w: '150px' }, { h: t('c.title'), r: (d) => esc(tv(d.title)), w: 'minmax(200px,2fr)' }, { h: t('c.date'), k: 'date', w: '110px' },
          { h: t('c.mids'), r: (d) => (d.mats || []).map(mid).join(' '), w: 'minmax(160px,1.5fr)' }, { h: t('c.status'), r: (d) => pill(d.status, 'neutral') }
        ], docs, { min: 760, empty: t('sr.noDocs'), label: t('sr.docs', { n: docs.length }) }))]
        : [form];
      return layout({ title: t('sr.title'), subtitle: esc(q ? t('sr.results', { n: total, q }) : t('sr.hint')), blocks });
    },
    mount(root, p) { const i = root.querySelector('#sq'); if (i && !i.value) i.focus(); const g = document.getElementById('gsearch'); if (g) g.value = App.state.lastQ = (p && p.q) || ''; }
  });
})();

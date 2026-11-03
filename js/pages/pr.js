/* Module 9 · Purchase requests — F-50 header, F-51 budget check + override step (R-14), F-52 lines by Material ID with VAT split (R-03),
   F-53 sourcing rule per line (contract release / tender > 500tr / RFQ), F-54 approval route preview (R-06, R-18), F-55 typed attachments (R-19).
   Routes: #/pr (?q=), #/pr/new (?mat=; #/pr?mat= also opens the form), #/pr/<id>(/route|files) */
(function () {
  const { esc, num, pct, vnd, ty, mid, pill, table, kpi, block, layout, t, tv } = App;
  const S = App.src;
  const D = () => window.DATA;
  I18N.add({
    'pr.subtitle': ['Every PR line is a Material ID · budget-checked and routed by value excl. VAT', 'Mỗi dòng PR là một mã vật tư · kiểm tra ngân sách và định tuyến duyệt theo giá trị chưa VAT'],
    'pr.create': ['Create PR', 'Tạo PR'], 'pr.sub.list': ['Purchase requests', 'Đề nghị mua hàng'], 'pr.sub.new': ['Create PR', 'Tạo PR'],
    'pr.d.request': ['Request & lines', 'Đề nghị & dòng'], 'pr.d.route': ['Budget & approval route', 'Ngân sách & luồng duyệt'], 'pr.d.files': ['Files', 'Tệp'],
    'pr.k.open': ['Open PRs', 'PR đang mở'], 'pr.k.awaiting': ['Awaiting approval', 'Chờ phê duyệt'], 'pr.k.drafts': ['Drafts', 'Nháp'], 'pr.k.sample': ['This sample', 'Mẫu này'], 'pr.k.inTender': ['In tender', 'Đang đấu thầu'], 'pr.k.inTenderN': ['Value > 500tr, no contract', 'Giá trị > 500tr, chưa có hợp đồng'],
    'pr.exportMsg': ['Exported PR_02-11-2026.xlsx ({n} rows)', 'Đã xuất PR_02-11-2026.xlsx ({n} dòng)'], 'pr.searchLbl': ['Search PRs', 'Tìm PR'], 'pr.searchPh': ['Search PR, title, Material ID or requester', 'Tìm PR, tên, mã vật tư hoặc người đề nghị'],
    'pr.allStatuses': ['All statuses', 'Mọi trạng thái'], 'pr.c.value': ['Value excl. VAT', 'Giá trị chưa VAT'], 'pr.c.requester': ['Requester', 'Người đề nghị'], 'pr.empty': ['No PRs match these filters', 'Không có PR phù hợp bộ lọc'],
    'pr.src.contract': ['Release PO from contract {c} · {b} / {cm} {u} left', 'Phát hành PO từ hợp đồng {c} · còn {b} / {cm} {u}'], 'pr.src.after': ['{n} {u} left after this line', 'Còn {n} {u} sau dòng này'],
    'pr.src.short': ['Contract {c} has only {b} {u} left — tender the rest', 'Hợp đồng {c} chỉ còn {b} {u} — phần còn lại phải đấu thầu'], 'pr.src.tender': ['Tender required, value > 500tr', 'Bắt buộc đấu thầu, giá trị > 500tr'],
    'pr.src.noCt': ['No active contract for this Material ID', 'Mã vật tư chưa có hợp đồng hiệu lực'], 'pr.src.rfq': ['RFQ · 3 quotations (≤ 500tr)', 'Chào giá · 3 báo giá (≤ 500tr)'], 'pr.src.Contract': ['Contract', 'Hợp đồng'], 'pr.src.Tender': ['Tender', 'Đấu thầu'], 'pr.src.RFQ': ['RFQ', 'Chào giá'],
    'pr.sod.lead': ['SoD: requester is the Procurement Lead', 'SoD: người đề nghị là Trưởng phòng Mua sắm'], 'pr.capexRule': ['capex rule EQP- > {v}', 'quy tắc capex EQP- > {v}'], 'pr.skipped': ['skipped (already approved earlier step)', 'bỏ qua (đã duyệt ở bước trước)'],
    'pr.fd': ['Finance Director', 'Giám đốc Tài chính'],
    'pr.l.mat': ['Material ID for line {n}', 'Mã vật tư dòng {n}'], 'pr.l.ph': ['Type a Material ID or name', 'Nhập mã vật tư hoặc tên'], 'pr.l.sugg': ['Material ID suggestions', 'Gợi ý mã vật tư'], 'pr.l.qty': ['Quantity line {n}', 'Số lượng dòng {n}'], 'pr.l.price': ['Unit price line {n}', 'Đơn giá dòng {n}'],
    'pr.l.last': ['Last {po}', 'Gần nhất {po}'], 'pr.l.remove': ['Remove line {n}', 'Xóa dòng {n}'], 'pr.l.table': ['PR lines', 'Dòng PR'], 'pr.c.qty': ['Qty', 'SL'], 'pr.c.unit': ['Unit price excl. VAT', 'Đơn giá chưa VAT'], 'pr.c.amount': ['Amount excl. VAT', 'Thành tiền chưa VAT'], 'pr.c.sourcing': ['Sourcing', 'Hình thức mua'],
    'pr.noMatch': ['No active Material ID matches', 'Không có mã vật tư đang hoạt động phù hợp'], 'pr.reqNew': ['Request a new Material ID', 'Đề nghị mã vật tư mới'],
    'pr.vatOn': ['VAT {r} on', 'VAT {r} trên'], 'pr.plusVat': ['{a} + VAT {b}', '{a} + VAT {b}'], 'pr.totEx': ['Total excl. VAT', 'Tổng chưa VAT'], 'pr.totIn': ['Total incl. VAT', 'Tổng gồm VAT'],
    'pr.b.title': ['Budget check', 'Kiểm tra ngân sách'], 'pr.b.mapped': ['{n} · line mapped from the Material ID group', '{n} · dòng ngân sách theo nhóm mã vật tư'], 'pr.b.aria': ['Budget {b}: invoiced {i}, committed {c}, this PR {p}, remaining {r}', 'Ngân sách {b}: đã hóa đơn {i}, đã cam kết {c}, PR này {p}, còn lại {r}'],
    'pr.b.budget': ['Budget', 'Ngân sách'], 'pr.b.invoiced': ['Invoiced', 'Đã xuất hóa đơn'], 'pr.b.committed': ['Committed (open POs)', 'Đã cam kết (PO đang mở)'], 'pr.b.available': ['Available', 'Còn khả dụng'], 'pr.b.thisPr': ['This PR', 'PR này'], 'pr.b.after': ['After this PR', 'Sau PR này'],
    'pr.b.over': ['Over budget by {v}. A Budget override step for the Finance Director is added to the route.', 'Vượt ngân sách {v}. Luồng duyệt được thêm bước Vượt ngân sách cho Giám đốc Tài chính.'], 'pr.b.overJust': ['Override justification', 'Giải trình vượt ngân sách'],
    'pr.b.overHint': ['Sent to the Finance Director with the PR', 'Gửi Giám đốc Tài chính cùng PR'], 'pr.b.formula': ['Available = Budget − Invoiced − Committed.', 'Khả dụng = Ngân sách − Đã hóa đơn − Đã cam kết.'],
    'pr.r.title': ['Approval route preview', 'Xem trước luồng duyệt'], 'pr.r.title2': ['Approval route', 'Luồng duyệt'], 'pr.r.skipped': ['Skipped', 'Bỏ qua'], 'pr.r.step': ['Step {i} of {n}', 'Bước {i}/{n}'], 'pr.r.sla': ['SLA 2 working days', 'SLA 2 ngày làm việc'],
    'pr.r.b1': ['≤ {v} — Dept head', '≤ {v} — Trưởng bộ phận'], 'pr.r.b2': ['≤ {v} — + Procurement Lead', '≤ {v} — + Trưởng phòng Mua sắm'], 'pr.r.b3': ['> {v} — + Finance Director', '> {v} — + Giám đốc Tài chính'],
    'pr.r.capex': ['EQP- capex above {v} adds the Finance Director · ', 'Capex EQP- trên {v} thêm Giám đốc Tài chính · '], 'pr.r.over': ['over budget adds Budget override (Admin › Approval matrix)', 'vượt ngân sách thêm bước Vượt ngân sách (Quản trị › Ma trận phê duyệt)'],
    'pr.r.note': ['Route for {v} excl. VAT. SoD: the requester cannot approve their own PR; an approver who already approved a step is skipped.', 'Luồng duyệt cho {v} chưa VAT. SoD: người đề nghị không được tự duyệt PR; người đã duyệt một bước sẽ được bỏ qua.'],
    'pr.form': ['Request · {id}', 'Đề nghị · {id}'], 'pr.newPr': ['New PR', 'PR mới'], 'pr.f.requester': ['Requester', 'Người đề nghị'], 'pr.f.dept': ['Department', 'Bộ phận'], 'pr.f.project': ['Project', 'Dự án'], 'pr.f.cc': ['Cost centre / budget line', 'Trung tâm chi phí / dòng ngân sách'],
    'pr.f.cat': ['Category', 'Nhóm hàng'], 'pr.f.need': ['Needed by', 'Cần trước ngày'], 'pr.f.site': ['Delivery location', 'Địa điểm giao'], 'pr.f.reason': ['Justification', 'Lý do'],
    'pr.addLine': ['Add line', 'Thêm dòng'], 'pr.importBoq': ['Import BOQ', 'Nhập BOQ'], 'pr.importMsg': ['Import BOQ: map the Material ID column of your Excel file', 'Nhập BOQ: chọn cột mã vật tư trong tệp Excel'],
    'pr.lastSaved': ['Last saved {d}', 'Lưu lần cuối {d}'], 'pr.savedAt': ['Last saved', 'Lưu lần cuối'], 'pr.notSaved': ['Not saved yet', 'Chưa lưu'], 'pr.priceNote': ['unit prices default to the last PO price of the Material ID · totals split by VAT rate.', 'đơn giá mặc định theo giá PO gần nhất của mã vật tư · tổng tiền tách theo thuế suất.'],
    'pr.submit': ['Submit for approval', 'Gửi duyệt'], 'pr.returned': ['Returned for changes by {by} · {at}:', 'Bị trả lại để sửa bởi {by} · {at}:'], 'pr.returnedN': ['Edit the request and submit it again.', 'Hãy sửa đề nghị và gửi lại.'],
    'pr.e.empty': ['Empty line — remove it or choose a Material ID.', 'Dòng trống — xóa dòng hoặc chọn mã vật tư.'], 'pr.e.mat': ['Choose a Material ID from the suggestions.', 'Chọn mã vật tư từ danh sách gợi ý.'], 'pr.e.qty': ['Enter a quantity above 0.', 'Nhập số lượng lớn hơn 0.'],
    'pr.e.price': ['Enter a unit price above 0.', 'Nhập đơn giá lớn hơn 0.'], 'pr.e.lines': ['Add at least one line.', 'Thêm ít nhất một dòng.'], 'pr.e.project': ['Enter the project.', 'Nhập dự án.'], 'pr.e.site': ['Enter the delivery location.', 'Nhập địa điểm giao.'],
    'pr.e.reason': ['Give a justification of at least 10 characters.', 'Nhập lý do ít nhất 10 ký tự.'], 'pr.e.need': ['Needed-by date must be after today.', 'Ngày cần phải sau hôm nay.'], 'pr.e.override': ['Over budget: justify the override (at least 20 characters).', 'Vượt ngân sách: giải trình ít nhất 20 ký tự.'],
    'pr.submitted': ['{id} submitted · step 1 of {n}: {s} · SLA 2 working days', 'Đã gửi {id} · bước 1/{n}: {s} · SLA 2 ngày làm việc'], 'pr.savedDraft': ['{id} saved as draft', 'Đã lưu nháp {id}'],
    'pr.summary': ['Summary', 'Tóm tắt'], 'pr.neededBy': ['needed by {d}', 'cần trước {d}'], 'pr.openAp': ['Open in My approvals', 'Mở trong Chờ tôi duyệt'], 'pr.openT': ['Open {id}', 'Mở {id}'], 'pr.createTender': ['Create tender', 'Tạo gói thầu'],
    'pr.k.tot': ['Total excl. VAT', 'Tổng chưa VAT'], 'pr.k.lines': ['Lines', 'Số dòng'], 'pr.k.steps': ['Approval steps', 'Số bước duyệt'], 'pr.k.override': ['Includes budget override', 'Có bước vượt ngân sách'], 'pr.k.slaEach': ['SLA 2 working days each', 'SLA 2 ngày làm việc mỗi bước'],
    'pr.linesBy': ['Lines by Material ID', 'Dòng theo mã vật tư'], 'pr.vatSum': ['VAT {r} on {v}', 'VAT {r} trên {v}'], 'pr.totInB': ['total incl. VAT', 'tổng gồm VAT'], 'pr.req': ['Request', 'Đề nghị'], 'pr.cc': ['Cost centre', 'Trung tâm chi phí'], 'pr.delivery': ['Delivery', 'Giao hàng'],
    'pr.notFound': ['Purchase request {id} was not found.', 'Không tìm thấy đề nghị mua hàng {id}.'], 'pr.back': ['Back to purchase requests', 'Về danh sách đề nghị mua hàng'], 'pr.valueEx': ['{v} excl. VAT', '{v} chưa VAT']
  });
  I18N.values({ 'Dept head': 'Trưởng bộ phận', 'Procurement Lead': 'Trưởng phòng Mua sắm', 'Finance Director': 'Giám đốc Tài chính', 'Budget override': 'Vượt ngân sách', Returned: 'Trả lại', Requester: 'Người đề nghị', Buyer: 'Người mua', Chair: 'Chủ tịch' });
  const st = { q: '', status: 'all', cur: null, ed: null, errs: {}, up: null };
  const tones = { Draft: 'neutral', Submitted: 'info', 'Awaiting approval': 'warning', Approved: 'success', 'In tender': 'info', Closed: 'neutral', Rejected: 'danger', Returned: 'warning' };
  const TENDER_MIN = 500000000;
  const DEPTS = ['Phòng Mua hàng', 'Nhà máy Bình Dương', 'Nhà xưởng C2', 'Kho A', 'Kho B'];

  const mat = (id) => App.material(id);
  const lineVal = (l) => (+l.qty || 0) * (+l.price || 0);
  const totals = (lines) => {
    const by = {}; lines.filter((l) => mat(l.mat)).forEach((l) => { const v = mat(l.mat).vat; by[v] = (by[v] || 0) + lineVal(l); });
    const net = Object.values(by).reduce((a, x) => a + x, 0); const vat = Object.entries(by).reduce((a, [r, x]) => a + x * r / 100, 0);
    return { by, net, vat, gross: net + vat };
  };
  const contractFor = (m) => D().contracts.find((c) => c.lines.some((l) => l.mat === m) && ['Active', 'Expiring'].includes((S.docOf(c.id) || {}).status));
  /* F-53: walk the lines in order, consuming the contract's remaining quantity */
  function sourcing(lines) {
    const left = {};
    return lines.map((l) => {
      const m = mat(l.mat); if (!m) return null;
      const c = contractFor(m.id);
      if (c) {
        const commit = c.lines.reduce((a, x) => a + x.commit, 0); const rel = c.lines.reduce((a, x) => a + x.released, 0);
        const before = left[c.id] != null ? left[c.id] : commit - rel; const after = before - (+l.qty || 0); left[c.id] = after;
        if (after >= 0) return { kind: 'contract', c, text: t('pr.src.contract', { c: c.id, b: num(before), cm: num(commit), u: m.uom }), sub: t('pr.src.after', { n: num(after), u: m.uom }) };
        return { kind: 'tender', text: t('pr.src.short', { c: c.id, b: num(before), u: m.uom }), sub: '' };
      }
      return lineVal(l) > TENDER_MIN ? { kind: 'tender', text: t('pr.src.tender'), sub: t('pr.src.noCt') } : { kind: 'rfq', text: t('pr.src.rfq'), sub: t('pr.src.noCt') };
    });
  }
  /* F-54: route by value excl. VAT + extra steps. step = [role, approver name, note text] */
  function route(pr, lines) {
    const tot = totals(lines).net; const b = D().budgets[pr.cc]; const avail = b ? b.budget - b.invoiced - b.committed : Infinity;
    const B1 = D().approvalBands[0][0], B2 = D().approvalBands[1][0], CR = D().approvalRules[0], CX = CR.above; const capOn = CR.on !== false, budOn = D().approvalRules[1].on !== false;
    const steps = [['Dept head', pr.dept, '']];
    if (tot > B1) steps.push(pr.requester === 'Nguyễn Minh Anh' ? ['Procurement Lead', 'Đỗ Hoàng Nam', t('pr.sod.lead')] : ['Procurement Lead', 'Nguyễn Minh Anh', '']);
    const capex = capOn && lines.some((l) => /^EQP-/.test(l.mat)) && tot > CX;
    if (tot > B2 || capex) steps.push(['Finance Director', 'Đỗ Hoàng Nam', tot <= B2 && capex ? t('pr.capexRule', { v: App.ty(CX) }) : '']);
    if (budOn && tot > avail) steps.push(['Budget override', 'Đỗ Hoàng Nam', t('pr.fd')]);
    const seen = new Set(); steps.forEach((s) => { if (seen.has(s[1])) { s[2] = t('pr.skipped'); s.skip = true; } seen.add(s[1]); });
    const active = steps.filter((s) => !s.skip);
    return { steps, active, n: active.length, tot, over: tot > avail };
  }
  const who = (s) => `${s[1]}${s[2] ? ' — ' + s[2] : ''}`;
  const chainHtml = (R, sla) => `<ol class="chain">${R.steps.map((x) => `<li><span class="small muted">${esc(x.skip ? t('pr.r.skipped') : t('pr.r.step', { i: R.active.indexOf(x) + 1, n: R.n }))}</span><b>${esc(tv(x[0]))}</b><span class="small">${esc(who(x))}</span>${sla && !x.skip ? `<span class="small muted">${esc(t('pr.r.sla'))}</span>` : ''}</li>`).join('')}</ol>`;
  const notFound = (id) => layout({ title: t('nav.pr'), blocks: [block(null, App.errorState(t('pr.notFound', { id })) + `<p class="m-0"><a class="btn" href="#/pr">${esc(t('pr.back'))}</a></p>`)] });

  /* ---------- List ---------- */
  function listBlock(all) {
    const q = st.q.trim();
    const rows = all.filter((d) => (st.status === 'all' || d.status === st.status) && (!q || App.matches(`${d.id} ${d.title} ${d.mats.join(' ')} ${d.by} ${d.mats.map((m) => (mat(m) || {}).name).join(' ')}`, q))).sort((a, b) => App.dt(b.date) - App.dt(a.date));
    const statuses = [...new Set(all.map((d) => d.status))];
    return block(t('pr.sub.list'), `<div class="filters"><label class="sr" for="pr-q">${esc(t('pr.searchLbl'))}</label><input class="inp grow" id="pr-q" type="search" data-prf="q" value="${esc(st.q)}" placeholder="${esc(t('pr.searchPh'))}">
        <label class="sr" for="pr-s">${esc(t('c.status'))}</label><select class="inp" id="pr-s" data-prf="status"><option value="all">${esc(t('pr.allStatuses'))}</option>${statuses.map((s) => `<option value="${esc(s)}"${st.status === s ? ' selected' : ''}>${esc(tv(s))}</option>`).join('')}</select></div>
        ${table([
          { h: 'PR', r: (d) => `<a class="mono" href="#/pr/${esc(d.id)}">${esc(d.id)}</a><div class="small">${esc(d.title)}</div>`, w: 'minmax(220px,2.2fr)' },
          { h: t('c.mids'), r: (d) => `<span class="chips chips-inline">${d.mats.map(mid).join('')}</span>`, w: 'minmax(170px,1.8fr)' },
          { h: t('pr.c.value'), r: (d) => vnd(d.value), cls: 'num', w: '150px' },
          { h: t('pr.c.requester'), r: (d) => `${esc(d.by)}<div class="small muted">${esc(d.date)}</div>`, w: 'minmax(140px,1.2fr)' },
          { h: t('c.status'), r: (d) => `${pill(d.status, tones[d.status] || 'neutral')}${d.next ? `<div class="small">${S.tndLink(d.next)}</div>` : ''}`, w: 'minmax(140px,1.2fr)' }
        ], rows, { empty: t('pr.empty'), label: t('pr.sub.list') })}`,
    { actions: `<button class="btn btn-sm" data-act="toast" data-msg="${esc(t('pr.exportMsg', { n: rows.length }))}">${esc(t('c.export'))}</button>` });
  }

  /* ---------- Editor (create / draft) ---------- */
  function startEdit(id, p) {
    if (id && D().prs[id]) { const pr = D().prs[id]; st.ed = { id, f: { requester: pr.requester, dept: pr.dept, project: pr.project, cc: pr.cc, cat: pr.cat, need: pr.need, site: pr.site, reason: pr.reason, override: pr.override || '' }, lines: pr.lines.map((l) => ({ ...l, q: l.mat })), files: pr.files.slice(), saved: pr.saved }; }
    else {
      const m = p.mat && mat(p.mat);
      st.ed = { id: null, f: { requester: S.me(), dept: 'Phòng Mua hàng', project: '', cc: 'KHOB-VLXD', cat: m ? m.cat : 'CON', need: '', site: '', reason: '', override: '' }, lines: [m ? { mat: m.id, q: m.id, qty: '', price: m.last || m.avg90 || '' } : { mat: '', q: '', qty: '', price: '' }], files: [], saved: null };
    }
    st.errs = {}; st.up = null;
  }
  const sugg = (q) => (q.trim().length < 2 ? [] : D().materials.filter((m) => m.status === 'Active' && App.matches(`${m.id} ${m.name} ${m.en} ${m.group}`, q)).slice(0, 6));
  const suggHtml = (i, q) => { const s = sugg(q); return s.length ? s.map((m) => `<li role="option" tabindex="-1" data-pick="${esc(m.id)}" data-i="${i}"><span class="mono small">${esc(m.id)}</span> ${esc(m.name)} <span class="small muted">· ${esc(m.uom)} · VAT ${m.vat}%</span></li>`).join('') : (q.trim().length >= 2 ? `<li class="small muted" role="presentation">${esc(t('pr.noMatch'))} · <a href="#/materials/new">${esc(t('pr.reqNew'))}</a></li>` : ''); };
  const vatDl = (tt) => `<dl class="dl mt">${Object.entries(tt.by).sort((a, b) => b[0] - a[0]).map(([r, x]) => `<dt>${esc(t('pr.vatOn', { r: S.vatLabel(r) }))}</dt><dd>${esc(t('pr.plusVat', { a: vnd(x), b: vnd(x * r / 100) }))}</dd>`).join('')}<dt>${esc(t('pr.totEx'))}</dt><dd><b>${vnd(tt.net)}</b></dd><dt>VAT</dt><dd>${vnd(tt.vat)}</dd><dt>${esc(t('pr.totIn'))}</dt><dd><b>${vnd(tt.gross)}</b></dd></dl>`;

  function formBlock() {
    const E = st.ed; const f = E.f; const e = st.errs; const id = E.id || t('pr.newPr');
    const lines = E.lines; const tt = totals(lines); const src = sourcing(lines);
    const lineRows = lines.map((l, i) => {
      const m = mat(l.mat); const s = src[i]; const err = e['l' + i];
      return `<div class="tr pr-cols" role="row">
        <div class="td" role="cell"><div class="look"><label class="sr" for="pl-m${i}">${esc(t('pr.l.mat', { n: i + 1 }))}</label><input class="inp w-full" id="pl-m${i}" data-pl="q" data-i="${i}" value="${esc(l.q || l.mat)}" placeholder="${esc(t('pr.l.ph'))}" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="pl-s${i}"${err && err.mat ? ` aria-invalid="true" aria-describedby="pl-e${i}"` : ''}>
          <ul class="look-l" id="pl-s${i}" role="listbox" aria-label="${esc(t('pr.l.sugg'))}"></ul></div>
          ${m ? `<div class="small mt-s">${mid(m.id)} ${esc(m.name)}</div>` : ''}${err ? `<div class="err small" id="pl-e${i}" role="alert">${esc(t(err.mat || err.qty))}</div>` : ''}</div>
        <div class="td num" role="cell"><label class="sr" for="pl-q${i}">${esc(t('pr.l.qty', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="pl-q${i}" data-pl="qty" data-i="${i}" inputmode="decimal" value="${esc(l.qty)}"${err && err.qty ? ' aria-invalid="true"' : ''}> <span class="small muted">${esc(m ? m.uom : '')}</span></div>
        <div class="td num" role="cell"><label class="sr" for="pl-p${i}">${esc(t('pr.l.price', { n: i + 1 }))}</label><input class="inp inp-num w-full" id="pl-p${i}" data-pl="price" data-i="${i}" inputmode="numeric" value="${esc(l.price === '' ? '' : num(l.price))}">${m && m.lastPo ? `<div class="small muted">${esc(t('pr.l.last', { po: m.lastPo }))}</div>` : ''}</div>
        <div class="td" role="cell">${m ? esc(S.vatLabel(m.vat)) : '—'}</div>
        <div class="td num" role="cell">${m ? vnd(lineVal(l)) : '—'}</div>
        <div class="td" role="cell">${s ? `${pill(t('pr.src.' + (s.kind === 'contract' ? 'Contract' : s.kind === 'tender' ? 'Tender' : 'RFQ')), s.kind === 'contract' ? 'success' : s.kind === 'tender' ? 'warning' : 'info')}<div class="small">${s.kind === 'contract' ? `<a href="#/contracts/${esc(s.c.id)}">${esc(s.text)}</a>` : esc(s.text)}</div>${s.sub ? `<div class="small muted">${esc(s.sub)}</div>` : ''}` : '—'}</div>
        <div class="td" role="cell"><button type="button" class="btn btn-sm" data-pr="del-line" data-i="${i}" aria-label="${esc(t('pr.l.remove', { n: i + 1 }))}">${esc(t('c.remove'))}</button></div></div>`;
    }).join('');
    const linesTbl = `<div class="tbl-wrap" tabindex="0" role="region" aria-label="${esc(t('c.scrolls', { label: t('pr.l.table') }))}"><div class="tbl tbl-1100" role="table"><div class="tr thead pr-cols" role="row"><div class="th">${esc(t('c.mid'))}</div><div class="th num">${esc(t('pr.c.qty'))}</div><div class="th num">${esc(t('pr.c.unit'))}</div><div class="th">VAT</div><div class="th num">${esc(t('pr.c.amount'))}</div><div class="th">${esc(t('pr.c.sourcing'))}</div><div class="th"></div></div>${lineRows}</div></div>`;
    return block(t('pr.form', { id }), `<form id="pr-form" class="stack" novalidate>
      ${e._ ? `<div class="alert alert-danger" role="alert">${esc(S.errText(e._))}</div>` : ''}${e.override ? `<div class="alert alert-danger" role="alert">${esc(t('pr.e.override'))}${E.id ? ` <a href="#/pr/${esc(E.id)}/route">${esc(t('pr.d.route'))}</a>` : ''}</div>` : ''}
      <div class="form-grid">${S.field('pr', e, 'requester', t('pr.f.requester'), f.requester, { dis: true })}${S.field('pr', e, 'dept', t('pr.f.dept'), f.dept, { options: DEPTS.map((x) => [x, x]) })}
        ${S.field('pr', e, 'project', t('pr.f.project'), f.project, { req: true })}${S.field('pr', e, 'cc', t('pr.f.cc'), f.cc, { options: Object.entries(D().budgets).map(([k, v]) => [k, `${k} · ${tv(v.name)}`]) })}
        ${S.field('pr', e, 'cat', t('pr.f.cat'), f.cat, { options: D().categories.map((c) => [c.code, App.state.lang === 'vi' ? c.vi : c.name]) })}${S.field('pr', e, 'need', t('pr.f.need'), f.need, { req: true, ph: 'dd/mm/yyyy' })}
        ${S.field('pr', e, 'site', t('pr.f.site'), f.site, { req: true })}${S.field('pr', e, 'reason', t('pr.f.reason'), f.reason, { area: true, req: true })}</div>
      <h3 class="h-sub">${esc(t('tn.linesN', { n: lines.length }))}</h3>${linesTbl}
      <div class="row-acts start mt"><button type="button" class="btn btn-sm" data-pr="add-line">${esc(t('pr.addLine'))}</button><button type="button" class="btn btn-sm" data-act="toast" data-msg="${esc(t('pr.importMsg'))}">${esc(t('pr.importBoq'))}</button><a class="btn btn-sm" href="#/materials/new">${esc(t('pr.reqNew'))}</a></div>
      ${vatDl(tt)}
      <p class="small muted">${esc(E.saved ? t('pr.lastSaved', { d: E.saved }) : t('pr.notSaved'))} · ${esc(t('pr.priceNote'))}</p>
      <div class="row-acts"><a class="btn" href="#/pr">${esc(t('c.cancel'))}</a><button type="button" class="btn" data-pr="save">${esc(t('c.saveDraft'))}</button><button type="submit" class="btn btn-p">${esc(t('pr.submit'))}</button></div></form>`);
  }
  function budgetBlock(f, lines, editing) {
    const b = D().budgets[f.cc]; if (!b) return '';
    const tt = totals(lines); const avail = b.budget - b.invoiced - b.committed; const left = avail - tt.net; const e = st.errs;
    const segs = [[b.invoiced, ''], [b.committed, 'warn'], [Math.min(tt.net, Math.max(avail, 0)), 'pr'], [Math.max(left, 0), 'rest']];
    return block(t('pr.b.title'), `<p class="small muted mt-0">${esc(t('pr.b.mapped', { n: tv(b.name) }))}</p>
      <div class="stack-bar" role="img" aria-label="${esc(t('pr.b.aria', { b: ty(b.budget), i: ty(b.invoiced), c: ty(b.committed), p: ty(tt.net), r: ty(left) }))}">${segs.map(([v, c]) => `<span class="sb-${c || 'inv'}" style="width:${(v / b.budget * 100).toFixed(2)}%"></span>`).join('')}</div>
      <dl class="dl dl-num mt"><dt>${esc(t('pr.b.budget'))}</dt><dd>${vnd(b.budget)}</dd><dt><span class="sw sb-inv" aria-hidden="true"></span>${esc(t('pr.b.invoiced'))}</dt><dd>${vnd(b.invoiced)}</dd><dt><span class="sw sb-warn" aria-hidden="true"></span>${esc(t('pr.b.committed'))}</dt><dd>${vnd(b.committed)}</dd><dt>${esc(t('pr.b.available'))}</dt><dd><b>${vnd(avail)}</b></dd><dt><span class="sw sb-pr" aria-hidden="true"></span>${esc(t('pr.b.thisPr'))}</dt><dd>−${vnd(tt.net)}</dd>
        <dt class="tot">${left < 0 ? '' : '<span class="sw sb-rest" aria-hidden="true"></span>'}${esc(t('pr.b.after'))}</dt><dd class="tot"><b class="${left < 0 ? 'tone-danger' : ''}">${left < 0 ? '−' : ''}${vnd(Math.abs(left))}</b> (${pct(left / b.budget * 100)})</dd></dl>
      ${left < 0 ? `<div class="alert alert-danger" role="alert">${esc(t('pr.b.over', { v: vnd(-left) }))}</div>${editing ? S.field('pr', e, 'override', t('pr.b.overJust'), f.override, { area: true, req: true, hint: t('pr.b.overHint') }) : f.override ? `<p class="small"><b>${esc(t('pr.b.overJust'))}:</b> ${esc(f.override)}</p>` : ''}` : `<p class="small muted">${esc(t('pr.b.formula'))}</p>`}`, { span: 6 });
  }
  function routeBlock(f, lines, preview) {
    const R = route(f, lines.filter((l) => mat(l.mat)));
    return block(t(preview ? 'pr.r.title' : 'pr.r.title2'), `${chainHtml(R, preview)}
      <ul class="plain small"><li${R.tot <= D().approvalBands[0][0] ? ' class="tone-success"' : ''}>${esc(t('pr.r.b1', { v: vnd(D().approvalBands[0][0]) }))}</li><li>${esc(t('pr.r.b2', { v: vnd(D().approvalBands[1][0]) }))}</li><li>${esc(t('pr.r.b3', { v: vnd(D().approvalBands[1][0]) }))}</li><li>${esc((D().approvalRules[0].on !== false ? t('pr.r.capex', { v: App.ty(D().approvalRules[0].above) }) : '') + t('pr.r.over'))}</li></ul>
      <p class="small muted">${esc(t('pr.r.note', { v: vnd(R.tot) }))}</p>`, { span: 6 });
  }

  function readEd(root) {
    if (!root.querySelector('#pr-form') && !root.querySelector('#pr-override')) return;
    if (root.querySelector('#pr-form')) Object.assign(st.ed.f, S.read(root, '#pr-form .form-grid'));
    const ov = root.querySelector('#pr-override'); if (ov) st.ed.f.override = ov.value.trim();
    root.querySelectorAll('[data-pl]').forEach((el) => { const l = st.ed.lines[+el.dataset.i]; const k = el.dataset.pl; if (k === 'q') l.q = el.value; else if (k === 'qty') l.qty = el.value.replace(',', '.'); else l.price = el.value === '' ? '' : S.money(el.value); });
  }
  function save(root, submit) {
    readEd(root); const E = st.ed; const f = E.f; const e = {};
    E.lines.forEach((l, i) => {
      if (!l.mat && !(l.q || '').trim() && !l.qty) { e['l' + i] = { mat: 'pr.e.empty' }; return; }
      if (!mat(l.mat) || (l.q && l.q !== l.mat)) e['l' + i] = { mat: 'pr.e.mat' };
      else if (!(+l.qty > 0)) e['l' + i] = { qty: 'pr.e.qty' };
      else if (!(+l.price > 0)) e['l' + i] = { qty: 'pr.e.price' };
    });
    if (!E.lines.length) e._ = 'pr.e.lines';
    if (submit) {
      if (!f.project) e.project = 'pr.e.project'; if (!f.site) e.site = 'pr.e.site'; if ((f.reason || '').length < 10) e.reason = 'pr.e.reason';
      if (!S.validDate(f.need)) e.need = 'c.dateFmt'; else if (App.daysTo(f.need) <= 0) e.need = 'pr.e.need';
      const b = D().budgets[f.cc]; if (b && totals(E.lines).net > b.budget - b.invoiced - b.committed && (f.override || '').length < 20) e.override = 'pr.e.override';
    }
    st.errs = e;
    if (Object.keys(e).length) {
      App.render();
      if (Object.keys(e).length === 1 && e.override) { const o = document.getElementById('pr-override'); if (o) { o.focus(); o.scrollIntoView({ block: 'center' }); } } else S.focusErr('#pr-form');
      return;
    }
    const lines = E.lines.map((l) => ({ mat: l.mat, qty: +l.qty, price: +l.price })); const net = totals(lines).net;
    let id = E.id;
    if (!id) {
      const n = Math.max(...D().docs.filter((d) => d.type === 'PR').map((d) => +d.id.slice(8))) + 1; id = 'PR-2026-' + String(n).padStart(4, '0');
      D().docs.push({ id, type: 'PR', title: f.project, date: D().today, status: 'Draft', mats: [], value: 0, by: f.requester });
    }
    const d = S.docOf(id); Object.assign(d, { mats: [...new Set(lines.map((l) => l.mat))], value: net, title: d.title || f.project });
    D().prs[id] = Object.assign(D().prs[id] || {}, { ...f, lines, files: E.files, saved: D().today + ' 10:30' });
    const R = route(f, lines);
    const go = () => { const h = '#/pr/' + id; if (location.hash === h) App.render(); else location.hash = h; };
    if (submit) {
      d.status = 'Awaiting approval'; delete d.returned;
      D().approvals = D().approvals.filter((x) => x.id !== id);
      const first = R.active[0];
      D().approvals.push({ id, type: 'PR approval', title: d.title, mats: d.mats, value: net, by: f.requester, step: 'Step 1 of ' + R.n, sla: App.addDays(D().today, 2) + ' 17:00', assignee: first[1] });
      D().approvalChains[id] = [[f.requester + ' · Requester', 'Submitted', D().today + ' 10:30', f.override || '']].concat(R.active.map(([s, w], k) => [w + ' · ' + s, k ? 'Next' : 'Waiting', '', '']));
      st.ed = null; st.cur = null; go(); App.toast(t('pr.submitted', { id, n: R.n, s: tv(first[0]) }));
    } else { d.status = 'Draft'; st.ed.saved = D().today + ' 10:30'; if (!E.id) { st.ed = null; st.cur = null; go(); } else App.render(); App.toast(t('pr.savedDraft', { id })); }
  }

  /* ---------- Detail ---------- */
  const DSUBS = [['', 'pr.d.request'], ['route', 'pr.d.route'], ['files', 'pr.d.files']];
  function detail(d, subArg, p) {
    const pr = D().prs[d.id]; const cur = App.sub(DSUBS, subArg || '');
    const editing = ['Draft', 'Returned'].includes(d.status) && pr;
    if (editing && !st.ed) startEdit(d.id, p);
    const crumbs = `<a href="#/pr">${esc(t('nav.pr'))}</a> / ${esc(d.id)}`; const titleHtml = `<span class="mono">${esc(d.id)}</span> ${esc(d.title)}`;
    if (!pr) return layout({ crumbs, titleHtml, subtitle: pill(d.status, tones[d.status] || 'neutral'), blocks: [block(t('pr.summary'), `<dl class="dl"><dt>${esc(t('c.mids'))}</dt><dd>${d.mats.map(mid).join(' ')}</dd><dt>${esc(t('c.value'))}</dt><dd>${esc(t('pr.valueEx', { v: vnd(d.value) }))}</dd><dt>${esc(t('pr.c.requester'))}</dt><dd>${esc(d.by)}</dd></dl>`)] });
    const f = editing ? st.ed.f : pr; const lines = editing ? st.ed.lines : pr.lines; const files = editing ? st.ed.files : pr.files;
    const tt = totals(lines); const R = route(f, lines.filter((l) => mat(l.mat)));
    const appr = D().approvals.find((a) => a.id === d.id);
    const kpis = [kpi(t('pr.k.tot'), ty(tt.net), vnd(tt.net)), kpi('VAT', vnd(tt.vat), esc(Object.keys(tt.by).map((r) => r + '%').join(' + ') || '—')), kpi(t('pr.k.lines'), String(lines.length), esc([...new Set(lines.filter((l) => l.mat).map((l) => l.mat.slice(0, 3)))].join(', ') || '—')),
      kpi(t('pr.k.steps'), String(R.n), esc(R.over ? t('pr.k.override') : t('pr.k.slaEach')), R.over ? 'danger' : '')];
    const ret = d.status === 'Returned' ? D().approvalHistory.filter((h) => h.id === d.id).pop() : null;
    const alerts = ret ? `<div class="alert alert-warning" role="status"><b>${esc(t('pr.returned', { by: ret.by, at: ret.at }))}</b> “${esc(ret.comment)}” ${esc(t('pr.returnedN'))}</div>` : '';
    let blocks;
    if (cur === 'route') blocks = [budgetBlock(f, lines, editing), routeBlock(f, lines, editing)];
    else if (cur === 'files') blocks = [S.files('prf', files, [...new Set(lines.filter((l) => mat(l.mat)).map((l) => l.mat))], st.up, ['Specification / drawing', 'BOQ', 'Quotation', 'Other'], { block: true })];
    else if (editing) blocks = [formBlock()];
    else {
      const src = sourcing(pr.lines); const b = D().budgets[pr.cc];
      blocks = [block(t('pr.linesBy'), table([
        { h: t('c.mid'), r: (l) => `${mid(l.mat)}<div class="small">${esc(mat(l.mat).name)}</div>`, w: 'minmax(180px,2fr)' }, { h: t('pr.c.qty'), r: (l) => `${num(l.qty)} ${esc(mat(l.mat).uom)}`, cls: 'num', w: '100px' },
        { h: t('pr.c.unit'), r: (l) => vnd(l.price), cls: 'num', w: '150px' }, { h: 'VAT', r: (l) => esc(S.vatLabel(mat(l.mat).vat)), w: 'minmax(120px,1.2fr)' }, { h: t('pr.c.amount'), r: (l) => vnd(lineVal(l)), cls: 'num', w: '150px' },
        { h: t('pr.c.sourcing'), r: (l) => { const s = src[pr.lines.indexOf(l)]; return `${esc(s.text)}${s.sub ? `<div class="small muted">${esc(s.sub)}</div>` : ''}`; }, w: 'minmax(200px,2fr)' }
      ], pr.lines, { label: t('pr.l.table') }) + `<p class="small">${Object.entries(tt.by).map(([r, x]) => esc(t('pr.vatSum', { r: S.vatLabel(r), v: vnd(x) }))).join(' · ')} · ${esc(t('pr.totInB'))} <b>${vnd(tt.gross)}</b></p>`),
      block(t('pr.req'), `<dl class="dl"><dt>${esc(t('pr.f.project'))}</dt><dd>${esc(pr.project)}</dd><dt>${esc(t('pr.cc'))}</dt><dd>${esc(pr.cc)}${b ? ' · ' + esc(tv(b.name)) : ''}</dd><dt>${esc(t('pr.delivery'))}</dt><dd>${esc(pr.site)}</dd><dt>${esc(t('pr.f.reason'))}</dt><dd>${esc(pr.reason)}</dd><dt>${esc(t('pr.savedAt'))}</dt><dd>${esc(pr.saved)}</dd></dl>`, { span: 6 }),
      block(t('pr.r.title2'), chainHtml(R, false), { span: 6 })];
    }
    return layout({
      crumbs, titleHtml, subtitle: `${pill(d.status, tones[d.status] || 'neutral')} · ${esc(f.requester)} · ${esc(f.dept)}${f.need ? ' · ' + esc(t('pr.neededBy', { d: f.need })) : ''}`,
      actions: `${appr ? `<a class="btn" href="#/approvals?id=${esc(d.id)}">${esc(t('pr.openAp'))}</a>` : ''}${d.next ? `<a class="btn" href="#/tenders/${esc(d.next)}">${esc(t('pr.openT', { id: d.next }))}</a>` : ''}${d.status === 'Approved' ? `<a class="btn btn-p" href="#/tenders/new?pr=${esc(d.id)}">${esc(t('pr.createTender'))}</a><a class="btn" href="#/po/new?pr=${esc(d.id)}">${esc(t('tn.createPo'))}</a>` : ''}`,
      alerts: App.unknownSub(DSUBS, subArg) + alerts, kpis, subnav: App.subnav('pr/' + d.id, DSUBS, cur), blocks
    });
  }

  const LSUBS = [['', 'pr.sub.list'], ['new', 'pr.sub.new']];
  App.page('pr', {
    titleKey: 'nav.pr', ws: 'procurement', roles: ['procurement', 'admin'],
    render(p, subArg) {
      const parts = (subArg || '').split('/'); const head = parts[0] || '';
      const isNew = head === 'new' || (!head && p.mat);
      const key = head ? (isNew ? 'new' + (p.mat || '') : head) : isNew ? 'new' + p.mat : 'list';
      if (st.cur !== key) { st.cur = key; st.ed = null; st.errs = {}; st.up = null; }
      if (head && !isNew) { const d = D().docs.find((x) => x.type === 'PR' && x.id === head); return d ? detail(d, parts.slice(1).join('/'), p) : notFound(head); }
      if (p.q != null && p.q !== st.lastQ) { st.q = p.q; st.lastQ = p.q; }
      const all = D().docs.filter((d) => d.type === 'PR');
      if (isNew && !st.ed) startEdit(null, p);
      const E = st.ed;
      return layout({
        title: t('nav.pr'), subtitle: esc(t('pr.subtitle')),
        actions: isNew ? '' : `<a class="btn btn-p" href="#/pr/new">${esc(t('pr.create'))}</a>`,
        kpis: [kpi(t('pr.k.open'), num(D().kpi.openPr), esc(t('c.inSample', { n: all.filter((d) => d.status !== 'Closed').length }))), kpi(t('pr.k.awaiting'), num(D().kpi.prAwaiting), esc(t('c.inSample', { n: all.filter((d) => d.status === 'Awaiting approval').length })), 'warning'),
          kpi(t('pr.k.drafts'), String(all.filter((d) => d.status === 'Draft').length), esc(t('pr.k.sample'))), kpi(t('pr.k.inTender'), String(all.filter((d) => d.status === 'In tender').length), esc(t('pr.k.inTenderN')))],
        subnav: App.subnav('pr', LSUBS, isNew ? 'new' : '', isNew && p.mat ? 'mat=' + encodeURIComponent(p.mat) : ''),
        blocks: isNew ? [formBlock(), budgetBlock(E.f, E.lines, true), routeBlock(E.f, E.lines, true), S.files('prf', E.files, [...new Set(E.lines.filter((l) => mat(l.mat)).map((l) => l.mat))], st.up, ['Specification / drawing', 'BOQ', 'Quotation', 'Other'], { block: true })] : [listBlock(all)]
      });
    },
    mount(root) {
      const box = (i) => root.querySelector('#pl-s' + i);
      root.addEventListener('input', (e) => {
        if (e.target.dataset.prf === 'q') { st.q = e.target.value; const pos = e.target.selectionStart; App.render(); const i = document.getElementById('pr-q'); i.focus(); i.setSelectionRange(pos, pos); return; }
        if (e.target.dataset.pl === 'q') { const i = +e.target.dataset.i; st.ed.lines[i].q = e.target.value; const ul = box(i); ul.innerHTML = suggHtml(i, e.target.value); e.target.setAttribute('aria-expanded', String(!!ul.children.length)); }
        if (e.target.id === 'pr-override' && st.ed) st.ed.f.override = e.target.value.trim();
      });
      root.addEventListener('mousedown', (e) => { if (e.target.closest('button[type=submit], [data-pr=save]')) st.hold = true; });
      root.addEventListener('change', (e) => {
        if (e.target.dataset.prf === 'status') { st.status = e.target.value; App.render(); return; }
        if (!st.ed) return;
        if (e.target.dataset.pl === 'qty' || e.target.dataset.pl === 'price' || e.target.name === 'cc') { const id = e.target.id; readEd(root); if (st.hold) { st.hold = false; return; } App.render(); const x = document.getElementById(id); x && x.focus(); }
      });
      root.addEventListener('keydown', (e) => {
        if (e.target.dataset.pl === 'q' && e.key === 'ArrowDown') { const f = box(+e.target.dataset.i).querySelector('[data-pick]'); if (f) { e.preventDefault(); f.focus(); } }
        else if (e.target.dataset.pick && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.target.click(); }
        else if (e.target.dataset.pick && e.key === 'ArrowDown' && e.target.nextElementSibling) { e.preventDefault(); e.target.nextElementSibling.focus(); }
        else if (e.target.dataset.pick && e.key === 'ArrowUp') { e.preventDefault(); (e.target.previousElementSibling || root.querySelector('#pl-m' + e.target.dataset.i)).focus(); }
        else if (e.key === 'Escape' && e.target.closest('.look')) { const ul = e.target.closest('.look').querySelector('ul'); ul.innerHTML = ''; root.querySelector('#pl-m' + ul.id.slice(4)).focus(); }
      });
      root.addEventListener('submit', (e) => {
        if (e.target.id === 'pr-form') { e.preventDefault(); st.hold = false; save(root, true); }
        if (e.target.id === 'prf-up') { e.preventDefault(); const id = (location.hash.split('/')[2] || '').split('?')[0]; const list = st.ed ? st.ed.files : (D().prs[id] || { files: [] }).files; if (st.ed) readEd(root); st.up = S.upload(root, 'prf', list); App.render(); }
      });
      root.addEventListener('click', (e) => {
        const pk = e.target.closest('[data-pick]');
        if (pk) { readEd(root); const i = +pk.dataset.i; const m = mat(pk.dataset.pick); Object.assign(st.ed.lines[i], { mat: m.id, q: m.id, price: m.last || m.avg90 || '' }); if (st.errs['l' + i]) delete st.errs['l' + i]; App.render(); const q = document.getElementById('pl-q' + i); q && q.focus(); return; }
        const b = e.target.closest('[data-pr], [data-files]'); if (!b) return;
        if (b.dataset.files === 'open') { if (st.ed) readEd(root); st.up = { errs: {} }; App.render(); const x = document.getElementById('prf-up-name'); x && x.focus(); return; }
        if (b.dataset.files === 'cancel') { st.up = null; App.render(); return; }
        const a = b.dataset.pr;
        if (a === 'add-line') { readEd(root); st.ed.lines.push({ mat: '', q: '', qty: '', price: '' }); App.render(); const x = document.getElementById('pl-m' + (st.ed.lines.length - 1)); x && x.focus(); }
        else if (a === 'del-line') { readEd(root); st.ed.lines.splice(+b.dataset.i, 1); st.errs = {}; App.render(); }
        else if (a === 'save') { st.hold = false; save(root, false); }
      });
    }
  });
})();

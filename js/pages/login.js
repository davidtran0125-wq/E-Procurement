/* Module 1 · Login & roles — F-01 Gmail sign-in (allowlist), F-02 role routing, F-03 supplier invitation, F-04 privacy consent (R-25) */
(function () {
  const { esc, t } = App;
  I18N.add({
    'lg.role.procurement': ['Procurement', 'Mua sắm'], 'lg.role.procurement.d': ['Material IDs, vendors, tenders, PR/PO, invoices, approvals', 'Mã vật tư, NCC, đấu thầu, PR/PO, hóa đơn, phê duyệt'],
    'lg.role.supplier': ['Supplier', 'Nhà cung cấp'], 'lg.role.supplier.d': ['Invitations to bid, quotations, POs, deliveries, e-invoices', 'Thư mời thầu, báo giá, PO, giao hàng, hóa đơn điện tử'],
    'lg.role.admin': ['Admin', 'Quản trị'], 'lg.role.admin.d': ['Users & roles, access policy, approval matrix, audit log', 'Người dùng & vai trò, chính sách truy cập, ma trận phê duyệt, nhật ký'],
    'lg.pn.title': ['Privacy notice v2.1', 'Thông báo bảo mật v2.1'], 'lg.pn.eff': ['Effective 01/01/2026', 'Hiệu lực 01/01/2026'],
    'lg.pn.intro': ['Under Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, [YOUR COMPANY] processes the following personal data when you use ProcureLink.', 'Theo Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, [TÊN CÔNG TY] xử lý các dữ liệu cá nhân sau khi bạn dùng ProcureLink.'],
    'lg.pn.data': ['Data', 'Dữ liệu'], 'lg.pn.data.v': ['Your name, Gmail address, role, sign-in times and the actions you take (audit log).', 'Họ tên, địa chỉ Gmail, vai trò, thời điểm đăng nhập và các thao tác của bạn (nhật ký).'],
    'lg.pn.purpose': ['Purpose', 'Mục đích'], 'lg.pn.purpose.v': ['Sign-in, access control by role, approvals and supplier communication.', 'Đăng nhập, phân quyền theo vai trò, phê duyệt và trao đổi với nhà cung cấp.'],
    'lg.pn.ret': ['Retention', 'Thời gian lưu'], 'lg.pn.ret.v': ['While your account is active plus 5 years for procurement records; sign-in logs 12 months.', 'Trong thời gian tài khoản hoạt động và thêm 5 năm với hồ sơ mua sắm; nhật ký đăng nhập 12 tháng.'],
    'lg.pn.rights': ['Your rights', 'Quyền của bạn'], 'lg.pn.rights.v': ['Ask the System Admin to export or delete your personal data. Consent can be withdrawn at any time.', 'Yêu cầu Quản trị hệ thống xuất hoặc xóa dữ liệu cá nhân. Có thể rút lại đồng ý bất cứ lúc nào.'],
    'lg.pn.contact': ['Contact', 'Liên hệ'], 'lg.pn.contact.v': ['[DATA PROTECTION CONTACT EMAIL]', '[EMAIL LIÊN HỆ BẢO VỆ DỮ LIỆU]'],
    'lg.chooseWs': ['Choose workspace', 'Chọn không gian làm việc'], 'lg.gmail': ['Gmail account', 'Tài khoản Gmail'],
    'lg.gmailHint': ['Only Gmail accounts on the Admin allowlist can sign in. Roles are assigned by the Admin.', 'Chỉ tài khoản Gmail trong danh sách cho phép mới đăng nhập được. Vai trò do Quản trị gán.'],
    'lg.continue': ['Continue with Gmail', 'Tiếp tục với Gmail'],
    'lg.inviteIntro': ['Suppliers invited by email: enter the Gmail address the invitation was sent to and the code from the email. Invitations are valid for 7 days.', 'Nhà cung cấp được mời qua email: nhập Gmail đã nhận thư mời và mã trong email. Thư mời có hiệu lực 7 ngày.'],
    'lg.invGmail': ['Invited Gmail', 'Gmail được mời'], 'lg.invCode': ['Invitation code', 'Mã mời'], 'lg.accept': ['Accept invitation & sign in', 'Chấp nhận lời mời & đăng nhập'],
    'lg.hero': ['E-procurement linked by Material ID', 'Mua sắm điện tử liên kết theo mã vật tư'],
    'lg.heroSub': ['One record per Material ID connects vendors, tenders, purchase requests, purchase orders, deliveries and invoices.', 'Mỗi mã vật tư kết nối nhà cung cấp, gói thầu, đề nghị mua hàng, đơn đặt hàng, giao hàng và hóa đơn.'],
    'lg.pt1': ['Procurement: sourcing, approvals, price history', 'Mua sắm: tìm nguồn, phê duyệt, lịch sử giá'], 'lg.pt2': ['Supplier: bids, POs, e-invoices in one portal', 'Nhà cung cấp: hồ sơ thầu, PO, hóa đơn điện tử trong một cổng'], 'lg.pt3': ['Admin: users, policies and audit log', 'Quản trị: người dùng, chính sách và nhật ký'],
    'lg.method': ['Sign-in method', 'Cách đăng nhập'], 'lg.staff': ['Staff & suppliers', 'Nhân viên & nhà cung cấp'], 'lg.haveInv': ['I have an invitation', 'Tôi có thư mời'],
    'lg.consent': ['I agree that [YOUR COMPANY] processes my name and Gmail address to provide ProcureLink, as described in the', 'Tôi đồng ý để [TÊN CÔNG TY] xử lý họ tên và địa chỉ Gmail của tôi để cung cấp ProcureLink, như mô tả trong'],
    'lg.pnLink': ['Privacy notice {v}', 'Thông báo bảo mật {v}'], 'lg.2sv': ['Admins and approvers must have Google 2-step verification. Sessions end after 30 minutes idle.', 'Quản trị và người phê duyệt phải bật xác minh 2 bước của Google. Phiên kết thúc sau 30 phút không hoạt động.'],
    'lg.privacy': ['Privacy', 'Bảo mật'], 'lg.terms': ['Terms', 'Điều khoản'], 'lg.help': ['Help', 'Trợ giúp'],
    'lg.termsMsg': ['Terms of use: [YOUR COMPANY] procurement terms v1.3', 'Điều khoản sử dụng: điều khoản mua sắm [TÊN CÔNG TY] v1.3'], 'lg.helpMsg': ['Help: contact the System Admin, Phạm Thu Trang', 'Trợ giúp: liên hệ Quản trị hệ thống, Phạm Thu Trang'],
    'lg.e.gmail': ['Enter a Gmail address (name@gmail.com).', 'Nhập địa chỉ Gmail (ten@gmail.com).'], 'lg.e.allow': ['This Gmail account is not on the allowlist. Ask your System Admin for access.', 'Tài khoản Gmail này chưa có trong danh sách cho phép. Hãy liên hệ Quản trị hệ thống.'],
    'lg.e.role': ['{name} has no {role} role. Assigned: {roles}.', '{name} không có vai trò {role}. Vai trò được gán: {roles}.'], 'lg.e.inactive': ['This account is not active yet. Use "I have an invitation".', 'Tài khoản chưa kích hoạt. Hãy dùng "Tôi có thư mời".'],
    'lg.e.consent': ['Please accept the privacy notice to continue.', 'Vui lòng đồng ý với thông báo bảo mật để tiếp tục.'], 'lg.e.invite': ['No open invitation matches this Gmail and code.', 'Không có thư mời nào khớp Gmail và mã này.'],
    'lg.e.consentInv': ['Please accept the privacy notice to activate your account.', 'Vui lòng đồng ý với thông báo bảo mật để kích hoạt tài khoản.'], 'lg.accepted': ['Invitation accepted · {v} account activated', 'Đã chấp nhận lời mời · tài khoản {v} đã kích hoạt']
  });
  const ROLES = [
    ['procurement', 'lg.role.procurement', 'lg.role.procurement.d', 'minhanh.nguyen@gmail.com'],
    ['supplier', 'lg.role.supplier', 'lg.role.supplier.d', 'sales.minhphat@gmail.com'],
    ['admin', 'lg.role.admin', 'lg.role.admin.d', 'thutrang.pham@gmail.com']
  ];
  const st = { role: 'procurement', mode: 'gmail', err: '', inviteErr: '', consent: false, privacy: false };

  const gIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';

  function privacy() {
    return `<section class="card privacy" id="privacy-notice" aria-labelledby="pn-h">
      <div class="card-h"><h2 id="pn-h">${esc(t('lg.pn.title'))}</h2><span class="pill pill-info">${esc(t('lg.pn.eff'))}</span><div class="card-a"><button class="btn btn-sm" data-lg="privacy-close">${esc(t('c.close'))}</button></div></div>
      <p class="muted">${esc(t('lg.pn.intro'))}</p>
      <dl class="dl">
        ${['data', 'purpose', 'ret', 'rights', 'contact'].map((k) => `<dt>${esc(t('lg.pn.' + k))}</dt><dd>${esc(t('lg.pn.' + k + '.v'))}</dd>`).join('')}
      </dl></section>`;
  }

  function render() {
    const role = ROLES.find((r) => r[0] === st.role);
    const roleCards = ROLES.map(([k, l, d]) => `<label class="role-c${st.role === k ? ' on' : ''}"><input type="radio" name="role" value="${k}"${st.role === k ? ' checked' : ''}><b>${esc(t(l))}</b><span class="muted small">${esc(t(d))}</span></label>`).join('');
    const gmail = `<form class="stack" data-lg="gmail" novalidate>
        <fieldset class="roles"><legend class="lbl">${esc(t('lg.chooseWs'))}</legend>${roleCards}</fieldset>
        <div class="field"><label for="lg-email">${esc(t('lg.gmail'))}</label><input id="lg-email" type="email" autocomplete="email" value="${esc(role[3])}" aria-describedby="lg-hint${st.err ? ' lg-err' : ''}">
          <span class="hint" id="lg-hint">${esc(t('lg.gmailHint'))}</span>${st.err ? `<span class="err" id="lg-err" role="alert">${esc(st.err)}</span>` : ''}</div>
        <button class="btn btn-gmail" type="submit">${gIcon}${esc(t('lg.continue'))}</button>
      </form>`;
    const invite = `<form class="stack" data-lg="invite" novalidate>
        <p class="muted small m-0">${esc(t('lg.inviteIntro'))}</p>
        <div class="field"><label for="iv-email">${esc(t('lg.invGmail'))}</label><input id="iv-email" type="email" value="kho.phumy@gmail.com"></div>
        <div class="field"><label for="iv-code">${esc(t('lg.invCode'))}</label><input id="iv-code" value="PL-INV-7Q4K" class="mono"></div>
        ${st.inviteErr ? `<div class="alert alert-danger" role="alert">${esc(st.inviteErr)}</div>` : ''}
        <button class="btn btn-gmail" type="submit">${gIcon}${esc(t('lg.accept'))}</button>
      </form>`;
    return `<div class="login">
      <div class="login-l">
        <div class="brand"><span class="logo" aria-hidden="true">PL</span><span>ProcureLink</span></div>
        <h1>${esc(t('lg.hero'))}</h1>
        <p class="muted">${esc(t('lg.heroSub'))}</p>
        <ul class="login-pts"><li>${esc(t('lg.pt1'))}</li><li>${esc(t('lg.pt2'))}</li><li>${esc(t('lg.pt3'))}</li></ul>
      </div>
      <div class="login-r">
        <main class="card login-card" id="main" lang="${App.state.lang}">
          <div class="row-acts between"><h2>${esc(t('login.title'))}</h2>${App.langBtn()}</div>
          <div class="seg" role="tablist" aria-label="${esc(t('lg.method'))}">
            <button role="tab" data-lg="mode" data-mode="gmail" aria-selected="${st.mode === 'gmail'}">${esc(t('lg.staff'))}</button>
            <button role="tab" data-lg="mode" data-mode="invite" aria-selected="${st.mode === 'invite'}">${esc(t('lg.haveInv'))}</button>
          </div>
          ${st.mode === 'gmail' ? gmail : invite}
          <label class="consent"><input type="checkbox" id="lg-consent"${st.consent ? ' checked' : ''}> <span>${esc(t('lg.consent'))} <button type="button" class="linkish" data-lg="privacy">${esc(t('lg.pnLink', { v: window.DATA.privacy.current }))}</button> (Luật BVDLCN 91/2025/QH15).</span></label>
          <p class="muted small m-0">${esc(t('lg.2sv'))}</p>
          <div class="login-f small"><button type="button" class="linkish" data-lg="privacy">${esc(t('lg.privacy'))}</button><button type="button" class="linkish" data-lg="info" data-msg="${esc(t('lg.termsMsg'))}">${esc(t('lg.terms'))}</button><button type="button" class="linkish" data-lg="info" data-msg="${esc(t('lg.helpMsg'))}">${esc(t('lg.help'))}</button></div>
        </main>
        ${st.privacy ? privacy() : ''}
      </div></div>`;
  }

  function mount(root) {
    const rerender = () => { App.render(); };
    root.onchange = (e) => {
      if (!document.querySelector('.login')) return;
      if (e.target.name === 'role') { st.role = e.target.value; st.err = ''; rerender(); }
      if (e.target.id === 'lg-consent') st.consent = e.target.checked;
    };
    root.onclick = (e) => {
      const t = e.target.closest('[data-lg]'); if (!t) return;
      const a = t.dataset.lg;
      if (a === 'mode') { st.mode = t.dataset.mode; rerender(); }
      if (a === 'privacy') { st.privacy = true; rerender(); const p = document.getElementById('privacy-notice'); p && p.scrollIntoView({ block: 'nearest' }); }
      if (a === 'privacy-close') { st.privacy = false; rerender(); }
      if (a === 'info') App.toast(t.dataset.msg);
    };
    root.onsubmit = (e) => {
      const f = e.target, U = window.DATA.users;
      if (!f.dataset.lg) return;
      e.preventDefault();
      if (f.dataset.lg === 'gmail') {
        const email = root.querySelector('#lg-email').value.trim().toLowerCase();
        const u = U.find((x) => x.email === email);
        if (!/^[^@\s]+@gmail\.com$/.test(email)) st.err = t('lg.e.gmail');
        else if (!u) st.err = t('lg.e.allow');
        else if (!u.roles.includes(st.role)) st.err = t('lg.e.role', { name: u.name, role: t('ws.' + st.role), roles: u.roles.map((r) => t('ws.' + r)).join(', ') });
        else if (u.status !== 'Active') st.err = t('lg.e.inactive');
        else if (!st.consent) st.err = t('lg.e.consent');
        else { st.err = ''; App.login(st.role, u); recordConsent(u); return; }
        rerender();
      } else {
        const email = root.querySelector('#iv-email').value.trim().toLowerCase();
        const code = root.querySelector('#iv-code').value.trim().toUpperCase();
        const u = U.find((x) => x.email === email && x.inviteCode === code);
        if (!u) st.inviteErr = t('lg.e.invite');
        else if (!st.consent) st.inviteErr = t('lg.e.consentInv');
        else { u.status = 'Active'; u.consentVer = null; st.inviteErr = ''; App.login('supplier', u); recordConsent(u); App.toast(t('lg.accepted', { v: u.vendor })); return; }
        rerender();
      }
    };
  }

  /* P5-06 · sign-in with the consent box ticked records acceptance of the current notice when it was missing or a re-acceptance is pending */
  function recordConsent(u) {
    const D = window.DATA; if (u.consentVer && u.consentVer !== 'Re-acceptance pending') return;
    u.consent = D.today; u.consentVer = D.privacy.current; D.privacy.accepted = (D.privacy.accepted || 0) + 1; App.src.audit('Data privacy', 'Privacy notice ' + u.consentVer + ' accepted', u.email);
  }
  App.page('login', { titleKey: 'login.title', render, mount });
})();

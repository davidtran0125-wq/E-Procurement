/* Module 1 · Login & roles — F-01 Gmail sign-in (allowlist), F-02 role routing, F-03 supplier invitation, F-04 privacy consent (R-25) */
(function () {
  const { esc } = App;
  const ROLES = [
    ['procurement', 'Procurement', 'Material IDs, vendors, tenders, PR/PO, invoices, approvals', 'minhanh.nguyen@gmail.com'],
    ['supplier', 'Supplier', 'Invitations to bid, quotations, POs, deliveries, e-invoices', 'sales.minhphat@gmail.com'],
    ['admin', 'Admin', 'Users & roles, access policy, approval matrix, audit log', 'thutrang.pham@gmail.com']
  ];
  const st = { role: 'procurement', mode: 'gmail', err: '', inviteErr: '', consent: false, privacy: false };

  const gIcon = '<svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.8 3.3-8z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.2-2.7l-3.5-2.7c-1 .7-2.2 1-3.7 1-2.9 0-5.3-1.9-6.2-4.5H2.2v2.8A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.2a11 11 0 0 0 0 9.8l3.6-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.6l3.1-3.1A11 11 0 0 0 2.2 7.1l3.6 2.8C6.7 7.3 9.1 5.4 12 5.4z"/></svg>';

  function privacy() {
    return `<section class="card privacy" id="privacy-notice" aria-labelledby="pn-h">
      <div class="card-h"><h2 id="pn-h">Privacy notice v2.1</h2><span class="pill pill-info">Effective 01/01/2026</span><div class="card-a"><button class="btn btn-sm" data-lg="privacy-close">Close</button></div></div>
      <p class="muted">Under Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, [YOUR COMPANY] processes the following personal data when you use ProcureLink.</p>
      <dl class="dl">
        <dt>Data</dt><dd>Your name, Gmail address, role, sign-in times and the actions you take (audit log).</dd>
        <dt>Purpose</dt><dd>Sign-in, access control by role, approvals and supplier communication.</dd>
        <dt>Retention</dt><dd>While your account is active plus 5 years for procurement records; sign-in logs 12 months.</dd>
        <dt>Your rights</dt><dd>Ask the System Admin to export or delete your personal data. Consent can be withdrawn at any time.</dd>
        <dt>Contact</dt><dd>[DATA PROTECTION CONTACT EMAIL]</dd>
      </dl></section>`;
  }

  function render() {
    const role = ROLES.find((r) => r[0] === st.role);
    const roleCards = ROLES.map(([k, l, d]) => `<label class="role-c${st.role === k ? ' on' : ''}"><input type="radio" name="role" value="${k}"${st.role === k ? ' checked' : ''}><b>${l}</b><span class="muted small">${d}</span></label>`).join('');
    const gmail = `<form class="stack" data-lg="gmail" novalidate>
        <fieldset class="roles"><legend class="lbl">Choose workspace</legend>${roleCards}</fieldset>
        <div class="field"><label for="lg-email">Gmail account</label><input id="lg-email" type="email" autocomplete="email" value="${esc(role[3])}" aria-describedby="lg-hint${st.err ? ' lg-err' : ''}">
          <span class="hint" id="lg-hint">Only Gmail accounts on the Admin allowlist can sign in. Roles are assigned by the Admin.</span>${st.err ? `<span class="err" id="lg-err" role="alert">${esc(st.err)}</span>` : ''}</div>
        <button class="btn btn-gmail" type="submit">${gIcon}Continue with Gmail</button>
      </form>`;
    const invite = `<form class="stack" data-lg="invite" novalidate>
        <p class="muted small m-0">Suppliers invited by email: enter the Gmail address the invitation was sent to and the code from the email. Invitations are valid for 7 days.</p>
        <div class="field"><label for="iv-email">Invited Gmail</label><input id="iv-email" type="email" value="kho.phumy@gmail.com"></div>
        <div class="field"><label for="iv-code">Invitation code</label><input id="iv-code" value="PL-INV-7Q4K" class="mono"></div>
        ${st.inviteErr ? `<div class="alert alert-danger" role="alert">${esc(st.inviteErr)}</div>` : ''}
        <button class="btn btn-gmail" type="submit">${gIcon}Accept invitation &amp; sign in</button>
      </form>`;
    return `<div class="login">
      <div class="login-l">
        <div class="brand"><span class="logo" aria-hidden="true">PL</span><span>ProcureLink</span></div>
        <h1>E-procurement linked by Material ID</h1>
        <p class="muted">One record per Material ID connects vendors, tenders, purchase requests, purchase orders, deliveries and invoices.</p>
        <ul class="login-pts"><li>Procurement: sourcing, approvals, price history</li><li>Supplier: bids, POs, e-invoices in one portal</li><li>Admin: users, policies and audit log</li></ul>
      </div>
      <div class="login-r">
        <main class="card login-card" id="main">
          <h2>Sign in</h2>
          <div class="seg" role="tablist" aria-label="Sign-in method">
            <button role="tab" data-lg="mode" data-mode="gmail" aria-selected="${st.mode === 'gmail'}">Staff &amp; suppliers</button>
            <button role="tab" data-lg="mode" data-mode="invite" aria-selected="${st.mode === 'invite'}">I have an invitation</button>
          </div>
          ${st.mode === 'gmail' ? gmail : invite}
          <label class="consent"><input type="checkbox" id="lg-consent"${st.consent ? ' checked' : ''}> <span>I agree that [YOUR COMPANY] processes my name and Gmail address to provide ProcureLink, as described in the <button type="button" class="linkish" data-lg="privacy">Privacy notice ${window.DATA.privacy.current}</button> (Luật BVDLCN 91/2025/QH15).</span></label>
          <p class="muted small m-0">Admins and approvers must have Google 2-step verification. Sessions end after 30 minutes idle.</p>
          <div class="login-f small"><button type="button" class="linkish" data-lg="privacy">Privacy</button><button type="button" class="linkish" data-lg="info" data-msg="Terms of use: [YOUR COMPANY] procurement terms v1.3">Terms</button><button type="button" class="linkish" data-lg="info" data-msg="Help: contact the System Admin, Phạm Thu Trang">Help</button></div>
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
        if (!/^[^@\s]+@gmail\.com$/.test(email)) st.err = 'Enter a Gmail address (name@gmail.com).';
        else if (!u) st.err = 'This Gmail account is not on the allowlist. Ask your System Admin for access.';
        else if (!u.roles.includes(st.role)) st.err = `${u.name} has no ${st.role} role. Assigned: ${u.roles.join(', ')}.`;
        else if (u.status !== 'Active') st.err = 'This account is not active yet. Use "I have an invitation".';
        else if (!st.consent) st.err = 'Please accept the privacy notice to continue.';
        else { st.err = ''; App.login(st.role, u); recordConsent(u); return; }
        rerender();
      } else {
        const email = root.querySelector('#iv-email').value.trim().toLowerCase();
        const code = root.querySelector('#iv-code').value.trim().toUpperCase();
        const u = U.find((x) => x.email === email && x.inviteCode === code);
        if (!u) st.inviteErr = 'No open invitation matches this Gmail and code.';
        else if (!st.consent) st.inviteErr = 'Please accept the privacy notice to activate your account.';
        else { u.status = 'Active'; u.consentVer = null; st.inviteErr = ''; App.login('supplier', u); recordConsent(u); App.toast(`Invitation accepted · ${u.vendor} account activated`); return; }
        rerender();
      }
    };
  }

  /* P5-06 · sign-in with the consent box ticked records acceptance of the current notice when it was missing or a re-acceptance is pending */
  function recordConsent(u) {
    const D = window.DATA; if (u.consentVer && u.consentVer !== 'Re-acceptance pending') return;
    u.consent = D.today; u.consentVer = D.privacy.current; D.privacy.accepted = (D.privacy.accepted || 0) + 1; App.src.audit('Data privacy', 'Privacy notice ' + u.consentVer + ' accepted', u.email);
  }
  App.page('login', { title: 'Sign in', render, mount });
})();

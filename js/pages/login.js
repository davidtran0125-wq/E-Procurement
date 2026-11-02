App.page('login', { title: 'Sign in', render: () => `<div class="content"><h1>ProcureLink</h1>
<button class="btn btn-p" onclick="App.login('procurement')">Procurement</button>
<button class="btn" onclick="App.login('supplier')">Supplier</button>
<button class="btn" onclick="App.login('admin')">Admin</button></div>` });

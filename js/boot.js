window.addEventListener('hashchange', App.render);
window.addEventListener('DOMContentLoaded', App.render);
if (document.readyState !== 'loading') App.render();

/* Inline-SVG chart helpers shared by pages (no libraries). */
(function () {
  const { esc } = App;
  I18N.add({ 'ch.target': ['Target', 'Mục tiêu'], 'ch.legend': ['Legend', 'Chú giải'], 'ch.avg': ['Average', 'Trung bình'] });
  /* line({labels, values, target?, fmt, min?, max?, label, name?, series?}) — single series #2a78d6, dashed target #5F6672 */
  /* Charts are drawn at the box's real pixel width (re-drawn on resize) so text stays 11–12px at every breakpoint. */
  const REG = new Map(); let seq = 0;
  function line(o) {
    const id = ++seq; REG.set(id, o); if (REG.size > 40) REG.delete(REG.keys().next().value);
    return `<div class="chart-box" data-ch="${id}">${draw(o, 720)}</div>`;
  }
  function fit() {
    document.querySelectorAll('.chart-box[data-ch]').forEach((box) => {
      const o = REG.get(+box.dataset.ch); const w = Math.round(box.clientWidth);
      if (!o || !w || +box.dataset.w === w) return;
      box.dataset.w = w; box.innerHTML = draw(o, Math.max(280, w));
    });
  }
  let raf = 0; const later = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; fit(); }); };
  if (typeof MutationObserver !== "undefined") new MutationObserver(later).observe(document.documentElement, { childList: true, subtree: true });
  addEventListener('resize', later);
  function draw(o, W) {
    const extra = o.series || []; const small = W < 480; const H = Math.round(Math.min(300, Math.max(200, W * 0.3))), L = small ? 44 : 56, R = o.target != null ? 84 : extra.length ? 16 : small ? 60 : 76, T = 16, B = 30;
    const vals = o.values;
    const all = vals.concat(o.target != null ? [o.target] : []).concat(...extra.map((sr) => sr.values.filter((v) => v != null)));
    let min = o.min != null ? o.min : Math.min(...all), max = o.max != null ? o.max : Math.max(...all);
    const pad = (max - min) * 0.12 || 1; if (o.min == null) min -= pad; if (o.max == null) max += pad;
    const x = (i) => L + (i * (W - L - R)) / Math.max(1, vals.length - 1);
    const y = (v) => T + (H - T - B) * (1 - (v - min) / (max - min));
    const ticks = 4, grid = [];
    for (let i = 0; i <= ticks; i++) {
      const v = min + ((max - min) * i) / ticks;
      grid.push(`<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${i ? '#EEF0F3' : '#D9DDE3'}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#5F6672">${esc(o.fmt(v, true))}</text>`);
    }
    const pts = vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    const every = Math.ceil(o.labels.length * 44 / Math.max(1, W - L - R));
    const xl = o.labels.map((l, i) => ((i % every || o.labels.length - 1 - i < every) && i !== o.labels.length - 1 ? '' : `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#5F6672">${esc(l)}</text>`)).join('');
    const dots = vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2a78d6"><title>${esc(o.labels[i])}: ${esc(o.fmt(v))}</title></circle>`).join('');
    const tgt = o.target != null ? `<line x1="${L}" x2="${W - R}" y1="${y(o.target)}" y2="${y(o.target)}" stroke="#5F6672" stroke-dasharray="5 4"/><text x="${W - R + 6}" y="${y(o.target) + 4}" font-size="11" fill="#374151">${esc(o.targetLabel || App.t('ch.target'))}</text>` : '';
    const last = vals[vals.length - 1];
    const end = `<text x="${x(vals.length - 1) + 6}" y="${y(last) + (o.target != null && Math.abs(y(last) - y(o.target)) < 12 ? 14 : 4)}" font-size="11" font-weight="600" fill="#111827">${esc(o.fmt(last))}</text>`;
    /* Extra series (o.series: [{name, values (null = gap), color}]) — categorical order per brief; named in the legend */
    const PAL = ['#eb6834', '#1baf7a', '#eda100'];
    const ext = extra.map((sr, k) => { const c = sr.color || PAL[k % PAL.length]; const pts2 = sr.values.map((v, i) => (v == null ? null : [x(i), y(v), v, i])).filter(Boolean);
      return `<polyline points="${pts2.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="${pts2.length > 1 ? '0' : ''}"/>${pts2.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${c}" stroke="#fff" stroke-width="1"><title>${esc(sr.name)} · ${esc(o.labels[q[3]])}: ${esc(o.fmt(q[2]))}</title></circle>`).join('')}`; }).join('');
    const legend = extra.length ? `<ul class="chart-legend" aria-label="${esc(App.t('ch.legend'))}"><li><span class="lg-sw lg-0" aria-hidden="true"></span>${esc(o.name || App.t('ch.avg'))}</li>${extra.map((sr, k) => `<li><span class="lg-sw lg-${k % PAL.length + 1}" aria-hidden="true"></span>${esc(sr.name)}</li>`).join('')}</ul>` : '';
    return legend + `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">${grid.join('')}${tgt}<polyline points="${pts}" fill="none" stroke="#2a78d6" stroke-width="2.2" stroke-linejoin="round"/>${dots}${ext}${xl}${extra.length ? '' : end}</svg>`;
  }
  /* bars([{label, value, note, href}], fmt) — HTML div bars */
  function bars(rows, fmt, opts = {}) {
    const max = Math.max(...rows.map((r) => r.value), 1);
    return `<div class="hbars">${rows.map((r) => `<div class="hbar${r.dim ? ' dim' : ''}"><div class="hbar-l">${r.href ? `<a href="${esc(r.href)}">${esc(r.label)}</a>` : esc(r.label)}${r.note ? `<span class="muted small"> · ${esc(r.note)}</span>` : ''}</div><div class="bar"><span style="width:${((r.value / max) * 100).toFixed(1)}%;${opts.color ? 'background:' + opts.color : ''}"></span></div><div class="hbar-v num">${esc(fmt(r.value))}</div></div>`).join('')}</div>`;
  }
  App.chart = { line, bars };
})();

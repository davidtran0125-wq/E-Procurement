/* Inline-SVG chart helpers shared by pages (no libraries). */
(function () {
  const { esc } = App;
  /* line({labels, values, target?, fmt, min?, max?, label}) — single series #2a78d6, dashed target #5F6672 */
  function line(o) {
    const W = 720, H = 240, L = 52, R = 56, T = 16, B = 30;
    const vals = o.values;
    const all = vals.concat(o.target != null ? [o.target] : []);
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
    const xl = o.labels.map((l, i) => `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#5F6672">${esc(l)}</text>`).join('');
    const dots = vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2a78d6"><title>${esc(o.labels[i])}: ${esc(o.fmt(v))}</title></circle>`).join('');
    const tgt = o.target != null ? `<line x1="${L}" x2="${W - R}" y1="${y(o.target)}" y2="${y(o.target)}" stroke="#5F6672" stroke-dasharray="5 4"/><text x="${W - R + 6}" y="${y(o.target) + 4}" font-size="11" fill="#374151">${esc(o.targetLabel || 'Target')}</text>` : '';
    const last = vals[vals.length - 1];
    const end = `<text x="${x(vals.length - 1) + 6}" y="${y(last) + (o.target != null && Math.abs(y(last) - y(o.target)) < 12 ? 14 : 4)}" font-size="11" font-weight="600" fill="#111827">${esc(o.fmt(last))}</text>`;
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">${grid.join('')}${tgt}<polyline points="${pts}" fill="none" stroke="#2a78d6" stroke-width="2.2" stroke-linejoin="round"/>${dots}${xl}${end}</svg>`;
  }
  /* bars([{label, value, note, href}], fmt) — HTML div bars */
  function bars(rows, fmt, opts = {}) {
    const max = Math.max(...rows.map((r) => r.value), 1);
    return `<div class="hbars">${rows.map((r) => `<div class="hbar${r.dim ? ' dim' : ''}"><div class="hbar-l">${r.href ? `<a href="${esc(r.href)}">${esc(r.label)}</a>` : esc(r.label)}${r.note ? `<span class="muted small"> · ${esc(r.note)}</span>` : ''}</div><div class="bar"><span style="width:${((r.value / max) * 100).toFixed(1)}%;${opts.color ? 'background:' + opts.color : ''}"></span></div><div class="hbar-v num">${esc(fmt(r.value))}</div></div>`).join('')}</div>`;
  }
  App.chart = { line, bars };
})();

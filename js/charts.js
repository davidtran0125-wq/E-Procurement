/* Inline-SVG chart helpers shared by pages (no libraries). */
(function () {
  const { esc } = App;
  I18N.add({ 'ch.target': ['Target', 'Mục tiêu'], 'ch.legend': ['Legend', 'Chú giải'], 'ch.avg': ['Average', 'Trung bình'] });
  /* line({labels, values, target?, fmt, min?, max?, label, name?, series?}) — single series #2a78d6, dashed target #5F6672 */
  function line(o) {
    const extra = o.series || []; const W = 720, H = 240, L = 52, R = extra.length ? 96 : 76, T = 16, B = 30;
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
    const xl = o.labels.map((l, i) => `<text x="${x(i)}" y="${H - 10}" text-anchor="middle" font-size="11" fill="#5F6672">${esc(l)}</text>`).join('');
    const dots = vals.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#2a78d6"><title>${esc(o.labels[i])}: ${esc(o.fmt(v))}</title></circle>`).join('');
    const tgt = o.target != null ? `<line x1="${L}" x2="${W - R}" y1="${y(o.target)}" y2="${y(o.target)}" stroke="#5F6672" stroke-dasharray="5 4"/><text x="${W - R + 6}" y="${y(o.target) + 4}" font-size="11" fill="#374151">${esc(o.targetLabel || App.t('ch.target'))}</text>` : '';
    const last = vals[vals.length - 1];
    const end = `<text x="${x(vals.length - 1) + 6}" y="${y(last) + (o.target != null && Math.abs(y(last) - y(o.target)) < 12 ? 14 : 4)}" font-size="11" font-weight="600" fill="#111827">${esc(o.fmt(last))}</text>`;
    /* Extra series (o.series: [{name, values (null = gap), color}]) — categorical order per brief; legend + direct end labels in ink */
    const PAL = ['#eb6834', '#1baf7a', '#eda100'];
    const ends = [];
    const ext = extra.map((sr, k) => { const c = sr.color || PAL[k % PAL.length]; const pts2 = sr.values.map((v, i) => (v == null ? null : [x(i), y(v), v, i])).filter(Boolean);
      if (pts2.length) { const lp = pts2[pts2.length - 1]; ends.push({ y: lp[1], x: lp[0], t: sr.name }); }
      return `<polyline points="${pts2.map((q) => q[0].toFixed(1) + ',' + q[1].toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="1.6" stroke-dasharray="${pts2.length > 1 ? '0' : ''}"/>${pts2.map((q) => `<circle cx="${q[0]}" cy="${q[1]}" r="3.5" fill="${c}" stroke="#fff" stroke-width="1"><title>${esc(sr.name)} · ${esc(o.labels[q[3]])}: ${esc(o.fmt(q[2]))}</title></circle>`).join('')}`; }).join('');
    ends.sort((a, b) => a.y - b.y); for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 12) ends[i].y = ends[i - 1].y + 12;
    const endL = ends.map((e) => `<text x="${e.x + 6}" y="${e.y + 4}" font-size="11" fill="#111827">${esc(e.t)}</text>`).join('');
    const legend = extra.length ? `<ul class="chart-legend" aria-label="${esc(App.t('ch.legend'))}"><li><span class="lg-sw lg-0" aria-hidden="true"></span>${esc(o.name || App.t('ch.avg'))}</li>${extra.map((sr, k) => `<li><span class="lg-sw lg-${k % PAL.length + 1}" aria-hidden="true"></span>${esc(sr.name)}</li>`).join('')}</ul>` : '';
    return legend + `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">${grid.join('')}${tgt}<polyline points="${pts}" fill="none" stroke="#2a78d6" stroke-width="2.2" stroke-linejoin="round"/>${dots}${ext}${xl}${extra.length ? '' : end}${endL}</svg>`;
  }
  /* bars([{label, value, note, href}], fmt) — HTML div bars */
  function bars(rows, fmt, opts = {}) {
    const max = Math.max(...rows.map((r) => r.value), 1);
    return `<div class="hbars">${rows.map((r) => `<div class="hbar${r.dim ? ' dim' : ''}"><div class="hbar-l">${r.href ? `<a href="${esc(r.href)}">${esc(r.label)}</a>` : esc(r.label)}${r.note ? `<span class="muted small"> · ${esc(r.note)}</span>` : ''}</div><div class="bar"><span style="width:${((r.value / max) * 100).toFixed(1)}%;${opts.color ? 'background:' + opts.color : ''}"></span></div><div class="hbar-v num">${esc(fmt(r.value))}</div></div>`).join('')}</div>`;
  }
  App.chart = { line, bars };
})();

/* The research in charts: interactive rulers (BRAINPLAY-INTERACTIVE-DEPLOY-20261107-01). Plain JS, no framework, no network.
   Values verified against the sources (6 Nov 2026) and copied unchanged from the approved generation-4 preview. Effect sizes are NOT percentages. */
(function () {
  'use strict';
  var DATA = {
    lampit: { min: -0.2, max: 1, ticks: [-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1], interval: 'Hedges g, 95% confidence interval', axis: 'right', rows: [
      { label: 'Overall effect on thinking tests', value: 0.22, low: 0.15, high: 0.29, text: '0.22 [0.15 to 0.29]', clear: true,
        plain: 'Trained groups scored a little higher than comparison groups on thinking tests, right after training. A small estimated average effect on test scores.' }] },
    active: { min: -0.3, max: 1, ticks: [-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1], interval: "Effect on each group's own trained skill, 99% confidence interval", axis: 'right', selected: 2, rows: [
      { label: 'Memory', sub: 'The honest answer: unclear', value: 0.06, low: -0.14, high: 0.27, text: '0.06 [-0.14 to 0.27]', clear: false,
        plain: 'Ten years on, the memory group’s range of plausible results crosses zero, so the data do not show a clear retained effect. That is an honest “unclear”, not proof of nothing.' },
      { label: 'Reasoning', sub: 'Still better after 10 years', value: 0.23, low: 0.09, high: 0.38, text: '0.23 [0.09 to 0.38]', clear: true,
        plain: 'The reasoning group still scored higher on reasoning tests a decade later. A small but clear difference.' },
      { label: 'Processing speed', sub: 'The clearest lasting effect', value: 0.66, low: 0.43, high: 0.88, text: '0.66 [0.43 to 0.88]', clear: true,
        plain: 'The speed-training group kept the strongest edge of the three, still clearly visible ten years later.' }] },
    cochrane: { min: -0.9, max: 0.5, ticks: [], interval: 'Standardised mean difference, 95% confidence interval', axis: 'left', selected: 0, rows: [
      { label: 'End of 12 weeks', sub: 'Small benefit, favours training', value: -0.31, low: -0.57, high: -0.05, text: '−0.31 [−0.57 to −0.05]', clear: true,
        plain: 'Right after 12 or more weeks of training, a small benefit for overall thinking ability. Based on just two studies with 232 participants, and rated low certainty: promising, not proven.' },
      { label: '12 months after the intervention ended', sub: 'The honest answer: unclear', value: -0.21, low: -0.66, high: 0.24, text: '−0.21 [−0.66 to 0.24]', clear: false,
        plain: 'A year after the intervention ended, only one study (77 participants) had data, and its wide range crosses zero. It does not show a clear lasting effect.' }] }
  };

  function pct(v, d) { return ((v - d.min) / (d.max - d.min)) * 100; }
  function fmt(v) { return v.toFixed(2).replace('-', '−'); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  function rowBody(row, d) {
    var frag = document.createDocumentFragment();
    var head = el('span', 'rr-head');
    head.appendChild(el('span', 'rr-label', row.label));
    head.appendChild(el('span', row.clear ? 'rr-chip rr-chip-clear' : 'rr-chip', row.clear ? 'Clear difference' : 'Unclear'));
    head.appendChild(el('span', 'rr-value', fmt(row.value)));
    frag.appendChild(head);
    var track = el('span', 'rr-track'); track.setAttribute('aria-hidden', 'true');
    var zero = el('span', 'rr-zero'); zero.style.left = pct(0, d) + '%'; track.appendChild(zero);
    var band = el('span', row.clear ? 'rr-band rr-band-clear' : 'rr-band');
    band.style.left = pct(row.low, d) + '%'; band.style.width = (pct(row.high, d) - pct(row.low, d)) + '%'; track.appendChild(band);
    var dot = el('span', row.clear ? 'rr-dot rr-dot-clear' : 'rr-dot rr-dot-hollow'); dot.style.left = pct(row.value, d) + '%'; track.appendChild(dot);
    frag.appendChild(track);
    return frag;
  }

  function statCard(row, d) {
    var s = el('div', 'rr-stat'); s.setAttribute('aria-live', 'polite');
    var top = el('div', 'rr-stat-top');
    top.appendChild(el('span', row.clear ? 'rr-stat-num rr-num-clear' : 'rr-stat-num', fmt(row.value)));
    var side = el('span', 'rr-stat-side');
    side.appendChild(el('span', 'rr-stat-ci', row.text));
    side.appendChild(el('span', 'rr-stat-int', d.interval));
    if (row.sub) side.appendChild(el('span', row.clear ? 'rr-chip rr-chip-clear' : 'rr-chip', row.sub));
    top.appendChild(side); s.appendChild(top);
    s.appendChild(el('p', 'rr-stat-plain', row.plain));
    return s;
  }

  function build(root) {
    var d = DATA[root.getAttribute('data-ruler')];
    if (!d) return;
    var interactive = d.rows.length > 1;
    var sel = interactive ? d.selected : 0;
    var box = el('div', 'rr');
    var buttons = [];
    d.rows.forEach(function (row, i) {
      var name = row.label + ': ' + row.text + (row.clear ? '' : ', interval crosses zero');
      var r;
      if (interactive) {
        r = el('button', 'rr-row'); r.type = 'button'; r.setAttribute('aria-label', name);
        r.addEventListener('click', function () { select(i); });
        buttons.push(r);
      } else {
        r = el('div', 'rr-row rr-static'); r.setAttribute('role', 'img'); r.setAttribute('aria-label', name);
      }
      r.appendChild(rowBody(row, d)); box.appendChild(r);
    });
    if (d.axis === 'right') {
      var ticks = el('div', 'rr-ticks'); ticks.setAttribute('aria-hidden', 'true');
      d.ticks.filter(function (v) { return v > d.min && v <= d.max; }).forEach(function (v) {
        var t = el('span', v === 0 ? 'rr-tick rr-tick-zero' : 'rr-tick', v.toFixed(1).replace(/\.0$/, '').replace('-', '−')); t.style.left = pct(v, d) + '%'; ticks.appendChild(t);
      });
      box.appendChild(ticks);
      var note = el('div', 'rr-note', '0 = no difference · values to the right favour the trained group'); note.setAttribute('aria-hidden', 'true'); box.appendChild(note);
    } else {
      var axis = el('div', 'rr-axis'); axis.setAttribute('aria-hidden', 'true');
      var z = el('span', 'rr-axis-zero', '0 = no difference'); z.style.left = pct(0, d) + '%'; axis.appendChild(z);
      axis.appendChild(el('span', 'rr-favor rr-favor-left', '← favours training'));
      axis.appendChild(el('span', 'rr-favor rr-favor-right', 'favours control →'));
      box.appendChild(axis);
    }
    if (d.rows.some(function (r) { return !r.clear; })) {
      var lg = el('div', 'rr-legend'); lg.setAttribute('aria-hidden', 'true');
      lg.innerHTML = '<span><i class="rr-demo rr-demo-solid"></i> Range clear of zero</span><span><i class="rr-demo rr-demo-hollow"></i> Crosses zero: unclear</span>';
      box.appendChild(lg);
    }
    root.appendChild(box);
    var statHost = el('div'); root.appendChild(statHost);
    function select(i) {
      sel = i;
      buttons.forEach(function (b, j) { b.setAttribute('aria-pressed', j === i ? 'true' : 'false'); b.classList.toggle('is-selected', j === i); });
      statHost.textContent = ''; statHost.appendChild(statCard(d.rows[i], d));
    }
    select(sel);
  }

  function toggles() {
    document.querySelectorAll('.rr-why-btn').forEach(function (b) {
      var panel = document.getElementById(b.getAttribute('aria-controls'));
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-expanded') !== 'true';
        b.setAttribute('aria-expanded', on ? 'true' : 'false');
        panel.hidden = !on;
      });
    });
  }

  function init() { document.querySelectorAll('[data-ruler]').forEach(build); toggles(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

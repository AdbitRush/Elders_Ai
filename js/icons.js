// ═══════════════════════════════════════════════════════════════════════════════
// ICONS — one icon family (Lucide, ISC, self-hosted in js/lucide-icons.js) for every
// symbol the games draw. Game data keeps its emoji as stable keys (memory matches on
// them, recall stores "🍎 Apple" in six languages); Icon.sym() draws the icon instead.
// Symbols are drawn thick, in a deep colour with a soft tint of the same colour, so
// two different symbols always differ in shape AND colour (odd one out, counting).
// Every colour here is at least 4.5:1 against white.
// ═══════════════════════════════════════════════════════════════════════════════
const Icon = (() => {
  const L = () => window.LUCIDE || {};
  function svg(name, o) {
    o = o || {};
    const b = L()[name]; if (!b) { console.warn('Icon missing: ' + name); return ''; }  // e2e fails on this
    const size = o.size || '1em', sw = o.sw || 2.25, fill = o.fill ? 'currentColor' : 'none';
    const a11y = o.label ? `role="img" aria-label="${o.label}"` : 'aria-hidden="true" focusable="false"';
    return `<svg class="lc${o.cls ? ' ' + o.cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${fill}"` +
      `${o.fill ? ' fill-opacity="' + (o.fillOpacity || .16) + '"' : ''} stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" ${a11y}>${b}</svg>`;
  }
  // emoji key → [lucide icon, colour]
  const SYM = {
    '🍎': ['apple', '#c62828'], '🍌': ['banana', '#a16207'], '🍇': ['grape', '#6d28d9'], '🍕': ['pizza', '#c2410c'],
    '🚗': ['car', '#1d4ed8'], '🚲': ['bike', '#c2410c'], '🚌': ['bus', '#15803d'], '🚀': ['rocket', '#1d4ed8'], '⛵': ['sailboat', '#0369a1'],
    '🌸': ['flower', '#be185d'], '🌻': ['flower-2', '#b45309'], '🌹': ['rose', '#be123c'], '🌺': ['rose', '#be123c'],
    '🌿': ['leaf', '#15803d'], '🍀': ['clover', '#15803d'], '🌲': ['tree-pine', '#166534'],
    '🌞': ['sun', '#c2410c'], '☀️': ['sun', '#c2410c'], '☁️': ['cloud', '#0369a1'], '🌙': ['moon', '#4338ca'],
    '⭐': ['star', '#a16207'], '❤️': ['heart', '#be123c'],
    '🐱': ['cat', '#92400e'], '🐶': ['dog', '#78350f'], '🐕': ['dog', '#78350f'], '🐟': ['fish', '#0369a1'], '🐠': ['fish', '#0369a1'],
    '🐦': ['bird', '#0f766e'], '🐢': ['turtle', '#15803d'],
    '📘': ['book-open', '#1d4ed8'], '📚': ['book-open', '#1d4ed8'], '✏️': ['pencil', '#c2410c'], '🔑': ['key', '#a16207'],
    '🏠': ['house', '#9a3412'], '⛺': ['tent', '#15803d'], '🎪': ['tent', '#be185d'], '☂️': ['umbrella', '#7e22ce'],
    '🎵': ['music', '#4338ca'], '🔔': ['bell', '#92400e'], '🎁': ['gift', '#c62828'], '🎂': ['cake', '#db2777'], '🎈': ['balloon', '#7e22ce'],
    '🎸': ['guitar', '#9a3412'], '🎹': ['piano', '#1f2937'], '🎨': ['palette', '#c2410c'], '🎭': ['drama', '#6d28d9'],
    '⚽': ['volleyball', '#1f2937'], '☕': ['coffee', '#78350f'], '🏆': ['trophy', '#a16207'],
    // Time Journey scenario cards
    '💃': ['music', '#be185d'], '🕺': ['music', '#be185d'], '💌': ['mail', '#be123c'], '🎓': ['graduation-cap', '#1d4ed8'],
    '🏍️': ['motorbike', '#c2410c'], '🌍': ['globe', '#0369a1'], '👨‍👩‍👧‍👦': ['users', '#15803d'], '📱': ['smartphone', '#1f2937'],
    '🧓': ['sofa', '#92400e'], '👵': ['hourglass', '#92400e'], '🥣': ['soup', '#c2410c'], '🌅': ['sunrise', '#c2410c'],
  };
  const has = (e) => !!SYM[e];
  const name = (e) => (SYM[e] || [])[0];
  const color = (e) => (SYM[e] || [])[1] || '#1f2937';
  // A gameplay symbol. Unknown keys fall back to the emoji itself, so nothing can disappear.
  function sym(e, o) {
    const s = SYM[e]; if (!s || !L()[s[0]]) return e;
    o = o || {};
    return `<span class="lc-sym${o.cls ? ' ' + o.cls : ''}" style="--c:${s[1]}">${svg(s[0], { size: o.size || '1em', sw: o.sw || 2.1, fill: true, fillOpacity: .18, label: o.label })}</span>`;
  }
  // Inline icon for button labels and headings: Icon.ui('rotate-ccw') + ' New word'
  const ui = (name, o) => svg(name, Object.assign({ size: '1.15em', sw: 2.4, cls: 'lc-ui' }, o || {}));
  return { svg, sym, ui, has, name, color, SYM };
})();

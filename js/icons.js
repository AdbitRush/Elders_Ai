const Icon = (() => {
  const L = () => window.LUCIDE || {};
  function svg(name, o) {
    o = o || {};
    const b = L()[name];
    if (!b) {
      console.warn('Icon missing: ' + name);
      return '';
    }
    const size = o.size || '1em', sw = o.sw || 2.25, fill = o.fill ? 'currentColor' : 'none';
    const a11y = o.label ? `role="img" aria-label="${ o.label }"` : 'aria-hidden="true" focusable="false"';
    return `<svg class="lc${ o.cls ? ' ' + o.cls : '' }" width="${ size }" height="${ size }" viewBox="0 0 24 24" fill="${ fill }"` + `${ o.fill ? ' fill-opacity="' + (o.fillOpacity || 0.16) + '"' : '' } stroke="currentColor" stroke-width="${ sw }" stroke-linecap="round" stroke-linejoin="round" ${ a11y }>${ b }</svg>`;
  }
  const SYM = {
    '\uD83C\uDF4E': [
      'apple',
      '#c62828'
    ],
    '\uD83C\uDF4C': [
      'banana',
      '#a16207'
    ],
    '\uD83C\uDF47': [
      'grape',
      '#6d28d9'
    ],
    '\uD83C\uDF55': [
      'pizza',
      '#c2410c'
    ],
    '\uD83D\uDE97': [
      'car',
      '#1d4ed8'
    ],
    '\uD83D\uDEB2': [
      'bike',
      '#c2410c'
    ],
    '\uD83D\uDE8C': [
      'bus',
      '#15803d'
    ],
    '\uD83D\uDE80': [
      'rocket',
      '#1d4ed8'
    ],
    '\u26F5': [
      'sailboat',
      '#0369a1'
    ],
    '\uD83C\uDF38': [
      'flower',
      '#be185d'
    ],
    '\uD83C\uDF3B': [
      'flower-2',
      '#b45309'
    ],
    '\uD83C\uDF39': [
      'rose',
      '#be123c'
    ],
    '\uD83C\uDF3A': [
      'rose',
      '#be123c'
    ],
    '\uD83C\uDF3F': [
      'leaf',
      '#15803d'
    ],
    '\uD83C\uDF40': [
      'clover',
      '#15803d'
    ],
    '\uD83C\uDF32': [
      'tree-pine',
      '#166534'
    ],
    '\uD83C\uDF1E': [
      'sun',
      '#c2410c'
    ],
    '\u2600️': [
      'sun',
      '#c2410c'
    ],
    '\u2601️': [
      'cloud',
      '#0369a1'
    ],
    '\uD83C\uDF19': [
      'moon',
      '#4338ca'
    ],
    '\u2B50': [
      'star',
      '#a16207'
    ],
    '\u2764️': [
      'heart',
      '#be123c'
    ],
    '\uD83D\uDC31': [
      'cat',
      '#92400e'
    ],
    '\uD83D\uDC36': [
      'dog',
      '#78350f'
    ],
    '\uD83D\uDC15': [
      'dog',
      '#78350f'
    ],
    '\uD83D\uDC1F': [
      'fish',
      '#0369a1'
    ],
    '\uD83D\uDC20': [
      'fish',
      '#0369a1'
    ],
    '\uD83D\uDC26': [
      'bird',
      '#0f766e'
    ],
    '\uD83D\uDC22': [
      'turtle',
      '#15803d'
    ],
    '\uD83D\uDCD8': [
      'book-open',
      '#1d4ed8'
    ],
    '\uD83D\uDCDA': [
      'book-open',
      '#1d4ed8'
    ],
    '\u270F️': [
      'pencil',
      '#c2410c'
    ],
    '\uD83D\uDD11': [
      'key',
      '#a16207'
    ],
    '\uD83C\uDFE0': [
      'house',
      '#9a3412'
    ],
    '\u26FA': [
      'tent',
      '#15803d'
    ],
    '\uD83C\uDFAA': [
      'tent',
      '#be185d'
    ],
    '\u2602️': [
      'umbrella',
      '#7e22ce'
    ],
    '\uD83C\uDFB5': [
      'music',
      '#4338ca'
    ],
    '\uD83D\uDD14': [
      'bell',
      '#92400e'
    ],
    '\uD83C\uDF81': [
      'gift',
      '#c62828'
    ],
    '\uD83C\uDF82': [
      'cake',
      '#db2777'
    ],
    '\uD83C\uDF88': [
      'balloon',
      '#7e22ce'
    ],
    '\uD83C\uDFB8': [
      'guitar',
      '#9a3412'
    ],
    '\uD83C\uDFB9': [
      'piano',
      '#1f2937'
    ],
    '\uD83C\uDFA8': [
      'palette',
      '#c2410c'
    ],
    '\uD83C\uDFAD': [
      'drama',
      '#6d28d9'
    ],
    '\u26BD': [
      'volleyball',
      '#1f2937'
    ],
    '\u2615': [
      'coffee',
      '#78350f'
    ],
    '\uD83C\uDFC6': [
      'trophy',
      '#a16207'
    ],
    '\uD83D\uDC83': [
      'music',
      '#be185d'
    ],
    '\uD83D\uDD7A': [
      'music',
      '#be185d'
    ],
    '\uD83D\uDC8C': [
      'mail',
      '#be123c'
    ],
    '\uD83C\uDF93': [
      'graduation-cap',
      '#1d4ed8'
    ],
    '\uD83C\uDFCD️': [
      'motorbike',
      '#c2410c'
    ],
    '\uD83C\uDF0D': [
      'globe',
      '#0369a1'
    ],
    '\uD83D\uDC68‍\uD83D\uDC69‍\uD83D\uDC67‍\uD83D\uDC66': [
      'users',
      '#15803d'
    ],
    '\uD83D\uDCF1': [
      'smartphone',
      '#1f2937'
    ],
    '\uD83E\uDDD3': [
      'sofa',
      '#92400e'
    ],
    '\uD83D\uDC75': [
      'hourglass',
      '#92400e'
    ],
    '\uD83E\uDD63': [
      'soup',
      '#c2410c'
    ],
    '\uD83C\uDF05': [
      'sunrise',
      '#c2410c'
    ]
  };
  const has = e => !!SYM[e];
  const name = e => (SYM[e] || [])[0];
  const color = e => (SYM[e] || [])[1] || '#1f2937';
  function sym(e, o) {
    const s = SYM[e];
    if (!s || !L()[s[0]])
      return e;
    o = o || {};
    return `<span class="lc-sym${ o.cls ? ' ' + o.cls : '' }" style="--c:${ s[1] }">${ svg(s[0], {
      size: o.size || '1em',
      sw: o.sw || 2.1,
      fill: true,
      fillOpacity: 0.18,
      label: o.label
    }) }</span>`;
  }
  const ui = (name, o) => svg(name, Object.assign({
    size: '1.15em',
    sw: 2.4,
    cls: 'lc-ui'
  }, o || {}));
  return {
    svg,
    sym,
    ui,
    has,
    name,
    color,
    SYM
  };
})();
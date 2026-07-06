/* TextSize — senior-friendly global text scaling.
   Cycles 100% → 115% → 130%, persists in localStorage, applies via html{font-size}
   so every rem/Tailwind size on the site scales together. */
const TextSize = (() => {
    const KEY = 'gg-textsize';
    const SIZES = [100, 115, 130];
    const LABELS = ['A', 'A+', 'A++'];

    function idx() {
        const saved = parseInt(localStorage.getItem(KEY), 10);
        const i = SIZES.indexOf(saved);
        return i === -1 ? 0 : i;
    }

    function apply() {
        const i = idx();
        document.documentElement.style.fontSize = SIZES[i] + '%';
        const btn = document.getElementById('textsize-btn');
        if (btn) {
            btn.textContent = '🔠 ' + LABELS[i];
            btn.setAttribute('aria-label', 'Text size: ' + SIZES[i] + '%');
            btn.title = 'Text size: ' + SIZES[i] + '%';
        }
    }

    function cycle() {
        const next = SIZES[(idx() + 1) % SIZES.length];
        localStorage.setItem(KEY, String(next));
        apply();
    }

    // apply saved size as early as possible (script loads at end of body)
    apply();

    return { cycle, apply };
})();

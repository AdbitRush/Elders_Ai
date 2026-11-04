// Twenty Questions data check: every thing in js/games/twentyq.js has a different yes/no pattern, every answer
// names a real thing, and a simple halving strategy finds each thing within 14 questions (the hard limit).
//   node tools/preview/twentyq-check.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'games', 'twentyq.js'), 'utf8').replace(/function initTwentyQ[\s\S]*$/, '');
const { I, Q } = new Function(src + '; return { I: _TQ_ITEMS, Q: _TQ_Q };')();
let bad = 0;
Q.forEach(([q, ys]) => ys.forEach((y) => { if (!I.includes(y)) { console.log('unknown thing in', q, y); bad++; } }));
const pat = I.map((it) => Q.map(([, ys]) => (ys.includes(it) ? 1 : 0)).join(''));
pat.forEach((p, i) => { const j = pat.indexOf(p); if (j !== i) { console.log('same pattern:', I[i], I[j]); bad++; } });
let worst = 0;
for (const secret of I) {
  let pool = I.slice(), used = 0, asked = new Set();
  while (pool.length > 1) {
    let best = -1, bs = 1e9; Q.forEach(([, ys], k) => { if (asked.has(k)) return; const y = pool.filter((x) => ys.includes(x)).length, s = Math.max(y, pool.length - y); if (s < bs) { bs = s; best = k; } });
    asked.add(best); used++; const yes = Q[best][1].includes(secret); pool = pool.filter((x) => Q[best][1].includes(x) === yes);
  }
  used++; worst = Math.max(worst, used);
}
console.log(`${I.length} things, ${Q.length} questions; all patterns different: ${!bad}; halving finds any thing in at most ${worst} questions (guess included)`);
process.exit(bad || worst > 14 ? 1 : 0);

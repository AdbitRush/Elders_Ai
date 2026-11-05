// Balance check for Tunnel Digger: a simple careful player, no page needed. node tools/preview/sim-digger.js [games per setting]
const fs = require('fs'), path = require('path'), vm = require('vm');
const ctx = { Math, console }; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(__dirname, '../../js/games/digger.js'), 'utf8') + '\nthis._dgNew=_dgNew;this._dgTurn=_dgTurn;this._DG_DIR=_DG_DIR;', ctx);
const { _dgNew, _dgTurn, _DG_DIR } = ctx; const N = +process.argv[2] || 2000;
function clone(g) { return JSON.parse(JSON.stringify(g)); }
// the player: walk towards the nearest gem by a path avoiding sacks; refuse a step that a one-step lookahead says loses a life when another exists
function choose(g) {
  const seen = new Map([[g.px + ',' + g.py, null]]), q = [[g.px, g.py]]; let hit = null;
  const blocked = (x, y) => g.sacks.some((s) => s.x === x && s.y === y);
  while (q.length && !hit) { const [x, y] = q.shift(); for (const k of ['up', 'left', 'right', 'down']) { const [dx, dy] = _DG_DIR[k], nx = x + dx, ny = y + dy, key = nx + ',' + ny; if (nx < 0 || ny < 0 || nx >= g.W || ny >= g.H || seen.has(key) || blocked(nx, ny)) continue; seen.set(key, [x + ',' + y, k]); if (g.gems.some((m) => m.x === nx && m.y === ny)) { hit = key; break; } q.push([nx, ny]); } }
  let first = null; for (let k = hit; k && seen.get(k); k = seen.get(k)[0]) first = seen.get(k)[1];
  const safe = (d) => { const c = clone(g), l = c.lives; const r = _dgTurn(c, d); return r.moved && c.lives === l; };
  if (first && safe(first)) return first;
  for (const d of ['up', 'left', 'right', 'down']) if (safe(d)) return d;
  return first || 'up';
}
for (const diff of ['easy', 'normal', 'hard']) for (const level of [1, 4]) { let wins = 0, stuck = 0, turns = 0, livesLost = 0;
  for (let i = 0; i < N; i++) { const g = _dgNew(diff, level, Math.random), l0 = g.lives; let n = 0; while (!g.over && n++ < 600) _dgTurn(g, choose(g)); if (g.won) wins++; else if (!g.over) { stuck++; if (stuck === 1 && i < N) { const L=[]; for(let y=0;y<g.H;y++){let r='';for(let x=0;x<g.W;x++){r+= (g.px===x&&g.py===y)?'P':g.cr.some(c=>c.x===x&&c.y===y)?'C':g.sacks.some(c=>c.x===x&&c.y===y)?'S':g.gems.some(c=>c.x===x&&c.y===y)?'G':g.dug[y][x]?'.':'#';}L.push(r);} console.log(L.join(String.fromCharCode(10))); } } turns += g.turn; livesLost += l0 - g.lives; }
  console.log(`${diff} level ${level}: wins ${(100 * wins / N).toFixed(1)}%, not finished in 600 turns ${(100 * stuck / N).toFixed(1)}%, average ${Math.round(turns / N)} turns, lives lost ${(livesLost / N).toFixed(2)}`); }

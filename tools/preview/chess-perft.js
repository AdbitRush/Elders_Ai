// Checks the Chess move generator (js/games/chess.js) against the standard perft node counts.
//   node tools/preview/chess-perft.js
const fs = require('fs'), path = require('path');
const src = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'games', 'chess.js'), 'utf8').replace(/function initChess[\s\S]*$/, '');
const api = new Function(src.replace(/\bconst (_CH_\w+)/g, 'var $1') + '; return { _chStart, _chFromFen, _chPerft, _chLegal, _chApply };')();
const CASES = [
  ['start', null, [20, 400, 8902, 197281]],
  ['kiwipete', 'r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1', [48, 2039, 97862]],
  ['position 3', '8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1', [14, 191, 2812, 43238]],
  ['position 4', 'r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1', [6, 264, 9467]],
  ['position 5', 'rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8', [44, 1486, 62379]],
];
let bad = 0;
for (const [name, fen, want] of CASES) {
  const S = fen ? api._chFromFen(fen) : api._chStart();
  const got = want.map((_, d) => api._chPerft(S, d + 1));
  const ok = got.every((g, i) => g === want[i]); if (!ok) bad++;
  console.log(`${ok ? 'OK ' : 'BAD'} ${name}: ${got.join(', ')}${ok ? '' : '  (expected ' + want.join(', ') + ')'}`);
}
console.log(bad ? bad + ' position(s) wrong' : 'all perft counts match');
process.exit(bad ? 1 : 0);

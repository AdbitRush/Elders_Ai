// Runs tools/preview/e2e-suite.js in batches, one fresh process and browser per batch, saving every result as it happens.
//   node tools/preview/e2e-batches.js <dir with node_modules/playwright> <baseUrl> <outDir> [budgetMinutes=9] [minFreeMB=900]
// Resumable: a batch that finished is not repeated. Each batch gets ONE attempt; an interrupted batch stays "interrupted" until someone
// passes --retry <name>, so a timeout can never turn into a pass or a blind loop. Only this script's own child process tree is ever killed.
// A batch counts as complete only if its process exited 0 and every section it asked for wrote SECTION-END. The suite's assertions live in e2e-suite.js and are not touched here.
const path = require('path'), fs = require('fs'), os = require('os'), { spawn, execSync } = require('child_process');
const [PW, U, OUT, BUD = '9', MINF = '900'] = process.argv.slice(2); const retry = process.argv.includes('--retry') ? process.argv[process.argv.indexOf('--retry') + 1] : null;
fs.mkdirSync(OUT, { recursive: true });
const PER_BATCH_MS = 8 * 60 * 1000, deadline = Date.now() + (+BUD) * 60 * 1000;
const slices = (sec, n) => Array.from({ length: n }, (_, i) => ({ name: `${sec}.${i}of${n}`, sections: [sec], slice: `${i}/${n}` }));
const BATCHES = [...slices('1', 4), ...['2', '3', '4', '5', '6', '7', '8'].map((s) => ({ name: s, sections: [s] })), ...slices('9a', 4), { name: '9b', sections: ['9b'] }, ...slices('10', 4), ...['11', '11b', '13', '13b'].map((s) => ({ name: s, sections: [s] })), ...slices('12', 8)];
const STATE = path.join(OUT, 'state.json'); const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const saveState = () => fs.writeFileSync(STATE, JSON.stringify(state, null, 1));
const freeMB = () => { try { return Math.round(+execSync('powershell -NoProfile -c "(Get-CimInstance Win32_OperatingSystem).FreePhysicalMemory"').toString().trim() / 1024); } catch (e) { return Math.round(os.freemem() / 1048576); } };
const killTree = (pid) => { try { execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' }); } catch (e) {} };
function run(B) { return new Promise((res) => {
  const file = path.join(OUT, `batch-${B.name}.txt`); fs.writeFileSync(file, '');
  const env = { ...process.env, E2E_SECTIONS: B.sections.join(','), E2E_OUT: file }; if (B.slice) env.E2E_SLICE = B.slice; else delete env.E2E_SLICE;
  const c = spawn(process.execPath, [path.join(__dirname, 'e2e-suite.js'), PW, U], { env, stdio: ['ignore', 'ignore', fs.openSync(path.join(OUT, `batch-${B.name}.err`), 'w')] });
  let timedOut = false; const t = setTimeout(() => { timedOut = true; killTree(c.pid); }, PER_BATCH_MS); const t0 = Date.now();
  c.on('exit', (code) => { clearTimeout(t); const lines = fs.readFileSync(file, 'utf8').split('\n'); const done = B.sections.every((s) => lines.includes('SECTION-END ' + s));
    res({ status: done && code === 0 && !timedOut ? 'complete' : 'interrupted', code, timedOut, seconds: Math.round((Date.now() - t0) / 1000), pass: lines.filter((l) => l.startsWith('PASS ')).length, fail: lines.filter((l) => l.startsWith('FAIL ')).length }); });
}); }
(async () => { let stopped = '';
  for (const B of BATCHES) { const prev = state[B.name];
    if (prev && retry !== B.name) continue;   // one attempt per batch, unless this batch is named with --retry
    if (Date.now() + 60000 > deadline) { stopped = 'time budget used'; break; }
    const f = freeMB(); if (f < +MINF) { stopped = `low memory: ${f} MB free, below ${MINF}`; break; }
    const r = await run(B); r.freeMBBefore = f; state[B.name] = { ...r, sections: B.sections, slice: B.slice || '' }; saveState();
    console.log(`${B.name}: ${r.status} ${r.pass} pass ${r.fail} fail ${r.seconds}s free ${f}MB${r.timedOut ? ' TIMED OUT' : ''}`);
  }
  const never = BATCHES.filter((B) => !state[B.name]).map((B) => B.name), inter = BATCHES.filter((B) => state[B.name] && state[B.name].status === 'interrupted').map((B) => B.name);
  const tot = Object.values(state).reduce((a, s) => ({ p: a.p + s.pass, f: a.f + s.fail }), { p: 0, f: 0 });
  console.log(`\n${stopped ? 'STOPPED: ' + stopped + '\n' : ''}batches complete ${BATCHES.length - never.length - inter.length}/${BATCHES.length}; interrupted: ${inter.join(' ') || 'none'}; never ran: ${never.join(' ') || 'none'}; checks saved: ${tot.p} pass, ${tot.f} fail`);
})();

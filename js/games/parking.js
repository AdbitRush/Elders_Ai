// ═══════════════════════════════════════════════════════════════════════════════
// PARKING LOT (2026-11, nostalgia batch 3) — the sliding-car traffic puzzle. Cars and trucks fill a 6x6 lot; each
// slides only forward and back along its own length. Slide them out of the way so the red car can drive out of the
// gate on the right. The puzzles were found with a breadth-first solver (tools: scratch generator, stored below as
// 36-letter boards: "A" is the red car, other letters are vehicles, "." is empty) and each comes with the fewest
// moves it can be done in. Easy needs 4-8 moves, normal 10-16, hard 18 or more. A slide of any distance is one move.
// Tap a car, then tap where it should go (the squares it can reach show arrows). No clock; Undo is free.
// ═══════════════════════════════════════════════════════════════════════════════
const _PK_PUZ = {   // [board, fewest moves], found by a breadth-first solver
    easy: [
        ["GG.II.J.KKLMJ.AALM.HC.BBEHC.FNE.DDFN", 4],
        [".GG.MMLLDEE.AADJNHBBBJNHKK.FF..CC.II", 8],
        [".H..MMBHIII.B.AAEGKFLLEGKFDDDJ..CC.J", 6],
        [".EE.D..IIFD.AAKF.B..K..B..JJHG.CC.HG", 5],
        ["HKKKEEHFFBDD.AAB.L.III.LC.GG..C.JJ..", 5],
        [".EJBB.CEJ.I.C.AAI..DDFKK...F...HH.GG", 5],
        ["BB.GGIFF.KKI.AA.H.LLL.H.JJMMED.CC.ED", 4],
        [".I.CC..IH.EEAAH.F.....FJ.DD.GJBB..G.", 6],
        ["FFIIG.LKK.G.LAAHCJEE.HCJ......BBBDD.", 4],
        ["CC.....GGGBB.AA.HID.KJHID.KJ.ID.FFEE", 5],
        ["FF...DCC..HDE.AAHDEKKJH.I..JBBI..GGG", 7],
        ["KKFFCC.LL....AA.IEG.BBIEGHHMM.JJ.DD.", 6],
        ["DD.HHEJJ.B.EAA.B..C.GB.IC.G.LIFFKKL.", 4],
        ["F.BBJJFK.EEE.KAAD.HH.CD...GCD...GII.", 4],
        ["F....CF.D.HCAAD.HGIBBB.GIEEE.GJJ....", 4],
        [".I..HGDI.EHGDAAEJC...BJC.FFB..KKKB..", 4],
        ["..G...EEG.JDBAAFJDB.IF....I.HH....CC", 4],
        ["GEEHH.G.FFJBGAADJB...DJ..C.....C.III", 6],
        [".HLLFC.H..FCJAAD..J..DEEKK.G..BB.GII", 7],
        ["H..JJJH.BFIIAABF..E.BF..ED...C.D.GGC", 5],
        [".CC.EEGG.FF.AA..HD....HD.BBBII......", 6],
        ["EII..GE.D.CGAAD.CKJJD..K..FF..HH.BB.", 5],
        ["GG.FD.BB.FD.AA.F.H.ECJJHIEC...I.....", 4],
        ["...IDD.GGIEF.AA.EFCCHH.K.....KJJ..BB", 6],
        ["K..IIIKJJJ..AACDHBFFCDHB.EEDLG....LG", 7],
        ["..K.D.H.KGD.HAAGCI....CIJB.F..JB.FEE", 4],
        [".FFGG...IIDD.AAKB..JJKB...HHEELL.CC.", 7],
        [".II.BBGGG..E..AADE.F.HDE.F.HCCJJ....", 6],
        ["...HHHGG.I.E.AAI.EBFFJJ.B.CC.DKKLLLD", 4],
        ["H..DD.HIIMJFAA.MJFBLEEE.BL.KKCNN.GGC", 5]],
    normal: [
        ["LJCCGGLJ.I..AA.IFB.HKKFB.HEDD...E...", 12],
        ["DKKIMMDLLIHCAAG.HC.BG....B.FFFEE..JJ", 13],
        ["HHDGG...DBB.AAD...JCC.KFJ.EEKF..II..", 10],
        ["DLEHHHDLE..JAA..IJKKCCI..BBFGG...F..", 10],
        ["....FF..IIIK.AADJKE..DJKEGCCHH.G.BBB", 11],
        ["CGG...CLLDDKAA..MKEEB.MIHHBFFI.NN.JJ", 10],
        ["HHEEEC.KLLJCMKAAJ.MFF.BB..DII...DGG.", 14],
        ["GFF.HHGLLEEEAA...MKKCJJMNDC..BNDII.B", 10],
        ["..I.GGD.I.H.DAACHJDE.CKJ.ELCKMFFLBBM", 13],
        ["EEKK.HMJJ.CHM.AAC.DDGGCF.LII.F.L.BBB", 12],
        ["DIFFE.DI..EH.IAAEH..GG.H..CBBB..C...", 13],
        [".JJ.FF..EBH.AAEBH.K.EDCCKI.D...IGG..", 10],
        ["..CC.NFF.HKNMAAHKDMJJLKDIGGL.DIBBEE.", 10],
        [".HKKII.HG.D.AAG.DJ.EFFBJ.E.CB....C..", 10],
        ["KKHHF..BBBFI.AACFIGGLC....L.JJ.DD.EE", 10],
        ["..JJKK..IIC.GEAAC.GEB.C.G.BHH...FFDD", 13],
        ["G.ILL.G.IF.C.AAF.CJJEE.KHHD..K..DBBK", 15],
        ["EEE.HD..I.HDAAI..D.JBGG..JBC.....CFF", 10],
        ["H.EEIIH..C...AAC...JJCD.GBKKD.GBLLFF", 12],
        ["M.II.HMLLNGHAACNG.FFC.BBJEEE.DJ..KKD", 12],
        [".EEKNN.IIKDFBAA.DFB.GG..B.JLLCMMJHHC", 15],
        ["LL.DD..BB.CJIMAACJIMKKCHFFEN.H..ENGG", 10],
        [".HHFF..BBB.IAAD..IGGDEEC..J..C..J...", 10],
        ["...KKJCC..IJ.AAFIBDD.FIBLG..MMLGHHEE", 11],
        [".EEECC...DKKAAHDF.I.HDF.I...BBJJGG..", 11],
        ["D.JJLLDCCKKIAA.EHI...EH.F..EBBFGGG..", 10],
        ["...BB..EEDD.AAG.KJCCG.KJFFIIIJ....HH", 13],
        [".D..JJEDGGBBEAA.CMKL.ICMKLFIHH..FNN.", 11],
        ["CC......HHEFAAG.EFD.G..FDJBBII.J.KKK", 10],
        [".BBGG.II..E.MFAAEKMF.H.KDCLH.KDCLHJJ", 13]],
    hard: [
        ["HHDGG...DBBLAADE.LJCCEK.JF.EK..FIIMM", 18],
        ["GFF.HHGLLEEEAA..JMKKC.JM.DCNNB.DII.B", 18],
        [".EINGGDEINH.DAACHJD..CKJ..LCKMFFLBBM", 18],
        ["GFF.HHGLLEEEAA..JMKKC.JM.DCOOB.DII.B", 18],
        ["GFF.HHGLLEEEAAC.JMKKC.JM.D.OOB.DII.B", 18],
        ["G.FFHHGLLEEEAA..JMKKC.JM.DCOOB.DII.B", 18],
        ["HHJ.G.B.J.GKBAA.GK..IDD...I.CCEE.FF.", 19],
        ["HHJ.G.B.J.GKBAA.GK..IDD...ICC.EE.FF.", 19],
        ["HHDGG...DBBLAADN.LJCCNK.JFEEK..FIIMM", 19],
        ["HHDGG...DBB.AADN..JCCNKLJFEEKL.FIIMM", 19],
        ["HHD.GG..DBBLAADN.LJCCNK.JFEEK..FIIMM", 19],
        ["HHDGG...DBB.AADN.LJCCNKLJFEEK..FIIMM", 19],
        ["HHDGG...D.BBAADN.LJCCNKLJFEEK..FIIMM", 19],
        [".JJJG.B..CGHBAACGHDKM.FFDKM.EELL.II.", 20],
        ["HHJ.G.B.J.GKBAA.GK.LIDD..LI.CCEE.FF.", 20],
        [".JJJG.B..CGHBAACGHDKM.FFDKM.EELLII..", 20],
        ["HHJ.G.B.J.GKBAA.GK.LIDDK.LI.CCEE.FF.", 20],
        ["HHJ.G.B.JLGKBAALGK..IDD...I.CCEE.FF.", 20],
        [".IIEE.FFFNNDAAMHKDG.MHKJGCC..JLL.BB.", 20],
        ["HHJ.G.B.J.GKBAA.GK.LIDDK.LICC.EE.FF.", 20],
        ["HHDGG...D.BBAADN..JCCNKLJFEEKL.FIIMM", 20],
        ["H.J.GGH.JFFFAA.EMB.KKEMBCCDDDL.III.L", 21],
        ["HHJKG.B.JKG.BAA.G..LIDD..LI.CCEE.FF.", 21],
        ["HHJLG.B.JLGKBAA.GK..IDDK..I.CCEE.FF.", 21],
        [".HHJJGCDD.BGCFAABN.FMLBNIEML..IEMLKK", 22],
        ["...MM.BBBKKIAAL..IJ.LG.FJCCGHFDDEEH.", 22],
        ["NN.MM.BBBKKIAAL..IJ.LG.FJCCGHFDDEEH.", 23],
        ["HHJKGMB.JKGMBAA.G..LIDD..LI.CCEE.FF.", 23],
        ["HHJKGMB.JKGMBAADG..LID...LI.CCEE.FF.", 23],
        ["HHJKGMB.JKGMBAA.GN.LIDDN.LI.CCEE.FF.", 27]],
};
function _pkCars(b) { const cars = {}; for (let i = 0; i < 36; i++) { const ch = b[i]; if (ch !== '.') (cars[ch] = cars[ch] || []).push(i); } for (const k in cars) cars[k].h = cars[k].length > 1 && cars[k][1] - cars[k][0] === 1; return cars; }
// squares (cell indexes) the car can slide to, with the shift each needs
function _pkReach(b, ch) {
    const cells = _pkCars(b)[ch], step = cells.h ? 1 : 6, out = [];
    for (const dir of [-1, 1]) for (let k = 1; k < 6; k++) {
        const head = dir < 0 ? cells[0] - step * k : cells[cells.length - 1] + step * k;
        if (head < 0 || head >= 36 || (cells.h && Math.floor(head / 6) !== Math.floor(cells[0] / 6)) || b[head] !== '.') break;
        out.push({ cell: head, shift: dir * k });
    }
    return out;
}
function _pkSlide(b, ch, shift) { const cells = _pkCars(b)[ch], step = cells.h ? 1 : 6, a = b.split(''); cells.forEach((i) => (a[i] = '.')); cells.forEach((i) => (a[i + shift * step] = ch)); return a.join(''); }
const _PK_COL = { B: '#2563eb', C: '#16a34a', D: '#ca8a04', E: '#7c3aed', F: '#0891b2', G: '#db2777', H: '#65a30d', I: '#ea580c', J: '#4f46e5', K: '#0d9488', L: '#9333ea', M: '#b45309', N: '#0369a1', O: '#be185d', P: '#15803d', Q: '#a16207' };
const _PK_NAME = { B: 'blue', C: 'green', D: 'mustard', E: 'purple', F: 'teal', G: 'pink', H: 'lime', I: 'orange', J: 'indigo', K: 'sea green', L: 'violet', M: 'brown', N: 'navy', O: 'rose', P: 'pine', Q: 'gold' };
function initParking() {
    NK.start('parking', {
        setup(gs, diff) {
            const list = _PK_PUZ[diff] || _PK_PUZ.normal, [b, best] = list[Math.floor(Math.random() * list.length)];
            gs.start = b; gs.b = b; gs.best = best; gs.moves = 0; gs.hist = []; gs.sel = null; gs.lastCar = null; gs.lastDir = 0; gs.over = false; gs.out = false;
            gs.msg = `Get the red car out of the gate on the right. This lot can be cleared in ${best} moves.`;
        },
        view: _pkView,
        keys: { KeyU: () => pkUndo(), Escape: () => { const gs = gameState.parking; if (gs.sel) { gs.sel = null; gs.msg = ''; NK.render('parking'); } } },
        arrows(dir) {
            const gs = gameState.parking; if (!gs.sel || gs.over) return false;
            const h = _pkCars(gs.b)[gs.sel].h, along = h ? { left: -1, right: 1 } : { up: -1, down: 1 };
            if (!(dir in along)) return false;
            const r = _pkReach(gs.b, gs.sel).find((x) => x.shift === along[dir]);
            if (!r) { gs.msg = 'It cannot go any further that way.'; NK.render('parking'); return true; }
            _pkMove(gs, gs.sel, along[dir]); return true;
        },
        rules: [
            'Slide the cars and trucks out of the way so the <b>red car</b> can drive out of the <b>gate</b> on the right.',
            'Each vehicle only goes <b>forward and back</b> along its length: side-to-side ones slide left and right, up-and-down ones slide up and down. Nothing turns or jumps.',
            'Tap a vehicle to pick it, then tap one of the arrowed squares to slide it there. A slide of any distance is one move.',
            'Each lot shows the fewest moves it can be done in. Matching it is a bonus, not a rule. Undo is free. No clock.',
            'Keyboard: arrow keys move between vehicles; Enter picks one; then the arrow keys slide it one square at a time. Escape lets go, U undoes.'],
        css: `.pk-w{position:relative;max-width:min(100%,30rem,max(18rem,calc(100vh - 300px)));margin:0 auto;padding-right:7%}
.pk-b{position:relative;aspect-ratio:1;background:#57534e;border-radius:12px;box-shadow:inset 0 0 0 5px #292524;background-image:linear-gradient(#78716c 1px,transparent 1px),linear-gradient(90deg,#78716c 1px,transparent 1px);background-size:16.666% 16.666%}
.pk-gate{position:absolute;right:0;width:7%;top:calc(33.333% + 2px);height:calc(16.666% - 4px);background:repeating-linear-gradient(45deg,#facc15 0 6px,#1c1917 6px 12px);border-radius:0 8px 8px 0}
#gameContent .nk button.pk-car,#gameContent .nk button.pk-t{position:absolute}
.pk-car{border:3px solid rgba(0,0,0,.45);border-radius:14px;padding:0;cursor:pointer;--nk-r:14px;--nk-bw:3px;transition:left .18s,top .18s;display:flex;align-items:center;justify-content:center;z-index:2;box-shadow:0 3px 0 rgba(0,0,0,.35)}
.pk-car::before{content:"";position:absolute;inset:18% 22%;border-radius:6px;background:rgba(255,255,255,.35)}
.pk-car.pk-sel{outline:4px solid #fde047;outline-offset:2px;z-index:3}
.pk-car.pk-red{background:#dc2626}
.pk-car span{position:relative;font:900 clamp(.8rem,3.4vw,1.1rem) system-ui,sans-serif;color:#fff;text-shadow:0 1px 2px #000}
.pk-t{width:16.666%;height:16.666%;border:0;padding:0;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:#fde047;z-index:1;--nk-r:10px}
.pk-t svg{width:46%;height:46%;filter:drop-shadow(0 1px 1px #000)}
.pk-t:hover{background:rgba(253,224,71,.18)}
.pk-car.pk-gone{left:110% !important;opacity:0}
@media (prefers-reduced-motion:reduce){.pk-car{transition:none}}`,
    });
}
function pkPick(ch) {
    const gs = gameState.parking; if (gs.over) return;
    gs.sel = gs.sel === ch ? null : ch;
    const reach = gs.sel ? _pkReach(gs.b, ch) : [];
    gs.msg = !gs.sel ? '' : !reach.length ? `The ${ch === 'A' ? 'red car' : _PK_NAME[ch] + ' ' + (_pkCars(gs.b)[ch].length > 2 ? 'truck' : 'car')} is boxed in right now. Move something else first.` : 'Now tap a square with an arrow to slide it there.';
    NK.render('parking');
}
function pkTo(shift) { const gs = gameState.parking; if (gs.over || !gs.sel) return; _pkMove(gs, gs.sel, shift); }
function _pkMove(gs, ch, shift) {
    gs.hist.push([gs.b, gs.moves, gs.lastCar, gs.lastDir]);
    // sliding the same vehicle on in the same direction (one square at a time by keyboard) still counts as one move
    const dir = Math.sign(shift); if (!(gs.lastCar === ch && gs.lastDir === dir)) gs.moves++;
    gs.lastCar = ch; gs.lastDir = dir; gs.b = _pkSlide(gs.b, ch, shift);
    if (typeof sfxFlip === 'function') sfxFlip();
    if (gs.b[17] === 'A') {
        gs.over = true; gs.out = true; gs.sel = null;
        const par = gs.moves <= gs.best;
        gs.msg = par ? `Out in ${gs.moves} moves: the fewest possible!` : `Out in ${gs.moves} moves. It can be done in ${gs.best}.`;
        NK.render('parking'); if (typeof sfxCorrect === 'function') sfxCorrect();
        return NK.finish('parking', true, par ? `The red car is out in ${gs.moves} moves, the fewest possible.` : `The red car is out in ${gs.moves} moves (the fewest is ${gs.best}).`);
    }
    gs.msg = `${NK.pl(gs.moves, 'move')} so far.`;
    NK.render('parking');
}
function pkUndo() { const gs = gameState.parking; if (gs.over || !gs.hist.length) return; [gs.b, gs.moves, gs.lastCar, gs.lastDir] = gs.hist.pop(); gs.lastCar = null; gs.msg = 'Last slide taken back.'; NK.render('parking'); }
function pkReset() { const gs = gameState.parking; if (gs.over) return; gs.b = gs.start; gs.moves = 0; gs.hist = []; gs.sel = null; gs.lastCar = null; gs.msg = 'The lot is back the way it started.'; NK.render('parking'); }
function pkNew() { initParking(); }
function _pkView(gs) {
    const cars = _pkCars(gs.b), u = 100 / 6, arrows = { l: 'arrow-left', r: 'arrow-right', u: 'arrow-up', d: 'arrow-down' };
    let h = '';
    Object.keys(cars).sort().forEach((ch) => {
        const c = cars[ch], r0 = Math.floor(c[0] / 6), c0 = c[0] % 6, len = c.length, red = ch === 'A';
        const w = c.h ? len * u : u, hh = c.h ? u : len * u, name = red ? 'red car' : `${_PK_NAME[ch]} ${len > 2 ? 'truck' : 'car'}`;
        h += `<button type="button" class="nk-cell pk-car${red ? ' pk-red' : ''}${gs.sel === ch ? ' pk-sel' : ''}${red && gs.out ? ' pk-gone' : ''}" style="left:calc(${c0 * u}% + 3px);top:calc(${r0 * u}% + 3px);width:calc(${w}% - 6px);height:calc(${hh}% - 6px);${red ? '' : 'background:' + _PK_COL[ch]}" onclick="pkPick('${ch}')" data-k="v${ch}"${red ? ' data-first' : ''} aria-label="${name}, slides ${c.h ? 'left and right' : 'up and down'}, row ${r0 + 1} column ${c0 + 1}${gs.sel === ch ? ', picked' : ''}" aria-pressed="${gs.sel === ch}"${gs.over ? ' disabled' : ''}><span aria-hidden="true">${red ? '' : len > 2 ? 'TRUCK' : ''}</span></button>`;
    });
    if (gs.sel && !gs.over) _pkReach(gs.b, gs.sel).forEach(({ cell, shift }) => {
        const r = Math.floor(cell / 6), c = cell % 6, h2 = cars[gs.sel].h, ic = h2 ? (shift < 0 ? arrows.l : arrows.r) : (shift < 0 ? arrows.u : arrows.d);
        h += `<button type="button" class="nk-cell pk-t" style="left:${c * u}%;top:${r * u}%" onclick="pkTo(${shift})" data-k="t${cell}" aria-label="slide ${Math.abs(shift)} square${Math.abs(shift) > 1 ? 's' : ''} ${h2 ? (shift < 0 ? 'left' : 'right') : (shift < 0 ? 'up' : 'down')}">${Icon.svg(ic, { size: '100%', sw: 3 })}</button>`;
    });
    return `<div class="nk-top"><span>Moves: <b>${gs.moves}</b></span><span>Fewest possible: <b>${gs.best}</b></span></div>
      <div class="pk-w"><div class="pk-b">${h}</div><div class="pk-gate" role="img" aria-label="gate, row 3"></div></div>
      ${NK.msg(gs.msg)}
      <div class="gk-btns">${NK.btn(NK.icon('undo-2') + 'Undo', 'pkUndo()', { k: 'undo', disabled: gs.over || !gs.hist.length })}${NK.btn('Start this lot over', 'pkReset()', { k: 'reset', disabled: gs.over })}${NK.btn(NK.icon('rotate-ccw') + 'New lot', 'pkNew()', { k: 'restart' })}</div>`;
}

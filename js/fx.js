// ═══════════════════════════════════════════════════════════════════════════════
// fx.js — shared "juice" engine: glowing sparks, light bursts, flashes, fireworks,
// screen shake, floating score text. Built for big, joyful, senior-friendly feedback.
// Any game can call window.fx.* — see tetris.js for usage.
// ═══════════════════════════════════════════════════════════════════════════════
(function(){
  let canvas, ctx, dpr = 1, particles = [], raf = null, running = false;

  function ensure(){
    if (canvas) return;
    canvas = document.createElement('canvas');
    canvas.id = 'fx-layer';
    canvas.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:9998';
    (document.body || document.documentElement).appendChild(canvas);
    resize();
    window.addEventListener('resize', resize, { passive:true });
  }
  function resize(){
    dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width  = Math.floor(innerWidth  * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    ctx = canvas.getContext('2d');
  }

  function start(){ if (!running){ running = true; raf = requestAnimationFrame(tick); } }
  function tick(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';   // additive → glow
    for (let i = particles.length - 1; i >= 0; i--){
      const p = particles[i];
      p.life -= 1;
      if (p.life <= 0){ particles.splice(i, 1); continue; }
      p.vy += p.gravity;
      p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx; p.y += p.vy;
      const t = p.life / p.maxLife;              // 1→0
      const r = p.size * (0.4 + 0.6 * t);
      const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, r);
      g.addColorStop(0, hexA(p.color, 0.95 * t));
      g.addColorStop(0.4, hexA(p.color, 0.55 * t));
      g.addColorStop(1, hexA(p.color, 0));
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    if (particles.length){ raf = requestAnimationFrame(tick); }
    else { running = false; }
  }

  // #rrggbb (or a few names) → rgba() with alpha
  function hexA(c, a){
    if (c[0] !== '#') return c;
    let h = c.slice(1);
    if (h.length === 3) h = h.split('').map(x => x+x).join('');
    const n = parseInt(h, 16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`;
  }

  const DEFAULT_COLORS = ['#ffd700','#ff6b6b','#4ecdc4','#ffe66d','#a78bfa','#ff9ff3','#54a0ff','#5eead4'];

  // Spark burst at a screen point (CSS px). opts: count, colors, power, size, spread(rad), gravity
  function burst(x, y, opts){
    ensure(); opts = opts || {};
    const n       = opts.count  || 26;
    const colors  = opts.colors || DEFAULT_COLORS;
    const power   = opts.power  || 7;
    const size    = opts.size   || 5;
    const gravity = opts.gravity != null ? opts.gravity : 0.12;
    const spread  = opts.spread || Math.PI * 2;      // full circle by default
    const dir     = opts.dir != null ? opts.dir : -Math.PI/2;
    for (let i = 0; i < n; i++){
      const a = dir - spread/2 + Math.random()*spread;
      const sp = power * (0.4 + Math.random()*0.9);
      const life = 34 + Math.random()*26;
      particles.push({
        x: x*dpr, y: y*dpr,
        vx: Math.cos(a)*sp*dpr, vy: Math.sin(a)*sp*dpr,
        gravity: gravity*dpr, drag: 0.96,
        size: (size + Math.random()*size) * dpr,
        color: colors[(Math.random()*colors.length)|0],
        life, maxLife: life,
      });
    }
    if (particles.length > 900) particles.splice(0, particles.length - 900);
    start();
  }

  // Full-width shimmer across a horizontal line (Tetris row clear)
  function lineSweep(rect, colors){
    ensure();
    const y = rect.top + rect.height/2;
    for (let x = rect.left; x <= rect.left + rect.width; x += rect.width/16){
      burst(x, y, { count: 4, colors, power: 5, size: 4, spread: Math.PI, dir: -Math.PI/2, gravity: 0.05 });
    }
  }

  // Celebratory multi-burst across the viewport
  function fireworks(n){
    ensure(); n = n || 6;
    for (let i = 0; i < n; i++){
      setTimeout(() => burst(
        innerWidth*(0.15 + Math.random()*0.7),
        innerHeight*(0.15 + Math.random()*0.5),
        { count: 40, power: 10, size: 6 }
      ), i * 140);
    }
  }

  // Quick colored screen flash
  let flashEl = null;
  function flash(color, ms){
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;inset:0;z-index:9997;pointer-events:none;background:${color||'#fff'};opacity:0.55;transition:opacity ${(ms||280)}ms ease-out`;
    document.body.appendChild(d);
    requestAnimationFrame(() => { d.style.opacity = '0'; });
    setTimeout(() => d.remove(), (ms||280) + 60);
  }

  // Shake an element (or the body)
  function shake(el, px){
    el = el || document.body; px = px || 8;
    if (el._fxShaking) return; el._fxShaking = true;
    const orig = el.style.transform || '';
    let n = 0; const max = 10;
    (function step(){
      n++;
      const k = 1 - n/max;
      el.style.transform = `${orig} translate(${(Math.random()*2-1)*px*k}px,${(Math.random()*2-1)*px*k}px)`;
      if (n < max) requestAnimationFrame(step);
      else { el.style.transform = orig; el._fxShaking = false; }
    })();
  }

  // Floating rising text (e.g. "+100", "LEVEL UP!")
  function text(x, y, str, color){
    ensure();
    const el = document.createElement('div');
    el.textContent = str;
    el.style.cssText = `position:fixed;left:${x}px;top:${y}px;transform:translate(-50%,-50%);z-index:9999;pointer-events:none;
      font:800 clamp(20px,6vw,34px)/1 system-ui,sans-serif;color:${color||'#ffd700'};
      text-shadow:0 0 12px ${color||'#ffd700'},0 2px 6px rgba(0,0,0,.6);white-space:nowrap;
      transition:transform 1s cubic-bezier(.16,1,.3,1),opacity 1s ease-out`;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.transform = 'translate(-50%,-160%) scale(1.15)'; el.style.opacity = '0'; });
    setTimeout(() => el.remove(), 1100);
  }

  // Short haptic tick on supporting devices
  function buzz(ms){ try { navigator.vibrate && navigator.vibrate(ms || 15); } catch(e){} }

  window.fx = { burst, lineSweep, fireworks, flash, shake, text, buzz };
})();

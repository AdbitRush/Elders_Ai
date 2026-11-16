const SyncUI = (() => {
  let mounted = false;
  function mount() {
    if (mounted)
      return;
    const nav = document.querySelector('nav .flex.gap-4') || document.querySelector('nav .flex.items-center') || document.querySelector('nav');
    if (!nav)
      return;
    const btn = document.createElement('button');
    btn.id = 'sync-btn';
    btn.type = 'button';
    btn.title = gt('Play on another device');
    btn.setAttribute('aria-label', gt('Play on another device'));
    btn.style.cssText = 'display:inline-flex;align-items:center;gap:6px;padding:8px 12px;border-radius:10px;' + 'background:rgba(59,130,246,0.15);border:1px solid rgba(59,130,246,0.35);cursor:pointer;font-size:15px';
    btn.innerHTML = '<span aria-hidden="true">\uD83D\uDCF1</span>' + '<span id="sync-dot" style="width:7px;height:7px;border-radius:50%;display:inline-block;' + 'flex-shrink:0;background:#fbbf24;transition:background .4s"></span>';
    btn.onclick = open;
    nav.prepend(btn);
    mounted = true;
  }
  function close() {
    const m = document.getElementById('sync-modal');
    if (m)
      m.remove();
  }
  function open() {
    close();
    const isHe = false;
    const wrap = document.createElement('div');
    wrap.id = 'sync-modal';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(4,10,22,.82);display:flex;' + 'align-items:center;justify-content:center;padding:18px';
    wrap.innerHTML = '<div dir="' + 'ltr' + '" style="background:#0f1e36;border:1px solid rgba(251,191,36,.3);' + 'border-radius:18px;max-width:480px;width:100%;padding:26px 24px;color:#e8eefc;' + 'max-height:90vh;overflow:auto">' + '<h2 style="font-size:1.35rem;font-weight:800;color:#f6c048;margin-bottom:10px">' + esc(gt('Play on another device')) + '</h2>' + '<p style="font-size:1rem;line-height:1.6;color:#b9c8e6;margin-bottom:20px">' + esc(gt('Your progress is saved on this device. To carry on from a phone or tablet, get a code here and type it there.')) + '</p>' + '<button type="button" id="sync-get" style="width:100%;padding:15px;border-radius:12px;border:0;' + 'background:linear-gradient(135deg,#b7791f,#f6c048);color:#1a1200;font-size:1.05rem;font-weight:800;' + 'cursor:pointer;margin-bottom:10px">' + esc(gt('Show my code')) + '</button>' + '<div id="sync-code-box" style="display:none;text-align:center;margin-bottom:18px"></div>' + '<div style="border-top:1px solid rgba(255,255,255,.12);margin:18px 0;padding-top:18px">' + '<p style="font-size:.95rem;color:#b9c8e6;margin-bottom:10px">' + esc(gt('Already have a code from your other device?')) + '</p>' + '<input id="sync-input" type="text" inputmode="latin" autocomplete="off" maxlength="6" ' + 'placeholder="' + esc(gt('6 characters')) + '" ' + 'style="width:100%;padding:14px;border-radius:12px;border:1px solid rgba(255,255,255,.2);' + 'background:#0a1628;color:#fff;font-size:1.4rem;text-align:center;letter-spacing:.35em;' + 'font-family:ui-monospace,monospace;text-transform:uppercase;margin-bottom:10px">' + '<button type="button" id="sync-use" style="width:100%;padding:15px;border-radius:12px;' + 'border:1px solid rgba(59,130,246,.5);background:rgba(59,130,246,.2);color:#dbeafe;' + 'font-size:1.05rem;font-weight:800;cursor:pointer">' + esc(gt('Connect')) + '</button>' + '<p id="sync-msg" style="font-size:.95rem;margin-top:12px;min-height:1.4em"></p>' + '</div>' + '<button type="button" id="sync-close" style="width:100%;padding:12px;margin-top:6px;border-radius:12px;' + 'border:1px solid rgba(255,255,255,.18);background:transparent;color:#9fb0d0;font-size:1rem;' + 'cursor:pointer">' + esc(gt('Close')) + '</button>' + '</div>';
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => {
      if (e.target === wrap)
        close();
    });
    document.getElementById('sync-close').onclick = close;
    document.getElementById('sync-get').onclick = async function () {
      this.disabled = true;
      this.textContent = gt('One moment\u2026');
      const code = await Sync.createCode();
      this.disabled = false;
      this.textContent = gt('Show my code');
      const box = document.getElementById('sync-code-box');
      if (!code) {
        box.style.display = 'block';
        box.innerHTML = '<p style="color:#fca5a5">' + esc(gt('Could not get a code. Check the internet connection and try again.')) + '</p>';
        return;
      }
      box.style.display = 'block';
      box.innerHTML = '<div style="font-family:ui-monospace,monospace;font-size:2rem;font-weight:800;letter-spacing:.32em;' + 'color:#f6c048;background:#0a1628;border:1px dashed rgba(246,192,72,.5);border-radius:12px;' + 'padding:16px 10px">' + esc(code) + '</div>' + '<p style="font-size:.9rem;color:#9fb0d0;margin-top:10px;line-height:1.5">' + esc(gt('Type this on the other device. It works for 30 minutes.')) + '</p>';
    };
    document.getElementById('sync-use').onclick = async function () {
      const msg = document.getElementById('sync-msg');
      const val = document.getElementById('sync-input').value;
      msg.style.color = '#9fb0d0';
      msg.textContent = gt('One moment\u2026');
      this.disabled = true;
      const r = await Sync.useCode(val);
      this.disabled = false;
      if (r.ok) {
        msg.style.color = '#86efac';
        msg.textContent = gt('Connected. Your progress is now shared between the devices.');
        setTimeout(() => {
          close();
          location.reload();
        }, 1800);
      } else {
        msg.style.color = '#fca5a5';
        msg.textContent = r.reason === 'format' ? gt('A code is exactly 6 characters.') : r.reason === 'offline' ? gt('No connection. Try again in a moment.') : gt('That code is wrong or has expired.');
      }
    };
  }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  return {
    mount,
    open,
    close
  };
})();
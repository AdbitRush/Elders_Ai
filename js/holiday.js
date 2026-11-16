const Holiday = (() => {
  const MILESTONES = [
    10,
    50,
    100,
    200,
    500
  ];
  const MILESTONE_KEY = 'gg_milestones';
  function checkMilestone(totalGames) {
    let seen;
    try {
      seen = new Set(JSON.parse(localStorage.getItem(MILESTONE_KEY) || '[]'));
    } catch {
      seen = new Set();
    }
    const hit = MILESTONES.find(m => totalGames >= m && !seen.has(m));
    if (!hit)
      return;
    seen.add(hit);
    localStorage.setItem(MILESTONE_KEY, JSON.stringify([...seen]));
    const isHe = false;
    const ov = document.createElement('div');
    ov.id = 'milestone-overlay';
    ov.innerHTML = `
      <div id="milestone-box">
        <div style="font-size:3.5rem;margin-bottom:0.5rem">🏆</div>
        <div style="font-size:1.8rem;font-weight:800;color:#f6c048;margin-bottom:0.5rem">
          ${ hit } ${ 'Games!' }
        </div>
        <div style="color:rgba(180,210,255,0.85);font-size:1rem;margin-bottom:1.5rem">
          ${ `Amazing! You've played ${ hit } games. That is a lot of fun 🎉` }
        </div>
        <button onclick="document.getElementById('milestone-overlay').remove()"
          style="background:linear-gradient(135deg,#b7791f,#f6c048);color:#0a1628;border:none;border-radius:0.9rem;padding:0.75rem 2rem;font-size:1rem;font-weight:800;cursor:pointer">
          ${ '\uD83D\uDE80 Keep Playing!' }
        </button>
      </div>`;
    document.body.appendChild(ov);
    if (typeof launchConfetti === 'function')
      launchConfetti();
  }
  return { checkMilestone };
})();
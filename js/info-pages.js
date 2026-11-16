(function () {
  var r = document.documentElement, b = document.getElementById('themeBtn');
  if (!b)
    return;
  function lab() {
    b.textContent = r.getAttribute('data-theme') === 'dark' ? 'Light' : 'Dark';
  }
  b.onclick = function () {
    var dark = r.getAttribute('data-theme') !== 'dark';
    if (dark)
      r.setAttribute('data-theme', 'dark');
    else
      r.removeAttribute('data-theme');
    try {
      localStorage.setItem('gg-theme', dark ? 'dark' : 'light');
    } catch (e) {
    }
    lab();
  };
  lab();
}());
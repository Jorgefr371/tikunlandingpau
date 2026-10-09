/* Regalo con fecha real: al vencer, la página quita el regalo y corrige los totales sola */
(function(){
  const HASTA = Date.UTC(2026, 10, 1, 5, 59, 59); // 31 oct 2026, 23:59:59 hora de Ciudad de México
  const p = v => String(v).padStart(2, '0');
  function tick(){
    const left = HASTA - Date.now();
    if(left <= 0){
      document.documentElement.classList.add('sin-bono');
      document.querySelectorAll('[data-sin-bono]').forEach(e => { e.innerHTML = e.dataset.sinBono; e.removeAttribute('data-sin-bono'); });
      return false;
    }
    const s = Math.floor(left / 1000), d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60);
    const html = `<span><b>${d}</b>${d === 1 ? 'día' : 'días'}</span><span><b>${p(h)}</b>horas</span><span><b>${p(m)}</b>min</span><span><b>${p(s % 60)}</b>seg</span>`;
    document.querySelectorAll('.cd').forEach(c => c.innerHTML = html);
    return true;
  }
  window.Oferta = { tick };
  if(tick()){ const iv = setInterval(() => { if(!tick()) clearInterval(iv); }, 1000); }
})();

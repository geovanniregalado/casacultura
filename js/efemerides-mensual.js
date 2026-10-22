/* Efemérides por mes. Lee data/efemerides.csv (guardado desde el Excel) y arma la línea del tiempo. */
(function () {
  const CSV_URL = 'data/efemerides.csv';
  const CARPETA_FOTOS = 'img/efemerides/';
  const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const COLOR = { 'literatura':'#7B1C3E', 'musica':'#b5532f', 'artes visuales':'#9a6b1f', 'historia':'#5b4636',
                  'lengua y tradiciones':'#5b2a4e', 'casa de la cultura':'#3a1220' };
  const el = id => document.getElementById(id);
  const norm = s => (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
  const esc = s => (s || '').replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]));
  const fecha = (d, m) => d + ' de ' + MESES[m].toLowerCase();

  function leerCSV(t) {                       // detecta coma o punto y coma (Excel en español usa ;)
    t = t.replace(/^\uFEFF/, '');
    const h = t.split(/\r?\n/)[0], sep = (h.match(/;/g) || []).length > (h.match(/,/g) || []).length ? ';' : ',';
    const filas = []; let fila = [], campo = '', q = false;
    for (let i = 0; i < t.length; i++) {
      const c = t[i];
      if (q) { if (c === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else q = false; } else campo += c; }
      else if (c === '"') q = true;
      else if (c === sep) { fila.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && t[i + 1] === '\n') i++; fila.push(campo); filas.push(fila); fila = []; campo = ''; }
      else campo += c;
    }
    if (campo || fila.length) { fila.push(campo); filas.push(fila); }
    return filas;
  }

  function aEntradas(filas) {
    const cab = filas[0].map(norm), col = k => cab.findIndex(h => h.startsWith(k));
    const ix = { d: col('dia'), m: col('mes'), y: col('ano'), n: col('nombre'), t: col('descripcion'), c: col('categoria'), a: col('ambito'), f: col('foto'), p: col('publicar') };
    return filas.slice(1).map(r => {
      const v = k => (ix[k] > -1 ? (r[ix[k]] || '').trim() : '');
      const mv = norm(v('m')); let m = MESES.findIndex(x => norm(x) === mv || (mv.length >= 3 && norm(x).slice(0, 3) === mv.slice(0, 3)));
      if (m < 0 && +mv >= 1 && +mv <= 12) m = +mv - 1;
      return { d: parseInt(v('d'), 10), m, y: parseInt(v('y'), 10), nombre: v('n'), desc: v('t'), cat: v('c'), amb: v('a'), foto: v('f'), pub: norm(v('p')) };
    }).filter(e => e.nombre && e.d >= 1 && e.d <= 31 && e.m >= 0 && e.pub !== 'no');
  }

  function iniciar(datos) {
    const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
    const porMes = MESES.map((_, m) => datos.filter(e => e.m === m).sort((a, b) => a.d - b.d));
    const proxima = datos.map(e => {            // próxima vez que cae cada efeméride
      let f = new Date(hoy.getFullYear(), e.m, e.d); if (f < hoy) f = new Date(hoy.getFullYear() + 1, e.m, e.d);
      return { e, f, dias: Math.round((f - hoy) / 864e5) };
    }).sort((a, b) => a.dias - b.dias)[0];

    el('efm-meses').innerHTML = MESES.map((n, m) => `<button type="button" data-m="${m}" class="${porMes[m].length ? 'tiene' : ''}" aria-pressed="false" title="${n}">${n.slice(0, 3)}</button>`).join('');
    el('efm-meses').addEventListener('click', ev => { const b = ev.target.closest('button'); if (b) mostrar(+b.dataset.m); });

    if (proxima) {
      const { e, f, dias } = proxima, anios = f.getFullYear() - e.y;
      const cuando = dias === 0 ? '<strong>Hoy</strong>' : `<strong>Próxima efeméride</strong>, ${fecha(e.d, e.m)} (${dias === 1 ? 'mañana' : 'faltan ' + dias + ' días'})`;
      el('efm-proxima').innerHTML = `<span>${cuando}: ${esc(e.nombre)}${e.y && anios > 0 ? ` · ${anios} años` : ''}</span><button type="button">Ver</button>`;
      el('efm-proxima').hidden = false;
      el('efm-proxima').querySelector('button').onclick = () => { mostrar(e.m, e); el('efm-linea').scrollIntoView({ behavior: 'smooth', block: 'center' }); };
    }

    function mostrar(m, resaltar) {
      el('efm-meses').querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.m === m));
      const nav = el('efm-meses'), act = nav.querySelector('[aria-pressed="true"]');
      if (act) {   // centra el mes SOLO dentro de la barra (sin mover la página)
        const x = nav.scrollLeft + act.getBoundingClientRect().left - nav.getBoundingClientRect().left - (nav.clientWidth - act.offsetWidth) / 2;
        nav.scrollTo({ left: Math.max(0, x), behavior: 'auto' });
      }
      const lista = porMes[m], cont = el('efm-linea');
      if (!lista.length) {
        const sig = proxima ? `<br><button type="button" id="efm-ir">Ir a ${MESES[proxima.e.m].toLowerCase()}</button>` : '';
        cont.className = 'efm-vacio';
        cont.innerHTML = `Aún no hay efemérides publicadas para ${MESES[m].toLowerCase()}. Las iremos agregando.${sig}`;
        const ir = el('efm-ir'); if (ir) ir.onclick = () => mostrar(proxima.e.m);
        return;
      }
      cont.className = 'efm-linea' + (lista.length === 1 ? ' uno' : '');
      cont.innerHTML = lista.map(e => {
        const c = COLOR[norm(e.cat)] || '#6d6a5a', foto = e.foto && (/[\/:]/.test(e.foto) ? e.foto : CARPETA_FOTOS + e.foto);
        return `<li class="efm-item" style="--c:${c}"><span class="efm-nodo"></span><article class="efm-tarjeta">
          ${foto ? `<img src="${esc(foto)}" alt="" loading="lazy">` : `<span class="efm-ini">${esc(e.nombre[0])}</span>`}
          <div class="efm-cinta"><b>${e.d}</b><span>${MESES[e.m].slice(0, 3).toUpperCase()}</span>${e.y ? `<i>${e.y}</i>` : ''}</div>
          <div class="efm-texto"><small>${esc([e.cat, e.amb].filter(Boolean).join(' · '))}</small><h3>${esc(e.nombre)}</h3><p>${esc(e.desc)}</p></div>
        </article></li>`;
      }).join('');
      cont.querySelectorAll('img').forEach(i => i.addEventListener('error', () => i.remove()));
      if (resaltar) cont.children[lista.indexOf(resaltar)].classList.add('efm-resalte');
    }
    mostrar(porMes[hoy.getMonth()].length ? hoy.getMonth() : proxima ? proxima.e.m : hoy.getMonth());
  }

  async function cargar() {
    try { const r = await fetch(CSV_URL, { cache: 'no-cache' }); if (!r.ok) throw 0; return await r.text(); }
    catch (_) { const b = el('efm-respaldo'); if (b) return b.textContent.trim(); throw new Error('No se pudo cargar ' + CSV_URL); }
  }
  cargar().then(t => iniciar(aEntradas(leerCSV(t))))
          .catch(() => { el('efm-linea').className = 'efm-vacio'; el('efm-linea').textContent = 'No pudimos cargar las efemérides. Intenta de nuevo más tarde.'; });
})();

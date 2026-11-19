/* ============ UTILITÀ ============ */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const nf = new Intl.NumberFormat('it-IT', { maximumFractionDigits: 2 });
const KEY = 'fp-v2';
const DEADLINE_H = 20;

function fmtG(g, dec) {
  if (g >= 1000) return nf.format(Math.round(g / 10) / 100) + ' kg';
  if (g < 10 || dec) return nf.format(Math.round(g * 10) / 10) + ' g';
  return Math.round(g) + ' g';
}
const hm = d => d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
const pad = n => String(n).padStart(2, '0');
const hmVal = d => pad(d.getHours()) + ':' + pad(d.getMinutes());
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const strip = h => h.replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const norm = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const dur = ms => { const m = Math.max(0, Math.round(ms / 60000)); const h = Math.floor(m / 60); return h ? h + ' h ' + (m % 60 ? pad(m % 60) + ' min' : '') : m + ' min'; };

/* ============ STATO ============ */
function defaults() {
  const n = new Date(); n.setSeconds(0, 0); n.setMinutes(Math.ceil(n.getMinutes() / 5) * 5);
  return { focFlour: 1000, pizFlour: 1000, pans: 4, start: +n, bake: '16:30', done: {}, shop: {}, timers: {}, recTab: 'foc' };
}
let state = (() => {
  const fix = o => { if (Date.now() - o.start > 36 * 3600e3) { o.start = defaults().start; o.done = {}; o.timers = {}; } return o; }; try { return fix(Object.assign(defaults(), JSON.parse(localStorage.getItem(KEY)) || {})); } catch (e) { return defaults(); } })();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { } };

/* ============ CALCOLI ============ */
function calcRec(rec, flour) {
  const k = flour / 1000, q = {};
  let dough = 0;
  rec.ing.forEach(i => { q[i.id] = i.g * k; dough += i.g * k; });
  q.res = RESERVE * k;
  const n = Math.max(1, Math.round(dough / rec.pan));
  return { rec, flour, q, dough, n, each: Math.round(dough / n) };
}
function calcAll() { return { foc: calcRec(REC.foc, state.focFlour), piz: calcRec(REC.piz, state.pizFlour) }; }
function ctx(R) {
  const S = new Date(state.start);
  const [h, m] = state.bake.split(':').map(Number);
  const B = new Date(S); B.setDate(B.getDate() + 1); B.setHours(h, m, 0, 0);
  const racks = Math.min(2, Math.max(1, state.pans));
  const rF = Math.ceil(R.foc.n / racks), rP = Math.ceil(R.piz.n / racks);
  const tF = 30, tP = 20;
  const fridgeMs = (+addM(B, -270)) - (+addM(S, 180));
  const fh = fridgeMs / 3600000;
  const c = { S, B, rF, rP, tF, tP, racks, fridgeMs, fh };
  c.end = addM(B, rF * tF + rP * tP);
  c.fridgeH = '~' + Math.round(fh) + ' ore';
  const dl = new Date(B); dl.setHours(DEADLINE_H, 0, 0, 0);
  c.deadline = dl; c.ok = +addM(c.end, 15) <= +dl;
  return c;
}
let R = calcAll(), C = ctx(R), STEPS = buildSteps(R);
function recalc() { R = calcAll(); C = ctx(R); STEPS = buildSteps(R); }
const dayOf = d => (new Date(d).toDateString() === new Date(C.S).toDateString() ? 'oggi' : 'domani');

/* ============ SPESA ============ */
function shopItems() {
  const F = R.foc, P = R.piz, items = [];
  const add = (id, grp, n, qty, def) => items.push({ id, grp, n, qty, def });
  add('w330', 'Farine', 'Farina forte W330', fmtG(F.q.w330 + P.q.w330), 'have');
  add('man', 'Farine', 'Farina manitoba W250–290', fmtG(P.q.man), 'have');
  add('sem', 'Farine', 'Semola rimacinata di grano duro', fmtG(F.q.sem), 'have');
  add('liev', 'Impasto', 'Lievito di birra fresco', fmtG(F.q.liev + P.q.liev, true) + ' (1 cubetto da 25 g basta)', 'have');
  add('pat', 'Impasto', 'Patate a pasta gialla', Math.max(1, Math.ceil(F.q.pat / 180)) + ' medie (circa ' + fmtG(F.q.pat * 1.15) + ')');
  add('sale', 'Impasto', 'Sale fino', fmtG(F.q.sale + P.q.sale + F.n * 5 + 10));
  add('miele', 'Impasto', 'Miele (al posto del malto)', fmtG(F.q.miele + P.q.miele));
  const oilG = F.q.olio + P.q.olio + F.n * OIL_PER_PAN.foc + P.n * OIL_PER_PAN.piz;
  add('olio', 'Impasto', 'Olio extravergine di oliva', '≈ ' + Math.ceil(oilG / 0.91 / 50) * 50 + ' ml');
  const tu = (t, n) => nf.format(Math.ceil(t.per * n)) + ' ' + (n > 1 && t.u2 ? t.u2 : t.u);
  TOPS.foc.forEach(t => add('f-' + t.id, 'Condimento focaccia', t.n, tu(t, F.n), 'have'));
  TOPS.piz.forEach(t => add('p-' + t.id, 'Condimento pizza', t.n, tu(t, P.n), 'have'));
  add('car', 'Varie', 'Carta forno e teglie unte', '1 rotolo');
  return items;
}
const shopState = it => { const v = state.shop[it.id]; return v === undefined ? (it.def || '') : (v === 'none' ? '' : v); };
function shopText(onlyBuy) {
  const items = shopItems(); let out = '🍕 Lista della spesa — focaccia & pizza\n';
  let grp = '';
  items.forEach(it => {
    const s = shopState(it);
    if (onlyBuy && s) return;
    if (it.grp !== grp) { grp = it.grp; out += '\n' + grp.toUpperCase() + '\n'; }
    out += (s === 'have' ? '✅ ' : s === 'cart' ? '🛒 ' : '⬜ ') + it.n + ' — ' + it.qty + (s === 'have' ? ' (già a casa)' : s === 'cart' ? ' (nel carrello)' : '') + '\n';
  });
  return out.trim();
}

/* ============ TIMER ============ */
let audioCtx = null, ringTimer = null;
function ensureAudio() { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); if (audioCtx.state === 'suspended') audioCtx.resume(); } catch (e) { } }
function beep() {
  if (!audioCtx) return;
  [0, 0.25, 0.5].forEach(t => { const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination); const s = audioCtx.currentTime + t; g.gain.setValueAtTime(0.0001, s); g.gain.exponentialRampToValueAtTime(0.3, s + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, s + 0.2); o.start(s); o.stop(s + 0.22); });
}
function startTimer(id, label, min, atTs) {
  ensureAudio();
  try { if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission(); } catch (e) { }
  const end = atTs ? +atTs : Date.now() + min * 60000;
  state.timers[id] = { end, label, total: end - Date.now(), ack: false };
  save(); tick(); dockPaint();
}
function resetTimer(id) { delete state.timers[id]; save(); ringCheck(); tick(); dockPaint(); }
function tmr(id, label, min, at) {
  return '<span class="tmr" data-id="' + id + '" data-label="' + esc(label) + '" data-min="' + (min || 0) + '"' + (at ? ' data-at="1"' : '') + '></span>';
}
function paintTimer(el) {
  const id = el.dataset.id, t = state.timers[id], min = +el.dataset.min, at = el.dataset.at;
  let html;
  if (!t) html = '<button class="t-start" data-act="tstart">' + (at ? 'Avvisami' : 'Avvia ' + (min >= 60 ? (min / 60) + ' h' : min + ' min')) + '</button>';
  else {
    const left = t.end - Date.now();
    html = left > 0 ? '<span class="t-left">' + clock(left) + '</span><button class="t-reset" data-act="treset">Reset</button>'
      : '<span class="t-left done">Scaduto</span><button class="t-reset" data-act="treset">Reset</button>';
  }
  const key = (t ? (t.end - Date.now() > 0 ? 'r' + clock(t.end - Date.now()) : 'd') : 'i');
  if (el.dataset.k !== key) { el.dataset.k = key; el.innerHTML = html; }
  el.classList.toggle('on', !!t);
}
function clock(ms) { const s = Math.ceil(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return (h ? h + ':' + pad(m) : pad(m)) + ':' + pad(s % 60); }
function tick() { $$('.tmr').forEach(paintTimer); $$('[data-cd]').forEach(el => { const d = +el.dataset.cd - Date.now(); el.textContent = d > 0 ? 'tra ' + dur(d) : 'adesso'; }); ringCheck(); dockPaint(true); }
function ringCheck() {
  const due = Object.entries(state.timers).filter(([, t]) => t.end <= Date.now() && !t.ack);
  const open = $('#ring');
  if (!due.length) { if (open) open.remove(); clearInterval(ringTimer); ringTimer = null; return; }
  if (!open) {
    const d = document.createElement('div'); d.id = 'ring'; d.className = 'ring';
    d.innerHTML = '<div class="ring-card" role="alertdialog"><div class="ring-t">Timer scaduto</div><div class="ring-l"></div><button class="btn big" data-act="ack">OK, fermo</button></div>';
    document.body.appendChild(d);
    if (!ringTimer) { beep(); ringTimer = setInterval(beep, 1500); }
    try { if (navigator.vibrate) navigator.vibrate([300, 150, 300]); } catch (e) { }
    try { if ('Notification' in window && Notification.permission === 'granted') due.forEach(([, t]) => new Notification('Timer scaduto', { body: t.label })); } catch (e) { }
  }
  $('#ring .ring-l').innerHTML = due.map(([, t]) => esc(t.label)).join('<br>');
}
function dockPaint(light) {
  const d = $('#dock'); const act = Object.entries(state.timers).filter(([, t]) => t.end > Date.now()).sort((a, b) => a[1].end - b[1].end);
  if (!act.length) { d.hidden = true; return; }
  d.hidden = false; const [, t] = act[0];
  d.innerHTML = '<button data-act="sheet-timers"><span class="dk-n">' + act.length + '</span><span class="dk-l">' + esc(t.label) + '</span><span class="dk-t">' + clock(t.end - Date.now()) + '</span></button>';
}
function timersSheet() {
  const all = Object.entries(state.timers).sort((a, b) => a[1].end - b[1].end);
  return '<h2>Timer</h2>' + (all.length ? '<ul class="tlist">' + all.map(([id, t]) => '<li><span>' + esc(t.label) + '</span>' + tmr(id, t.label, Math.round(t.total / 60000)) + '</li>').join('') + '</ul>' : '<p class="muted">Nessun timer attivo.</p>');
}

/* ============ COMPONENTI ============ */
const TABS = [['home', 'Bacheca'], ['piano', 'Piano'], ['ricette', 'Ricette'], ['spesa', 'Spesa'], ['forno', 'Forno']];
function paintTabs(route) { $('#tabs').innerHTML = TABS.map(([r, n]) => '<a href="#/' + r + '" class="' + (route === r ? 'on' : '') + '" data-r="' + r + '"><b>' + n + '</b></a>').join(''); }
const back = () => '<a class="back" href="#/home">‹ Bacheca</a>';
const ytThumb = id => 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
const ytUrl = id => 'https://www.youtube.com/watch?v=' + id;
const ytSearch = q => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
function stepper(label, val, act, step) { return '<div class="stepper"><button data-act="' + act + '" data-d="-1" aria-label="meno">−</button><div><b>' + val + '</b><small>' + label + '</small></div><button data-act="' + act + '" data-d="1" aria-label="più">+</button></div>'; }

/* ============ PAGINE ============ */
function nextStep() { return STEPS.find(s => !state.done[s.id]); }
function pageHome() {
  const ns = nextStep(), doneN = Object.keys(state.done).filter(k => state.done[k]).length;
  const items = shopItems(), toBuy = items.filter(i => !shopState(i)).length;
  const tiles = [
    ['piano', '01', 'Piano e procedimento', doneN + ' di ' + STEPS.length + ' passi · orari e timer', 'img/impasto.jpg'],
    ['ricette', '02', 'Ricette e dosi', R.foc.n + ' focacce · ' + R.piz.n + ' pizze in teglia', 'img/focaccia.jpg'],
    ['autolisi', '03', 'Autolisi e pieghe', '40 minuti · stretch & fold', null],
    ['spesa', '04', 'Lista della spesa', toBuy ? toBuy + ' da prendere' : 'Tutto preso', null],
    ['materiali', '05', 'Farine e contenitori', 'Cosa usare e perché', null],
    ['forno', '06', 'Forno Samsung Dual Cook', '250 °C · 2 fasi per teglia', 'img/pizza.jpg'],
    ['video', '07', 'Video tutorial', VIDEOS.length + ' video selezionati', null]
  ];
  const act = Object.keys(state.timers).length;
  return `<section class="hero">
    <img src="img/focaccia.jpg" alt="Focaccia barese con pomodorini e olive in teglia rotonda" fetchpriority="high">
    <div class="hero-t"><p class="eyebrow">Domani si sforna alle ${hm(C.B)}</p><h1>Focaccia barese e pizza in teglia</h1>
    <p>${C.ok ? 'Tutto pronto entro le ' + hm(addM(C.end, 15)) + ', in tempo per uscire alle 20:00.' : '<b>Attenzione:</b> a questo orario finisci dopo le 20:00. Anticipa la prima infornata nel Piano.'}</p></div>
  </section>
  <section class="next card">
    <p class="eyebrow">${ns ? 'Prossimo passo' : 'Completato'}</p>
    ${ns ? `<h2>${ns.title}</h2><p class="muted">${dayOf(ns.t(C))} alle <b>${hm(ns.t(C))}</b> · <span data-cd="${+ns.t(C)}">…</span></p><p>${ns.short}</p>
      <div class="row"><a class="btn" href="#/piano" data-anchor="step-${ns.id}">Apri il passo</a>${(ns.timers || []).filter(t => !t.at).slice(0, 1).map(t => tmr(t.id, t.label, t.min)).join('')}</div>` :
      '<h2>Hai finito. Buon appetito.</h2><p>Per una nuova impastata usa Reset.</p>'}
  </section>
  
  <div class="tiles">${tiles.map(t => `<a class="tile ${t[4] ? 'img' : ''}" href="#/${t[0]}" id="tile-${t[0]}">${t[4] ? `<img src="${t[4]}" alt="" loading="lazy">` : ''}<b>${t[2]}</b><small>${t[3]}</small></a>`).join('')}</div>
  <div class="foot-actions"><button class="btn ghost" data-act="ics">Aggiungi gli orari al calendario</button><button class="btn ghost warn" data-act="reset-ask" id="reset-open">Reset: nuova impastata</button></div>
  <p class="fine">Nota: nell’impasto non esiste l’“elettrolisi”: la tecnica è l’<b>autolisi</b>. L’app la usa in tutte le ricette.</p>`;
}

function pagePiano() {
  const ok = C.fh >= 14 && C.fh <= 40;
  const sec = day => STEPS.filter(s => s.day === day).map(s => stepHtml(s)).join('');
  return `${back()}<h1>Piano e procedimento</h1>
  <p class="lead">Un passo dopo l’altro, con gli orari calcolati a ritroso dall’infornata. Spunta i passi fatti e avvia i timer.</p>
  <div class="card plan-set">
    <label>Inizio impasto (oggi)<input type="time" id="in-start" data-in="start" value="${hmVal(C.S)}"></label>
    <label>Prima infornata (domani)<input type="time" id="in-bake" data-in="bake" value="${state.bake}"></label>
  </div>
  <div class="strip ${ok ? '' : 'bad'}"><div><b>${C.fridgeH}</b><small>in frigo</small></div><div><b>${C.rF + C.rP}</b><small>giri di forno</small></div><div><b>${hm(addM(C.end, 15))}</b><small>pronto${C.ok ? '' : ' (tardi)'}</small></div></div>
  ${C.fh >= 14 && C.fh < 20 ? '<p class="alert">Frigo sotto le 20 ore: usa 3 g di lievito per kg.</p>' : ''}${ok ? '' : '<p class="alert">La maturazione in frigo dovrebbe stare tra 14 e 40 ore. Cambia gli orari.</p>'}
  <h2 class="sec">Oggi</h2><div class="steps">${sec(0)}</div>
  <h2 class="sec">Domani</h2><div class="steps">${sec(1)}</div>`;
}
function stepHtml(s) {
  const t = s.t(C), done = !!state.done[s.id], isNext = nextStep() === s;
  const timers = (s.timers || []).map(x => '<div class="trow"><span>' + esc(x.label) + (x.at ? ' · ' + hm(t) : '') + '</span>' + tmr(x.id, x.label, x.min, x.at) + '</div>').join('');
  return `<details class="step ${done ? 'done' : ''} ${isNext ? 'next' : ''}" id="step-${s.id}" ${isNext ? 'open' : ''}>
    <summary><label class="chk" data-stop><input type="checkbox" data-act="done" data-id="${s.id}" ${done ? 'checked' : ''} aria-label="Fatto"><i></i></label>
      <span class="when"><b>${hm(t)}</b><small>${dayOf(t)}</small></span><span class="what"><b>${s.title}</b><small>${s.short}</small></span></summary>
    <div class="detail">${s.body(C)}${timers ? '<div class="timers">' + timers + '</div>' : ''}
      ${(s.vid || s.ref) ? '<div class="links">' + (s.vid ? '<a href="' + ytUrl(s.vid) + '" target="_blank" rel="noopener">▶ Guarda il video</a>' : '') + (s.ref ? '<a href="#' + s.ref + '">Approfondisci</a>' : '') + '</div>' : ''}<div class="step-act"><button class="btn ${done ? 'ghost' : ''}" data-act="toggle-done" data-id="${s.id}">${done ? 'Segna da fare' : 'Segna come fatto'}</button></div></div></details>`;
}

function ingTable(r, flour) {
  const c = calcRec(r, flour);
  return `<table class="ing"><tbody>${r.ing.map(i => `<tr><td>${i.n}</td><td class="q">${fmtG(c.q[i.id], i.dec)}</td><td class="pc">${Math.round(i.g / 10 * 10) / 10}%</td></tr>`).join('')}
  <tr class="tot"><td>Impasto totale</td><td class="q">${fmtG(c.dough)}</td><td></td></tr></tbody></table>`;
}
function pageRicette() {
  const k = state.recTab, r = REC[k], flour = k === 'foc' ? state.focFlour : state.pizFlour, c = R[k];
  const presets = k === 'foc' ? [3, 4, 5, 6] : [4, 6, 8, 10];
  const T = TOPS[k];
  return `${back()}<h1>Ricette e dosi</h1>
  <div class="seg" role="tablist">${['foc', 'piz'].map(x => `<button role="tab" class="${x === k ? 'on' : ''}" data-act="rtab" data-k="${x}" id="tab-${x}">${REC[x].name}</button>`).join('')}</div>
  <img class="cover" src="${r.img}" alt="${r.name}">
  <p class="lead">${r.blurb}</p>
  <div class="card dose"><p class="eyebrow">Farina di partenza</p>
    ${stepper('di farina totale', fmtG(flour), 'flour')}
    <div class="result"><b>${c.n} ${c.n === 1 ? 'teglia' : 'teglie'}</b> rotonde da 30–32 cm<small>circa ${c.each} g di impasto per teglia · impasto totale ${fmtG(c.dough)}</small></div>
    <p class="muted small">Oppure scegli le teglie:</p>
    <div class="chips">${presets.map(n => `<button data-act="preset" data-n="${n}" class="${c.n === n ? 'on' : ''}">${n} teglie</button>`).join('')}</div></div>
  <h2 class="sec">Ingredienti</h2>${ingTable(r, flour)}
  <p class="muted small">Idratazione ${k === 'foc' ? '70 % + patata (circa 80 % effettivo)' : '72 %'}. Lievito fresco 2 g per kg: pensato per circa 25 ore totali (frigo più 6–7 ore a temperatura ambiente). Con meno di 20 ore in frigo usa 3 g per kg.</p>
  <h2 class="sec">Condimento per ${c.n} ${c.n === 1 ? 'teglia' : 'teglie'}</h2>
  <table class="ing"><tbody>${T.map(t => `<tr><td>${t.n}</td><td class="q">${nf.format(Math.ceil(t.per * c.n))} ${t.u}</td></tr>`).join('')}<tr><td>Olio EVO in teglia e sopra</td><td class="q">${Math.ceil(OIL_PER_PAN[k] * c.n)} g</td></tr></tbody></table>
  <div class="foot-actions"><a class="btn" href="#/piano">Vai al procedimento</a><a class="btn ghost" href="#/spesa">Lista della spesa</a></div>
  <h2 class="sec">Fonti e adattamenti</h2>
  <ul class="src">${k === 'foc' ? `
    <li><a href="https://www.tavolartegusto.it/ricetta/focaccia-barese-ricetta-originale/" target="_blank" rel="noopener">Tavolartegusto — focaccia barese originale</a> · semola, farina e patate</li>
    <li><a href="https://prendiamocideltempo.it/blog-detail/post/73951/focaccia-barese" target="_blank" rel="noopener">Prendiamoci del tempo — focaccia barese</a> · autolisi sulla semola</li>
    <li><a href="https://www.sicilianicreativiincucina.it/focaccia-pugliese/" target="_blank" rel="noopener">Siciliani creativi in cucina — focaccia pugliese</a> · lunga lievitazione</li>
    <li><a href="https://blog.giallozafferano.it/aromincucina/focaccia-barese/" target="_blank" rel="noopener">Aromincucina — focaccia barese</a></li>` : `
    <li><a href="https://blog.giallozafferano.it/spadellalapadella/pizza-in-teglia-alla-romana-impasto-in-giornata-con-autolisi/" target="_blank" rel="noopener">Spadella la padella — pizza in teglia con autolisi</a></li>
    <li><a href="https://blog.giallozafferano.it/millegrammi/pizza-in-teglia-24-48-ore/" target="_blank" rel="noopener">Millegrammi — pizza in teglia 24–48 ore</a></li>
    <li><a href="https://www.pizzaefocaccia.it/pizza-bonci-impasto-per-pizza-24-ore-lievitazione/" target="_blank" rel="noopener">PizzaeFocaccia — impasto 24 ore</a></li>`}</ul>
  <p class="fine">Le percentuali sono adattate alle tue farine (W330, manitoba W250–290, semola rimacinata). Il malto è sostituito con miele.</p>`;
}

function pageAutolisi() {
  return `${back()}<h1>Autolisi e pieghe</h1>
  <img class="cover" src="img/impasto.jpg" alt="Mani che eseguono una piega su un impasto idratato in un contenitore trasparente">
  <p class="lead">Farina e acqua si riposano prima di lievito e sale. Il glutine si forma da solo, con meno impasto e meno fatica.</p>
  <div class="card"><p class="eyebrow">Una precisazione</p><p>Hai scritto “elettrolisi”: nell’impasto non c’entra. La tecnica che serve è l’<b>autolisi</b>, ed è quella che trovi in tutte le ricette qui.</p></div>
  <h2 class="sec">Perché farla</h2>
  ${li(['Le farine si <b>idratano completamente</b>: l’impasto si lavora meglio, anche con la semola.', 'Il glutine si organizza da solo: servono meno pieghe e meno forza.', 'Impasto più <b>estensibile</b>: si stende in teglia senza ritrarsi.', 'Non si aggiungono lievito e sale: non parte la fermentazione e il sale non stringe il glutine.'])}
  <h2 class="sec">Come farla</h2>
  ${ol(['Farine + <b>circa 90 %</b> dell’acqua totale (tieni da parte l’8 % della farina in acqua, 80 g per kg).', 'Mescola solo fino a non vedere farina asciutta.', 'Copri e riposa <b>40 minuti</b> a 20–22 °C. Con la semola puoi arrivare a 60 minuti.', 'Aggiungi poi lievito (in soluzione), miele, patata e sale, e “pinza” 10–12 minuti.'])}
  <div class="row">${tmr('auto', 'Autolisi', 40)}</div>
  <h2 class="sec">Stretch &amp; fold</h2>
  ${ol(['Mani bagnate. Afferra un lembo, tiralo verso l’alto senza strapparlo e ripiegalo al centro.', 'Ruota il contenitore di un quarto e ripeti: 4 lembi = un giro. Due giri a ogni piega.', 'Riposo di 30 minuti tra una piega e l’altra. Due pieghe in tutto.', 'Pieghe a portafoglio per la seconda: più delicate, per non sgonfiare le bolle.'])}
  <div class="row">${tmr('fold1', 'Riposo dopo piega 1', 30)}${tmr('fold2', 'Riposo dopo piega 2', 30)}</div>
  <h2 class="sec">Come capire se funziona</h2>
  ${li(['Dopo l’autolisi l’impasto è liscio, appiccicoso ma coeso.', 'Test della “finestra”: un pezzo tirato fra le dita si assottiglia senza rompersi.', 'Dopo le pieghe è più tonico e comincia a mostrare bolle sotto la superficie.'])}
  <h2 class="sec">Video</h2>
  <div class="vids">${['ukrR6dAVS0Y', 'pLg4BL11Dxw'].map(id => vidCard(VIDEOS.find(v => v.id === id))).join('')}</div>`;
}

function pageMateriali() {
  return `${back()}<h1>Farine e contenitori</h1>
  <h2 class="sec" id="farine">Le farine e perché</h2>
  <div class="list">${FLOURS.map(f => `<article class="card"><p class="eyebrow">${f.role}</p><h3>${f.n}</h3><p>${f.why}</p><p class="muted small"><b>Dove:</b> ${f.use}</p></article>`).join('')}</div>
  ${li(FLOUR_TIPS)}
  <h2 class="sec" id="contenitori">Contenitori per la lievitazione</h2>
  <div class="list">${CONTAINERS.map(f => `<article class="card ${f.best ? 'best' : ''}">${f.best ? '<p class="eyebrow">Migliore</p>' : ''}<h3>${f.n}</h3><p>${f.d}</p><p class="muted small"><b>Capienza:</b> ${f.size}</p></article>`).join('')}</div>
  <h3>Regole pratiche</h3>${li(CONT_RULES)}
  <p class="muted small">Con ${R.foc.n} panetti da ${R.foc.each} g di focaccia e ${R.piz.n} da ${R.piz.each} g di pizza: ${R.foc.n} contenitori da ≥ ${Math.ceil(R.foc.each * 4 / 100) / 10} L e ${R.piz.n} da ≥ ${Math.ceil(R.piz.each * 4 / 100) / 10} L.</p>`;
}

function pageForno() {
  const F = R.foc, P = R.piz;
  return `${back()}<h1>Forno Samsung Dual Cook</h1>
  <p class="lead">Temperatura massima 250 °C, ripiani bassi, teglie scure. I nomi delle modalità variano tra i modelli: se la tua non è in elenco, usa Convenzionale.</p>
  <div class="card"><p class="eyebrow">Quante teglie hai?</p>${stepper('teglie rotonde disponibili', state.pans, 'pans')}
    <div class="strip"><div><b>${F.n} + ${P.n}</b><small>focacce + pizze</small></div><div><b>${C.rF + C.rP}</b><small>giri di forno</small></div><div><b>${hm(addM(C.end, 15))}</b><small>tutto pronto</small></div></div>
    <p class="muted small">Si cuociono ${C.racks} ${C.racks === 1 ? 'teglia' : 'teglie'} per volta (${C.rF} giri focaccia · ${C.rP} giri pizza). ${C.ok ? 'Sei dentro le 20:00.' : '<b>Oltre le 20:00:</b> anticipa l’infornata.'}</p></div>
  <h2 class="sec">Focaccia barese</h2>
  <div class="oven"><div class="ov"><b>Preriscalda</b><span>Convenzionale 250 °C, circa 20–25 min</span>${tmr('pre', 'Preriscaldamento forno', 25)}</div>
  <div class="ov"><b>Fase 1 · 15 min</b><span>Sotto + Ventilato 220 °C · ripiano basso</span>${tmr('bf1', 'Focaccia, fase 1', 15)}</div>
  <div class="ov"><b>Fase 2 · 8–10 min</b><span>Convenzionale 220 °C · ripiano centrale</span>${tmr('bf2', 'Focaccia, fase 2', 10)}</div></div>
  <p class="muted small">Totale circa 25 minuti. Apri il forno solo al minuto 15, per cambiare modalità.</p>
  <h2 class="sec">Pizza in teglia</h2>
  <div class="oven"><div class="ov"><b>Fase 1 · 7 min</b><span>Convenzionale 250 °C · ripiano basso · solo pomodoro</span>${tmr('bp1', 'Pizza, fase 1', 7)}</div>
  <div class="ov"><b>Fase 2 · 6–8 min</b><span>Aggiungi la mozzarella, stessa temperatura</span>${tmr('bp2', 'Pizza, fase 2', 7)}</div>
  <div class="ov"><b>Riposo</b><span>5 min nella teglia, poi su griglia</span>${tmr('cool', 'Raffreddamento', 15)}</div></div>
  <h2 class="sec">Le modalità</h2>
  <div class="list">${OVEN_MODES.map(m => `<article class="card"><h3>${m.n}</h3>${m.en ? '<p class="muted small">' + m.en + '</p>' : ''}<p>${m.d}</p><p class="muted small"><b>Qui:</b> ${m.use}</p></article>`).join('')}</div>
  <h2 class="sec">Consigli per questo forno</h2>
  ${li(['<b>Togli il separatore</b> Dual Cook per le teglie da 30–32 cm: la focaccia lievitata è alta circa 3 cm.', 'Usa teglie <b>scure e metalliche</b>: assorbono più calore, il fondo diventa croccante. Evita vetro e ceramica.', 'Il preriscaldamento a 250 °C richiede circa 20 minuti: aspetta il segnale acustico.', 'Con una sola teglia usa il <b>ripiano basso</b>. Se il fondo resta chiaro, abbassa ancora il ripiano o scalda prima la teglia vuota.', 'Con due teglie: due ripiani in modalità Ventilato (210 °C), scambia le teglie a metà cottura.', 'Il forno non ha vapore dedicato su tutti i modelli: per queste ricette non serve.'])}
  <p class="muted small">Fonti: <a href="https://www.samsung.com/uk/support/home-appliances/what-cooking-modes-are-available-on-my-samsung-oven/" target="_blank" rel="noopener">Samsung — modalità di cottura</a> · <a href="https://eu.community.samsung.com/t5/elettrodomestici/cottura-pizza-forno-nv75k5541rm/td-p/5257838" target="_blank" rel="noopener">Community Samsung — pizza e Dual Cook</a>.</p>
  <h2 class="sec">Video</h2><div class="vids">${VIDEOS.filter(v => v.g.startsWith('Forno')).slice(0, 2).map(vidCard).join('')}</div>`;
}

function vidCard(v) { return `<a class="vid" href="${ytUrl(v.id)}" target="_blank" rel="noopener"><span class="th"><img src="${ytThumb(v.id)}" alt="" loading="lazy" onerror="this.remove()"><i>▶</i></span><span class="vt"><b>${v.t}</b><small>${v.why}</small></span></a>`; }
function pageVideo() {
  const groups = [...new Set(VIDEOS.map(v => v.g))];
  return `${back()}<h1>Video tutorial</h1><p class="lead">Si aprono su YouTube.</p>
  ${groups.map(g => `<h2 class="sec">${g}</h2><div class="vids">${VIDEOS.filter(v => v.g === g).map(vidCard).join('')}</div>`).join('')}
  <h2 class="sec">Ricerche mirate</h2><ul class="src">${YT_SEARCHES.map(s => `<li><a href="${ytSearch(s.q)}" target="_blank" rel="noopener">${s.t}</a></li>`).join('')}</ul>`;
}

function pageSpesa() {
  const items = shopItems(); const groups = [...new Set(items.map(i => i.grp))];
  const toBuy = items.filter(i => !shopState(i)).length;
  return `${back()}<h1>Lista della spesa</h1>
  <p class="lead"><b>${toBuy}</b> da prendere su ${items.length}. Per ogni voce: già a casa o nel carrello.</p>
  <div class="foot-actions first"><button class="btn" data-act="copy" data-m="buy" id="copy-buy">Copia solo da comprare</button><button class="btn ghost" data-act="copy" data-m="all" id="copy-all">Copia lista completa</button>${navigator.share ? '<button class="btn ghost" data-act="share">Condividi…</button>' : ''}</div>
  ${groups.map(g => `<h2 class="sec">${g}</h2><ul class="shop">${items.filter(i => i.grp === g).map(i => { const s = shopState(i); return `<li class="${s}" id="shop-${i.id}"><div class="nm"><b>${i.n}</b><small>${i.qty}</small></div><div class="sw"><button data-act="have" data-id="${i.id}" class="${s === 'have' ? 'on' : ''}" aria-pressed="${s === 'have'}">Ho già</button><button data-act="cart" data-id="${i.id}" class="${s === 'cart' ? 'on' : ''}" aria-pressed="${s === 'cart'}">Carrello</button></div></li>`; }).join('')}</ul>`).join('')}
  <p class="fine">Farine, lievito e condimenti sono già segnati “Ho già”. Le quantità cambiano con le dosi nella sezione Ricette.</p>`;
}

const PAGES = { home: pageHome, piano: pagePiano, ricette: pageRicette, autolisi: pageAutolisi, materiali: pageMateriali, forno: pageForno, video: pageVideo, spesa: pageSpesa };
const TITLES = { home: 'Bacheca', piano: 'Piano e procedimento', ricette: 'Ricette e dosi', autolisi: 'Autolisi e pieghe', materiali: 'Farine e contenitori', forno: 'Forno Samsung Dual Cook', video: 'Video tutorial', spesa: 'Lista della spesa' };

/* ============ ROUTER ============ */
let pendingAnchor = null;
function route() { const r = (location.hash.replace(/^#\/?/, '') || 'home').split('?')[0]; return PAGES[r] ? r : 'home'; }
function render(keepScroll) {
  recalc();
  const r = route(), y = window.scrollY;
  $('#view').innerHTML = '<div class="page" data-page="' + r + '">' + PAGES[r]() + '</div>';
  document.title = TITLES[r] + ' — Focaccia & pizza';
  paintTabs(['home', 'piano', 'ricette', 'spesa', 'forno'].includes(r) ? r : '');
  tick(); dockPaint();
  if (pendingAnchor) { const el = document.getElementById(pendingAnchor); pendingAnchor = null; if (el) { if (el.tagName === 'DETAILS') el.open = true; setTimeout(() => el.scrollIntoView({ block: 'start', behavior: 'smooth' }), 30); } }
  else window.scrollTo(0, keepScroll ? y : 0);
}
window.addEventListener('hashchange', () => { closeOverlay(); render(false); });

/* ============ OVERLAY: SHEET, RESET, SPOTLIGHT ============ */
function openSheet(html, cls) { const o = $('#overlay'); o.innerHTML = '<div class="scrim" data-act="close"></div><div class="sheet ' + (cls || '') + '" role="dialog" aria-modal="true"><div class="grab"></div>' + html + '<button class="btn ghost" data-act="close">Chiudi</button></div>'; document.body.classList.add('lock'); }
function closeOverlay() { $('#overlay').innerHTML = ''; document.body.classList.remove('lock'); }
function resetSheet() {
  return '<h2>Nuova impastata</h2><p>Azzera passi fatti, timer, spunte della spesa e orari (inizio impasto = adesso).</p><div class="stack"><button class="btn" data-act="reset-do" id="reset-keep">Azzera, tieni le dosi</button><button class="btn warn" data-act="reset-all" id="reset-full">Azzera tutto, anche le dosi</button></div>';
}

/* Indice Spotlight */
function buildIndex() {
  const I = [];
  const sec = (r, t, kw) => I.push({ ty: 'Sezione', t, s: kw, r });
  sec('home', 'Bacheca', 'home panoramica sezioni'); sec('piano', 'Piano e procedimento', 'procedimento orari tempi riposo lievitazione staglio rimaneggiatura');
  sec('ricette', 'Ricette e dosi', 'ricetta dosi teglie farina peso focaccia pizza condimento'); sec('autolisi', 'Autolisi e pieghe', 'autolisi elettrolisi pieghe stretch fold');
  sec('spesa', 'Lista della spesa', 'spesa carrello ho già whatsapp telegram copia condividi'); sec('materiali', 'Farine e contenitori', 'farine contenitori plastica lievitazione W330 manitoba semola miele malto');
  sec('forno', 'Forno Samsung Dual Cook', 'forno samsung temperature modalità cottura ventilato statico dual cook'); sec('video', 'Video tutorial', 'video youtube tutorial');
  STEPS.forEach(s => I.push({ ty: 'Passo', t: s.title, s: s.short + ' ' + strip(s.body(C)), r: 'piano', a: 'step-' + s.id }));
  Object.values(REC).forEach(rc => rc.ing.forEach(i => I.push({ ty: 'Ingrediente', t: i.n + ' — ' + rc.short, s: rc.name, r: 'ricette' })));
  shopItems().forEach(i => I.push({ ty: 'Spesa', t: i.n, s: i.qty, r: 'spesa', a: 'shop-' + i.id }));
  VIDEOS.forEach(v => I.push({ ty: 'Video', t: v.t, s: v.g + ' ' + v.why, r: 'video' }));
  FLOURS.forEach(f => I.push({ ty: 'Farina', t: f.n, s: f.role + ' ' + f.why, r: 'materiali' }));
  CONTAINERS.forEach(f => I.push({ ty: 'Contenitore', t: f.n, s: f.d, r: 'materiali', a: 'contenitori' }));
  OVEN_MODES.forEach(m => I.push({ ty: 'Forno', t: m.n, s: m.d + ' ' + m.use, r: 'forno' }));
  FAQ.forEach(f => I.push({ ty: 'Domanda', t: f.q, s: strip(f.a), r: 'autolisi' }));
  I.forEach(i => { i.n = norm(i.t); i.h = norm(i.t + ' ' + i.s); });
  return I;
}
let SIDX = null, sres = [], ssel = 0;
function openSearch() {
  SIDX = buildIndex();
  const o = $('#overlay'); o.innerHTML = '<div class="scrim" data-act="close"></div><div class="spotlight" role="dialog" aria-modal="true" aria-label="Ricerca"><input id="q" type="search" placeholder="Cerca in tutta l’app" autocomplete="off" aria-label="Cerca"><ul id="res"></ul></div>';
  document.body.classList.add('lock'); const q = $('#q'); q.focus(); searchRun('');
  q.addEventListener('input', () => searchRun(q.value));
  q.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { ssel = Math.min(sres.length - 1, ssel + 1); selPaint(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { ssel = Math.max(0, ssel - 1); selPaint(); e.preventDefault(); }
    else if (e.key === 'Enter' && sres[ssel]) go(sres[ssel]);
  });
}
function searchRun(v) {
  const toks = norm(v).split(/\s+/).filter(Boolean);
  if (!toks.length) sres = SIDX.filter(i => i.ty === 'Sezione' && i.r !== 'home');
  else sres = SIDX.map(i => { if (!toks.every(t => i.h.includes(t))) return null; let sc = 0; toks.forEach(t => { if (i.n.includes(t)) sc += 5; if (i.n.startsWith(t)) sc += 3; sc += 1; }); if (i.ty === 'Sezione') sc += 6; return [sc, i]; }).filter(Boolean).sort((a, b) => b[0] - a[0]).slice(0, 14).map(x => x[1]);
  ssel = 0;
  $('#res').innerHTML = sres.length ? sres.map((i, k) => '<li><button data-act="go" data-k="' + k + '" class="' + (k === 0 ? 'sel' : '') + '"><span class="ty">' + i.ty + '</span><b>' + esc(i.t) + '</b></button></li>').join('') : '<li class="none">Nessun risultato per “' + esc(v) + '”</li>';
}
function selPaint() { $$('#res button').forEach((b, k) => b.classList.toggle('sel', k === ssel)); const b = $$('#res button')[ssel]; if (b) b.scrollIntoView({ block: 'nearest' }); }
function go(i) { closeOverlay(); pendingAnchor = i.a || null; if (route() === i.r) render(); else location.hash = '#/' + i.r; }

/* ============ CALENDARIO (.ics) ============ */
function ics() {
  const f = d => d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + 'T' + pad(d.getHours()) + pad(d.getMinutes()) + '00';
  const keys = ['prep', 'auto', 'mix', 'fold1', 'fold2', 'staglio', 'fridge', 'out', 'pan', 'pre', 'bakeF', 'bakeP'];
  let o = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Focaccia e Pizza//IT\r\n';
  STEPS.filter(s => keys.includes(s.id)).forEach(s => { const t = s.t(C); o += 'BEGIN:VEVENT\r\nUID:' + s.id + '-' + +C.S + '@focaccia\r\nDTSTAMP:' + f(new Date()) + '\r\nDTSTART:' + f(t) + '\r\nDTEND:' + f(addM(t, 15)) + '\r\nSUMMARY:🍕 ' + s.title + '\r\nBEGIN:VALARM\r\nACTION:DISPLAY\r\nDESCRIPTION:' + s.title + '\r\nTRIGGER:PT0M\r\nEND:VALARM\r\nEND:VEVENT\r\n'; });
  o += 'END:VCALENDAR';
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([o], { type: 'text/calendar' })); a.download = 'focaccia-pizza.ics'; document.body.appendChild(a); a.click(); a.remove();
}

/* ============ COPIA ============ */
async function copyText(txt) {
  try { await navigator.clipboard.writeText(txt); return true; } catch (e) {
    const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (er) { } t.remove(); return ok;
  }
}
function toast(msg) { let t = $('#toast'); if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); } t.textContent = msg; t.classList.add('show'); clearTimeout(toast.h); toast.h = setTimeout(() => t.classList.remove('show'), 2200); }

/* ============ EVENTI ============ */
const FLOUR_STEP = 250, FLOUR_MIN = 1000, FLOUR_MAX = 6000;
document.addEventListener('click', async e => {
  const a = e.target.closest('[data-act]');
  if (!a) {
    const an = e.target.closest('[data-anchor]'); if (an) pendingAnchor = an.dataset.anchor;
    if (e.target.closest('[data-stop]')) e.stopPropagation();
    return;
  }
  const act = a.dataset.act, id = a.dataset.id;
  switch (act) {
    case 'open-search': openSearch(); break;
    case 'close': closeOverlay(); break;
    case 'go': go(sres[+a.dataset.k]); break;
    case 'tstart': { const el = a.closest('.tmr'); startTimer(el.dataset.id, el.dataset.label, +el.dataset.min, el.dataset.at ? (() => { const s = STEPS.find(x => (x.timers || []).some(t => t.id === el.dataset.id)); return s ? Math.max(+s.t(C), Date.now() + 1000) : null; })() : null); render(true); if ($('#overlay .sheet')) { $('#overlay .sheet').innerHTML = timersSheet(); } break; }
    case 'treset': { const el = a.closest('.tmr'); resetTimer(el.dataset.id); render(true); break; }
    case 'ack': Object.values(state.timers).forEach(t => { if (t.end <= Date.now()) t.ack = true; }); save(); ringCheck(); break;
    case 'sheet-timers': openSheet(timersSheet()); tick(); break;
    case 'done': state.done[id] = a.checked; save(); render(true); break;
    case 'toggle-done': state.done[id] = !state.done[id]; save(); render(true); break;
    case 'have': case 'cart': { const it = shopItems().find(x => x.id === id), cur = shopState(it); state.shop[id] = cur === act ? 'none' : act; save(); render(true); break; }
    case 'copy': toast((await copyText(shopText(a.dataset.m === 'buy'))) ? 'Lista copiata. Incollala su WhatsApp o Telegram.' : 'Copia non riuscita'); break;
    case 'share': try { await navigator.share({ title: 'Lista della spesa', text: shopText(true) }); } catch (er) { } break;
    case 'rtab': state.recTab = a.dataset.k; save(); render(true); break;
    case 'flour': { const k = state.recTab === 'foc' ? 'focFlour' : 'pizFlour'; state[k] = Math.min(FLOUR_MAX, Math.max(FLOUR_MIN, state[k] + FLOUR_STEP * +a.dataset.d)); save(); render(true); break; }
    case 'preset': { const k = state.recTab, r = REC[k], per = r.ing.reduce((s, i) => s + i.g, 0) / 1000; const f = Math.max(FLOUR_MIN, Math.ceil(+a.dataset.n * r.pan / per / 50) * 50); state[k === 'foc' ? 'focFlour' : 'pizFlour'] = f; save(); render(true); break; }
    case 'pans': state.pans = Math.min(8, Math.max(1, state.pans + +a.dataset.d)); save(); render(true); break;
    case 'ics': ics(); break;
    case 'reset-ask': openSheet(resetSheet()); break;
    case 'reset-do': case 'reset-all': { const d = defaults(); const keep = act === 'reset-do' ? { focFlour: state.focFlour, pizFlour: state.pizFlour, pans: state.pans, bake: state.bake } : {}; Object.values(state.timers).length && (state.timers = {}); state = Object.assign(d, keep); save(); closeOverlay(); ringCheck(); location.hash = '#/home'; render(false); toast('Pronto per una nuova impastata'); break; }
  }
});
document.addEventListener('change', e => {
  const i = e.target.closest('[data-in]'); if (!i || !i.value) return;
  const [h, m] = i.value.split(':').map(Number);
  if (i.dataset.in === 'start') { const d = new Date(state.start); d.setHours(h, m, 0, 0); state.start = +d; } else state.bake = i.value;
  save(); render(true);
});
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); }
  else if (e.key === 'Escape') closeOverlay();
  else if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
});
$('#open-search').addEventListener('click', openSearch);
document.addEventListener('visibilitychange', () => { if (!document.hidden) tick(); });
setInterval(tick, 1000);
render(false);

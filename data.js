/* ============ DATI & CONTENUTI ============ */

/* Ricette: quantità per 1 kg di farina totale */
const REC = {
  foc: {
    key: 'foc', name: 'Focaccia barese', short: 'Focaccia', pan: 700, img: 'img/focaccia.jpg',
    blurb: 'Semola rimacinata e farina forte, patata lessa, tanto olio, pomodorini e olive. Alta, soffice dentro, bordo che scrocchia.',
    ing: [
      { id: 'w330', n: 'Farina forte W330', g: 500, grp: 'Farine' },
      { id: 'sem', n: 'Semola rimacinata di grano duro', g: 500, grp: 'Farine' },
      { id: 'acq', n: 'Acqua (18–20 °C)', g: 700, grp: 'Liquidi' },
      { id: 'pat', n: 'Patata lessa, sbucciata e schiacciata', g: 200, grp: 'Impasto' },
      { id: 'liev', n: 'Lievito di birra fresco', g: 2, grp: 'Impasto', dec: true },
      { id: 'sale', n: 'Sale fino', g: 25, grp: 'Impasto' },
      { id: 'olio', n: 'Olio EVO (nell’impasto)', g: 30, grp: 'Impasto' },
      { id: 'miele', n: 'Miele (al posto del malto)', g: 10, grp: 'Impasto' }
    ]
  },
  piz: {
    key: 'piz', name: 'Pizza in teglia', short: 'Pizza', pan: 450, img: 'img/pizza.jpg',
    blurb: 'Miscela W330 + manitoba: impasto forte ma estensibile, 72 % di idratazione, alveolatura aperta e fondo croccante.',
    ing: [
      { id: 'w330', n: 'Farina forte W330', g: 500, grp: 'Farine' },
      { id: 'man', n: 'Farina manitoba W250–290', g: 500, grp: 'Farine' },
      { id: 'acq', n: 'Acqua (18–20 °C)', g: 720, grp: 'Liquidi' },
      { id: 'liev', n: 'Lievito di birra fresco', g: 2, grp: 'Impasto', dec: true },
      { id: 'sale', n: 'Sale fino', g: 25, grp: 'Impasto' },
      { id: 'olio', n: 'Olio EVO (nell’impasto)', g: 30, grp: 'Impasto' },
      { id: 'miele', n: 'Miele (al posto del malto)', g: 10, grp: 'Impasto' }
    ]
  }
};
/* quota di acqua tenuta da parte per sciogliere lievito e sale dopo l'autolisi: 8% della farina */
const RESERVE = 80;

/* Condimenti per teglia (g/ml per teglia) */
const TOPS = {
  foc: [
    { id: 'pom', n: 'Pomodorini ciliegino', per: 300, u: 'g' },
    { id: 'oli', n: 'Olive baresane / Bella di Cerignola denocciolate', per: 100, u: 'g' },
    { id: 'orig', n: 'Origano secco', per: 2, u: 'g' },
    { id: 'sg', n: 'Sale grosso', per: 4, u: 'g' }
  ],
  piz: [
    { id: 'pel', n: 'Pelati / passata di pomodoro', per: 160, u: 'g' },
    { id: 'moz', n: 'Mozzarella fior di latte (da scolare)', per: 250, u: 'g' },
    { id: 'bas', n: 'Basilico fresco', per: 1, u: 'mazzetto' },
    { id: 'orig2', n: 'Origano secco', per: 1, u: 'g' }
  ]
};
const OIL_PER_PAN = { foc: 60, piz: 25 }; /* olio EVO per teglia + condimento */

/* Video — ID presi dai risultati di ricerca; thumbnail da YouTube */
const VIDEOS = [
  { g: 'Focaccia barese', id: '_scqlSt7Bec', t: 'Focaccia barese a lunga lievitazione, con semola rimacinata e pieghe', why: 'La lavorazione a giri di pieghe è quella che usiamo qui.' },
  { g: 'Focaccia barese', id: 'ukrR6dAVS0Y', t: 'La focaccia pugliese di semola — Giangi De Masi consiglia l’autolisi', why: 'Perché l’autolisi è fondamentale con la semola.' },
  { g: 'Focaccia barese', id: 'KQX4JGP3zaY', t: 'Focaccia barese con la patata (Caputo)', why: 'Stesura in teglia e fossette, passaggio per passaggio.' },
  { g: 'Focaccia barese', id: '7kSJF-YAT4E', t: 'Focaccia pugliese soffice con la patata', why: 'Come si presenta l’impasto con la patata.' },
  { g: 'Pizza in teglia e autolisi', id: 'pLg4BL11Dxw', t: 'Pizza in teglia a lunga lievitazione con autolisi: impasto e pieghe', why: 'Autolisi e chiusura delle pieghe su impasto idratato.' },
  { g: 'Pizza in teglia e autolisi', id: 'A-P5eWUyG-8', t: 'Pizza in teglia ad alta idratazione con autolisi', why: 'Gestione di un impasto molto idratato.' },
  { g: 'Pizza in teglia e autolisi', id: 'r4wf6Ysarxw', t: 'Pizza in teglia con autolisi — 24 ore di maturazione', why: 'Esattamente la tempistica che stai seguendo.' },
  { g: 'Forno Samsung Dual Cook', id: '3dyM-nQ4r6M', t: 'Come usare le funzioni principali di un forno Samsung (statico, Dual Cook, vapore)', why: 'Impostare modalità, temperatura e Dual Cook.' },
  { g: 'Forno Samsung Dual Cook', id: '91sUtOTEknI', t: 'Samsung Dual Cook Flex Oven — guida completa', why: 'Separatore, zone di cottura e modalità.' },
  { g: 'Forno Samsung Dual Cook', id: 'pzdWvrUIknI', t: 'Samsung Forno Dual Cook Flex (presentazione)', why: 'Come funzionano zona alta e zona bassa.' }
];
const YT_SEARCHES = [
  { t: 'Pieghe a tre e pieghe a portafoglio su impasto idratato', q: 'pieghe impasto alta idratazione focaccia' },
  { t: 'Messa in teglia e stesura dell’impasto (focaccia)', q: 'focaccia barese messa in teglia fossette salamoia' },
  { t: 'Forno Samsung Dual Cook: pizza in teglia', q: 'forno samsung dual cook pizza in teglia' }
];

/* ========== PASSI DEL PROCEDIMENTO ==========
   t(c): orario; c = {S (inizio), B (prima infornata), rF, rP (giri di forno), tF, tP (minuti a giro)}
   timers: [{id,label,min}] oppure {at:true} per sveglia a orario */
const li = a => '<ul>' + a.map(x => '<li>' + x + '</li>').join('') + '</ul>';
const ol = a => '<ol>' + a.map(x => '<li>' + x + '</li>').join('') + '</ol>';
const addM = (d, m) => new Date(+d + m * 60000);

function buildSteps(R) {
  const F = R.foc, P = R.piz;
  const fl = (r, id) => fmtG(r.q[id]);
  return [
    { id: 'prep', day: 0, t: c => c.S, title: 'Prepara tutto e metti a bollire le patate', short: 'Pesa gli ingredienti, accendi il fuoco sotto le patate.',
      timers: [{ id: 'pat', label: 'Patate in bollitura', min: 35 }],
      body: () => li([
        '<b>Pesa tutto</b> in ciotole separate: una per la focaccia, una per la pizza (quantità nella sezione Ricette).',
        '<b>Patate</b> (' + fl(F, 'pat') + '): lavale, mettile <b>con la buccia</b> in acqua fredda salata e cuocile 30–35 minuti da bollore, finché la forchetta entra senza resistenza. Poi sbuccia, schiaccia e lascia raffreddare: devono essere <b>fredde o tiepide</b> quando le aggiungi.',
        '<b>Acqua</b> a 18–20 °C (non ghiacciata): serve per arrivare a un impasto finito a 23–24 °C.',
        'Prepara <b>contenitori</b> (vedi Materiali) e olio EVO. Ungi leggermente i contenitori, non infarinarli.'
      ]) },
    { id: 'auto', day: 0, t: c => addM(c.S, 10), title: 'Autolisi (40 minuti)', short: 'Solo farine e acqua, senza lievito né sale.', vid: 'ukrR6dAVS0Y', ref: '/autolisi',
      timers: [{ id: 'auto', label: 'Autolisi', min: 40 }],
      body: () => ol([
        '<b>Focaccia</b>: ' + fl(F, 'w330') + ' W330 + ' + fl(F, 'sem') + ' semola rimacinata + <b>' + fmtG(F.q.acq - F.q.res) + ' di acqua</b> (i restanti ' + fmtG(F.q.res) + ' li tieni da parte).',
        '<b>Pizza</b>: ' + fl(P, 'w330') + ' W330 + ' + fl(P, 'man') + ' manitoba + <b>' + fmtG(P.q.acq - P.q.res) + ' di acqua</b> (' + fmtG(P.q.res) + ' da parte).',
        'Mescola con la mano o una spatola <b>solo fino a non vedere più farina asciutta</b> (1–2 minuti). Non impastare: devono lavorare acqua e tempo.',
        'Copri e lascia riposare 40 minuti a temperatura ambiente. In questo tempo le patate si raffreddano.',
        'Non mettere ancora lievito, sale, miele e olio.'
      ]) },
    { id: 'mix', day: 0, t: c => addM(c.S, 50), title: 'Incordatura: lievito, sale, olio', short: 'Si aggiungono gli ingredienti e si “pinza” fino a un impasto coeso.', 
      timers: [{ id: 'mix', label: 'Incordatura', min: 12 }],
      body: () => ol([
        '<b>Soluzione di lievito</b>: sciogli 5 g di lievito fresco in 95 g di acqua. Usane <b>20 g ogni grammo di lievito richiesto</b>: focaccia ' + fmtG(F.q.liev, true) + ' = ' + fmtG(F.q.liev * 20) + ' di soluzione, pizza ' + fmtG(P.q.liev, true) + ' = ' + fmtG(P.q.liev * 20) + '. Se la tua bilancia arriva al decimo di grammo, pesa il lievito direttamente.',
        'Aggiungi alla ciotola la soluzione di lievito e il <b>miele</b> (' + fmtG(F.q.miele) + ' focaccia, ' + fmtG(P.q.miele) + ' pizza). Solo focaccia: aggiungi anche la <b>patata schiacciata</b> (' + fmtG(F.q.pat) + ').',
        '<b>Pinza e piega</b> (metodo Rubaud): infila il pollice e l’indice, strizza l’impasto e ripiegalo su sé stesso, ruotando la ciotola. 3–4 minuti, finché lievito e patata sono distribuiti.',
        'Aggiungi il <b>sale</b> sciolto nei restanti ' + fmtG(F.q.res) + ' (focaccia) e ' + fmtG(P.q.res) + ' (pizza) di acqua, in due volte, e continua a pinzare. L’impasto si scioglierà e poi si ricompatterà: è normale.',
        '<b>Olio</b> (' + fmtG(F.q.olio) + ' focaccia, ' + fmtG(P.q.olio) + ' pizza) a filo, in 2–3 volte, sempre pinzando.',
        'Fine: impasto liscio, appiccicoso ma coeso, che si stacca dalle pareti. Totale 10–12 minuti. Con planetaria: gancio, velocità bassa, 8–10 minuti, fermandoti prima che si scaldi.'
      ]) },
    { id: 'rest1', day: 0, t: c => addM(c.S, 65), title: 'Primo riposo (25 minuti)', short: 'Ciotola unta, coperta.',
      timers: [{ id: 'rest1', label: 'Primo riposo', min: 25 }],
      body: () => li(['Trasferisci ogni impasto in un contenitore unto, coperto con coperchio appoggiato.', 'Temperatura ambiente 20–22 °C. Se la cucina è più calda, accorcia a 15–20 minuti.']) },
    { id: 'fold1', day: 0, t: c => addM(c.S, 90), title: 'Piega n. 1 + riposo 30 minuti', short: 'Pieghe a tre (stretch & fold) con mani bagnate.', vid: '_scqlSt7Bec', ref: '/autolisi',
      timers: [{ id: 'fold1', label: 'Riposo dopo piega 1', min: 30 }],
      body: () => ol([
        'Bagna le mani. Afferra un lembo dell’impasto, <b>tiralo verso l’alto</b> senza strapparlo e ripiegalo verso il centro.',
        'Ruota il contenitore di un quarto e ripeti: 4 lembi = <b>un giro</b>. Fai 2 giri.',
        'Capovolgi l’impasto con la chiusura sotto, copri e <b>riposa 30 minuti</b>.',
        'Segnale giusto: l’impasto comincia a essere più elastico e liscio.'
      ]) },
    { id: 'fold2', day: 0, t: c => addM(c.S, 120), title: 'Piega n. 2 + riposo 30 minuti', short: 'Pieghe più delicate, l’impasto ora ha struttura.',
      timers: [{ id: 'fold2', label: 'Riposo dopo piega 2', min: 30 }],
      body: () => ol([
        'Stessa tecnica, ma <b>con più delicatezza</b>: non vuoi sgonfiare le bolle che iniziano a comparire.',
        '<b>Pieghe a portafoglio</b>: stendi leggermente l’impasto nel contenitore e piega i due lati verso il centro come una lettera, poi dall’alto e dal basso.',
        'Riposo di 30 minuti coperto.'
      ]) },
    { id: 'staglio', day: 0, t: c => addM(c.S, 150), title: 'Staglio e rimaneggiatura in panetti', short: 'Dividi, forma e metti nei contenitori unti.', ref: '/materiali',
      timers: [{ id: 'punta', label: 'Puntata a temperatura ambiente', min: 30 }],
      body: () => ol([
        'Rovescia l’impasto su un piano <b>unto con olio</b> (non infarinato).',
        '<b>Focaccia</b>: ' + F.n + ' panetti da circa <b>' + F.each + ' g</b> ciascuno (' + F.n + ' teglie 30–32 cm). Divisione con il tarocco, pesa ogni panetto.',
        '<b>Pizza</b>: ' + P.n + ' panetti da circa <b>' + P.each + ' g</b> (' + P.n + ' teglie 30–32 cm).',
        '<b>Rimaneggiatura</b> (pirlatura): porta i 4 angoli verso il centro come un pacchetto, capovolgi con la chiusura sotto e fai ruotare con il palmo a coppa, 2–3 giri, per tendere la superficie senza strappare.',
        'Ogni panetto va in <b>un suo contenitore unto</b>, chiusura sotto. Controlla che il contenitore abbia almeno 4 ml di capienza per ogni grammo di impasto.',
        'Metti un elastico o un nastro adesivo al livello dell’impasto e scrivi l’orario.',
        '<b>30 minuti a temperatura ambiente</b> con il coperchio appoggiato, poi in frigo.'
      ]) },
    { id: 'fridge', day: 0, t: c => addM(c.S, 180), title: 'In frigo: maturazione lenta', short: 'Ripiano centrale, 3–4 °C, coperchio chiuso.',
      body: c => li([
        'Sposta i contenitori <b>chiusi</b> sul ripiano centrale del frigorifero (non nel cassetto, non contro la parete posteriore).',
        'Maturazione prevista: <b>' + c.fridgeH + '</b> fino a domani.',
        'Dopo 3–4 ore l’impasto sarà già cresciuto un po’. È normale e voluto: non aprire il frigo per controllare spesso.'
      ]) },
    { id: 'out', day: 1, t: c => addM(c.B, -270), title: 'Tira fuori i panetti dal frigo', short: 'Contenitori chiusi, 2 ore a temperatura ambiente.', timers: [{ id: 'out', label: 'Panetti fuori dal frigo', at: true }, { id: 'out2', label: 'Acclimatamento (2 h)', min: 120 }],
      body: () => li([
        'Lascia i contenitori <b>chiusi</b> sul piano (20–22 °C) per circa 2 ore, così l’impasto si ammorbidisce e il freddo esce dal cuore del panetto.',
        'Intanto prepara: scola e taglia la mozzarella (mettila in colino in frigo), taglia i pomodorini a metà, denocciola le olive, prepara la <b>salamoia</b> (per teglia di focaccia: 50 g acqua + 30 g olio EVO + 5 g sale, emulsionati).',
        'Ungi le teglie e prepara i canovacci.'
      ]) },
    { id: 'pan', day: 1, t: c => addM(c.B, -150), title: 'Messa in teglia', short: 'Olio abbondante, rovescia il panetto, stendi a metà.', 
      timers: [{ id: 'pan', label: 'Riposo in teglia', min: 20 }],
      body: () => ol([
        'In ogni teglia da 30–32 cm versa olio EVO: <b>circa 40 g per la focaccia, 20 g per la pizza</b>. Distribuiscilo su fondo e bordi.',
        'Rovescia il panetto con un raschietto unto, senza sgonfiarlo.',
        'Con le dita unte allarga l’impasto <b>solo fino a circa 70 % della teglia</b>. Se si ritrae, non forzare: aspetta.',
        'Copri e <b>riposa 20 minuti</b>, poi allarga fino ai bordi.',
        'Se hai meno teglie del necessario: i panetti destinati al secondo giro restano nei contenitori e vanno in teglia dopo la prima infornata.'
      ]) },
    { id: 'proof', day: 1, t: c => addM(c.B, -130), title: 'Appretto in teglia (circa 90 minuti)', short: 'Ultima lievitazione fino a quasi raddoppio.',
      timers: [{ id: 'proof', label: 'Appretto in teglia', min: 90 }],
      body: () => li([
        'Copri con canovaccio o pellicola unta, in un posto a 24–26 °C (forno spento con la luce accesa va bene).',
        'Pronta quando è <b>soffice, ricca di bolle e quasi raddoppiata</b>: premendo con un dito la fossetta torna su lentamente.',
        'Se è già pronta prima, infornala prima; se è in ritardo, aspetta fino a 30 minuti.'
      ]) },
    { id: 'pre', day: 1, t: c => addM(c.B, -40), title: 'Accendi il forno', short: 'Convenzionale 250 °C, circa 20–25 minuti per arrivare in temperatura.', ref: '/forno',
      timers: [{ id: 'pre', label: 'Preriscaldamento forno', min: 25 }],
      body: () => li(['Rimuovi il separatore Dual Cook se presente e posiziona i ripiani (vedi sezione Forno).', 'Imposta Convenzionale 250 °C: aspetta il segnale acustico (circa 20 minuti).']) },
    { id: 'top', day: 1, t: c => addM(c.B, -15), title: 'Fossette e condimento', short: 'Focaccia: salamoia, pomodorini, olive. Pizza: solo pomodoro.',
      body: () => ol([
        '<b>Focaccia</b>: versa la salamoia sulla superficie. Con i polpastrelli oleati <b>premi fino a toccare il fondo</b>, facendo fossette ovunque. Distribuisci i pomodorini <b>tagliati a metà e premuti con il lato tagliato verso l’alto</b>, le olive, l’origano e il sale grosso.',
        '<b>Pizza</b>: copri con pelati schiacciati, un filo d’olio, un pizzico di sale e origano. <b>La mozzarella si aggiunge dopo la prima fase di cottura</b> per non farla scurire e perdere acqua.'
      ]) },
    { id: 'bakeF', day: 1, t: c => c.B, title: 'Cuoci le focacce', short: 'Due fasi: fondo e bordo, poi doratura.', ref: '/forno',
      timers: [{ id: 'bf1', label: 'Focaccia, fase 1', min: 15 }, { id: 'bf2', label: 'Focaccia, fase 2', min: 10 }],
      body: () => li(['Fase 1 (15 min): modalità Sotto + Ventilato 220 °C, ripiano basso.', 'Fase 2 (8–10 min): Convenzionale 220 °C, ripiano centrale, finché è dorata.', 'Dettaglio e alternative nella sezione Forno.']) },
    { id: 'bakeP', day: 1, t: c => addM(c.B, c.rF * c.tF), title: 'Cuoci le pizze', short: 'Pomodoro, poi mozzarella.', ref: '/forno',
      timers: [{ id: 'bp1', label: 'Pizza, fase 1 (solo pomodoro)', min: 7 }, { id: 'bp2', label: 'Pizza, fase 2 (con mozzarella)', min: 7 }],
      body: () => li(['Fase 1 (7 min): Convenzionale 250 °C, ripiano basso.', 'Aggiungi la mozzarella ben scolata, torna in forno 6–8 minuti.', 'Dettaglio nella sezione Forno.']) },
    { id: 'cool', day: 1, t: c => addM(c.B, c.rF * c.tF + c.rP * c.tP), title: 'Raffredda e impacchetta', short: 'Fuori dalla teglia, sulla griglia, poi pronte per uscire.',
      timers: [{ id: 'cool', label: 'Raffreddamento', min: 15 }],
      body: () => li([
        'Lascia 5 minuti nella teglia, poi sfila su una griglia: il fondo rimane croccante.',
        'Aspetta 10–15 minuti prima di chiuderle in carta forno o scatole. Chiuse calde fanno condensa e ammorbidiscono il fondo.',
        'Focaccia: taglia a spicchi solo quando si è assestata.'
      ]) }
  ];
}

/* ========== FORNO ========== */
const OVEN_MODES = [
  { n: 'Convenzionale (sopra + sotto)', d: 'Resistenze alta e bassa, senza ventola. Calore più regolare.', use: 'Preriscaldamento, doratura focaccia, pizza a 250 °C.' },
  { n: 'Sotto + Ventilato', en: 'Bottom Heat + Convection', d: 'Solo resistenza bassa con ventola. Samsung la indica per pizza, pane e dolci.', use: 'Prima fase focaccia: fondo ben cotto e bordo croccante.' },
  { n: 'Ventilato', d: 'Calore dall’alto e dal basso con ventola, utile su più ripiani.', use: 'Cuocere due teglie su due ripiani, scambiandole a metà cottura.' },
  { n: 'Dual Cook', d: 'Con il separatore inserito: due camere a temperature e modalità diverse.', use: 'Solo se le teglie e la focaccia lievitata stanno nella camera alta. Altrimenti togli il separatore.' }
];

/* ========== FARINE / CONTENITORI / FAQ ========== */
const FLOURS = [
  { n: 'Farina forte W330', role: 'Scheletro dell’impasto', why: 'Con 24–30 ore di maturazione e idratazione al 70–80 % serve una rete di glutine che regga. La W330 assorbe molta acqua e non collassa nella lunga lievitazione.', use: '50 % in entrambi gli impasti.' },
  { n: 'Manitoba W250–290', role: 'Alveolatura e sofficità', why: 'Aggiunge elasticità. Lasciata al 100 % darebbe un impasto troppo tenace che si ritrae in teglia; mescolata alla W330 resta estensibile.', use: '50 % nella pizza.' },
  { n: 'Semola rimacinata di grano duro', role: 'Sapore, colore, croccantezza', why: 'È il tratto distintivo della focaccia barese: sapore di grano, colore giallo, crosta croccante. Ha un glutine poco elastico: serve la W330 vicino, e l’autolisi la idrata bene.', use: '50 % nella focaccia. Non nella pizza.' },
  { n: 'Miele (al posto del malto)', role: 'Doratura e nutrimento per il lievito', why: 'Il malto fornisce zuccheri e aiuta la colorazione. Il miele fa lo stesso: 1 % sulla farina. Scegli acacia o millefiori, dal gusto neutro.', use: '10 g per kg di farina, sostituzione 1:1 del malto.' }
];
const FLOUR_TIPS = [
  'Cerca la forza W e la proteina sull’etichetta: per questo uso W300+ e proteine 13–14 %.',
  'Marche note per semola rimacinata e farine forti: Caputo, Molino Grassi, Molino Quaglia, Agugiaro & Figna. Sono esempi, non una raccomandazione sponsorizzata.',
  'Conserva le farine chiuse, al fresco. La semola irrancidisce prima.'
];
const CONTAINERS = [
  { n: 'Contenitore rettangolare in polipropilene (PP) con coperchio', d: 'Trasparente, graduato, impilabile: lo vedi crescere e occupa meno spazio in frigo. Tipo Cambro CamSquare, Araven o equivalenti.', size: 'Focaccia: 3–4 L · Pizza: 2–3 L', best: true },
  { n: 'Contenitore alimentare per frigorifero (PP, tipo Lock&Lock)', d: 'Ottima alternativa domestica. Controlla che il coperchio non sia ermetico fino a quando l’impasto è a temperatura ambiente.', size: 'Come sopra', best: false },
  { n: 'Ciotola grande + pellicola o cuffia', d: 'Funziona per la prima fase, ma per il frigo è meno comoda e perde umidità.', size: 'Solo per autolisi e pieghe', best: false }
];
const CONT_RULES = [
  'Capienza: almeno <b>4 ml per ogni grammo di impasto</b> (panetto da 700 g → 2,8 L minimo).',
  'Ungi con un velo d’olio. Non infarinare: la farina assorbe acqua e crea una crosta.',
  'Segna il livello iniziale con un elastico o nastro adesivo.',
  'Evita plastica rigida economica (polistirolo) e contenitori non alimentari.',
  'Un contenitore per panetto: gli impasti non vanno mai uno sopra l’altro.'
];
const FAQ = [
  { q: 'Cos’è l’elettrolisi?', a: 'Nell’impasto non esiste. Il termine corretto è <b>autolisi</b>: farina e acqua riposano prima di aggiungere lievito e sale. Ho interpretato la richiesta così.' },
  { q: 'Posso usare il miele al posto del malto?', a: 'Sì, nella stessa dose (10 g per kg di farina).' },
  { q: 'Il panetto è troppo gonfio in frigo, che faccio?', a: 'Se ha più che triplicato, sgonfia leggermente con le pieghe e riponi in frigo. Domani riduci l’acclimatamento a 1 ora.' },
  { q: 'L’impasto si ritrae in teglia', a: 'È troppo elastico: aspetta 15–20 minuti e riprova senza forzare.' }
];

// Menu mobile
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav');
if (burger && nav) {
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });
}

// Apparition des blocs au défilement
const blocks = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  blocks.forEach((b) => io.observe(b));
} else {
  blocks.forEach((b) => b.classList.add('in'));
}

// Formulaire de demande : ouvre un e-mail pré-rempli (aucune donnée envoyée à un tiers)
const form = document.querySelector('#demande');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const lines = [
      `Nom : ${f.get('nom')}`,
      `Téléphone : ${f.get('tel') || '-'}`,
      `Demande : ${f.get('objet')}`,
      `Arrivée : ${f.get('arrivee') || '-'}`,
      `Départ : ${f.get('depart') || '-'}`,
      `Nombre de personnes : ${f.get('personnes') || '-'}`,
      '',
      f.get('message') || ''
    ];
    const subject = `Demande – ${f.get('objet')}`;
    window.location.href = `mailto:domaineferteclairbois@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
  });
}

// Barre de disponibilité : un seul calendrier pour choisir arrivée puis départ
const dispo = document.querySelector('#dispo');
if (dispo) {
  const inIn = dispo.elements.checkin;
  const inOut = dispo.elements.checkout;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const nice = (d) => d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let start = null, end = null, hover = null;
  let view = new Date(today.getFullYear(), today.getMonth(), 1);

  // Les champs natifs deviennent cachés, remplacés par deux boutons qui ouvrent le même calendrier
  const btns = [inIn, inOut].map((input) => {
    input.type = 'hidden';
    input.required = false;
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'dispo__val';
    b.textContent = 'Choisir';
    input.after(b);
    return b;
  });

  const cal = document.createElement('div');
  cal.className = 'cal';
  cal.hidden = true;
  cal.setAttribute('role', 'dialog');
  cal.setAttribute('aria-label', 'Choisir les dates du séjour');
  dispo.after(cal);

  const sync = () => {
    inIn.value = start ? iso(start) : '';
    inOut.value = end ? iso(end) : '';
    btns[0].textContent = start ? nice(start) : 'Choisir';
    btns[1].textContent = end ? nice(end) : 'Choisir';
  };

  const month = (first) => {
    const y = first.getFullYear(), m = first.getMonth();
    const offset = (first.getDay() + 6) % 7; // semaine commençant le lundi
    const days = new Date(y, m + 1, 0).getDate();
    const last = end || (start && hover && hover > start ? hover : null);
    let cells = '<span></span>'.repeat(offset);
    for (let n = 1; n <= days; n++) {
      const d = new Date(y, m, n);
      const cls = [];
      if (start && +d === +start) cls.push('is-start');
      if (end && +d === +end) cls.push('is-end');
      if (start && last && d > start && d < last) cls.push('is-in');
      if (start && !end && last && +d === +last) cls.push('is-end');
      cells += `<button type="button" data-d="${iso(d)}" class="${cls.join(' ')}"${d < today ? ' disabled' : ''} aria-label="${d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}">${n}</button>`;
    }
    return `<div class="cal__month"><p class="cal__title">${first.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</p>
      <div class="cal__grid cal__dow"><span>L</span><span>M</span><span>M</span><span>J</span><span>V</span><span>S</span><span>D</span></div>
      <div class="cal__grid">${cells}</div></div>`;
  };

  const render = () => {
    const next = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    const canPrev = view > new Date(today.getFullYear(), today.getMonth(), 1);
    cal.innerHTML = `<div class="cal__head">
        <button type="button" class="cal__nav" data-nav="-1" aria-label="Mois précédent"${canPrev ? '' : ' disabled'}>←</button>
        <p class="cal__hint">${!start || end ? 'Choisissez votre date d’arrivée' : 'Choisissez maintenant votre date de départ'}</p>
        <button type="button" class="cal__nav" data-nav="1" aria-label="Mois suivant">→</button>
      </div>
      <div class="cal__months">${month(view)}${month(next)}</div>`;
  };

  const open = () => { cal.hidden = false; render(); };
  const close = () => { cal.hidden = true; hover = null; };
  const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };

  btns.forEach((b) => b.addEventListener('click', () => (cal.hidden ? open() : close())));

  cal.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) { view = new Date(view.getFullYear(), view.getMonth() + Number(nav.dataset.nav), 1); render(); return; }
    const day = e.target.closest('[data-d]');
    if (!day) return;
    const d = parse(day.dataset.d);
    if (!start || end || d <= start) { start = d; end = null; sync(); render(); }
    else { end = d; sync(); close(); }
  });

  cal.addEventListener('mouseover', (e) => {
    const day = e.target.closest('[data-d]');
    if (!day || !start || end) return;
    hover = parse(day.dataset.d);
    cal.querySelectorAll('[data-d]').forEach((el) => {
      const d = parse(el.dataset.d);
      el.classList.toggle('is-in', d > start && d < hover);
      el.classList.toggle('is-end', +d === +hover && hover > start);
    });
  });

  document.addEventListener('click', (e) => { const path = e.composedPath(); // le jour cliqué est redessiné : on se fie au chemin de l'événement
    if (!cal.hidden && !path.includes(cal) && !path.includes(dispo)) close();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  dispo.addEventListener('submit', (e) => { if (!start || !end) { e.preventDefault(); open(); } });
}

// Diaporama du hero : une chambre toutes les 3 secondes
const slides = document.querySelectorAll('.hero__slides img');
if (slides.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('is-on');
    current = (current + 1) % slides.length;
    slides[current].classList.add('is-on');
  }, 3000);
}

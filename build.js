// Génère les pages HTML du site à partir des gabarits ci-dessous.
// Usage : node build.js
const fs = require('fs');
const path = require('path');

const SITE = 'https://domaineferteclairbois.fr';
const TEL = '07 50 90 64 40';
const TEL_HREF = 'tel:+33750906440';
const MAIL = 'domaineferteclairbois@gmail.com';
const BOOKING = 'https://www.booking.com/hotel/fr/domaine-de-la-ferte-clairbois.fr.html';
const FACEBOOK = 'https://www.facebook.com/profile.php?id=100057098634137';
const MAPS = 'https://www.google.com/maps/dir//48.08315740477515,-0.35285986230602256';
const NOTE = '9,4'; // note Booking.com
const AVIS = 132; // nombre d'avis Booking.com
const PRIX = 125; // prix de départ par nuit, petit-déjeuner compris

const man = JSON.parse(fs.readFileSync(path.join(__dirname, 'img/manifest.json'), 'utf8'));

function pic(name, alt, o = {}) {
  const m = man[name];
  if (!m) throw new Error('image inconnue : ' + name);
  const big = m.ws[m.ws.length - 1];
  const srcset = m.ws.map((w) => `img/${name}-${w}.webp ${w}w`).join(', ');
  const h = Math.round((big * m.h) / m.w);
  return `<img src="img/${name}-${m.ws[0]}.webp" srcset="${srcset}" sizes="${o.sizes || '(min-width: 720px) 50vw, 100vw'}" width="${big}" height="${h}" alt="${alt}"${o.cls ? ` class="${o.cls}"` : ''}${o.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"'}>`;
}

const NAV = [
  ['chambres-hotes.html', 'Chambres d’hôtes'],
  ['salle-des-lions.html', 'Salle des Lions'],
  ['domaine.html', 'Le domaine'],
  ['autour.html', 'Aux alentours'],
  ['contact.html', 'Contact & accès']
];

const business = {
  '@type': 'BedAndBreakfast',
  '@id': SITE + '/#domaine',
  name: 'Domaine de la Ferté Clairbois',
  description: 'Chambres d’hôtes médiévales et location de salle de réception dans la reconstitution d’une ferme fortifiée du XIIIe siècle, à Sainte-Suzanne-et-Chammes (Mayenne).',
  url: SITE + '/',
  telephone: '+33750906440',
  email: MAIL,
  image: [SITE + '/img/og-domaine-ferte-clairbois.jpg', SITE + '/img/chambre-tristan-chambre-hotes-medievale-1536.webp'],
  priceRange: '€€',
  address: { '@type': 'PostalAddress', streetAddress: '265 Clair Bois', postalCode: '53270', addressLocality: 'Sainte-Suzanne-et-Chammes', addressRegion: 'Pays de la Loire', addressCountry: 'FR' },
  geo: { '@type': 'GeoCoordinates', latitude: 48.0831574, longitude: -0.3528599 },
  checkinTime: '17:00',
  checkoutTime: '12:00',
  numberOfRooms: 3,
  petsAllowed: false,
  amenityFeature: ['Petit-déjeuner compris', 'Salle de bain privative', 'Parking privé gratuit', 'Télévision', 'Thé et café', 'Table d’hôtes sur réservation'].map((n) => ({ '@type': 'LocationFeatureSpecification', name: n, value: true })),
  sameAs: [FACEBOOK, BOOKING]
};

function crumbsLd(trail) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [['index.html', 'Accueil'], ...trail].map(([u, n], i) => ({ '@type': 'ListItem', position: i + 1, name: n, item: SITE + '/' + (u === 'index.html' ? '' : u) }))
  };
}
function faqLd(faq) {
  return { '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}
function faqHtml(faq) {
  return `<div class="faq">${faq.map(([q, a]) => `<details><summary><h3>${q}</h3></summary><p>${a}</p></details>`).join('')}</div>`;
}

function layout(p) {
  const canonical = SITE + '/' + (p.file === 'index.html' ? '' : p.file);
  const ogImg = `${SITE}/img/${p.og || 'og-domaine-ferte-clairbois.jpg'}`;
  const graph = [business, ...(p.trail ? [crumbsLd(p.trail)] : []), ...(p.ld || [])];
  const crumbs = p.trail
    ? `<nav class="crumbs" aria-label="Fil d’Ariane"><div class="wrap"><ol><li><a href="index.html">Accueil</a></li>${p.trail.map(([u, n], i) => (i === p.trail.length - 1 ? `<li aria-current="page">${n}</li>` : `<li><a href="${u}">${n}</a></li>`)).join('')}</ol></div></nav>`
    : '';
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${p.title}</title>
<meta name="description" content="${p.desc}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#1d2a23">
<meta property="og:type" content="website">
<meta property="og:locale" content="fr_FR">
<meta property="og:site_name" content="Domaine de la Ferté Clairbois">
<meta property="og:title" content="${p.title}">
<meta property="og:description" content="${p.desc}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImg}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/style.css">
<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })}</script>
</head>
<body>
<a class="skip" href="#contenu">Aller au contenu</a>
<header class="header">
  <div class="wrap header__in">
    <a class="logo" href="index.html" aria-label="Domaine de la Ferté Clairbois – accueil"><span>Clairbois</span><small>Chambres d’hôtes</small></a>
    <button class="burger" aria-label="Ouvrir le menu" aria-expanded="false" aria-controls="menu"><i></i><i></i><i></i></button>
    <nav class="nav" id="menu" aria-label="Navigation principale">
      <ul>${NAV.map(([u, n]) => `<li><a href="${u}"${p.nav === u ? ' aria-current="page"' : ''}>${n}</a></li>`).join('')}</ul>
      <a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver</a>
    </nav>
  </div>
</header>
<main id="contenu">
${p.hero}
${crumbs}
${p.body}
</main>
<footer class="footer">
  <div class="wrap">
    <div class="footer__grid">
      <div>
        <span class="footer__name">Domaine de la Ferté Clairbois</span>
        <p>Chambres d’hôtes médiévales et salle de réception à Sainte-Suzanne-et-Chammes, en Mayenne, entre Laval et Le Mans.</p>
      </div>
      <div>
        <h2>Séjourner</h2>
        <ul>
          <li><a href="chambres-hotes.html">Les chambres d’hôtes</a></li>
          <li><a href="chambre-tristan.html">Chambre Tristan</a></li>
          <li><a href="chambre-iseult.html">Chambre Iseult</a></li>
          <li><a href="chambre-clairbois.html">Chambre Clairbois</a></li>
        </ul>
      </div>
      <div>
        <h2>Découvrir</h2>
        <ul>
          <li><a href="salle-des-lions.html">Location de la Salle des Lions</a></li>
          <li><a href="domaine.html">Le domaine et le donjon</a></li>
          <li><a href="autour.html">Que faire à Sainte-Suzanne</a></li>
          <li><a href="${FACEBOOK}" rel="noopener" target="_blank">Facebook</a></li>
        </ul>
      </div>
      <div>
        <h2>Nous joindre</h2>
        <ul>
          <li><a href="${TEL_HREF}">${TEL}</a></li>
          <li><a href="mailto:${MAIL}">${MAIL}</a></li>
          <li>265 Clair Bois<br>53270 Sainte-Suzanne-et-Chammes</li>
          <li><a href="contact.html">Plan d’accès</a></li>
        </ul>
      </div>
    </div>
    <p class="footer__legal">© ${new Date().getFullYear()} Domaine de la Ferté Clairbois · Edwige et Franck · <a href="mentions-legales.html">Mentions légales</a></p>
  </div>
</footer>
<div class="bar"><a href="${TEL_HREF}">Appeler</a><a href="${BOOKING}" target="_blank" rel="noopener">Réserver sur Booking</a></div>
<script src="js/main.js" defer></script>
</body>
</html>
`;
}

function hero(img, alt, kicker, h1, text, btns = '', page = true, slides = []) {
  const sizes = '(min-width: 720px) 45vw, 100vw';
  // Diaporama : la première photo s'affiche tout de suite, les suivantes se fondent par-dessus
  const photos = slides.length
    ? `<div class="hero__slides">${pic(img, alt, { sizes, eager: true, cls: 'is-on' })}${slides.map(([n, a]) => pic(n, a, { sizes })).join('')}</div>`
    : pic(img, alt, { sizes, eager: true });
  return `<section class="hero${page ? ' hero--page' : ''}">
  <div class="wrap hero__grid">
    <div class="hero__txt">
      <h1>${h1}</h1>
      <p>${text}</p>
      ${btns ? `<div class="btns">${btns}</div>` : ''}
    </div>
    <figure class="hero__fig">
      ${photos}
      ${page ? '' : `<span class="hero__seal" aria-hidden="true"><b>${PRIX} €</b>la nuit,<br>petit-déj. compris</span>`}
    </figure>
  </div>
</section>`;
}

const cta = (h2, text, booking = true) => `<section class="section section--dark cta">
  <div class="wrap reveal">
    <span class="kicker">${booking ? `Noté ${NOTE}/10 sur Booking.com · ${AVIS} avis` : 'Devis et visite'}</span>
    <h2>${h2}</h2>
    <p class="lead">${text}</p>
    <div class="btns">${booking ? `<a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver sur Booking.com</a>` : '<a class="btn" href="contact.html#demande">Demander un devis</a>'}<a class="btn btn--light" href="${TEL_HREF}">${TEL}</a></div>
  </div>
</section>`;

const ROOMS = [
  {
    file: 'chambre-tristan.html', name: 'Chambre Tristan', surface: 14,
    img: 'chambre-tristan-chambre-hotes-medievale',
    alt: 'Chambre d’hôtes Tristan : lit double, tapisserie médiévale et fenêtre romane en pierre',
    short: 'Une tapisserie au-dessus du lit, un coffre en bois sculpté, des peaux de mouton au sol et une fenêtre géminée en pierre qui filtre la lumière du matin.',
    title: 'Chambre Tristan – chambre d’hôtes médiévale à Sainte-Suzanne (53)',
    desc: 'Chambre d’hôtes Tristan, 14 m² pour 2 personnes : décor médiéval, salle de bain privative, petit-déjeuner et visite du donjon compris. Domaine de la Ferté Clairbois.',
    h1: 'Chambre Tristan, chambre d’hôtes médiévale pour deux',
    intro: 'La chambre Tristan est la plus « seigneuriale » des trois : tapisserie, appliques en fer forgé, coffre au pied du lit et fenêtre romane à petits carreaux. Derrière le décor, une salle de bain privative, la télévision, un plateau thé-café et le calme complet de la campagne mayennaise.',
    gallery: [
      ['chambre-tristan-lit-fenetre-romane', 'Lit de la chambre Tristan devant la fenêtre romane à vitraux'],
      ['chambre-tristan-salle-de-bain', 'Salle de bain privative de la chambre Tristan, vasque en pierre et douche'],
      ['salon-medieval-chambres-hotes', 'Palier des chambres d’hôtes : charpente apparente, coffre médiéval et blasons']
    ],
    avis: [['Séjour extraordinaire hors du temps dans un lieu atypique. Dame Edwige nous a accueillis comme des seigneurs.', 'Nicole H., Tripadvisor'], ['Un endroit formidable et incontournable !', 'Carol V., Google']]
  },
  {
    file: 'chambre-iseult.html', name: 'Chambre Iseult', surface: 13,
    img: 'chambre-iseult-chambre-hotes-medievale',
    alt: 'Chambre d’hôtes Iseult : lit double, calligraphies murales et salle de bain derrière les poutres',
    short: 'Le lit fait face à la salle de bain, séparée par de vieilles poutres. Aux murs, des calligraphies peintes à la main ; au sol, un parquet clair.',
    title: 'Chambre Iseult – chambre d’hôtes de charme à Sainte-Suzanne (53)',
    desc: 'Chambre d’hôtes Iseult, 13 m² pour 2 personnes : poutres anciennes, calligraphies murales, salle de bain privative. Petit-déjeuner et visite du donjon compris.',
    h1: 'Chambre Iseult, chambre d’hôtes de charme sous les poutres',
    intro: 'Iseult est la chambre la plus intime du domaine. Les poutres anciennes dessinent une alcôve entre le lit et la salle de bain, les murs portent des calligraphies et des enluminures, et le coffre sculpté vient tout droit de l’imagerie des romans de chevalerie.',
    gallery: [
      ['chambre-iseult-coffre-sculpte', 'Coffre en bois sculpté et poutres anciennes de la chambre Iseult'],
      ['chambre-iseult-salle-de-bain-poutres', 'Salle de bain de la chambre Iseult vue à travers les poutres en chêne'],
      ['salon-medieval-chambres-hotes', 'Palier des chambres d’hôtes : charpente apparente, coffre médiéval et blasons']
    ],
    avis: [['Nous n’y avons passé qu’une nuit mais nous y reviendrons sûrement ! Un accueil et un lieu exceptionnels.', 'Morgane P., Google'], ['Des propriétaires charmants et accueillants, un site magnifique. Un moment hors du temps.', 'Lucien V., Google']]
  },
  {
    file: 'chambre-clairbois.html', name: 'Chambre Clairbois', surface: 14,
    img: 'chambre-clairbois-lit-blason',
    alt: 'Chambre d’hôtes Clairbois : lit double sous le blason rouge et or du domaine',
    short: 'La dernière-née. Le blason rouge et or veille sur le lit, un mur de pierre blanche monte en escalier et une banquette se niche dans l’embrasure de la fenêtre.',
    title: 'Chambre Clairbois – chambre d’hôtes insolite en Mayenne',
    desc: 'Chambre d’hôtes Clairbois, 14 m² pour 2 personnes : blason, pierre apparente, coin lecture, salle de bain privative. Petit-déjeuner et visite du donjon compris.',
    h1: 'Chambre Clairbois, la nuit insolite sous le blason',
    intro: 'Troisième chambre du domaine, Clairbois porte ses armes au-dessus du lit. On y trouve un coin fenêtre avec banquette et rideaux de velours, une petite table pour le thé du soir, et la même attention aux détails que dans les deux autres : appliques forgées, peaux de bête, bois massif.',
    gallery: [
      ['chambre-clairbois-coin-fenetre', 'Banquette de fenêtre, rideaux de velours et table en bois de la chambre Clairbois'],
      ['salon-medieval-chambres-hotes', 'Palier des chambres d’hôtes : charpente apparente, coffre médiéval et blasons'],
      ['donjon-clairbois-pont', 'Le donjon de Clairbois vu depuis le pont de bois, visite comprise dans la nuitée']
    ],
    avis: [['Moment hors du temps. C’est un lieu à découvrir. Les enfants ont adoré.', 'Marie-Élodie, Google'], ['Très bon moment passé sur place avec un magnifique terrain, merci aux propriétaires !', 'Benjamin L., Google']]
  }
];

const roomCard = (r, i) => `<article class="room reveal">
  <a class="room__img" href="${r.file}">${pic(r.img, r.alt, { sizes: '(min-width: 720px) 58vw, 100vw' })}</a>
  <div>
    <span class="room__num">Chambre n° ${i + 1} · ${r.surface} m²</span>
    <h3><a href="${r.file}" style="color:inherit;text-decoration:none">${r.name}</a></h3>
    <p>${r.short}</p>
    <ul class="room__meta"><li>2 personnes</li><li>Salle de bain privative</li><li>Petit-déjeuner compris</li></ul>
    <p class="price">Dès ${PRIX} € <small>la nuit</small></p>
    <a class="more" href="${r.file}">Voir la ${r.name.replace('Chambre', 'chambre')}</a>
  </div>
</article>`;

const included = `<ul class="ticks">
  <li><strong>Le petit-déjeuner</strong>, servi sur place et compris dans le prix de la nuit.</li>
  <li><strong>La visite matinale du donjon</strong>, avant l’arrivée du public.</li>
  <li><strong>Une salle de bain privative</strong> dans chaque chambre, avec douche et linge fourni.</li>
  <li><strong>Le stationnement</strong> à l’intérieur du domaine.</li>
  <li><strong>Thé, café et télévision</strong> en chambre.</li>
  <li><strong>La table d’hôtes</strong> d’inspiration médiévale, le soir sur réservation (en supplément).</li>
</ul>`;

const FAQ_HOME = [
  ['Peut-on dîner sur place ?', 'Oui. Le petit-déjeuner est compris dans la nuitée et, sur réservation, nous préparons une table d’hôtes inspirée de la cuisine médiévale. Prévenez-nous au moment de réserver votre chambre.'],
  ['Combien de chambres d’hôtes propose le domaine ?', 'Trois chambres pour deux personnes : Tristan (14 m²), Iseult (13 m²) et Clairbois (14 m²). Chacune a sa salle de bain privative, la télévision et un plateau thé-café.'],
  ['À quelle heure peut-on arriver et repartir ?', 'Les arrivées se font entre 17 h et 22 h, les départs entre 8 h et 12 h. Si votre train ou votre route vous fait arriver plus tôt, appelez-nous.'],
  ['Quand ont lieu les fêtes médiévales ?', 'D’avril à août, le deuxième week-end de chaque mois, l’association La Mesnie de la Ferté Clairbois organise les Féodales de Clairbois : artisans, campements et troupes de reconstitution du XIIIe siècle animent le domaine.'],
  ['Où se garer ?', 'Les hôtes des chambres stationnent à l’intérieur du domaine. Les jours de fête, un parking fléché accueille le public avant l’entrée.'],
  ['Les animaux sont-ils acceptés ?', 'Les chiens et chats ne sont pas admis dans les chambres. Les cavaliers, en revanche, peuvent venir avec leur cheval : le domaine dispose de boxes.'],
  ['Où se trouve le Domaine de la Ferté Clairbois ?', 'À Sainte-Suzanne-et-Chammes (53270), en Mayenne, à mi-chemin entre Laval et Le Mans, à une dizaine de kilomètres de l’autoroute A81 et de la gare d’Évron.']
];

const pages = [];

/* ───────── Accueil ───────── */
pages.push({
  file: 'index.html',
  title: 'Chambres d’hôtes médiévales à Sainte-Suzanne (53) | Domaine de la Ferté Clairbois',
  desc: 'Dormez dans une ferme fortifiée du XIIIe siècle reconstituée en Mayenne : 3 chambres d’hôtes de charme, petit-déjeuner et visite du donjon compris. Salle de réception à louer.',
  ld: [faqLd(FAQ_HOME)],
  hero: hero('chambre-tristan-chambre-hotes-medievale', 'Chambre d’hôtes médiévale au Domaine de la Ferté Clairbois : lit double, tapisserie et fenêtre romane', '', 'Chambres d’hôtes <em>médiévales</em> à Sainte-Suzanne', 'Trois chambres dans la reconstitution d’une ferme fortifiée du XIIIe siècle. Edwige et Franck vous y reçoivent, à mi-chemin entre Laval et Le Mans.', `<a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver sur Booking.com</a><a class="btn btn--light" href="chambres-hotes.html">Voir les chambres</a>`, false, [ROOMS[1], ROOMS[2]].map((r) => [r.img, r.alt])),
  body: `
<div class="dispo">
  <div class="wrap">
    <form id="dispo" action="${BOOKING}" method="get" target="_blank" rel="noopener">
      <label>Arrivée<input type="date" name="checkin" required></label>
      <label>Départ<input type="date" name="checkout" required></label>
      <label class="full">Voyageurs<select name="group_adults"><option value="2">2 personnes</option><option value="1">1 personne</option></select></label>
      <button class="btn" type="submit">Voir sur Booking.com</button>
    </form>
  </div>
</div>
<section class="section after-dispo" style="padding-bottom:0">
  <div class="wrap">
    <ul class="facts">
      <li><strong>3 chambres</strong>pour deux personnes, salle de bain privative</li>
      <li><strong>${PRIX} € la nuit</strong>à partir de, petit-déjeuner compris</li>
      <li><strong>${NOTE} / 10</strong>sur Booking.com, ${AVIS} avis de voyageurs</li>
      <li><strong>7 minutes</strong>de la cité médiévale de Sainte-Suzanne</li>
    </ul>
  </div>
</section>

<section class="section">
  <div class="wrap split split--wide">
    <div class="reveal">
      <span class="kicker">La maison</span>
      <h2>Une nuit dans une ferme fortifiée du XIII<sup>e</sup> siècle</h2>
      <p class="lead">Un donjon entouré de douves, un pont-levis, une forge, une chapelle : Clairbois est la reconstitution grandeur nature d’un petit domaine seigneurial, posée au milieu des prés à la sortie de Sainte-Suzanne.</p>
      <p>Nous y avons aménagé trois chambres d’hôtes. Le décor est médiéval — coffres sculptés, tapisseries, fer forgé, peaux de bête — mais le confort est bien d’aujourd’hui : salle de bain privative, télévision, plateau thé-café. Le matin, après le petit-déjeuner, vous visitez le donjon avant tout le monde.</p>
      <p><a class="more" href="domaine.html">Découvrir le domaine</a></p>
    </div>
    <div class="split__img split__img--tall reveal">${pic('donjon-clairbois-pont', 'Donjon du Domaine de la Ferté Clairbois vu depuis le pont en bois, sous les chênes')}</div>
  </div>
</section>

<section class="section section--tint" id="chambres">
  <div class="wrap">
    <span class="kicker">Hébergement</span>
    <h2>Nos trois chambres d’hôtes</h2>
    <p class="lead">Tristan, Iseult et Clairbois : trois chambres pour deux, chacune avec son caractère. Toutes comprennent le petit-déjeuner et la visite du donjon.</p>
    <div class="rooms">${ROOMS.map(roomCard).join('')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="split__img reveal">${pic('salon-medieval-chambres-hotes', 'Palier des chambres d’hôtes : charpente en bois, coffre médiéval, blasons et peau de vache')}</div>
    <div class="reveal">
      <span class="kicker">Compris dans votre nuit</span>
      <h2>Ce que comprend le séjour</h2>
      ${included}
      <div class="btns"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver sur Booking.com</a><a class="btn btn--ghost" href="${TEL_HREF}">${TEL}</a></div>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap split split--rev">
    <div class="split__img reveal">${pic('salle-des-lions-location-salle-mariage-mayenne', 'Salle des Lions : salle de réception médiévale avec charpente, murs en pierre, lustres en fer forgé et grande cheminée')}</div>
    <div class="reveal">
      <span class="kicker">Location de salle</span>
      <h2>La Salle des Lions, pour un mariage, un anniversaire ou un banquet</h2>
      <p class="lead">Murs de pierre, charpente apparente, lustres forgés et cheminée monumentale : une salle de réception qui n’a pas besoin de décoration.</p>
      <p>Elle se loue avec une cuisine professionnelle complète — trois fours, chambre froide, lave-vaisselle — pour votre traiteur ou votre équipe.</p>
      <p><a class="more" href="salle-des-lions.html">Louer la Salle des Lions</a></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="kicker">Sur place</span>
    <h2>Le donjon, la forge et la chapelle</h2>
    <p class="lead">Le domaine se visite. D’avril à août, le deuxième week-end du mois, les Féodales de Clairbois y font revivre le quotidien du XIII<sup>e</sup> siècle.</p>
    <div class="gallery" style="margin-top:32px">
      <div class="wide reveal">${pic('domaine-ferte-clairbois-vue-aerienne', 'Le domaine médiéval de Clairbois vu du ciel, entouré de sa palissade', { sizes: '(min-width: 720px) 66vw, 100vw' })}</div>
      <div class="reveal">${pic('forge-medievale-clairbois', 'Forge médiévale du domaine : soufflet, enclume et roues de charrette', { sizes: '(min-width: 720px) 33vw, 50vw' })}</div>
      <div class="reveal">${pic('chapelle-domaine-clairbois', 'Intérieur de la chapelle du domaine de Clairbois, bancs en bois et autel', { sizes: '(min-width: 720px) 33vw, 50vw' })}</div>
    </div>
    <p style="margin-top:28px"><a class="more" href="domaine.html">Visiter le domaine et connaître les dates des fêtes médiévales</a></p>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">Cavaliers</span>
      <h2>Venir avec son cheval</h2>
      <p>Le domaine accueille les cavaliers et leur monture. Les chevaux passent la nuit dans les boxes à colombages, vous dans l’une des chambres, et les chemins équestres des Coëvrons partent presque du portail.</p>
      <p><a class="more" href="domaine.html#cavaliers">Hébergement cavaliers en Mayenne</a></p>
    </div>
    <div class="split__img reveal">${pic('boxes-chevaux-domaine-clairbois', 'Boxes à chevaux à colombages du Domaine de la Ferté Clairbois')}</div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="kicker">Avis des voyageurs</span>
    <h2>Noté <em style="color:var(--ochre)">${NOTE}/10</em> par ${AVIS} voyageurs</h2>
    <p class="lead">Note moyenne des séjours réservés sur Booking.com. Quelques mots laissés par nos hôtes :</p>
    <div class="quotes">
      <blockquote class="quote reveal"><p>« Dame Edwige nous a accueillis comme des seigneurs et a su remplir d’étoiles les yeux de notre petite fille de 4 ans. »</p><footer>Nicole H. — Tripadvisor</footer></blockquote>
      <blockquote class="quote reveal"><p>« Nous n’y avons passé qu’une nuit mais nous y reviendrons sûrement ! Un accueil et un lieu exceptionnels. »</p><footer>Morgane P. — Google</footer></blockquote>
      <blockquote class="quote reveal"><p>« Des propriétaires charmants et accueillants, un site magnifique. Un moment hors du temps où je reviendrai avec joie. »</p><footer>Lucien V. — Google</footer></blockquote>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <span class="kicker">Aux alentours</span>
    <h2>Que faire autour de Sainte-Suzanne</h2>
    <p class="lead">La cité médiévale est à 7 minutes, les grottes de Saulges à un quart d’heure. De quoi remplir un week-end sans reprendre l’autoroute.</p>
    <div class="places places--3">
      <article class="place reveal">${pic('sainte-suzanne-depuis-tertre-ganne', 'La cité médiévale de Sainte-Suzanne et son château vus depuis le Tertre Ganne', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<span class="place__meta">7 min en voiture</span><h3>Sainte-Suzanne, cité médiévale</h3><p>L’un des Plus Beaux Villages de France, la seule place forte qui ait tenu tête à Guillaume le Conquérant.</p></article>
      <article class="place reveal">${pic('grottes-de-saulges', 'Concrétions calcaires dans les grottes de Saulges', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<span class="place__meta">14 min en voiture</span><h3>Grottes et canyon de Saulges</h3><p>Deux grottes ouvertes à la visite, un canyon calcaire et des sentiers le long de l’Erve.</p></article>
      <article class="place reveal">${pic('promenade-des-moulins-erve', 'La rivière Erve et ses rochers sur la Promenade des Moulins à Sainte-Suzanne', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<span class="place__meta">5 min en voiture</span><h3>La Promenade des Moulins</h3><p>Une balade au fil de l’Erve, d’un ancien moulin à l’autre, jusqu’au belvédère du Tertre Ganne.</p></article>
    </div>
    <p style="margin-top:32px"><a class="more" href="autour.html">Toutes les idées de visites</a></p>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="kicker">Questions fréquentes</span>
    <h2>Avant de réserver</h2>
    ${faqHtml(FAQ_HOME)}
  </div>
</section>
${cta('Réservez votre nuit médiévale en Mayenne', 'La réservation se fait en ligne sur Booking.com : disponibilités et tarifs s’affichent tout de suite. Une question avant de réserver ? Appelez-nous.')}`
});

/* ───────── Chambres (page pilier) ───────── */
const FAQ_ROOMS = [FAQ_HOME[1], FAQ_HOME[2], FAQ_HOME[0], FAQ_HOME[5],
  ['Peut-on venir en famille ou entre amis ?', 'Chaque chambre accueille deux personnes. En réservant les trois, vous pouvez loger jusqu’à six personnes sur le domaine — pratique pour les invités d’un mariage célébré dans la Salle des Lions.'],
  ['Comment réserver une chambre d’hôtes ?', 'Les trois chambres se réservent en ligne sur Booking.com, où le domaine est noté 9,4/10 par 132 voyageurs. Pour une question avant de réserver, appelez-nous au 07 50 90 64 40.']];
pages.push({
  file: 'chambres-hotes.html', nav: 'chambres-hotes.html',
  trail: [['chambres-hotes.html', 'Chambres d’hôtes']],
  title: 'Chambres d’hôtes insolites en Mayenne – 3 chambres médiévales | Ferté Clairbois',
  desc: 'Tristan, Iseult, Clairbois : 3 chambres d’hôtes de charme pour 2 personnes à Sainte-Suzanne. Salle de bain privative, petit-déjeuner compris, à partir de 125 € la nuit.',
  og: 'chambre-tristan-chambre-hotes-medievale-1536.webp',
  ld: [faqLd(FAQ_ROOMS)],
  hero: hero('chambre-iseult-chambre-hotes-medievale', 'Chambre d’hôtes Iseult au Domaine de la Ferté Clairbois, lit double et poutres anciennes', 'Hébergement insolite · Mayenne', 'Chambres d’hôtes <em>insolites</em> à Sainte-Suzanne, en Mayenne', 'Trois chambres au décor médiéval pour un week-end à deux, une étape entre Laval et Le Mans ou une nuit vraiment différente en Pays de la Loire.', '', true, [ROOMS[2], ROOMS[0]].map((r) => [r.img, r.alt])),
  body: `
<section class="section">
  <div class="wrap">
    <span class="kicker">Trois chambres, trois ambiances</span>
    <h2>Choisir sa chambre d’hôtes</h2>
    <p class="lead">Les trois chambres se trouvent sous la charpente du logis. Même confort, même prix de départ ; seule l’atmosphère change.</p>
    <div class="rooms">${ROOMS.map(roomCard).join('')}</div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">Tout est compris</span>
      <h2>Petit-déjeuner, donjon et parking inclus</h2>
      ${included}
    </div>
    <div class="reveal">
      <h2>Informations pratiques</h2>
      <dl class="dl">
        <div><dt>Arrivée</dt><dd>17 h – 22 h</dd></div>
        <div><dt>Départ</dt><dd>8 h – 12 h</dd></div>
        <div><dt>Capacité</dt><dd>2 pers. / chambre</dd></div>
        <div><dt>Tarif</dt><dd>dès ${PRIX} € la nuit</dd></div>
        <div><dt>Animaux</dt><dd>non admis</dd></div>
        <div><dt>Tabac</dt><dd>non-fumeur</dd></div>
      </dl>
      <div class="btns"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Voir les disponibilités</a></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split split--rev">
    <div class="split__img reveal">${pic('chambre-iseult-salle-de-bain-poutres', 'Salle de bain privative en pierre et bois d’une chambre d’hôtes du domaine')}</div>
    <div class="reveal">
      <span class="kicker">Pourquoi Clairbois</span>
      <h2>Un week-end insolite entre Laval et Le Mans</h2>
      <p>On vient à Clairbois pour dormir ailleurs que dans une chambre comme les autres. Le lieu est une ferme fortifiée du XIII<sup>e</sup> siècle reconstituée : vous traversez le pont, vous longez la palissade, vous montez sous la charpente.</p>
      <p>C’est une bonne adresse pour un week-end en amoureux, un anniversaire à surprendre, une étape sur la route de la Bretagne ou un séjour avec des enfants qui rêvent de chevaliers. Sainte-Suzanne, classée parmi les Plus Beaux Villages de France, est à sept minutes.</p>
      <p><a class="more" href="autour.html">Que faire pendant votre séjour</a></p>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <span class="kicker">Questions fréquentes</span>
    <h2>Bon à savoir sur les chambres</h2>
    ${faqHtml(FAQ_ROOMS)}
  </div>
</section>
${cta('Une date en tête ?', 'Vérifiez les disponibilités et réservez votre chambre en quelques clics sur Booking.com.')}`
});

/* ───────── Pages chambre ───────── */
ROOMS.forEach((r) => {
  const others = ROOMS.filter((x) => x !== r);
  pages.push({
    file: r.file, nav: 'chambres-hotes.html',
    trail: [['chambres-hotes.html', 'Chambres d’hôtes'], [r.file, r.name]],
    title: r.title, desc: r.desc, og: `${r.img}-${man[r.img].ws.slice(-1)[0]}.webp`,
    ld: [{
      '@type': 'HotelRoom', name: r.name, description: r.desc, url: `${SITE}/${r.file}`,
      image: `${SITE}/img/${r.img}-${man[r.img].ws.slice(-1)[0]}.webp`,
      occupancy: { '@type': 'QuantitativeValue', maxValue: 2 },
      floorSize: { '@type': 'QuantitativeValue', value: r.surface, unitCode: 'MTK' },
      bed: { '@type': 'BedDetails', numberOfBeds: 1, typeOfBed: 'Lit double' },
      containedInPlace: { '@id': SITE + '/#domaine' }
    }],
    hero: hero(r.img, r.alt, `Chambre d’hôtes · ${r.surface} m² · 2 personnes`, r.h1, r.short),
    body: `
<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">La chambre</span>
      <h2>${r.name} : le décor et le confort</h2>
      <p class="lead">${r.intro}</p>
      <p class="price">Dès ${PRIX} € <small>la nuit, petit-déjeuner compris</small></p>
      <div class="btns"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver sur Booking.com</a><a class="btn btn--ghost" href="${TEL_HREF}">${TEL}</a></div>
    </div>
    <div class="reveal">
      <dl class="dl" style="grid-template-columns:1fr 1fr">
        <div><dt>Surface</dt><dd>${r.surface} m²</dd></div>
        <div><dt>Capacité</dt><dd>2 personnes</dd></div>
        <div><dt>Couchage</dt><dd>1 lit double</dd></div>
        <div><dt>Salle de bain</dt><dd>privative</dd></div>
        <div><dt>Arrivée</dt><dd>17 h – 22 h</dd></div>
        <div><dt>Départ</dt><dd>8 h – 12 h</dd></div>
      </dl>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <h2>La ${r.name.replace('Chambre', 'chambre')} en images</h2>
    <div class="gallery" style="margin-top:28px">
      <div class="wide reveal">${pic(r.gallery[0][0], r.gallery[0][1], { sizes: '(min-width: 720px) 66vw, 100vw' })}</div>
      <div class="reveal">${pic(r.gallery[1][0], r.gallery[1][1], { sizes: '(min-width: 720px) 33vw, 50vw' })}</div>
      <div class="reveal">${pic(r.gallery[2][0], r.gallery[2][1], { sizes: '(min-width: 720px) 33vw, 50vw' })}</div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">Compris dans le prix</span>
      <h2>Équipements et services</h2>
      ${included}
      <p class="note" style="margin-top:16px">Chambre non-fumeur. Les animaux de compagnie ne sont pas admis.</p>
    </div>
    <div class="reveal">
      <span class="kicker">Avis</span>
      <h2>Ce qu’en disent nos hôtes</h2>
      <div class="quotes" style="grid-template-columns:1fr">${r.avis.map(([t, a]) => `<blockquote class="quote"><p>« ${t} »</p><footer>${a}</footer></blockquote>`).join('')}</div>
    </div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <h2>Les deux autres chambres d’hôtes</h2>
    <div class="places">${others.map((o) => `<article class="place reveal"><a href="${o.file}">${pic(o.img, o.alt)}</a><span class="place__meta">${o.surface} m² · 2 personnes</span><h3><a href="${o.file}" style="color:inherit;text-decoration:none">${o.name}</a></h3><p>${o.short}</p></article>`).join('')}</div>
  </div>
</section>
${cta(`Réserver la ${r.name.replace('Chambre', 'chambre')}`, 'Choisissez vos dates sur Booking.com : la disponibilité et le tarif s’affichent tout de suite.')}`
  });
});

/* ───────── Salle des Lions ───────── */
const FAQ_SALLE = [
  ['Pour quels événements peut-on louer la Salle des Lions ?', 'Mariages, anniversaires, banquets, baptêmes, repas de famille, fêtes d’association, séminaires et repas d’entreprise. Le décor médiéval convient autant à un mariage à thème qu’à une réception classique.'],
  ['La cuisine est-elle comprise dans la location ?', 'La salle se loue avec sa cuisine professionnelle : trois fours (électrique, gaz et vapeur), chambre froide, armoire réfrigérée, congélateur, lave-vaisselle professionnel et deux grands bacs de plonge. Votre traiteur peut y travailler directement.'],
  ['Peut-on dormir sur place après la fête ?', 'Oui : les trois chambres d’hôtes du domaine peuvent loger jusqu’à six personnes, idéal pour les mariés et leurs proches. Pensez à les réserver en même temps que la salle.'],
  ['Comment connaître le tarif et les disponibilités ?', 'Le prix dépend de la date, de la durée et des espaces loués. Appelez-nous au 07 50 90 64 40 ou envoyez votre demande depuis la page contact : nous vous adressons un devis.'],
  ['Où se situe la salle ?', 'À Sainte-Suzanne-et-Chammes, en Mayenne, à une dizaine de kilomètres de l’A81 , entre Laval et Le Mans.']
];
pages.push({
  file: 'salle-des-lions.html', nav: 'salle-des-lions.html',
  trail: [['salle-des-lions.html', 'Salle des Lions']],
  title: 'Location de salle de mariage en Mayenne – Salle des Lions | Ferté Clairbois',
  desc: 'Louez la Salle des Lions à Sainte-Suzanne (53) : salle de réception médiévale avec cuisine professionnelle pour mariage, anniversaire, banquet ou séminaire. Hébergement sur place.',
  og: 'salle-des-lions-location-salle-mariage-mayenne-1600.webp',
  ld: [faqLd(FAQ_SALLE), {
    '@type': 'EventVenue', name: 'Salle des Lions – Domaine de la Ferté Clairbois', url: SITE + '/salle-des-lions.html',
    description: 'Salle de réception au décor médiéval avec cuisine professionnelle, à louer pour mariages, anniversaires, banquets et séminaires.',
    image: SITE + '/img/salle-des-lions-location-salle-mariage-mayenne-1600.webp',
    address: business.address, geo: business.geo, telephone: business.telephone, containedInPlace: { '@id': SITE + '/#domaine' }
  }],
  hero: hero('salle-des-lions-location-salle-mariage-mayenne', 'Salle des Lions : grande salle de réception médiévale avec tables en bois, lustres et cheminée', 'Location de salle · Mayenne (53)', 'Location de salle de <em>mariage</em> et de réception en Mayenne', 'La Salle des Lions : pierre, charpente, cheminée monumentale et cuisine professionnelle, à Sainte-Suzanne, entre Laval et Le Mans.', `<a class="btn" href="contact.html#demande">Demander un devis</a><a class="btn btn--light" href="${TEL_HREF}">${TEL}</a>`),
  body: `
<section class="section">
  <div class="wrap split split--wide">
    <div class="reveal">
      <span class="kicker">La salle</span>
      <h2>Une salle de réception médiévale, sans décor à ajouter</h2>
      <p class="lead">Murs en pierre, haute charpente en bois, lustres en fer forgé, blasons, grande cheminée avec sa crémaillère : la Salle des Lions a déjà son caractère.</p>
      <p>De longues tables en bois et leurs chaises sont en place pour un banquet. Vous pouvez garder l’esprit médiéval jusqu’au bout — costumes, musique, menu d’époque — ou simplement profiter d’un cadre chaleureux pour une réception classique.</p>
      <p>Autour de la salle, le domaine offre son donjon, son pont et ses prés pour le vin d’honneur et les photos.</p>
    </div>
    <div class="split__img reveal">${pic('salle-des-lions-location-salle-mariage-mayenne', 'Intérieur de la Salle des Lions dressée pour un banquet, murs en pierre et charpente apparente', { sizes: '(min-width: 720px) 58vw, 100vw' })}</div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <span class="kicker">Vos événements</span>
    <h2>Mariage, anniversaire, banquet, séminaire</h2>
    <div class="places places--3">
      <article class="place reveal"><h3>Mariage médiéval ou champêtre</h3><p>Un lieu de réception en pleine campagne, avec des chambres sur place pour les mariés. Le donjon et le pont de bois font le reste sur les photos.</p></article>
      <article class="place reveal"><h3>Anniversaire et fête de famille</h3><p>Trente ans, cinquante ans, cousinade ou baptême : la salle se prête aux grandes tablées, et les enfants ont un domaine entier à explorer.</p></article>
      <article class="place reveal"><h3>Banquet, association, entreprise</h3><p>Repas de fin d’année, assemblée, séminaire au vert ou banquet costumé : un cadre que vos invités n’auront pas déjà vu dix fois.</p></article>
    </div>
  </div>
</section>

<section class="section" id="cuisine">
  <div class="wrap split">
    <div class="reveal">
      <span class="kicker">Location de cuisine</span>
      <h2>Une cuisine professionnelle entièrement équipée</h2>
      <p>Votre traiteur ou votre équipe travaille dans une vraie cuisine de collectivité, aux surfaces inox, attenante à la salle.</p>
      <ul class="ticks">
        <li><strong>3 fours</strong> : un électrique, un gaz et un vapeur</li>
        <li><strong>Piano de cuisson</strong> et hotte professionnelle</li>
        <li><strong>Chambre froide</strong></li>
        <li><strong>Armoire réfrigérée</strong> positive et congélateur</li>
        <li><strong>Lave-vaisselle professionnel</strong></li>
        <li><strong>2 grands bacs</strong> de plonge</li>
      </ul>
    </div>
    <div class="reveal">
      <div class="gallery" style="grid-template-columns:1fr 1fr">
        <div class="wide" style="grid-column:1/-1;grid-row:auto">${pic('cuisine-professionnelle-salle-des-lions', 'Cuisine professionnelle de la Salle des Lions : piano de cuisson, hotte et plans de travail inox')}</div>
        <div>${pic('plonge-cuisine-professionnelle', 'Plonge et lave-vaisselle professionnel de la cuisine', { sizes: '(min-width: 720px) 25vw, 50vw' })}</div>
        <div>${pic('chambre-froide-salle-des-lions', 'Chambre froide de la cuisine professionnelle', { sizes: '(min-width: 720px) 25vw, 50vw' })}</div>
      </div>
    </div>
  </div>
</section>

<section class="section section--dark">
  <div class="wrap split split--rev">
    <div class="split__img reveal">${pic('chambre-clairbois-lit-blason', 'Chambre d’hôtes Clairbois, pour loger les mariés sur le lieu de réception')}</div>
    <div class="reveal">
      <span class="kicker">Dormir sur place</span>
      <h2>Trois chambres pour les mariés et leurs proches</h2>
      <p class="lead">Pas de route à reprendre après la soirée : les trois chambres d’hôtes du domaine accueillent jusqu’à six personnes, petit-déjeuner compris.</p>
      <p><a class="more" href="chambres-hotes.html">Voir les chambres d’hôtes</a></p>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap">
    <span class="kicker">Questions fréquentes</span>
    <h2>Louer la Salle des Lions : l’essentiel</h2>
    ${faqHtml(FAQ_SALLE)}
  </div>
</section>
${cta('Parlons de votre événement', 'Donnez-nous la date, le nombre d’invités et le type de réception : nous vous envoyons un devis et vous proposons une visite du domaine.', false)}`
});

/* ───────── Le domaine ───────── */
pages.push({
  file: 'domaine.html', nav: 'domaine.html',
  trail: [['domaine.html', 'Le domaine']],
  title: 'Domaine médiéval de Clairbois : donjon, forge, fêtes médiévales en Mayenne',
  desc: 'Visitez le domaine de la Ferté Clairbois à Sainte-Suzanne : donjon et pont-levis, forge, chapelle, fêtes médiévales d’avril à août et accueil des cavaliers avec leur cheval.',
  og: 'donjon-clairbois-pont-1600.webp',
  hero: hero('donjon-clairbois-pont', 'Le donjon de Clairbois et son pont en bois sous les arbres', 'Ferme fortifiée du XIIIᵉ siècle', 'Le domaine <em>médiéval</em> de la Ferté Clairbois', 'Un donjon, des douves, une forge, une chapelle : la reconstitution d’un petit domaine seigneurial, aux portes de Sainte-Suzanne.'),
  body: `
<section class="section">
  <div class="wrap split split--wide">
    <div class="reveal">
      <span class="kicker">Le lieu</span>
      <h2>Une ferme fortifiée reconstituée en Mayenne</h2>
      <p class="lead">Clairbois reproduit ce qu’était, au XIII<sup>e</sup> siècle, la demeure d’un petit seigneur rural : un logis défendu, des ateliers, une chapelle, des bêtes, et une palissade tout autour.</p>
      <p>Le domaine a été bâti pour être habité et visité. Edwige et Franck y reçoivent leurs hôtes toute l’année et l’ouvrent au public lors des fêtes médiévales.</p>
    </div>
    <div class="split__img reveal">${pic('domaine-ferte-clairbois-vue-aerienne', 'Vue aérienne de la ferme fortifiée de Clairbois et de sa palissade', { sizes: '(min-width: 720px) 58vw, 100vw' })}</div>
  </div>
</section>

<section class="section section--tint">
  <div class="wrap">
    <span class="kicker">La visite</span>
    <h2>Ce que l’on voit à Clairbois</h2>
    <div class="places places--3">
      <article class="place reveal">${pic('donjon-clairbois-pont', 'Donjon fortifié de Clairbois, douves et pont-levis', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<h3>Le donjon et son pont-levis</h3><p>Entouré de douves, il domine le domaine. On y découvre la cuisine et la chambre seigneuriale, avec une vue dégagée sur la campagne. Les hôtes des chambres le visitent le matin.</p></article>
      <article class="place reveal">${pic('forge-medievale-clairbois', 'La forge médiévale : grand soufflet, enclume sur billot et roues de charrette', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<h3>La forge et l’échoppe</h3><p>Soufflet, enclume, outils : la forge montre le travail du fer tel qu’on le pratiquait au Moyen Âge. À côté, l’échoppe présente le travail d’artisans locaux.</p></article>
      <article class="place reveal">${pic('chapelle-domaine-clairbois', 'La chapelle du domaine : portes en bois cloutées, bancs et autel', { sizes: '(min-width: 1000px) 33vw, (min-width: 720px) 50vw, 100vw' })}<h3>La chapelle</h3><p>Petite, blanche, avec son vitrail coloré et ses sculptures : le lieu le plus calme du domaine.</p></article>
    </div>
  </div>
</section>

<section class="section section--dark" id="fetes-medievales">
  <div class="wrap reveal">
    <span class="kicker">Avril – août</span>
    <h2>Les Féodales de Clairbois, fêtes médiévales en Mayenne</h2>
    <p class="lead">Le deuxième week-end de chaque mois, d’avril à août, l’association La Mesnie de la Ferté Clairbois anime le domaine : artisans, campements, troupes de reconstitution historique du XIII<sup>e</sup> siècle.</p>
    <p>Dormir sur place ces week-ends-là, c’est avoir la fête au pied de sa chambre. Les trois chambres partent vite : réservez tôt.</p>
    <div class="btns"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver un week-end de fête</a><a class="btn btn--light" href="${FACEBOOK}" target="_blank" rel="noopener">Dates et actualités sur Facebook</a></div>
  </div>
</section>

<section class="section" id="cavaliers">
  <div class="wrap split">
    <div class="split__img reveal">${pic('boxes-chevaux-domaine-clairbois', 'Boxes à chevaux à colombages pour l’accueil des cavaliers au domaine de Clairbois')}</div>
    <div class="reveal">
      <span class="kicker">Tourisme équestre</span>
      <h2>Hébergement pour cavaliers et chevaux</h2>
      <p>Vous randonnez à cheval dans les Coëvrons ? Faites étape à Clairbois : boxes pour les chevaux, chambre d’hôtes et petit-déjeuner pour les cavaliers.</p>
      <p>Les chemins équestres autour de Sainte-Suzanne et de la forêt de la Charnie se rejoignent facilement depuis le domaine. Prévenez-nous du nombre de chevaux au moment de réserver.</p>
      <p><a class="more" href="contact.html#demande">Organiser une étape équestre</a></p>
    </div>
  </div>
</section>
${cta('Dormir au pied du donjon', 'La visite matinale du donjon est comprise pour les hôtes des chambres.')}`
});

/* ───────── Aux alentours ───────── */
const PLACES = [
  ['chateau-sainte-suzanne-vue-aerienne', 'Vue aérienne du château de Sainte-Suzanne et de son donjon roman', '7 min · entrée libre, musée payant', 'Le château de Sainte-Suzanne', 'Bâtie au XI<sup>e</sup> siècle sur un éperon à 70 mètres au-dessus de l’Erve, la forteresse a résisté au siège de Guillaume le Conquérant. On visite le donjon, les remparts et le centre d’interprétation du patrimoine.'],
  ['ruelle-sainte-suzanne', 'Ruelle pavée et maisons en pierre de la cité médiévale de Sainte-Suzanne', '7 min · cité médiévale', 'La cité et le musée de l’Auditoire', 'Ruelles pavées, maisons de granit, boutiques d’artisans : Sainte-Suzanne est classée parmi les Plus Beaux Villages de France. Le musée de l’Auditoire retrace l’histoire de la cité.'],
  ['promenade-des-moulins-erve', 'L’Erve coulant entre les rochers sur la Promenade des Moulins', '5 min · gratuit', 'La Promenade des Moulins', 'Une randonnée facile au bord de l’Erve, le long des anciens moulins à grain, à papier et à tan qui ont fait vivre la vallée.'],
  ['sainte-suzanne-depuis-tertre-ganne', 'Panorama sur Sainte-Suzanne depuis le Tertre Ganne', '7 min · gratuit', 'Le Tertre Ganne', 'Le belvédère d’où l’on photographie la cité : château, remparts et clocher d’un seul regard, surtout en fin de journée.'],
  ['grottes-de-saulges', 'Stalactites et draperies dans les grottes de Saulges', '14 min · à partir de 8,50 €', 'Le canyon et les grottes de Saulges', 'Un canyon calcaire creusé par l’Erve, deux grottes ouvertes à la visite, un musée de Préhistoire, et des sentiers pour la randonnée, la pêche ou le canoë.'],
  ['jublains-forteresse-gallo-romaine', 'Vue aérienne de la forteresse gallo-romaine de Jublains', 'Environ 30 min', 'La cité gallo-romaine de Jublains', 'Forteresse, thermes, théâtre et temple : l’ancienne capitale des Diablintes est le site antique le mieux conservé de l’Ouest.'],
  ['basilique-evron', 'Façade gothique de la basilique Notre-Dame-de-l’Épine à Évron', 'Environ 15 min', 'La basilique d’Évron', 'Une nef romane, un chœur gothique lumineux et une tour fortifiée : l’une des plus belles églises de la Mayenne.']
];
pages.push({
  file: 'autour.html', nav: 'autour.html',
  trail: [['autour.html', 'Aux alentours']],
  title: 'Que faire à Sainte-Suzanne et aux alentours ? 7 idées de visites en Mayenne',
  desc: 'Château et cité médiévale de Sainte-Suzanne, grottes de Saulges, Jublains, basilique d’Évron : les visites à faire autour du Domaine de la Ferté Clairbois, avec les temps de trajet.',
  og: 'sainte-suzanne-depuis-tertre-ganne-1024.webp',
  hero: hero('sainte-suzanne-cite-medievale-mayenne', 'La cité médiévale de Sainte-Suzanne perchée sur son éperon rocheux', 'Tourisme en Mayenne', 'Que faire à <em>Sainte-Suzanne</em> et dans les Coëvrons', 'Sept visites à moins d’une demi-heure du domaine, de la cité médiévale aux grottes de Saulges.'),
  body: `
<section class="section">
  <div class="wrap">
    <span class="kicker">Depuis vos chambres d’hôtes</span>
    <h2>Les visites à ne pas manquer</h2>
    <p class="lead">Les temps de trajet sont donnés en voiture depuis le domaine. Edwige et Franck vous indiqueront volontiers leurs adresses pour déjeuner.</p>
    <div class="places">${PLACES.map(([img, alt, meta, h, t]) => `<article class="place reveal">${pic(img, alt)}<span class="place__meta">${meta}</span><h3>${h}</h3><p>${t}</p></article>`).join('')}</div>
  </div>
</section>
${cta('Faites de Clairbois votre point de chute', 'Deux nuits suffisent pour voir Sainte-Suzanne, Saulges et Évron sans courir.')}`
});

/* ───────── Contact & accès ───────── */
pages.push({
  file: 'contact.html', nav: 'contact.html',
  trail: [['contact.html', 'Contact & accès']],
  title: 'Contact, réservation et accès – Domaine de la Ferté Clairbois (Mayenne)',
  desc: 'Chambres réservables sur Booking.com, Salle des Lions sur devis : 07 50 90 64 40. Domaine de la Ferté Clairbois, 265 Clair Bois, 53270 Sainte-Suzanne-et-Chammes. Accès depuis Laval et Le Mans.',
  hero: '',
  body: `
<section class="section">
  <div class="wrap">
    <h1>Contact, réservation et accès</h1>
    <p class="lead">Les chambres d’hôtes se réservent en ligne sur Booking.com. Pour la location de la Salle des Lions, un séjour avec chevaux ou une question, écrivez-nous ou appelez : c’est Edwige ou Franck qui vous répond.</p>
    <div class="btns"><a class="btn" href="${BOOKING}" target="_blank" rel="noopener">Réserver une chambre sur Booking.com</a></div>
    <div class="split" style="align-items:start;margin-top:40px">
      <div>
        <ul class="contact-list">
          <li><span>Téléphone</span><a href="${TEL_HREF}">${TEL}</a></li>
          <li><span>E-mail</span><a href="mailto:${MAIL}">${MAIL}</a></li>
          <li><span>Adresse</span><address>265 Clair Bois<br>53270 Sainte-Suzanne-et-Chammes</address></li>
          <li><span>Arrivées</span><address>de 17 h à 22 h</address></li>
        </ul>
        <div class="btns"><a class="btn btn--ghost" href="${FACEBOOK}" target="_blank" rel="noopener">Facebook</a></div>
      </div>
      <form class="form" id="demande">
        <h2>Votre demande</h2>
        <div><label for="nom">Nom et prénom</label><input id="nom" name="nom" autocomplete="name" required></div>
        <div><label for="tel">Téléphone</label><input id="tel" name="tel" type="tel" autocomplete="tel"></div>
        <div><label for="objet">Votre demande concerne</label>
          <select id="objet" name="objet">
            <option>La location de la Salle des Lions</option><option>Une question sur les chambres d’hôtes</option><option>Un séjour avec chevaux</option><option>Autre question</option>
          </select></div>
        <div class="form__row">
          <div><label for="arrivee">Arrivée</label><input id="arrivee" name="arrivee" type="date"></div>
          <div><label for="depart">Départ</label><input id="depart" name="depart" type="date"></div>
        </div>
        <div><label for="personnes">Nombre de personnes</label><input id="personnes" name="personnes" type="number" min="1" inputmode="numeric"></div>
        <div><label for="message">Message</label><textarea id="message" name="message"></textarea></div>
        <button class="btn" type="submit">Envoyer ma demande</button>
        <p class="note">Le bouton ouvre votre messagerie avec la demande déjà rédigée. Vous pouvez aussi nous appeler directement.</p>
      </form>
    </div>
  </div>
</section>

<section class="section section--tint" id="acces">
  <div class="wrap">
    <span class="kicker">Plan d’accès</span>
    <h2>Venir au domaine, entre Laval et Le Mans</h2>
    <div class="split" style="align-items:start;margin-top:30px">
      <div>
        <h3>Depuis Le Mans</h3>
        <p>Prenez l’A81 direction Rennes et sortez à la sortie 1 « Sablé-sur-Sarthe ». Suivez Sainte-Suzanne-et-Chammes, puis les panneaux « Centre médiéval de Clairbois ».</p>
        <h3>Depuis Laval</h3>
        <p>Prenez l’A81 direction Le Mans jusqu’à la sortie 2 « Vaiges ». Suivez la D125 vers Sainte-Suzanne-et-Chammes, puis « Centre médiéval de Clairbois ».</p>
        <h3>En train</h3>
        <p>La gare d’Évron (ligne Paris – Le Mans – Laval – Rennes) est à une dizaine de kilomètres.</p>
        <div class="btns"><a class="btn" href="${MAPS}" target="_blank" rel="noopener">Itinéraire Google Maps</a></div>
      </div>
      <iframe class="map" title="Carte : Domaine de la Ferté Clairbois, 265 Clair Bois, Sainte-Suzanne-et-Chammes" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=265+Clair+Bois%2C+53270+Sainte-Suzanne-et-Chammes&output=embed&z=11"></iframe>
    </div>
  </div>
</section>`
});

/* ───────── Mentions légales (à compléter) ───────── */
pages.push({
  file: 'mentions-legales.html',
  title: 'Mentions légales – Domaine de la Ferté Clairbois',
  desc: 'Mentions légales du site du Domaine de la Ferté Clairbois, chambres d’hôtes à Sainte-Suzanne-et-Chammes (Mayenne).',
  noindex: true,
  hero: '',
  body: `<section class="section"><div class="wrap">
<h1>Mentions légales</h1>
<h2>Éditeur du site</h2>
<p>Domaine de la Ferté Clairbois — 265 Clair Bois, 53270 Sainte-Suzanne-et-Chammes<br>Téléphone : ${TEL} — E-mail : ${MAIL}<br>[À COMPLÉTER : nom du responsable de publication, statut, numéro SIRET]</p>
<h2>Hébergement</h2>
<p>[À COMPLÉTER : nom, adresse et téléphone de l’hébergeur du site]</p>
<h2>Données personnelles</h2>
<p>Ce site ne dépose aucun cookie de suivi. Le formulaire de contact ouvre votre propre messagerie : aucune donnée n’est enregistrée sur le site. La carte affichée sur la page contact est fournie par Google Maps.</p>
<h2>Crédits photographiques</h2>
<p>Domaine de la Ferté Clairbois. [À COMPLÉTER : crédits des photos de Sainte-Suzanne, Saulges, Jublains et Évron — Office de tourisme de Sainte-Suzanne – Les Coëvrons, etc.]</p>
</div></section>`
});

/* ───────── Écriture ───────── */
for (const p of pages) {
  let html = layout(p);
  if (p.noindex) html = html.replace('content="index, follow, max-image-preview:large"', 'content="noindex, follow"');
  fs.writeFileSync(path.join(__dirname, p.file), html);
}

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${SITE}/${p.file === 'index.html' ? '' : p.file}</loc><lastmod>${today}</lastmod></url>`).join('\n')}
</urlset>
`);
fs.writeFileSync(path.join(__dirname, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(pages.length + ' pages générées');

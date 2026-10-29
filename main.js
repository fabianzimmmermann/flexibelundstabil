// Site content lives in content/*.json and is edited through the CMS at /admin.
// This file only holds the fixed interface texts (UI) and the rendering logic.

const UI = {
  de: {
    nav_music: 'Musik', nav_releases: 'Releases', nav_sets: 'Live-Sets', nav_shows: 'Termine', nav_about: 'Über uns', nav_booking: 'Booking',
    listen_now: 'Jetzt hören', book_us: 'Buchen',
    music_title: 'Neue Musik', all_tracks: 'Alle Tracks auf SoundCloud →',
    releases_title: 'Label-Releases', full_playlist: 'Ganze Playlist →',
    sets_title: 'Live-Sets', sets_sub: 'Mitschnitte von unseren Gigs.',
    shows_title: 'Termine', shows_sub: 'Neue Termine gibt’s zuerst auf Instagram.',
    tba_title: 'Neue Termine folgen', tba_sub: 'Folg uns, damit du nichts verpasst', follow: 'Folgen',
    played: 'Gespielt', tickets: 'Tickets', info: 'Info',
    about_title: 'Über uns',
    impressum: 'Impressum', privacy: 'Datenschutz', revoke: 'SoundCloud-Einwilligung widerrufen', back: '← Zurück zur Startseite',
    consent_title: 'SoundCloud-Player laden?',
    consent_text: 'Zum Abspielen wird der Player von SoundCloud geladen. Dabei werden Daten wie deine IP-Adresse an SoundCloud übertragen, und SoundCloud kann Cookies setzen. Deine Entscheidung merken wir uns in deinem Browser.',
    consent_yes: 'Erlauben & abspielen', consent_open: 'Auf SoundCloud öffnen', consent_no: 'Abbrechen',
    date_locale: 'de-DE',
  },
  en: {
    nav_music: 'Music', nav_releases: 'Releases', nav_sets: 'Live Sets', nav_shows: 'Shows', nav_about: 'About', nav_booking: 'Booking',
    listen_now: 'Listen now', book_us: 'Book us',
    music_title: 'Latest Music', all_tracks: 'All tracks on SoundCloud →',
    releases_title: 'Label Releases', full_playlist: 'Full playlist →',
    sets_title: 'Live Sets', sets_sub: 'Recordings from our gigs.',
    shows_title: 'Shows', shows_sub: 'Upcoming dates get announced on Instagram first.',
    tba_title: 'More dates soon', tba_sub: 'Follow us so you don’t miss them', follow: 'Follow',
    played: 'Played', tickets: 'Tickets', info: 'Info',
    about_title: 'About',
    impressum: 'Legal notice', privacy: 'Privacy policy', revoke: 'Withdraw SoundCloud consent', back: '← Back to home',
    consent_title: 'Load the SoundCloud player?',
    consent_text: 'Playing music loads SoundCloud’s player. This sends data such as your IP address to SoundCloud, and SoundCloud may set cookies. Your choice is remembered in your browser.',
    consent_yes: 'Allow & play', consent_open: 'Open on SoundCloud', consent_no: 'Cancel',
    date_locale: 'en-GB',
  },
};

const LANG_KEY = 'fs-lang';
const CONSENT_KEY = 'fs-soundcloud-consent';

// ---- Helpers ---------------------------------------------------------------
const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = ms => { const s = Math.floor(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
const store = {
  get: k => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} },
  del: k => { try { localStorage.removeItem(k); } catch {} },
};
// Only allow http(s) links and same-site paths, so a typo in the CMS can't inject javascript: URLs.
const safeUrl = u => {
  if (!u || !String(u).trim()) return '';
  try {
    const x = new URL(u, location.href);
    return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : '';
  } catch { return ''; }
};
const isSoundCloud = u => /^https:\/\/(www\.|m\.)?soundcloud\.com\//.test(safeUrl(u));

let lang = new URLSearchParams(location.search).get('lang')
  || store.get(LANG_KEY)
  || ((navigator.language || '').toLowerCase().startsWith('de') ? 'de' : 'en');
if (!UI[lang]) lang = 'de';

const t = k => UI[lang][k] ?? k;
const L = (obj, field) => obj?.[`${field}_${lang}`] || obj?.[`${field}_de`] || obj?.[`${field}_en`] || '';
const hasConsent = () => store.get(CONSENT_KEY) === 'yes';

// Tiny formatter for CMS text fields: blank line = new paragraph, "## " = heading, URLs become links.
function prose(text) {
  return String(text || '').trim().split(/\n\s*\n/).map(block => {
    if (block.startsWith('## ')) return `<h3>${esc(block.slice(3))}</h3>`;
    const html = esc(block)
      .replace(/https?:\/\/[^\s<]+/g, u => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`)
      .replace(/\n/g, '<br>');
    return `<p>${html}</p>`;
  }).join('');
}

const artCache = {};
function soundcloudArtwork(url) {
  artCache[url] ??= fetch('https://soundcloud.com/oembed?format=json&url=' + encodeURIComponent(url))
    .then(r => (r.ok ? r.json() : null))
    .then(d => d?.thumbnail_url || null)
    .catch(() => null);
  return artCache[url];
}
// Uploaded cover first; otherwise fetch it from SoundCloud, but only once the visitor has agreed to SoundCloud.
function fillArt(img, item) {
  const src = item.cover && safeUrl(item.cover);
  if (src) { img.src = src; img.hidden = false; return; }
  if (hasConsent() && isSoundCloud(item.url)) {
    soundcloudArtwork(item.url).then(s => { if (s) { img.src = s; img.hidden = false; } });
  }
}

// ---- Render ----------------------------------------------------------------
let data = {};

function playable(el, item, artist) {
  el.dataset.play = safeUrl(item.url);
  el.dataset.title = item.title || '';
  el.dataset.artist = artist || item.artist || 'flexibel&stabil';
  el.dataset.cover = item.cover || '';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
}

function card(item) {
  const el = document.createElement('article');
  el.className = 'card reveal';
  playable(el, item);
  el.innerHTML = `
    <div class="card-art"><span class="fallback">f&amp;s</span><img alt="" hidden loading="lazy"></div>
    <h3>${esc(item.title)}${item.tag ? `<span class="badge">${esc(item.tag)}</span>` : ''}</h3>
    <p>${esc(item.note)}</p>`;
  fillArt($('img', el), item);
  return el;
}

function renderStatic() {
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('active', b.dataset.lang === lang));
  $('#year').textContent = new Date().getFullYear();
  $('#revokeConsent').hidden = !hasConsent();

  const links = data.site?.links || {};
  $('#socials').innerHTML = [['SoundCloud', links.soundcloud], ['Spotify', links.spotify], ['YouTube', links.youtube], ['Instagram', links.instagram]]
    .filter(([, u]) => safeUrl(u))
    .map(([n, u]) => `<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${n}</a>`).join('');
}

function renderHome() {
  // Default every section so a list emptied in the CMS can't break the page.
  const site = { hero: {}, about: {}, booking: {}, links: {}, stats: [], ...data.site };
  const music = { music: [], releases: [], sets: [], ...data.music };
  const shows = { shows: [], ...data.shows };
  const hero = site.hero;

  if (safeUrl(hero.image)) $('#heroBg').style.backgroundImage = `url("${safeUrl(hero.image)}")`;
  $('#heroGenres').textContent = hero.genres;
  $('#heroRelease').textContent = `flexibel&stabil — ${hero.release_title}`;
  $('#heroLabel').textContent = hero.release_label ? `via ${hero.release_label}` : '';
  playable($('#heroPlay'), { url: hero.release_url, title: hero.release_title, cover: music.music.find(m => m.url === hero.release_url)?.cover });
  $('#heroPlay').removeAttribute('role');
  const ticker = (hero.ticker || []).flatMap(x => [`<span>${esc(x)}</span>`, '<span>✦</span>']).join('');
  $('#ticker').innerHTML = ticker + ticker;

  $('#stats').innerHTML = (site.stats || []).map(s =>
    /^\d+$/.test(s.value)
      ? `<div><b data-count="${s.value}">0</b><span>${esc(L(s, 'label'))}</span></div>`
      : `<div><b>${esc(s.value)}</b><span>${esc(L(s, 'label'))}</span></div>`).join('');

  $('#allTracks').href = safeUrl(music.all_tracks_url) || '#';
  $('#releasesPlaylist').href = safeUrl(music.releases_playlist_url) || '#';
  $('#musicGrid').replaceChildren(...music.music.map(card));
  $('#setGrid').replaceChildren(...music.sets.map(card));

  $('#releaseList').replaceChildren(...music.releases.map((r, i) => {
    const li = document.createElement('li');
    li.className = 'reveal';
    playable(li, r, r.artist);
    li.innerHTML = `
      <span class="num">${String(i + 1).padStart(2, '0')}</span>
      <img class="thumb" alt="">
      <div><strong>${esc(r.title)}</strong><small>${esc(r.artist)}</small></div>
      <span class="label">${esc(r.label)}</span>`;
    fillArt($('img', li), r);
    return li;
  }));

  renderShows(shows.shows || [], site.links?.instagram);

  if (safeUrl(site.about.image)) $('#aboutImg').src = safeUrl(site.about.image);
  $('#aboutLead').textContent = L(site.about, 'lead');
  $('#aboutText').innerHTML = prose(L(site.about, 'text'));

  $('#bookingText').textContent = L(site.booking, 'text');
  $('#bookingBtn').textContent = L(site.booking, 'button');
  $('#bookingBtn').href = safeUrl(site.booking.link) || '#';

  observeReveal();
  markPlaying();
}

function renderShows(shows, insta) {
  const today = new Date().toISOString().slice(0, 10);
  const day = s => String(s.date || '').slice(0, 10);
  const upcoming = shows.filter(s => day(s) >= today).sort((a, b) => day(a).localeCompare(day(b)));
  const past = shows.filter(s => day(s) && day(s) < today).sort((a, b) => day(b).localeCompare(day(a)));
  const follow = esc(safeUrl(insta) || '#');

  const row = (s, isPast) => {
    const d = new Date(day(s) + 'T12:00:00');
    const link = safeUrl(s.tickets);
    const el = document.createElement('div');
    el.className = 'show reveal' + (isPast ? ' past' : '');
    el.innerHTML = `
      <div class="date">${esc(d.toLocaleDateString(t('date_locale'), { day: '2-digit', month: 'short' }).replace(/\./g, '').toUpperCase())}<small>${d.getFullYear()}</small></div>
      <div class="venue">${esc(s.venue)}</div>
      <div class="city muted">${esc(s.city)}</div>
      ${isPast ? `<span class="played">${esc(t('played'))}</span>`
               : `<a class="btn btn-primary" href="${esc(link || safeUrl(insta) || '#')}" target="_blank" rel="noopener">${esc(t(link ? 'tickets' : 'info'))}</a>`}`;
    return el;
  };

  const list = $('#showList');
  list.replaceChildren();
  if (!upcoming.length) {
    const el = document.createElement('div');
    el.className = 'show reveal';
    el.innerHTML = `<div class="date">TBA</div><div class="venue">${esc(t('tba_title'))}</div><div class="city muted">${esc(t('tba_sub'))}</div><a class="btn btn-primary" href="${follow}" target="_blank" rel="noopener">${esc(t('follow'))}</a>`;
    list.append(el);
  }
  upcoming.forEach(s => list.append(row(s, false)));
  past.forEach(s => list.append(row(s, true)));
}

function renderLegal() {
  $('#impressumText').innerHTML = prose(L(data.legal, 'impressum'));
  $('#privacyText').innerHTML = prose(L(data.legal, 'privacy'));
  // The text arrives after the browser already tried the #anchor jump, so jump again now.
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: 'instant' });
}

const isLegal = document.body.classList.contains('legal-page');

function render() {
  renderStatic();
  if (isLegal) renderLegal(); else renderHome();
}

async function load() {
  const names = isLegal ? ['site', 'legal'] : ['site', 'music', 'shows'];
  const files = await Promise.all(names.map(n =>
    fetch(`content/${n}.json`, { cache: 'no-cache' }).then(r => r.json()).catch(err => {
      console.error(`content/${n}.json could not be loaded`, err);
      return {};
    })));
  names.forEach((n, i) => { data[n] = files[i]; });
  render();
}

document.querySelectorAll('[data-lang]').forEach(b => b.addEventListener('click', () => {
  lang = b.dataset.lang;
  store.set(LANG_KEY, lang);
  render();
}));

$('#revokeConsent').addEventListener('click', () => { store.del(CONSENT_KEY); location.reload(); });

// ---- Player (SoundCloud Widget API, loaded only after consent) -------------
let widget = null;
let current = null;
let playing = false;
let pendingPlay = null;

function markPlaying() {
  document.querySelectorAll('[data-play]').forEach(el =>
    el.classList.toggle('playing', playing && el.dataset.play === current));
  const toggle = $('#pToggle');
  if (toggle) toggle.textContent = playing ? '❚❚' : '▶';
}

function createWidget(url) {
  const s = document.createElement('script');
  s.src = 'https://w.soundcloud.com/player/api.js';
  s.onload = () => {
    const f = document.createElement('iframe');
    f.allow = 'autoplay';
    f.title = 'SoundCloud';
    f.className = 'sc-hidden';
    f.src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&auto_play=true&visual=false`;
    document.body.append(f);
    widget = window.SC.Widget(f);
    const E = window.SC.Widget.Events;
    widget.bind(E.PLAY, () => { playing = true; markPlaying(); });
    widget.bind(E.PAUSE, () => { playing = false; markPlaying(); });
    widget.bind(E.FINISH, () => { playing = false; markPlaying(); });
    widget.bind(E.PLAY_PROGRESS, p => {
      $('#pProgress').style.width = (p.relativePosition * 100) + '%';
      $('#pTime').textContent = fmt(p.currentPosition);
    });
  };
  document.head.append(s);
}

function startPlayback({ url, title, artist, cover }) {
  $('#player').hidden = false;
  $('#revokeConsent').hidden = false;
  if (url === current && widget) { widget.toggle(); return; }
  current = url;
  $('#pTitle').textContent = title;
  $('#pArtist').textContent = artist;
  $('#pLink').href = url;
  $('#pProgress').style.width = '0';
  $('#pArt').removeAttribute('src');
  fillArt($('#pArt'), { url, cover });
  if (widget) widget.load(url, { auto_play: true, visual: false });
  else createWidget(url);
}

function requestPlay(track) {
  if (!track.url) return;
  if (!isSoundCloud(track.url)) { window.open(track.url, '_blank', 'noopener'); return; }
  if (hasConsent()) { startPlayback(track); return; }
  pendingPlay = track;
  $('#consentOpen').href = track.url;
  $('#consent').showModal();
}

if (!isLegal) {
  $('#consentYes').addEventListener('click', () => {
    store.set(CONSENT_KEY, 'yes');
    $('#consent').close();
    if (pendingPlay) startPlayback(pendingPlay);
    pendingPlay = null;
  });
  $('#consentNo').addEventListener('click', () => { pendingPlay = null; $('#consent').close(); });
  $('#consentOpen').addEventListener('click', () => $('#consent').close());

  const trigger = e => {
    const el = e.target.closest('[data-play]');
    if (!el) return;
    if (e.type === 'keydown' && e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    requestPlay({ url: el.dataset.play, title: el.dataset.title, artist: el.dataset.artist, cover: el.dataset.cover });
  };
  document.addEventListener('click', trigger);
  document.addEventListener('keydown', trigger);

  $('#pToggle').addEventListener('click', () => widget?.toggle());
  $('#pBar').addEventListener('click', e => {
    if (!widget) return;
    const r = e.currentTarget.getBoundingClientRect();
    widget.getDuration(d => widget.seekTo(d * (e.clientX - r.left) / r.width));
  });

  const nav = $('#nav'), burger = $('#burger'), links = $('#navLinks');
  const setMenu = open => {
    [burger, links, nav, document.body].forEach(el => el.classList.toggle(el === burger || el === links ? 'open' : 'menu-open', open));
    burger.setAttribute('aria-expanded', open);
  };
  burger.addEventListener('click', () => setMenu(!links.classList.contains('open')));
  links.addEventListener('click', e => { if (e.target.tagName === 'A') setMenu(false); });
  addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  matchMedia('(min-width: 901px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  addEventListener('scroll', () => nav.classList.toggle('scrolled', scrollY > 40), { passive: true });
}

// ---- Scroll reveal & counters ----------------------------------------------
const io = new IntersectionObserver(entries => entries.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add('in');
  const n = en.target.dataset.count;
  if (n) {
    const end = +n, t0 = performance.now();
    const step = now => {
      const k = Math.min(1, (now - t0) / 1400);
      en.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))).toLocaleString('de-DE');
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  io.unobserve(en.target);
}), { threshold: 0.15 });

function observeReveal() {
  document.querySelectorAll('.reveal:not(.in), [data-count]').forEach(el => io.observe(el));
}

load();

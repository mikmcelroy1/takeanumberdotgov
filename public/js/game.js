// Shared helpers and the game loop: level order, the timer, the start screen and the leaderboard.

const el = html => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
const wait = ms => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const fmt = ms => {
  const t = Math.max(0, Math.floor(ms / 100));
  const m = Math.floor(t / 600), s = Math.floor(t / 10) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${t % 10}`;
};

// Old-style pop-up box. Resolves with the label of the button the player pressed.
function showDialog(title, html, buttons = ['OK']) {
  return new Promise(resolve => {
    const modal = el(`
      <div class="modal">
        <div class="dialog" role="dialog" aria-label="${esc(title)}">
          <div class="dialog-title">${esc(title)}</div>
          <div class="dialog-body">${html}</div>
          <div class="dialog-buttons">${buttons.map(b => `<button type="button" class="btn">${esc(b)}</button>`).join('')}</div>
        </div>
      </div>`);
    modal.querySelectorAll('.dialog-buttons .btn').forEach(b => b.addEventListener('click', () => {
      modal.remove();
      resolve(b.textContent);
    }));
    document.body.appendChild(modal);
  });
}

// One of these shows in the yellow bar at the top of every page.
const NOTICES = [
  'NOTICE: Online services are unavailable every Saturday and Sunday for scheduled maintenance.',
  'ALERT: This Office will never ask for your PIN by email or phone. Please enter it on this website only.',
  'Due to high volume, response times may be longer than usual. Volume has been high since 1998.',
  'Reminder: The filing deadline has passed for the following townships: all of them.',
  'Window 6 is closed on Tuesdays. Window 4 is closed. Please use Window 6.',
  'NEW! Many services are now available online during regular business hours.',
];

// Leaderboard. Online it uses the shared scoreboard at /api/scores (functions/api/scores.js).
// When that is not reachable, as on the plain local test server, it uses a list kept in this browser.
const Board = {
  KEY: 'ptan-leaderboard-v1',
  online: null,    // true once /api/scores answers; false when falling back to this browser's list

  local() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  saveLocal(entry) {
    const list = this.local();
    list.push({ name: entry.name, ms: entry.ms, date: new Date().toLocaleDateString() });
    list.sort((a, b) => a.ms - b.ms);
    try { localStorage.setItem(this.KEY, JSON.stringify(list.slice(0, 50))); } catch {}
  },

  // Draws the heading and the top 10 into `slot`.
  async fill(slot) {
    slot.innerHTML = '<h3>Fastest times</h3><p class="muted">Loading…</p>';
    let list;
    try {
      const r = await fetch('/api/scores', { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      list = (await r.json()).map(e => ({ name: e.name, ms: e.ms, date: new Date(e.created_at.replace(' ', 'T') + 'Z').toLocaleDateString() }));
      this.online = true;
    } catch {
      list = this.local().slice(0, 10);
      this.online = false;
    }
    const heading = `<h3>Fastest times${this.online ? '' : ' (this computer only)'}</h3>`;
    slot.innerHTML = heading + (list.length
      ? `<table class="board"><tr><th>#</th><th>Initials</th><th>Time</th><th>Date</th></tr>${
        list.map((e, i) => `<tr><td>${i + 1}</td><td>${esc(e.name)}</td><td>${fmt(e.ms)}</td><td>${esc(e.date)}</td></tr>`).join('')
      }</table>`
      : '<p class="muted">No times recorded yet.</p>');
  },

  // Saves a run. Returns null when saved, or the reason it was turned down.
  async add(entry) {
    if (this.online === false) { this.saveLocal(entry); return null; }
    try {
      const r = await fetch('/api/scores', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(entry) });
      if (r.ok) return null;
      return (await r.json().catch(() => ({}))).error || `Error ${r.status}`;
    } catch {
      this.saveLocal(entry);
      return null;
    }
  },
};

// How many random levels each run plays after "Before You Begin".
const RANDOM_LEVELS = 3;

const Game = {
  levels: [],      // every level, in the order the files are loaded; numbers in ?level= count from 1 in this order
  run: [],         // the levels this run plays, in order
  idx: -1,
  runId: 0,        // bumped on every restart so late callbacks from an old run are ignored
  runStart: 0,
  levelStart: 0,
  splits: [],
  practice: false, // true when the levels came from ?level=; not saved to the leaderboard
  timer: null,

  register(level) { this.levels.push(level); },

  boot() {
    document.getElementById('restart').addEventListener('click', () => {
      if (this.inRun()) Analytics.track('Run Abandoned', { ...this.where(), how: 'Restart button' });
      this.showSplash();
    });
    document.querySelectorAll('.gov-nav a, .gov-footer a').forEach(a => a.addEventListener('click', e => {
      e.preventDefault();
      alert('This page is temporarily unavailable. Please try again during regular business hours.');
    }));
    document.getElementById('crumbs').addEventListener('click', e => e.preventDefault());

    // ?level=address, ?level=3 or ?level=pin,human plays just those levels, in that order, as a practice run.
    const chosen = this.fromParam(new URLSearchParams(location.search).get('level'));
    if (chosen.length) this.start(chosen, true);
    else this.showSplash();
  },

  // Turns "pin,3,address" into level objects. Unknown names and numbers are skipped.
  fromParam(value) {
    if (!value) return [];
    return value.split(',').map(v => v.trim().toLowerCase()).map(v =>
      /^\d+$/.test(v) ? this.levels[Number(v) - 1] : this.levels.find(l => l.id === v),
    ).filter(Boolean);
  },

  // True while a run is being played (between Take a Number and the finish screen).
  inRun() { return this.idx >= 0 && this.idx < this.run.length && this.timer !== null; },

  // Properties that say where the player is, added to every event sent during a run.
  where() {
    const level = this.run[this.idx];
    return {
      level: level?.id,
      page_number: this.idx + 1,
      practice: this.practice,
      seconds_on_page: Math.round((performance.now() - this.levelStart) / 100) / 10,
    };
  },

  // Levels call this when the player gets something wrong. `code` is the error code the page
  // shows (or null), `reason` is a plain description the player never sees. See README.md.
  mistake(code, reason, details = {}) {
    Analytics.track('Mistake Made', { ...this.where(), code, reason, ...details });
  },

  // Before You Begin, then RANDOM_LEVELS other levels in random order.
  newRun() {
    const first = this.levels.find(l => l.id === 'intro');
    const rest = shuffle(this.levels.filter(l => l !== first)).slice(0, RANDOM_LEVELS);
    return [first, ...rest];
  },

  setChrome(levelText, crumbs) {
    document.getElementById('gb-level').textContent = levelText;
    document.getElementById('crumbs').innerHTML = crumbs
      .map((c, i) => (i < crumbs.length - 1 ? `<a href="#">${c}</a>` : `<b>${c}</b>`))
      .join(' &rsaquo; ');
    document.getElementById('notice').textContent = pick(NOTICES);
    document.querySelectorAll('.modal').forEach(m => m.remove());
    window.scrollTo(0, 0);
  },

  showSplash() {
    this.runId++;
    this.stopTimer();
    document.getElementById('timer').textContent = fmt(0);
    this.setChrome('', ['Home', 'Online Services']);
    const page = document.getElementById('page');
    page.innerHTML = `
      <div class="game-card">
        <div class="game-kicker">A game about government websites</div>
        <h1 class="game-title">Please Take a Number</h1>
        <p>Get through ${RANDOM_LEVELS + 1} government web pages as fast as you can. The clock starts when you press the button and stops when the last form is accepted.</p>
        <p>Every form works. None of them works the way you expect.</p>
        <button class="btn-take" id="begin" type="button">Take a Number</button>
        <div class="now-serving">Now serving: <b>${rnd(3, 40)}</b> · Your number: <b>${rnd(80, 99)}</b></div>
        <div class="board-slot"></div>
      </div>`;
    Board.fill(page.querySelector('.board-slot'));
    page.querySelector('#begin').addEventListener('click', () => this.start(this.newRun(), false));
    Analytics.track('Page Viewed', { page: 'start', page_title: 'Start' });
  },

  start(levels, practice) {
    this.runId++;
    this.run = levels;
    this.practice = practice;
    this.splits = [];
    this.runStart = performance.now();
    this.stopTimer();
    this.timer = setInterval(() => {
      document.getElementById('timer').textContent = fmt(performance.now() - this.runStart);
    }, 100);
    Analytics.track('Run Started', { levels: levels.map(l => l.id), practice });
    this.goTo(0);
  },

  stopTimer() { clearInterval(this.timer); this.timer = null; },

  goTo(i) {
    const level = this.run[i];
    const run = this.runId;
    this.idx = i;
    this.levelStart = performance.now();
    this.setChrome(`Page ${i + 1} of ${this.run.length}: ${level.title}${this.practice ? ' (practice)' : ''}`, level.crumbs);
    const page = document.getElementById('page');
    page.innerHTML = '';
    Analytics.track('Page Viewed', { page: level.id, page_title: level.title, page_number: i + 1, practice: this.practice });
    level.render(page, () => { if (run === this.runId && i === this.idx) this.complete(); });
  },

  complete() {
    const now = performance.now();
    this.splits.push({ title: this.run[this.idx].title, ms: now - this.levelStart });
    Analytics.track('Page Completed', this.where());
    if (this.idx + 1 < this.run.length) return this.goTo(this.idx + 1);

    this.stopTimer();
    this.runId++;
    const total = now - this.runStart;
    document.getElementById('timer').textContent = fmt(total);
    Analytics.track('Run Finished', {
      levels: this.run.map(l => l.id),
      practice: this.practice,
      total_seconds: Math.round(total / 100) / 10,
      ...Object.fromEntries(this.run.map((l, i) => [`seconds_${l.id}`, Math.round(this.splits[i].ms / 100) / 10])),
    });
    this.setChrome('Finished', ['Home', 'Online Services', 'Confirmation']);
    Analytics.track('Page Viewed', { page: 'finish', page_title: 'Finish', practice: this.practice });
    Finish.render(document.getElementById('page'), total, this.splits, this.practice, () => this.showSplash());
  },
};

// Scoreboard for the game, called by src/index.js for requests to /api/scores.
//   GET  /api/scores   returns the 10 fastest runs: [{ name, ms, created_at }]
//   POST /api/scores   adds one run: { name: "ABC", ms: 123456, levels: "intro,pin,human,sticker" }
// Scores live in the Cloudflare D1 database connected as DB (see wrangler.toml and schema.sql).
// Times are measured in the player's browser, so a determined person can still send a fake score.
// These checks only stop junk and obvious nonsense.

const PAGES_PER_RUN = 4;                 // "Before You Begin" + RANDOM_LEVELS in public/js/game.js
const MIN_MS = 20 * 1000;                // the built-in waits alone make faster runs impossible
const MAX_MS = 2 * 60 * 60 * 1000;       // 2 hours
const MAX_POSTS_PER_MINUTE = 5;          // per visitor

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
});

export async function onRequestGet({ env }) {
  const { results } = await env.DB
    .prepare('SELECT name, ms, created_at FROM scores ORDER BY ms ASC, id ASC LIMIT 10')
    .all();
  return json(results);
}

export async function onRequestPost({ request, env }) {
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Request was not valid JSON.' }, 400); }

  const name = String(body.name ?? '');
  const ms = Number(body.ms);
  const levels = String(body.levels ?? '').split(',');

  if (!/^[A-Z]{3}$/.test(name)) return json({ error: 'Initials must be 3 capital letters.' }, 400);
  if (!Number.isInteger(ms) || ms < MIN_MS || ms > MAX_MS) return json({ error: 'Time is out of range.' }, 400);
  if (levels.length !== PAGES_PER_RUN || levels[0] !== 'intro'
      || !levels.every(l => /^[a-z]{1,20}$/.test(l)) || new Set(levels).size !== levels.length) {
    return json({ error: 'Level list is not a valid run.' }, 400);
  }

  // Limit how often one visitor can post. Only a scrambled form of the IP address is stored.
  const ipHash = await sha256((request.headers.get('cf-connecting-ip') || 'unknown') + (env.IP_SALT || ''));
  const recent = await env.DB
    .prepare("SELECT COUNT(*) AS n FROM scores WHERE ip_hash = ? AND created_at > datetime('now', '-1 minute')")
    .bind(ipHash)
    .first();
  if (recent.n >= MAX_POSTS_PER_MINUTE) return json({ error: 'Too many scores. Try again in a minute.' }, 429);

  await env.DB
    .prepare('INSERT INTO scores (name, ms, levels, ip_hash) VALUES (?, ?, ?, ?)')
    .bind(name, ms, levels.join(','), ipHash)
    .run();
  return json({ ok: true }, 201);
}

async function sha256(text) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}

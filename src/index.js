// The Cloudflare Worker. Visitors to www are sent to the bare address, so every shared link
// looks the same. Requests for /api/scores go to the scoreboard; everything else is a file
// from public/, served by Cloudflare's static assets (see [assets] in wrangler.toml).
import { onRequestGet, onRequestPost } from './scores.js';

const HOME = 'takeanumberdotgov.com';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === `www.${HOME}`) {
      url.hostname = HOME;
      return Response.redirect(url.href, 301); // keeps the path and ?query, e.g. ?utm_medium=share
    }
    const { pathname } = url;
    if (pathname === '/api/scores') {
      if (request.method === 'GET') return onRequestGet({ request, env });
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};

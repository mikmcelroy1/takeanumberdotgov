// The Cloudflare Worker. Requests for /api/scores go to the scoreboard; everything else is a
// file from public/, served by Cloudflare's static assets (see [assets] in wrangler.toml).
import { onRequestGet, onRequestPost } from './scores.js';

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (pathname === '/api/scores') {
      if (request.method === 'GET') return onRequestGet({ request, env });
      if (request.method === 'POST') return onRequestPost({ request, env });
      return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, POST' } });
    }
    return env.ASSETS.fetch(request);
  },
};

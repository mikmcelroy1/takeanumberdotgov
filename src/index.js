// The Cloudflare Worker. Visitors to www are sent to the bare address, so every shared link
// looks the same. Requests for /api/scores go to the scoreboard, requests for /mp/... are
// forwarded to Mixpanel (see public/js/analytics.js), and everything else is a file from
// public/, served by Cloudflare's static assets (see [assets] in wrangler.toml).
import { onRequestGet, onRequestPost } from './scores.js';

const HOME = 'takeanumberdotgov.com';
const MIXPANEL = 'https://api-js.mixpanel.com';

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
    if (pathname.startsWith('/mp/')) return forwardToMixpanel(request, url);
    return env.ASSETS.fetch(request);
  },
};

// Sends /mp/track/?... to https://api-js.mixpanel.com/track/?... and returns Mixpanel's answer.
// X-Real-IP tells Mixpanel the visitor's IP so it can work out their city and country.
async function forwardToMixpanel(request, url) {
  const target = MIXPANEL + url.pathname.slice('/mp'.length) + url.search;
  const headers = new Headers();
  for (const name of ['content-type', 'user-agent', 'accept']) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('X-Real-IP', ip);
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  return fetch(target, { method: request.method, headers, body: hasBody ? await request.arrayBuffer() : undefined });
}

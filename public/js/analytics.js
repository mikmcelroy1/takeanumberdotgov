// Sends game events to Mixpanel (project "take-a-number").
// - The Mixpanel library is served from this site (js/vendor/), and events go to /mp on this site,
//   which src/index.js forwards to Mixpanel. Ad blockers block Mixpanel's own addresses, not ours.
// - Mixpanel's default sending address ends in /track/?verbose=..., which the EasyPrivacy block list
//   (used by uBlock Origin, Brave and others) blocks on any site. MIXPANEL_ROUTES renames the
//   addresses to /mp/e/, /mp/u/ and /mp/g/; src/index.js maps them back. Keep the two lists in step.
// - Events are only sent from LIVE_HOST, so copies of this code running anywhere else send nothing.
//   For testing on localhost, add ?track=1 to the address; those events are tagged env=local.
// - The project token below is meant to be public: it can add events, but cannot read or delete data.
// - Never send anything the player typed. Send level names, times, and the plain mistake reasons.
// Event list and the meaning of every mistake code: README.md, "Analytics".
const MIXPANEL_TOKEN = '603f7c2a604772853ef951a1937a43b2';
const MIXPANEL_LIB = '/js/vendor/mixpanel-2.84.0.min.js';
const LIVE_HOST = 'takeanumberdotgov.com';
const MIXPANEL_ROUTES = {
  track: 'e/', engage: 'u/', groups: 'g/', // renamed (see above)
  record: 'record/', flags: 'flags/', settings: 'settings/', // Mixpanel's defaults, unused by this game
};

// 'live', 'local', or null for "send nothing".
function trackingEnv(hostname, search) {
  if (hostname === LIVE_HOST) return 'live';
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(hostname);
  return local && new URLSearchParams(search).get('track') === '1' ? 'local' : null;
}

// Where this visit came from, worked out once per page load and attached to every event as
// traffic_source. Checked in this order: our share link, social, search, any other utm_medium tag,
// no referring site (direct), any other referring site. Many social apps hide the referring site,
// so links posted on social media should carry ?utm_medium=social (and utm_source=<site>).
const SOCIAL_SITES = /(^|\.)(t\.co|twitter\.com|x\.com|facebook\.com|fb\.com|instagram\.com|reddit\.com|linkedin\.com|lnkd\.in|threads\.net|bsky\.app|tiktok\.com|youtube\.com|news\.ycombinator\.com)$|mastodon/;
const SEARCH_SITES = /(^|\.)(google|bing|duckduckgo|yahoo|ecosia|kagi|baidu)\./;

function trafficSource(search, referrer, ownHost) {
  const medium = (new URLSearchParams(search).get('utm_medium') || '').toLowerCase();
  let site = '';
  try { site = referrer ? new URL(referrer).hostname.toLowerCase().replace(/^www\./, '') : ''; } catch {}
  if (site === ownHost) site = '';
  const source = medium === 'share' ? 'Shared score link'
    : medium === 'social' || SOCIAL_SITES.test(site) ? 'Social'
    : SEARCH_SITES.test(site) ? 'Search'
    : medium ? 'Other campaign'
    : !site ? 'Direct'
    : 'Other website';
  return { traffic_source: source, referring_site: site || '(none)' };
}

const Analytics = {
  enabled: false,

  init() {
    const env = trackingEnv(location.hostname, location.search);
    if (!env) return;
    this.enabled = true;

    // Mixpanel's official loader snippet (from mixpanel-browser 2.84.0), pointed at our own copy.
    window.MIXPANEL_CUSTOM_LIB_URL = MIXPANEL_LIB;
    /* eslint-disable */
    (function(e,c){if(!c.__SV){var l,h;window.mixpanel=c;c._i=[];c.init=function(q,r,f){function t(d,a){var g=a.split(".");2==g.length&&(d=d[g[0]],a=g[1]);d[a]=function(){d.push([a].concat(Array.prototype.slice.call(arguments,0)))}}var b=c;"undefined"!==typeof f?b=c[f]=[]:f="mixpanel";b.people=b.people||[];b.toString=function(d){var a="mixpanel";"mixpanel"!==f&&(a+="."+f);d||(a+=" (stub)");return a};b.people.toString=function(){return b.toString(1)+".people (stub)"};l="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set_config reset opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking start_batch_senders start_session_recording stop_session_recording people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user people.remove".split(" ");
    for(h=0;h<l.length;h++)t(b,l[h]);var n="set set_once union unset remove delete".split(" ");b.get_group=function(){function d(p){a[p]=function(){b.push([g,[p].concat(Array.prototype.slice.call(arguments,0))])}}for(var a={},g=["get_group"].concat(Array.prototype.slice.call(arguments,0)),m=0;m<n.length;m++)d(n[m]);return a};c._i.push([q,r,f])};c.__SV=1.2;var k=e.createElement("script");k.type="text/javascript";k.async=!0;k.src="undefined"!==typeof MIXPANEL_CUSTOM_LIB_URL?MIXPANEL_CUSTOM_LIB_URL:"file:"===
    e.location.protocol&&"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js".match(/^\/\//)?"https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js":"//cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=e.getElementsByTagName("script")[0];e.parentNode.insertBefore(k,e)}})(document,window.mixpanel||[]);
    /* eslint-enable */

    mixpanel.init(MIXPANEL_TOKEN, {
      api_host: `${location.origin}/mp`,
      api_routes: MIXPANEL_ROUTES,
      persistence: 'localStorage',
      track_pageview: false, // the game is one page; "Page Viewed" is sent for each game page instead
    });
    mixpanel.register({ env, ...trafficSource(location.search, document.referrer, LIVE_HOST) });
  },

  track(event, props = {}) {
    if (this.enabled) mixpanel.track(event, props);
    else console.debug('[analytics off]', event, props);
  },
};

Analytics.init();

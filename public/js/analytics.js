// Sends game events to Mixpanel (project "take-a-number").
// - The Mixpanel library is served from this site (js/vendor/), and events go to /mp on this site,
//   which src/index.js forwards to Mixpanel. Ad blockers block Mixpanel's own addresses, not ours.
// - Nothing is sent from localhost unless the address has ?track=1; then events are tagged env=local.
// - The project token below is meant to be public: it can add events, but cannot read or delete data.
// - Never send anything the player typed. Send level names, times, and the plain mistake reasons.
// Event list and the meaning of every mistake code: README.md, "Analytics".
const MIXPANEL_TOKEN = '603f7c2a604772853ef951a1937a43b2';
const MIXPANEL_LIB = '/js/vendor/mixpanel-2.84.0.min.js';

const Analytics = {
  enabled: false,

  init() {
    const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (local && new URLSearchParams(location.search).get('track') !== '1') return;
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
      persistence: 'localStorage',
      track_pageview: false, // the game is one page; "Page Viewed" is sent for each game page instead
    });
    mixpanel.register({ env: local ? 'local' : 'live' });
  },

  track(event, props = {}) {
    if (this.enabled) mixpanel.track(event, props);
    else console.debug('[analytics off]', event, props);
  },
};

Analytics.init();

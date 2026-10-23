# Please Take a Number

A timed game of deliberately bad government web pages. Plain HTML and JavaScript, no build step.

Live at https://takeanumberdotgov.com (once deployed). Hosted as a Cloudflare Worker; the scoreboard is a Cloudflare D1 database. Every push to `main` on GitHub rebuilds and updates the live site.

## Folders

- `public/` is the website itself: everything in it is published.
- `src/index.js` is the Worker: it sends `/api/scores` to the scoreboard (`src/scores.js`) and serves everything else from `public/`.
- `schema.sql` creates the scoreboard table. `wrangler.toml` holds the Cloudflare settings.

## Run it locally

With the scoreboard (needs Node; run `npm install` once, then `npm run db:local` once to create the local table):

```bash
npm run dev
```

Then open http://localhost:8788. Scores go into a local copy of the database in `.wrangler/`, not the real one.

Without the scoreboard (just Python):

```bash
python3 serve.py 8731
```

Then open http://localhost:8731. The leaderboard falls back to a list kept in your browser. `serve.py` also tells the browser not to keep old copies of files, so edits show up on a normal reload.

## Scoreboard rules

`src/scores.js` only saves a score if the initials are 3 capital letters, the time is between 20 seconds and 2 hours, and the level list is a real run (4 different levels, Before You Begin first). Each visitor can post 5 scores a minute. IP addresses are only stored in scrambled form, for that limit. Times are measured in the player's browser, so these checks stop junk, not a determined cheater. If you change `RANDOM_LEVELS`, change `PAGES_PER_RUN` in the scoreboard script to match.

## How a run works

Every run plays **Before You Begin** first, then 3 levels picked at random from all the others, in random order (4 pages in total). The number of random levels is `RANDOM_LEVELS` in `public/js/game.js`.

## Levels

Each level has a permanent short name. The number is its place in the load order in `public/index.html`.

| # | Name | Title | File |
|---|------|-------|------|
| 1 | `intro` | Before You Begin (always first) | `public/js/levels/intro.js` |
| 2 | `pin` | Property Lookup | `public/js/levels/pin.js` |
| 3 | `human` | Are You Human? | `public/js/levels/captcha.js` |
| 4 | `address` | Mailing Address | `public/js/levels/address.js` |
| 5 | `sticker` | City Vehicle Sticker | `public/js/levels/sticker.js` |

## Leaderboard link

The footer's **Fastest Times** link opens the top 10 in a pop-up box over the current page. During a run the clock keeps going while it is open. https://takeanumberdotgov.com/#fastest-times opens the box directly, for sharing.

## Testing one level

Add `?level=` to the address to play only the levels you name, in that order. These runs are marked "practice" and their times are not saved to the leaderboard.

- http://localhost:8731/?level=address plays only the Mailing Address level.
- http://localhost:8731/?level=4 does the same, by number.
- http://localhost:8731/?level=pin,sticker plays Property Lookup, then City Vehicle Sticker.

## Adding a level

1. Create `public/js/levels/<name>.js` with `Game.register({ id: '<name>', title, crumbs, render(page, done) { ... } })`. Call `done()` when the player finishes the level.
2. Add a `<script>` line for it in `public/index.html`, after the other levels, so the existing numbers do not change.
3. Add a row to the table above.

The new level is then in the random pool automatically.

## Analytics

Events go to the Mixpanel project **take-a-number** (id 4074309). The browser loads Mixpanel's library from `public/js/vendor/` and sends events to `/mp/...` on this site, which `src/index.js` forwards to Mixpanel, so ad blockers don't drop them. The sending addresses are renamed to `/mp/e/`, `/mp/u/` and `/mp/g/` (`MIXPANEL_ROUTES` in `public/js/analytics.js`, mapped back by `MIXPANEL_PATHS` in `src/index.js`), because Mixpanel's default `/track/?verbose=` address is blocked on every site by the EasyPrivacy list that uBlock Origin and Brave use. Events are only sent from takeanumberdotgov.com (`LIVE_HOST` in `public/js/analytics.js`), so a copy of this code running anywhere else sends nothing. To test on localhost, add `?track=1` to the address; those events are tagged `env = local`, live ones `env = live`. Nothing the player types is ever sent.

Every event carries Mixpanel's automatic details (browser, device, city and country, the page address, and any `utm_` tags such as `utm_medium=share`), plus `traffic_source` (Shared score link, Social, Search, Other campaign, Direct or Other website) and `referring_site`, worked out once per page load by `trafficSource()` in `public/js/analytics.js`. Many social apps hide the referring site, so when posting the game on social media, use a link like `https://takeanumberdotgov.com/?utm_source=reddit&utm_medium=social`. Events during a run also carry `level`, `page_number`, `practice` and `seconds_on_page`.

| Event | Sent when | Extra details |
|---|---|---|
| Page Viewed | Any page appears: the start screen, each level, the finish screen | `page` (`start`, a level name, or `finish`), `page_title`; on level pages also `level`, `page_number` |
| Run Started | "Take a Number" is pressed, or a `?level=` test link opens | `levels` (in order), `practice` |
| Page Completed | A page is accepted | where the player is (see above) |
| Mistake Made | The player gets something wrong (table below) | `code`, `reason`, plus details per level |
| Run Finished | The last page is accepted | `total_seconds`, `levels`, `seconds_<level>` for each level |
| Run Abandoned | Restart is pressed during a run | where the player was |
| Standards PDF Closed | The address level's PDF is closed | `furthest_page`, `reached_suffix_table` |
| Initials Submitted | The Board of Ethics review ends | `approved`, `reason` if denied |
| Share Clicked | Share Score is pressed | `method` (`copy` or `share menu`), `completed` |
| Leaderboard Viewed | The footer's Fastest Times link is pressed, or someone opens takeanumberdotgov.com/#fastest-times | `from` (`footer` or `link`), `in_run`, and where the player was if in a run |

### Mistakes

`code` is what the page shows the player (some levels show none). `reason` is a plain description the player never sees.

| Level | Code | Reason sent | Extra details |
|---|---|---|---|
| intro | 503-B | Followed a link, which unchecked the terms box | `link`, `box_was_checked` |
| pin | (none) | Tried to paste the PIN | |
| pin | PTX-0417 | Left N boxes empty, or Typed a wrong digit | `boxes_empty`, `digits_wrong` |
| human | (none) | Missed a two-flat / Picked a bungalow, etc. (round 1); Missed an alderman / Picked a governor / Picked a mayor (round 2) | `round`, `missed`, `wrongly_picked`, `try_number` |
| address | ADR-22 | Typed AVE (the postal abbreviation) instead of AV; or Wrong or empty: (field list) | `wrong_fields`, `suffix_typed` (AV, AVE, AVENUE, blank or other), `county_picked` |
| sticker | E-101 | Left the plate empty | |
| sticker | E-102 | Typed the plate with a space or dash | |
| sticker | E-103 | Typed a plate that does not match the card | |
| sticker | E-401 | Did not pick a classification | |
| sticker | E-387 | Left the weight empty | |
| sticker | E-388 | Typed the gross weight (GVWR), or some other number, instead of the curb weight | `weight_typed` |
| sticker | E-411 | Picked classification X instead of P | `class_picked` |
| sticker | E-569 | Did not answer the senior question | |
| sticker | E-570 | Said yes to the senior rate (owner was born in 1979) | |
| sticker | E-639 | Did not pick a sticker period | |
| sticker | E-640 | Picked the 4-month prorated sticker | |
| sticker | E-641 | Picked the discontinued 24-month sticker | |
| sticker | E-900 | Did not check the residency box | |

The sticker form shows only the first error it finds, so one submit sends one sticker mistake. The address form checks every field, so one submit sends one mistake listing all wrong fields.

## Photos

The alderman photos in `public/img/alders/` come from the City of Chicago's Ward Offices dataset (data.cityofchicago.org, dataset `htai-wnw4`). The governor and mayor photos in `public/img/officials/` come from Wikimedia Commons. Names, licenses and sources are in `public/js/officials.js`, and the game shows the credits from the ⓘ button in the picture test. Keep the credits if the game is published.

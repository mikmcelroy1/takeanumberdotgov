# Please Take a Number

A timed game of deliberately bad government web pages. Plain HTML and JavaScript, no build step.

Live at https://takeanumberdotgov.com (once deployed). Hosted on Cloudflare Pages; the scoreboard is a Cloudflare D1 database.

## Folders

- `public/` is the website itself: everything in it is published.
- `functions/api/scores.js` is the scoreboard script. Cloudflare runs it at `/api/scores`.
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

`functions/api/scores.js` only saves a score if the initials are 3 capital letters, the time is between 20 seconds and 2 hours, and the level list is a real run (4 different levels, Before You Begin first). Each visitor can post 5 scores a minute. IP addresses are only stored in scrambled form, for that limit. Times are measured in the player's browser, so these checks stop junk, not a determined cheater. If you change `RANDOM_LEVELS`, change `PAGES_PER_RUN` in the scoreboard script to match.

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

## Photos

The alderman photos in `public/img/alders/` come from the City of Chicago's Ward Offices dataset (data.cityofchicago.org, dataset `htai-wnw4`). The governor and mayor photos in `public/img/officials/` come from Wikimedia Commons. Names, licenses and sources are in `public/js/officials.js`, and the game shows the credits from the ⓘ button in the picture test. Keep the credits if the game is published.

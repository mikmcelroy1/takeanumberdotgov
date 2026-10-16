// Level 2: the "I am not a robot" picture test.
// Round 1: select every two-flat (greystone two-flats count; three-flats do not).
// Round 2: select every alderman. The 50 current aldermen use the City's official photos, which all
// look alike; the wrong answers are convicted former governors and mayors from Wikimedia Commons.
// A wrong answer draws a new set of pictures. After two wrong answers in a round a hint appears,
// and after three the photos get name labels.
Game.register({
  id: 'human',
  title: 'Are You Human?',
  crumbs: ['Home', 'Online Services', 'Identity Verification'],

  render(page, done) {
    const ROUNDS = [
      {
        prompt: 'a two-flat',
        sub: 'Click verify once there are none left.',
        hint: 'A two-flat has exactly two apartments stacked on top of each other. Brick or greystone.',
        build: () => drawnGrid(
          [() => Art.walkup(2, false), () => Art.walkup(2, true)],
          [Art.bungalow, Art.cottage, () => Art.walkup(3, false), () => Art.walkup(3, true)],
          rnd(2, 4),
          [() => Art.walkup(2, false)].concat(Math.random() < 0.7 ? [() => Art.walkup(2, true)] : []),
        ),
      },
      {
        prompt: 'an alderman',
        sub: 'Click verify once there are none left.',
        hint: 'Governors and mayors are not aldermen. Look closely: the City takes every alderman\'s photo the same way.',
        build: photoGrid,
      },
    ];

    // 9 drawn tiles: `nYes` correct ones (starting with `mustHave`), the rest wrong.
    function drawnGrid(yesFns, noFns, nYes, mustHave) {
      const tiles = mustHave.map(f => ({ art: f(), ok: true }));
      while (tiles.length < nYes) tiles.push({ art: pick(yesFns)(), ok: true });
      while (tiles.length < 9) tiles.push({ art: pick(noFns)(), ok: false });
      return shuffle(tiles);
    }

    // 9 different people: 3 to 5 aldermen, at least one governor and one mayor, no repeats.
    function photoGrid() {
      const of = role => shuffle(OFFICIALS.filter(o => o.role === role));
      const alders = of('alder'), govs = of('governor'), mayors = of('mayor');
      const nYes = rnd(3, 5);
      const wrong = [govs[0], mayors[0], ...shuffle([...govs.slice(1), ...mayors.slice(1)])].slice(0, 9 - nYes);
      return shuffle([
        ...alders.slice(0, nYes).map(o => ({ o, ok: true })),
        ...wrong.map(o => ({ o, ok: false })),
      ]).map(({ o, ok }) => ({ ok, label: o.name, art: photo(o) }));
    }

    function photo(o) {
      const pos = o.pos || '50% 25%';
      const zoom = o.zoom ? `transform:scale(${o.zoom});transform-origin:${pos};` : '';
      return `<div class="ph"><img src="${o.src}" alt="" style="object-position:${pos};${zoom}"></div>`;
    }

    page.innerHTML = `
      <h1>Identity Verification</h1>
      <p class="lede">To protect residents from automated submissions, all users must confirm that they are a human resident before continuing.</p>
      <p>This verification is required once per session. Sessions expire after 15 minutes of inactivity or when you move to a new page.</p>
      <div class="captcha">
        <div class="cap-box">
          <button type="button" class="cap-check" id="capCheck" aria-label="I am not a robot"></button>
          <span class="cap-label">I am not a robot, a bot, or a registered lobbyist</span>
          <span class="cap-brand">reCLERKcha<br>Privacy · Terms</span>
        </div>
        <div class="cap-challenge" id="capChal" hidden></div>
      </div>
      <div class="btnrow"><button type="button" class="btn" id="capContinue" disabled>Continue</button></div>`;

    const check = page.querySelector('#capCheck');
    const chal = page.querySelector('#capChal');
    const cont = page.querySelector('#capContinue');
    const fails = [0, 0];
    let round = 0, tiles = [], state = 'idle';

    function showRound(msg = '') {
      const r = ROUNDS[round];
      const labels = fails[round] >= 3;
      tiles = r.build();
      chal.hidden = false;
      chal.innerHTML = `
        <div class="cap-head">Select all squares with<strong>${r.prompt}</strong><span>${r.sub}</span></div>
        <div class="cap-grid">${tiles.map((t, i) => `<button type="button" class="cap-tile" data-i="${i}">${t.art}${labels && t.label ? `<span class="cap-name">${t.label}</span>` : ''}</button>`).join('')}</div>
        ${fails[round] >= 2 ? `<div class="cap-hint">${r.hint}${labels && tiles[0].label ? ' The Office has added name labels to comply with accessibility rules.' : ''}</div>` : ''}
        <div class="cap-msg">${msg}</div>
        <div class="cap-foot">
          <span class="cap-icons"><button type="button" class="cap-reload" title="Get new pictures">⟳</button><button type="button" title="Audio challenge (unavailable)">🎧</button><button type="button" class="cap-info" title="Photo credits">ⓘ</button></span>
          <button type="button" class="cap-verify">Verify</button>
        </div>`;
      chal.querySelectorAll('.cap-tile').forEach(b => b.addEventListener('click', () => b.classList.toggle('sel')));
      chal.querySelector('.cap-reload').addEventListener('click', () => showRound());
      chal.querySelector('.cap-info').addEventListener('click', showCredits);
      chal.querySelector('.cap-verify').addEventListener('click', verify);
    }

    function verify() {
      const picked = [...chal.querySelectorAll('.cap-tile')].map(b => b.classList.contains('sel'));
      if (picked.some((sel, i) => sel !== tiles[i].ok)) {
        fails[round]++;
        showRound('Please try again.');
        return;
      }
      round++;
      if (round < ROUNDS.length) { showRound(); return; }
      chal.hidden = true;
      check.classList.remove('spin');
      check.classList.add('done');
      state = 'done';
      cont.disabled = false;
    }

    check.addEventListener('click', async () => {
      if (state !== 'idle') return;
      state = 'checking';
      check.classList.add('spin');
      await wait(1800);
      check.classList.remove('spin');
      showRound();
    });

    cont.addEventListener('click', done);
  },
});

// Photo credits for every photo the game can show (the photos' licenses require them).
function showCredits() {
  const modal = el(`
    <div class="modal">
      <div class="credits">
        <div class="credits-head"><b>Photo credits</b><button type="button" class="btn">Close</button></div>
        <p class="small">Aldermen's photos are from the City of Chicago's Ward Offices dataset on data.cityofchicago.org. All other photos are from Wikimedia Commons; each one is in the public domain or used under the Creative Commons license named. Some are cropped.</p>
        <ul><li><b>All 50 aldermen.</b> City of Chicago, Ward Offices dataset. <a href="https://data.cityofchicago.org/d/htai-wnw4" target="_blank" rel="noopener">Source</a></li>${OFFICIALS.filter(o => o.role !== 'alder').map(o => `<li><b>${esc(o.name)}</b>. ${esc(o.credit)}. <a href="${o.source}" target="_blank" rel="noopener">Source</a></li>`).join('')}</ul>
      </div>
    </div>`);
  modal.querySelector('button').addEventListener('click', () => modal.remove());
  document.body.appendChild(modal);
}

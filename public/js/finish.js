// End screen: total time, time per level, and the deliberately bad initials entry for the leaderboard.
const Finish = {
  render(page, total, splits, practice, onAgain) {
    page.innerHTML = `
      <div class="game-card">
        <div class="game-kicker">All forms accepted</div>
        <div class="big-time">${fmt(total)}</div>
        <table class="splits">${splits.map((s, i) => `<tr><td>Page ${i + 1}</td><td>${s.title}</td><td>${fmt(s.ms)}</td></tr>`).join('')}</table>
        <button class="btn-share" id="share" type="button">Share Score</button>
        ${practice
          ? '<p class="muted">This was a practice run, so the time is not saved.</p>'
          : '<div id="nameEntry" class="name-entry"></div>'}
        <div id="board" class="board-slot"></div>
        <button class="btn-take" id="again" type="button">Take Another Number</button>
      </div>`;
    Board.fill(page.querySelector('#board'));
    page.querySelector('#again').addEventListener('click', onAgain);
    const shareBtn = page.querySelector('#share');
    shareBtn.addEventListener('click', () => this.share(shareBtn, total, splits, practice));
    if (!practice) this.nameEntry(page.querySelector('#nameEntry'), total, page.querySelector('#board'));
  },

  // The text that gets shared or copied. The link to the start page goes last.
  shareText(total, splits, practice) {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('utm_medium', 'share');
    return [
      'Please Take a Number 🎟️',
      `Completed ${splits.length} government web page${splits.length === 1 ? '' : 's'} in ${fmt(total)}${practice ? ' - practice run' : ''}`,
      '',
      ...splits.map((s, i) => `${i + 1}. ${s.title}: ${fmt(s.ms)}`),
      '',
      url.href,
    ].join('\n');
  },

  // Phones and tablets open the system share sheet. Computers copy the text to the clipboard.
  async share(btn, total, splits, practice) {
    const text = this.shareText(total, splits, practice);
    const ua = navigator.userAgent;
    const isMobile = navigator.userAgentData?.mobile
      || /Android|iPhone|iPad|iPod|Mobi/i.test(ua)
      || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1); // iPads report themselves as Macs
    if (isMobile && navigator.share) {
      let completed = true;
      try { await navigator.share({ text }); } catch { completed = false; } // closing the share sheet throws
      Analytics.track('Share Clicked', { method: 'share menu', completed, practice });
      return;
    }
    let copied = false;
    try { await navigator.clipboard.writeText(text); copied = true; } catch {
      // Older browsers, or pages not on https: copy through a hidden text box.
      const ta = el('<textarea style="position:fixed;opacity:0"></textarea>');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { copied = document.execCommand('copy'); } catch {}
      ta.remove();
    }
    Analytics.track('Share Clicked', { method: 'copy', completed: copied, practice });
    btn.textContent = copied ? 'Copied to clipboard' : 'Could not copy';
    setTimeout(() => { btn.textContent = 'Share Score'; }, 2000);
  },

  // One button moves the letter forward (A to Z, then back to A) after a short delay.
  // Another accepts it. There is no way to go back a letter or fix an accepted one.
  nameEntry(box, total, boardBox) {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const chars = [0, null, null];
    let slot = 0;

    box.innerHTML = `
      <h3>Register Your Initials for the Public Record</h3>
      <p>Initials are entered one character at a time. Press <b>Next Character</b> to change the letter in the highlighted box. When it shows the letter you want, press <b>Accept Character</b>. Accepted characters cannot be changed.</p>
      <div class="slots">${[0, 1, 2].map(() => '<div class="slot"></div>').join('')}</div>
      <div class="btnrow center"><button type="button" class="btn" id="nextChar">Next Character ▸</button><button type="button" class="btn" id="acceptChar">Accept Character</button></div>
      <div id="review"></div>`;

    const slots = box.querySelectorAll('.slot');
    const next = box.querySelector('#nextChar');
    const accept = box.querySelector('#acceptChar');
    const draw = () => slots.forEach((s, i) => {
      s.textContent = chars[i] === null ? '' : LETTERS[chars[i]];
      s.classList.toggle('active', i === slot);
    });
    draw();

    next.addEventListener('click', async () => {
      next.disabled = accept.disabled = true;
      await wait(300);
      chars[slot] = (chars[slot] + 1) % LETTERS.length;
      draw();
      next.disabled = accept.disabled = false;
    });

    accept.addEventListener('click', async () => {
      slot++;
      if (slot < 3) { chars[slot] = 0; draw(); return; }
      draw();
      box.querySelector('.btnrow').remove();
      const name = chars.map(c => LETTERS[c]).join('');
      const review = box.querySelector('#review');
      review.innerHTML = `
        <p>Your initials have been submitted to the Board of Ethics for review.</p>
        <div class="progress"><div></div></div>
        <p class="muted" id="reviewMsg">Checking for conflicts of interest…</p>`;
      const bar = review.querySelector('.progress div');
      const msg = review.querySelector('#reviewMsg');
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.width = '100%'; }));
      await wait(1500); msg.textContent = 'Consulting the Inspector General…';
      await wait(1500); msg.textContent = 'Waiting for a quorum…';
      const [problem] = await Promise.all([
        Board.add({ name, ms: Math.round(total), levels: Game.run.map(l => l.id).join(',') }),
        wait(1700),
      ]);
      Analytics.track('Initials Submitted', { approved: !problem, reason: problem || null, total_seconds: Math.round(total / 100) / 10 });
      if (problem) {
        review.innerHTML = `<div class="errorbox">Denied. The Board of Ethics has rejected your initials.<br><span style="font-weight:normal">Reason given: ${esc(problem)}</span></div>`;
        return;
      }
      await Board.fill(boardBox);
      review.innerHTML = `<div class="okbox">Approved. ${name} has been entered into the public record.</div>`;
    });
  },
};

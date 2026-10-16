// Level 1: enter a 14-digit PIN, one digit per box, one box per line.
// The cursor never moves to the next box by itself, pasting is blocked, the Tab key jumps to a
// random box (and now and then to "Clear Form"), and the error message appears at the top of the page.
Game.register({
  id: 'pin',
  title: 'Property Lookup',
  crumbs: ['Home', 'Property Taxes', 'Online Services', 'Property Lookup (Beta)'],

  render(page, done) {
    const pin = String(rnd(1, 33)).padStart(2, '0') + Array.from({ length: 12 }, () => rnd(0, 9)).join('');
    const shown = `${pin.slice(0, 2)}-${pin.slice(2, 4)}-${pin.slice(4, 7)}-${pin.slice(7, 10)}-${pin.slice(10)}`;

    const rows = Array.from({ length: 14 }, (_, i) => `
      <div class="pin-row">
        <label for="d${i}">Digit ${i + 1} of 14${i === 10 ? ' (optional)*' : ''}</label>
        <input type="text" id="d${i}" maxlength="1" inputmode="numeric" autocomplete="off">
      </div>`).join('');

    page.innerHTML = `
      <div class="errorbox" id="pinErr" hidden></div>
      <h1>Property Lookup</h1>
      <p class="lede">Use this service to look up the assessed valuation, exemption status, tax rate, tax code, township, neighborhood code, classification, building characteristics, and payment history of a property located in the County.</p>
      <h3>Before you begin</h3>
      <p>You will need your 14-digit Property Index Number (PIN). Your PIN appears on your property tax bill, your assessment notice, your deed, your mortgage documents, and certain other letters from this Office. If you do not know your PIN, you may request it in person at Window 6 during regular business hours.</p>
      <p>Searching by address is not available at this time.</p>
      <div class="two-col">
        <aside class="paper sticky">
          <div class="paper-head">FROM YOUR TAX BILL</div>
          <div class="paper-label">PROPERTY INDEX NUMBER</div>
          <div class="paper-big">${shown}</div>
          <div class="paper-small">2nd Installment 2025 · Tax Code 77031 · Vol. 488</div>
        </aside>
        <form id="pinForm" class="govform" autocomplete="off" novalidate>
          <fieldset>
            <legend>Property Index Number (PIN)</legend>
            <p class="hint">Format: XX-XX-XXX-XXX-XXXX. Enter one digit per box. Do not enter dashes.</p>
            ${rows}
            <p class="footnote">* Required.</p>
            <p class="small red" id="pasteMsg" hidden>Pasting is disabled for your security.</p>
          </fieldset>
          <div class="btnrow">
            <button type="button" class="btn" id="clearBtn">Clear Form</button>
            <button type="submit" class="btn" id="verifyBtn">Verify PIN</button>
          </div>
        </form>
      </div>`;

    const form = page.querySelector('#pinForm');
    const inputs = [...form.querySelectorAll('input')];
    const err = page.querySelector('#pinErr');
    const pasteMsg = page.querySelector('#pasteMsg');
    const verify = page.querySelector('#verifyBtn');

    inputs.forEach(input => {
      input.addEventListener('input', () => { input.value = input.value.replace(/\D/g, '').slice(-1); });
      input.addEventListener('paste', e => { e.preventDefault(); pasteMsg.hidden = false; });
      input.addEventListener('drop', e => e.preventDefault());
      // Tab (or Shift+Tab) goes to a random other box. One time in eight it goes to Clear Form.
      input.addEventListener('keydown', e => {
        if (e.key !== 'Tab') return;
        e.preventDefault();
        if (Math.random() < 0.125) { page.querySelector('#clearBtn').focus(); return; }
        pick(inputs.filter(i => i !== input)).focus();
      });
    });

    page.querySelector('#clearBtn').addEventListener('click', () => {
      inputs.forEach(i => { i.value = ''; });
      err.hidden = true;
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      verify.disabled = true;
      verify.innerHTML = '<span class="spinner"></span>Verifying…';
      await wait(2200);
      if (inputs.map(i => i.value).join('') === pin) {
        form.outerHTML = '<div class="okbox">PIN verified. Retrieving property record…</div>';
        await wait(1200);
        done();
        return;
      }
      err.textContent = 'ERROR PTX-0417: The PIN you entered could not be validated. Please review your entry and try again.';
      err.hidden = false;
      verify.disabled = false;
      verify.textContent = 'Verify PIN';
    });
  },
});

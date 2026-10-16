// Level 4: city vehicle sticker.
// The vehicle classification list has about 30 entries. Only some of them say what weight they
// cover. The obvious choice ("SUV") is wrong because it secretly covers only vehicles over 4,500 lbs.
// The right answer is "P", with the curb weight (not the gross weight). Errors are shown one at a time.
Game.register({
  id: 'sticker',
  title: 'City Vehicle Sticker',
  crumbs: ['Home', 'Residents', 'Vehicles', 'City Vehicle Sticker', 'Purchase'],

  render(page, done) {
    const [make, model] = pick([['HONDA', 'CR-V'], ['TOYOTA', 'RAV4'], ['FORD', 'ESCAPE'], ['MAZDA', 'CX-5']]);
    const year = rnd(2012, 2021);
    const curb = rnd(3300, 3700);
    const gvwr = Math.max(4560, curb + rnd(1050, 1300));
    const L = 'ABCDEFGHJKLMNPRSTUVWXYZ';
    const plate = `${pick([...L])}${pick([...L])} ${rnd(10000, 99999)}`;
    const plateNoSpace = plate.replace(' ', '');
    const n = x => x.toLocaleString('en-US');

    // [code, label] in the order they appear. Only "P" is right for this vehicle.
    const CLASSES = [
      ['MB', '01-A  MB – MOTORCYCLE / MOTOR DRIVEN CYCLE'],
      ['MP', '01-B  MP – MOPED'],
      ['AM', '02    AM – ANTIQUE MOTORCYCLE'],
      ['TR', '03-A  TR – TRAILER (GVWR 3,000 LBS OR LESS)'],
      ['TL', '03-B  TL – TRAILER (GVWR OVER 3,000 LBS)'],
      ['ST', '04    ST – SMALL TRUCK (GVWR 16,000 LBS OR LESS)'],
      ['LT', '05    LT – LARGE TRUCK (GVWR OVER 16,000 LBS)'],
      ['SUV', '06    SUV – SPORT UTILITY VEHICLE'],
      ['PV', '07    PV – PASSENGER VAN'],
      ['RVA', '08-A  RV-A – RECREATIONAL VEHICLE, MOTOR HOME CLASS A'],
      ['RVB', '08-B  RV-B – RECREATIONAL VEHICLE, MOTOR HOME CLASS B'],
      ['RVC', '08-C  RV-C – RECREATIONAL VEHICLE, MOTOR HOME CLASS C'],
      ['AP', '09    AP – ANTIQUE PASSENGER VEHICLE (25+ YEARS)'],
      ['CV', '10    CV – COMMERCIAL VEHICLE'],
      ['TX', '11-A  TX – TAXICAB (MEDALLION)'],
      ['LV', '11-B  LV – LIVERY VEHICLE'],
      ['TNP', '11-C  TNP – TRANSPORTATION NETWORK PROVIDER VEHICLE'],
      ['HE', '12    HE – HEARSE / FUNERAL COACH'],
      ['FV', '13    FV – FARM VEHICLE'],
      ['BUS', '14    BUS – BUS (CHURCH OR SCHOOL)'],
      ['PV2', '15    PV2 – PASSENGER VEHICLE (SEE NOTE 4)'],
      ['EV', '16    EV – ELECTRIC VEHICLE (BATTERY)'],
      ['HB', '17    HB – HYBRID PASSENGER VEHICLE'],
      ['DV', '18    DV – DISABLED VETERAN'],
      ['PS', '19    PS – PASSENGER VEHICLE – SENIOR'],
      ['SP', '20    SP – SPECIAL PURPOSE VEHICLE'],
      ['P', '21-C  P – PASSENGER VEHICLE (CURB WT. 4,500 LBS OR LESS)'],
      ['LP', '21-D  LP – LARGE PASSENGER VEHICLE (CURB WT. OVER 4,500 LBS)'],
      ['GC', '22    GC – GOLF CART / LOW SPEED VEHICLE'],
      ['SN', '23    SN – SNOWMOBILE'],
      ['X', '99    X – OTHER / NOT LISTED'],
    ];

    page.innerHTML = `
      <div class="errorbox" id="stkErr" hidden></div>
      <h1>Purchase a City Vehicle Sticker</h1>
      <p class="lede">Every vehicle registered to a City address must display a valid City Vehicle Sticker. Stickers are valid from July 1 through June 30, or for 12 months from the date of purchase, whichever applies.</p>
      <p>Have your vehicle registration card ready. The fee depends on the vehicle classification you select. Selecting an incorrect classification may result in a citation, a late fee, a citation for the late fee, and suspension of your sticker.</p>
      <div class="two-col">
        <aside class="regcard">
          <div class="rc-title">VEHICLE REGISTRATION ID CARD</div>
          <dl>
            <dt>PLATE</dt><dd>${plate}</dd>
            <dt>EXPIRES</dt><dd>03/2027</dd>
            <dt>OWNER</dt><dd>RESIDENT, A.</dd>
            <dt>DOB</dt><dd>04/11/1979</dd>
            <dt>YR/MAKE</dt><dd>${year} ${make}</dd>
            <dt>MODEL</dt><dd>${model}</dd>
            <dt>BODY</dt><dd>SUV</dd>
            <dt>FUEL</dt><dd>GAS</dd>
            <dt>CURB WT</dt><dd>${n(curb)} LBS</dd>
            <dt>GVWR</dt><dd>${n(gvwr)} LBS</dd>
          </dl>
        </aside>
        <form id="stkForm" class="govform" autocomplete="off" novalidate>
          <fieldset>
            <legend>Vehicle Information</legend>
            <div class="field"><label for="sPlate">License Plate Number</label><input type="text" id="sPlate" name="plate" size="12">
              <div class="hint">Enter without spaces or dashes.</div></div>
            <div class="field"><label for="sClass">Vehicle Classification</label>
              <select id="sClass" name="cls"><option value="">-- Select Classification --</option>${CLASSES.map(([c, label]) => `<option value="${c}">${label}</option>`).join('')}</select></div>
            <div class="field"><label for="sWeight">Vehicle Weight (lbs)</label><input type="text" id="sWeight" name="weight" size="8"></div>
          </fieldset>
          <fieldset>
            <legend>Applicant Information</legend>
            <div class="field"><span class="label">Are you applying for the Senior Citizen (65+) rate?</span>
              <label class="radio"><input type="radio" name="senior" value="yes"> Yes</label>
              <label class="radio"><input type="radio" name="senior" value="no"> No</label></div>
            <div class="field"><label for="sPeriod">Sticker Period</label>
              <select id="sPeriod" name="period"><option value="">-- Select --</option><option value="12">12-MONTH STICKER</option><option value="4">4-MONTH STICKER (PRORATED)*</option><option value="24">24-MONTH STICKER (DISCONTINUED)</option></select>
              <div class="hint">* Available only to residents who moved to the City, or bought the vehicle, within the last 30 days.</div></div>
            <div class="field"><label for="sZone">Residential Parking Zone # (if applicable)</label><input type="text" id="sZone" name="zone" size="6"></div>
            <div class="field"><label class="radio"><input type="checkbox" name="certify" value="1"> I certify that this vehicle is registered to an address within the City.</label></div>
          </fieldset>
          <div class="btnrow"><button type="submit" class="btn" id="stkSubmit">Continue to Payment</button></div>
        </form>
      </div>`;

    const form = page.querySelector('#stkForm');
    const err = page.querySelector('#stkErr');
    const submit = page.querySelector('#stkSubmit');

    // Every error this form can show: [message the player sees, plain meaning sent to analytics].
    // README.md has the same table.
    const ERRORS = {
      'E-101': ['License plate number is required.', 'Left the plate empty'],
      'E-102': ['Invalid license plate format.', 'Typed the plate with a space or dash'],
      'E-103': ['License plate not found in Secretary of State records.', 'Typed a plate that does not match the card'],
      'E-401': ['Vehicle classification is required.', 'Did not pick a classification'],
      'E-387': ['Vehicle weight is required.', 'Left the weight empty'],
      'E-388': ['Vehicle weight does not match records on file.', 'Typed a weight that is not the curb weight'],
      'E-411': ['Vehicle weight does not correspond to the selected classification.', 'Picked a classification other than P'],
      'E-569': ['Please indicate whether you are applying for the Senior Citizen rate.', 'Did not answer the senior question'],
      'E-570': ['Applicant does not meet age requirement.', 'Said yes to the senior rate (owner was born in 1979)'],
      'E-639': ['Sticker period is required.', 'Did not pick a sticker period'],
      'E-640': ['Applicant is not eligible for a prorated sticker.', 'Picked the 4-month prorated sticker'],
      'E-641': ['This option has been discontinued.', 'Picked the discontinued 24-month sticker'],
      'E-900': ['You must certify your residency.', 'Did not check the residency box'],
    };

    // Returns the first problem only: { code, details } or null.
    function firstError(f) {
      const p = (f.plate || '').trim().toUpperCase();
      if (!p) return { code: 'E-101' };
      if (/[\s-]/.test(p)) return { code: 'E-102' };
      if (p !== plateNoSpace) return { code: 'E-103' };
      if (!f.cls) return { code: 'E-401' };
      const w = (f.weight || '').replace(/[,\s]|lbs?\.?/gi, '');
      if (!w) return { code: 'E-387' };
      if (Number(w) !== curb) {
        const typed = Number(w) === gvwr ? 'gross weight (GVWR)' : 'some other number';
        return { code: 'E-388', reason: `Typed the ${typed} instead of the curb weight`, details: { weight_typed: typed } };
      }
      if (f.cls !== 'P') return { code: 'E-411', reason: `Picked classification ${f.cls} instead of P`, details: { class_picked: f.cls } };
      if (!f.senior) return { code: 'E-569' };
      if (f.senior === 'yes') return { code: 'E-570' };
      if (!f.period) return { code: 'E-639' };
      if (f.period === '4') return { code: 'E-640' };
      if (f.period === '24') return { code: 'E-641' };
      if (!f.certify) return { code: 'E-900' };
      return null;
    }

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      submit.disabled = true;
      submit.innerHTML = '<span class="spinner"></span>Processing…';
      await wait(1200);
      const problem = firstError(f);
      if (!problem) {
        err.hidden = true;
        form.outerHTML = `<div class="okbox">Application received. Reference No. ${rnd(100000, 999999)}-${rnd(10, 99)}. Your sticker will arrive by mail in 6 to 8 weeks. Please display your expired sticker until then.</div>`;
        await wait(1500);
        done();
        return;
      }
      const [message, meaning] = ERRORS[problem.code];
      Game.mistake(problem.code, problem.reason || meaning, problem.details || {});
      err.innerHTML = `Please correct the following error before continuing:<br>${problem.code}: ${message}<br><span style="font-weight:normal">Additional errors may exist.</span>`;
      err.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Continue to Payment';
    });
  },
});

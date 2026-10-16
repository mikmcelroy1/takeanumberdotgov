// Level 3: mailing address split into many fields.
// The street suffix must be "AV" (not "Ave"). The only place that says so is page 11 of a
// 14-page "PDF" that can only be read one page at a time. The form checks nothing until you
// press Submit, and any mistake clears every field.
Game.register({
  id: 'address',
  title: 'Mailing Address',
  crumbs: ['Home', 'Residents', 'Update Your Information', 'Mailing Address'],

  render(page, done) {
    const STREETS = [
      ['N', 'Milwaukee'], ['W', 'Fullerton'], ['S', 'Ashland'], ['N', 'Western'], ['W', 'Belmont'], ['W', 'Diversey'],
      ['N', 'Damen'], ['S', 'Kedzie'], ['W', 'Chicago'], ['W', 'North'], ['N', 'Kimball'], ['S', 'Wentworth'],
    ];
    const [dir, street] = pick(STREETS);
    const num = String(rnd(1000, 5999));
    const unit = pick(['2F', '1R', '3', 'G', '2', '1F', '3R']);
    const zip = pick(['60618', '60614', '60647', '60622', '60608', '60625', '60657', '60639', '60616', '60609']);

    const COUNTIES = ['Adams', 'Alexander', 'Bond', 'Boone', 'Brown', 'Bureau', 'Calhoun', 'Carroll', 'Cass', 'Champaign',
      'Christian', 'Clark', 'Clay', 'Clinton', 'Coles', 'COOK', 'Crawford', 'Cumberland', 'DeKalb', 'De Witt', 'Douglas',
      'DuPage', 'Edgar', 'Edwards', 'Effingham', 'Fayette', 'Ford', 'Franklin', 'Fulton', 'Gallatin', 'Greene', 'Grundy',
      'Hamilton', 'Hancock', 'Hardin', 'Henderson', 'Henry', 'Iroquois', 'Jackson', 'Jasper', 'Jefferson', 'Jersey',
      'Jo Daviess', 'Johnson', 'Kane', 'Kankakee', 'Kendall', 'Knox', 'Lake', 'LaSalle', 'Lawrence', 'Lee', 'Livingston',
      'Logan', 'McDonough', 'McHenry', 'McLean', 'Macon', 'Macoupin', 'Madison', 'Marion', 'Marshall', 'Mason', 'Massac',
      'Menard', 'Mercer', 'Monroe', 'Montgomery', 'Morgan', 'Moultrie', 'Ogle', 'Peoria', 'Perry', 'Piatt', 'Pike', 'Pope',
      'Pulaski', 'Putnam', 'Randolph', 'Richland', 'Rock Island', 'St. Clair', 'Saline', 'Sangamon', 'Schuyler', 'Scott',
      'Shelby', 'Stark', 'Stephenson', 'Tazewell', 'Union', 'Vermilion', 'Wabash', 'Warren', 'Washington', 'Wayne', 'White',
      'Whiteside', 'Will', 'Williamson', 'Winnebago', 'Woodford'];
    const countyOptions = COUNTIES.map(c => c === 'COOK'
      ? '<option value="COOK_SUB">Cook – Suburban</option><option value="COOK_UNINC">Cook – Unincorporated</option><option value="COOK_CHI">Cook – City of Chicago</option>'
      : `<option value="${c}">${c}</option>`).join('');

    page.innerHTML = `
      <div class="errorbox" id="adrErr" hidden></div>
      <h1>Update Your Mailing Address</h1>
      <p class="lede">Residents must keep a current mailing address on file with the Office. Failure to update your address may result in missed notices, missed deadlines, and penalties for missed deadlines.</p>
      <p>All addresses must be entered in accordance with the <a href="#" id="docLink">Address Formatting Standards (PDF, Rev. 7, 14 pages)</a>. Addresses that do not conform to the Standards cannot be processed.</p>
      <div class="two-col">
        <aside class="paper">
          <div class="paper-head">YOUR ADDRESS (FROM YOUR LEASE)</div>
          <div class="paper-big" style="font-size:16px">${num} ${dir}. ${street} Ave., Apt. ${unit}<br>Chicago, IL ${zip}</div>
          <div class="paper-small">Cook County</div>
        </aside>
        <form id="adrForm" class="govform" autocomplete="off" novalidate>
          <fieldset>
            <legend>Mailing Address</legend>
            <div class="field"><label for="aNum">House Number</label><input type="text" id="aNum" name="num" size="8"></div>
            <div class="field"><label for="aDir">Street Direction</label>
              <select id="aDir" name="dir"><option value="">-- Select --</option><option value="N">N - NORTH</option><option value="S">S - SOUTH</option><option value="E">E - EAST</option><option value="W">W - WEST</option></select></div>
            <div class="field"><label for="aStreet">Street Name</label><input type="text" id="aStreet" name="street" size="24">
              <div class="hint">Do not include street direction or street suffix.</div></div>
            <div class="field"><label for="aSuffix">Street Suffix</label><input type="text" id="aSuffix" name="suffix" size="6" placeholder="e.g. ST"></div>
            <div class="field"><label for="aUnit">Unit / Apt. # (if applicable)</label><input type="text" id="aUnit" name="unit" size="8"></div>
            <div class="field"><label for="aCity">City</label><input type="text" id="aCity" value="CHICAGO" size="14" disabled></div>
            <div class="field"><label for="aState">State</label><input type="text" id="aState" value="IL" size="3" disabled></div>
            <div class="field"><label for="aZip">ZIP Code</label><input type="text" id="aZip" name="zip" size="10" maxlength="10"></div>
            <div class="field"><label for="aCounty">County</label>
              <select id="aCounty" name="county"><option value="">-- Select County --</option>${countyOptions}</select></div>
          </fieldset>
          <div class="btnrow"><button type="submit" class="btn" id="adrSubmit">Submit</button></div>
        </form>
      </div>`;

    const form = page.querySelector('#adrForm');
    const err = page.querySelector('#adrErr');
    const submit = page.querySelector('#adrSubmit');
    const norm = s => s.trim().toUpperCase().replace(/\./g, '').replace(/\s+/g, ' ');
    const normUnit = s => norm(s).replace(/^(APARTMENT|APT|UNIT|NO)\s*/, '').replace(/[#\s]/g, '');

    page.querySelector('#docLink').addEventListener('click', e => { e.preventDefault(); openStandards(); });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      const f = Object.fromEntries(new FormData(form));
      submit.disabled = true;
      submit.innerHTML = '<span class="spinner"></span>Processing…';
      await wait(1500);
      const wrong = Object.entries({
        house_number: norm(f.num) === num,
        direction: f.dir === dir,
        street_name: norm(f.street) === street.toUpperCase(),
        suffix: norm(f.suffix) === 'AV',
        unit: normUnit(f.unit) === unit,
        zip: f.zip.trim() === zip,
        county: f.county === 'COOK_CHI',
      }).filter(([, right]) => !right).map(([field]) => field);
      if (wrong.length) {
        // What kind of suffix they typed, without sending the text itself.
        const s = norm(f.suffix);
        const suffixTyped = s === '' ? 'blank' : s === 'AVE' ? 'AVE' : s === 'AVENUE' ? 'AVENUE' : s === 'AV' ? 'AV' : 'other';
        const reason = wrong.length === 1 && wrong[0] === 'suffix'
          ? (suffixTyped === 'AVE' ? 'Typed AVE (the postal abbreviation) instead of AV' : `Suffix was ${suffixTyped}, not AV`)
          : `Wrong or empty: ${wrong.join(', ')}`;
        Game.mistake('ADR-22', reason, { wrong_fields: wrong, suffix_typed: suffixTyped, county_picked: f.county || 'none' });
      }
      if (!wrong.length) {
        const weeksOut = w => new Date(Date.now() + w * 7 * 864e5).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        form.outerHTML = `
          <div class="okbox">
            Your mailing address has been updated.<br><br>
            Your change will take effect in 6 to 8 weeks, between <u>${weeksOut(6)}</u> and <u>${weeksOut(8)}</u>.
            Until then, all notices will continue to be mailed to your previous address.
            <p class="small" style="font-weight:normal"><span class="spinner"></span>Please wait. Do not press Back or Refresh.</p>
          </div>`;
        err.hidden = true;
        await wait(6000);
        done();
        return;
      }
      form.reset();
      err.textContent = 'Your submission contains one or more errors. Please correct the errors and resubmit. For your security, all fields have been cleared. (Error ADR-22)';
      err.hidden = false;
      submit.disabled = false;
      submit.textContent = 'Submit';
    });
  },
});

// The 14-page "PDF". Only Previous and Next work, and each page takes a moment to "load".
function openStandards() {
  const lorem = [
    'The provisions of this Standard shall apply to all addresses submitted to the Office by any means, including but not limited to online submission, mail, facsimile, and in-person submission at a designated window.',
    'Nothing in this Standard shall be construed to limit the authority of the Office to reject any address for any reason or for no reason.',
    'Where a conflict exists between this Standard and any prior Standard, this Standard shall control, except where the prior Standard is more restrictive, in which case the prior Standard shall control.',
    'Questions regarding the interpretation of this Standard may be submitted in writing to the Office. Responses are not guaranteed.',
  ];
  const PAGES = [
    `<div class="center"><br><br><h2>ADDRESS FORMATTING STANDARDS</h2><p>Revision 7</p><p>Office of the Clerk of Forms</p><p>Supersedes Revisions 1 through 6, except where Revision 4 remains in effect.</p><br><p><i>Effective upon publication or upon the date of publication, whichever is later.</i></p></div>`,
    `<h2>Table of Contents</h2><table><tr><td>1.0 Purpose</td><td>3</td></tr><tr><td>2.0 Scope</td><td>4</td></tr><tr><td>3.0 Definitions</td><td>4</td></tr><tr><td>4.0 House Numbers</td><td>5</td></tr><tr><td>5.0 Street Directions</td><td>6</td></tr><tr><td>6.0 Street Names</td><td>7</td></tr><tr><td>7.0 Units</td><td>8</td></tr><tr><td>8.0 ZIP Codes</td><td>9</td></tr><tr><td>9.0 Street Suffixes</td><td>10</td></tr><tr><td>Table 9.2 Approved Suffix Abbreviations</td><td>11</td></tr><tr><td>10.0 Exceptions</td><td>12</td></tr><tr><td>11.0 Revision History</td><td>13</td></tr></table>`,
    `<h2>1.0 Purpose</h2><p>1.1 The purpose of this Standard is to establish a standard for the formatting of addresses in accordance with this Standard.</p><p>1.2 ${lorem[0]}</p><p>1.3 ${lorem[1]}</p>`,
    `<h2>2.0 Scope</h2><p>2.1 ${lorem[0]}</p><h2>3.0 Definitions</h2><p>3.1 "Address" means an address.</p><p>3.2 "Street Suffix" means the word following a street name that indicates the type of street, such as Street, Avenue, or Boulevard.</p><p>3.3 "Resident" means a person who resides.</p>`,
    `<h2>4.0 House Numbers</h2><p>4.1 House numbers shall be entered as whole numbers without fractions, letters, or hyphens.</p><p>4.2 Addresses containing fractions (e.g., 1234½) shall be rounded down. Residents of the rounded-down address shall be notified by mail at the rounded-down address.</p><p>4.3 ${lorem[2]}</p>`,
    `<h2>5.0 Street Directions</h2><p>5.1 Street directions shall be entered as a single letter: N, S, E, or W.</p><p>5.2 Diagonal streets shall use the direction assigned by the City, which may differ from the direction in which the street travels.</p><p>5.3 ${lorem[3]}</p>`,
    `<h2>6.0 Street Names</h2><p>6.1 Street names shall be entered without the street direction and without the street suffix.</p><p>6.2 Example: for "121 N. LaSalle St.", the street name is LASALLE.</p><p>6.3 Abbreviations shall conform to Table 9.2.</p>`,
    `<h2>7.0 Units</h2><p>7.1 Unit designations shall be entered without the word "Apartment," "Apt.," "Unit," or the symbol "#," although these will generally be accepted.</p><p>7.2 Garden units shall be designated "G." Basement units do not exist for the purposes of this Standard.</p>`,
    `<h2>8.0 ZIP Codes</h2><p>8.1 ZIP Codes shall be entered as five digits.</p><p>8.2 The ZIP Code field accepts ten characters for future use.</p><p>8.3 ${lorem[1]}</p>`,
    `<h2>9.0 Street Suffixes</h2><p>9.1 Street suffixes shall be entered using the two-character abbreviations in Table 9.2 on the following page.</p><p>9.2 The abbreviations used by the United States Postal Service (for example, "AVE") are not accepted by this system.</p><p>9.3 ${lorem[2]}</p>`,
    `<h2>Table 9.2 — Approved Street Suffix Abbreviations</h2><table><tr><th>Suffix</th><th>Abbreviation</th></tr><tr><td>AVENUE</td><td>AV</td></tr><tr><td>BOULEVARD</td><td>BV</td></tr><tr><td>COURT</td><td>CT</td></tr><tr><td>DRIVE</td><td>DR</td></tr><tr><td>EXPRESSWAY</td><td>XY</td></tr><tr><td>HIGHWAY</td><td>HY</td></tr><tr><td>LANE</td><td>LN</td></tr><tr><td>PARKWAY</td><td>PK</td></tr><tr><td>PLACE</td><td>PL</td></tr><tr><td>PLAZA</td><td>PZ</td></tr><tr><td>ROAD</td><td>RD</td></tr><tr><td>SQUARE</td><td>SQ</td></tr><tr><td>STREET</td><td>ST</td></tr><tr><td>TERRACE</td><td>TR</td></tr><tr><td>WAY</td><td>WY</td></tr></table>`,
    `<h2>10.0 Exceptions</h2><p>10.1 Addresses on Lower Wacker Drive shall be entered as though located on Upper Wacker Drive.</p><p>10.2 Addresses on Lower Lower Wacker Drive shall not be entered.</p><p>10.3 ${lorem[3]}</p>`,
    `<h2>11.0 Revision History</h2><table><tr><th>Rev.</th><th>Date</th><th>Change</th></tr><tr><td>1</td><td>1987</td><td>Initial release</td></tr><tr><td>2</td><td>1994</td><td>Typo corrected</td></tr><tr><td>3</td><td>1994</td><td>Typo restored</td></tr><tr><td>4</td><td>2003</td><td>See Rev. 4</td></tr><tr><td>5</td><td>2009</td><td>Reformatted for fax</td></tr><tr><td>6</td><td>2011</td><td>Withdrawn</td></tr><tr><td>7</td><td>2011</td><td>Current</td></tr></table>`,
    `<div class="center"><br><br><br><br><p><i>This page intentionally left blank.</i></p></div>`,
  ];

  let n = 0, furthest = 1;
  const modal = el(`
    <div class="modal">
      <div class="pdf">
        <div class="pdf-bar">
          <span class="pdf-name">Address_Formatting_Standards_Rev7_FINAL_v2 (1).pdf</span>
          <button type="button" class="pdf-prev">◀ Prev</button>
          <span class="pdf-count"></span>
          <button type="button" class="pdf-next">Next ▶</button>
          <button type="button" class="pdf-close" title="Close">✕</button>
        </div>
        <div class="pdf-page"></div>
      </div>
    </div>`);
  document.body.appendChild(modal);
  const body = modal.querySelector('.pdf-page');
  const count = modal.querySelector('.pdf-count');
  const prev = modal.querySelector('.pdf-prev');
  const next = modal.querySelector('.pdf-next');

  async function show(i) {
    n = i;
    furthest = Math.max(furthest, n + 1);
    prev.disabled = next.disabled = true;
    count.textContent = `Page ${n + 1} of ${PAGES.length}`;
    body.innerHTML = '<p class="pdf-loading">Loading page…</p>';
    await wait(450);
    body.innerHTML = PAGES[n];
    body.scrollTop = 0;
    prev.disabled = n === 0;
    next.disabled = n === PAGES.length - 1;
  }
  prev.addEventListener('click', () => show(n - 1));
  next.addEventListener('click', () => show(n + 1));
  modal.querySelector('.pdf-close').addEventListener('click', () => {
    Analytics.track('Standards PDF Closed', { furthest_page: furthest, reached_suffix_table: furthest >= 11 });
    modal.remove();
  });
  show(0);
}

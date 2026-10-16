// Level 1: "Before You Begin". Several hundred words about the site, every step of the process and
// every document you will need, with links that lead nowhere. The Continue button at the very bottom
// stays disabled until the Terms and Conditions box is checked. Following any link "loses your
// information", which unchecks the box.
Game.register({
  id: 'intro',
  title: 'Before You Begin',
  crumbs: ['Home', 'Online Services', 'Residents', 'Before You Begin'],

  render(page, done) {
    const link = text => `<a href="#" class="ext">${text}</a>`;

    page.innerHTML = `
      <h1>Before You Begin</h1>
      <div class="wall">
        <p class="lede">Welcome to the Online Services Portal of the Office of the Clerk of Forms. Please read this page in its entirety before beginning your application. Applications submitted by persons who have not read this page may be delayed, returned, or processed.</p>

        <h3>About This Site</h3>
        <p>The Online Services Portal ("the Portal") allows residents to complete certain transactions with the Office without visiting a service window in person. The Portal was launched in 2011 as part of the Office's ongoing commitment to modernization, transparency, and customer service. Transactions available through the Portal include, but are not limited to, property lookups, identity verification, changes of mailing address, and the purchase of City Vehicle Stickers. Transactions not available through the Portal must be completed in person, by mail, or by facsimile.</p>
        <p>The Portal is available Monday through Friday, 8:30 AM to 4:30 PM, except between 12:00 PM and 1:00 PM, on City holidays, on County holidays, on State holidays, during scheduled maintenance, and during unscheduled maintenance. If you are using the Portal outside of these hours, you are doing so at your own risk.</p>
        <p>For information about services available in other languages, please see ${link('Language Assistance Services')}. For information about accessibility, please see ${link('Accessibility Statement (PDF)')}.</p>

        <h3>Overview of the Process</h3>
        <p>Completing your transaction will require you to complete each of the following steps, in order. Steps may not be skipped. Steps completed out of order will not be counted.</p>
        <ol>
          <li>Read this page in its entirety (you are here).</li>
          <li>Agree to the Terms and Conditions at the bottom of this page.</li>
          <li>Press the Continue button at the bottom of this page.</li>
          <li>Look up your property using your 14-digit Property Index Number (PIN).</li>
          <li>Verify that you are a human resident and not an automated program, a lobbyist, or both.</li>
          <li>Update your mailing address in accordance with the Address Formatting Standards.</li>
          <li>Wait for your mailing address update to take effect.</li>
          <li>Purchase a City Vehicle Sticker for each vehicle registered to your address.</li>
          <li>Wait for your City Vehicle Sticker to arrive by mail at your previous address.</li>
          <li>Register your initials for the public record.</li>
          <li>Await review of your initials by the Board of Ethics.</li>
          <li>Retain your confirmation number. You will not be shown it again.</li>
        </ol>
        <p>The estimated time to complete all steps is 15 to 20 minutes, or 6 to 8 weeks, depending on which steps are counted.</p>

        <h3>What You Will Need</h3>
        <p>Before beginning, please gather the following documents. You will not be able to save your progress. If you leave the Portal to find a document, you will need to begin again.</p>
        <table>
          <tr><th>Document</th><th>Used For</th><th>Notes</th></tr>
          <tr><td>Most recent property tax bill</td><td>Property lookup</td><td>Your PIN appears in the upper right corner of the bill, or in the upper left corner of older bills, or on the reverse.</td></tr>
          <tr><td>Signed lease or deed</td><td>Mailing address</td><td>Must show your full address, including unit number. Garden units are designated "G." Basement units do not exist.</td></tr>
          <tr><td>Vehicle registration card</td><td>City Vehicle Sticker</td><td>Must be current. You will need your license plate number and the weight of your vehicle.</td></tr>
          <tr><td>Two forms of government-issued photo identification</td><td>Not used online</td><td>Please have them ready anyway.</td></tr>
          <tr><td>Proof of residency dated within the last 30 days</td><td>Not used online</td><td>Utility bills, bank statements, and letters from this Office are accepted. Letters from this Office take 6 to 8 weeks to arrive.</td></tr>
          <tr><td>A pen</td><td>Recording your confirmation number</td><td>Blue or black ink only.</td></tr>
        </table>
        <p>Applicants who do not have one or more of the documents above should consult the ${link('Document Requirements Guide (PDF, 38 pages)')} or visit Window 6 during regular business hours. Window 6 is closed on Tuesdays.</p>

        <h3>Fees</h3>
        <p>Fees for City Vehicle Stickers depend on the vehicle classification you select. A non-refundable convenience fee applies to all online payments. A convenience fee also applies to in-person payments, for the convenience of the Office. Fees are subject to change without notice, including during your transaction.</p>

        <h3>Processing Times</h3>
        <p>Most transactions are processed within 6 to 8 weeks. Transactions submitted during peak periods (January through December) may take longer. You may check the status of your request at ${link('Request Status Lookup')}. Status updates are posted 6 to 8 weeks after processing is complete.</p>

        <h3>Other Services</h3>
        <p>If you arrived at this page in error, you may be looking for one of the following:</p>
        <ul>
          <li>${link('Pay a Parking or Red Light Ticket')}</li>
          <li>${link('Find Your Ward and Alderman')}</li>
          <li>${link('Request a Garbage Cart (Blue or Black)')}</li>
          <li>${link('Report a Pothole (Streets Only; for Alleys, see Alleys)')}</li>
          <li>${link('Frequently Asked Questions (PDF)')}</li>
          <li>${link('Office Locations and Window Hours')}</li>
        </ul>

        <h3>Privacy</h3>
        <p>Information you provide through the Portal may be used for the purpose for which it was provided, for other purposes, and for no purpose. Information may be shared with other City departments, County agencies, State agencies, and any person who submits a Freedom of Information Act request. For details, please see the ${link('Privacy Policy (PDF)')}.</p>

        <h3>Questions</h3>
        <p>Questions about this page should be directed to the Office in writing. Please allow 6 to 8 weeks for a response. Responses are not guaranteed. Questions about this page cannot be answered by telephone, by email, or at any service window.</p>

        <div class="agree">
          <label><input type="checkbox" id="tcBox"> <span>I have read, understood, and agree to the <a href="#" id="tcLink">Terms and Conditions</a>, the Privacy Policy, and any future changes to either, whether or not I am notified of them.</span></label>
          <div class="btnrow"><button type="button" class="btn" id="introContinue" disabled>Continue</button></div>
        </div>
      </div>`;

    const box = page.querySelector('#tcBox');
    const cont = page.querySelector('#introContinue');
    box.addEventListener('change', () => { cont.disabled = !box.checked; });
    cont.addEventListener('click', done);

    // Every link asks whether to leave. Leaving "loses your information" (unchecks the box) and then fails anyway.
    page.querySelectorAll('a.ext').forEach(a => a.addEventListener('click', async e => {
      e.preventDefault();
      const choice = await showDialog('You are leaving this page',
        `<p>You have selected a link to <b>${a.textContent}</b>.</p><p>Any information you have entered on this page will be lost. Do you wish to continue?</p>`,
        ['Continue', 'Cancel']);
      if (choice !== 'Continue') return;
      Game.mistake('503-B', 'Followed a link, which unchecked the terms box', { link: a.textContent, box_was_checked: box.checked });
      box.checked = false;
      cont.disabled = true;
      await showDialog('Service Unavailable',
        '<p>The page you requested is temporarily unavailable. Please try again during regular business hours.</p><p class="small">Error 503-B. Your information has been cleared.</p>');
    }));

    page.querySelector('#tcLink').addEventListener('click', e => {
      e.preventDefault();
      showDialog('Terms and Conditions', `<div class="legal">
        <p><b>1. Acceptance.</b> By using the Portal, by not using the Portal, or by reading these Terms, you agree to these Terms. If you do not agree to these Terms, you agree to stop using the Portal, which constitutes use of the Portal.</p>
        <p><b>2. Accuracy.</b> You agree that all information you provide is true, complete, and current. The Office makes no such agreement regarding information it provides.</p>
        <p><b>3. Availability.</b> The Portal may be unavailable at any time, for any reason, including the reason that it is available.</p>
        <p><b>4. Fees.</b> You agree to pay all fees, including fees not yet established, and fees for the establishment of fees.</p>
        <p><b>5. Limitation of Liability.</b> The Office is not responsible for lost data, lost time, missed deadlines, penalties for missed deadlines, or anything else.</p>
        <p><b>6. Changes.</b> These Terms may be changed at any time. Changes take effect 6 to 8 weeks before they are posted.</p>
        <p><b>7. Severability.</b> If any part of these Terms is found to be unenforceable, the rest of these Terms shall become more enforceable to make up the difference.</p>
        <p><b>8. Entire Agreement.</b> These Terms, together with the Privacy Policy, the Address Formatting Standards (Rev. 7, except where Rev. 4 remains in effect), and all other documents, constitute the entire agreement.</p>
      </div>`, ['I Have Read These Terms']);
    });
  },
});

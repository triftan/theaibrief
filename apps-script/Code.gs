// ============================================================
// THE AI INSTRUCTOR BRIEF — Google Apps Script Backend
// Paste this entire file into your Google Apps Script editor
// ============================================================

const SHEET_NAME = 'Subscribers';
const AGENTMAIL_API_KEY = 'am_us_inbox_439edda46170a14c0f79efcda8d00368656d412d4ccbb06f8ae382eeeb8a5c91';
const AGENTMAIL_INBOX_ID = 'coachbrandonclaude%40agentmail.to'; // full email, URL-encoded

// RUN THIS FIRST to test the welcome email
function testWelcomeEmail() {
  sendWelcomeEmail('Brandon', 'triftan888@gmail.com');
  Logger.log('Done.');
}

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Name', 'Email', 'Status']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    }

    const emails = sheet.getRange(2, 3, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
    if (emails.includes(data.email)) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: 'duplicate', message: 'Email already subscribed.' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    sheet.appendRow([new Date().toISOString(), data.name || '', data.email, 'active']);
    sendWelcomeEmail(data.name || 'there', data.email);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'success', message: 'Subscribed!' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    // Alert Brandon if something breaks
    MailApp.sendEmail('triftan888@gmail.com', '[AI Brief] Signup error', err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function sendWelcomeEmail(name, email) {
  const firstName = name.split(' ')[0];

  const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:580px;">
<tr><td style="background:#0f0f0f;padding:36px 40px;text-align:center;border-radius:12px 12px 0 0;">
<p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#f0c040;">Weekly Newsletter</p>
<h1 style="margin:0;font-size:32px;font-weight:normal;color:#fff;line-height:1.2;">The <em style="color:#f0c040;">AI Instructor</em> Brief</h1>
</td></tr>
<tr><td style="background:#fff;padding:40px 40px 32px;border-radius:0 0 12px 12px;">
<p style="margin:0 0 20px;font-size:17px;color:#1a1a1a;line-height:1.7;">Hey ${firstName},</p>
<p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">You're in. Welcome to <strong>The AI Instructor Brief</strong> — the weekly briefing for AI practitioners who want to stay sharp without drowning in noise.</p>
<p style="margin:0 0 20px;font-size:16px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">Every <strong>Monday at 7am SGT</strong>, you'll get:</p>
<table cellpadding="0" cellspacing="0" style="margin:0 0 28px;width:100%;">
<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:20px;">📰</span>&nbsp;&nbsp;<span style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;"><strong>3–5 deep dives</strong> on the biggest AI stories</span></td></tr>
<tr><td style="padding:10px 0;border-bottom:1px solid #f0f0f0;"><span style="font-size:20px;">⚡</span>&nbsp;&nbsp;<span style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;"><strong>15+ quick hits</strong> across LLMs, agents, generative AI &amp; more</span></td></tr>
<tr><td style="padding:10px 0;"><span style="font-size:20px;">🆕</span>&nbsp;&nbsp;<span style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;"><strong>New tools spotlight</strong> — before they go mainstream</span></td></tr>
</table>
<p style="margin:0 0 32px;font-size:16px;color:#333;line-height:1.8;font-family:Arial,sans-serif;">Your first issue lands this coming Monday. See you then.</p>
<p style="margin:0;font-size:15px;color:#555;font-family:Arial,sans-serif;line-height:1.7;">— Brandon<br><span style="color:#999;font-size:13px;">AI Instructor &amp; Curator, The AI Instructor Brief</span></p>
</td></tr>
<tr><td style="padding:24px 0;text-align:center;">
<p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#aaa;">You're receiving this because you signed up at theaibrief.netlify.app<br><a href="#" style="color:#aaa;">Unsubscribe</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`;

  const payload = { to: email, subject: "You're in — The AI Instructor Brief starts Monday", html: html };
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + AGENTMAIL_API_KEY },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch('https://api.agentmail.to/v0/inboxes/' + AGENTMAIL_INBOX_ID + '/messages/send', options);
  const code = response.getResponseCode();
  Logger.log('AgentMail status: ' + code);

  // Alert if email fails
  if (code !== 200) {
    MailApp.sendEmail('triftan888@gmail.com', '[AI Brief] Welcome email failed', 'Status: ' + code + '\n' + response.getContentText());
  }
}

function testSetup() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('ERROR: Sheet not found.');
  } else {
    Logger.log('SUCCESS: Sheet found. Rows: ' + sheet.getLastRow());
  }
}
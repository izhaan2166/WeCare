/**
 * WeCare website: save form enquiries to a Google Sheet.
 *
 * Setup (about 5 minutes):
 * 1. Create a Google Sheet. Open Extensions > Apps Script and paste this file in.
 * 2. Optional: set NOTIFY_EMAIL below to get an email for every new enquiry.
 * 3. Click Deploy > New deployment > Web app. Execute as: Me. Who has access: Anyone.
 * 4. Copy the web app URL into "forms.endpoint" in site.config.json, then run `node build.mjs`.
 * The website then sends each enquiry here and shows "received" only when this script confirms it.
 */
var NOTIFY_EMAIL = ''; // for example 'appointments@yourhospital.in'
var FIELDS = ['submittedAt', 'form', 'patientType', 'name', 'age', 'phone', 'email', 'department', 'doctor', 'date', 'visitType', 'time', 'topic', 'message', 'notes', 'consent'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var data = JSON.parse(e.postData.contents || '{}');
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Enquiries') ||
      SpreadsheetApp.getActiveSpreadsheet().insertSheet('Enquiries');
    if (sheet.getLastRow() === 0) sheet.appendRow(FIELDS);
    sheet.appendRow(FIELDS.map(function (k) { return String(data[k] || '').slice(0, 1000); }));
    if (NOTIFY_EMAIL) {
      MailApp.sendEmail(NOTIFY_EMAIL, 'New website enquiry: ' + (data.name || ''),
        FIELDS.map(function (k) { return k + ': ' + (data[k] || ''); }).join('\n'));
    }
    return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

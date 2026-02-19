function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const email = e.parameter.email;

  if (!email) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Email is required" })).setMimeType(ContentService.MimeType.JSON);
  }

  const searchEmail = email.toLowerCase().trim();
  const data = sheet.getDataRange().getValues();
  // Assume Row 1 is headers: [Email, Data, LastUpdated]

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase().trim() == searchEmail) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: data[i][1]
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Parse data
  let body;
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Invalid JSON" })).setMimeType(ContentService.MimeType.JSON);
  }

  const email = body.email;
  const userData = body.data; // This will be a JSON string of all local storage data

  if (!email || !userData) {
    return ContentService.createTextOutput(JSON.stringify({ error: "Email and Data are required" })).setMimeType(ContentService.MimeType.JSON);
  }

  const targetEmail = email.toLowerCase().trim();
  const timestamp = new Date();

  // Check if header exists, if not create it
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Email", "Data", "Last Updated"]);
  }

  const data = sheet.getDataRange().getValues();
  let found = false;

  // Update existing row
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]).toLowerCase().trim() == targetEmail) {
      sheet.getRange(i + 1, 2).setValue(userData);
      sheet.getRange(i + 1, 3).setValue(timestamp);
      found = true;
      break;
    }
  }

  // Append new row
  if (!found) {
    sheet.appendRow([email, userData, timestamp]);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}

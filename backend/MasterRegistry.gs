/**
 * Master Registry Backend (Google Apps Script)
 * 
 * This script acts as the "DNS Server" for the HR MASTER system.
 * It maps License Keys to Client Database URLs.
 */

// --- Configuration ---
// Replace this with the ID of the Google Sheet acting as the Master Registry
// Run setup() once to create the sheet and get the ID if you don't have one.
const REGISTRY_SHEET_ID = 'YOUR_MASTER_REGISTRY_SHEET_ID'; 

// --- Main Entry Point ---
function doPost(e) {
  try {
    const request = JSON.parse(e.postData.contents);
    const action = request.action;

    if (action === 'lookup') {
      return handleLookup(request.licenseKey);
    } else {
      return createResponse({ status: 'error', message: 'Unknown action' });
    }

  } catch (error) {
    return createResponse({ status: 'error', message: error.toString() });
  }
}

// --- Handlers ---

function handleLookup(licenseKey) {
  if (!licenseKey) {
    return createResponse({ status: 'error', message: 'License Key required' });
  }

  const ss = SpreadsheetApp.openById(REGISTRY_SHEET_ID);
  const sheet = ss.getSheetByName('Registry');
  
  if (!sheet) {
    return createResponse({ status: 'error', message: 'Registry sheet not found' });
  }

  const data = sheet.getDataRange().getValues();
  // Assume headers: LicenseKey, ClientName, ApiUrl, IsActive
  // Row 0 is header
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0] === licenseKey) {
      if (row[3] === true || row[3] === 'TRUE') {
        return createResponse({
          status: 'success',
          data: {
            clientName: row[1],
            apiUrl: row[2]
          }
        });
      } else {
        return createResponse({ status: 'error', message: 'License is inactive' });
      }
    }
  }

  return createResponse({ status: 'error', message: 'License Key not found' });
}

// --- Utilities ---

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Setup Function (Run once) ---
function setup() {
  const ss = SpreadsheetApp.create('HR MASTER - Master Registry');
  const sheet = ss.getSheets()[0];
  sheet.setName('Registry');
  sheet.appendRow(['LicenseKey', 'ClientName', 'ApiUrl', 'IsActive']);
  
  // Add a demo record
  sheet.appendRow(['DEMO-001', 'Demo Company', 'https://script.google.com/macros/s/YOUR_CLIENT_SCRIPT_ID/exec', true]);
  
  Logger.log('Created Registry: ' + ss.getUrl());
  Logger.log('ID: ' + ss.getId());
}

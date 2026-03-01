/**
 * Google Apps Script Backend for HR MASTER
 * 
 * This script handles incoming POST requests from the React frontend.
 * It automatically creates new sheets and headers if they don't exist.
 * It also updates headers if new fields are added.
 */

// --- Configuration ---
// Replace with your actual Spreadsheet ID
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; 

// --- Main Entry Point ---
function doPost(e) {
  try {
    // 1. Parse Request
    if (!e.postData || !e.postData.contents) {
      return createResponse({ status: 'error', message: 'No post data' });
    }
    
    const request = JSON.parse(e.postData.contents);
    const action = request.action;
    const sheetName = request.sheetName || 'Data';
    const data = request.data;
    const timestamp = request.timestamp || new Date().toISOString();

    // 2. Open Spreadsheet
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (err) {
      return createResponse({ status: 'error', message: 'Spreadsheet not found. Check ID.' });
    }
    
    // 3. Handle Actions
    if (action === 'save') {
      return handleSave(ss, sheetName, data, timestamp);
    } else if (action === 'read') {
      return handleRead(ss, sheetName);
    } else if (action === 'delete') {
      return handleDelete(ss, sheetName, data);
    } else {
      return createResponse({ status: 'error', message: 'Unknown action: ' + action });
    }

  } catch (error) {
    return createResponse({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  return createResponse({ status: 'success', message: 'HR Master Backend is running.' });
}

// --- Action Handlers ---

/**
 * Saves data to a sheet. Creates sheet/headers if missing. Updates headers if new keys found.
 */
function handleSave(ss, sheetName, data, timestamp) {
  let sheet = ss.getSheetByName(sheetName);
  
  // A. Create Sheet if Missing
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  // B. Get Existing Headers
  let headers = [];
  const lastCol = sheet.getLastColumn();
  if (lastCol > 0) {
    headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  }

  // C. Determine New Headers from Data
  // Ensure 'ID' and 'Timestamp' are always present
  const dataKeys = Object.keys(data);
  const newHeaders = [];
  
  if (headers.length === 0) {
    // New sheet: Create default headers
    headers = ['ID', 'Timestamp', ...dataKeys];
    sheet.appendRow(headers);
  } else {
    // Existing sheet: Check for missing headers
    dataKeys.forEach(key => {
      if (!headers.includes(key)) {
        newHeaders.push(key);
        headers.push(key);
      }
    });
    
    // Append new headers if any
    if (newHeaders.length > 0) {
      sheet.getRange(1, lastCol + 1, 1, newHeaders.length).setValues([newHeaders]);
    }
  }

  // D. Prepare Row Data
  // Map data values to the header order
  const rowData = headers.map(header => {
    if (header === 'Timestamp') return timestamp;
    if (header === 'ID') return data.id || data.ID || Utilities.getUuid();
    
    // Handle arrays/objects by stringifying them
    const val = data[header];
    if (typeof val === 'object' && val !== null) {
      return JSON.stringify(val);
    }
    return val !== undefined ? val : ''; 
  });

  // E. Check if Update or Insert
  // If data has an ID, check if it exists to update
  const idIndex = headers.indexOf('ID');
  let rowToUpdate = -1;
  
  if (idIndex !== -1 && (data.id || data.ID)) {
    const idToFind = data.id || data.ID;
    const allIds = sheet.getRange(2, idIndex + 1, sheet.getLastRow() - 1, 1).getValues().flat();
    const foundIndex = allIds.indexOf(idToFind);
    if (foundIndex !== -1) {
      rowToUpdate = foundIndex + 2; // +2 because row is 1-based and header is row 1
    }
  }

  if (rowToUpdate !== -1) {
    // Update existing row
    sheet.getRange(rowToUpdate, 1, 1, rowData.length).setValues([rowData]);
    return createResponse({ status: 'success', message: 'Data updated in ' + sheetName, id: data.id || data.ID });
  } else {
    // Append new row
    sheet.appendRow(rowData);
    return createResponse({ status: 'success', message: 'Data saved to ' + sheetName, id: rowData[idIndex] });
  }
}

/**
 * Reads data from a sheet.
 */
function handleRead(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    // Return empty list if sheet doesn't exist yet
    return createResponse({ status: 'success', data: [] });
  }

  const lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return createResponse({ status: 'success', data: [] });
  }

  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove header row
  
  // Convert rows to objects
  const result = data.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      let val = row[index];
      // Try to parse JSON if it looks like an object/array
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try {
          val = JSON.parse(val);
        } catch (e) {
          // Keep as string if parse fails
        }
      }
      obj[header] = val;
    });
    return obj;
  });

  return createResponse({ status: 'success', data: result });
}

/**
 * Deletes a row by ID
 */
function handleDelete(ss, sheetName, data) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return createResponse({ status: 'error', message: 'Sheet not found' });

  const idToDelete = data.id || data.ID;
  if (!idToDelete) return createResponse({ status: 'error', message: 'ID required for delete' });

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const idIndex = headers.indexOf('ID');
  
  if (idIndex === -1) return createResponse({ status: 'error', message: 'ID column not found' });

  const allIds = sheet.getRange(2, idIndex + 1, sheet.getLastRow() - 1, 1).getValues().flat();
  const foundIndex = allIds.indexOf(idToDelete);

  if (foundIndex !== -1) {
    sheet.deleteRow(foundIndex + 2);
    return createResponse({ status: 'success', message: 'Row deleted' });
  } else {
    return createResponse({ status: 'error', message: 'ID not found' });
  }
}

// --- Utilities ---

function createResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- Setup Function (Run once manually) ---
function setup() {
  const ss = SpreadsheetApp.create('HR Master Database');
  Logger.log('Created Spreadsheet: ' + ss.getUrl());
  Logger.log('ID: ' + ss.getId());
}

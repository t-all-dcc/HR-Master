// --- Configuration ---
// The URL of the Master Registry Web App (DNS Server)
// Replace with your deployed Master Registry Web App URL
const MASTER_REGISTRY_URL = 'https://script.google.com/macros/s/AKfycbx_YOUR_MASTER_REGISTRY_ID/exec'; 

// Local storage keys
const STORAGE_KEY_LICENSE = 'HR_MASTER_LICENSE';
const STORAGE_KEY_API_URL = 'HR_MASTER_API_URL';
const STORAGE_KEY_CLIENT_NAME = 'HR_MASTER_CLIENT_NAME';

// --- Client Session Management ---

export const getClientSession = () => {
  return {
    licenseKey: localStorage.getItem(STORAGE_KEY_LICENSE),
    clientName: localStorage.getItem(STORAGE_KEY_CLIENT_NAME),
    apiUrl: localStorage.getItem(STORAGE_KEY_API_URL)
  };
};

export const saveClientSession = (license: string, name: string, url: string) => {
  localStorage.setItem(STORAGE_KEY_LICENSE, license);
  localStorage.setItem(STORAGE_KEY_CLIENT_NAME, name);
  localStorage.setItem(STORAGE_KEY_API_URL, url);
};

export const logoutClient = () => {
  localStorage.removeItem(STORAGE_KEY_LICENSE);
  localStorage.removeItem(STORAGE_KEY_CLIENT_NAME);
  localStorage.removeItem(STORAGE_KEY_API_URL);
  // Optional: Redirect to login page
  window.location.reload();
};

/**
 * Looks up the client's specific API URL using their License Key.
 * @param licenseKey The license key provided by the user.
 * @returns Promise resolving to the client's API URL and Name.
 */
export const lookupClientApi = async (licenseKey: string): Promise<{ clientName: string, apiUrl: string }> => {
  try {
    // MOCK LOOKUP for demo purposes if MASTER_REGISTRY_URL is placeholder
    if (MASTER_REGISTRY_URL.includes('YOUR_MASTER_REGISTRY_ID')) {
      console.warn('Using Mock Registry Lookup');
      if (licenseKey === 'DEMO-001') {
        const mockResult = {
          clientName: 'Demo Company Ltd.',
          apiUrl: 'https://script.google.com/macros/s/AKfycbz_YOUR_CLIENT_SCRIPT_ID/exec' // Placeholder
        };
        saveClientSession(licenseKey, mockResult.clientName, mockResult.apiUrl);
        return mockResult;
      }
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      throw new Error('Invalid License Key (Mock)');
    }

    const response = await fetch(MASTER_REGISTRY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'lookup', licenseKey }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      saveClientSession(licenseKey, result.data.clientName, result.data.apiUrl);
      return result.data;
    } else {
      throw new Error(result.message || 'License lookup failed');
    }
  } catch (error: any) {
    console.error('Registry Lookup Error:', error);
    throw error;
  }
};

/**
 * Generic function to send data to Google Apps Script
 * @param action The action/command name (e.g., 'save_employee', 'get_data')
 * @param payload The data object to send
 * @param sheetName Optional: The specific sheet name to target
 */
export const sendToGAS = async (action: string, payload: any, sheetName?: string) => {
  const { apiUrl } = getClientSession();

  if (!apiUrl) {
    console.warn('No Client API URL set. Using Mock Mode or failing.');
    // For development without a backend, we might just log and return mock success
    return { status: 'success', message: 'Mock Success (No API URL)', data: payload };
  }

  try {
    // In a real scenario, you might use 'no-cors' if GAS doesn't handle CORS correctly,
    // but 'cors' is preferred if the GAS script returns correct headers.
    // For this template, we assume standard POST.
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS doPost often handles text/plain better to avoid preflight
      },
      body: JSON.stringify({
        action,
        sheetName,
        data: payload,
        timestamp: new Date().toISOString()
      })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * Example wrapper for saving data
 */
export const saveData = async (sheetName: string, data: any) => {
  return sendToGAS('save', data, sheetName);
};

/**
 * Example wrapper for fetching data
 */
export const getData = async (sheetName: string) => {
  return sendToGAS('read', {}, sheetName);
};

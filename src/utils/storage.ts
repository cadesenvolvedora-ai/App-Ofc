// Persistent offline storage engine using IndexedDB
// Bypasses the 5MB localStorage limit and survives app closures, reboots, and charger docking
import { MaintenanceReport, AppSettings } from '../types';

const DB_NAME = 'RelatorioManutencaoDB';
const DB_VERSION = 1;
const STORE_NAME = 'reports_store';

const KEY_REPORTS = 'reports_data';
const KEY_SETTINGS = 'settings_data';
const KEY_ACTIVE_ID = 'active_report_id';

let dbInstance: IDBDatabase | null = null;

// Open or get IndexedDB database connection
function getDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }

  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;

      // Handle connection closing or errors
      dbInstance.onversionchange = () => {
        dbInstance?.close();
        dbInstance = null;
      };

      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

// Request persistent storage from Android/Chromium WebView so the OS never clears this data
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && navigator.storage.persist) {
      const isPersisted = await navigator.storage.persist();
      console.log(`[Storage] Persistent storage granted by device: ${isPersisted}`);
      return isPersisted;
    }
  } catch (err) {
    console.warn('[Storage] Error requesting persistent storage:', err);
  }
  return false;
}

// Save reports to IndexedDB (and metadata to localStorage as fallback)
export async function saveReportsToDB(reports: MaintenanceReport[]): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      
      const payload = {
        reports,
        savedAt: Date.now(),
      };

      const request = store.put(payload, KEY_REPORTS);

      request.onsuccess = () => {
        // Also save a lightweight fallback index to localStorage without crashing quota
        try {
          const summary = reports.map(r => ({
            id: r.id,
            title: r.title,
            tag: r.tag,
            os: r.os,
            startDate: r.startDate,
            endDate: r.endDate,
            technician: r.technician,
            status: r.status,
            photoCount: r.photos.length,
            updatedAt: r.updatedAt,
          }));
          localStorage.setItem('ais_maintenance_summary_v1', JSON.stringify(summary));
        } catch {
          // ignore localStorage quota errors
        }
        resolve(true);
      };

      request.onerror = (e) => {
        console.error('[Storage] Error saving reports to IndexedDB:', (e.target as IDBRequest).error);
        resolve(false);
      };
    });
  } catch (err) {
    console.error('[Storage] Failed to access IndexedDB for saving reports:', err);
    return false;
  }
}

// Load reports from IndexedDB
export async function loadReportsFromDB(): Promise<MaintenanceReport[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_REPORTS);

      request.onsuccess = () => {
        const result = request.result;
        if (result && Array.isArray(result.reports) && result.reports.length > 0) {
          resolve(result.reports);
        } else {
          resolve(null);
        }
      };

      request.onerror = (e) => {
        console.error('[Storage] Error loading reports from IndexedDB:', (e.target as IDBRequest).error);
        resolve(null);
      };
    });
  } catch (err) {
    console.error('[Storage] Failed to access IndexedDB for loading reports:', err);
    return null;
  }
}

// Save settings to IndexedDB
export async function saveSettingsToDB(settings: AppSettings): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(settings, KEY_SETTINGS);

      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Load settings from IndexedDB
export async function loadSettingsFromDB(): Promise<AppSettings | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_SETTINGS);

      request.onsuccess = () => {
        resolve(request.result || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Save active report id
export async function saveActiveReportIdToDB(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(id, KEY_ACTIVE_ID);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

// Load active report id
export async function loadActiveReportIdFromDB(): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(KEY_ACTIVE_ID);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// Persistent storage for Fixed Parts Order Recipient Emails
const KEY_FIXED_PARTS_EMAILS = 'ais_parts_order_fixed_emails_v2';
const IDB_KEY_FIXED_PARTS_EMAILS = 'parts_order_fixed_emails';

export function loadFixedPartsOrderEmails(): string[] {
  try {
    const raw = localStorage.getItem(KEY_FIXED_PARTS_EMAILS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[Storage] Error reading fixed parts emails from localStorage:', e);
  }
  return ['paulo.sousa@kinross.com'];
}

export async function saveFixedPartsOrderEmails(emails: string[]): Promise<boolean> {
  try {
    localStorage.setItem(KEY_FIXED_PARTS_EMAILS, JSON.stringify(emails));
  } catch (e) {
    console.warn('[Storage] Error writing fixed parts emails to localStorage:', e);
  }

  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const request = store.put(emails, IDB_KEY_FIXED_PARTS_EMAILS);
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

export async function loadFixedPartsOrderEmailsFromDB(): Promise<string[] | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(IDB_KEY_FIXED_PARTS_EMAILS);
      request.onsuccess = () => {
        if (Array.isArray(request.result) && request.result.length > 0) {
          resolve(request.result);
        } else {
          resolve(null);
        }
      };
      request.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

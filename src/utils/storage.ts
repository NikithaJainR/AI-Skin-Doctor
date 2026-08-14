import { AssessmentReport, ProgressLog } from "../types";

const DB_NAME = "AISkinDoctorDB";
const STORE_IMAGES = "images";
const DB_VERSION = 1;

// Open IndexedDB
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store image in IndexedDB
export async function saveImageToIDB(id: string, base64Data: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_IMAGES, "readwrite");
    const store = tx.objectStore(STORE_IMAGES);
    store.put(base64Data, id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (err) {
    console.warn("IndexedDB save image failed, falling back", err);
  }
}

// Get image from IndexedDB
export async function getImageFromIDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_IMAGES, "readonly");
    const store = tx.objectStore(STORE_IMAGES);
    const req = store.get(id);
    return new Promise((resolve, reject) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("IndexedDB get image failed", err);
    return null;
  }
}

// LocalStorage Keys
const KEY_REPORTS = "ai_skin_doctor_reports";
const KEY_PROGRESS = "ai_skin_doctor_progress";
const KEY_SETTINGS = "ai_skin_doctor_settings";

export interface UserSettings {
  language: string;
  theme: "light" | "dark";
  highContrast: boolean;
  largeFont: boolean;
}

export function getSavedReports(): AssessmentReport[] {
  try {
    const data = localStorage.getItem(KEY_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading reports", e);
    return [];
  }
}

export function saveReport(report: AssessmentReport): void {
  try {
    const reports = getSavedReports();
    const existingIdx = reports.findIndex((r) => r.id === report.id);
    if (existingIdx >= 0) {
      reports[existingIdx] = report;
    } else {
      reports.unshift(report);
    }
    // Keep max 30 reports in local storage
    const trimmed = reports.slice(0, 30);
    localStorage.setItem(KEY_REPORTS, JSON.stringify(trimmed));

    // Also store primary image in IDB if exists
    if (report.primaryImage) {
      saveImageToIDB(`img_${report.id}`, report.primaryImage);
    }
  } catch (e) {
    console.error("Error saving report", e);
  }
}

export function deleteReport(id: string): void {
  try {
    const reports = getSavedReports().filter((r) => r.id !== id);
    localStorage.setItem(KEY_REPORTS, JSON.stringify(reports));
  } catch (e) {
    console.error("Error deleting report", e);
  }
}

export function getProgressLogs(): ProgressLog[] {
  try {
    const data = localStorage.getItem(KEY_PROGRESS);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Error loading progress logs", e);
    return [];
  }
}

export function saveProgressLog(log: ProgressLog): void {
  try {
    const logs = getProgressLogs();
    logs.unshift(log);
    localStorage.setItem(KEY_PROGRESS, JSON.stringify(logs.slice(0, 20)));
  } catch (e) {
    console.error("Error saving progress log", e);
  }
}

export function getUserSettings(): UserSettings {
  try {
    const data = localStorage.getItem(KEY_SETTINGS);
    if (data) return JSON.parse(data);
  } catch (e) {
    // default
  }
  return {
    language: "English",
    theme: "light",
    highContrast: false,
    largeFont: false,
  };
}

export function saveUserSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error("Error saving user settings", e);
  }
}

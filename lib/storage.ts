import { decryptJson, encryptJson, isEncryptedBlob, type EncryptedBlob } from "./crypto";
import { emptyKeys } from "./models";
import type { ArenaEvent, LicenseRecord, ProviderKeys } from "./types";

const KEYS_STORAGE = "arena.vault.keys";
const LICENSE_STORAGE = "arena.license";
const SETTINGS_STORAGE = "arena.settings";
const INSTANCE_STORAGE = "arena.instance";
const DB_NAME = "the-arena";
const DB_VERSION = 1;
const EVENTS_STORE = "events";

export interface ArenaSettings {
  selectedAthleteId: string;
  compareAthleteIds: [string, string];
  podiumAthleteIds: string[];
  coachEnabled: boolean;
  mode: "single" | "compare" | "podium";
}

export type VaultState =
  | { encrypted: false; keys: ProviderKeys }
  | { encrypted: true; blob: EncryptedBlob };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadVaultState(): VaultState | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(KEYS_STORAGE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as VaultState | EncryptedBlob | { keys: ProviderKeys };
    if ("encrypted" in parsed) return parsed as VaultState;
    if (isEncryptedBlob(parsed)) return { encrypted: true, blob: parsed };
    if ("keys" in parsed) return { encrypted: false, keys: { ...emptyKeys(), ...parsed.keys } };
  } catch {
    return null;
  }
  return null;
}

export function savePlainKeys(keys: ProviderKeys): void {
  if (!canUseStorage()) return;
  const state: VaultState = { encrypted: false, keys };
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(state));
}

export async function saveEncryptedKeys(keys: ProviderKeys, password: string): Promise<void> {
  if (!canUseStorage()) return;
  const blob = await encryptJson(keys, password);
  const state: VaultState = { encrypted: true, blob };
  localStorage.setItem(KEYS_STORAGE, JSON.stringify(state));
}

export async function unlockVault(password: string): Promise<ProviderKeys> {
  const state = loadVaultState();
  if (!state?.encrypted) {
    throw new Error("Vault is not encrypted.");
  }
  return decryptJson<ProviderKeys>(state.blob, password);
}

export function loadLicense(): LicenseRecord | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(LICENSE_STORAGE);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as LicenseRecord;
  } catch {
    return null;
  }
}

export function saveLicense(record: LicenseRecord | null): void {
  if (!canUseStorage()) return;
  if (!record) {
    localStorage.removeItem(LICENSE_STORAGE);
    return;
  }
  localStorage.setItem(LICENSE_STORAGE, JSON.stringify(record));
}

export function loadSettings(): Partial<ArenaSettings> {
  if (!canUseStorage()) return {};
  const raw = localStorage.getItem(SETTINGS_STORAGE);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as Partial<ArenaSettings>;
  } catch {
    return {};
  }
}

export function saveSettings(settings: ArenaSettings): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SETTINGS_STORAGE, JSON.stringify(settings));
}

export function getOrCreateInstanceName(): string {
  if (!canUseStorage()) return "Arena/anonymous";
  const existing = localStorage.getItem(INSTANCE_STORAGE);
  if (existing) return existing;
  const name = `Olympiad/${crypto.randomUUID()}`;
  localStorage.setItem(INSTANCE_STORAGE, name);
  return name;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        db.createObjectStore(EVENTS_STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listEvents(): Promise<ArenaEvent[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readonly");
    const request = tx.objectStore(EVENTS_STORE).getAll();
    request.onsuccess = () => {
      const events = (request.result as ArenaEvent[]).sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(events);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function putEvent(event: ArenaEvent): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    tx.objectStore(EVENTS_STORE).put(event);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteEvent(id: string): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(EVENTS_STORE, "readwrite");
    tx.objectStore(EVENTS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

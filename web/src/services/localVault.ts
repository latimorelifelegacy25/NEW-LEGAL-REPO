export interface StoredDocument {
  id: string;
  name: string;
  kind: 'complaint' | 'exhibit' | 'other';
  exhibit?: string;
  mime: string;
  sha256: string;
  originalBase64: string;
  extractedText: string;
  numberedText?: string;
  uploadedAt: string;
}

export interface VaultData {
  docket: string;
  caption: string;
  documents: StoredDocument[];
  edits: Record<string, string>;
}

interface EncryptedRecord { salt: number[]; iv: number[]; ciphertext: ArrayBuffer }
const DATABASE = 'latimore-legal-os-local-v1';
const RECORD = 'matter-vault';
const encoder = new TextEncoder();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('vaults');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function readRecord(): Promise<EncryptedRecord | undefined> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vaults', 'readonly');
    const request = tx.objectStore('vaults').get(RECORD);
    request.onsuccess = () => resolve(request.result as EncryptedRecord | undefined);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
  });
}

async function writeRecord(record: EncryptedRecord): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('vaults', 'readwrite');
    tx.objectStore('vaults').put(record, RECORD);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const raw = await crypto.subtle.importKey('raw', encoder.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: salt as BufferSource, iterations: 310000, hash: 'SHA-256' }, raw,
    { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function vaultExists(): Promise<boolean> { return !!(await readRecord()); }

export async function downloadEncryptedBackup(): Promise<void> {
  await pendingSave;
  const record = await readRecord();
  if (!record) throw new Error('No saved vault exists.');
  const bytes = new Uint8Array(record.ciphertext);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.slice(i, i + 8192));
  const backup = JSON.stringify({ format: DATABASE, version: 1, salt: record.salt, iv: record.iv, ciphertext: btoa(binary) });
  const url = URL.createObjectURL(new Blob([backup], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = 'Latimore_Legal_OS_Encrypted_Backup.json'; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function restoreEncryptedBackup(file: File): Promise<void> {
  if (await vaultExists()) throw new Error('A vault already exists in this browser; restoration would replace it.');
  if (file.size > 60 * 1024 * 1024) throw new Error('Backup exceeds 60 MB.');
  const value: unknown = JSON.parse(await file.text());
  if (!value || typeof value !== 'object') throw new Error('Invalid backup.');
  const backup = value as Record<string, unknown>;
  if (backup.format !== DATABASE || backup.version !== 1 || typeof backup.ciphertext !== 'string' ||
      !Array.isArray(backup.salt) || !Array.isArray(backup.iv) ||
      backup.salt.length !== 16 || backup.iv.length !== 12 ||
      ![...backup.salt, ...backup.iv].every(x => Number.isInteger(x) && x >= 0 && x <= 255))
    throw new Error('Unsupported or invalid backup format.');
  const binary = atob(backup.ciphertext);
  const ciphertext = Uint8Array.from(binary, character => character.charCodeAt(0)).buffer;
  await writeRecord({ salt: backup.salt as number[], iv: backup.iv as number[], ciphertext });
}

let pendingSave: Promise<void> = Promise.resolve();
export function saveVault(passphrase: string, data: VaultData): Promise<void> {
  const snapshot = structuredClone(data);
  const operation = pendingSave.catch(() => undefined).then(() => writeEncryptedVault(passphrase, snapshot));
  pendingSave = operation;
  return operation;
}

async function writeEncryptedVault(passphrase: string, data: VaultData): Promise<void> {
  if (passphrase.length < 12) throw new Error('Use a passphrase of at least 12 characters.');
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(JSON.stringify(data)));
  await writeRecord({ salt: Array.from(salt), iv: Array.from(iv), ciphertext });
}

export async function loadVault(passphrase: string): Promise<VaultData | null> {
  const record = await readRecord();
  if (!record) return null;
  const key = await deriveKey(passphrase, new Uint8Array(record.salt));
  const clear = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: new Uint8Array(record.iv) }, key, record.ciphertext);
  return JSON.parse(new TextDecoder().decode(clear)) as VaultData;
}

export async function readFile(file: File): Promise<{ base64: string; sha256: string; text: string; numberedText?: string }> {
  const bytes = await file.arrayBuffer();
  const sha256 = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytes)))
    .map(byte => byte.toString(16).padStart(2, '0')).join('');
  const encoded = new Uint8Array(bytes);
  let binary = '';
  for (let i = 0; i < encoded.length; i += 8192) binary += String.fromCharCode(...encoded.slice(i, i + 8192));
  const base64 = btoa(binary);
  const ext = file.name.toLowerCase().split('.').pop();
  let numberedText: string | undefined;
  let text = ['txt', 'md'].includes(ext || '') ? new TextDecoder().decode(bytes) : '';
  if (ext === 'docx') {
    const mammoth = await import('mammoth');
    text = (await mammoth.extractRawText({ arrayBuffer: bytes })).value;
    const html = (await mammoth.convertToHtml({ arrayBuffer: bytes })).value;
    const document = new DOMParser().parseFromString(html, 'text/html');
    const listItems = [...document.querySelectorAll('li')];
    if (listItems.length) numberedText = listItems.map((li, i) => `${i + 1}. ${li.textContent?.trim() || ''}`).join('\n');
  }
  return { base64, sha256, text, numberedText };
}

export function downloadOriginal(doc: StoredDocument): void {
  const binary = atob(doc.originalBase64);
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: doc.mime || 'application/octet-stream' }));
  const link = document.createElement('a'); link.href = url; link.download = doc.name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

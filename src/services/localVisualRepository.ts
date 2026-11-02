import DOMPurify from 'dompurify';
import { VisualAsset, VisualIdentityProfile } from '../domain/visual/visualTypes';
import { getDefaultVisualIdentity } from '../domain/visual/visualIdentityEngine';

const DB_NAME = 'editoryniq_visual_db';
const DB_VERSION = 1;
const ASSETS_STORE = 'visual_assets';
const IDENTITY_STORE = 'visual_identities';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(ASSETS_STORE)) {
        const assetStore = db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
        assetStore.createIndex('bookId', 'bookId', { unique: false });
        assetStore.createIndex('assetType', 'assetType', { unique: false });
      }

      if (!db.objectStoreNames.contains(IDENTITY_STORE)) {
        db.createObjectStore(IDENTITY_STORE, { keyPath: 'bookId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Pure JS SHA-256 fallback for environments lacking crypto.subtle (e.g. Node CLI without window.crypto)
 */
function sha256JsFallback(str: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(str);
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef4a3f7, 0xc67178f2,
  ];
  let H0 = 0x6a09e667, H1 = 0xbb67ae85, H2 = 0x3c6ef372, H3 = 0xa54ff53a;
  let H4 = 0x510e527f, H5 = 0x9b05688c, H6 = 0x1f83d9ab, H7 = 0x5be0cd19;
  const len = bytes.length;
  const bitLenHi = Math.floor(len / 0x20000000);
  const bitLenLo = (len << 3) >>> 0;
  const padLen = (len % 64 < 56) ? (56 - (len % 64)) : (120 - (len % 64));
  const padded = new Uint8Array(len + padLen + 8);
  padded.set(bytes);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLenHi, false);
  view.setUint32(padded.length - 4, bitLenLo, false);
  const W = new Int32Array(64);
  const rightRotate = (n: number, b: number) => (n >>> b) | (n << (32 - b));
  for (let i = 0; i < padded.length; i += 64) {
    for (let t = 0; t < 16; t++) W[t] = view.getInt32(i + t * 4, false);
    for (let t = 16; t < 64; t++) {
      const s0 = rightRotate(W[t - 15], 7) ^ rightRotate(W[t - 15], 18) ^ (W[t - 15] >>> 3);
      const s1 = rightRotate(W[t - 2], 17) ^ rightRotate(W[t - 2], 19) ^ (W[t - 2] >>> 10);
      W[t] = (W[t - 16] + s0 + W[t - 7] + s1) | 0;
    }
    let a = H0, b = H1, c = H2, d = H3, e = H4, f = H5, g = H6, h = H7;
    for (let t = 0; t < 64; t++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + W[t]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + temp1) | 0;
      d = c; c = b; b = a; a = (temp1 + temp2) | 0;
    }
    H0 = (H0 + a) | 0; H1 = (H1 + b) | 0; H2 = (H2 + c) | 0; H3 = (H3 + d) | 0;
    H4 = (H4 + e) | 0; H5 = (H5 + f) | 0; H6 = (H6 + g) | 0; H7 = (H7 + h) | 0;
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  return toHex(H0) + toHex(H1) + toHex(H2) + toHex(H3) + toHex(H4) + toHex(H5) + toHex(H6) + toHex(H7);
}

/**
 * Computes a SHA-256 hex string for asset content integrity tracking.
 */
export async function computeSHA256(content: string): Promise<string> {
  if (!content) return '';
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(content);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback
    }
  }
  return sha256JsFallback(content);
}

/**
 * Sanitizes CSS rules by stripping dangerous expressions, external imports, and remote url() references
 * while preserving internal fragment url(#id) references.
 */
function sanitizeCSS(css: string): string {
  if (!css) return '';
  let clean = css;
  clean = clean.replace(/@import\s+[^;]+;/gi, '');
  clean = clean.replace(/expression\s*\([^)]*\)/gi, '');
  clean = clean.replace(/-moz-binding\s*:[^;]+/gi, '');
  clean = clean.replace(/javascript\s*:/gi, '');
  clean = clean.replace(/url\s*\(\s*["']?\s*(https?:|\/\/)[^"')]+\s*["']?\s*\)/gi, 'none');
  return clean;
}

/**
 * Checks whether a CSS or attribute value contains an external HTTP/HTTPS URL reference.
 */
function isExternalUrl(val: string): boolean {
  if (!val) return false;
  return /url\s*\(\s*["']?\s*(https?:|\/\/)[^"')]+\s*["']?\s*\)/i.test(val) ||
    /^(https?:|\/\/)/i.test(val.trim());
}

/**
 * Primary E3 SVG Sanitizer:
 * Uses DOMPurify with an explicit SVG profile, enforced forbidden tag list (including <script> and <foreignObject>),
 * and secondary DOMParser verification to neutralize inline events, javascript: URIs, CSS injection,
 * and external remote resources while preserving legitimate internal vector references (#id, url(#id)).
 */
export function sanitizeSVG(svgContent: string): string {
  if (!svgContent || typeof svgContent !== 'string') return '';

  const dompurifyClean = DOMPurify.sanitize(svgContent, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS: [
      'script',
      'foreignobject',
      'foreignObject',
      'iframe',
      'object',
      'embed',
      'form',
      'input',
      'textarea',
      'select',
      'button',
      'audio',
      'video',
      'base',
      'link',
      'meta',
      'applet',
    ],
    FORBID_ATTR: [
      'onerror',
      'onload',
      'onclick',
      'onmouseover',
      'onmouseout',
      'onfocus',
      'onblur',
      'onchange',
      'onsubmit',
    ],
    ADD_ATTR: ['href', 'xlink:href'],
  });

  if (!dompurifyClean) return '';

  if (typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined') {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dompurifyClean, 'image/svg+xml');

      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        return '';
      }

      const svgEl = doc.querySelector('svg');
      if (!svgEl) return '';

      const allElements = Array.from(doc.querySelectorAll('*'));
      allElements.forEach((el) => {
        const tagName = el.tagName.toLowerCase();

        if (['script', 'foreignobject', 'iframe', 'object', 'embed', 'form', 'link', 'meta'].includes(tagName)) {
          el.remove();
          return;
        }

        const attrs = Array.from(el.attributes);
        attrs.forEach((attr) => {
          const attrName = attr.name.toLowerCase();
          const attrVal = attr.value.trim();

          if (attrName.startsWith('on')) {
            el.removeAttribute(attr.name);
            return;
          }

          if (attrName === 'href' || attrName === 'xlink:href' || attrName === 'src') {
            if (attrVal.startsWith('#')) {
              return;
            }
            if (
              attrVal.startsWith('data:image/png') ||
              attrVal.startsWith('data:image/jpeg') ||
              attrVal.startsWith('data:image/webp') ||
              attrVal.startsWith('data:image/svg+xml')
            ) {
              if (attrVal.includes('script') || attrVal.toLowerCase().includes('javascript:')) {
                el.removeAttribute(attr.name);
              }
              return;
            }
            if (isExternalUrl(attrVal) || attrVal.toLowerCase().startsWith('javascript:')) {
              el.removeAttribute(attr.name);
              return;
            }
          }

          if (attrName === 'style') {
            const cleanStyle = sanitizeCSS(attrVal);
            if (cleanStyle) {
              el.setAttribute('style', cleanStyle);
            } else {
              el.removeAttribute('style');
            }
          }

          if (['fill', 'stroke', 'filter', 'mask', 'clip-path', 'marker-start', 'marker-mid', 'marker-end'].includes(attrName)) {
            if (attrVal.includes('url(') && isExternalUrl(attrVal)) {
              el.removeAttribute(attr.name);
            }
          }
        });

        if (tagName === 'style') {
          const rawCss = el.textContent || '';
          el.textContent = sanitizeCSS(rawCss);
        }
      });

      const serializer = new XMLSerializer();
      return serializer.serializeToString(svgEl);
    } catch {
      return dompurifyClean;
    }
  }

  return dompurifyClean;
}

// Headless QA mode isolation state (QA_ONLY mode switch enabled strictly by QA test suite)
let isHeadlessQaModeActive = false;
const inMemAssets: VisualAsset[] = [];
const inMemIdentities: Record<string, VisualIdentityProfile> = {};

export function enableHeadlessQaMode(enabled = true): void {
  isHeadlessQaModeActive = enabled;
}

export function clearHeadlessQaStore(): void {
  inMemAssets.length = 0;
  for (const k in inMemIdentities) delete inMemIdentities[k];
}

export function isHeadlessQaMode(): boolean {
  return isHeadlessQaModeActive;
}

export const localVisualRepository = {
  enableHeadlessQaMode(enabled = true): void {
    enableHeadlessQaMode(enabled);
  },

  clearHeadlessQaStore(): void {
    clearHeadlessQaStore();
  },

  async getVisualIdentity(bookId: string, bookTitle = 'Untitled', genre = 'non-fiction'): Promise<VisualIdentityProfile> {
    if (isHeadlessQaModeActive) {
      if (inMemIdentities[bookId]) return inMemIdentities[bookId];
      const def = getDefaultVisualIdentity(bookId, bookTitle, genre);
      inMemIdentities[bookId] = def;
      return def;
    }
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(IDENTITY_STORE, 'readonly');
        const store = tx.objectStore(IDENTITY_STORE);
        const req = store.get(bookId);

        req.onsuccess = () => {
          if (req.result) {
            resolve(req.result);
          } else {
            const defaultIdentity = getDefaultVisualIdentity(bookId, bookTitle, genre);
            this.saveVisualIdentity(defaultIdentity).catch(() => {});
            resolve(defaultIdentity);
          }
        };

        req.onerror = () => {
          resolve(getDefaultVisualIdentity(bookId, bookTitle, genre));
        };
      });
    } catch {
      return getDefaultVisualIdentity(bookId, bookTitle, genre);
    }
  },

  async saveVisualIdentity(identity: VisualIdentityProfile): Promise<boolean> {
    if (isHeadlessQaModeActive) {
      inMemIdentities[identity.bookId] = { ...identity, updatedAt: new Date().toISOString() };
      return true;
    }
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(IDENTITY_STORE, 'readwrite');
        const store = tx.objectStore(IDENTITY_STORE);
        const updated = { ...identity, updatedAt: new Date().toISOString() };
        const req = store.put(updated);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async getAssetsByBookId(bookId: string): Promise<VisualAsset[]> {
    if (isHeadlessQaModeActive) {
      return inMemAssets.filter((a) => a.bookId === bookId);
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('STORAGE_UNAVAILABLE: IndexedDB is not supported or accessible in this environment.');
    }

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(ASSETS_STORE, 'readonly');
        const store = tx.objectStore(ASSETS_STORE);
        const index = store.index('bookId');
        const req = index.getAll(bookId);

        req.onsuccess = () => {
          resolve(req.result || []);
        };
        req.onerror = () => reject(new Error('STORAGE_READ_FAILED: Failed to read visual assets from IndexedDB.'));
      });
    } catch (err: any) {
      throw new Error(err?.message || 'STORAGE_UNAVAILABLE: Failed to access IndexedDB storage.');
    }
  },

  async saveAsset(asset: VisualAsset): Promise<{ success: boolean; error?: string }> {
    try {
      if (asset.svgContent) {
        const originalSvg = asset.svgContent;
        const sanitizedSvg = sanitizeSVG(originalSvg);
        const newHash = await computeSHA256(sanitizedSvg);

        asset.svgContent = sanitizedSvg;
        if (originalSvg !== sanitizedSvg) {
          asset.version = (asset.version || 1) + 1;
        }
        asset.sha256 = newHash;
      }

      if (isHeadlessQaModeActive) {
        const idx = inMemAssets.findIndex((a) => a.id === asset.id);
        if (idx >= 0) inMemAssets[idx] = asset;
        else inMemAssets.push(asset);
        return { success: true };
      }

      if (typeof window === 'undefined' || !window.indexedDB) {
        return { success: false, error: 'STORAGE_UNAVAILABLE' };
      }

      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite');
        const store = tx.objectStore(ASSETS_STORE);
        const updated = { ...asset, updatedAt: new Date().toISOString() };
        const req = store.put(updated);

        req.onsuccess = () => resolve({ success: true });
        req.onerror = (e: any) => {
          const errName = e?.target?.error?.name || '';
          resolve({
            success: false,
            error: errName === 'QuotaExceededError' ? 'STORAGE_QUOTA_EXCEEDED' : 'STORAGE_WRITE_FAILED',
          });
        };
      });
    } catch (err: any) {
      return { success: false, error: 'STORAGE_WRITE_FAILED' };
    }
  },

  async deleteAsset(assetId: string): Promise<boolean> {
    if (isHeadlessQaModeActive) {
      const idx = inMemAssets.findIndex((a) => a.id === assetId);
      if (idx >= 0) {
        inMemAssets.splice(idx, 1);
        return true;
      }
      return false;
    }

    if (typeof window === 'undefined' || !window.indexedDB) {
      return false;
    }
    try {
      const db = await openDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ASSETS_STORE, 'readwrite');
        const store = tx.objectStore(ASSETS_STORE);
        const req = store.delete(assetId);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  exportEmergencyData(bookId: string, assets: VisualAsset[], identity: VisualIdentityProfile): void {
    const backupData = {
      bookId,
      identity,
      assets,
      exportedAt: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const anchor = document.createElement('a');
    anchor.setAttribute('href', dataStr);
    anchor.setAttribute('download', `editoryniq_${bookId}_visual_emergency_backup.json`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  },
};



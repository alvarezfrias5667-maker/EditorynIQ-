import {
  EditionRecord,
  PublicationMetadataRecord,
  PublicationPackage,
  LedgerEvent,
} from '../domain/publishing/publishingTypes';

const DB_NAME = 'editoryniq_publishing_db';
const DB_VERSION = 1;
const EDITIONS_STORE = 'publishing_editions';
const METADATA_STORE = 'publication_metadata';
const PACKAGES_STORE = 'publication_packages';
const LEDGER_STORE = 'submission_ledger';

function openPublishingDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not available in this environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(EDITIONS_STORE)) {
        const editionStore = db.createObjectStore(EDITIONS_STORE, { keyPath: 'id' });
        editionStore.createIndex('bookId', 'bookId', { unique: false });
      }

      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        const metaStore = db.createObjectStore(METADATA_STORE, { keyPath: 'editionId' });
        metaStore.createIndex('bookId', 'bookId', { unique: false });
      }

      if (!db.objectStoreNames.contains(PACKAGES_STORE)) {
        const pkgStore = db.createObjectStore(PACKAGES_STORE, { keyPath: 'packageId' });
        pkgStore.createIndex('bookId', 'bookId', { unique: false });
        pkgStore.createIndex('editionId', 'editionId', { unique: false });
      }

      if (!db.objectStoreNames.contains(LEDGER_STORE)) {
        const ledgerStore = db.createObjectStore(LEDGER_STORE, { keyPath: 'eventId' });
        ledgerStore.createIndex('bookId', 'bookId', { unique: false });
        ledgerStore.createIndex('editionId', 'editionId', { unique: false });
        ledgerStore.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export const localPublishingRepository = {
  // Editions
  async getEditionsByBookId(bookId: string): Promise<EditionRecord[]> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EDITIONS_STORE, 'readonly');
        const store = tx.objectStore(EDITIONS_STORE);
        const index = store.index('bookId');
        const req = index.getAll(bookId);

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async getEditionById(editionId: string): Promise<EditionRecord | null> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EDITIONS_STORE, 'readonly');
        const store = tx.objectStore(EDITIONS_STORE);
        const req = store.get(editionId);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async saveEdition(edition: EditionRecord): Promise<boolean> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EDITIONS_STORE, 'readwrite');
        const store = tx.objectStore(EDITIONS_STORE);
        const updated = { ...edition, updatedAt: new Date().toISOString() };
        const req = store.put(updated);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async deleteEdition(editionId: string): Promise<boolean> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EDITIONS_STORE, 'readwrite');
        const store = tx.objectStore(EDITIONS_STORE);
        const req = store.delete(editionId);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Metadata
  async getMetadataByEditionId(editionId: string): Promise<PublicationMetadataRecord | null> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(METADATA_STORE, 'readonly');
        const store = tx.objectStore(METADATA_STORE);
        const req = store.get(editionId);

        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async saveMetadata(record: PublicationMetadataRecord): Promise<boolean> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(METADATA_STORE, 'readwrite');
        const store = tx.objectStore(METADATA_STORE);
        const req = store.put(record);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Packages
  async getPackagesByBookId(bookId: string): Promise<PublicationPackage[]> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(PACKAGES_STORE, 'readonly');
        const store = tx.objectStore(PACKAGES_STORE);
        const index = store.index('bookId');
        const req = index.getAll(bookId);

        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async savePackage(pkg: PublicationPackage): Promise<boolean> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(PACKAGES_STORE, 'readwrite');
        const store = tx.objectStore(PACKAGES_STORE);
        const req = store.put(pkg);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Evidence Ledger
  async getLedgerEventsByBookId(bookId: string): Promise<LedgerEvent[]> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LEDGER_STORE, 'readonly');
        const store = tx.objectStore(LEDGER_STORE);
        const index = store.index('bookId');
        const req = index.getAll(bookId);

        req.onsuccess = () => {
          const events: LedgerEvent[] = req.result || [];
          // Sort newest first
          events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(events);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async addLedgerEvent(event: LedgerEvent): Promise<boolean> {
    try {
      const db = await openPublishingDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LEDGER_STORE, 'readwrite');
        const store = tx.objectStore(LEDGER_STORE);
        const req = store.add(event);

        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },
};

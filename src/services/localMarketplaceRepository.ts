import {
  AuthorRecord,
  ListingRecord,
  BuyerEntitlementRecord,
  OrderRecord,
} from '../domain/marketplace/marketplaceTypes';
import { MarketplaceEvent } from '../domain/marketplace/marketplaceEvidence';

const DB_NAME = 'editoryniq_marketplace_db';
const DB_VERSION = 1;
const AUTHORS_STORE = 'authors';
const LISTINGS_STORE = 'listings';
const ENTITLEMENTS_STORE = 'buyer_entitlements';
const ORDERS_STORE = 'commerce_orders';
const EVENTS_STORE = 'marketplace_events';

function openMarketplaceDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not available'));
      return;
    }

    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(AUTHORS_STORE)) {
        db.createObjectStore(AUTHORS_STORE, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(LISTINGS_STORE)) {
        const listingStore = db.createObjectStore(LISTINGS_STORE, { keyPath: 'id' });
        listingStore.createIndex('bookId', 'bookId', { unique: false });
        listingStore.createIndex('authorId', 'authorId', { unique: false });
        listingStore.createIndex('category', 'category', { unique: false });
        listingStore.createIndex('listingStatus', 'listingStatus', { unique: false });
      }

      if (!db.objectStoreNames.contains(ENTITLEMENTS_STORE)) {
        const entStore = db.createObjectStore(ENTITLEMENTS_STORE, { keyPath: 'id' });
        entStore.createIndex('listingId', 'listingId', { unique: false });
        entStore.createIndex('buyerReference', 'buyerReference', { unique: false });
      }

      if (!db.objectStoreNames.contains(ORDERS_STORE)) {
        const orderStore = db.createObjectStore(ORDERS_STORE, { keyPath: 'id' });
        orderStore.createIndex('listingId', 'listingId', { unique: false });
      }

      if (!db.objectStoreNames.contains(EVENTS_STORE)) {
        const evtStore = db.createObjectStore(EVENTS_STORE, { keyPath: 'id' });
        evtStore.createIndex('listingId', 'listingId', { unique: false });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export const localMarketplaceRepository = {
  // Authors
  async getAuthors(): Promise<AuthorRecord[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(AUTHORS_STORE, 'readonly');
        const store = tx.objectStore(AUTHORS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async getAuthorById(id: string): Promise<AuthorRecord | null> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(AUTHORS_STORE, 'readonly');
        const store = tx.objectStore(AUTHORS_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async saveAuthor(author: AuthorRecord): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(AUTHORS_STORE, 'readwrite');
        const store = tx.objectStore(AUTHORS_STORE);
        const updated = { ...author, updatedAt: new Date().toISOString() };
        const req = store.put(updated);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Listings
  async getListings(): Promise<ListingRecord[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LISTINGS_STORE, 'readonly');
        const store = tx.objectStore(LISTINGS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async getListingById(id: string): Promise<ListingRecord | null> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LISTINGS_STORE, 'readonly');
        const store = tx.objectStore(LISTINGS_STORE);
        const req = store.get(id);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  },

  async getListingsByBookId(bookId: string): Promise<ListingRecord[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LISTINGS_STORE, 'readonly');
        const store = tx.objectStore(LISTINGS_STORE);
        const index = store.index('bookId');
        const req = index.getAll(bookId);
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async saveListing(listing: ListingRecord): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LISTINGS_STORE, 'readwrite');
        const store = tx.objectStore(LISTINGS_STORE);
        const updated = { ...listing, updatedAt: new Date().toISOString() };
        const req = store.put(updated);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  async deleteListing(id: string): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(LISTINGS_STORE, 'readwrite');
        const store = tx.objectStore(LISTINGS_STORE);
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Buyer Entitlements
  async getEntitlements(): Promise<BuyerEntitlementRecord[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ENTITLEMENTS_STORE, 'readonly');
        const store = tx.objectStore(ENTITLEMENTS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async saveEntitlement(entitlement: BuyerEntitlementRecord): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ENTITLEMENTS_STORE, 'readwrite');
        const store = tx.objectStore(ENTITLEMENTS_STORE);
        const req = store.put(entitlement);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Orders
  async getOrders(): Promise<OrderRecord[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ORDERS_STORE, 'readonly');
        const store = tx.objectStore(ORDERS_STORE);
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async saveOrder(order: OrderRecord): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(ORDERS_STORE, 'readwrite');
        const store = tx.objectStore(ORDERS_STORE);
        const req = store.put(order);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },

  // Events
  async getMarketplaceEvents(listingId?: string): Promise<MarketplaceEvent[]> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EVENTS_STORE, 'readonly');
        const store = tx.objectStore(EVENTS_STORE);
        let req: IDBRequest;
        if (listingId) {
          const index = store.index('listingId');
          req = index.getAll(listingId);
        } else {
          req = store.getAll();
        }
        req.onsuccess = () => {
          const evts: MarketplaceEvent[] = req.result || [];
          evts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          resolve(evts);
        };
        req.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async addMarketplaceEvent(evt: MarketplaceEvent): Promise<boolean> {
    try {
      const db = await openMarketplaceDB();
      return new Promise((resolve) => {
        const tx = db.transaction(EVENTS_STORE, 'readwrite');
        const store = tx.objectStore(EVENTS_STORE);
        const req = store.add(evt);
        req.onsuccess = () => resolve(true);
        req.onerror = () => resolve(false);
      });
    } catch {
      return false;
    }
  },
};

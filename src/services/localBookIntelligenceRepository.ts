import { E1BookPackage, ApprovedBlueprintSnapshot } from '../domain/intelligence/bookIntelligenceTypes';
import { createDefaultMarketProfile } from '../domain/intelligence/bookMarketIntelligence';
import { createDefaultBlueprint } from '../domain/intelligence/blueprintEngine';
import { createInitialPageBudget } from '../domain/intelligence/pageBudgetEngine';
import { evaluateE1Readiness } from '../domain/intelligence/e1Readiness';
import { BookProject } from '../domain/bookProjectTypes';
import { localBookRepository } from './localBookRepository';

const DB_NAME = 'EditorynIQ_E1_DB';
const DB_VERSION = 1;
const STORE_NAME = 'book_intelligence';
const LOCAL_STORAGE_BACKUP = 'editoryniq_e1_backup';

function openE1Database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'bookId' });
      }
    };
  });
}

function getLocalStorageE1Packages(): Record<string, E1BookPackage> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalStorageE1Packages(packages: Record<string, E1BookPackage>): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_BACKUP, JSON.stringify(packages));
    return true;
  } catch (err) {
    console.error('LocalStorage E1 write failed:', err);
    return false;
  }
}

export const localBookIntelligenceRepository = {
  async getE1Package(project: BookProject): Promise<E1BookPackage> {
    try {
      const db = await openE1Database();
      const existing = await new Promise<E1BookPackage | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(project.id);
        req.onsuccess = () => resolve((req.result as E1BookPackage) || null);
        req.onerror = () => resolve(null);
      });

      if (existing) {
        existing.readinessReport = evaluateE1Readiness(project, existing);
        return existing;
      }
    } catch {
      const localMap = getLocalStorageE1Packages();
      if (localMap[project.id]) {
        const pkg = localMap[project.id];
        pkg.readinessReport = evaluateE1Readiness(project, pkg);
        return pkg;
      }
    }

    // Initialize fresh E1 package for project
    const defaultBlueprint = createDefaultBlueprint(project.targetPageCount);
    const defaultBudget = createInitialPageBudget(project.targetPageCount, defaultBlueprint);
    const defaultMarket = createDefaultMarketProfile();
    defaultMarket.category = project.category;
    defaultMarket.targetAudience = project.targetAudience;

    const initialPackage: E1BookPackage = {
      bookId: project.id,
      status: 'BLUEPRINT_IN_PROGRESS',
      marketProfile: defaultMarket,
      researchSources: [],
      blueprint: defaultBlueprint,
      pageBudget: defaultBudget,
      memoryEntries: [
        {
          id: `mem_init_${Date.now()}`,
          type: 'style',
          termOrKey: 'Editorial Profile',
          definitionOrValue: `Selected Profile: ${project.profile.toUpperCase()} · Target Pages: ${project.targetPageCount}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      readinessReport: {
        bookId: project.id,
        checks: [],
        isReadyForApproval: false,
        status: 'BLUEPRINT_IN_PROGRESS',
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    initialPackage.readinessReport = evaluateE1Readiness(project, initialPackage);

    await this.saveE1Package(initialPackage);
    return initialPackage;
  },

  async saveE1Package(pkg: E1BookPackage): Promise<boolean> {
    pkg.updatedAt = new Date().toISOString();

    let idbSuccess = false;
    try {
      const db = await openE1Database();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(pkg);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      idbSuccess = true;
    } catch (err) {
      console.warn('IndexedDB save failed, falling back to localStorage:', err);
    }

    const localMap = getLocalStorageE1Packages();
    localMap[pkg.bookId] = pkg;
    const lsSuccess = saveLocalStorageE1Packages(localMap);

    return idbSuccess || lsSuccess;
  },

  async approveE1Blueprint(project: BookProject, pkg: E1BookPackage, approverName: string): Promise<E1BookPackage> {
    const readiness = evaluateE1Readiness(project, pkg);
    if (!readiness.isReadyForApproval) {
      throw new Error('Cannot approve E1 Blueprint: blocking validation checks failed.');
    }

    const approvedAt = new Date().toISOString();

    // Create Immutable Approved Blueprint Snapshot
    const snapshot: ApprovedBlueprintSnapshot = {
      version: pkg.blueprint.version,
      chapters: JSON.parse(JSON.stringify(pkg.blueprint.chapters)),
      pageBudget: JSON.parse(JSON.stringify(pkg.pageBudget)),
      approvedAt,
      approvedBy: approverName,
    };

    pkg.status = 'APPROVED';
    pkg.approvedVersion = pkg.blueprint.version;
    pkg.approvedAt = approvedAt;
    pkg.approvedBlueprintSnapshot = snapshot;
    pkg.blueprint.approved = true;
    pkg.blueprint.approvedAt = approvedAt;
    pkg.blueprint.approvedBy = approverName;

    pkg.readinessReport.status = 'APPROVED';

    project.status = 'READY_FOR_BLUEPRINT';
    await localBookRepository.saveProject(
      {
        mode: project.mode,
        title: project.title,
        description: project.description,
        targetAudience: project.targetAudience,
        category: project.category,
        productionLanguage: project.productionLanguage,
        profile: project.profile,
        targetPageCount: project.targetPageCount,
        authorNotes: project.authorNotes,
        sourceText: project.sourceText,
        sourceFileName: project.sourceFileName,
      },
      project.id
    );

    const saved = await this.saveE1Package(pkg);
    if (!saved) {
      throw new Error('STORAGE_FAILED: Both IndexedDB and LocalStorage failed to persist approval.');
    }

    return pkg;
  },
};

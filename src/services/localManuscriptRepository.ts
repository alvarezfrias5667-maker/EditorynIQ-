import { ManuscriptProject, ManuscriptChapter, TranslationDraft } from '../domain/manuscript/manuscriptTypes';
import { initializeChaptersFromSnapshot, updateChapterContent } from '../domain/manuscript/chapterManager';
import { createDefaultTerminology } from '../domain/manuscript/terminologyGuardian';
import { evaluateE2Readiness } from '../domain/manuscript/e2Readiness';
import { BookProject } from '../domain/bookProjectTypes';
import { E1BookPackage } from '../domain/intelligence/bookIntelligenceTypes';
import { localBookIntelligenceRepository } from './localBookIntelligenceRepository';

const DB_NAME = 'EditorynIQ_E2_DB';
const DB_VERSION = 1;
const STORE_NAME = 'manuscript_factory';
const LOCAL_STORAGE_BACKUP = 'editoryniq_e2_backup';

function openE2Database(): Promise<IDBDatabase> {
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

function getLocalStorageE2Projects(): Record<string, ManuscriptProject> {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BACKUP);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalStorageE2Projects(projects: Record<string, ManuscriptProject>): boolean {
  try {
    localStorage.setItem(LOCAL_STORAGE_BACKUP, JSON.stringify(projects));
    return true;
  } catch (err) {
    console.error('LocalStorage E2 write failed:', err);
    return false;
  }
}

export const localManuscriptRepository = {
  async getManuscriptProject(project: BookProject): Promise<ManuscriptProject> {
    const e1Pkg: E1BookPackage = await localBookIntelligenceRepository.getE1Package(project);
    const snapshot = e1Pkg.approvedBlueprintSnapshot || {
      version: e1Pkg.blueprint.version,
      chapters: e1Pkg.blueprint.chapters,
      pageBudget: e1Pkg.pageBudget,
      approvedAt: e1Pkg.approvedAt || new Date().toISOString(),
      approvedBy: e1Pkg.blueprint.approvedBy || 'Author',
    };

    try {
      const db = await openE2Database();
      const existing = await new Promise<ManuscriptProject | null>((resolve) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(project.id);
        req.onsuccess = () => resolve((req.result as ManuscriptProject) || null);
        req.onerror = () => resolve(null);
      });

      if (existing) {
        existing.readinessReport = evaluateE2Readiness(existing);
        return existing;
      }
    } catch {
      const localMap = getLocalStorageE2Projects();
      if (localMap[project.id]) {
        const mproj = localMap[project.id];
        mproj.readinessReport = evaluateE2Readiness(mproj);
        return mproj;
      }
    }

    // Initialize fresh ManuscriptProject from approved blueprint
    const chapters = initializeChaptersFromSnapshot(snapshot);
    const initialProject: ManuscriptProject = {
      bookId: project.id,
      title: project.title,
      productionLanguage: project.productionLanguage,
      profile: project.profile,
      category: project.category,
      targetPageCount: project.targetPageCount,
      blueprintSnapshot: snapshot,
      chapters,
      terminology: createDefaultTerminology(),
      translations: [],
      status: 'NOT_STARTED',
      updatedAt: new Date().toISOString(),
    };

    initialProject.readinessReport = evaluateE2Readiness(initialProject);
    await this.saveManuscriptProject(initialProject);
    return initialProject;
  },

  async saveManuscriptProject(mproj: ManuscriptProject): Promise<boolean> {
    mproj.updatedAt = new Date().toISOString();
    mproj.readinessReport = evaluateE2Readiness(mproj);

    let idbSuccess = false;
    try {
      const db = await openE2Database();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(mproj);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
      idbSuccess = true;
    } catch (err) {
      console.warn('IndexedDB E2 save failed, falling back to localStorage:', err);
    }

    const localMap = getLocalStorageE2Projects();
    localMap[mproj.bookId] = mproj;
    const lsSuccess = saveLocalStorageE2Projects(localMap);

    return idbSuccess || lsSuccess;
  },

  async updateChapterText(
    project: BookProject,
    mproj: ManuscriptProject,
    chapterId: string,
    newContent: string,
    authorNote?: string,
    createdBy: 'author' | 'ai_assistant' | 'translator' = 'author'
  ): Promise<{ updatedProject: ManuscriptProject; savedSuccessfully: boolean }> {
    const updatedChapters = updateChapterContent(mproj.chapters, chapterId, newContent, authorNote, createdBy);
    const updatedMproj: ManuscriptProject = {
      ...mproj,
      chapters: updatedChapters,
      updatedAt: new Date().toISOString(),
    };

    const savedSuccessfully = await this.saveManuscriptProject(updatedMproj);
    return { updatedProject: updatedMproj, savedSuccessfully };
  },

  async saveTranslationDraft(mproj: ManuscriptProject, draft: TranslationDraft): Promise<boolean> {
    const idx = mproj.translations.findIndex((t) => t.id === draft.id);
    let updatedTranslations: TranslationDraft[];
    if (idx >= 0) {
      updatedTranslations = [...mproj.translations];
      updatedTranslations[idx] = draft;
    } else {
      updatedTranslations = [...mproj.translations, draft];
    }

    const updatedMproj: ManuscriptProject = {
      ...mproj,
      translations: updatedTranslations,
      updatedAt: new Date().toISOString(),
    };

    return await this.saveManuscriptProject(updatedMproj);
  },
};

import { BookProject, BookProjectInput } from '../domain/bookProjectTypes';
import { getLengthClass } from '../domain/bookIntakeValidation';

const DB_NAME = 'EditorynIQ_Local_DB';
const DB_VERSION = 1;
const STORE_NAME = 'book_projects';
const LOCAL_STORAGE_KEY = 'editoryniq_local_projects_backup';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// LocalStorage Fallback helper
function getLocalStorageProjects(): BookProject[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageProjects(projects: BookProject[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
  } catch (err) {
    console.error('LocalStorage write failed:', err);
  }
}

export const localBookRepository = {
  async getAllProjects(): Promise<BookProject[]> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const result = (request.result || []) as BookProject[];
          // Sort by updatedAt descending
          result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(result);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      // Fallback
      const projects = getLocalStorageProjects();
      projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return projects;
    }
  },

  async getProjectById(id: string): Promise<BookProject | null> {
    try {
      const db = await openDatabase();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve((request.result as BookProject) || null);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const projects = getLocalStorageProjects();
      return projects.find((p) => p.id === id) || null;
    }
  },

  async saveProject(input: BookProjectInput, existingId?: string): Promise<BookProject> {
    const now = new Date().toISOString();
    const id = existingId || `book_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const pageCount = Number(input.targetPageCount);

    let createdDate = now;
    if (existingId) {
      const existing = await this.getProjectById(existingId);
      if (existing) {
        createdDate = existing.createdAt;
      }
    }

    const project: BookProject = {
      id,
      mode: input.mode,
      title: input.title.trim(),
      description: input.description.trim(),
      targetAudience: input.targetAudience.trim(),
      category: input.category,
      productionLanguage: input.productionLanguage,
      profile: input.profile,
      targetPageCount: pageCount,
      lengthClass: getLengthClass(pageCount),
      authorNotes: (input.authorNotes || '').trim(),
      sourceText: input.sourceText ? input.sourceText.trim() : undefined,
      sourceFileName: input.sourceFileName,
      status: input.sourceText && input.sourceText.length > 500 ? 'READY_FOR_BLUEPRINT' : 'DRAFT_LOCAL',
      createdAt: createdDate,
      updatedAt: now,
    };

    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(project);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const projects = getLocalStorageProjects();
      const idx = projects.findIndex((p) => p.id === id);
      if (idx >= 0) {
        projects[idx] = project;
      } else {
        projects.push(project);
      }
      saveLocalStorageProjects(projects);
    }

    return project;
  },

  async deleteProject(id: string): Promise<boolean> {
    try {
      const db = await openDatabase();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
      return true;
    } catch {
      const projects = getLocalStorageProjects();
      const filtered = projects.filter((p) => p.id !== id);
      saveLocalStorageProjects(filtered);
      return true;
    }
  },

  exportProjectJson(project: BookProject): void {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `editoryniq_${project.id}_${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },
};

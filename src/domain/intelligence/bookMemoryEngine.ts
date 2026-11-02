import { BookMemoryEntry, MemoryEntryType } from './bookIntelligenceTypes';

export function createMemoryEntry(type: MemoryEntryType, termOrKey: string, definitionOrValue: string): BookMemoryEntry {
  const now = new Date().toISOString();
  return {
    id: `mem_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    termOrKey: termOrKey.trim(),
    definitionOrValue: definitionOrValue.trim(),
    createdAt: now,
    updatedAt: now,
  };
}

export function filterMemoryEntries(entries: BookMemoryEntry[], typeFilter?: MemoryEntryType, searchKeyword?: string): BookMemoryEntry[] {
  return entries.filter((e) => {
    if (typeFilter && e.type !== typeFilter) return false;
    if (searchKeyword && searchKeyword.trim().length > 0) {
      const q = searchKeyword.toLowerCase().trim();
      return e.termOrKey.toLowerCase().includes(q) || e.definitionOrValue.toLowerCase().includes(q);
    }
    return true;
  });
}

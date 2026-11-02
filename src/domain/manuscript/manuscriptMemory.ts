import { BookMemoryEntry } from '../intelligence/bookIntelligenceTypes';

export function getRelevantMemoryForChapter(entries: BookMemoryEntry[], chapterTitle: string): BookMemoryEntry[] {
  const q = chapterTitle.toLowerCase();
  return entries.filter((e) => {
    if (e.chapterRef && e.chapterRef.toLowerCase() === q) return true;
    return e.type === 'concept' || e.type === 'style' || e.type === 'constraint' || e.type === 'terminology';
  });
}

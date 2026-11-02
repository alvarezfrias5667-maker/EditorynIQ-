import { ManuscriptChapter, ChapterVersion, ChapterStatus } from './manuscriptTypes';
import { ApprovedBlueprintSnapshot } from '../intelligence/bookIntelligenceTypes';
import { calculateTextStats } from './manuscriptEngine';

export function initializeChaptersFromSnapshot(snapshot: ApprovedBlueprintSnapshot): ManuscriptChapter[] {
  const now = new Date().toISOString();
  return snapshot.chapters.map((ch) => ({
    id: `mchap_${ch.id}`,
    blueprintChapterId: ch.id,
    order: ch.order,
    title: ch.title,
    objective: ch.objective,
    plannedPages: ch.estimatedPages,
    currentContent: '',
    wordCount: 0,
    charCount: 0,
    estimatedPages: 0,
    status: 'NOT_STARTED' as ChapterStatus,
    versions: [],
    lastEditedBy: 'author',
    updatedAt: now,
  }));
}

export function updateChapterContent(
  chapters: ManuscriptChapter[],
  chapterId: string,
  newContent: string,
  authorNote?: string,
  createdBy: 'author' | 'ai_assistant' | 'translator' = 'author'
): ManuscriptChapter[] {
  const now = new Date().toISOString();
  const { wordCount, charCount, estimatedPages } = calculateTextStats(newContent);

  return chapters.map((ch) => {
    if (ch.id === chapterId) {
      const newVersionNum = ch.versions.length + 1;
      const newVer: ChapterVersion = {
        id: `ver_${newVersionNum}_${Date.now()}`,
        versionNumber: newVersionNum,
        chapterId: ch.id,
        content: newContent,
        wordCount,
        charCount,
        authorNote,
        createdBy,
        createdAt: now,
      };

      let newStatus: ChapterStatus = ch.status;
      if (wordCount > 50 && ch.status === 'NOT_STARTED') {
        newStatus = 'IN_PROGRESS';
      } else if (wordCount > ch.plannedPages * 200 && (ch.status === 'IN_PROGRESS' || ch.status === 'NOT_STARTED')) {
        newStatus = 'DRAFT_COMPLETE';
      }

      return {
        ...ch,
        currentContent: newContent,
        wordCount,
        charCount,
        estimatedPages,
        status: newStatus,
        versions: [newVer, ...ch.versions],
        lastEditedBy: createdBy,
        updatedAt: now,
      };
    }
    return ch;
  });
}

export function searchManuscriptText(chapters: ManuscriptChapter[], query: string): { chapterId: string; chapterTitle: string; matchCount: number }[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  return chapters
    .map((ch) => {
      const matches = (ch.currentContent.toLowerCase().match(new RegExp(q, 'g')) || []).length;
      return {
        chapterId: ch.id,
        chapterTitle: ch.title,
        matchCount: matches,
      };
    })
    .filter((res) => res.matchCount > 0);
}

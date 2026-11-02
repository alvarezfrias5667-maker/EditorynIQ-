import { ManuscriptChapter, ChapterVersion } from './manuscriptTypes';

export function getChapterVersionHistory(chapter: ManuscriptChapter): ChapterVersion[] {
  return chapter.versions || [];
}

export function restoreChapterVersion(chapter: ManuscriptChapter, versionId: string): ManuscriptChapter {
  const targetVer = (chapter.versions || []).find((v) => v.id === versionId);
  if (!targetVer) return chapter;

  return {
    ...chapter,
    currentContent: targetVer.content,
    wordCount: targetVer.wordCount,
    charCount: targetVer.charCount,
    estimatedPages: Math.round(targetVer.wordCount / 250),
    updatedAt: new Date().toISOString(),
  };
}

import { ManuscriptChapter, ManuscriptProject } from './manuscriptTypes';

export function calculateTextStats(text: string): { wordCount: number; charCount: number; estimatedPages: number } {
  const cleanText = text ? text.trim() : '';
  const wordCount = cleanText.length > 0 ? cleanText.split(/\s+/).length : 0;
  const charCount = text ? text.length : 0;
  const estimatedPages = Math.round(wordCount / 250);
  return { wordCount, charCount, estimatedPages };
}

export function calculateProjectManuscriptStats(chapters: ManuscriptChapter[]): {
  totalWords: number;
  totalChars: number;
  totalEstimatedPages: number;
  completedChapters: number;
  progressPercentage: number;
} {
  let totalWords = 0;
  let totalChars = 0;
  let totalEstimatedPages = 0;
  let completedChapters = 0;

  chapters.forEach((ch) => {
    totalWords += ch.wordCount || 0;
    totalChars += ch.charCount || 0;
    totalEstimatedPages += ch.estimatedPages || 0;
    if (ch.status === 'APPROVED' || ch.status === 'DRAFT_COMPLETE') {
      completedChapters += 1;
    }
  });

  const progressPercentage = chapters.length > 0 ? Math.round((completedChapters / chapters.length) * 100) : 0;

  return {
    totalWords,
    totalChars,
    totalEstimatedPages,
    completedChapters,
    progressPercentage,
  };
}

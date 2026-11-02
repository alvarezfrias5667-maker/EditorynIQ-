import { ManuscriptChapter, EditorialReviewIssue, EditorialReviewReport } from './manuscriptTypes';

export function runContinuityAudit(chapters: ManuscriptChapter[], targetPages: number): EditorialReviewReport {
  const issues: EditorialReviewIssue[] = [];
  let totalWords = 0;
  let totalEstPages = 0;

  chapters.forEach((ch, idx) => {
    totalWords += ch.wordCount;
    totalEstPages += ch.estimatedPages;

    // Target Word Count Deviation Check (Target ~ 250 words per page)
    const targetChapterWords = ch.plannedPages * 250;
    if (ch.wordCount === 0 && ch.status !== 'NOT_STARTED') {
      issues.push({
        id: `iss_empty_${ch.id}`,
        type: 'word_count_deviation',
        severity: 'warning',
        message: `Chapter ${ch.order} ("${ch.title}") has no written text.`,
        chapterId: ch.id,
      });
    } else if (ch.wordCount > 0 && Math.abs(ch.wordCount - targetChapterWords) > targetChapterWords * 0.5) {
      issues.push({
        id: `iss_wc_${ch.id}`,
        type: 'word_count_deviation',
        severity: 'info',
        message: `Chapter ${ch.order} word count (${ch.wordCount} words) deviates by >50% from planned target (${targetChapterWords} words).`,
        chapterId: ch.id,
      });
    }

    // Duplicate text check within chapter
    if (ch.currentContent.length > 500) {
      const paragraphs = ch.currentContent.split('\n\n').filter((p) => p.trim().length > 100);
      const uniquePara = new Set(paragraphs.map((p) => p.trim().toLowerCase()));
      if (paragraphs.length - uniquePara.size > 0) {
        issues.push({
          id: `iss_rep_${ch.id}`,
          type: 'repetition',
          severity: 'warning',
          message: `Possible repeated paragraph detected in Chapter ${ch.order}.`,
          chapterId: ch.id,
        });
      }
    }
  });

  const isPassed = issues.filter((i) => i.severity === 'error').length === 0;

  return {
    bookId: chapters[0]?.id || 'unknown',
    totalWords,
    totalEstimatedPages: totalEstPages,
    issues,
    isPassed,
    reviewedAt: new Date().toISOString(),
  };
}

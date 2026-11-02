import { ManuscriptChapter, EditorialReviewReport } from './manuscriptTypes';
import { runContinuityAudit } from './continuityEngine';

export function performFullEditorialReview(chapters: ManuscriptChapter[], targetPages: number): EditorialReviewReport {
  return runContinuityAudit(chapters, targetPages);
}

import { ManuscriptProject, E2ReadinessReport, E2ReadinessCheckItem, E2ProjectStatus } from './manuscriptTypes';

export function evaluateE2Readiness(manuscriptProj: ManuscriptProject): E2ReadinessReport {
  const checks: E2ReadinessCheckItem[] = [];

  // 1. Approved Blueprint Snapshot Check
  const snapshotPassed = Boolean(manuscriptProj.blueprintSnapshot && manuscriptProj.blueprintSnapshot.version >= 1);
  checks.push({
    id: 'e2_chk_blueprint',
    key: 'readiness.e2ApprovedBlueprint',
    passed: snapshotPassed,
    isBlocking: true,
    details: snapshotPassed ? `Approved E1 Blueprint Snapshot v${manuscriptProj.blueprintSnapshot.version} verified.` : 'E1 Blueprint must be approved before manuscript production.',
  });

  // 2. Chapters Created Check
  const totalChapters = manuscriptProj.chapters.length;
  const chaptersPassed = totalChapters >= 1;
  checks.push({
    id: 'e2_chk_chapters',
    key: 'readiness.e2ChaptersExist',
    passed: chaptersPassed,
    isBlocking: true,
    details: chaptersPassed ? `${totalChapters} manuscript chapter workspace(s) initialized.` : 'No manuscript chapters found.',
  });

  // 3. Draft Words Progress Check
  const totalWords = manuscriptProj.chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0);
  const minWordsTarget = manuscriptProj.targetPageCount * 150; // At least ~150 words/page overall draft
  const progressPassed = totalWords >= minWordsTarget;
  checks.push({
    id: 'e2_chk_words',
    key: 'readiness.e2WordCountProgress',
    passed: progressPassed,
    isBlocking: false, // Informative check
    details: progressPassed ? `Manuscript total words (${totalWords.toLocaleString()}) meets draft target.` : `Current word count (${totalWords.toLocaleString()}) is under draft target (${minWordsTarget.toLocaleString()}).`,
  });

  // 4. All Chapters Drafted
  const incompleteChapters = manuscriptProj.chapters.filter((ch) => ch.status === 'NOT_STARTED').length;
  const allDraftedPassed = incompleteChapters === 0 && totalWords > 1000;
  checks.push({
    id: 'e2_chk_drafted',
    key: 'readiness.e2AllChaptersDrafted',
    passed: allDraftedPassed,
    isBlocking: false,
    details: allDraftedPassed ? 'All chapters have drafted text.' : `${incompleteChapters} chapter(s) have not been started yet.`,
  });

  const blockingFailed = checks.some((c) => c.isBlocking && !c.passed);
  const isReadyForE3 = !blockingFailed && totalWords > 1000;

  let computedStatus: E2ProjectStatus = manuscriptProj.status;
  if (blockingFailed) {
    computedStatus = 'NOT_STARTED';
  } else if (isReadyForE3) {
    computedStatus = 'READY_FOR_E3_VISUALS';
  } else if (totalWords > 0) {
    computedStatus = 'DRAFTING_IN_PROGRESS';
  }

  return {
    bookId: manuscriptProj.bookId,
    checks,
    isReadyForE3,
    status: computedStatus,
    updatedAt: new Date().toISOString(),
  };
}

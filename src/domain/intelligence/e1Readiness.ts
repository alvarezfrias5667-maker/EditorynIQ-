import { BookProject } from '../bookProjectTypes';
import { E1BookPackage, E1ReadinessReport, E1ReadinessCheckItem, E1ProjectStatus } from './bookIntelligenceTypes';

export function evaluateE1Readiness(project: BookProject, e1Package: E1BookPackage): E1ReadinessReport {
  const checks: E1ReadinessCheckItem[] = [];

  // 1. Brief Check
  const briefPassed = Boolean(
    project.title &&
      project.title.trim().length > 0 &&
      project.description &&
      project.description.trim().length > 0 &&
      project.targetAudience &&
      project.targetAudience.trim().length > 0
  );
  checks.push({
    id: 'chk_brief',
    key: 'readiness.checkBrief',
    passed: briefPassed,
    isBlocking: true,
    details: briefPassed
      ? 'Book working title, description, and audience parameters are complete.'
      : 'Book Brief parameters are incomplete.',
  });

  // 2. Production Language Check
  const langPassed = ['en', 'es'].includes(project.productionLanguage);
  checks.push({
    id: 'chk_lang',
    key: 'readiness.checkLanguage',
    passed: langPassed,
    isBlocking: true,
    details: langPassed
      ? `Production language "${project.productionLanguage.toUpperCase()}" is supported.`
      : 'Unsupported production language.',
  });

  // 3. Blueprint Structural Architecture & Chapter Density Check
  const chapters = e1Package.blueprint?.chapters || [];
  const chaptersCount = chapters.length;
  const targetPages = project.targetPageCount || 250;
  
  const maxAllocatedInSingleChapter = chapters.reduce((max, c) => Math.max(max, c.estimatedPages || 0), 0);
  const isDensityBalanced = !(targetPages > 100 && chaptersCount < 3) && !(maxAllocatedInSingleChapter > 50);

  const chaptersPassed = chaptersCount >= 1 && isDensityBalanced;
  checks.push({
    id: 'chk_chapters',
    key: 'readiness.checkChapters',
    passed: chaptersPassed,
    isBlocking: true,
    details: !chaptersCount
      ? 'Blueprint must contain at least 1 defined chapter.'
      : !isDensityBalanced
      ? `Structural Imbalance: ${chaptersCount} chapter(s) with up to ${maxAllocatedInSingleChapter} pgs/chap for a ${targetPages}-page book. Expand chapter breakdown.`
      : `Architectural blueprint contains ${chaptersCount} well-proportioned chapter(s) (max ${maxAllocatedInSingleChapter} pgs/chap).`,
  });

  // 4. Page Budget Balance Check (ALLOCATED = TARGET)
  const budgetBalanced = e1Package.pageBudget?.isBalanced ?? false;
  checks.push({
    id: 'chk_budget',
    key: 'readiness.checkBudget',
    passed: budgetBalanced,
    isBlocking: true,
    details: budgetBalanced
      ? `Allocated pages (${e1Package.pageBudget.allocatedPages}) match target page budget (${e1Package.pageBudget.targetPages}).`
      : `Page budget unbalanced: Allocated (${e1Package.pageBudget.allocatedPages}) vs Target (${e1Package.pageBudget.targetPages}).`,
  });

  // 5. Research Bibliography & Verification Check
  const isFiction = ['fiction', 'poetry', 'children'].includes(project.category);
  const sourcesCount = e1Package.researchSources?.length || 0;
  const researchPassed = isFiction || sourcesCount >= 1;
  checks.push({
    id: 'chk_research',
    key: 'readiness.checkResearch',
    passed: researchPassed,
    isBlocking: !isFiction, // Non-fiction requires at least 1 documented research source
    details: isFiction
      ? 'Fiction / Creative work: Research bibliography is optional.'
      : sourcesCount >= 1
      ? `${sourcesCount} research source(s) logged for non-fiction publication.`
      : 'Non-fiction and academic works require at least 1 documented research source.',
  });

  // 6. Master Memory Terminology Check
  const memoryPassed = (e1Package.memoryEntries?.length || 0) >= 1;
  checks.push({
    id: 'chk_memory',
    key: 'readiness.checkMemory',
    passed: memoryPassed,
    isBlocking: false,
    details: memoryPassed
      ? `${e1Package.memoryEntries.length} editorial memory entries logged.`
      : 'Initial editorial memory terms or style rules recommended.',
  });

  const blockingFailed = checks.some((c) => c.isBlocking && !c.passed);
  const isReadyForApproval = !blockingFailed;

  let computedStatus: E1ProjectStatus = e1Package.status;
  if (e1Package.status === 'APPROVED') {
    computedStatus = 'APPROVED';
  } else if (blockingFailed) {
    computedStatus = 'BLOCKED';
  } else if (isReadyForApproval) {
    computedStatus = 'READY_FOR_REVIEW';
  } else if (sourcesCount > 0) {
    computedStatus = 'RESEARCH_IN_PROGRESS';
  } else {
    computedStatus = 'BLUEPRINT_IN_PROGRESS';
  }

  return {
    bookId: project.id,
    checks,
    isReadyForApproval,
    status: computedStatus,
    updatedAt: new Date().toISOString(),
  };
}

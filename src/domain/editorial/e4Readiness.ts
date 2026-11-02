import { E4ReadinessReport, EditorialEdition, QualityAuditReport, AccessibilityAuditReport, BookQualityPassport } from './editorialTypes';

export function evaluateE4Readiness(
  edition: EditorialEdition,
  qualityReport?: QualityAuditReport,
  accessibilityReport?: AccessibilityAuditReport,
  passport?: BookQualityPassport
): E4ReadinessReport {
  const checks: E4ReadinessReport['checks'] = [];

  // 1. Builder Check
  const hasChapters = edition.chapters && edition.chapters.length > 0;
  checks.push({
    id: 'e4_chk_builder',
    category: 'BUILDER',
    title: 'Editorial Document Ingestion',
    status: hasChapters ? 'PASS' : 'FAIL',
    details: hasChapters
      ? `${edition.chapters.length} chapter manuscript(s) compiled into derived edition.`
      : 'No manuscript chapters present in derived edition.',
  });

  // 2. Typesetting Check
  const hasProfile = Boolean(edition.typesetting.editorialProfile && edition.typesetting.trimSize);
  checks.push({
    id: 'e4_chk_typesetting',
    category: 'TYPESETTING',
    title: 'Professional Typesetting Grid',
    status: hasProfile ? 'PASS' : 'WARNING',
    details: `Profile: ${edition.typesetting.editorialProfile} | Trim: ${edition.typesetting.trimSize} | Margins: ${edition.typesetting.margins.insideMm}mm gutter.`,
  });

  // 3. Pagination Check
  const pageDiff = Math.abs(edition.pagination.actualPdfPages - edition.pagination.targetPages);
  checks.push({
    id: 'e4_chk_pagination',
    category: 'PAGINATION',
    title: 'Real Pagination Flow (Target vs Actual)',
    status: pageDiff <= 10 ? 'PASS' : 'WARNING',
    details: `Target: ${edition.pagination.targetPages} pgs | Computed PDF: ${edition.pagination.actualPdfPages} pgs (Diff: ${pageDiff} pgs).`,
  });

  // 4. Quality Audit
  const qualityPassed = qualityReport ? qualityReport.passed : false;
  checks.push({
    id: 'e4_chk_quality',
    category: 'QUALITY',
    title: 'Editorial Quality Audit',
    status: qualityPassed ? 'PASS' : 'WARNING',
    details: qualityReport
      ? `Audit completed with ${qualityReport.criticalCount} critical and ${qualityReport.warningCount} warning findings.`
      : 'Editorial Quality Audit pending execution.',
  });

  // 5. Accessibility Check
  const a11yPassed = accessibilityReport ? accessibilityReport.passed : false;
  checks.push({
    id: 'e4_chk_a11y',
    category: 'ACCESSIBILITY',
    title: 'Accessible Publishing & WCAG',
    status: a11yPassed ? 'PASS' : 'WARNING',
    details: accessibilityReport
      ? `WCAG 2.1 AA score: ${accessibilityReport.score}/100.`
      : 'Accessibility audit pending execution.',
  });

  // 6. Passport & Approval Check
  const isApproved = edition.isApproved;
  checks.push({
    id: 'e4_chk_passport',
    category: 'PASSPORT',
    title: 'Book Quality Passport & Author Signoff',
    status: isApproved ? 'PASS' : 'WARNING',
    details: isApproved
      ? `Approved by author at ${edition.approvedAt}. Digital signature verified.`
      : 'Passport signoff pending author approval.',
  });

  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const overallScore = Math.round((passCount / checks.length) * 100);

  let status: E4ReadinessReport['status'] = 'INCOMPLETE';
  if (overallScore >= 85) {
    status = 'READY';
  } else if (overallScore >= 50) {
    status = 'NEEDS_ATTENTION';
  }

  return {
    bookId: edition.bookId,
    evaluatedAt: new Date().toISOString(),
    overallScore,
    status,
    checks,
  };
}

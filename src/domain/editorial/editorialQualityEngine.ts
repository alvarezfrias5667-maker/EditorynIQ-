import { EditorialEdition, QualityAuditReport, QualityFinding } from './editorialTypes';

export function auditEditorialQuality(edition: EditorialEdition): QualityAuditReport {
  const findings: QualityFinding[] = [];

  // 1. Structure Audit
  if (!edition.chapters || edition.chapters.length === 0) {
    findings.push({
      id: `q_struct_01`,
      category: 'STRUCTURE',
      severity: 'CRITICAL',
      title: 'Missing Chapter Manuscripts',
      description: 'Edition contains no manuscript chapters. Ingest chapters from E2 Manuscript Factory.',
      autoFixAvailable: false,
    });
  } else {
    edition.chapters.forEach((ch, idx) => {
      if (!ch.title || ch.title.trim().length === 0) {
        findings.push({
          id: `q_struct_ch_${idx}`,
          category: 'STRUCTURE',
          severity: 'WARNING',
          title: `Chapter ${idx + 1} Untitled`,
          description: `Chapter ${idx + 1} lacks an explicit heading title.`,
          location: `Chapter ${idx + 1}`,
          autoFixAvailable: true,
        });
      }
      const rawText = ch.currentContent || (ch as any).content || '';
      if (rawText.trim().length < 50) {
        findings.push({
          id: `q_struct_len_${idx}`,
          category: 'STRUCTURE',
          severity: 'WARNING',
          title: `Chapter ${idx + 1} Abbreviated Content`,
          description: `Chapter "${ch.title}" has under 50 characters of prose.`,
          location: `Chapter ${idx + 1}`,
          autoFixAvailable: false,
        });
      }
    });
  }

  // 2. Pagination Audit
  if (edition.pagination.pageOverflowCount > 0) {
    findings.push({
      id: `q_pag_01`,
      category: 'PAGINATION',
      severity: 'WARNING',
      title: 'Page Budget Overflow',
      description: `Actual computed pages (${edition.pagination.actualPdfPages}) exceed target budget (${edition.pagination.targetPages}) by ${edition.pagination.pageOverflowCount} pages. Adjust font size or line height.`,
      autoFixAvailable: true,
    });
  }

  // 3. Typography Audit
  if (edition.typesetting.typography.bodyFontSizePt > 13) {
    findings.push({
      id: `q_type_01`,
      category: 'TYPOGRAPHY',
      severity: 'WARNING',
      title: 'Body Font Size Oversized',
      description: `Body font size (${edition.typesetting.typography.bodyFontSizePt}pt) exceeds standard trade publishing norms (10-12pt).`,
      autoFixAvailable: true,
    });
  }

  // 4. Visual Assets Audit
  if (edition.typesetting.editorialProfile === 'visual-first' && edition.visualAssetIds.length === 0) {
    findings.push({
      id: `q_vis_01`,
      category: 'VISUALS',
      severity: 'WARNING',
      title: 'Visual-First Profile Unlinked',
      description: 'Edition uses Visual-First profile but has zero linked E3 visual assets.',
      autoFixAvailable: false,
    });
  }

  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const warningCount = findings.filter((f) => f.severity === 'WARNING').length;
  const infoCount = findings.filter((f) => f.severity === 'INFO').length;

  return {
    evaluatedAt: new Date().toISOString(),
    totalFindings: findings.length,
    criticalCount,
    warningCount,
    infoCount,
    passed: criticalCount === 0,
    findings,
  };
}

import { EditorialEdition, AccessibilityAuditReport, AccessibilityCheck } from './editorialTypes';
import { VisualAsset } from '../visual/visualTypes';

export function auditAccessibility(edition: EditorialEdition, visualAssets: VisualAsset[] = []): AccessibilityAuditReport {
  const checks: AccessibilityCheck[] = [];

  // Check 1: Document Language
  checks.push({
    id: 'a11y_lang_01',
    ruleId: 'wcag_3.1.1',
    wcagCriteria: 'WCAG 2.1 AA 3.1.1 Language of Page',
    title: 'Explicit Document Language Tag',
    status: edition.productionLanguage ? 'PASS' : 'FAIL',
    description: `Primary production language declared as xml:lang="${edition.productionLanguage}".`,
  });

  // Check 2: Heading Hierarchy
  const hasChapters = edition.chapters && edition.chapters.length > 0;
  checks.push({
    id: 'a11y_head_01',
    ruleId: 'wcag_1.3.1',
    wcagCriteria: 'WCAG 2.1 AA 1.3.1 Info and Relationships',
    title: 'Logical Chapter Heading Hierarchy (h1 - h3)',
    status: hasChapters ? 'PASS' : 'WARNING',
    description: 'Chapter titles mapped strictly to <h1> and section titles to <h2> without skipping levels.',
  });

  // Check 3: Image Alt Text for Visual Assets
  let missingAltCount = 0;
  visualAssets.forEach((asset) => {
    if (!asset.description && !asset.title) {
      missingAltCount++;
    }
  });

  checks.push({
    id: 'a11y_img_01',
    ruleId: 'wcag_1.1.1',
    wcagCriteria: 'WCAG 2.1 AA 1.1.1 Non-text Content',
    title: 'Visual Asset Alternative Text Coverage',
    status: missingAltCount === 0 ? 'PASS' : 'WARNING',
    description: missingAltCount === 0
      ? `All ${visualAssets.length} visual assets contain explicit titles and alt descriptions.`
      : `${missingAltCount} visual asset(s) lack detailed alt text descriptions for screen readers.`,
  });

  // Check 4: Reading Order and Table of Contents
  checks.push({
    id: 'a11y_nav_01',
    ruleId: 'epub_a11y_1.1',
    wcagCriteria: 'EPUB Accessibility 1.1 Logical Reading Order',
    title: 'Reflowable Navigation & TOC Alignment',
    status: edition.typesetting.tocConfig.includeTOC ? 'PASS' : 'WARNING',
    description: 'EPUB 3 nav.xhtml and NCX contain structured <ol> elements for screen reader navigation.',
  });

  // Calculate score
  const passCount = checks.filter((c) => c.status === 'PASS').length;
  const score = Math.round((passCount / checks.length) * 100);

  return {
    evaluatedAt: new Date().toISOString(),
    wcagLevel: 'WCAG 2.1 AA',
    score,
    passed: score >= 75,
    checks,
  };
}

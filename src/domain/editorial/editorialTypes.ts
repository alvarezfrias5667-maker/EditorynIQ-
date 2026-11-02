import { VisualAsset } from '../visual/visualTypes';
import { ManuscriptChapter } from '../manuscript/manuscriptTypes';

export type EditorialProfile = 'text-first' | 'visual-first' | 'technical-first';

export type TrimSize = '6x9' | '8.5x11' | 'a4' | '5.5x8.5' | '7x10';

export interface MarginMath {
  topMm: number;
  bottomMm: number;
  insideMm: number; // Gutter
  outsideMm: number;
  bleedMm: number;
}

export interface TypographySpec {
  headingFont: string;
  bodyFont: string;
  codeFont: string;
  bodyFontSizePt: number;
  bodyLineHeight: number;
  headingScale: number;
  paragraphSpacingPt: number;
  dropCaps: boolean;
  orphanControl: boolean;
  widowControl: boolean;
}

export interface TypesettingConfig {
  editorialProfile: EditorialProfile;
  trimSize: TrimSize;
  margins: MarginMath;
  typography: TypographySpec;
  runningHeader: {
    enabled: boolean;
    leftText: string; // e.g. Book Title
    rightText: string; // e.g. Chapter Title
  };
  runningFooter: {
    enabled: boolean;
    pageNumberingStyle: 'arabic' | 'roman' | 'none';
  };
  tocConfig: {
    includeTOC: boolean;
    maxDepth: number;
    dotLeader: boolean;
  };
}

export interface PaginationMetrics {
  targetPages: number;
  estimatedPages: number;
  actualPdfPages: number;
  frontMatterPages: number;
  bodyPages: number;
  backMatterPages: number;
  totalWords: number;
  wordsPerPageAvg: number;
  estimatedSpineWidthMm: number;
  pageOverflowCount: number;
  blankPagesCount: number;
}

export interface EditorialEdition {
  id: string; // EDITION_ID
  bookId: string; // BOOK_ID
  editionTitle: string;
  productionLanguage: 'en' | 'es';
  createdAt: string;
  updatedAt: string;
  version: number;
  isApproved: boolean;
  approvedAt?: string;
  typesetting: TypesettingConfig;
  pagination: PaginationMetrics;
  chapters: ManuscriptChapter[];
  visualAssetIds: string[];
  notes?: string;
}

export interface FormatExportResult {
  format: 'PDF' | 'EPUB' | 'DOCX';
  fileName: string;
  fileSizeBytes: number;
  sha256: string;
  generatedAt: string;
  pageCount?: number;
  isPressReady?: boolean;
  epubVersion?: '3.3';
  docxSchema?: 'OOXML-2016';
  validationStatus?: 'PASS' | 'NOT_TESTED' | 'WARNING';
  validationNote?: string;
  blobUrl?: string;
}

export interface QualityFinding {
  id: string;
  category: 'STRUCTURE' | 'TYPOGRAPHY' | 'PAGINATION' | 'VISUALS' | 'METADATA';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  description: string;
  location?: string;
  autoFixAvailable: boolean;
}

export interface QualityAuditReport {
  evaluatedAt: string;
  totalFindings: number;
  criticalCount: number;
  warningCount: number;
  infoCount: number;
  passed: boolean;
  findings: QualityFinding[];
}

export interface AccessibilityCheck {
  id: string;
  ruleId: string;
  wcagCriteria: string;
  title: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  description: string;
  affectedAssetId?: string;
}

export interface AccessibilityAuditReport {
  evaluatedAt: string;
  wcagLevel: 'WCAG 2.1 AA' | 'EPUB Accessibility 1.1';
  score: number; // 0 - 100
  passed: boolean;
  checks: AccessibilityCheck[];
}

export interface BookQualityPassport {
  passportId: string;
  bookId: string;
  editionId: string;
  bookTitle: string;
  productionLanguage: 'en' | 'es';
  generatedAt: string;
  sourceBlueprintVersion: number;
  sourceManuscriptWordCount: number;
  targetPages: number;
  actualPages: number;
  typesettingProfile: EditorialProfile;
  trimSize: TrimSize;
  formatHashes: {
    pdfHash?: string;
    epubHash?: string;
    docxHash?: string;
  };
  qualityScore: number;
  accessibilityScore: number;
  unverifiedRightsAssetsCount: number;
  isApprovedForPublishing: boolean;
  approvedByAuthorAt?: string;
  digitalSignature: string; // SHA-256 data integrity checksum
  signatureType?: 'SHA256_INTEGRITY_CHECKSUM';
  signatureDisclaimer?: string;
}

export interface E4ReadinessReport {
  bookId: string;
  evaluatedAt: string;
  overallScore: number; // 0 - 100
  status: 'READY' | 'NEEDS_ATTENTION' | 'INCOMPLETE';
  checks: Array<{
    id: string;
    category: 'BUILDER' | 'TYPESETTING' | 'PAGINATION' | 'EXPORTS' | 'QUALITY' | 'ACCESSIBILITY' | 'PASSPORT';
    title: string;
    status: 'PASS' | 'WARNING' | 'FAIL';
    details: string;
  }>;
}

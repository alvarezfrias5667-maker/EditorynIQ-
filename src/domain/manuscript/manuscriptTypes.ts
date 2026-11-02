import { EditorialProfile, ProductionLanguage, BookCategory } from '../bookProjectTypes';
import { ApprovedBlueprintSnapshot } from '../intelligence/bookIntelligenceTypes';

export type ChapterStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'DRAFT_COMPLETE' | 'IN_REVIEW' | 'APPROVED';

export type E2ProjectStatus =
  | 'NOT_STARTED'
  | 'DRAFTING_IN_PROGRESS'
  | 'EDITORIAL_REVIEW_PENDING'
  | 'MANUSCRIPT_COMPLETE'
  | 'TRANSLATION_IN_PROGRESS'
  | 'READY_FOR_E3_VISUALS';

export interface ChapterVersion {
  id: string;
  versionNumber: number;
  chapterId: string;
  content: string;
  wordCount: number;
  charCount: number;
  authorNote?: string;
  createdBy: 'author' | 'ai_assistant' | 'translator';
  createdAt: string;
}

export interface ManuscriptChapter {
  id: string;
  blueprintChapterId: string;
  order: number;
  title: string;
  objective: string;
  plannedPages: number;
  currentContent: string;
  wordCount: number;
  charCount: number;
  estimatedPages: number;
  status: ChapterStatus;
  versions: ChapterVersion[];
  lastEditedBy: string;
  updatedAt: string;
}

export interface TerminologyEntry {
  id: string;
  termEn: string;
  termEs: string;
  definition: string;
  isProtectedCodeOrFormula: boolean;
  category: 'general' | 'technical' | 'legal' | 'proper_noun' | 'formula';
  createdAt: string;
}

export interface TranslationDraft {
  id: string;
  chapterId: string;
  sourceLang: ProductionLanguage;
  targetLang: ProductionLanguage;
  originalText: string;
  translatedText: string;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED';
  updatedAt: string;
}

export interface EditorialReviewIssue {
  id: string;
  type: 'word_count_deviation' | 'repetition' | 'missing_section' | 'terminology_mismatch' | 'style_inconsistency';
  severity: 'info' | 'warning' | 'error';
  message: string;
  chapterId?: string;
}

export interface EditorialReviewReport {
  bookId: string;
  totalWords: number;
  totalEstimatedPages: number;
  issues: EditorialReviewIssue[];
  isPassed: boolean;
  reviewedAt: string;
}

export interface E2ReadinessCheckItem {
  id: string;
  key: string;
  passed: boolean;
  isBlocking: boolean;
  details: string;
}

export interface E2ReadinessReport {
  bookId: string;
  checks: E2ReadinessCheckItem[];
  isReadyForE3: boolean;
  status: E2ProjectStatus;
  updatedAt: string;
}

export interface ManuscriptProject {
  bookId: string;
  title: string;
  productionLanguage: ProductionLanguage;
  profile: EditorialProfile;
  category: BookCategory;
  targetPageCount: number;
  blueprintSnapshot: ApprovedBlueprintSnapshot;
  chapters: ManuscriptChapter[];
  terminology: TerminologyEntry[];
  translations: TranslationDraft[];
  reviewReport?: EditorialReviewReport;
  readinessReport?: E2ReadinessReport;
  status: E2ProjectStatus;
  updatedAt: string;
}

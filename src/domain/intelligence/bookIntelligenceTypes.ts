import { EditorialProfile, ProductionLanguage, BookCategory } from '../bookProjectTypes';

export type E1ProjectStatus =
  | 'DRAFT'
  | 'RESEARCH_IN_PROGRESS'
  | 'BLUEPRINT_IN_PROGRESS'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'BLOCKED';

export type SourceVerificationStatus = 'UNVERIFIED' | 'CONFIRMED' | 'DISPUTED' | 'OUTDATED';

export interface ResearchSource {
  id: string;
  title: string;
  author: string;
  url?: string;
  publishedDate?: string;
  notes: string;
  claimsLinked: string[];
  status: SourceVerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationMethod?: string; // e.g. "Primary document review", "Institutional database cross-reference"
  createdAt: string;
  updatedAt: string;
}

export interface BookMarketProfile {
  targetAudience: string;
  readerNeed: string;
  valueProposition: string;
  genre: string;
  category: BookCategory;
  comparableWorks: string[];
  commercialNotes: string;
}

export interface BlueprintSection {
  id: string;
  title: string;
  objective: string;
  estimatedPages: number;
  linkedSourceIds: string[];
}

export interface BlueprintChapter {
  id: string;
  order: number;
  title: string;
  objective: string;
  estimatedPages: number;
  sections: BlueprintSection[];
  linkedSourceIds: string[];
  dependencies: string[];
}

export interface BookBlueprint {
  chapters: BlueprintChapter[];
  totalChapters: number;
  totalPlannedPages: number;
  approved: boolean;
  approvedAt?: string;
  approvedBy?: string;
  version: number;
  updatedAt: string;
}

export interface PageBudgetItem {
  id: string;
  category: 'front_matter' | 'chapter' | 'illustration' | 'diagram' | 'bibliography' | 'glossary' | 'appendix' | 'back_matter';
  title: string;
  allocatedPages: number;
  notes?: string;
}

export interface PageBudget {
  targetPages: number;
  allocatedPages: number;
  remainingPages: number;
  excessPages: number;
  isBalanced: boolean;
  items: PageBudgetItem[];
  updatedAt: string;
}

export type MemoryEntryType = 'concept' | 'glossary' | 'terminology' | 'style' | 'tone' | 'constraint' | 'decision';

export interface BookMemoryEntry {
  id: string;
  type: MemoryEntryType;
  termOrKey: string;
  definitionOrValue: string;
  chapterRef?: string;
  sourceRef?: string;
  createdAt: string;
  updatedAt: string;
}

export interface E1ReadinessCheckItem {
  id: string;
  key: string;
  passed: boolean;
  isBlocking: boolean;
  details: string;
}

export interface E1ReadinessReport {
  bookId: string;
  checks: E1ReadinessCheckItem[];
  isReadyForApproval: boolean;
  status: E1ProjectStatus;
  updatedAt: string;
}

export interface ApprovedBlueprintSnapshot {
  version: number;
  chapters: BlueprintChapter[];
  pageBudget: PageBudget;
  approvedAt: string;
  approvedBy: string;
}

export interface E1BookPackage {
  bookId: string;
  status: E1ProjectStatus;
  marketProfile: BookMarketProfile;
  researchSources: ResearchSource[];
  blueprint: BookBlueprint;
  pageBudget: PageBudget;
  memoryEntries: BookMemoryEntry[];
  readinessReport: E1ReadinessReport;
  approvedVersion?: number;
  approvedAt?: string;
  approvedBlueprintSnapshot?: ApprovedBlueprintSnapshot; // Immutable snapshot at approval
  updatedAt: string;
}

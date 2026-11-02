import { BookCategory, EditorialProfile, ProductionLanguage } from '../bookProjectTypes';

export type BookOriginType = 'idea' | 'manuscript' | 'visual_technical' | 'reissue_translate';

export type ReaderLevel = 'beginner' | 'intermediate' | 'advanced' | 'executive' | 'all';

export type DepthLevel = 'introductory' | 'comprehensive' | 'mastery_specialized';

export type OrganizationStyle =
  | 'chronological'
  | 'thematic'
  | 'problem_solution'
  | 'modular_framework'
  | 'case_study_based';

export type MaterialRightsStatus =
  | 'ALL_OWNED'
  | 'LICENSED_CREATIVE_COMMONS'
  | 'PUBLIC_DOMAIN'
  | 'REQUIRES_PERMIT'
  | 'UNVERIFIED';

export interface FictionSpecifics {
  premise?: string;
  characterArc?: string;
  narrativePOV?: 'first_person' | 'third_limited' | 'third_omniscient';
}

export interface BusinessSpecifics {
  methodology?: string;
  marketCaseStudies?: string;
  actionFrameworks?: boolean;
}

export interface TechnicalSpecifics {
  codeLanguages?: string[];
  systemDiagrams?: boolean;
  repositoryUrl?: string;
}

export interface EducationSpecifics {
  gradeLevel?: string;
  learningObjectives?: string;
  exerciseQuizzes?: boolean;
}

export interface GenreSpecifics {
  fiction?: FictionSpecifics;
  business?: BusinessSpecifics;
  technical?: TechnicalSpecifics;
  education?: EducationSpecifics;
}

export interface IntakeOriginData {
  originType: BookOriginType;
}

export interface IntakeIdentityData {
  title: string;
  coreConcept: string;
  category: BookCategory;
  targetAudiences: string[];
  readerLevel: ReaderLevel;
  goals: string[];
  authorName?: string;
  expectedOutcomes: string[];
}

export interface IntakeArchitectureData {
  topics: string[];
  subtopics: string[];
  depth: DepthLevel;
  organizationStyle: OrganizationStyle;
  suggestedChapterCount: number;
  providedTableOfContents?: string; // Line-by-line or free text TOC provided by author
  genreSpecifics: GenreSpecifics;
}

export interface IntakeWritingVisualData {
  productionLanguage: ProductionLanguage;
  targetPages: number;
  editorialProfile: EditorialProfile;
  tones: string[];
  narrativeStyle: string;
  requestedVisuals: string[];
  exportFormats: string[];
}

export interface IntakeResearchRightsData {
  researchSources: Array<{
    id: string;
    title: string;
    url?: string;
    usagePurpose: string;
  }>;
  uploadedDocuments: Array<{
    id: string;
    fileName: string;
    sizeBytes: number;
    textSnippet?: string;
  }>;
  protectedTerms: string[];
  materialRightsStatus: MaterialRightsStatus;
  constraints: string[];
  specialInstructions: string;
}

export interface SmartIntakeState {
  currentStep: number; // 1 to 6
  origin: IntakeOriginData;
  identity: IntakeIdentityData;
  architecture: IntakeArchitectureData;
  writingVisual: IntakeWritingVisualData;
  researchRights: IntakeResearchRightsData;
  updatedAt: string;
}

export function getDefaultIntakeState(initialOrigin: BookOriginType = 'idea'): SmartIntakeState {
  return {
    currentStep: 1,
    origin: {
      originType: initialOrigin,
    },
    identity: {
      title: '',
      coreConcept: '',
      category: 'non-fiction',
      targetAudiences: ['General Professional'],
      readerLevel: 'intermediate',
      goals: ['Knowledge Sharing', 'Practical Guide'],
      authorName: '',
      expectedOutcomes: ['Publish Industry Standard Book'],
    },
    architecture: {
      topics: [],
      subtopics: [],
      depth: 'comprehensive',
      organizationStyle: 'thematic',
      suggestedChapterCount: 8,
      providedTableOfContents: '',
      genreSpecifics: {},
    },
    writingVisual: {
      productionLanguage: 'en',
      targetPages: 250,
      editorialProfile: 'text-first',
      tones: ['Authoritative', 'Clarity-Focused'],
      narrativeStyle: 'Direct & Engaging',
      requestedVisuals: ['Diagrams', 'Infographics'],
      exportFormats: ['PDF', 'EPUB', 'DOCX'],
    },
    researchRights: {
      researchSources: [],
      uploadedDocuments: [],
      protectedTerms: [],
      materialRightsStatus: 'ALL_OWNED',
      constraints: [],
      specialInstructions: '',
    },
    updatedAt: new Date().toISOString(),
  };
}

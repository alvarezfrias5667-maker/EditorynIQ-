export type ProductionMode = 'idea' | 'manuscript';

export type EditorialProfile = 'text-first' | 'visual-first' | 'technical-first';

export type ProductionLanguage = 'en' | 'es';

export type InterfaceLanguage = 'en' | 'es' | 'fr';

export type BookCategory =
  | 'fiction'
  | 'non-fiction'
  | 'academic'
  | 'technical'
  | 'business'
  | 'children'
  | 'poetry'
  | 'biography'
  | 'self-help'
  | 'art-design'
  | 'mind-philosophy';

export type ProjectStatus = 'DRAFT_LOCAL' | 'READY_FOR_BLUEPRINT';

export interface BookProject {
  id: string;
  mode: ProductionMode;
  title: string;
  description: string;
  targetAudience: string;
  category: BookCategory;
  productionLanguage: ProductionLanguage;
  profile: EditorialProfile;
  targetPageCount: number;
  lengthClass: 'standard' | 'extended'; // 20-300 = standard, 301-600 = extended
  authorNotes: string;
  sourceText?: string;
  sourceFileName?: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookProjectInput {
  mode: ProductionMode;
  title: string;
  description: string;
  targetAudience: string;
  category: BookCategory;
  productionLanguage: ProductionLanguage;
  profile: EditorialProfile;
  targetPageCount: number;
  authorNotes: string;
  sourceText?: string;
  sourceFileName?: string;
}

export interface ValidationError {
  field: string;
  messageKey: string;
}

import { BookCategory } from '../bookProjectTypes';
import { SmartIntakeState, DepthLevel, OrganizationStyle } from './smartIntakeTypes';

export function calculateSuggestedChapterCount(targetPages: number, depth: DepthLevel): number {
  let pagesPerChapter = 25;
  if (depth === 'introductory') pagesPerChapter = 18;
  if (depth === 'mastery_specialized') pagesPerChapter = 35;

  const raw = Math.round((targetPages - 20) / pagesPerChapter);
  return Math.max(3, Math.min(30, raw));
}

export function isFictionCategory(category: BookCategory): boolean {
  return ['fiction', 'poetry', 'children'].includes(category);
}

export function isTechnicalCategory(category: BookCategory): boolean {
  return ['technical', 'academic'].includes(category);
}

export function isBusinessCategory(category: BookCategory): boolean {
  return ['business', 'self-help'].includes(category);
}

export function isEducationCategory(category: BookCategory): boolean {
  return ['academic', 'children', 'technical'].includes(category);
}

export const CATEGORY_TOPICS_MAP: Record<string, string[]> = {
  fiction: ['Worldbuilding', 'Character Development', 'Plot Arcs', 'Conflict & Climax', 'Theme & Subtext'],
  'non-fiction': ['Core Thesis', 'Historical Context', 'Key Arguments', 'Case Analysis', 'Future Implications'],
  business: ['Executive Strategy', 'Product Architecture', 'Go-To-Market', 'Operational Scaling', 'Metrics & KPIs'],
  technical: ['System Design', 'Core API Architecture', 'Data Structures', 'Security & Compliance', 'Implementation Guide'],
  academic: ['Literature Review', 'Methodology', 'Empirical Findings', 'Theoretical Discussion', 'Conclusion & Future Research'],
  children: ['Main Character', 'Core Lesson / Moral', 'Visual Storyboard', 'Rhyme & Rhythm', 'Reader Interaction'],
  biography: ['Early Formative Years', 'Defining Breakthroughs', 'Key Milestones', 'Personal Reflection', 'Enduring Legacy'],
  'self-help': ['Problem Identification', 'Mindset Shift', 'Step-by-Step System', 'Daily Habits', 'Long-term Maintenance'],
};

export function getRecommendedTopicsForCategory(category: BookCategory): string[] {
  return CATEGORY_TOPICS_MAP[category] || CATEGORY_TOPICS_MAP['non-fiction'];
}

export function validateStep(stepNumber: number, state: SmartIntakeState): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (stepNumber === 1) {
    if (!state.origin.originType) {
      errors.originType = 'Please select a book origin mode.';
    }
  } else if (stepNumber === 2) {
    if (!state.identity.title || state.identity.title.trim().length === 0) {
      errors.title = 'Book working title is required.';
    }
    if (!state.identity.coreConcept || state.identity.coreConcept.trim().length === 0) {
      errors.coreConcept = 'Core concept / thesis summary is required.';
    }
    if (!state.identity.targetAudiences || state.identity.targetAudiences.length === 0) {
      errors.targetAudiences = 'Select at least one target audience segment.';
    }
  } else if (stepNumber === 3) {
    // If author provided custom TOC, that satisfies topics
    const hasTOC = Boolean(state.architecture.providedTableOfContents && state.architecture.providedTableOfContents.trim().length > 10);
    const hasTopics = state.architecture.topics && state.architecture.topics.length > 0;
    if (!hasTOC && !hasTopics) {
      errors.topics = 'Please select key topics or provide your own Table of Contents.';
    }
  } else if (stepNumber === 4) {
    if (!state.writingVisual.targetPages || state.writingVisual.targetPages < 20 || state.writingVisual.targetPages > 600) {
      errors.targetPages = 'Target page count must be between 20 and 600 pages.';
    }
  } else if (stepNumber === 5) {
    const isFiction = isFictionCategory(state.identity.category);
    // Non-fiction recommends sources or clear ownership declaraion
    if (!isFiction && state.researchRights.materialRightsStatus === 'UNVERIFIED' && state.researchRights.researchSources.length === 0) {
      errors.materialRightsStatus = 'Non-fiction publications require at least one source or confirmed material rights declaration.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

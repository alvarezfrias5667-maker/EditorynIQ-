import { BookBlueprint, BlueprintChapter, BlueprintSection } from './bookIntelligenceTypes';

export function createDefaultBlueprint(targetPageCount: number): BookBlueprint {
  const defaultChapterPages = Math.max(10, Math.floor((targetPageCount - 20) / 5));
  const chapters: BlueprintChapter[] = [
    {
      id: `chap_1_${Date.now()}`,
      order: 1,
      title: 'Chapter 1: Foundational Principles',
      objective: 'Establish core thesis and essential terminology.',
      estimatedPages: defaultChapterPages,
      sections: [
        {
          id: `sec_1_1_${Date.now()}`,
          title: '1.1 Introduction & Scope',
          objective: 'Define problem boundaries and key terms.',
          estimatedPages: Math.floor(defaultChapterPages / 2),
          linkedSourceIds: [],
        },
        {
          id: `sec_1_2_${Date.now()}`,
          title: '1.2 Core Theoretical Framework',
          objective: 'Analyze primary models and foundational logic.',
          estimatedPages: Math.ceil(defaultChapterPages / 2),
          linkedSourceIds: [],
        },
      ],
      linkedSourceIds: [],
      dependencies: [],
    },
    {
      id: `chap_2_${Date.now()}`,
      order: 2,
      title: 'Chapter 2: Structural Analysis & Dynamics',
      objective: 'Deep dive into structural components and case analysis.',
      estimatedPages: defaultChapterPages,
      sections: [],
      linkedSourceIds: [],
      dependencies: [],
    },
  ];

  return {
    chapters,
    totalChapters: chapters.length,
    totalPlannedPages: defaultChapterPages * 2,
    approved: false,
    version: 1,
    updatedAt: new Date().toISOString(),
  };
}

export function reorderChapters(chapters: BlueprintChapter[], fromIndex: number, toIndex: number): BlueprintChapter[] {
  const result = [...chapters];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result.map((chap, idx) => ({ ...chap, order: idx + 1 }));
}

export function calculatePlannedPages(blueprint: BookBlueprint): number {
  return blueprint.chapters.reduce((sum, ch) => sum + (ch.estimatedPages || 0), 0);
}

export function validateBlueprintStructure(blueprint: BookBlueprint): string[] {
  const errors: string[] = [];

  if (!blueprint.chapters || blueprint.chapters.length === 0) {
    errors.push('Blueprint must contain at least 1 chapter.');
  }

  blueprint.chapters.forEach((ch, idx) => {
    if (!ch.title || ch.title.trim().length === 0) {
      errors.push(`Chapter ${idx + 1} requires a title.`);
    }
    if (!ch.estimatedPages || ch.estimatedPages < 1) {
      errors.push(`Chapter "${ch.title || idx + 1}" must have an estimated page count >= 1.`);
    }
  });

  return errors;
}

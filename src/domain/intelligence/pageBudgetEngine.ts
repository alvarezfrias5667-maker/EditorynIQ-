import { PageBudget, PageBudgetItem, BookBlueprint } from './bookIntelligenceTypes';

export function calculatePageBudget(targetPages: number, items: PageBudgetItem[]): PageBudget {
  const allocatedPages = items.reduce((sum, item) => sum + (item.allocatedPages || 0), 0);
  const diff = targetPages - allocatedPages;
  const remainingPages = Math.max(0, diff);
  const excessPages = diff < 0 ? Math.abs(diff) : 0;
  const isBalanced = diff === 0;

  return {
    targetPages,
    allocatedPages,
    remainingPages,
    excessPages,
    isBalanced,
    items,
    updatedAt: new Date().toISOString(),
  };
}

export function createInitialPageBudget(targetPages: number, blueprint?: BookBlueprint): PageBudget {
  const frontPages = Math.min(10, Math.floor(targetPages * 0.05)); // e.g. 5-10 pages
  const backPages = Math.min(10, Math.floor(targetPages * 0.05));
  const chapterPages = blueprint ? blueprint.chapters.reduce((sum, c) => sum + c.estimatedPages, 0) : targetPages - frontPages - backPages;

  const items: PageBudgetItem[] = [
    {
      id: 'pb_front',
      category: 'front_matter',
      title: 'Front Matter (Title, Copyright, Table of Contents, Foreword)',
      allocatedPages: frontPages,
    },
    {
      id: 'pb_chapters',
      category: 'chapter',
      title: 'Body Chapters',
      allocatedPages: Math.max(10, chapterPages),
    },
    {
      id: 'pb_back',
      category: 'back_matter',
      title: 'Back Matter (Index, Appendix, About Author)',
      allocatedPages: backPages,
    },
  ];

  return calculatePageBudget(targetPages, items);
}

export function syncBudgetWithBlueprint(budget: PageBudget, blueprint: BookBlueprint): PageBudget {
  const chapterTotal = blueprint.chapters.reduce((sum, c) => sum + c.estimatedPages, 0);

  const updatedItems = budget.items.map((item) => {
    if (item.category === 'chapter') {
      return { ...item, allocatedPages: chapterTotal };
    }
    return item;
  });

  return calculatePageBudget(budget.targetPages, updatedItems);
}

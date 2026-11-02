import { BookProjectInput, BookCategory } from '../bookProjectTypes';
import {
  E1BookPackage,
  BookBlueprint,
  BlueprintChapter,
  BlueprintSection,
  PageBudget,
  PageBudgetItem,
  ResearchSource,
  BookMemoryEntry,
} from '../intelligence/bookIntelligenceTypes';
import { createDefaultMarketProfile } from '../intelligence/bookMarketIntelligence';
import { SmartIntakeState } from './smartIntakeTypes';

/**
 * Parses free text or line-by-line Table of Contents input by the author.
 */
export function parseAuthorProvidedTOC(tocText: string, targetPages: number): BlueprintChapter[] {
  const lines = tocText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return [];

  const chapters: BlueprintChapter[] = [];
  let currentChapter: BlueprintChapter | null = null;
  let chapterIndex = 0;

  lines.forEach((line) => {
    const isSubsection = line.startsWith('-') || line.startsWith('*') || line.startsWith('  ') || /^\d+\.\d+/.test(line);

    if (!isSubsection || !currentChapter) {
      chapterIndex++;
      const cleanTitle = line.replace(/^(chapter|capítulo|\d+[\.\:\-]?)\s*/i, '').trim();
      currentChapter = {
        id: `chap_author_${chapterIndex}_${Date.now()}`,
        order: chapterIndex,
        title: line.length > 5 && !line.toLowerCase().startsWith('chapter') ? line : `Chapter ${chapterIndex}: ${cleanTitle}`,
        objective: `Explore ${cleanTitle || 'core chapter thesis'}.`,
        estimatedPages: 10, // Re-balanced below
        sections: [],
        linkedSourceIds: [],
        dependencies: [],
      };
      chapters.push(currentChapter);
    } else if (currentChapter) {
      const cleanSecTitle = line.replace(/^[\-\*\d\.]+\s*/, '').trim();
      const secIndex = currentChapter.sections.length + 1;
      currentChapter.sections.push({
        id: `sec_author_${chapterIndex}_${secIndex}_${Date.now()}`,
        title: cleanSecTitle || line,
        objective: `Analyze ${cleanSecTitle || 'section focus'}.`,
        estimatedPages: 5,
        linkedSourceIds: [],
      });
    }
  });

  return chapters;
}

/**
 * Builds chapters deterministically from selected topics and subtopics,
 * expanding structures based on target page count and category domain seeds.
 */
export function buildChaptersFromTopics(
  topics: string[],
  subtopics: string[],
  suggestedChapterCount: number = 8,
  category: BookCategory = 'non-fiction'
): BlueprintChapter[] {
  const targetNumChapters = Math.max(3, Math.min(25, suggestedChapterCount || 8));

  // Category domain topic seeds to expand brief titles into full chapter architectures
  const domainTopicSeeds: Record<string, string[]> = {
    technical: [
      'Foundational Principles & System Scope',
      'Domain Modeling & Data Architecture',
      'Multi-Tenant System Infrastructure',
      'API Security, Authentication & Governance',
      'Scalable Engine & Microservices Implementation',
      'High Availability, Performance & Benchmarks',
      'Deployment Pipeline, CI/CD & Monitoring',
      'Executive Case Analysis & Strategic Roadmap',
    ],
    business: [
      'Market Opportunity & Core Thesis',
      'Strategic Frameworks & Operating Models',
      'Product Architecture & Monetization',
      'Go-To-Market & Customer Acquisition',
      'Financial Modeling, KPIs & Unit Economics',
      'Operational Scaling & Governance',
      'Risk Management & Competitive Moats',
      'Executive Case Analysis & Actionable Summary',
    ],
    'non-fiction': [
      'Core Thesis & Problem Definition',
      'Historical Context & Background Analysis',
      'Systemic Dynamics & Structural Factors',
      'Primary Case Analysis & Empirical Evidence',
      'Strategic Frameworks & Solutions',
      'Implementation Roadmap & Practical Applications',
      'Future Outlook & Broader Implications',
      'Conclusion & Executive Summary',
    ],
    fiction: [
      'Inciting Incident & Worldbuilding',
      'Character Introduction & Initial Conflict',
      'Rising Action & Complications',
      'Midpoint Pivot & Stake Escalation',
      'Crisis & Character Arc Reversal',
      'Climax & Decisive Confrontation',
      'Resolution & World Aftermath',
    ],
  };

  const seedList = domainTopicSeeds[category] || domainTopicSeeds['non-fiction'];

  // User topics take priority
  const combinedTopics: string[] = [...topics.filter(Boolean)];
  seedList.forEach((seed) => {
    if (combinedTopics.length < targetNumChapters && !combinedTopics.includes(seed)) {
      combinedTopics.push(seed);
    }
  });

  const finalTopics = combinedTopics.slice(0, targetNumChapters);

  return finalTopics.map((topic, idx) => {
    const chapNum = idx + 1;
    const relatedSubtopics = subtopics.slice(idx * 2, idx * 2 + 2);

    const sections: BlueprintSection[] = (
      relatedSubtopics.length > 0 ? relatedSubtopics : [`${topic} Overview & Principles`, `${topic} Framework & Execution`]
    ).map((sub, sIdx) => ({
      id: `sec_topic_${chapNum}_${sIdx + 1}_${Date.now()}`,
      title: sub,
      objective: `Detailed analysis of ${sub}.`,
      estimatedPages: 8,
      linkedSourceIds: [],
    }));

    return {
      id: `chap_topic_${chapNum}_${Date.now()}`,
      order: chapNum,
      title: `Chapter ${chapNum}: ${topic}`,
      objective: `Provide comprehensive analysis of ${topic}.`,
      estimatedPages: 15,
      sections,
      linkedSourceIds: [],
      dependencies: [],
    };
  });
}

/**
 * Generates exact PageBudget satisfying ALLOCATED = TARGET (REMAINING = 0).
 */
export function generateExactPageBudget(targetPages: number, chapters: BlueprintChapter[]): { budget: PageBudget; rebalancedChapters: BlueprintChapter[] } {
  const frontPages = Math.max(4, Math.min(12, Math.floor(targetPages * 0.04)));
  const backPages = Math.max(4, Math.min(16, Math.floor(targetPages * 0.05)));
  const targetChapterTotalPages = targetPages - frontPages - backPages;

  const numChapters = chapters.length || 1;
  const basePagesPerChapter = Math.floor(targetChapterTotalPages / numChapters);
  let residuePages = targetChapterTotalPages - basePagesPerChapter * numChapters;

  const rebalancedChapters: BlueprintChapter[] = chapters.map((ch) => {
    const extra = residuePages > 0 ? 1 : 0;
    if (residuePages > 0) residuePages--;

    const allocated = Math.max(4, basePagesPerChapter + extra);
    return {
      ...ch,
      estimatedPages: allocated,
    };
  });

  const allocatedChapterPagesTotal = rebalancedChapters.reduce((sum, c) => sum + c.estimatedPages, 0);

  const items: PageBudgetItem[] = [
    {
      id: 'pb_front_matter',
      category: 'front_matter',
      title: 'Front Matter (Half Title, Title, Copyright, Table of Contents, Dedication)',
      allocatedPages: frontPages,
    },
    {
      id: 'pb_chapters_body',
      category: 'chapter',
      title: `Body Chapters (${numChapters} Chapters Allocated)`,
      allocatedPages: allocatedChapterPagesTotal,
    },
    {
      id: 'pb_back_matter',
      category: 'back_matter',
      title: 'Back Matter (Appendix, Index, Bibliography & Author Bio)',
      allocatedPages: backPages,
    },
  ];

  const totalAllocated = frontPages + allocatedChapterPagesTotal + backPages;

  const budget: PageBudget = {
    targetPages,
    allocatedPages: totalAllocated,
    remainingPages: Math.max(0, targetPages - totalAllocated),
    excessPages: totalAllocated > targetPages ? totalAllocated - targetPages : 0,
    isBalanced: totalAllocated === targetPages,
    items,
    updatedAt: new Date().toISOString(),
  };

  return { budget, rebalancedChapters };
}

/**
 * Compiles full E1BookPackage & BookProjectInput from SmartIntakeState.
 */
export function compilePackageFromIntake(state: SmartIntakeState, projectId: string): { projectInput: BookProjectInput; e1Package: E1BookPackage } {
  const { identity, architecture, writingVisual, researchRights, origin } = state;

  const mode = origin.originType === 'manuscript' ? 'manuscript' : 'idea';
  const targetPages = Number(writingVisual.targetPages) || 250;

  // 1. Build Project Input
  const projectInput: BookProjectInput = {
    mode,
    title: identity.title.trim() || 'Untitled Book Project',
    description: identity.coreConcept.trim() || 'Book thesis and structural architecture defined via Smart Intake V2.',
    targetAudience: identity.targetAudiences.join(', ') || 'General Professional Audience',
    category: identity.category,
    productionLanguage: writingVisual.productionLanguage,
    profile: writingVisual.editorialProfile,
    targetPageCount: targetPages,
    authorNotes: `Reader Level: ${identity.readerLevel.toUpperCase()} | Goals: ${identity.goals.join('; ')} | Expected Outcome: ${identity.expectedOutcomes.join('; ')}`,
  };

  // 2. Build Chapters with domain expansion based on suggested chapter count
  let rawChapters: BlueprintChapter[] = [];
  if (architecture.providedTableOfContents && architecture.providedTableOfContents.trim().length > 10) {
    rawChapters = parseAuthorProvidedTOC(architecture.providedTableOfContents, targetPages);
  } else {
    rawChapters = buildChaptersFromTopics(
      architecture.topics,
      architecture.subtopics,
      architecture.suggestedChapterCount,
      identity.category
    );
  }

  if (rawChapters.length === 0) {
    rawChapters = buildChaptersFromTopics([], [], architecture.suggestedChapterCount, identity.category);
  }

  // 3. Balance Budget
  const { budget, rebalancedChapters } = generateExactPageBudget(targetPages, rawChapters);

  // 4. Build Blueprint
  const blueprint: BookBlueprint = {
    chapters: rebalancedChapters,
    totalChapters: rebalancedChapters.length,
    totalPlannedPages: rebalancedChapters.reduce((sum, c) => sum + c.estimatedPages, 0),
    approved: false,
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  // 5. Research Sources
  const researchSources: ResearchSource[] = researchRights.researchSources.map((s, idx) => ({
    id: s.id || `src_intake_${idx + 1}_${Date.now()}`,
    title: s.title,
    author: state.identity.authorName || 'Intake Citation',
    url: s.url,
    notes: s.usagePurpose,
    claimsLinked: [],
    status: 'UNVERIFIED',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  // 6. Master Memory Entries
  const memoryEntries: BookMemoryEntry[] = [
    {
      id: `mem_style_${Date.now()}`,
      type: 'style',
      termOrKey: 'Editorial Tone & Style Directive',
      definitionOrValue: `Tones: ${writingVisual.tones.join(', ')} | Narrative Style: ${writingVisual.narrativeStyle}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: `mem_audience_${Date.now()}`,
      type: 'terminology',
      termOrKey: 'Target Audience Profile',
      definitionOrValue: `Level: ${identity.readerLevel} | Primary Audience: ${identity.targetAudiences.join(', ')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  if (researchRights.protectedTerms && researchRights.protectedTerms.length > 0) {
    researchRights.protectedTerms.forEach((term, idx) => {
      memoryEntries.push({
        id: `mem_prot_${idx + 1}_${Date.now()}`,
        type: 'glossary',
        termOrKey: `Protected Term: ${term}`,
        definitionOrValue: 'Protected glossary item or trademark code. Must be preserved without alteration.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });
  }

  // 7. Market Profile
  const marketProfile = createDefaultMarketProfile();
  marketProfile.category = identity.category;
  marketProfile.targetAudience = identity.targetAudiences.join(', ');

  // 8. Package
  const e1Package: E1BookPackage = {
    bookId: projectId,
    status: 'BLUEPRINT_IN_PROGRESS',
    marketProfile,
    researchSources,
    blueprint,
    pageBudget: budget,
    memoryEntries,
    readinessReport: {
      bookId: projectId,
      checks: [],
      isReadyForApproval: false,
      status: 'BLUEPRINT_IN_PROGRESS',
      updatedAt: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };

  return { projectInput, e1Package };
}

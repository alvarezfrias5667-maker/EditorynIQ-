import { TypesettingConfig, PaginationMetrics, TrimSize } from './editorialTypes';
import { calculatePrintArea } from './typesettingEngine';
import { ManuscriptChapter } from '../manuscript/manuscriptTypes';

export function calculatePageCapacityWords(trimSize: TrimSize, config: TypesettingConfig): number {
  const area = calculatePrintArea(trimSize, config.margins);
  // Estimate printable lines per page: printHeight (mm) / line-height-in-mm
  const fontSizeMm = (config.typography.bodyFontSizePt * 0.352778); // 1pt = 0.352778mm
  const lineHeightMm = fontSizeMm * config.typography.bodyLineHeight;
  const linesPerPage = Math.floor(area.printHeightMm / lineHeightMm);

  // Estimate words per line: printWidth (mm) / avg-word-width-in-mm (~12mm for 11pt)
  const avgWordWidthMm = fontSizeMm * 2.8;
  const wordsPerLine = Math.floor(area.printWidthMm / avgWordWidthMm);

  const rawWords = linesPerPage * wordsPerLine;
  // Apply paragraph spacing and heading breaks adjustment (~15% deduction)
  return Math.max(150, Math.min(650, Math.floor(rawWords * 0.85)));
}

export function computeDetailedPagination(
  chapters: ManuscriptChapter[],
  trimSize: TrimSize,
  config: TypesettingConfig,
  targetPages: number,
  visualAssetsCount = 0
): PaginationMetrics {
  const wordsPerPageCapacity = calculatePageCapacityWords(trimSize, config);

  let bodyPagesCount = 0;
  let totalWordCount = 0;

  chapters.forEach((ch) => {
    const chText = ch.currentContent || (ch as any).content || '';
    const words = ch.wordCount || chText.split(/\s+/).filter(Boolean).length;
    totalWordCount += words;

    // Each chapter starts on a new right-hand page (recto) + page count for prose
    const prosePages = Math.ceil(words / wordsPerPageCapacity);
    // Add 1 page per chapter heading / section break buffer
    const chapterPages = Math.max(1, prosePages);
    bodyPagesCount += chapterPages;
  });

  // Account for embedded visual assets (e.g. diagrams/charts taking 0.5 to 1 page each)
  const visualPagesCount = Math.ceil(visualAssetsCount * 0.75);
  bodyPagesCount += visualPagesCount;

  const frontMatterPages = config.tocConfig.includeTOC ? 6 : 4; // Half title, Title, Copyright, Dedication, TOC
  const rawTotalPages = frontMatterPages + bodyPagesCount;

  const estimatedPages = Math.max(20, Math.ceil(totalWordCount / 320) + frontMatterPages);
  const actualPdfPages = rawTotalPages % 2 === 0 ? rawTotalPages : rawTotalPages + 1;
  const blankPagesCount = actualPdfPages - rawTotalPages;

  const estimatedSpineWidthMm = Number((actualPdfPages * 0.057).toFixed(2));
  const wordsPerPageAvg = actualPdfPages > 0 ? Math.round(totalWordCount / actualPdfPages) : 0;
  const pageOverflowCount = actualPdfPages > targetPages ? actualPdfPages - targetPages : 0;

  return {
    targetPages,
    estimatedPages,
    actualPdfPages,
    frontMatterPages,
    bodyPages: bodyPagesCount,
    backMatterPages: 0,
    totalWords: totalWordCount,
    wordsPerPageAvg,
    estimatedSpineWidthMm,
    pageOverflowCount,
    blankPagesCount,
  };
}

export function generatePageBreakDownList(
  chapters: ManuscriptChapter[],
  config: TypesettingConfig,
  trimSize: TrimSize
): Array<{ pageNumber: number; type: 'FRONT_MATTER' | 'CHAPTER_START' | 'CHAPTER_BODY' | 'BLANK'; label: string; chapterTitle?: string }> {
  const pagesList: Array<{ pageNumber: number; type: 'FRONT_MATTER' | 'CHAPTER_START' | 'CHAPTER_BODY' | 'BLANK'; label: string; chapterTitle?: string }> = [];
  const capacity = calculatePageCapacityWords(trimSize, config);

  let currentPg = 1;

  // Front matter
  pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Half Title' });
  pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Title Page' });
  pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Copyright & Cataloging' });
  pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Dedication / Epigraph' });

  if (config.tocConfig.includeTOC) {
    pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Table of Contents' });
    pagesList.push({ pageNumber: currentPg++, type: 'FRONT_MATTER', label: 'Contents Continued' });
  }

  // Chapters
  chapters.forEach((ch, idx) => {
    // Chapter start page (Recto / odd page convention)
    if (currentPg % 2 === 0) {
      pagesList.push({ pageNumber: currentPg++, type: 'BLANK', label: 'Blank Verso Page' });
    }

    const chText = ch.currentContent || (ch as any).content || '';
    const words = ch.wordCount || chText.split(/\s+/).filter(Boolean).length;
    const numPages = Math.max(1, Math.ceil(words / capacity));

    pagesList.push({
      pageNumber: currentPg++,
      type: 'CHAPTER_START',
      label: `Chapter ${idx + 1}: ${ch.title}`,
      chapterTitle: ch.title,
    });

    for (let p = 2; p <= numPages; p++) {
      pagesList.push({
        pageNumber: currentPg++,
        type: 'CHAPTER_BODY',
        label: `Chapter ${idx + 1} (Page ${p})`,
        chapterTitle: ch.title,
      });
    }
  });

  // Final blank page check if odd total
  if (pagesList.length % 2 !== 0) {
    pagesList.push({ pageNumber: currentPg, type: 'BLANK', label: 'Final Endpaper' });
  }

  return pagesList;
}

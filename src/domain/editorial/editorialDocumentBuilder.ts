import { EditorialEdition, TypesettingConfig, PaginationMetrics } from './editorialTypes';
import { ManuscriptChapter } from '../manuscript/manuscriptTypes';
import { computeDetailedPagination } from './paginationEngine';

export function getDefaultTypesettingConfig(profile: 'text-first' | 'visual-first' | 'technical-first' = 'text-first'): TypesettingConfig {
  switch (profile) {
    case 'visual-first':
      return {
        editorialProfile: 'visual-first',
        trimSize: '8.5x11',
        margins: { topMm: 18, bottomMm: 18, insideMm: 22, outsideMm: 18, bleedMm: 3 },
        typography: {
          headingFont: 'Playfair Display, Georgia, serif',
          bodyFont: 'Plus Jakarta Sans, sans-serif',
          codeFont: 'JetBrains Mono, monospace',
          bodyFontSizePt: 11,
          bodyLineHeight: 1.5,
          headingScale: 1.4,
          paragraphSpacingPt: 8,
          dropCaps: true,
          orphanControl: true,
          widowControl: true,
        },
        runningHeader: { enabled: true, leftText: '', rightText: '' },
        runningFooter: { enabled: true, pageNumberingStyle: 'arabic' },
        tocConfig: { includeTOC: true, maxDepth: 2, dotLeader: true },
      };
    case 'technical-first':
      return {
        editorialProfile: 'technical-first',
        trimSize: '7x10',
        margins: { topMm: 20, bottomMm: 20, insideMm: 24, outsideMm: 20, bleedMm: 3 },
        typography: {
          headingFont: 'Outfit, sans-serif',
          bodyFont: 'DM Sans, sans-serif',
          codeFont: 'IBM Plex Mono, monospace',
          bodyFontSizePt: 10,
          bodyLineHeight: 1.4,
          headingScale: 1.35,
          paragraphSpacingPt: 6,
          dropCaps: false,
          orphanControl: true,
          widowControl: true,
        },
        runningHeader: { enabled: true, leftText: '', rightText: '' },
        runningFooter: { enabled: true, pageNumberingStyle: 'arabic' },
        tocConfig: { includeTOC: true, maxDepth: 3, dotLeader: true },
      };
    case 'text-first':
    default:
      return {
        editorialProfile: 'text-first',
        trimSize: '6x9',
        margins: { topMm: 20, bottomMm: 20, insideMm: 22, outsideMm: 18, bleedMm: 3 },
        typography: {
          headingFont: 'Cormorant Garamond, serif',
          bodyFont: 'Lora, serif',
          codeFont: 'Space Mono, monospace',
          bodyFontSizePt: 11,
          bodyLineHeight: 1.45,
          headingScale: 1.3,
          paragraphSpacingPt: 0, // Indented paragraphs for fiction/prose
          dropCaps: true,
          orphanControl: true,
          widowControl: true,
        },
        runningHeader: { enabled: true, leftText: '', rightText: '' },
        runningFooter: { enabled: true, pageNumberingStyle: 'arabic' },
        tocConfig: { includeTOC: true, maxDepth: 2, dotLeader: true },
      };
  }
}

export function compileDerivedEdition(
  bookId: string,
  bookTitle: string,
  productionLanguage: 'en' | 'es',
  profile: 'text-first' | 'visual-first' | 'technical-first',
  targetPages: number,
  chapters: ManuscriptChapter[],
  visualAssetIds: string[] = []
): EditorialEdition {
  const typesetting = getDefaultTypesettingConfig(profile);
  typesetting.runningHeader.leftText = bookTitle;

  const pagination = computeDetailedPagination(chapters, typesetting.trimSize, typesetting, targetPages, visualAssetIds.length);

  return {
    id: `edition_${bookId}_${Date.now().toString(36)}`,
    bookId,
    editionTitle: `${bookTitle} — 1st Master Edition (${productionLanguage.toUpperCase()})`,
    productionLanguage,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    isApproved: false,
    typesetting,
    pagination,
    chapters,
    visualAssetIds,
    notes: 'Derived master edition initialized from E1 blueprint and E2 manuscript.',
  };
}

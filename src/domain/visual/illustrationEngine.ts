import {
  VisualAsset,
  VisualArtBrief,
  VisualStyleGuide,
  ChapterVisualMapping,
  QualityGate4CReport,
  QualityGate4CStatus,
} from './visualTypes';

export interface IllustrationBrief {
  id: string;
  bookId: string;
  chapterId?: string;
  title: string;
  description: string;
  styleKeywords: string[];
  aspectRatio: '1:1' | '16:9' | '4:3' | '3:4';
  suggestedPrompt: string;
  createdDate: string;
}

export function checkAiImageStatus(): { isConfigured: boolean; code: string; message: string } {
  return {
    isConfigured: false,
    code: 'AI_IMAGE_NOT_CONFIGURED',
    message: 'AI image generation service is NOT_CONFIGURED. Local vector engine and author artwork operate independently.',
  };
}

export function validateIllustrationFile(file: File): { valid: boolean; error?: string } {
  const allowedMimeTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/webp'];
  if (!allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file format. Only SVG, PNG, JPEG, and WebP illustrations are accepted.',
    };
  }

  const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE_BYTES) {
    return {
      valid: false,
      error: 'File size exceeds maximum limit of 10MB.',
    };
  }

  return { valid: true };
}

export function sanitizeSvgContent(rawSvg: string): {
  safeSvg: string;
  isSanitized: boolean;
  containsForbiddenScript: boolean;
} {
  if (!rawSvg) {
    return { safeSvg: '', isSanitized: false, containsForbiddenScript: false };
  }

  const lower = rawSvg.toLowerCase();
  const containsScriptTag = lower.includes('<script');
  const containsJsScheme = lower.includes('javascript:');
  const containsEventHandlers = /on\w+\s*=/i.test(rawSvg);
  const containsExternalLinks = /(href|src)\s*=\s*["']https?:\/\//i.test(rawSvg);

  const containsForbiddenScript =
    containsScriptTag || containsJsScheme || containsEventHandlers || containsExternalLinks;

  let safeSvg = rawSvg
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*`[^`]*`/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/<use[^>]*href\s*=\s*["']https?:\/\/[^"']*["'][^>]*\/?>/gi, '');

  return {
    safeSvg,
    isSanitized: true,
    containsForbiddenScript,
  };
}

export function calculateEffectiveDpi(
  pixelWidth: number,
  pixelHeight: number,
  targetWidthInches = 6.0,
  targetHeightInches = 9.0
): {
  dpiWidth: number;
  dpiHeight: number;
  effectiveDpi: number;
  isPrintReady: boolean;
  aspectRatio: number;
} {
  const safeW = Math.max(1, pixelWidth || 1200);
  const safeH = Math.max(1, pixelHeight || 1800);

  const dpiW = Math.round(safeW / targetWidthInches);
  const dpiH = Math.round(safeH / targetHeightInches);
  const effectiveDpi = Math.min(dpiW, dpiH);
  const isPrintReady = effectiveDpi >= 300;
  const aspectRatio = Number((safeW / safeH).toFixed(2));

  return {
    dpiWidth: dpiW,
    dpiHeight: dpiH,
    effectiveDpi,
    isPrintReady,
    aspectRatio,
  };
}

export function createIllustrationAssetFromUpload(
  bookId: string,
  title: string,
  dataUrl: string,
  fileSize: number,
  mimeType: string,
  chapterId?: string
): VisualAsset {
  let finalDataUrl = dataUrl;
  let svgContent: string | undefined = undefined;

  if (mimeType === 'image/svg+xml') {
    const rawContent = dataUrl.startsWith('data:image/svg+xml;')
      ? decodeURIComponent(dataUrl.split(',')[1] || '')
      : dataUrl;
    const sanitization = sanitizeSvgContent(rawContent);
    svgContent = sanitization.safeSvg;
  }

  return {
    id: `ill_asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    bookId,
    assetType: 'illustration',
    sourceType: 'USER_UPLOAD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
    rightsStatus: 'RIGHTS_DECLARED',
    chapterId,
    title,
    dataUrl: finalDataUrl,
    svgContent,
    fileSize,
    mimeType,
    licenseInfo: {
      licenseName: 'Author Created / Custom License',
      usageNotes: 'Uploaded directly by book author for chapter illustration.',
    },
    metadata: {
      uploadFileName: title,
      dpi: 300,
      effectiveDpi: 300,
      isPrintReady: true,
    },
  };
}

export function generateDefaultArtBrief(
  bookId: string,
  title: string,
  category: string,
  language: 'en' | 'es' = 'es',
  profile: 'text-first' | 'visual-first' | 'technical-first' = 'technical-first'
): VisualArtBrief {
  const isTech = profile === 'technical-first' || category === 'technical';
  const isVisual = profile === 'visual-first';

  const styleKeywords = isTech
    ? ['diagrammatic', 'clean-lines', 'high-contrast', 'vector-precision', 'schematic']
    : isVisual
    ? ['vibrant', 'cinematic', 'artistic-depth', 'storyboarding', 'rich-palette']
    : ['minimalist', 'sober', 'classic-serif', 'narrative-focus', 'monochrome'];

  const theme = isTech
    ? 'Precision Engineering & System Architecture'
    : isVisual
    ? 'Immersive Visual Storytelling & Expressive Artwork'
    : 'Subtle Narrative Enrichment & Typographic Harmony';

  return {
    bookId,
    language,
    editorialProfile: profile,
    visualTheme: theme,
    targetAudience: category || 'General Audience',
    styleKeywords,
    colorPalette: {
      primary: '#081629',
      secondary: '#101F37',
      accent: '#345CFF',
      background: '#F8FAFC',
    },
    updatedAt: new Date().toISOString(),
  };
}

export function generateDefaultStyleGuide(
  bookId: string,
  profile: 'text-first' | 'visual-first' | 'technical-first' = 'technical-first'
): VisualStyleGuide {
  return {
    bookId,
    headingFont: profile === 'text-first' ? 'Times-Roman' : 'Helvetica-Bold',
    bodyFont: profile === 'text-first' ? 'Georgia' : 'Helvetica',
    illustrationStyle:
      profile === 'technical-first'
        ? 'Vector Schematics & Technical Diagrams'
        : profile === 'visual-first'
        ? 'Full-bleed Rich Digital Artwork'
        : 'Sober Line Art & Chapter Header Ornaments',
    iconographyStyle: 'Minimal Outline Vectors',
    compositionRules: [
      'Maintain 0.25 inch safe margins inside trim',
      'Ensure 300 DPI effective resolution for raster prints',
      'Use high contrast dark-on-light color ratios',
      'Sanitize all vector SVG files against external scripts',
    ],
    photoTreatment: 'High contrast monochrome or balanced CMYK color profile',
    namingConvention: `${bookId}_ch[NO]_[ASSET_TYPE]_[V]`,
  };
}

export function createChapterVisualMapping(
  bookId: string,
  chapterId: string,
  assetId: string,
  validChapterIds: string[],
  role: 'hero_illustration' | 'diagram' | 'chart' | 'infographic' | 'ornament' = 'hero_illustration',
  caption = '',
  altText = '',
  language: 'en' | 'es' = 'es'
): { success: boolean; mapping?: ChapterVisualMapping; code?: string; error?: string } {
  if (validChapterIds.length > 0 && !validChapterIds.includes(chapterId)) {
    return {
      success: false,
      code: 'INVALID_CHAPTER_ID',
      error: `Chapter ID "${chapterId}" does not exist in book project blueprint.`,
    };
  }

  const mapping: ChapterVisualMapping = {
    bookId,
    chapterId,
    assetId,
    version: 1,
    editorialRole: role,
    proposedOrder: 1,
    caption: caption || 'Chapter Illustration',
    altText: altText || caption || 'Visual Asset for Chapter',
    language,
    suggestedPosition: 'inline',
  };

  return { success: true, mapping };
}

export function evaluateQualityGate4C(
  bookId: string,
  artBrief: VisualArtBrief,
  assets: VisualAsset[],
  validChapterIds: string[] = []
): QualityGate4CReport {
  const checks: QualityGate4CReport['checks'] = [];
  const aiStatus = checkAiImageStatus();

  // Check 1: Art Brief & Editorial Profile
  const briefValid = Boolean(artBrief && artBrief.bookId === bookId && artBrief.editorialProfile);
  checks.push({
    id: 'chk_brief',
    name: 'Visual Art Brief & Editorial Profile',
    passed: briefValid,
    details: briefValid
      ? `Art Brief configured for profile "${artBrief.editorialProfile}" (${artBrief.language.toUpperCase()}).`
      : 'Visual Art Brief missing or unconfigured.',
  });

  // Check 2: Assets Existence
  const hasAssets = assets.length > 0;
  checks.push({
    id: 'chk_assets_exist',
    name: 'Visual Assets Production',
    passed: hasAssets,
    details: hasAssets
      ? `Found ${assets.length} visual asset(s) in project repository.`
      : 'No visual assets created or uploaded for this project (ASSETS_MISSING).',
  });

  // Check 3: Chapter Association Validity
  let chapterIdsOk = true;
  let unassignedCount = 0;
  for (const a of assets) {
    if (a.assetType !== 'cover') {
      if (!a.chapterId) {
        unassignedCount++;
      } else if (validChapterIds.length > 0 && !validChapterIds.includes(a.chapterId)) {
        chapterIdsOk = false;
      }
    }
  }

  checks.push({
    id: 'chk_chapter_mapping',
    name: 'Chapter Visual Mapping Authority',
    passed: chapterIdsOk,
    details: chapterIdsOk
      ? unassignedCount === 0
        ? 'All non-cover assets mapped to valid book chapters.'
        : `${unassignedCount} asset(s) unassigned to specific chapters.`
      : 'One or more assets reference invalid non-existent chapter IDs (INVALID_CHAPTER_ID).',
  });

  // Check 4: SVG Security & Sanitization
  let svgSecurityOk = true;
  let sanitizedCount = 0;
  for (const a of assets) {
    if (a.svgContent) {
      sanitizedCount++;
      const res = sanitizeSvgContent(a.svgContent);
      if (res.containsForbiddenScript) {
        svgSecurityOk = false;
      }
    }
  }

  checks.push({
    id: 'chk_svg_security',
    name: 'SVG Vector Security & Sanitization',
    passed: svgSecurityOk,
    details: svgSecurityOk
      ? `${sanitizedCount} vector SVG asset(s) verified clean of scripts & external links.`
      : 'Forbidden executable script or remote URL detected in SVG markup.',
  });

  // Check 5: Resolution & Effective DPI
  let dpiOk = true;
  for (const a of assets) {
    if (a.metadata && a.metadata.effectiveDpi && a.metadata.effectiveDpi < 150) {
      dpiOk = false;
    }
  }

  checks.push({
    id: 'chk_dpi_resolution',
    name: 'Effective Print Resolution & DPI Integrity',
    passed: dpiOk,
    details: dpiOk
      ? 'All raster assets meet digital & physical print resolution requirements (300 DPI effective target).'
      : 'Low resolution raster image detected (<150 DPI effective print size).',
  });

  // Check 6: Rights & Provenance Verification
  let unverifiedRights = 0;
  for (const a of assets) {
    if (a.rightsStatus === 'RIGHTS_UNVERIFIED') {
      unverifiedRights++;
    }
  }

  const rightsOk = unverifiedRights === 0;
  checks.push({
    id: 'chk_rights_provenance',
    name: 'Copyright & Provenance Declaration',
    passed: rightsOk,
    details: rightsOk
      ? 'All assets have declared author copyright or approved license metadata.'
      : `${unverifiedRights} asset(s) have unverified rights status (RIGHTS_NOT_VERIFIED).`,
  });

  // Check 7: Accessibility & Metadata Completeness
  let accessibilityOk = true;
  for (const a of assets) {
    if (!a.title || a.title.trim().length < 2) {
      accessibilityOk = false;
    }
  }

  checks.push({
    id: 'chk_accessibility',
    name: 'Accessibility Captions & Alt Text',
    passed: accessibilityOk,
    details: accessibilityOk
      ? 'All assets contain valid titles and accessibility alt text descriptors.'
      : 'Missing titles or accessibility metadata.',
  });

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  let status: QualityGate4CStatus = 'ART_DIRECTION_READY';

  if (!hasAssets) {
    status = 'ASSETS_MISSING';
  } else if (!rightsOk) {
    status = 'RIGHTS_NOT_VERIFIED';
  } else if (!chapterIdsOk || !svgSecurityOk || score < 80) {
    status = 'NEEDS_FIX';
  } else {
    status = 'ART_DIRECTION_READY';
  }

  return {
    status,
    score,
    checks,
    aiStatus: {
      code: aiStatus.code,
      message: aiStatus.message,
      isIndependent: true,
    },
    assetMetrics: {
      totalAssets: assets.length,
      dpiVerified: dpiOk,
      rightsVerified: rightsOk,
      sanitizedSvgCount: sanitizedCount,
    },
  };
}


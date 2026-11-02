import { TypesettingConfig, MarginMath, TrimSize } from './editorialTypes';

export function calculateTrimGeometry(trimSize: TrimSize): { widthMm: number; heightMm: number; widthIn: number; heightIn: number } {
  switch (trimSize) {
    case '8.5x11':
      return { widthMm: 215.9, heightMm: 279.4, widthIn: 8.5, heightIn: 11 };
    case 'a4':
      return { widthMm: 210, heightMm: 297, widthIn: 8.27, heightIn: 11.69 };
    case '5.5x8.5':
      return { widthMm: 139.7, heightMm: 215.9, widthIn: 5.5, heightIn: 8.5 };
    case '7x10':
      return { widthMm: 177.8, heightMm: 254, widthIn: 7, heightIn: 10 };
    case '6x9':
    default:
      return { widthMm: 152.4, heightMm: 228.6, widthIn: 6, heightIn: 9 };
  }
}

export function calculatePrintArea(
  trimSize: TrimSize,
  margins: MarginMath
): { printWidthMm: number; printHeightMm: number; gridRatio: string } {
  const geom = calculateTrimGeometry(trimSize);
  const printWidthMm = geom.widthMm - (margins.insideMm + margins.outsideMm);
  const printHeightMm = geom.heightMm - (margins.topMm + margins.bottomMm);
  const ratio = (printWidthMm / printHeightMm).toFixed(2);

  return {
    printWidthMm: Number(printWidthMm.toFixed(2)),
    printHeightMm: Number(printHeightMm.toFixed(2)),
    gridRatio: `${ratio}:1`,
  };
}

export function validateMargins(margins: MarginMath, trimSize: TrimSize): { valid: boolean; warning?: string } {
  const geom = calculateTrimGeometry(trimSize);
  if (margins.insideMm < 15) {
    return { valid: false, warning: 'Gutter (inside margin) should be at least 15mm for proper book binding.' };
  }
  if (margins.insideMm + margins.outsideMm >= geom.widthMm * 0.6) {
    return { valid: false, warning: 'Margins exceed 60% of trim width, leaving insufficient room for text columns.' };
  }
  return { valid: true };
}

export function formatCSSFontFamily(fontName: string): string {
  if (!fontName) return 'sans-serif';
  return fontName.includes(',') ? fontName : `"${fontName}", sans-serif`;
}

// Standard AFM Glyph Widths for Helvetica / WinAnsiEncoding (in 1/1000 em)
export const HELVETICA_GLYPH_WIDTHS: Record<number, number> = {
  32: 278,  // space
  33: 278,  // !
  34: 355,  // "
  35: 556,  // #
  36: 556,  // $
  37: 889,  // %
  38: 667,  // &
  39: 222,  // '
  40: 333,  // (
  41: 333,  // )
  42: 389,  // *
  43: 584,  // +
  44: 278,  // ,
  45: 333,  // -
  46: 278,  // .
  47: 278,  // /
  48: 556, 49: 556, 50: 556, 51: 556, 52: 556, 53: 556, 54: 556, 55: 556, 56: 556, 57: 556, // 0-9
  58: 278,  // :
  59: 278,  // ;
  60: 584,  // <
  61: 584,  // =
  62: 584,  // >
  63: 556,  // ?
  64: 1015, // @
  65: 667, 66: 667, 67: 722, 68: 722, 69: 667, 70: 611, 71: 778, 72: 722, 73: 278, 74: 500, // A-J
  75: 667, 76: 556, 77: 833, 78: 722, 79: 778, 80: 667, 81: 778, 82: 722, 83: 667, 84: 611, // K-T
  85: 722, 86: 667, 87: 944, 88: 667, 89: 667, 90: 611, // U-Z
  91: 278, 92: 278, 93: 278, 94: 469, 95: 556, 96: 222, // [ \ ] ^ _ `
  97: 556, 98: 556, 99: 500, 100: 556, 101: 556, 102: 278, 103: 556, 104: 556, 105: 222, 106: 222, // a-j
  107: 500, 108: 222, 109: 833, 110: 556, 111: 556, 112: 556, 113: 556, 114: 333, 115: 500, 116: 278, // k-t
  117: 556, 118: 500, 119: 722, 120: 500, 121: 500, 122: 500, // u-z
  123: 334, 124: 260, 125: 334, 126: 584, // { | } ~
  // WinAnsiEncoding Extended Accents & Punctuation
  161: 333, // ¡
  171: 556, // «
  187: 556, // »
  191: 556, // ¿
  192: 667, 193: 667, 194: 667, 195: 667, 196: 667, // À Á Â Ã Ä
  200: 667, 201: 667, 202: 667, 203: 667, // È É Ê Ë
  204: 278, 205: 278, 206: 278, 207: 278, // Ì Í Î Ï
  209: 722, // Ñ
  210: 778, 211: 778, 212: 778, 213: 778, 214: 778, // Ò Ó Ô Õ Ö
  217: 722, 218: 722, 219: 722, 220: 722, // Ù Ú Û Ü
  224: 556, 225: 556, 226: 556, 227: 556, 228: 556, // à á â ã ä
  231: 500, // ç
  232: 556, 233: 556, 234: 556, 235: 556, // è é ê ë
  236: 222, 237: 222, 238: 222, 239: 222, // ì í î ï
  241: 556, // ñ
  242: 556, 243: 556, 244: 556, 245: 556, 246: 556, // ò ó ô õ ö
  249: 556, 250: 556, 251: 556, 252: 556, // ù ú û ü
};

// Standard AFM Glyph Widths for Times-Roman / WinAnsiEncoding (in 1/1000 em)
export const TIMES_ROMAN_GLYPH_WIDTHS: Record<number, number> = {
  32: 250,  // space
  33: 333,  // !
  34: 408,  // "
  35: 500,  // #
  36: 500,  // $
  37: 833,  // %
  38: 778,  // &
  39: 180,  // '
  40: 333,  // (
  41: 333,  // )
  42: 500,  // *
  43: 564,  // +
  44: 250,  // ,
  45: 333,  // -
  46: 250,  // .
  47: 278,  // /
  48: 500, 49: 500, 50: 500, 51: 500, 52: 500, 53: 500, 54: 500, 55: 500, 56: 500, 57: 500, // 0-9
  58: 278,  // :
  59: 278,  // ;
  60: 564,  // <
  61: 564,  // =
  62: 564,  // >
  63: 444,  // ?
  64: 921,  // @
  65: 722, 66: 667, 67: 667, 68: 722, 69: 611, 70: 556, 71: 722, 72: 722, 73: 333, 74: 389, // A-J
  75: 722, 76: 611, 77: 889, 78: 722, 79: 722, 80: 556, 81: 722, 82: 667, 83: 556, 84: 611, // K-T
  85: 722, 86: 556, 87: 889, 88: 667, 89: 556, 90: 556, // U-Z
  91: 333, 92: 278, 93: 333, 94: 469, 95: 500, 96: 333, // [ \ ] ^ _ `
  97: 444, 98: 500, 99: 444, 100: 500, 101: 444, 102: 333, 103: 500, 104: 500, 105: 278, 106: 278, // a-j
  107: 500, 108: 278, 109: 778, 110: 500, 111: 500, 112: 500, 113: 500, 114: 333, 115: 389, 116: 278, // k-t
  117: 500, 118: 500, 119: 722, 120: 500, 121: 500, 122: 444, // u-z
  123: 480, 124: 200, 125: 480, 126: 541, // { | } ~
};

/**
 * Measures exact string width in points using standard AFM metrics for Helvetica, Times-Roman, or Courier.
 */
export function measureTextWidthPt(
  text: string,
  fontSizePt: number,
  fontName: 'Helvetica' | 'Times-Roman' | 'Courier' = 'Helvetica'
): number {
  if (!text) return 0;
  let emUnits = 0;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    let width = 556;
    if (fontName === 'Courier') {
      width = 600; // Monospaced 600 em-units for all chars
    } else if (fontName === 'Times-Roman') {
      width = TIMES_ROMAN_GLYPH_WIDTHS[code] || 480;
    } else {
      width = HELVETICA_GLYPH_WIDTHS[code] || 556;
    }
    emUnits += width;
  }
  return (emUnits / 1000) * fontSizePt;
}

/**
 * Wraps text into lines based on exact typographical width measurement in points for the specified font.
 */
export function wrapTextByMetrics(
  text: string,
  maxLineWidthPt: number,
  fontSizePt: number,
  fontName: 'Helvetica' | 'Times-Roman' | 'Courier' = 'Helvetica'
): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];

  const words = trimmed.split(/(\s+)/);
  const lines: string[] = [];
  let currentLine = '';
  let currentLineWidth = 0;

  for (let i = 0; i < words.length; i++) {
    const token = words[i];
    if (!token) continue;

    const tokenWidth = measureTextWidthPt(token, fontSizePt, fontName);

    if (currentLineWidth + tokenWidth <= maxLineWidthPt) {
      currentLine += token;
      currentLineWidth += tokenWidth;
    } else {
      if (token.trim() === '') {
        continue;
      }
      if (currentLine.trim()) {
        lines.push(currentLine.trimEnd());
      }
      currentLine = token;
      currentLineWidth = tokenWidth;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trimEnd());
  }

  return lines;
}

export const RECOMMENDED_FONT_PAIRINGS = [
  {
    name: 'Classic Editorial (Serif)',
    headingFont: 'Cormorant Garamond, Georgia, serif',
    bodyFont: 'Lora, Times New Roman, serif',
    codeFont: 'Space Mono, monospace',
    idealFor: 'Novels, literary fiction, essays, memoirs',
  },
  {
    name: 'Modern Technical (Sans / Clean)',
    headingFont: 'Outfit, Plus Jakarta Sans, sans-serif',
    bodyFont: 'DM Sans, Public Sans, sans-serif',
    codeFont: 'IBM Plex Mono, monospace',
    idealFor: 'Software textbooks, business manuals, engineering guides',
  },
  {
    name: 'Luxury Visual (Serif + Clean Sans)',
    headingFont: 'Playfair Display, Bodoni, serif',
    bodyFont: 'Plus Jakarta Sans, Manrope, sans-serif',
    codeFont: 'JetBrains Mono, monospace',
    idealFor: 'Art catalogs, photography portfolios, illustrated books',
  },
];

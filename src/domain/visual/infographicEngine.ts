import { InfographicSpec } from './visualTypes';

export function createDefaultInfographicSpec(): InfographicSpec {
  return {
    title: 'Enterprise Editorial Quality Blueprint',
    subtitle: 'Core Pillars of 600-Page Book Production',
    topic: 'Book Architecture',
    footerReference: 'EditorynIQ™ ADN V100 Editorial Guidelines 2026',
    blocks: [
      {
        id: 'b1',
        title: 'Rigorous Fact-Checking',
        content: '100% verified citations, documented primary sources, and audit evidence.',
        highlightNumber: '100%',
        highlightUnit: 'Audited',
        blockType: 'metric',
      },
      {
        id: 'b2',
        title: 'Precision Page Budget',
        content: 'Controlled distribution across 20 to 600 standard pages with strict section pacing.',
        highlightNumber: '600',
        highlightUnit: 'Max Pages',
        blockType: 'metric',
      },
      {
        id: 'b3',
        title: 'Vector Visual Assets',
        content: 'High-resolution covers, diagrams, and charts built to press vector standards.',
        blockType: 'text',
      },
      {
        id: 'b4',
        title: 'Rights & Provenance',
        content: 'Clear copyright history, license declarations, and SHA256 file hashes.',
        blockType: 'text',
      },
    ],
  };
}

export function generateInfographicSVG(spec: InfographicSpec, width = 640, height = 520): string {
  const blocksMarkup = spec.blocks
    .map((block, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);

      const bx = 30 + col * 290;
      const by = 110 + row * 180;

      return `<g transform="translate(${bx}, ${by})">
        <rect width="270" height="160" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
        <rect width="270" height="4" rx="2" fill="#345CFF" />
        ${
          block.highlightNumber
            ? `<text x="20" y="45" fill="#345CFF" font-family="Plus Jakarta Sans, sans-serif" font-size="28" font-weight="800">${escapeXml(
                block.highlightNumber
              )} <tspan fill="#64748B" font-size="12" font-weight="bold">${escapeXml(block.highlightUnit || '')}</tspan></text>`
            : ''
        }
        <text x="20" y="${block.highlightNumber ? 75 : 40}" fill="#081629" font-family="Plus Jakarta Sans, sans-serif" font-size="14" font-weight="700">
          ${escapeXml(block.title)}
        </text>
        <text x="20" y="${block.highlightNumber ? 100 : 65}" fill="#475569" font-family="DM Sans, sans-serif" font-size="11" font-weight="400">
          ${splitTextIntoTSpans(block.content, 20, block.highlightNumber ? 100 : 65, 18, 230)}
        </text>
      </g>`;
    })
    .join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%">
  <rect width="${width}" height="${height}" fill="#FFFFFF" rx="8" />
  
  <!-- Header Banner -->
  <rect width="${width}" height="80" fill="#081629" rx="8" />
  <text x="30" y="38" fill="#FFFFFF" font-family="Plus Jakarta Sans, sans-serif" font-size="18" font-weight="800">
    ${escapeXml(spec.title)}
  </text>
  <text x="30" y="60" fill="#16C8BA" font-family="DM Sans, sans-serif" font-size="12" font-weight="600">
    ${escapeXml(spec.subtitle)}
  </text>

  <!-- Content Blocks -->
  ${blocksMarkup}

  <!-- Footer Citation -->
  <line x1="30" y1="${height - 40}" x2="${width - 30}" y2="${height - 40}" stroke="#E2E8F0" stroke-width="1" />
  <text x="30" y="${height - 18}" fill="#64748B" font-family="sans-serif" font-size="10">
    Ref: ${escapeXml(spec.footerReference)}
  </text>
</svg>`;
}

function escapeXml(str: string): string {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function splitTextIntoTSpans(text: string, x: number, startY: number, lineHeight: number, maxWidthPx: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length * 7 > maxWidthPx) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);

  return lines
    .map(
      (line, i) =>
        `<tspan x="${x}" y="${startY + i * lineHeight}">${escapeXml(line)}</tspan>`
    )
    .join('');
}

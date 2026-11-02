export const visualExportService = {
  exportSVG(svgMarkup: string, filename: string): void {
    if (!svgMarkup) return;
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', url);
    downloadAnchor.setAttribute('download', filename.endsWith('.svg') ? filename : `${filename}.svg`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
  },

  async exportPNG(svgMarkup: string, filename: string, width = 1200, height = 900): Promise<boolean> {
    if (!svgMarkup) return false;

    return new Promise((resolve) => {
      try {
        const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(false);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const pngUrl = canvas.toDataURL('image/png');
          const anchor = document.createElement('a');
          anchor.setAttribute('href', pngUrl);
          anchor.setAttribute('download', filename.endsWith('.png') ? filename : `${filename}.png`);
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();

          URL.revokeObjectURL(url);
          resolve(true);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        img.src = url;
      } catch {
        resolve(false);
      }
    });
  },

  async exportJPEG(svgMarkup: string, filename: string, width = 1600, height = 2560, quality = 0.92): Promise<boolean> {
    if (!svgMarkup) return false;

    return new Promise((resolve) => {
      try {
        const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            URL.revokeObjectURL(url);
            resolve(false);
            return;
          }

          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const jpegUrl = canvas.toDataURL('image/jpeg', quality);
          const anchor = document.createElement('a');
          anchor.setAttribute('href', jpegUrl);
          anchor.setAttribute('download', filename.endsWith('.jpg') || filename.endsWith('.jpeg') ? filename : `${filename}.jpg`);
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();

          URL.revokeObjectURL(url);
          resolve(true);
        };

        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(false);
        };

        img.src = url;
      } catch {
        resolve(false);
      }
    });
  },

  generatePrintCoverPdfBinary(
    spec: any,
    config: any,
    bgAsset?: any
  ): { pdfString: string; widthPt: number; heightPt: number } {
    const toMm = (val: number) => Number((val * 25.4).toFixed(2));
    const safePages = Math.max(1, config.pageCount || 200);

    let factor = 0.002252;
    if (config.inkPaperType === 'BW_CREAM') factor = 0.0025;
    else if (config.inkPaperType === 'PREMIUM_COLOR') factor = 0.002347;

    const spineW = Number((safePages * factor).toFixed(4));
    let trimW = 6.0;
    let trimH = 9.0;
    if (config.trimSize === '5x8') { trimW = 5.0; trimH = 8.0; }
    else if (config.trimSize === '5.5x8.5') { trimW = 5.5; trimH = 8.5; }
    else if (config.trimSize === '8.5x11') { trimW = 8.5; trimH = 11.0; }

    const bleed = 0.125;
    const totalWInches = Number((2 * trimW + spineW + 2 * bleed).toFixed(4));
    const totalHInches = Number((trimH + 2 * bleed).toFixed(4));

    const widthPt = Number((totalWInches * 72).toFixed(2));
    const heightPt = Number((totalHInches * 72).toFixed(2));

    const spineTextEligible = config.provider === 'KDP_PAPERBACK'
      ? config.pageCount >= 80 && spineW >= 0.10
      : Boolean(config.hasOfficialTemplate);

    const hexToRgb = (hex: string) => {
      const c = (hex || '#081629').replace('#', '');
      const num = parseInt(c.length === 3 ? c.split('').map((x) => x + x).join('') : c, 16);
      return {
        r: Number((((num >> 16) & 255) / 255).toFixed(3)),
        g: Number((((num >> 8) & 255) / 255).toFixed(3)),
        b: Number(((num & 255) / 255).toFixed(3)),
      };
    };

    const bgRgb = hexToRgb(spec.bgColor || '#081629');
    const accentRgb = hexToRgb(spec.accentColor || '#345CFF');
    const textRgb = hexToRgb(spec.textColor || '#FFFFFF');

    const bleedPt = bleed * 72;
    const trimWPt = trimW * 72;
    const trimHPt = trimH * 72;
    const spineWPt = spineW * 72;

    const backXPt = bleedPt;
    const spineXPt = bleedPt + trimWPt;
    const frontXPt = bleedPt + trimWPt + spineWPt;

    const streamCommands: string[] = [];

    // Background fill
    streamCommands.push(`${bgRgb.r} ${bgRgb.g} ${bgRgb.b} rg`);
    streamCommands.push(`0 0 ${widthPt} ${heightPt} re f`);

    // Spine Background
    streamCommands.push(`0.02 0.05 0.10 rg`);
    streamCommands.push(`${spineXPt.toFixed(2)} ${bleedPt.toFixed(2)} ${spineWPt.toFixed(2)} ${trimHPt.toFixed(2)} re f`);

    // Back Cover Header
    streamCommands.push(`BT`);
    streamCommands.push(`/F2 16 Tf`);
    streamCommands.push(`${accentRgb.r} ${accentRgb.g} ${accentRgb.b} rg`);
    streamCommands.push(`1 0 0 1 ${(backXPt + 36).toFixed(2)} ${(heightPt - bleedPt - 54).toFixed(2)} Tm`);
    streamCommands.push(`(ABOUT THIS EDITION) Tj`);
    streamCommands.push(`ET`);

    // Back Cover Blurb
    streamCommands.push(`BT`);
    streamCommands.push(`/F1 11 Tf`);
    streamCommands.push(`${textRgb.r} ${textRgb.g} ${textRgb.b} rg`);
    const cleanBlurb = (spec.backCoverBlurb || '').replace(/[()\\]/g, '');
    const words = cleanBlurb.split(' ');
    let line = '';
    let currY = heightPt - bleedPt - 84;
    for (const word of words) {
      if ((line + ' ' + word).length * 6 > trimWPt - 72) {
        streamCommands.push(`1 0 0 1 ${(backXPt + 36).toFixed(2)} ${currY.toFixed(2)} Tm (${line}) Tj`);
        line = word;
        currY -= 16;
      } else {
        line = line ? line + ' ' + word : word;
      }
    }
    if (line) {
      streamCommands.push(`1 0 0 1 ${(backXPt + 36).toFixed(2)} ${currY.toFixed(2)} Tm (${line}) Tj`);
    }
    streamCommands.push(`ET`);

    // Barcode Reserve Area
    const bcWPt = 144;
    const bcHPt = 86;
    const bcXPt = backXPt + trimWPt - 36 - bcWPt;
    const bcYPt = bleedPt + 36;

    streamCommands.push(`1 1 1 rg`);
    streamCommands.push(`${bcXPt.toFixed(2)} ${bcYPt.toFixed(2)} ${bcWPt} ${bcHPt} re f`);
    streamCommands.push(`0 0 0 RG 1 w`);
    streamCommands.push(`${bcXPt.toFixed(2)} ${bcYPt.toFixed(2)} ${bcWPt} ${bcHPt} re S`);

    // Barcode Lines
    streamCommands.push(`0 0 0 rg`);
    for (let i = 0; i < 14; i++) {
      const bx = bcXPt + 12 + i * 9;
      const bw = i % 3 === 0 ? 4 : 2;
      streamCommands.push(`${bx.toFixed(2)} ${(bcYPt + 20).toFixed(2)} ${bw} 54 re f`);
    }

    // Barcode label
    streamCommands.push(`BT`);
    streamCommands.push(`/F3 8 Tf`);
    streamCommands.push(`0 0 0 rg`);
    streamCommands.push(`1 0 0 1 ${(bcXPt + 12).toFixed(2)} ${(bcYPt + 8).toFixed(2)} Tm`);
    streamCommands.push(`(BARCODE RESERVED 978-0-123456-78-9) Tj`);
    streamCommands.push(`ET`);

    // Spine Text
    if (spineTextEligible) {
      const cleanSpineTitle = (spec.spineTitle || spec.frontTitle || '').replace(/[()\\]/g, '');
      const cleanSpineAuthor = (spec.spineAuthor || spec.authorName || '').replace(/[()\\]/g, '');
      const spineTextStr = `${cleanSpineTitle} - ${cleanSpineAuthor}`;

      streamCommands.push(`q`);
      const spineCenterX = spineXPt + spineWPt / 2;
      const spineCenterY = bleedPt + trimHPt / 2;
      streamCommands.push(`0 -1 1 0 ${spineCenterX.toFixed(2)} ${spineCenterY.toFixed(2)} cm`);
      streamCommands.push(`BT`);
      const spineFontSize = Math.min(14, Math.max(9, spineWPt * 0.45));
      streamCommands.push(`/F2 ${spineFontSize.toFixed(1)} Tf`);
      streamCommands.push(`${textRgb.r} ${textRgb.g} ${textRgb.b} rg`);
      streamCommands.push(`-100 -4 Tm`);
      streamCommands.push(`(${spineTextStr}) Tj`);
      streamCommands.push(`ET`);
      streamCommands.push(`Q`);
    }

    // Front Cover Title
    const cleanFrontTitle = (spec.frontTitle || '').replace(/[()\\]/g, '');
    const cleanSubtitle = (spec.frontSubtitle || '').replace(/[()\\]/g, '');
    const cleanAuthor = (spec.authorName || '').replace(/[()\\]/g, '');
    const cleanPublisher = (spec.publisherName || '').replace(/[()\\]/g, '');

    streamCommands.push(`BT`);
    streamCommands.push(`/F2 26 Tf`);
    streamCommands.push(`${textRgb.r} ${textRgb.g} ${textRgb.b} rg`);
    let fTitleY = heightPt - bleedPt - 72;
    const titleWords = cleanFrontTitle.split(' ');
    let tLine = '';
    for (const tw of titleWords) {
      if ((tLine + ' ' + tw).length * 14 > trimWPt - 72) {
        streamCommands.push(`1 0 0 1 ${(frontXPt + 36).toFixed(2)} ${fTitleY.toFixed(2)} Tm (${tLine}) Tj`);
        tLine = tw;
        fTitleY -= 32;
      } else {
        tLine = tLine ? tLine + ' ' + tw : tw;
      }
    }
    if (tLine) {
      streamCommands.push(`1 0 0 1 ${(frontXPt + 36).toFixed(2)} ${fTitleY.toFixed(2)} Tm (${tLine}) Tj`);
    }
    streamCommands.push(`ET`);

    // Front Cover Subtitle
    if (cleanSubtitle) {
      streamCommands.push(`BT`);
      streamCommands.push(`/F1 14 Tf`);
      streamCommands.push(`0.65 0.72 0.82 rg`);
      streamCommands.push(`1 0 0 1 ${(frontXPt + 36).toFixed(2)} ${(fTitleY - 24).toFixed(2)} Tm (${cleanSubtitle}) Tj`);
      streamCommands.push(`ET`);
    }

    // Front Accent Line
    streamCommands.push(`${accentRgb.r} ${accentRgb.g} ${accentRgb.b} rg`);
    streamCommands.push(`${(frontXPt + 36).toFixed(2)} ${(bleedPt + 90).toFixed(2)} 90 4 re f`);

    // Author
    streamCommands.push(`BT`);
    streamCommands.push(`/F2 18 Tf`);
    streamCommands.push(`${textRgb.r} ${textRgb.g} ${textRgb.b} rg`);
    streamCommands.push(`1 0 0 1 ${(frontXPt + 36).toFixed(2)} ${(bleedPt + 54).toFixed(2)} Tm (${cleanAuthor}) Tj`);
    streamCommands.push(`ET`);

    // Publisher
    streamCommands.push(`BT`);
    streamCommands.push(`/F1 10 Tf`);
    streamCommands.push(`0.45 0.52 0.62 rg`);
    streamCommands.push(`1 0 0 1 ${(frontXPt + 36).toFixed(2)} ${(bleedPt + 36).toFixed(2)} Tm (${cleanPublisher}) Tj`);
    streamCommands.push(`ET`);

    const streamContent = streamCommands.join('\n');
    const streamLength = streamContent.length;

    const objects: string[] = [];
    objects[1] = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj`;
    objects[2] = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj`;
    objects[3] = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${widthPt} ${heightPt}] /Resources 4 0 R /Contents 5 0 R >>\nendobj`;
    objects[4] = `4 0 obj\n<< /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> /F2 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >> /F3 << /Type /Font /Subtype /Type1 /BaseFont /Courier >> >> >>\nendobj`;
    objects[5] = `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj`;

    let header = `%PDF-1.4\n%âãÏÓ\n`;
    let body = '';
    const xrefOffsets: number[] = [0];

    for (let i = 1; i <= 5; i++) {
      xrefOffsets[i] = header.length + body.length;
      body += objects[i] + '\n';
    }

    const startXref = header.length + body.length;

    let xref = `xref\n0 6\n0000000000 65535 f \n`;
    for (let i = 1; i <= 5; i++) {
      const off = xrefOffsets[i].toString().padStart(10, '0');
      xref += `${off} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

    const pdfString = header + body + xref + trailer;

    return { pdfString, widthPt, heightPt };
  },

  async exportPrintCoverPDF(
    spec: any,
    config: any,
    filename: string,
    bgAsset?: any
  ): Promise<boolean> {
    try {
      const { pdfString } = this.generatePrintCoverPdfBinary(spec, config, bgAsset);
      const blob = new Blob([pdfString], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', url);
      downloadAnchor.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  },
};


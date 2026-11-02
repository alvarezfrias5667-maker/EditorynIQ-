import { EditorialEdition, FormatExportResult } from '../domain/editorial/editorialTypes';
import { generatePDFDocument } from '../domain/editorial/pdfProductionEngine';
import { generateEPUB3Document } from '../domain/editorial/epubProductionEngine';
import { generateDOCXDocument } from '../domain/editorial/docxProductionEngine';
import { localEditorialRepository } from './localEditorialRepository';

export const editorialExportService = {
  async exportPDF(edition: EditorialEdition): Promise<FormatExportResult> {
    const result = await generatePDFDocument(edition);
    this.triggerDownload(result.blobUrl, result.fileName);
    await localEditorialRepository.saveExportRecord(edition.id, result);
    return result;
  },

  async exportEPUB(edition: EditorialEdition): Promise<FormatExportResult> {
    const result = await generateEPUB3Document(edition);
    this.triggerDownload(result.blobUrl, result.fileName);
    await localEditorialRepository.saveExportRecord(edition.id, result);
    return result;
  },

  async exportDOCX(edition: EditorialEdition): Promise<FormatExportResult> {
    const result = await generateDOCXDocument(edition);
    this.triggerDownload(result.blobUrl, result.fileName);
    await localEditorialRepository.saveExportRecord(edition.id, result);
    return result;
  },

  triggerDownload(blobUrl: string | undefined, fileName: string): void {
    if (!blobUrl) return;
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  },
};

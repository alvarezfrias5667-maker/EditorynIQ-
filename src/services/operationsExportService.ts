/**
 * EDITORYNIQ™ OPERATIONS EXPORT SERVICE (PROM 9)
 * Triggers client-side browser downloads for verified local deliverables,
 * Quality Passports, ONIX manifests, and cryptographic backup bundles.
 */

import { DeliverableItem } from '../domain/operations/operationsTypes';
import { generateProjectBackupBundle } from '../domain/operations/recoveryEngine';

export const operationsExportService = {
  /**
   * Downloads a deliverable item (PDF, EPUB, DOCX, JSON).
   */
  async downloadDeliverable(item: DeliverableItem): Promise<boolean> {
    if (!item.isAvailable || item.status !== 'VERIFIED_READY') {
      throw new Error(`Deliverable "${item.title}" is in state "${item.status}" and cannot be exported.`);
    }

    try {
      let downloadBlob: Blob;

      if (item.rawContent) {
        downloadBlob = new Blob([item.rawContent], { type: item.mimeType });
      } else {
        // If deliverable is generated on-the-fly, handle by type
        if (item.type === 'QUALITY_PASSPORT' || item.type === 'ONIX_METADATA') {
          downloadBlob = new Blob([item.rawContent || '{}'], { type: item.mimeType });
        } else {
          throw new Error('Deliverable payload is not loaded into memory.');
        }
      }

      const url = URL.createObjectURL(downloadBlob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('Export download failed:', err);
      return false;
    }
  },

  /**
   * Downloads binary Blob (PDF, EPUB, DOCX) directly.
   */
  downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  },

  /**
   * Generates and downloads a complete cryptographic Project Backup Bundle JSON.
   */
  async exportFullProjectBackup(bookId: string): Promise<string> {
    const bundle = await generateProjectBackupBundle(bookId);
    const jsonStr = JSON.stringify(bundle, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const fileName = `editoryniq_${bookId}_backup_${new Date().toISOString().slice(0, 10)}.json`;

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    return bundle.manifest.bundleSha256;
  },
};

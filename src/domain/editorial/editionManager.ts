import { EditorialEdition } from './editorialTypes';

export function createNewEditionSnapshot(existingEdition: EditorialEdition, snapshotNotes?: string): EditorialEdition {
  return {
    ...existingEdition,
    id: `edition_${existingEdition.bookId}_v${existingEdition.version + 1}_${Date.now().toString(36)}`,
    version: existingEdition.version + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isApproved: false,
    approvedAt: undefined,
    notes: snapshotNotes || `Snapshot v${existingEdition.version + 1} created on ${new Date().toLocaleDateString()}`,
  };
}

export function approveEdition(edition: EditorialEdition): EditorialEdition {
  return {
    ...edition,
    isApproved: true,
    approvedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

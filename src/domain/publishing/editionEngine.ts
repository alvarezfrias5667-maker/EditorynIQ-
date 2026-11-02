import {
  EditionRecord,
  EditionType,
  EditionFormat,
  RightsDeclaration,
  TerritoryScope,
  IsbnStatus,
} from './publishingTypes';
import { BookProject } from '../bookProjectTypes';
import { EditorialEdition } from '../editorial/editorialTypes';

/**
 * Validates an ISBN-13 string using the official EAN-13 weighted checksum algorithm.
 * An ISBN-13 consists of 13 digits (optionally grouped with hyphens).
 */
export function validateIsbn13(rawIsbn: string): { isValid: boolean; status: IsbnStatus; formatted: string; message: string } {
  if (!rawIsbn || !rawIsbn.trim()) {
    return {
      isValid: false,
      status: 'UNASSIGNED',
      formatted: '',
      message: 'No ISBN assigned. Title may be published under direct distribution or channel-assigned identifier.',
    };
  }

  const clean = rawIsbn.replace(/[-\s]/g, '').trim();

  // Support 10-digit ISBN (ISBN-10) with weighted sum mod 11 algorithm
  if (/^\d{9}[\dX]$/i.test(clean)) {
    let sum10 = 0;
    for (let i = 0; i < 9; i++) {
      sum10 += parseInt(clean[i], 10) * (10 - i);
    }
    const rem10 = (11 - (sum10 % 11)) % 11;
    const expected10 = rem10 === 10 ? 'X' : String(rem10);
    const actual10 = clean[9].toUpperCase();

    if (actual10 !== expected10) {
      return {
        isValid: false,
        status: 'INVALID_ISBN13',
        formatted: clean,
        message: `Invalid ISBN-10 checksum (mod 11). Calculated check digit is ${expected10}, but provided ${actual10}.`,
      };
    }

    // Convert valid ISBN-10 to standardized EAN-13 (978 prefix + 9 core digits + EAN-13 check digit)
    const isbn13Base = `978${clean.substring(0, 9)}`;
    let sum13From10 = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(isbn13Base[i], 10);
      sum13From10 += i % 2 === 0 ? digit * 1 : digit * 3;
    }
    const check13 = (10 - (sum13From10 % 10)) % 10;
    const full13 = `${isbn13Base}${check13}`;
    const formatted = `${full13.substring(0, 3)}-${full13.substring(3, 4)}-${full13.substring(4, 8)}-${full13.substring(8, 12)}-${full13.substring(12, 13)}`;

    return {
      isValid: true,
      status: 'VALID_ISBN13',
      formatted,
      message: `Valid ISBN-10 verified (mod 11) and converted to standardized ISBN-13 (${formatted}).`,
    };
  }

  // Support 13-digit ISBN (ISBN-13) with EAN-13 weighted checksum (1/3 mod 10)
  if (!/^\d{13}$/.test(clean)) {
    return {
      isValid: false,
      status: 'INVALID_ISBN13',
      formatted: clean,
      message: 'ISBN must contain exactly 10 digits (ISBN-10) or 13 digits (ISBN-13).',
    };
  }

  // Calculate EAN-13 weighted checksum
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(clean[i], 10);
    sum += i % 2 === 0 ? digit * 1 : digit * 3;
  }

  const calculatedCheckDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = parseInt(clean[12], 10);

  if (calculatedCheckDigit === actualCheckDigit) {
    // Format standard 978-X-XXXX-XXXX-X
    const formatted = `${clean.substring(0, 3)}-${clean.substring(3, 4)}-${clean.substring(4, 8)}-${clean.substring(8, 12)}-${clean.substring(12, 13)}`;
    return {
      isValid: true,
      status: 'VALID_ISBN13',
      formatted,
      message: 'Valid ISBN-13 checksum verified (EAN-13 mod 10).',
    };
  } else {
    return {
      isValid: false,
      status: 'INVALID_ISBN13',
      formatted: clean,
      message: `Invalid ISBN-13 checksum. Calculated check digit is ${calculatedCheckDigit}, but provided ${actualCheckDigit}.`,
    };
  }
}

/**
 * Creates a default EditionRecord derived from an existing BookProject and optional E4 EditorialEdition.
 */
export function createDefaultEditionRecord(
  project: BookProject,
  editorialEdition?: EditorialEdition,
  options?: Partial<EditionRecord>
): EditionRecord {
  const editionId = `ed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const editionType: EditionType = options?.editionType || 'FIRST_EDITION';
  const isbnValidation = validateIsbn13(options?.isbn13 || '');

  return {
    id: editionId,
    bookId: project.id,
    editionName: options?.editionName || `${project.title} — First Edition`,
    editionType,
    version: options?.version || '1.0.0',
    productionLanguage: (project.productionLanguage as 'en' | 'es') || 'en',
    authorName: options?.authorName || 'Primary Author / Copyright Holder',
    publisherImprint: options?.publisherImprint || 'EditorynIQ Publications',
    formats: options?.formats || ['PDF', 'EPUB', 'DOCX'],
    rightsStatus: options?.rightsStatus || 'ALL_OWNED',
    rightsEvidence:
      options?.rightsEvidence ||
      'Author declaration: all manuscripts and content prepared under original authorship.',
    territoryScope: options?.territoryScope || 'WORLDWIDE',
    specificTerritories: options?.specificTerritories || [],
    isbn13: isbnValidation.formatted,
    isbnStatus: isbnValidation.status,
    derivedFromE4EditionId: editorialEdition?.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Formats human-friendly labels for edition types.
 */
export function getEditionTypeLabel(type: EditionType, lang: 'en' | 'es' | 'fr' = 'en'): string {
  const labels: Record<EditionType, { en: string; es: string; fr: string }> = {
    FIRST_EDITION: { en: 'First Edition (Trade)', es: 'Primera Edición (Comercial)', fr: 'Première Édition (Commerciale)' },
    REVISED_EDITION: { en: 'Revised & Updated Edition', es: 'Edición Revisada y Actualizada', fr: 'Édition Révisée et Mise à Jour' },
    SPECIAL_EDITION: { en: 'Special / Collector Edition', es: 'Edición Especial de Coleccionista', fr: 'Édition Spéciale de Collection' },
    TRANSLATION_EDITION: { en: 'Authorized Translation Edition', es: 'Edición de Traducción Autorizada', fr: 'Édition de Traduction Autorisée' },
    PAPERBACK_STANDARD: { en: 'Standard Paperback Edition', es: 'Edición Rústica Estándar (Tapa Blanda)', fr: 'Édition Broché Standard' },
    HARDCOVER_COLLECTOR: { en: 'Hardcover Case Laminate', es: 'Edición Tapa Dura Laminada', fr: 'Édition Reliée Cartonné' },
    DIGITAL_EBOOK: { en: 'Digital Reflowable eBook', es: 'Libro Digital Reajustable (eBook)', fr: 'Livre Numérique Reformatable' },
  };

  return labels[type]?.[lang] || labels[type]?.en || type;
}

/**
 * Formats human-friendly labels for rights declaration.
 */
export function getRightsDeclarationLabel(status: RightsDeclaration, lang: 'en' | 'es' | 'fr' = 'en'): string {
  const labels: Record<RightsDeclaration, { en: string; es: string; fr: string }> = {
    ALL_OWNED: { en: '100% Original Author Creation', es: '100% Creación Original del Autor', fr: '100% Création Originale de l’Auteur' },
    LICENSED_CREATIVE_COMMONS: { en: 'Open License / Creative Commons', es: 'Licencia Abierta / Creative Commons', fr: 'Licence Ouverte / Creative Commons' },
    PUBLIC_DOMAIN: { en: 'Public Domain Reference', es: 'Referencia de Dominio Público', fr: 'Référence du Domaine Public' },
    REQUIRES_PERMIT: { en: 'Third-Party Permissions Required', es: 'Permisos de Terceros Requeridos', fr: 'Autorisations de Tiers Requises' },
    UNVERIFIED: { en: 'Unverified External Material', es: 'Material Externo No Verificado', fr: 'Matériel Externe Non Vérifié' },
  };

  return labels[status]?.[lang] || labels[status]?.en || status;
}

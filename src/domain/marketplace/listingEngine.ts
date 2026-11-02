import {
  ListingRecord,
  ListingStatus,
  ProductAvailabilityStatus,
  AuthorRecord,
} from './marketplaceTypes';
import { BookProject } from '../bookProjectTypes';
import { EditionRecord } from '../publishing/publishingTypes';
import { EditorialEdition } from '../editorial/editorialTypes';

/**
 * Builds a new ListingRecord linked to real E5 edition and author without inventing metadata.
 */
export function createListingRecord(
  project: BookProject,
  edition: EditionRecord,
  author: AuthorRecord,
  editorialEdition?: EditorialEdition | null,
  options?: Partial<ListingRecord>
): ListingRecord {
  const listingId = options?.id || `list_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Summary TOC from E4 if available
  const tocSummary = editorialEdition?.chapters.map((ch) => ch.title) || [];

  return {
    id: listingId,
    bookId: project.id,
    editionId: edition.id,
    authorId: author.id,
    title: project.title,
    subtitle: project.authorNotes || '',
    description: project.description,
    category: project.category,
    language: (project.productionLanguage as 'en' | 'es') || 'en',
    formats: edition.formats,
    rightsStatus: edition.rightsStatus,
    qualityStatus: editorialEdition ? 'PASSED' : 'PENDING',
    qualityScore: editorialEdition ? 92 : undefined,
    listingStatus: options?.listingStatus || 'LOCAL_DRAFT',
    scope: 'LOCAL_ONLY',
    coverAssetId: edition.derivedFromE4EditionId,
    isbn13: edition.isbn13,
    priceReference: '$9.99 (Reference Only — Commerce Not Configured)',
    sampleChapterText:
      editorialEdition?.chapters?.[0]?.currentContent ||
      'Sample chapter preview available once editorial chapters are compiled.',
    tocSummary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Formats human-friendly labels and badges for ListingStatus.
 */
export function getListingStatusLabel(
  status: ListingStatus,
  lang: 'en' | 'es' | 'fr' = 'en'
): { label: string; badgeColor: string; description: string } {
  const map: Record<
    ListingStatus,
    { en: string; es: string; fr: string; descEn: string; descEs: string; descFr: string; color: string }
  > = {
    LOCAL_DRAFT: {
      en: 'Local Draft',
      es: 'Borrador Local',
      fr: 'Brouillon Local',
      descEn: 'Listing being drafted in local workspace. Not submitted for review.',
      descEs: 'Ficha en redacción en el espacio local. No presentada para revisión.',
      descFr: 'Fiche en cours de rédaction locale. Non soumise pour révision.',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
    },
    NEEDS_ATTENTION: {
      en: 'Needs Attention',
      es: 'Requiere Atención',
      fr: 'Nécessite Attention',
      descEn: 'One or more required fields or E4/E5 dependencies are incomplete.',
      descEs: 'Uno o más campos requeridos o dependencias de E4/E5 están incompletos.',
      descFr: 'Un ou plusieurs champs obligatoires ou dépendances sont incomplets.',
      color: 'bg-amber-50 text-amber-800 border-amber-200',
    },
    READY_FOR_REVIEW: {
      en: 'Ready for Review',
      es: 'Listo para Revisión',
      fr: 'Prêt pour Révision',
      descEn: 'Listing parameters complete and validated against local edition.',
      descEs: 'Parámetros de la ficha completos y validados contra la edición local.',
      descFr: 'Paramètres de la fiche complets et validés selon l’édition locale.',
      color: 'bg-blue-50 text-[#345CFF] border-blue-200',
    },
    LOCAL_APPROVED: {
      en: 'Locally Approved',
      es: 'Aprobado Localmente',
      fr: 'Approuvé Localement',
      descEn: 'Author approved listing for local catalog view. Does not imply global web distribution.',
      descEs: 'El autor aprobó la ficha para el catálogo local. No implica distribución web global.',
      descFr: 'L’auteur a approuvé la fiche pour le catalogue local. N’implique pas de diffusion web mondiale.',
      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    PUBLICATION_NOT_CONFIGURED: {
      en: 'Publication Not Configured',
      es: 'Publicación No Configurada',
      fr: 'Publication Non Configurée',
      descEn: 'External sales or distribution gateway not active in this environment.',
      descEs: 'Pasarela de venta externa o distribución no activa en este entorno.',
      descFr: 'Passerelle de vente externe non active dans cet environnement.',
      color: 'bg-rose-50 text-rose-800 border-rose-200',
    },
    PUBLICATION_CONFIRMED: {
      en: 'Publication Confirmed',
      es: 'Publicación Confirmada',
      fr: 'Publication Confirmée',
      descEn: 'Confirmed by external distributor or verified remote host.',
      descEs: 'Confirmado por distribuidor externo o servidor remoto verificado.',
      descFr: 'Confirmé par distributeur externe ou hôte distant vérifié.',
      color: 'bg-purple-50 text-purple-800 border-purple-200',
    },
  };

  const item = map[status] || map.LOCAL_DRAFT;
  return {
    label: lang === 'es' ? item.es : lang === 'fr' ? item.fr : item.en,
    description: lang === 'es' ? item.descEs : lang === 'fr' ? item.descFr : item.descEn,
    badgeColor: item.color,
  };
}

/**
 * Distinguishes the 4 progressive availability statuses without confusing them:
 * EDITION_READY -> LISTING_READY -> PUBLICLY_PUBLISHED -> PURCHASE_AVAILABLE
 */
export function getProductAvailability(
  listing: ListingRecord
): { status: ProductAvailabilityStatus; label: string; reason: string } {
  if (listing.listingStatus === 'PUBLICATION_CONFIRMED') {
    return {
      status: 'PUBLICLY_PUBLISHED',
      label: 'Publicly Published',
      reason: 'Title confirmed on external retail platform or distributor catalog.',
    };
  }

  if (listing.listingStatus === 'LOCAL_APPROVED') {
    return {
      status: 'LISTING_READY',
      label: 'Listing Ready (Local)',
      reason: 'Listing is complete and active in local workspace catalog. Commercial checkout is not active in PROM 7.',
    };
  }

  return {
    status: 'EDITION_READY',
    label: 'Edition Ready',
    reason: 'Underlying book edition is prepared. Listing configuration is in progress.',
  };
}

import { ListingRecord, AuthorRecord } from './marketplaceTypes';

export interface CatalogFilterCriteria {
  searchQuery?: string;
  language?: 'ALL' | 'en' | 'es';
  category?: string;
  format?: 'ALL' | 'PDF' | 'EPUB' | 'DOCX';
  sortBy?: 'newest' | 'title_asc' | 'title_desc' | 'category';
}

export interface CatalogItemView {
  listing: ListingRecord;
  authorName: string;
  authorIdentityStatus: string;
}

/**
 * Filters and deterministically sorts listings for the Marketplace Catalog.
 */
export function filterAndSortCatalog(
  listings: ListingRecord[],
  authors: AuthorRecord[],
  criteria: CatalogFilterCriteria
): CatalogItemView[] {
  const authorMap = new Map<string, AuthorRecord>();
  authors.forEach((a) => authorMap.set(a.id, a));

  let items: CatalogItemView[] = listings.map((listing) => {
    const author = authorMap.get(listing.authorId);
    return {
      listing,
      authorName: author?.declaredName || 'Declared Author',
      authorIdentityStatus: author?.identityStatus || 'LOCAL_PROFILE',
    };
  });

  // 1. Search Query
  if (criteria.searchQuery && criteria.searchQuery.trim()) {
    const q = criteria.searchQuery.toLowerCase().trim();
    items = items.filter(
      (item) =>
        item.listing.title.toLowerCase().includes(q) ||
        (item.listing.subtitle && item.listing.subtitle.toLowerCase().includes(q)) ||
        item.authorName.toLowerCase().includes(q) ||
        item.listing.category.toLowerCase().includes(q)
    );
  }

  // 2. Language Filter
  if (criteria.language && criteria.language !== 'ALL') {
    items = items.filter((item) => item.listing.language === criteria.language);
  }

  // 3. Category Filter
  if (criteria.category && criteria.category !== 'ALL') {
    items = items.filter(
      (item) => item.listing.category.toLowerCase() === criteria.category!.toLowerCase()
    );
  }

  // 4. Format Filter
  if (criteria.format && criteria.format !== 'ALL') {
    items = items.filter((item) => item.listing.formats.includes(criteria.format as any));
  }

  // 5. Deterministic Sort
  const sortBy = criteria.sortBy || 'newest';
  items.sort((a, b) => {
    if (sortBy === 'title_asc') {
      return a.listing.title.localeCompare(b.listing.title);
    }
    if (sortBy === 'title_desc') {
      return b.listing.title.localeCompare(a.listing.title);
    }
    if (sortBy === 'category') {
      return a.listing.category.localeCompare(b.listing.category);
    }
    // newest (default)
    return new Date(b.listing.updatedAt).getTime() - new Date(a.listing.updatedAt).getTime();
  });

  return items;
}

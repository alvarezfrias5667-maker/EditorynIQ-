import { ListingRecord, AuthorRecord } from '../domain/marketplace/marketplaceTypes';
import { createAuthorRecord } from '../domain/marketplace/authorEngine';
import { createListingRecord } from '../domain/marketplace/listingEngine';
import { localMarketplaceRepository } from './localMarketplaceRepository';
import { localBookRepository } from './localBookRepository';
import { localPublishingRepository } from './localPublishingRepository';
import { localEditorialRepository } from './localEditorialRepository';
import { localVisualRepository } from './localVisualRepository';

export const marketplaceCatalogService = {
  /**
   * Initializes or returns the primary local author for a project.
   */
  async ensurePrimaryAuthor(bookAuthorName?: string): Promise<AuthorRecord> {
    const authors = await localMarketplaceRepository.getAuthors();
    if (authors.length > 0) {
      return authors[0];
    }

    const defaultAuthor = createAuthorRecord(bookAuthorName || 'Primary Author', {
      biography: 'Independent author producing books on EditorynIQ™ enterprise publishing platform.',
      identityStatus: 'LOCAL_PROFILE',
      languages: ['en', 'es'],
    });

    await localMarketplaceRepository.saveAuthor(defaultAuthor);
    return defaultAuthor;
  },

  /**
   * Builds and saves a listing draft from an existing BookProject and E5 Edition.
   */
  async createDraftListingFromProject(
    bookId: string,
    editionId: string
  ): Promise<ListingRecord | null> {
    const project = await localBookRepository.getProjectById(bookId);
    if (!project) return null;

    const edition = await localPublishingRepository.getEditionById(editionId);
    if (!edition) return null;

    const author = await this.ensurePrimaryAuthor(edition.authorName);
    const editorialEditions = await localEditorialRepository.getEditionsByBookId(bookId);
    const primaryE4 = editorialEditions.length > 0 ? editorialEditions[0] : null;

    // Check for cover image
    let coverDataUrl: string | undefined;
    try {
      const visualAssets = await localVisualRepository.getAssetsByBookId(bookId);
      const cover = visualAssets.find((a) => a.assetType === 'cover');
      if (cover) {
        coverDataUrl = cover.dataUrl || cover.svgContent;
      }
    } catch {
      // Ignore
    }

    const newListing = createListingRecord(project, edition, author, primaryE4, {
      coverDataUrl,
      listingStatus: 'READY_FOR_REVIEW',
    });

    await localMarketplaceRepository.saveListing(newListing);

    // Link book to author
    if (!author.linkedBookIds.includes(bookId)) {
      author.linkedBookIds.push(bookId);
      await localMarketplaceRepository.saveAuthor(author);
    }

    return newListing;
  },
};

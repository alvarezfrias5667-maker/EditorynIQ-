import { ListingRecord } from './marketplaceTypes';
import { computeSHA256 } from '../../services/localVisualRepository';

export interface MarketplaceEvent {
  id: string;
  listingId: string;
  eventType: 'LISTING_CREATED' | 'LISTING_UPDATED' | 'STATUS_CHANGED' | 'ENTITLEMENT_GRANTED';
  timestamp: string;
  details: string;
  localSha256Hash: string;
}

/**
 * Checks for duplicate titles or editions across existing listings.
 */
export function checkDuplicateListings(
  targetBookId: string,
  targetEditionId: string,
  existingListings: ListingRecord[]
): { isDuplicate: boolean; conflictingListingId?: string } {
  const match = existingListings.find(
    (l) => l.bookId === targetBookId && l.editionId === targetEditionId
  );
  if (match) {
    return { isDuplicate: true, conflictingListingId: match.id };
  }
  return { isDuplicate: false };
}

/**
 * Creates a locally hashed marketplace event.
 */
export async function createMarketplaceEvent(
  listingId: string,
  eventType: MarketplaceEvent['eventType'],
  details: string
): Promise<MarketplaceEvent> {
  const id = `mkt_evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const timestamp = new Date().toISOString();
  const payload = JSON.stringify({ id, listingId, eventType, timestamp, details });
  const localSha256Hash = await computeSHA256(payload);

  return {
    id,
    listingId,
    eventType,
    timestamp,
    details,
    localSha256Hash,
  };
}

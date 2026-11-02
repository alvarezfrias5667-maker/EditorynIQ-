import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { BuyerEntitlementRecord, ListingRecord } from '../../domain/marketplace/marketplaceTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { publishingPackageService } from '../../services/publishingPackageService';
import { SecureAccessAuthority } from '../../domain/infrastructure/secureAccessAuthority';
import { MarketplaceNavTabs } from '../../components/marketplace/MarketplaceNavTabs';

interface BuyerLibraryPageProps {
  onNavigate: (path: string) => void;
}

interface EntitlementWithListing {
  entitlement: BuyerEntitlementRecord;
  listing?: ListingRecord | null;
}

export const BuyerLibraryPage: React.FC<BuyerLibraryPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [items, setItems] = useState<EntitlementWithListing[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [unreadyBookId, setUnreadyBookId] = useState<string | null>(null);

  useEffect(() => {
    async function loadEntitlements() {
      setLoading(true);
      try {
        const entList = await localMarketplaceRepository.getEntitlements();
        const fullItems: EntitlementWithListing[] = [];
        for (const ent of entList) {
          const listing = await localMarketplaceRepository.getListingById(ent.listingId);
          fullItems.push({ entitlement: ent, listing });
        }
        setItems(fullItems);
      } catch (err) {
        console.error('Failed to load buyer library:', err);
      } finally {
        setLoading(false);
      }
    }
    loadEntitlements();
  }, []);

  const handleDownloadArtifact = async (item: EntitlementWithListing) => {
    setErrorMessage(null);
    setUnreadyBookId(null);
    const title = item.listing?.title || 'Publication';
    const fmt = item.entitlement.formatGranted;

    try {
      // 1. Inspect authentic artifacts from E4/E3 repositories
      const availableArtifacts = await publishingPackageService.verifyAvailableArtifacts(
        item.entitlement.bookId,
        item.entitlement.editionId
      );

      // 2. Authorize via Secure Access Authority
      const authResult = SecureAccessAuthority.authorizeArtifactDownload(
        item.entitlement,
        availableArtifacts
      );

      if (!authResult.isAuthorized || !authResult.artifactPayload) {
        setErrorMessage(
          `ARTIFACTS_NOT_READY (${authResult.code}): The ${fmt} master for "${title}" has not yet been compiled or verified in E4 Editorial Hub.`
        );
        setUnreadyBookId(item.entitlement.bookId);
        return;
      }

      // 3. Deliver genuine binary bytes
      const { blobUrl, rawContent, mimeType, fileName } = authResult.artifactPayload;

      let finalDownloadUrl = blobUrl;
      let shouldRevoke = false;

      if (!finalDownloadUrl && rawContent) {
        const blob = new Blob([rawContent], { type: mimeType });
        finalDownloadUrl = URL.createObjectURL(blob);
        shouldRevoke = true;
      }

      if (finalDownloadUrl) {
        const a = document.createElement('a');
        a.href = finalDownloadUrl;
        a.download = fileName || `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.${fmt.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (shouldRevoke) {
          URL.revokeObjectURL(finalDownloadUrl);
        }
        setDownloadNotice(`Authentic ${fmt} delivered successfully: ${fileName || title}`);
        setTimeout(() => setDownloadNotice(null), 4000);
      } else {
        setErrorMessage(`Unable to access binary payload for ${fmt}. Please rebuild in E4.`);
        setUnreadyBookId(item.entitlement.bookId);
      }
    } catch (err) {
      console.error('Download verification error:', err);
      setErrorMessage(`Verification error during download authorization.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketplaceNavTabs
          activeTab="library"
          onNavigate={onNavigate}
          subTitle={t.marketplace.buyerLibrarySubtitle}
        />

        {/* Notice on Honest Library Scope */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-blue-600 text-lg">📚</span>
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="font-bold">{t.marketplace.libraryHonestyNoticeTitle}:</strong>{' '}
            {t.marketplace.libraryHonestyNoticeDesc}
          </div>
        </div>

        {downloadNotice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <span>✅</span>
            <span>{downloadNotice}</span>
          </div>
        )}

        {errorMessage && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 text-base">⚠️</span>
              <span>{errorMessage}</span>
            </div>
            {unreadyBookId && (
              <button
                onClick={() => onNavigate(`/books/${unreadyBookId}/editorial/exports`)}
                className="px-3 py-1.5 rounded-lg bg-amber-900 text-white font-bold font-mono text-2xs hover:bg-amber-950 shrink-0"
              >
                Go to E4 Exports →
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 font-mono">
            Loading reading library...
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-12 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-100 flex items-center justify-center text-2xl text-slate-400">
              📖
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#081629]">
                {t.marketplace.emptyLibraryTitle}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {t.marketplace.emptyLibraryDesc}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/marketplace')}
                className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600 shadow-2xs"
              >
                {t.marketplace.exploreCatalog}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map(({ entitlement, listing }) => (
              <div
                key={entitlement.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
              >
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {entitlement.formatGranted}
                    </span>
                    <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                      STATUS: {entitlement.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-[#081629] line-clamp-2">
                    {listing?.title || 'Registered Book Title'}
                  </h3>

                  <div className="text-2xs text-slate-500 space-y-1 font-mono pt-1">
                    <div>GRANT SOURCE: {entitlement.source}</div>
                    <div>VERSION: {entitlement.versionGranted}</div>
                    <div>GRANTED: {new Date(entitlement.grantedAt).toLocaleDateString()}</div>
                    <div className="truncate">EVIDENCE: {entitlement.evidenceReference}</div>
                  </div>
                </div>

                <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => listing && onNavigate(`/marketplace/books/${listing.id}`)}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                  >
                    View Details
                  </button>

                  <button
                    onClick={() => handleDownloadArtifact({ entitlement, listing })}
                    className="px-3 py-1.5 text-xs font-bold bg-[#081629] text-white rounded-lg hover:bg-slate-800 shadow-2xs flex items-center gap-1.5"
                  >
                    <span>⬇</span>
                    <span>Download {entitlement.formatGranted}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { ListingRecord, AuthorRecord } from '../../domain/marketplace/marketplaceTypes';
import { EditionRecord } from '../../domain/publishing/publishingTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { grantLocalBuyerEntitlement } from '../../domain/marketplace/buyerEntitlementEngine';

interface BookProductDetailPageProps {
  listingId: string;
  onNavigate: (path: string) => void;
}

export const BookProductDetailPage: React.FC<BookProductDetailPageProps> = ({
  listingId,
  onNavigate,
}) => {
  const { t } = useI18n();
  const [listing, setListing] = useState<ListingRecord | null>(null);
  const [author, setAuthor] = useState<AuthorRecord | null>(null);
  const [edition, setEdition] = useState<EditionRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [grantSuccess, setGrantSuccess] = useState<string | null>(null);
  const [isGranting, setIsGranting] = useState<boolean>(false);

  useEffect(() => {
    async function loadListing() {
      setLoading(true);
      try {
        const item = await localMarketplaceRepository.getListingById(listingId);
        setListing(item);
        if (item) {
          const [auth, ed] = await Promise.all([
            localMarketplaceRepository.getAuthorById(item.authorId),
            localPublishingRepository.getEditionById(item.editionId),
          ]);
          setAuthor(auth);
          setEdition(ed);
        }
      } catch (err) {
        console.error('Failed to load listing detail:', err);
      } finally {
        setLoading(false);
      }
    }
    loadListing();
  }, [listingId]);

  const handleAuthorPreviewGrant = async () => {
    if (!listing) return;
    setIsGranting(true);
    try {
      const primaryFormat = listing.formats[0] || 'PDF';
      const entitlement = grantLocalBuyerEntitlement(
        listing,
        'local_author_workspace_preview',
        'AUTHOR_WORKSPACE_TEST',
        primaryFormat
      );
      await localMarketplaceRepository.saveEntitlement(entitlement);
      setGrantSuccess(`Author test preview enabled (Status: LOCAL_PREVIEW · ID: ${entitlement.id})`);
      setTimeout(() => {
        onNavigate('/marketplace/library');
      }, 1200);
    } catch (err) {
      console.error('Failed to grant preview entitlement:', err);
    } finally {
      setIsGranting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <p className="text-xs text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#081629]">Publication Not Found</h2>
          <p className="text-xs text-slate-500">
            The requested listing ID (<span className="font-mono">{listingId}</span>) does not exist in local marketplace storage.
          </p>
          <button
            onClick={() => onNavigate('/marketplace')}
            className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600"
          >
            ← Back to Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('/marketplace')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            ← {t.marketplace.navCatalog}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
              LISTING: {listing.id}
            </span>
            <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              {listing.scope}
            </span>
          </div>
        </div>

        {/* Commercial Disclaimer Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg">⚠️</span>
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong className="font-bold">{t.marketplace.commercialNoticeTitle}:</strong>{' '}
            {t.marketplace.commercialNoticeText}
          </div>
        </div>

        {grantSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <span>✅</span>
            <span>{grantSuccess} · Redirecting to Personal Library...</span>
          </div>
        )}

        {/* Main Product Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Cover & Specs */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden p-6 flex flex-col items-center">
              <div className="w-full aspect-[1/1.4] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center relative shadow-inner">
                {listing.coverDataUrl ? (
                  <img
                    src={listing.coverDataUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6 text-white space-y-2">
                    <span className="text-4xl block">📖</span>
                    <h3 className="text-sm font-bold uppercase tracking-wider">{listing.title}</h3>
                    <p className="text-2xs text-slate-400">{listing.category}</p>
                  </div>
                )}
              </div>

              {/* Formats badges */}
              <div className="w-full mt-6 pt-4 border-t border-slate-100 space-y-3">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block">
                  {t.marketplace.formatsAvailable}
                </span>
                <div className="flex flex-wrap gap-2">
                  {listing.formats.map((fmt) => (
                    <span
                      key={fmt}
                      className="px-2.5 py-1 text-xs font-mono font-bold bg-slate-100 text-slate-800 rounded-lg border border-slate-200"
                    >
                      {fmt}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quality & Scope summary */}
              <div className="w-full mt-4 space-y-2 text-2xs text-slate-500 font-mono">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>QUALITY STATUS:</span>
                  <span className="font-bold text-emerald-700">{listing.qualityStatus}</span>
                </div>
                {listing.qualityScore && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>QUALITY SCORE:</span>
                    <span className="font-bold text-slate-800">{listing.qualityScore} / 100</span>
                  </div>
                )}
                {listing.isbn13 && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>ISBN-13:</span>
                    <span className="font-bold text-slate-800">{listing.isbn13}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span>RIGHTS:</span>
                  <span className="font-bold text-slate-800">{listing.rightsStatus}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>CREATED:</span>
                  <span className="text-slate-600">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Author Attribution Card */}
            {author && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xs font-bold uppercase tracking-wider text-slate-400">
                    {t.marketplace.authorProfile}
                  </span>
                  <span className="text-2xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {author.identityStatus}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#081629]">{author.declaredName}</h4>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                  {author.biography}
                </p>
                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(`/marketplace/authors/${author.id}`)}
                    className="text-xs font-semibold text-[#345CFF] hover:underline"
                  >
                    {t.marketplace.viewAuthorProfile} →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Center & Right Column: Details, Preview & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-50 text-[#345CFF]">
                  {listing.category}
                </span>
                <span className="text-2xs font-mono font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-700">
                  {listing.language === 'en' ? 'English (EN)' : 'Español (ES)'}
                </span>
                <span className="text-2xs font-mono font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-700">
                  STATUS: {listing.listingStatus}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#081629] leading-tight">
                {listing.title}
              </h1>

              {listing.subtitle && (
                <p className="text-base text-slate-600 font-medium">{listing.subtitle}</p>
              )}

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-500">
                <span>By</span>
                <button
                  onClick={() => author && onNavigate(`/marketplace/authors/${author.id}`)}
                  className="font-bold text-slate-900 hover:text-[#345CFF] underline decoration-slate-300"
                >
                  {author?.declaredName || 'Declared Author'}
                </button>
              </div>

              {/* Description */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {t.marketplace.synopsisOverview}
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Actions & Hardened Commerce Box */}
              <div className="pt-6 border-t border-slate-100 space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-2xs font-mono font-bold uppercase text-slate-500">
                      COMMERCE GATEWAY: NOT_CONFIGURED
                    </span>
                    <span className="text-3xs font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                      ZERO FAKE CHECKOUT
                    </span>
                  </div>
                  <p className="text-2xs text-slate-600 leading-relaxed">
                    Commercial purchases and automatic entitlement grants are strictly disabled until an authenticated payment gateway is deployed. Authors can inspect and test their title locally.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={handleAuthorPreviewGrant}
                    disabled={isGranting}
                    className="px-5 py-2.5 text-xs font-bold bg-[#081629] text-white rounded-lg hover:bg-slate-800 shadow-2xs transition-all flex items-center justify-center gap-2"
                    title="Generate author test preview entitlement in local storage"
                  >
                    <span>👁️</span>
                    <span>Preview in Author Workspace (Test Mode)</span>
                  </button>

                  <button
                    onClick={() => onNavigate('/marketplace/seller/listings')}
                    className="px-4 py-2.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                  >
                    {t.marketplace.manageInSellerWorkspace}
                  </button>

                  <button
                    onClick={() => onNavigate('/marketplace/operations')}
                    className="px-4 py-2.5 text-xs font-semibold border border-slate-200 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 font-mono"
                  >
                    ⚙ Integration Authority
                  </button>
                </div>
              </div>
            </div>

            {/* Table of Contents & Structure Preview */}
            {listing.tocSummary && listing.tocSummary.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.marketplace.tableOfContents}
                </h3>
                <div className="space-y-1.5 max-h-60 overflow-y-auto pr-2">
                  {listing.tocSummary.map((chapterTitle, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <span className="font-medium">
                        {idx + 1}. {chapterTitle}
                      </span>
                      <span className="text-2xs font-mono text-slate-400">VERIFIED IN E5</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Technical Edition Specifications */}
            {edition && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {t.marketplace.editionSpecs}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-2xs text-slate-400 block font-mono">EDITION NAME</span>
                    <span className="font-bold text-slate-800">{edition.editionName}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-2xs text-slate-400 block font-mono">EDITION TYPE</span>
                    <span className="font-bold text-slate-800">{edition.editionType}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-2xs text-slate-400 block font-mono">VERSION</span>
                    <span className="font-bold text-slate-800">{edition.version}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-2xs text-slate-400 block font-mono">TERRITORY</span>
                    <span className="font-bold text-slate-800">{edition.territoryScope}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

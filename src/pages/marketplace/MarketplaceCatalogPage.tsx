import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { ListingRecord, AuthorRecord } from '../../domain/marketplace/marketplaceTypes';
import { filterAndSortCatalog, CatalogFilterCriteria } from '../../domain/marketplace/catalogEngine';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { MarketplaceNavTabs } from '../../components/marketplace/MarketplaceNavTabs';

interface MarketplaceCatalogPageProps {
  onNavigate: (path: string) => void;
}

export const MarketplaceCatalogPage: React.FC<MarketplaceCatalogPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [authors, setAuthors] = useState<AuthorRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState<'ALL' | 'en' | 'es'>('ALL');
  const [category, setCategory] = useState<string>('ALL');
  const [format, setFormat] = useState<'ALL' | 'PDF' | 'EPUB' | 'DOCX'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'title_asc' | 'title_desc' | 'category'>('newest');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [lList, aList] = await Promise.all([
          localMarketplaceRepository.getListings(),
          localMarketplaceRepository.getAuthors(),
        ]);
        setListings(lList);
        setAuthors(aList);
      } catch (err) {
        console.error('Failed to load marketplace catalog data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const criteria: CatalogFilterCriteria = {
    searchQuery,
    language,
    category,
    format,
    sortBy,
  };

  const filteredItems = filterAndSortCatalog(listings, authors, criteria);

  // Extract unique categories from listings
  const availableCategories = Array.from(new Set(listings.map((l) => l.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketplaceNavTabs
          activeTab="catalog"
          onNavigate={onNavigate}
          subTitle={t.marketplace.marketplaceSubtitle}
        />

        {/* Local Scope Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-amber-600 text-lg">ℹ️</span>
          <div className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">{t.marketplace.scopeLocalOnly}:</span>{' '}
            {t.marketplace.scopeDisclaimer}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.marketplace.searchPlaceholder}
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.marketplace.searchPlaceholder}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
              />
            </div>

            {/* Language */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.marketplace.filterLanguage}
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
              >
                <option value="ALL">{t.marketplace.filterAll}</option>
                <option value="en">English (EN)</option>
                <option value="es">Español (ES)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.marketplace.filterCategory}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
              >
                <option value="ALL">{t.marketplace.filterAll}</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Format */}
            <div>
              <label className="block text-2xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {t.marketplace.filterFormat}
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
              >
                <option value="ALL">{t.marketplace.filterAll}</option>
                <option value="PDF">PDF</option>
                <option value="EPUB">EPUB 3.3</option>
                <option value="DOCX">DOCX</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500">
            <span>
              Showing <strong className="text-slate-800">{filteredItems.length}</strong> publication{filteredItems.length === 1 ? '' : 's'}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xs font-semibold uppercase tracking-wider text-slate-500">
                {t.marketplace.sortBy}:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs px-2.5 py-1 border border-slate-300 rounded-md focus:outline-none"
              >
                <option value="newest">{t.marketplace.sortNewest}</option>
                <option value="title_asc">{t.marketplace.sortTitleAsc}</option>
                <option value="title_desc">{t.marketplace.sortTitleDesc}</option>
                <option value="category">{t.marketplace.sortCategory}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Listings Grid or Empty State */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Loading catalog...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-[#345CFF] rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
              📚
            </div>
            <h3 className="text-base font-bold text-[#081629]">
              {t.marketplace.noListingsFound}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t.marketplace.noListingsDesc}
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => onNavigate('/marketplace/seller')}
                className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600 shadow-2xs"
              >
                {t.marketplace.goToSellerWorkspace}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(({ listing, authorName, authorIdentityStatus }) => (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col hover:border-slate-300 transition-all"
              >
                {/* Cover header thumbnail */}
                <div className="h-44 bg-slate-900 relative flex items-center justify-center overflow-hidden border-b border-slate-100">
                  {listing.coverDataUrl ? (
                    <img
                      src={listing.coverDataUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <span className="text-3xl mb-2 block">📖</span>
                      <span className="text-xs font-bold text-white uppercase tracking-wider line-clamp-1">
                        {listing.title}
                      </span>
                      <span className="text-2xs text-slate-400 mt-1 block">
                        {listing.category}
                      </span>
                    </div>
                  )}

                  {/* Status chip */}
                  <span className="absolute top-3 left-3 text-2xs font-mono font-bold px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs">
                    {listing.scope}
                  </span>

                  {listing.qualityScore && (
                    <span className="absolute top-3 right-3 text-2xs font-bold px-2 py-0.5 rounded bg-emerald-500/90 text-white backdrop-blur-xs">
                      PASSPORT {listing.qualityScore}/100
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {listing.category}
                      </span>
                      <span className="text-2xs font-mono uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                        {listing.language.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-[#081629] line-clamp-2 leading-snug">
                      {listing.title}
                    </h3>
                    {listing.subtitle && (
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {listing.subtitle}
                      </p>
                    )}

                    {/* Author Attribution */}
                    <div className="mt-3 flex items-center justify-between text-xs">
                      <button
                        onClick={() => onNavigate(`/marketplace/authors/${listing.authorId}`)}
                        className="text-slate-700 hover:text-[#345CFF] font-medium text-left truncate max-w-[180px]"
                      >
                        by <span className="font-semibold underline decoration-slate-300">{authorName}</span>
                      </button>
                      <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {authorIdentityStatus}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-3 mt-3 leading-relaxed">
                      {listing.description}
                    </p>
                  </div>

                  {/* Formats and Detail CTA */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div className="flex items-center justify-between text-2xs text-slate-500">
                      <span className="font-semibold uppercase tracking-wider">{t.marketplace.formatsAvailable}:</span>
                      <div className="flex gap-1">
                        {listing.formats.map((fmt) => (
                          <span
                            key={fmt}
                            className="font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-2xs text-slate-400 font-mono">
                        PROM 7 PREVIEW
                      </span>
                      <button
                        onClick={() => onNavigate(`/marketplace/books/${listing.id}`)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#081629] text-white hover:bg-slate-800 transition-colors shadow-2xs"
                      >
                        {t.marketplace.viewDetails} →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

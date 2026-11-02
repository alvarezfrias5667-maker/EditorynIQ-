import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { AuthorRecord } from '../../domain/marketplace/marketplaceTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { MarketplaceNavTabs } from '../../components/marketplace/MarketplaceNavTabs';

interface AuthorDirectoryPageProps {
  onNavigate: (path: string) => void;
}

export const AuthorDirectoryPage: React.FC<AuthorDirectoryPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [authors, setAuthors] = useState<AuthorRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadAuthors() {
      setLoading(true);
      try {
        const list = await localMarketplaceRepository.getAuthors();
        setAuthors(list);
      } catch (err) {
        console.error('Failed to load author directory:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuthors();
  }, []);

  const filteredAuthors = authors.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.declaredName.toLowerCase().includes(q) ||
      a.biography.toLowerCase().includes(q) ||
      (a.countryOrTerritory && a.countryOrTerritory.toLowerCase().includes(q))
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketplaceNavTabs
          activeTab="authors"
          onNavigate={onNavigate}
          subTitle={t.marketplace.authorDirectorySubtitle}
        />

        {/* Directory Header & Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              TOTAL REGISTERED AUTHORS
            </span>
            <span className="text-2xl font-bold text-[#081629] mt-1 block">
              {authors.length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              LOCAL PROFILES
            </span>
            <span className="text-2xl font-bold text-amber-700 mt-1 block">
              {authors.filter((a) => a.identityStatus === 'LOCAL_PROFILE').length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              VERIFIED IDENTITIES
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {authors.filter((a) => a.identityStatus === 'VERIFIED').length}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex items-center gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.marketplace.searchAuthorsPlaceholder}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
          />
        </div>

        {/* Author List */}
        {loading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500">Loading author directory...</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="w-16 h-16 bg-blue-50 text-[#345CFF] rounded-2xl mx-auto flex items-center justify-center text-2xl font-bold">
              ✍️
            </div>
            <h3 className="text-base font-bold text-[#081629]">
              {t.marketplace.noAuthorsFound}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {t.marketplace.noAuthorsDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => onNavigate('/marketplace/seller')}
                className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600 shadow-2xs"
              >
                {t.marketplace.initializeAuthorProfile}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuthors.map((author) => (
              <div
                key={author.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-800 to-[#081629] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                        {author.declaredName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-[#081629]">
                          {author.declaredName}
                        </h3>
                        <span className="text-2xs text-slate-400 font-mono">
                          {author.id}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-2xs font-mono font-bold px-2 py-0.5 rounded ${
                        author.identityStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : author.identityStatus === 'LOCAL_PROFILE'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {author.identityStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-3 mt-4 leading-relaxed">
                    {author.biography}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
                    <span>
                      {author.countryOrTerritory || 'Global / Unspecified'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {author.linkedBookIds.length} Linked Work{author.linkedBookIds.length === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => onNavigate(`/marketplace/authors/${author.id}`)}
                    className="w-full text-xs font-semibold py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors text-center"
                  >
                    {t.marketplace.viewAuthorProfile} →
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

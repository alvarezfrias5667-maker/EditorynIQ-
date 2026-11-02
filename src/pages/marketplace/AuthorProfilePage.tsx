import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { AuthorRecord, ListingRecord } from '../../domain/marketplace/marketplaceTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';

interface AuthorProfilePageProps {
  authorId: string;
  onNavigate: (path: string) => void;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({
  authorId,
  onNavigate,
}) => {
  const { t } = useI18n();
  const [author, setAuthor] = useState<AuthorRecord | null>(null);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadAuthorData() {
      setLoading(true);
      try {
        const item = await localMarketplaceRepository.getAuthorById(authorId);
        setAuthor(item);
        if (item) {
          const allListings = await localMarketplaceRepository.getListings();
          setListings(allListings.filter((l) => l.authorId === authorId));
        }
      } catch (err) {
        console.error('Failed to load author profile:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAuthorData();
  }, [authorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 text-center">
        <p className="text-xs text-slate-500">Loading author profile...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <h2 className="text-lg font-bold text-[#081629]">Author Profile Not Found</h2>
          <p className="text-xs text-slate-500">
            The author ID (<span className="font-mono">{authorId}</span>) could not be retrieved from local records.
          </p>
          <button
            onClick={() => onNavigate('/marketplace/authors')}
            className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600"
          >
            ← Back to Author Directory
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
            onClick={() => onNavigate('/marketplace/authors')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
          >
            ← {t.marketplace.navAuthors}
          </button>
          <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700">
            AUTHOR_ID: {author.id}
          </span>
        </div>

        {/* Identity Disclosure */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-blue-600 text-lg">🛡️</span>
          <div className="text-xs text-blue-900 leading-relaxed">
            <strong className="font-bold">{t.marketplace.identityNoticeTitle}:</strong>{' '}
            {t.marketplace.identityNoticeDesc}
          </div>
        </div>

        {/* Author Bio Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-[#081629] text-white flex items-center justify-center font-bold text-xl shadow-2xs">
                {author.declaredName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-[#081629]">
                  {author.declaredName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-2xs font-mono font-bold px-2 py-0.5 rounded ${
                      author.identityStatus === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {author.identityStatus}
                  </span>
                  <span className="text-2xs text-slate-400 font-mono">
                    {author.countryOrTerritory || 'Territory Unspecified'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onNavigate('/marketplace/seller')}
                className="px-3 py-1.5 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
              >
                {t.marketplace.editAuthorInWorkspace}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t.marketplace.biography}
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {author.biography}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                {t.marketplace.languages}
              </span>
              <span className="font-semibold text-slate-800">
                {author.languages.map((l) => l.toUpperCase()).join(', ')}
              </span>
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                {t.marketplace.rightsDeclarations}
              </span>
              <span className="font-semibold text-slate-800">
                {author.rightsDeclarations.join(', ') || 'Standard Author Rights'}
              </span>
            </div>
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                {t.marketplace.joinedDate}
              </span>
              <span className="font-semibold text-slate-800">
                {new Date(author.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Author's Catalog Works */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#081629]">
              {t.marketplace.publishedWorks} ({listings.length})
            </h2>
            <span className="text-2xs font-mono text-slate-500">
              LOCAL REPOSITORY VERIFIED
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-xl border border-slate-200">
              <p className="text-xs text-slate-500">
                No published works associated with this author in the local catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all"
                >
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                      <span className="text-2xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                        {item.language.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#081629] line-clamp-2">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="p-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex gap-1">
                      {item.formats.map((f) => (
                        <span
                          key={f}
                          className="text-2xs font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => onNavigate(`/marketplace/books/${item.id}`)}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#081629] text-white rounded-lg hover:bg-slate-800"
                    >
                      {t.marketplace.viewDetails} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

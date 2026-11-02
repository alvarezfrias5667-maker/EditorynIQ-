import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { AuthorRecord, ListingRecord } from '../../domain/marketplace/marketplaceTypes';
import { BookProject } from '../../domain/bookProjectTypes';
import { EditionRecord } from '../../domain/publishing/publishingTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { localBookRepository } from '../../services/localBookRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { marketplaceCatalogService } from '../../services/marketplaceCatalogService';
import { MarketplaceNavTabs } from '../../components/marketplace/MarketplaceNavTabs';

interface SellerWorkspacePageProps {
  onNavigate: (path: string) => void;
}

interface ProjectWithEditions {
  project: BookProject;
  editions: EditionRecord[];
}

export const SellerWorkspacePage: React.FC<SellerWorkspacePageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [author, setAuthor] = useState<AuthorRecord | null>(null);
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [availableProjects, setAvailableProjects] = useState<ProjectWithEditions[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [creatingListing, setCreatingListing] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Author Edit Form state
  const [isEditingAuthor, setIsEditingAuthor] = useState<boolean>(false);
  const [declaredName, setDeclaredName] = useState('');
  const [biography, setBiography] = useState('');
  const [country, setCountry] = useState('');

  useEffect(() => {
    async function loadWorkspaceData() {
      setLoading(true);
      try {
        const primaryAuth = await marketplaceCatalogService.ensurePrimaryAuthor();
        setAuthor(primaryAuth);
        setDeclaredName(primaryAuth.declaredName);
        setBiography(primaryAuth.biography);
        setCountry(primaryAuth.countryOrTerritory || '');

        const allListings = await localMarketplaceRepository.getListings();
        setListings(allListings);

        // Load projects & their E5 editions
        const projects = await localBookRepository.getAllProjects();
        const pWithEditions: ProjectWithEditions[] = [];
        for (const proj of projects) {
          const eds = await localPublishingRepository.getEditionsByBookId(proj.id);
          pWithEditions.push({ project: proj, editions: eds });
        }
        setAvailableProjects(pWithEditions);
      } catch (err) {
        console.error('Failed to load seller workspace:', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceData();
  }, []);

  const handleSaveAuthorProfile = async () => {
    if (!author) return;
    const updated: AuthorRecord = {
      ...author,
      declaredName,
      biography,
      countryOrTerritory: country,
      updatedAt: new Date().toISOString(),
    };
    await localMarketplaceRepository.saveAuthor(updated);
    setAuthor(updated);
    setIsEditingAuthor(false);
    setActionSuccess(t.marketplace.authorSavedSuccess);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleCreateListingFromEdition = async (bookId: string, editionId: string) => {
    setCreatingListing(`${bookId}_${editionId}`);
    try {
      const newListing = await marketplaceCatalogService.createDraftListingFromProject(
        bookId,
        editionId
      );
      if (newListing) {
        const allListings = await localMarketplaceRepository.getListings();
        setListings(allListings);
        setActionSuccess(`Listing created for "${newListing.title}" (ID: ${newListing.id})`);
        setTimeout(() => setActionSuccess(null), 4000);
      }
    } catch (err) {
      console.error('Failed to create listing:', err);
    } finally {
      setCreatingListing(null);
    }
  };

  const draftsCount = listings.filter((l) => l.listingStatus === 'LOCAL_DRAFT').length;
  const readyCount = listings.filter((l) => l.listingStatus === 'READY_FOR_REVIEW').length;
  const approvedCount = listings.filter((l) => l.listingStatus === 'LOCAL_APPROVED').length;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketplaceNavTabs
          activeTab="seller"
          onNavigate={onNavigate}
          subTitle={t.marketplace.sellerWorkspaceSubtitle}
        />

        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <span>✅</span>
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              TOTAL LISTINGS
            </span>
            <span className="text-2xl font-bold text-[#081629] mt-1 block">
              {listings.length}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              LOCAL DRAFTS
            </span>
            <span className="text-2xl font-bold text-slate-600 mt-1 block">
              {draftsCount}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              READY FOR REVIEW
            </span>
            <span className="text-2xl font-bold text-blue-600 mt-1 block">
              {readyCount}
            </span>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
              LOCALLY APPROVED
            </span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">
              {approvedCount}
            </span>
          </div>
        </div>

        {/* Author Profile Management Box */}
        {author && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-400 block font-mono">
                  SELLER & AUTHOR PROFILE
                </span>
                <h3 className="text-lg font-bold text-[#081629] mt-0.5">
                  {author.declaredName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                  {author.identityStatus}
                </span>
                <button
                  onClick={() => setIsEditingAuthor(!isEditingAuthor)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  {isEditingAuthor ? t.marketplace.cancel : t.marketplace.editProfile}
                </button>
              </div>
            </div>

            {isEditingAuthor ? (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {t.marketplace.authorDeclaredName}
                    </label>
                    <input
                      type="text"
                      value={declaredName}
                      onChange={(e) => setDeclaredName(e.target.value)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                      {t.marketplace.countryTerritory}
                    </label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="e.g. United States, España, Global"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                    {t.marketplace.authorBiography}
                  </label>
                  <textarea
                    rows={3}
                    value={biography}
                    onChange={(e) => setBiography(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-[#345CFF]"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditingAuthor(false)}
                    className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg"
                  >
                    {t.marketplace.cancel}
                  </button>
                  <button
                    onClick={handleSaveAuthorProfile}
                    className="px-4 py-2 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600"
                  >
                    {t.marketplace.saveProfile}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600 leading-relaxed pt-2">
                <p>{author.biography}</p>
                <div className="mt-3 flex items-center gap-4 text-2xs text-slate-400 font-mono">
                  <span>AUTHOR ID: {author.id}</span>
                  <span>TERRITORY: {author.countryOrTerritory || 'Unspecified'}</span>
                  <span>LANGUAGES: {author.languages.join(', ').toUpperCase()}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Listing Creator from E5 Editions */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xs font-bold uppercase tracking-wider text-[#345CFF] block font-mono">
                E5 TO E6 PIPELINE
              </span>
              <h3 className="text-base font-bold text-[#081629]">
                {t.marketplace.prepareListingsFromEditions}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {t.marketplace.prepareListingsDesc}
              </p>
            </div>
            <button
              onClick={() => onNavigate('/marketplace/seller/listings')}
              className="text-xs font-semibold text-[#345CFF] hover:underline"
            >
              {t.marketplace.manageAllListings} →
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-slate-500 py-4">Checking projects and editions...</p>
          ) : availableProjects.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-500">
                No book projects found. Create a book in Studio or Smart Intake first.
              </p>
              <button
                onClick={() => onNavigate('/start')}
                className="mt-3 px-3 py-1.5 text-xs font-semibold bg-[#345CFF] text-white rounded-lg"
              >
                Start New Book Project
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {availableProjects.map(({ project, editions }) => (
                <div key={project.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#081629]">{project.title}</h4>
                      <span className="text-2xs text-slate-400 font-mono">
                        BOOK_ID: {project.id} · Category: {project.category} · {project.productionLanguage.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {editions.length === 0 ? (
                    <div className="p-3 bg-amber-50 rounded-lg text-2xs text-amber-900 border border-amber-200 flex items-center justify-between">
                      <span>No E5 publication editions prepared for this book yet.</span>
                      <button
                        onClick={() => onNavigate(`/books/${project.id}/publishing/editions`)}
                        className="text-2xs font-bold text-[#345CFF] hover:underline"
                      >
                        Create Edition in E5 →
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {editions.map((ed) => {
                        const isExisting = listings.some(
                          (l) => l.bookId === project.id && l.editionId === ed.id
                        );
                        const isCreating = creatingListing === `${project.id}_${ed.id}`;

                        return (
                          <div
                            key={ed.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex flex-col justify-between space-y-2 text-xs"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{ed.editionName}</span>
                                <span className="text-2xs font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {ed.formats.join(', ')}
                                </span>
                              </div>
                              <span className="text-2xs text-slate-500 font-mono block mt-1">
                                Type: {ed.editionType} · Ver: {ed.version} · {ed.territoryScope}
                              </span>
                            </div>

                            <div className="pt-2">
                              {isExisting ? (
                                <span className="text-2xs font-mono font-bold text-emerald-700 flex items-center gap-1">
                                  <span>✓</span> LISTED IN E6
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleCreateListingFromEdition(project.id, ed.id)}
                                  disabled={isCreating}
                                  className="w-full py-1.5 px-3 text-xs font-semibold bg-[#345CFF] text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                >
                                  {isCreating ? 'Creating...' : '+ Create Listing'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import { ListingRecord, ListingReadinessReport } from '../../domain/marketplace/marketplaceTypes';
import { EditionRecord } from '../../domain/publishing/publishingTypes';
import { localMarketplaceRepository } from '../../services/localMarketplaceRepository';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { evaluateListingReadiness } from '../../domain/marketplace/marketplaceReadiness';
import { MarketplaceNavTabs } from '../../components/marketplace/MarketplaceNavTabs';

interface ListingManagementPageProps {
  onNavigate: (path: string) => void;
}

export const ListingManagementPage: React.FC<ListingManagementPageProps> = ({ onNavigate }) => {
  const { t } = useI18n();
  const [listings, setListings] = useState<ListingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Audit Readiness Modal state
  const [activeAudit, setActiveAudit] = useState<{
    listing: ListingRecord;
    report: ListingReadinessReport;
  } | null>(null);

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const items = await localMarketplaceRepository.getListings();
      setListings(items);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleRunAudit = async (listing: ListingRecord) => {
    let edition: EditionRecord | null = null;
    try {
      edition = await localPublishingRepository.getEditionById(listing.editionId);
    } catch {
      // Ignore
    }
    const report = evaluateListingReadiness(listing, edition);
    setActiveAudit({ listing, report });
  };

  const handleApproveListing = async (listing: ListingRecord) => {
    const updated: ListingRecord = {
      ...listing,
      listingStatus: 'LOCAL_APPROVED',
      updatedAt: new Date().toISOString(),
    };
    await localMarketplaceRepository.saveListing(updated);
    setNotification(`Listing "${listing.title}" is now LOCALLY APPROVED for catalog display.`);
    setTimeout(() => setNotification(null), 4000);
    loadListings();
    if (activeAudit) setActiveAudit(null);
  };

  const handleDeleteListing = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete the listing for "${title}"?`)) {
      return;
    }
    await localMarketplaceRepository.deleteListing(id);
    setNotification(`Listing "${title}" removed.`);
    setTimeout(() => setNotification(null), 3000);
    loadListings();
  };

  const filteredListings = listings.filter((l) => {
    if (filterStatus === 'ALL') return true;
    return l.listingStatus === filterStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <MarketplaceNavTabs
          activeTab="listings"
          onNavigate={onNavigate}
          subTitle={t.marketplace.listingManagementSubtitle}
        />

        {notification && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs font-semibold text-emerald-900 flex items-center gap-2">
            <span>✅</span>
            <span>{notification}</span>
          </div>
        )}

        {/* Filter bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['ALL', 'READY_FOR_REVIEW', 'LOCAL_APPROVED', 'LOCAL_DRAFT'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? 'bg-[#081629] text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Statuses' : st}
              </button>
            ))}
          </div>

          <button
            onClick={() => onNavigate('/marketplace/seller')}
            className="text-xs font-semibold px-4 py-2 bg-[#345CFF] text-white rounded-lg hover:bg-blue-600 shadow-2xs whitespace-nowrap"
          >
            + Create New Listing
          </button>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading listings...</div>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <span className="text-3xl block">📑</span>
              <h4 className="text-sm font-bold text-[#081629]">No listings found</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No listings match the current criteria. Go to the Seller Workspace to create one from your E5 publication editions.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-2xs font-bold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3.5 px-4">Publication Title</th>
                    <th className="py-3.5 px-4">Formats</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Quality Score</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#081629]">{listing.title}</div>
                        <div className="text-2xs text-slate-400 font-mono">
                          ID: {listing.id} · BOOK: {listing.bookId}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <div className="flex gap-1 flex-wrap">
                          {listing.formats.map((f) => (
                            <span
                              key={f}
                              className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs"
                            >
                              {f}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-2xs font-medium">
                          {listing.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold">
                        {listing.qualityScore ? (
                          <span className="text-emerald-700 font-bold">
                            {listing.qualityScore} / 100
                          </span>
                        ) : (
                          <span className="text-slate-400">NOT_AUDITED</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span
                          className={`px-2 py-0.5 rounded text-2xs font-bold ${
                            listing.listingStatus === 'LOCAL_APPROVED'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : listing.listingStatus === 'READY_FOR_REVIEW'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {listing.listingStatus}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleRunAudit(listing)}
                          className="px-2.5 py-1 text-2xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                        >
                          Audit Readiness
                        </button>

                        {listing.listingStatus !== 'LOCAL_APPROVED' && (
                          <button
                            onClick={() => handleApproveListing(listing)}
                            className="px-2.5 py-1 text-2xs font-bold rounded bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Approve
                          </button>
                        )}

                        <button
                          onClick={() => onNavigate(`/marketplace/books/${listing.id}`)}
                          className="px-2.5 py-1 text-2xs font-semibold rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
                        >
                          View
                        </button>

                        <button
                          onClick={() => handleDeleteListing(listing.id, listing.title)}
                          className="px-2 py-1 text-2xs font-semibold text-rose-600 hover:text-rose-800"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Readiness Modal Drawer */}
        {activeAudit && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-2xs font-mono font-bold uppercase tracking-wider text-[#345CFF]">
                    CONSTITUTIONAL READINESS AUDIT
                  </span>
                  <h3 className="text-base font-bold text-[#081629] mt-0.5">
                    {activeAudit.listing.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveAudit(null)}
                  className="text-slate-400 hover:text-slate-600 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Overall Score Badge */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-2xs text-slate-400 font-mono uppercase block">
                    OVERALL STATUS
                  </span>
                  <span
                    className={`text-sm font-bold font-mono ${
                      activeAudit.report.overallStatus === 'READY_FOR_LOCAL_APPROVAL'
                        ? 'text-emerald-700'
                        : activeAudit.report.overallStatus === 'NEEDS_ATTENTION'
                        ? 'text-amber-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {activeAudit.report.overallStatus}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xs text-slate-400 font-mono uppercase block">
                    READINESS SCORE
                  </span>
                  <span className="text-xl font-bold font-mono text-[#081629]">
                    {activeAudit.report.score} / 100
                  </span>
                </div>
              </div>

              {/* Findings List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Six-Dimension Audit Checks
                </h4>
                <div className="space-y-2">
                  {activeAudit.report.findings.map((f) => (
                    <div
                      key={f.id}
                      className="p-3 rounded-lg border flex items-start gap-3 bg-white text-xs border-slate-200"
                    >
                      <span className="text-sm">{f.passed ? '✅' : '⚠️'}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#081629]">{f.label}</span>
                          <span className="text-2xs font-mono uppercase text-slate-400">
                            {f.dimension}
                          </span>
                        </div>
                        <p className="text-2xs text-slate-600 mt-1">{f.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveAudit(null)}
                  className="px-4 py-2 text-xs font-semibold border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
                >
                  Close
                </button>
                {activeAudit.listing.listingStatus !== 'LOCAL_APPROVED' && (
                  <button
                    onClick={() => handleApproveListing(activeAudit.listing)}
                    className="px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-2xs"
                  >
                    Approve for Catalog
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

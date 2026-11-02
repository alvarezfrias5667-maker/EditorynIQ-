import React from 'react';
import { useI18n } from '../../i18n';

export interface MarketplaceNavTabsProps {
  activeTab: 'catalog' | 'authors' | 'seller' | 'listings' | 'library' | 'operations';
  onNavigate: (path: string) => void;
  subTitle?: string;
}

export const MarketplaceNavTabs: React.FC<MarketplaceNavTabsProps> = ({
  activeTab,
  onNavigate,
  subTitle,
}) => {
  const { t } = useI18n();

  const tabs = [
    { id: 'catalog', label: t.marketplace.navCatalog, path: '/marketplace' },
    { id: 'authors', label: t.marketplace.navAuthors, path: '/marketplace/authors' },
    { id: 'seller', label: t.marketplace.navSeller, path: '/marketplace/seller' },
    { id: 'listings', label: t.marketplace.navListings, path: '/marketplace/seller/listings' },
    { id: 'library', label: t.marketplace.navLibrary, path: '/marketplace/library' },
    { id: 'operations', label: t.marketplace.navOperations, path: '/marketplace/operations' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xs font-bold uppercase tracking-wider text-[#345CFF] bg-blue-50 px-2.5 py-1 rounded-md">
              E6 MARKETPLACE & COMMERCE
            </span>
            <span className="text-2xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              LOCAL ONLY (PROM 7 SCOPE)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#081629] mt-2">
            {t.marketplace.marketplaceTitle}
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">
            {subTitle || t.marketplace.marketplaceSubtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('/studio')}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            ← {t.marketplace.backToStudio}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.path)}
              className={`px-4 py-2 text-xs rounded-lg transition-all whitespace-nowrap font-medium ${
                isActive
                  ? 'bg-white text-[#081629] font-bold border border-slate-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

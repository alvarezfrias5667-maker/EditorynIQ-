import React from 'react';
import { useI18n } from '../../i18n';

export interface PublishingNavTabsProps {
  projectId: string;
  activeTab: 'overview' | 'editions' | 'metadata' | 'channels' | 'packages' | 'history';
  onNavigate: (path: string) => void;
  overallScore?: number;
}

export const PublishingNavTabs: React.FC<PublishingNavTabsProps> = ({
  projectId,
  activeTab,
  onNavigate,
  overallScore,
}) => {
  const { t } = useI18n();

  const tabs = [
    { id: 'overview', label: t.publishing.navOverview, path: `/books/${projectId}/publishing` },
    { id: 'editions', label: t.publishing.navEditions, path: `/books/${projectId}/publishing/editions` },
    { id: 'metadata', label: t.publishing.navMetadata, path: `/books/${projectId}/publishing/metadata` },
    { id: 'channels', label: t.publishing.navChannels, path: `/books/${projectId}/publishing/channels` },
    { id: 'packages', label: t.publishing.navPackages, path: `/books/${projectId}/publishing/packages` },
    { id: 'history', label: t.publishing.navHistory, path: `/books/${projectId}/publishing/history` },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-2xs font-mono text-slate-500 overflow-x-auto whitespace-nowrap">
        <button onClick={() => onNavigate('/studio')} className="hover:underline">Studio Workspace</button>
        <span>/</span>
        <button onClick={() => onNavigate(`/studio/${projectId}`)} className="hover:underline">Book Project</button>
        <span>/</span>
        <button onClick={() => onNavigate(`/books/${projectId}/publishing`)} className="hover:underline">E5 Publishing</button>
        <span>/</span>
        <span className="text-[#345CFF] font-bold">
          {tabs.find((tab) => tab.id === activeTab)?.label}
        </span>
      </div>

      {/* Engine Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <span className="text-2xs font-bold uppercase tracking-wider text-[#345CFF] bg-blue-50 px-2.5 py-1 rounded-md">
            {t.publishing.hubBadge}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#081629] mt-2">{t.publishing.hubTitle}</h1>
          <p className="text-xs text-slate-500 max-w-2xl mt-1">{t.publishing.hubSubtitle}</p>
        </div>

        {typeof overallScore === 'number' && (
          <div className="bg-slate-900 text-white p-4 rounded-xl text-center font-mono shrink-0">
            <span className="text-3xs uppercase text-slate-400 font-bold block">{t.publishing.hubScoreLabel}</span>
            <div className="text-2xl font-bold text-[#16C8BA] mt-0.5">{overallScore} / 100</div>
          </div>
        )}
      </div>

      {/* Tabs Row */}
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

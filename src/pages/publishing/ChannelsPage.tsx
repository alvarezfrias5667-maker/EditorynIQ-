import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { ChannelId, ChannelProfile } from '../../domain/publishing/publishingTypes';
import { DISTRIBUTION_CHANNELS } from '../../domain/publishing/channelRequirements';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface ChannelsPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const ChannelsPage: React.FC<ChannelsPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [selectedChannelId, setSelectedChannelId] = useState<ChannelId>('kdp');
  const channels = Object.values(DISTRIBUTION_CHANNELS);
  const activeChannel: ChannelProfile = DISTRIBUTION_CHANNELS[selectedChannelId];

  const getStatusBadge = (status: ChannelProfile['status']) => {
    switch (status) {
      case 'CONNECTED_VERIFIED':
        return <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">✓ {t.publishing.statusConnectedVerified}</span>;
      case 'MANUAL_EXPORT_AVAILABLE':
        return <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-blue-50 text-[#345CFF] border border-blue-200">{t.publishing.statusManualExport}</span>;
      case 'EXTERNAL_REQUIRED':
        return <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">{t.publishing.statusExternalRequired}</span>;
      default:
        return <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{t.publishing.statusNotConfigured}</span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs projectId={projectId} activeTab="channels" onNavigate={onNavigate} />

      {/* Main Channels Layout */}
      <div className="space-y-6">
        {/* Notice on PROM 8 external connections */}
        <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="text-2xs font-mono uppercase text-[#16C8BA] font-bold">
              Direct API Integration Scope Notice
            </span>
            <p className="text-slate-300">{t.publishing.prom8Notice}</p>
          </div>
          <span className="text-3xs font-mono font-bold px-2 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            PROM 6 Scope Closed
          </span>
        </div>

        {/* Channels Selector Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((chan) => {
            const isSelected = selectedChannelId === chan.id;
            return (
              <div
                key={chan.id}
                onClick={() => setSelectedChannelId(chan.id)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'border-[#345CFF] bg-blue-50/40 shadow-xs ring-2 ring-[#345CFF]/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold text-[#081629] leading-snug">{chan.displayName}</h3>
                </div>
                <p className="text-2xs text-slate-500 line-clamp-2">{chan.description}</p>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex gap-1">
                    {chan.supportedFormats.map((fmt) => (
                      <span key={fmt} className="text-3xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        {fmt}
                      </span>
                    ))}
                  </div>
                  {getStatusBadge(chan.status)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Channel Detailed Requirements & Submission Guide */}
        {activeChannel && (
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-[#081629]">{activeChannel.displayName}</h2>
                  {getStatusBadge(activeChannel.status)}
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-2xl">{activeChannel.statusReason}</p>
              </div>

              <div className="flex items-center gap-2">
                {activeChannel.officialPortalUrl && (
                  <a
                    href={activeChannel.officialPortalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    {t.publishing.visitPortalBtn}
                  </a>
                )}

                <PremiumButton
                  variant="gold"
                  size="sm"
                  onClick={() => onNavigate(`/books/${projectId}/publishing/packages?channel=${activeChannel.id}`)}
                >
                  {t.publishing.exportForChannelBtn}
                </PremiumButton>
              </div>
            </div>

            {/* Documented Requirements List */}
            <div className="space-y-3">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.requirementsHeading}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeChannel.requirements.map((req) => (
                  <div key={req.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#081629]">{req.name}</span>
                      <span className="text-3xs font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-white text-slate-500 border border-slate-200">
                        {req.category}
                      </span>
                    </div>
                    <p className="text-2xs text-slate-600 font-sans">{req.rule}</p>
                    <span className="text-3xs text-[#345CFF] font-semibold block pt-0.5">
                      {req.isMandatory ? '● Mandatory Requirement' : '○ Optional / Alternative Allowed'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Step-by-Step Submission Workflow Guide */}
            <div className="p-5 bg-blue-50/50 rounded-xl border border-blue-200 space-y-2">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-[#345CFF]">
                {t.publishing.submissionGuideHeading}
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-sans whitespace-pre-line">
                {activeChannel.submissionGuide}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

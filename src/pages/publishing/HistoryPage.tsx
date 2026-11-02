import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import {
  LedgerEvent,
  LedgerEventType,
  ChannelId,
} from '../../domain/publishing/publishingTypes';
import { localPublishingRepository } from '../../services/localPublishingRepository';
import { createLedgerEvent, getLedgerEventLabel } from '../../domain/publishing/submissionLedger';
import { PublishingNavTabs } from '../../components/publishing/PublishingNavTabs';
import { PremiumButton } from '../../components/ui/PremiumButton';

export interface HistoryPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({ projectId, onNavigate }) => {
  const { t, lang } = useI18n();

  const [events, setEvents] = useState<LedgerEvent[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<ChannelId>('kdp');
  const [submissionRef, setSubmissionRef] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    const loadData = async () => {
      setLoading(true);
      const evts = await localPublishingRepository.getLedgerEventsByBookId(projectId);
      setEvents(evts);
      setLoading(false);
    };

    loadData();
  }, [projectId]);

  const handleRecordSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionNotes.trim()) return;

    setIsRecording(true);
    const newEvt = await createLedgerEvent(
      projectId,
      'primary_edition',
      selectedChannel,
      'USER_REPORTED_SUBMISSION',
      'USER',
      `Author logged manual submission to ${selectedChannel.toUpperCase()}: ${submissionNotes.trim()}`,
      {
        channelId: selectedChannel,
        referenceId: submissionRef.trim() || undefined,
        notes: submissionNotes.trim(),
        declaredAt: new Date().toISOString(),
      }
    );

    await localPublishingRepository.addLedgerEvent(newEvt);
    const refreshed = await localPublishingRepository.getLedgerEventsByBookId(projectId);
    setEvents(refreshed);
    setSubmissionRef('');
    setSubmissionNotes('');
    setSuccessMsg('Author submission successfully recorded in local integrity ledger (USER_REPORTED_EVENT).');
    setTimeout(() => setSuccessMsg(''), 4000);
    setIsRecording(false);
  };

  const filteredEvents = events.filter((ev) => {
    if (filterType === 'ALL') return true;
    return ev.eventType === filterType;
  });

  const getActorBadge = (actor: LedgerEvent['actor']) => {
    switch (actor) {
      case 'SYSTEM':
        return (
          <span className="text-3xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#345CFF]">
            ⚙ {t.publishing.actorSystem}
          </span>
        );
      case 'USER':
        return (
          <span className="text-3xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800">
            👤 {t.publishing.actorUser}
          </span>
        );
      case 'PROVIDER':
        return (
          <span className="text-3xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
            🏢 {t.publishing.actorProvider}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="py-12 max-w-5xl mx-auto px-4 text-center">
        <div className="p-8 bg-white rounded-2xl border font-mono text-xs text-slate-500">Loading Evidence Ledger...</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <PublishingNavTabs projectId={projectId} activeTab="history" onNavigate={onNavigate} />

      {/* Manual Submission Logger Box */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-4 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#081629]">
            {t.publishing.logSubmissionTitle}
          </h3>
          <p className="text-2xs text-slate-500 mt-0.5">
            {t.publishing.logSubmissionDesc}
          </p>
        </div>

        <form onSubmit={handleRecordSubmission} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.logChannelLabel}
              </label>
              <select
                value={selectedChannel}
                onChange={(e) => setSelectedChannel(e.target.value as ChannelId)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              >
                <option value="kdp">Amazon KDP</option>
                <option value="draft2digital">Draft2Digital</option>
                <option value="ingramspark">IngramSpark</option>
                <option value="lulu_direct">Lulu Direct</option>
                <option value="lulu_print_api">Lulu Print API</option>
                <option value="publishdrive">PublishDrive</option>
                <option value="direct_distribution">Direct Author Distribution</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
                {t.publishing.submissionRefLabel}
              </label>
              <input
                type="text"
                placeholder="e.g. KDP-SUB-849203 or Ticket #1029"
                value={submissionRef}
                onChange={(e) => setSubmissionRef(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-mono focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-2xs font-bold uppercase tracking-wider text-[#081629]">
              {t.publishing.submissionNotesLabel}
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Uploaded Master PDF and cover spread to KDP dashboard for review. Proof copy ordered."
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-[#345CFF] focus:outline-none"
            />
          </div>

          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 font-semibold">
              ✓ {successMsg}
            </div>
          )}

          <div className="flex justify-end">
            <PremiumButton variant="gold" size="sm" disabled={isRecording}>
              {isRecording ? 'Recording...' : t.publishing.recordSubmissionBtn}
            </PremiumButton>
          </div>
        </form>
      </div>

      {/* Ledger Timeline List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#081629]">{t.publishing.historyTitle}</h2>
            <p className="text-xs text-slate-500 mt-0.5">{t.publishing.historySubtitle}</p>
          </div>

          {/* Filter buttons */}
          <div className="flex flex-wrap gap-1">
            {['ALL', 'PACKAGE_PREPARED', 'MANUAL_EXPORT_COMPLETED', 'USER_REPORTED_SUBMISSION', 'PROVIDER_CONFIRMED'].map(
              (f) => (
                <button
                  key={f}
                  onClick={() => setFilterType(f)}
                  className={`px-2.5 py-1 text-3xs font-mono font-bold rounded-lg border transition-all ${
                    filterType === f
                      ? 'bg-[#345CFF] text-white border-[#345CFF]'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f.replace(/_/g, ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">{t.publishing.emptyLedgerMsg}</p>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((evt) => {
              const metaInfo = getLedgerEventLabel(evt.eventType, lang);
              return (
                <div
                  key={evt.eventId}
                  className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 space-y-2 hover:bg-slate-50 transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xs font-mono font-bold px-2 py-0.5 rounded border ${metaInfo.badgeColor}`}>
                        {metaInfo.label}
                      </span>
                      {getActorBadge(evt.actor)}
                      <span className="text-3xs font-mono px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                        {evt.channelId.toUpperCase()}
                      </span>
                    </div>

                    <span className="text-3xs font-mono text-slate-400">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-sans">{evt.summary}</p>

                  <div className="flex items-center justify-between text-3xs font-mono text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>Event ID: {evt.eventId}</span>
                    {evt.sha256Evidence && <span>SHA: {evt.sha256Evidence.substring(0, 16)}...</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

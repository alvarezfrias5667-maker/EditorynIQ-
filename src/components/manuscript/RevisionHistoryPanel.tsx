import React, { useState } from 'react';
import { ChapterVersion } from '../../domain/manuscript/manuscriptTypes';
import { History, RotateCcw, Plus, Clock, FileText, CheckCircle2 } from 'lucide-react';
import { useI18n } from '../../i18n';

interface RevisionHistoryPanelProps {
  versions: ChapterVersion[];
  onRestoreVersion: (version: ChapterVersion) => void;
  onCreateSnapshot: (changeDescription: string) => void;
}

export const RevisionHistoryPanel: React.FC<RevisionHistoryPanelProps> = ({
  versions,
  onRestoreVersion,
  onCreateSnapshot,
}) => {
  const { lang } = useI18n();
  const [snapshotLabel, setSnapshotLabel] = useState('');
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleCreateSnapshotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotLabel.trim()) return;

    onCreateSnapshot(snapshotLabel.trim());
    setSnapshotLabel('');
    setNotice(lang === 'es' ? 'Versión guardada manualmente.' : 'Version snapshot saved manually.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleRestore = (version: ChapterVersion) => {
    onRestoreVersion(version);
    setNotice(
      lang === 'es'
        ? `Versión restaurada a la del ${new Date(version.createdAt).toLocaleString()}`
        : `Restored version from ${new Date(version.createdAt).toLocaleString()}`
    );
    setTimeout(() => setNotice(null), 3000);
  };

  const selectedVersion = versions.find((v) => v.id === selectedVersionId);

  return (
    <div className="space-y-6">
      {notice && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Snapshot Creation Form */}
      <form onSubmit={handleCreateSnapshotSubmit} className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs">
        <h4 className="text-xs font-bold text-[#081629] flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#345CFF]" />
          <span>{lang === 'es' ? 'Crear Snapshot Manual de Versión' : 'Create Manual Version Snapshot'}</span>
        </h4>
        <div className="flex gap-2">
          <input
            type="text"
            value={snapshotLabel}
            onChange={(e) => setSnapshotLabel(e.target.value)}
            placeholder={
              lang === 'es'
                ? 'Ej: Revisión completa de tono, Corrección de diálogos...'
                : 'E.g., Complete tone revision, Dialogue fixes...'
            }
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#345CFF]"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#345CFF] hover:bg-[#2848D8] text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0"
          >
            {lang === 'es' ? 'Guardar Versión' : 'Save Version'}
          </button>
        </div>
      </form>

      {/* Version Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List of Versions */}
        <div className="lg:col-span-1 space-y-3 max-h-[500px] overflow-y-auto pr-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-3">
            <History className="w-4 h-4 text-[#345CFF]" />
            <span>
              {lang === 'es' ? 'Historial de Revisiones' : 'Revision History'} ({versions.length})
            </span>
          </h4>

          {versions.length === 0 ? (
            <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
              {lang === 'es'
                ? 'No hay versiones anteriores registradas aún.'
                : 'No prior version history recorded yet.'}
            </div>
          ) : (
            versions.map((ver) => (
              <div
                key={ver.id}
                onClick={() => setSelectedVersionId(ver.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedVersionId === ver.id
                    ? 'bg-[#345CFF]/10 border-[#345CFF] text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {new Date(ver.createdAt).toLocaleString()}
                  </span>
                  <span className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700 font-mono font-bold">
                    v{ver.versionNumber}
                  </span>
                </div>
                <p className="text-xs font-semibold truncate text-slate-800">{ver.authorNote || ver.createdBy}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1 font-mono">
                  <span>{ver.wordCount} words</span>
                  <span>Creator: {ver.createdBy}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Version Details & Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 space-y-4 flex flex-col h-[500px] shadow-2xs">
          {selectedVersion ? (
            <>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Versión {selectedVersion.versionNumber} &mdash; {selectedVersion.authorNote || selectedVersion.createdBy}
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {new Date(selectedVersion.createdAt).toLocaleString()} | {selectedVersion.wordCount} {lang === 'es' ? 'palabras' : 'words'}
                  </p>
                </div>
                <button
                  onClick={() => handleRestore(selectedVersion)}
                  className="px-3 py-1.5 bg-[#345CFF]/10 hover:bg-[#345CFF]/20 border border-[#345CFF]/30 text-[#345CFF] font-semibold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'es' ? 'Restaurar esta Versión' : 'Restore Version'}</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-xl border border-slate-200">
                {selectedVersion.content}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 p-8 space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-500">
                {lang === 'es'
                  ? 'Selecciona una versión del historial para previsualizar sus contenidos.'
                  : 'Select a version from the history timeline to preview its content.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

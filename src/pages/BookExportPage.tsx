import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n';
import { EditorialEdition } from '../domain/editorial/editorialTypes';
import { localEditorialRepository } from '../services/localEditorialRepository';
import { ExportFormatsPanel } from '../components/editorial/ExportFormatsPanel';

export interface BookExportPageProps {
  projectId: string;
  onNavigate: (path: string) => void;
}

export const BookExportPage: React.FC<BookExportPageProps> = ({ projectId, onNavigate }) => {
  const { t } = useI18n();

  const [edition, setEdition] = useState<EditorialEdition | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;
    localEditorialRepository.getEditionsByBookId(projectId).then((eds) => {
      if (eds.length > 0) setEdition(eds[0]);
      setLoading(false);
    });
  }, [projectId]);

  return (
    <div className="py-8 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-2xs font-mono text-slate-500">
          <button onClick={() => onNavigate(`/books/${projectId}/editorial`)} className="hover:underline">E4 Hub</button>
          <span>/</span>
          <span className="text-[#345CFF] font-bold">{t.editorial.navExports}</span>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-2xs">
          <h1 className="text-2xl font-bold text-[#081629]">{t.editorial.exportsTitle}</h1>
          <p className="text-xs text-slate-500 mt-1">{t.editorial.exportsSubtitle}</p>
        </div>
      </div>

      {/* Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button onClick={() => onNavigate(`/books/${projectId}/editorial`)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap">
          Overview & Builder
        </button>
        <button onClick={() => onNavigate(`/books/${projectId}/editorial/layout`)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap">
          {t.editorial.navLayout}
        </button>
        <button onClick={() => onNavigate(`/books/${projectId}/editorial/preview`)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap">
          {t.editorial.navPreview}
        </button>
        <button onClick={() => onNavigate(`/books/${projectId}/editorial/exports`)} className="px-4 py-2 text-xs font-bold rounded-lg bg-white text-[#081629] border border-slate-200 shadow-2xs whitespace-nowrap">
          {t.editorial.navExports}
        </button>
        <button onClick={() => onNavigate(`/books/${projectId}/editorial/quality`)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap">
          {t.editorial.navQuality}
        </button>
        <button onClick={() => onNavigate(`/books/${projectId}/editorial/accessibility`)} className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg whitespace-nowrap">
          {t.editorial.navAccessibility}
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border">Loading Export Factory...</div>
      ) : edition ? (
        <ExportFormatsPanel edition={edition} />
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border">No edition data available.</div>
      )}
    </div>
  );
};

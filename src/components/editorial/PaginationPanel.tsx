import React from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition } from '../../domain/editorial/editorialTypes';
import { generatePageBreakDownList } from '../../domain/editorial/paginationEngine';

export interface PaginationPanelProps {
  edition: EditorialEdition;
}

export const PaginationPanel: React.FC<PaginationPanelProps> = ({ edition }) => {
  const { t } = useI18n();
  const { pagination, typesetting, chapters } = edition;

  const breakdownList = generatePageBreakDownList(chapters, typesetting, typesetting.trimSize);

  return (
    <div className="space-y-6">
      {/* Header & Primary Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-lg font-bold text-[#081629]">{t.editorial.paginationTitle}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t.editorial.paginationSubtitle}</p>
        </div>

        {/* 5-KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-2xs font-semibold text-slate-500 uppercase">{t.editorial.targetPagesLabel}</span>
            <div className="text-lg font-bold text-[#081629] mt-1 font-mono">{pagination.targetPages} pgs</div>
          </div>

          <div className="p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/80">
            <span className="text-2xs font-semibold text-amber-800 uppercase">Estimated Pages</span>
            <div className="text-lg font-bold text-amber-900 mt-1 font-mono">{pagination.estimatedPages || pagination.targetPages} pgs</div>
          </div>

          <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-200/80">
            <span className="text-2xs font-semibold text-[#345CFF] uppercase">{t.editorial.actualPdfPagesLabel}</span>
            <div className="text-lg font-bold text-[#345CFF] mt-1 font-mono">{pagination.actualPdfPages} pgs</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-2xs font-semibold text-slate-500 uppercase">{t.editorial.totalWordsLabel}</span>
            <div className="text-lg font-bold text-[#081629] mt-1 font-mono">{pagination.totalWords.toLocaleString()}</div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <span className="text-2xs font-semibold text-slate-500 uppercase">{t.editorial.spineWidthLabel}</span>
            <div className="text-lg font-bold text-[#081629] mt-1 font-mono">{pagination.estimatedSpineWidthMm} mm</div>
          </div>
        </div>

        {/* Overflow or Budget Balance Banner */}
        {pagination.pageOverflowCount > 0 ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-bold">⚠️ {t.editorial.pageOverflowLabel}: {pagination.pageOverflowCount} Pages</div>
            <p className="text-2xs">
              Computed actual pages ({pagination.actualPdfPages} pgs) exceed your target page budget ({pagination.targetPages} pgs) by {pagination.pageOverflowCount} pages.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 font-semibold">
            ✓ Page Budget Balanced (Target: {pagination.targetPages} pgs | Est: {pagination.estimatedPages || pagination.targetPages} pgs | Actual PDF: {pagination.actualPdfPages} pgs).
          </div>
        )}

        <div className="text-2xs text-slate-400 font-mono italic">
          * {t.editorial.evenSpreadNotice} ({pagination.actualPdfPages} pages = even signature).
        </div>
      </div>

      {/* Page Signature Breakdown List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-4 shadow-2xs">
        <h4 className="text-sm font-bold text-[#081629]">Page Flow Map (First 20 Pages)</h4>
        <div className="divide-y divide-slate-100 max-h-[320px] overflow-y-auto">
          {breakdownList.slice(0, 20).map((pg) => (
            <div key={pg.pageNumber} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="w-8 font-mono text-2xs text-slate-400">P.{pg.pageNumber}</span>
                <span className="font-medium text-[#081629]">{pg.label}</span>
              </div>
              <span
                className={`text-2xs font-mono px-2 py-0.5 rounded ${
                  pg.type === 'CHAPTER_START'
                    ? 'bg-blue-50 text-[#345CFF] font-bold'
                    : pg.type === 'BLANK'
                    ? 'bg-amber-50 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {pg.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useI18n } from '../../i18n';
import { BookOriginType, SmartIntakeState } from '../../domain/intake/smartIntakeTypes';

export interface BookOriginStepProps {
  state: SmartIntakeState;
  onChange: (updated: Partial<SmartIntakeState>) => void;
}

export const BookOriginStep: React.FC<BookOriginStepProps> = ({ state, onChange }) => {
  const { t } = useI18n();

  const handleSelectOrigin = (type: BookOriginType) => {
    onChange({
      origin: { ...state.origin, originType: type },
    });
  };

  const originOptions: Array<{
    id: BookOriginType;
    title: string;
    description: string;
    badge: string;
  }> = [
    {
      id: 'idea',
      title: 'Book From Idea™',
      description: 'Start from scratch with a thesis, prompt brief, research outline, or conceptual thesis.',
      badge: 'P1 · Intelligent Writing',
    },
    {
      id: 'manuscript',
      title: 'Manuscript to Book™',
      description: 'Import or paste an existing draft text file (.txt, .md) to apply professional editorial layout.',
      badge: 'E2 · Manuscript Ingestion',
    },
    {
      id: 'visual_technical',
      title: 'Visual & Technical Book™',
      description: 'Specialized workflow for diagram-heavy manuals, code guides, art catalogs, and textbooks.',
      badge: 'E3 · Visual Production',
    },
    {
      id: 'reissue_translate',
      title: 'Reissue & Translate™',
      description: 'Re-format out-of-print publications, adapt layout styles, or translate between English and Spanish.',
      badge: 'Dual Language Engine',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-100 pb-4">
        <span className="text-2xs font-mono font-bold uppercase text-[#345CFF] tracking-wider">Etapa 1 de 6</span>
        <h3 className="text-xl font-bold text-[#081629] mt-0.5">Book Origin & Production Mode</h3>
        <p className="text-xs text-slate-500 mt-1">
          Select the starting origin of your publication. This calibrates the intake pipeline and structural blueprints.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {originOptions.map((opt) => {
          const isSelected = state.origin.originType === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => handleSelectOrigin(opt.id)}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#345CFF] bg-blue-50/40 shadow-xs'
                  : 'border-slate-200/90 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xs font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                  {opt.badge}
                </span>
                {isSelected && (
                  <span className="text-xs font-bold text-[#345CFF] flex items-center gap-1">
                    ✓ Selected
                  </span>
                )}
              </div>
              <h4 className="text-sm font-bold text-[#081629] mb-1">{opt.title}</h4>
              <p className="text-2xs text-slate-500 leading-relaxed">{opt.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

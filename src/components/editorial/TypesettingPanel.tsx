import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition, MarginMath, TypographySpec } from '../../domain/editorial/editorialTypes';
import { RECOMMENDED_FONT_PAIRINGS } from '../../domain/editorial/typesettingEngine';
import { PremiumButton } from '../ui/PremiumButton';

export interface TypesettingPanelProps {
  edition: EditorialEdition;
  onSaveTypesetting: (updated: EditorialEdition) => Promise<boolean>;
}

export const TypesettingPanel: React.FC<TypesettingPanelProps> = ({ edition, onSaveTypesetting }) => {
  const { t } = useI18n();

  const [margins, setMargins] = useState<MarginMath>(edition.typesetting.margins);
  const [typography, setTypography] = useState<TypographySpec>(edition.typesetting.typography);
  const [runningHeaderLeft, setRunningHeaderLeft] = useState(edition.typesetting.runningHeader.leftText);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const updated: EditorialEdition = {
      ...edition,
      typesetting: {
        ...edition.typesetting,
        margins,
        typography,
        runningHeader: {
          ...edition.typesetting.runningHeader,
          leftText: runningHeaderLeft,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    const success = await onSaveTypesetting(updated);
    setSaving(false);
    if (success) {
      setMsg(t.editorial.editionSavedSuccess);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-[#081629]">{t.editorial.typesettingTitle}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{t.editorial.typesettingSubtitle}</p>
      </div>

      {msg && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">{msg}</div>}

      {/* Font Pairings Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#081629] block">{t.editorial.fontPairingHeading}</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {RECOMMENDED_FONT_PAIRINGS.map((pair) => (
            <div
              key={pair.name}
              onClick={() =>
                setTypography({
                  ...typography,
                  headingFont: pair.headingFont,
                  bodyFont: pair.bodyFont,
                  codeFont: pair.codeFont,
                })
              }
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                typography.headingFont === pair.headingFont ? 'border-[#345CFF] bg-blue-50/50 shadow-2xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-[#081629]">{pair.name}</div>
              <div className="text-2xs font-serif text-slate-700 mt-1 truncate">Heading: {pair.headingFont.split(',')[0]}</div>
              <div className="text-2xs text-slate-500 truncate">Body: {pair.bodyFont.split(',')[0]}</div>
              <div className="text-2xs text-slate-400 mt-1 italic">{pair.idealFor}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Margins Geometry Math */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-[#081629]">{t.editorial.marginsHeading}</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.gutterLabel}</label>
            <input
              type="number"
              min={15}
              max={40}
              value={margins.insideMm}
              onChange={(e) => setMargins({ ...margins, insideMm: Number(e.target.value) })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.topMarginLabel}</label>
            <input
              type="number"
              min={12}
              max={35}
              value={margins.topMm}
              onChange={(e) => setMargins({ ...margins, topMm: Number(e.target.value) })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.bottomMarginLabel}</label>
            <input
              type="number"
              min={12}
              max={35}
              value={margins.bottomMm}
              onChange={(e) => setMargins({ ...margins, bottomMm: Number(e.target.value) })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.outsideMarginLabel}</label>
            <input
              type="number"
              min={12}
              max={35}
              value={margins.outsideMm}
              onChange={(e) => setMargins({ ...margins, outsideMm: Number(e.target.value) })}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
            />
          </div>
        </div>
      </div>

      {/* Font Size & Spacing Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4">
        <div>
          <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.bodyFontSizeLabel}</label>
          <input
            type="number"
            min={9}
            max={14}
            step={0.5}
            value={typography.bodyFontSizePt}
            onChange={(e) => setTypography({ ...typography, bodyFontSizePt: Number(e.target.value) })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
          />
        </div>

        <div>
          <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.bodyLineHeightLabel}</label>
          <select
            value={typography.bodyLineHeight}
            onChange={(e) => setTypography({ ...typography, bodyLineHeight: Number(e.target.value) })}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white"
          >
            <option value={1.3}>1.3 (Compact Technical)</option>
            <option value={1.4}>1.4 (Standard Trade)</option>
            <option value={1.45}>1.45 (Literary Fiction)</option>
            <option value={1.5}>1.5 (Spacious / Large Print)</option>
          </select>
        </div>
      </div>

      {/* Checkboxes for Drop Caps & Widows/Orphans */}
      <div className="flex flex-wrap items-center gap-6 border-t border-slate-100 pt-4">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#081629]">
          <input
            type="checkbox"
            checked={typography.dropCaps}
            onChange={(e) => setTypography({ ...typography, dropCaps: e.target.checked })}
            className="rounded text-[#345CFF]"
          />
          {t.editorial.dropCapsLabel}
        </label>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#081629]">
          <input
            type="checkbox"
            checked={typography.orphanControl}
            onChange={(e) => setTypography({ ...typography, orphanControl: e.target.checked, widowControl: e.target.checked })}
            className="rounded text-[#345CFF]"
          />
          {t.editorial.widowOrphanLabel}
        </label>
      </div>

      {/* Running Headers */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <h4 className="text-xs font-bold text-[#081629]">{t.editorial.runningHeadersHeading}</h4>
        <div>
          <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.headerLeftLabel}</label>
          <input
            type="text"
            value={runningHeaderLeft}
            onChange={(e) => setRunningHeaderLeft(e.target.value)}
            placeholder="e.g. Book Title"
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300"
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <PremiumButton variant="primary" size="md" disabled={saving}>
          {saving ? 'Updating Layout...' : t.editorial.saveTypesettingBtn}
        </PremiumButton>
      </div>
    </form>
  );
};

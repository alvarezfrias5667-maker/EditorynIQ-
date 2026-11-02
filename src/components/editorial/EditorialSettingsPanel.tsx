import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { EditorialEdition, EditorialProfile, TrimSize } from '../../domain/editorial/editorialTypes';
import { PremiumButton } from '../ui/PremiumButton';

export interface EditorialSettingsPanelProps {
  edition: EditorialEdition;
  onSaveEdition: (updated: EditorialEdition) => Promise<boolean>;
}

export const EditorialSettingsPanel: React.FC<EditorialSettingsPanelProps> = ({ edition, onSaveEdition }) => {
  const { t } = useI18n();

  const [title, setTitle] = useState(edition.editionTitle);
  const [trimSize, setTrimSize] = useState<TrimSize>(edition.typesetting.trimSize);
  const [profile, setProfile] = useState<EditorialProfile>(edition.typesetting.editorialProfile);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    const updated: EditorialEdition = {
      ...edition,
      editionTitle: title,
      typesetting: {
        ...edition.typesetting,
        trimSize,
        editorialProfile: profile,
      },
      updatedAt: new Date().toISOString(),
    };

    const success = await onSaveEdition(updated);
    setSaving(false);
    if (success) {
      setMsg(t.editorial.editionSavedSuccess);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="border-b border-slate-100 pb-3">
        <h3 className="text-lg font-bold text-[#081629]">{t.editorial.settingsTitle}</h3>
        <p className="text-xs text-slate-500 mt-0.5">{t.editorial.settingsSubtitle}</p>
      </div>

      {msg && <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200">{msg}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.editionTitleLabel}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 font-medium"
          />
        </div>

        <div>
          <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.trimSizeLabel}</label>
          <select
            value={trimSize}
            onChange={(e) => setTrimSize(e.target.value as TrimSize)}
            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 bg-white font-medium"
          >
            <option value="6x9">6 x 9 in (Standard Trade Paperback)</option>
            <option value="5.5x8.5">5.5 x 8.5 in (Digest Novel)</option>
            <option value="7x10">7 x 10 in (Technical & Executive Manual)</option>
            <option value="8.5x11">8.5 x 11 in (Illustrated & Textbook)</option>
            <option value="a4">A4 (210 x 297 mm European Trade)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-2xs text-slate-500 font-semibold block mb-1">{t.editorial.profileLabel}</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(['text-first', 'visual-first', 'technical-first'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setProfile(p)}
              className={`p-4 rounded-xl border text-left transition-all ${
                profile === p ? 'border-[#345CFF] bg-blue-50/50 shadow-2xs' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="text-xs font-bold text-[#081629] capitalize">{p.replace('-', ' ')}</div>
              <div className="text-2xs text-slate-500 mt-1">
                {p === 'text-first' && 'Serif typography, 6x9 trim, indented prose'}
                {p === 'visual-first' && 'Sans/Serif pairings, 8.5x11 trim, large margins'}
                {p === 'technical-first' && 'Clean sans, 7x10 trim, code fonts'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <PremiumButton variant="primary" size="md" disabled={saving}>
          {saving ? 'Saving Edition...' : t.editorial.compileBtn}
        </PremiumButton>
      </div>
    </form>
  );
};

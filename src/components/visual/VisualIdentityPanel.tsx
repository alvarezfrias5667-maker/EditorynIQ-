import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import { VisualIdentityProfile } from '../../domain/visual/visualTypes';
import { PremiumButton } from '../ui/PremiumButton';

export interface VisualIdentityPanelProps {
  identity: VisualIdentityProfile;
  onSave: (updated: VisualIdentityProfile) => Promise<void>;
}

export const VisualIdentityPanel: React.FC<VisualIdentityPanelProps> = ({ identity, onSave }) => {
  const { t } = useI18n();
  const [profile, setProfile] = useState<VisualIdentityProfile>(identity);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleColorChange = (key: keyof VisualIdentityProfile['palette'], val: string) => {
    setProfile((prev) => ({
      ...prev,
      palette: {
        ...prev.palette,
        [key]: val,
      },
    }));
  };

  const handleFontChange = (key: keyof VisualIdentityProfile['typography'], val: string) => {
    setProfile((prev) => ({
      ...prev,
      typography: {
        ...prev.typography,
        [key]: val,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    await onSave(profile);
    setSaving(false);
    setMsg(t.visual.identitySavedSuccess || 'Visual identity profile saved successfully.');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 space-y-6 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-lg font-bold text-[#081629]">{t.visual.identityTitle || 'Visual Identity Engine™'}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {t.visual.identitySubtitle || 'Persistent visual style profile linked to Book Master Brain™'}
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
          {profile.styleName}
        </span>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-medium">
          {msg}
        </div>
      )}

      {/* Palette Configuration */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-[#081629] uppercase tracking-wider block">
          {t.visual.paletteHeading || 'Enterprise Color Palette'}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <span className="text-2xs text-slate-500 block mb-1">Primary</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.primary}</span>
            </div>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Secondary</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.secondary}
                onChange={(e) => handleColorChange('secondary', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.secondary}</span>
            </div>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Accent</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.accent}</span>
            </div>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Dark Surface</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.dark}
                onChange={(e) => handleColorChange('dark', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.dark}</span>
            </div>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Light Surface</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.light}
                onChange={(e) => handleColorChange('light', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.light}</span>
            </div>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={profile.palette.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0"
              />
              <span className="text-2xs font-mono">{profile.palette.background}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Configuration */}
      <div className="space-y-3 border-t border-slate-100 pt-4">
        <label className="text-xs font-bold text-[#081629] uppercase tracking-wider block">
          {t.visual.typographyHeading || 'Typographic Hierarchy'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <span className="text-2xs text-slate-500 block mb-1">Heading Display Face</span>
            <select
              value={profile.typography.headingFont}
              onChange={(e) => handleFontChange('headingFont', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="Plus Jakarta Sans">Plus Jakarta Sans</option>
              <option value="Playfair Display">Playfair Display</option>
              <option value="Outfit">Outfit</option>
              <option value="Manrope">Manrope</option>
            </select>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Body Text Face</span>
            <select
              value={profile.typography.bodyFont}
              onChange={(e) => handleFontChange('bodyFont', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="DM Sans">DM Sans</option>
              <option value="Lora">Lora</option>
              <option value="Source Serif 4">Source Serif 4</option>
              <option value="Public Sans">Public Sans</option>
            </select>
          </div>

          <div>
            <span className="text-2xs text-slate-500 block mb-1">Data & Telemetry Mono Face</span>
            <select
              value={profile.typography.monoFont}
              onChange={(e) => handleFontChange('monoFont', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white"
            >
              <option value="JetBrains Mono">JetBrains Mono</option>
              <option value="IBM Plex Mono">IBM Plex Mono</option>
              <option value="Space Mono">Space Mono</option>
            </select>
          </div>
        </div>
      </div>

      {/* Preferences & Editorial Rules */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <label className="text-xs font-bold text-[#081629] uppercase tracking-wider block">
          {t.visual.authorPreferencesLabel || 'Author Design Notes & Consistency Directives'}
        </label>
        <textarea
          rows={3}
          value={profile.authorPreferences}
          onChange={(e) => setProfile({ ...profile, authorPreferences: e.target.value })}
          className="w-full p-3 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-[#345CFF]"
        />
      </div>

      <div className="pt-2 flex justify-end">
        <PremiumButton variant="primary" size="md" disabled={saving}>
          {saving ? 'Saving Profile...' : t.visual.saveIdentityBtn || 'Save Visual Identity'}
        </PremiumButton>
      </div>
    </form>
  );
};

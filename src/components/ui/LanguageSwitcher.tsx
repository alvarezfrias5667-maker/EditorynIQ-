import React from 'react';
import { useI18n } from '../../i18n';
import { InterfaceLanguage } from '../../domain/bookProjectTypes';

export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { lang, changeLanguage } = useI18n();

  const languages: { code: InterfaceLanguage; label: string }[] = [
    { code: 'en', label: 'EN' },
    { code: 'es', label: 'ES' },
    { code: 'fr', label: 'FR' },
  ];

  return (
    <div
      className={`inline-flex items-center p-1 bg-slate-100 rounded-md border border-slate-200/80 ${className}`}
      role="region"
      aria-label="Language Selector"
    >
      {languages.map((item) => (
        <button
          key={item.code}
          onClick={() => changeLanguage(item.code)}
          type="button"
          className={`px-2.5 py-1 text-xs font-semibold rounded transition-all whitespace-nowrap shrink-0 ${
            lang === item.code
              ? 'bg-[#081629] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
          aria-pressed={lang === item.code}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

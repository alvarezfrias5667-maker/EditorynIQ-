import React from 'react';
import { useI18n } from '../../i18n';

export interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <footer className="bg-[#081629] text-white border-t border-[#101F37] pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
        {/* Brand Overview */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
            <span className="w-7 h-7 rounded-md bg-[#345CFF] text-[#E9BC72] flex items-center justify-center font-serif text-sm font-bold">
              E
            </span>
            <span>EditorynIQ™</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {t.footer.tagline}
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#101F37] border border-slate-800 text-[11px] text-[#16C8BA]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#16C8BA]" />
            <span>ADN V100.0 Foundation</span>
          </div>
        </div>

        {/* Group 1: PLATFORM */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9BC72] mb-4">
            {t.footer.platform}
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li>
              <button
                onClick={() => onNavigate('/how-it-works')}
                className="hover:text-white transition-colors text-left"
              >
                {t.nav.howItWorks}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/start')}
                className="hover:text-white transition-colors text-left"
              >
                {t.nav.start}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/pricing')}
                className="hover:text-white transition-colors text-left"
              >
                {t.nav.pricing}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/studio')}
                className="hover:text-white transition-colors text-left text-[#5275FF] font-semibold"
              >
                {t.nav.studio}
              </button>
            </li>
          </ul>
        </div>

        {/* Group 2: COMPANY */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9BC72] mb-4">
            {t.footer.company}
          </h4>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li>
              <button
                onClick={() => onNavigate('/about')}
                className="hover:text-white transition-colors text-left"
              >
                {t.nav.about}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/contact')}
                className="hover:text-white transition-colors text-left"
              >
                {t.nav.contact}
              </button>
            </li>
          </ul>
        </div>

        {/* Group 3: LEGAL */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9BC72] mb-4">
            {t.footer.legal}
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors text-left">
                {t.footer.privacy}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors text-left">
                {t.footer.terms}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/cookies')} className="hover:text-white transition-colors text-left">
                {t.footer.cookies}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/copyright')} className="hover:text-white transition-colors text-left">
                {t.footer.copyright}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/acceptable-use')} className="hover:text-white transition-colors text-left">
                {t.footer.acceptableUse}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/refund-policy')} className="hover:text-white transition-colors text-left">
                {t.footer.refundPolicy}
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('/accessibility')} className="hover:text-white transition-colors text-left">
                {t.footer.accessibility}
              </button>
            </li>
          </ul>
        </div>

        {/* Group 4: MARKETPLACE PROTECTION */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#E9BC72] mb-4">
            {t.footer.marketplaceProtection}
          </h4>
          <ul className="space-y-2 text-xs text-slate-300">
            <li>
              <button
                onClick={() => onNavigate('/marketplace-protection')}
                className="hover:text-white transition-colors text-left"
              >
                {t.footer.marketplaceProtection}
              </button>
            </li>
            <li>
              <button
                onClick={() => onNavigate('/author-terms')}
                className="hover:text-white transition-colors text-left"
              >
                {t.footer.authorTerms}
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div>
          © {new Date().getFullYear()} EditorynIQ™. {t.footer.rightsReserved}
        </div>
        <div className="flex items-center gap-4 text-slate-500">
          <span>Enterprise AI Book Production</span>
          <span>·</span>
          <span>ADN V100.0</span>
        </div>
      </div>
    </footer>
  );
};

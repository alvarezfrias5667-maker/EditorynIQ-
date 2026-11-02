import React, { useState } from 'react';
import { useI18n } from '../i18n';
import {
  CheckCircle2,
  BookOpen,
  Sparkles,
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileText,
  Building2,
  Award,
} from 'lucide-react';

export interface PricingPageProps {
  onNavigate: (path: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({ onNavigate }) => {
  const { t, lang } = useI18n();

  // Accordion state for 12 FAQs (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const p = t.pricing;

  return (
    <div className="space-y-16 py-10 pb-24">
      {/* 1. HERO SECTION */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-100 border border-slate-200/80 text-[#345CFF] text-xs font-mono font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>EDITORYNIQ™ PRICING & SCOPE</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#081629] tracking-tight leading-[1.15] max-w-4xl mx-auto text-balance">
          {p.heroTitle || 'Tu libro merece una edición profesional, no solo texto.'}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed text-balance">
          {p.heroSubtitle ||
            'De una idea o manuscrito a una edición cuidadosamente estructurada, diseñada y preparada para su entrega. Elige la extensión de tu libro y desarrolla tu proyecto editorial en una plataforma.'}
        </p>
      </section>

      {/* 2. OFFICIAL PRICING CARDS (EXACTLY TWO CARDS) */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* CARD 1: BOOK ESSENTIAL™ */}
          <div className="bg-white rounded-3xl border border-slate-200/90 hover:border-slate-300 p-8 sm:p-10 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-8 relative">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                    STANDARD EXTENSION
                  </span>
                  <h3 className="text-2xl font-bold text-[#081629] mt-0.5">{p.essentialTitle}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                  {p.essentialBadge}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-[#081629] font-mono tracking-tight">
                    {p.essentialPrice}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{p.essentialPaymentType}</span>
                </div>
                <p className="text-xs text-slate-500 pt-1 leading-relaxed">{p.essentialDesc}</p>
              </div>

              <div className="border-t border-slate-100 pt-6 space-y-3">
                <span className="text-xs font-bold text-[#081629] uppercase tracking-wider block">
                  {lang === 'es' ? 'Entregables e Inclusiones:' : 'Deliverables & Features:'}
                </span>
                <ul className="space-y-3 text-xs text-slate-700">
                  {p.essentialFeatures?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => onNavigate('/start')}
                className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs tracking-wide transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <span>{p.essentialCta}</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* CARD 2: BOOK PROFESSIONAL™ (HIGHLIGHTED) */}
          <div className="bg-slate-900 text-white rounded-3xl border-2 border-[#345CFF] p-8 sm:p-10 shadow-xl flex flex-col justify-between space-y-8 relative overflow-hidden">
            {/* Top Highlight Tag */}
            <div className="absolute top-0 right-0 bg-gradient-to-r from-[#345CFF] to-blue-600 text-white font-mono text-[10px] font-bold px-4 py-1.5 rounded-bl-2xl shadow-sm tracking-wider uppercase">
              {p.professionalTag || 'MOST POPULAR / RECOMMENDED'}
            </div>

            <div className="space-y-6 pt-2">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    FULL EXTENSION
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-0.5">{p.professionalTitle}</h3>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 shrink-0">
                  {p.professionalBadge}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono tracking-tight">
                    {p.professionalPrice}
                  </span>
                  <span className="text-xs font-semibold text-slate-300">{p.professionalPaymentType}</span>
                </div>
                <p className="text-xs text-slate-300 pt-1 leading-relaxed">{p.professionalDesc}</p>
              </div>

              <div className="border-t border-slate-800 pt-6 space-y-3">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                  {lang === 'es' ? 'Entregables e Inclusiones Completas:' : 'Full Deliverables & Features:'}
                </span>
                <ul className="space-y-3 text-xs text-slate-200">
                  {p.professionalFeatures?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('/start')}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#345CFF] hover:bg-[#2848D8] text-white font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 group"
              >
                <span>{p.professionalCta}</span>
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* 3. SPECIAL PROJECTS & LEGAL DISCLOSURE (BELOW CARDS) */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-8 text-center space-y-3">
          <p className="text-sm font-semibold text-[#081629]">
            {p.specialProjectsText ||
              '¿Tu libro necesita más de 300 páginas o una producción editorial especializada?'}
          </p>
          <div>
            <button
              onClick={() => onNavigate('/contact')}
              className="text-xs font-bold text-[#345CFF] hover:underline inline-flex items-center gap-1"
            >
              <span>{p.specialProjectsLink || 'Solicitar evaluación editorial →'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 max-w-3xl mx-auto pt-2 border-t border-slate-200/60 leading-normal">
            * {lang === 'es'
              ? 'La titularidad de derechos de autor aplica sobre el manuscrito original del autor. Los activos generados mediante IA o de terceros están sujetos a términos de plataforma y licencias aplicables. Las descargas y paquetes para tiendas se habilitan tras la verificación local en el espacio de trabajo.'
              : lang === 'fr'
              ? 'Les droits d\'auteur s\'appliquent au manuscrit original de l\'auteur. Les contenus générés par IA et éléments tiers dépendent des conditions applicables. Les téléchargements sont activés après vérification locale.'
              : 'Author copyright retention applies to original author manuscript content. AI-assisted assets and third-party materials are subject to AI platform terms and applicable licenses. Deliverables and store packages are enabled upon local workspace verification.'}
          </p>
        </div>
      </section>

      {/* 4. CAPABILITY COMPARISON TABLE */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#081629] tracking-tight">{p.comparisonTitle}</h2>
          <p className="text-xs text-slate-500">{p.comparisonSubtitle}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-slate-900 text-white font-mono text-2xs uppercase tracking-wider">
                <th className="py-3.5 px-5 font-bold">{p.compFeatureHeader}</th>
                <th className="py-3.5 px-5 font-bold text-amber-300">{p.compEssentialHeader}</th>
                <th className="py-3.5 px-5 font-bold text-cyan-300">{p.compProfessionalHeader}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compPageBudgetLabel}</td>
                <td className="py-3.5 px-5 font-mono">{p.compPageBudgetEssential}</td>
                <td className="py-3.5 px-5 font-mono font-bold text-[#345CFF]">{p.compPageBudgetProfessional}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compModesLabel}</td>
                <td className="py-3.5 px-5">{p.compModesVal}</td>
                <td className="py-3.5 px-5">{p.compModesVal}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compProfilesLabel}</td>
                <td className="py-3.5 px-5">{p.compProfilesVal}</td>
                <td className="py-3.5 px-5">{p.compProfilesVal}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compFormatsLabel}</td>
                <td className="py-3.5 px-5 font-mono">{p.compFormatsVal}</td>
                <td className="py-3.5 px-5 font-mono font-bold text-[#345CFF]">{p.compFormatsVal}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compVisualE3Label}</td>
                <td className="py-3.5 px-5">{p.compVisualE3Essential}</td>
                <td className="py-3.5 px-5 font-medium text-emerald-700">{p.compVisualE3Professional}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compPackagesE5Label}</td>
                <td className="py-3.5 px-5">{p.compPackagesE5Essential}</td>
                <td className="py-3.5 px-5 font-medium text-purple-700">{p.compPackagesE5Professional}</td>
              </tr>
              <tr className="hover:bg-slate-50/60 transition">
                <td className="py-3.5 px-5 font-semibold text-[#081629]">{p.compRightsLabel}</td>
                <td className="py-3.5 px-5 font-bold text-emerald-600">{p.compRightsVal}</td>
                <td className="py-3.5 px-5 font-bold text-emerald-600">{p.compRightsVal}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 5. HOW E1–E5 WORKS */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#081629] tracking-tight">{p.howE1E5Title}</h2>
          <p className="text-xs text-slate-500">{p.howE1E5Subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
              ENGINE E1
            </span>
            <h4 className="text-xs font-bold text-[#081629]">{p.step1Title}</h4>
            <p className="text-3xs text-slate-500 leading-relaxed">{p.step1Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
              ENGINE E2
            </span>
            <h4 className="text-xs font-bold text-[#081629]">{p.step2Title}</h4>
            <p className="text-3xs text-slate-500 leading-relaxed">{p.step2Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 border border-cyan-200">
              ENGINE E3
            </span>
            <h4 className="text-xs font-bold text-[#081629]">{p.step3Title}</h4>
            <p className="text-3xs text-slate-500 leading-relaxed">{p.step3Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              ENGINE E4
            </span>
            <h4 className="text-xs font-bold text-[#081629]">{p.step4Title}</h4>
            <p className="text-3xs text-slate-500 leading-relaxed">{p.step4Desc}</p>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-2xs sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
              ENGINE E5
            </span>
            <h4 className="text-xs font-bold text-[#081629]">{p.step5Title}</h4>
            <p className="text-3xs text-slate-500 leading-relaxed">{p.step5Desc}</p>
          </div>
        </div>
      </section>

      {/* 6. FREQUENTLY ASKED QUESTIONS (12 ACCORDIONS) */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-[#081629] tracking-tight">{p.faqTitle}</h2>
          <p className="text-xs text-slate-500">{p.faqSubtitle}</p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {p.faqs?.map((item: { q: string; a: string }, idx: number) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-xs text-[#081629] hover:bg-slate-50/80 transition-colors focus:outline-none focus:ring-2 focus:ring-[#345CFF]"
                >
                  <span className="leading-snug">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-[#345CFF]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. PREMIUM EDITORIAL CLOSING CTA */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{p.closingTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{p.closingSubtitle}</p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('/start')}
              className="px-8 py-3.5 bg-[#345CFF] hover:bg-[#2848D8] text-white font-bold text-xs rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <span>{p.closingCta}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

import React from 'react';
import { useI18n } from '../i18n';
import { InfinityCard } from '../components/ui/InfinityCard';
import { PremiumButton } from '../components/ui/PremiumButton';

export interface HomePageProps {
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="space-y-20 pb-20">
      {/* SECTION A: HERO PREMIUM */}
      <section className="relative bg-[#081629] text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-[#101F37] overflow-hidden">
        {/* Subtle grid accent */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#345CFF_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#101F37] border border-[#345CFF]/30 text-xs font-semibold text-[#16C8BA] tracking-wider uppercase">
            <span className="w-2 h-2 rounded-full bg-[#16C8BA]" />
            <span>{t.hero.eyebrow}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
            {t.hero.title}
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t.hero.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PremiumButton
              variant="primary"
              size="lg"
              onClick={() => onNavigate('/start?mode=idea')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              {t.hero.ctaIdea}
            </PremiumButton>

            <PremiumButton
              variant="outline"
              size="lg"
              onClick={() => onNavigate('/start?mode=manuscript')}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              {t.hero.ctaManuscript}
            </PremiumButton>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#16C8BA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>{t.hero.badgeLocal}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-[#E9BC72]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <span>{t.hero.pagesCap}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* SECTION B: FIVE INTEGRATED CAPABILITIES */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.capabilities.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.capabilities.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfinityCard
              title={t.capabilities.p1Name}
              subtitle="Pillar 1"
              description={t.capabilities.p1Desc}
              accentColor="royal"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
            />

            <InfinityCard
              title={t.capabilities.p2Name}
              subtitle="Pillar 2"
              description={t.capabilities.p2Desc}
              accentColor="turquoise"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              }
            />

            <InfinityCard
              title={t.capabilities.p3Name}
              subtitle="Pillar 3"
              description={t.capabilities.p3Desc}
              accentColor="gold"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />

            <InfinityCard
              title={t.capabilities.p4Name}
              subtitle="Pillar 4"
              description={t.capabilities.p4Desc}
              accentColor="navy"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            />

            <InfinityCard
              title={t.capabilities.p5Name}
              subtitle="Pillar 5"
              description={t.capabilities.p5Desc}
              accentColor="royal"
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              }
            />
          </div>
        </section>

        {/* SECTION C: FOUR BOOK PRODUCTION PRODUCTS */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.products.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.products.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfinityCard
              title={t.products.p1Title}
              subtitle="Product 1"
              description={t.products.p1Desc}
              accentColor="royal"
              badge="Idea Intake"
              onClick={() => onNavigate('/start?mode=idea')}
            />

            <InfinityCard
              title={t.products.p2Title}
              subtitle="Product 2"
              description={t.products.p2Desc}
              accentColor="turquoise"
              badge="Manuscript Intake"
              onClick={() => onNavigate('/start?mode=manuscript')}
            />

            <InfinityCard
              title={t.products.p3Title}
              subtitle="Product 3"
              description={t.products.p3Desc}
              accentColor="gold"
              badge="Complex Layout"
              onClick={() => onNavigate('/start?mode=idea')}
            />

            <InfinityCard
              title={t.products.p4Title}
              subtitle="Product 4"
              description={t.products.p4Desc}
              accentColor="navy"
              badge="Reissue & Dual Lang"
              onClick={() => onNavigate('/start?mode=manuscript')}
            />
          </div>
        </section>

        {/* SECTION D: SIX INTELLIGENT ENGINES */}
        <section className="space-y-8 bg-slate-900 text-white p-8 sm:p-10 rounded-2xl border border-slate-800">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-white">{t.engines.title}</h2>
            <p className="text-slate-400 text-sm sm:text-base">{t.engines.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#16C8BA]">E1</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e1Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e1Desc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#345CFF]">E2</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e2Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e2Desc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#E9BC72]">E3</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e3Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e3Desc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#16C8BA]">E4</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e4Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e4Desc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#345CFF]">E5</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e5Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e5Desc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-[#E9BC72]">E6</span>
              <h3 className="text-lg font-bold text-white">{t.engines.e6Title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{t.engines.e6Desc}</p>
            </div>
          </div>
        </section>

        {/* SECTION E: THREE EDITORIAL PROFILES */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.profiles.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.profiles.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <InfinityCard
              title={t.profiles.pr1Title}
              subtitle="Profile 1"
              description={t.profiles.pr1Desc}
              accentColor="royal"
            />
            <InfinityCard
              title={t.profiles.pr2Title}
              subtitle="Profile 2"
              description={t.profiles.pr2Desc}
              accentColor="turquoise"
            />
            <InfinityCard
              title={t.profiles.pr3Title}
              subtitle="Profile 3"
              description={t.profiles.pr3Desc}
              accentColor="gold"
            />
          </div>
        </section>

        {/* SECTION F: FROM IDEA TO PUBLICATION — PROCESS */}
        <section className="space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.process.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.process.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step1}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step1Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step2}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step2Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step3}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step3Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step4}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step4Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step5}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step5Desc}</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <span className="text-xs font-extrabold text-[#345CFF]">{t.process.step6}</span>
              <p className="text-xs text-slate-600 leading-relaxed">{t.process.step6Desc}</p>
            </div>
          </div>
        </section>

        {/* SECTION G: BOOK LENGTH CAPABILITIES */}
        <section className="space-y-6 bg-[#081629] text-white p-8 sm:p-10 rounded-2xl border border-[#101F37]">
          <div className="max-w-3xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#16C8BA]">
              Dynamic Layout Geometry
            </span>
            <h2 className="text-3xl font-extrabold text-white">{t.bookLength.title}</h2>
            <p className="text-slate-300 text-sm">{t.bookLength.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{t.bookLength.standardTitle}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#345CFF]/20 text-[#5275FF]">
                  20 - 300 pgs
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.bookLength.standardDesc}</p>
            </div>

            <div className="bg-[#101F37] p-6 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">{t.bookLength.extendedTitle}</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded bg-[#E9BC72]/20 text-[#E9BC72]">
                  301 - 600 pgs
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{t.bookLength.extendedDesc}</p>
            </div>
          </div>

          <p className="text-xs text-slate-400 italic pt-2 border-t border-slate-800">
            {t.bookLength.rangeNotice}
          </p>
        </section>

        {/* SECTION H & I: DUAL LANG & QUALITY RIGHTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 space-y-4">
            <span className="text-xs font-bold text-[#345CFF] uppercase tracking-wider">
              {t.productionLangs.title}
            </span>
            <h3 className="text-xl font-bold text-[#101828]">{t.productionLangs.subtitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.productionLangs.desc}</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200/90 space-y-4">
            <span className="text-xs font-bold text-[#16836D] uppercase tracking-wider">
              {t.qualityAndRights.title}
            </span>
            <h3 className="text-xl font-bold text-[#101828]">{t.qualityAndRights.subtitle}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">{t.qualityAndRights.desc}</p>
          </div>
        </div>

        {/* SECTION J: MARKETPLACE ARCHITECTURE */}
        <section className="bg-gradient-to-r from-slate-900 via-[#081629] to-slate-900 text-white p-8 sm:p-10 rounded-2xl border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-[#E9BC72] uppercase tracking-widest">
            {t.marketplaceNotice.title}
          </span>
          <h3 className="text-2xl font-bold text-white">{t.marketplaceNotice.subtitle}</h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t.marketplaceNotice.desc}
          </p>
        </section>

        {/* SECTION K: WHY EDITORYNIQ */}
        <section className="space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.whyUs.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.whyUs.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#345CFF]/10 text-[#345CFF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{t.whyUs.p1}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#345CFF]/10 text-[#345CFF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{t.whyUs.p2}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#345CFF]/10 text-[#345CFF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{t.whyUs.p3}</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-[#345CFF]/10 text-[#345CFF] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                ✓
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{t.whyUs.p4}</p>
            </div>
          </div>
        </section>

        {/* SECTION L: FAQ */}
        <section className="space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <h2 className="text-3xl font-extrabold text-[#101828]">{t.faq.title}</h2>
            <p className="text-slate-600 text-sm sm:text-base">{t.faq.subtitle}</p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q1}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a1}
              </p>
            </details>

            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q2}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a2}
              </p>
            </details>

            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q3}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a3}
              </p>
            </details>

            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q4}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a4}
              </p>
            </details>

            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q5}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a5}
              </p>
            </details>

            <details className="group bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <summary className="font-bold text-sm text-[#101828] cursor-pointer flex items-center justify-between list-none">
                <span>{t.faq.q6}</span>
                <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {t.faq.a6}
              </p>
            </details>
          </div>
        </section>

        {/* SECTION M: FINAL CTA TOWARD /start */}
        <section className="bg-[#081629] text-white p-10 sm:p-12 rounded-2xl text-center space-y-6 border border-[#101F37]">
          <h2 className="text-3xl font-extrabold text-white">{t.ctaFinal.title}</h2>
          <p className="text-slate-300 text-base max-w-2xl mx-auto">{t.ctaFinal.subtitle}</p>
          <div className="pt-2">
            <PremiumButton
              variant="gold"
              size="lg"
              onClick={() => onNavigate('/start?mode=idea')}
            >
              {t.ctaFinal.button}
            </PremiumButton>
          </div>
        </section>
      </div>
    </div>
  );
};

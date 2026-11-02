import React from 'react';

export interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow = 'EDITORYNIQ™ ENTERPRISE',
  title,
  subtitle,
  badge,
  children,
}) => {
  return (
    <section className="relative bg-[#081629] text-white py-16 px-6 sm:px-8 border-b border-[#101F37] overflow-hidden">
      {/* Structural subtle grid background effect */}
      <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-xs font-semibold tracking-widest uppercase text-[#16C8BA]">
            {eyebrow}
          </span>
          {badge && (
            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#345CFF]/20 text-[#5275FF] border border-[#345CFF]/40">
              {badge}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
          {title}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
          {subtitle}
        </p>

        {children && <div className="mt-8 flex justify-center">{children}</div>}
      </div>
    </section>
  );
};

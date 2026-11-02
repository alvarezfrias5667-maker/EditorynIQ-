import React from 'react';

export interface InfinityCardProps {
  title: string;
  subtitle?: string;
  description: string;
  icon?: React.ReactNode;
  accentColor?: 'royal' | 'turquoise' | 'gold' | 'navy';
  onClick?: () => void;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export const InfinityCard: React.FC<InfinityCardProps> = ({
  title,
  subtitle,
  description,
  icon,
  accentColor = 'royal',
  onClick,
  badge,
  className = '',
  children,
}) => {
  const accentClasses = {
    royal: 'border-l-0 hover:border-[#345CFF]/30 group-hover:text-[#345CFF]',
    turquoise: 'border-l-0 hover:border-[#16C8BA]/30 group-hover:text-[#16C8BA]',
    gold: 'border-l-0 hover:border-[#E9BC72]/40 group-hover:text-[#E9BC72]',
    navy: 'border-l-0 hover:border-[#081629]/40 group-hover:text-[#081629]',
  };

  const iconBgClasses = {
    royal: 'bg-[#345CFF]/10 text-[#345CFF]',
    turquoise: 'bg-[#16C8BA]/10 text-[#16836D]',
    gold: 'bg-[#E9BC72]/15 text-[#9E7326]',
    navy: 'bg-[#081629]/10 text-[#081629]',
  };

  const isClickable = Boolean(onClick);

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-xl border border-slate-200/90 p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        isClickable ? 'cursor-pointer hover:-translate-y-0.5' : ''
      } ${accentClasses[accentColor]} ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          {icon && (
            <div className={`p-3 rounded-lg shrink-0 transition-colors ${iconBgClasses[accentColor]}`}>
              {icon}
            </div>
          )}
          {badge && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200/80">
              {badge}
            </span>
          )}
        </div>

        {subtitle && (
          <span className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            {subtitle}
          </span>
        )}

        <h3 className="text-lg font-bold text-[#101828] group-hover:text-[#345CFF] transition-colors leading-snug mb-2">
          {title}
        </h3>

        <p className="text-sm text-[#64748B] leading-relaxed mb-4">
          {description}
        </p>

        {children}
      </div>

      {isClickable && (
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#345CFF]">
          <span>Explore Details</span>
          <svg
            className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </div>
  );
};

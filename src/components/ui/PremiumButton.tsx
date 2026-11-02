import React from 'react';

export interface PremiumButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'gold' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const PremiumButton: React.FC<PremiumButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 text-center whitespace-normal break-words sm:whitespace-nowrap max-w-full disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary:
      'bg-[#345CFF] text-white hover:bg-[#2848D8] active:bg-[#1E3AB8] focus:ring-[#345CFF] shadow-xs hover:shadow-sm',
    secondary:
      'bg-[#081629] text-white hover:bg-[#101F37] active:bg-[#040B15] focus:ring-[#081629] shadow-xs',
    outline:
      'bg-white text-[#101828] border border-slate-300 hover:bg-slate-50 active:bg-slate-100 hover:border-slate-400 focus:ring-[#345CFF]',
    gold:
      'bg-[#E9BC72] text-[#101F37] hover:bg-[#DFC25E] active:bg-[#D0AA48] focus:ring-[#E9BC72] font-bold shadow-xs',
    danger:
      'bg-[#D14343] text-white hover:bg-[#B83232] active:bg-[#9B2525] focus:ring-[#D14343] shadow-xs',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

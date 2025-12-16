import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyle = "px-6 py-3 rounded-none font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm border-l-2";
  
  const variants = {
    primary: "bg-orange-600 hover:bg-orange-500 text-white shadow-[0_0_20px_rgba(234,88,12,0.3)] border-orange-400 hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border-slate-600",
    outline: "bg-transparent border border-slate-700 border-l-orange-500/50 text-slate-300 hover:border-orange-500 hover:text-white hover:bg-orange-500/10",
    danger: "bg-red-900/50 border border-red-500/50 text-red-200 hover:bg-red-900 hover:border-red-500",
    ghost: "bg-transparent border-transparent text-slate-400 hover:text-white hover:bg-slate-800/50"
  };

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          PROCESSING
        </>
      ) : children}
    </button>
  );
};
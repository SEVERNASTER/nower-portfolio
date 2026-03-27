import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// BUTTON
// ==========================================

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';

export interface ButtonProps {
    children?: React.ReactNode;
    variant?: ButtonVariant;
    icon?: LucideIcon;
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    className?: string;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

const baseClasses = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#0F172A] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none";

const variants: Record<ButtonVariant, string> = {
    primary: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:-translate-y-0.5 focus:ring-emerald-500",
    secondary: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 focus:ring-emerald-500",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 focus:ring-emerald-500",
    ghost: "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200 focus:ring-emerald-500"
};

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    icon: Icon,
    onClick,
    className = '',
    type = 'button',
    disabled = false
}) => {
    return (
        <button 
            type={type} 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseClasses} ${variants[variant]} ${className}`}
        >
            {Icon && <Icon className="h-4 w-4" />}
            {children}
        </button>
    );
};

export { Button };
export default Button;

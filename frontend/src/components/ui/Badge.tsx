import React from 'react';

// ==========================================
// BADGE
// ==========================================

export type BadgeVariant = 'success' | 'info' | 'warning' | 'neutral';

export interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    pulsingDot?: boolean;
    className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
    success: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
    info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400",
    warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-400",
    neutral: "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
};

const dotColors: Record<BadgeVariant, string> = {
    success: "bg-emerald-500",
    info: "bg-blue-500",
    warning: "bg-amber-500",
    neutral: "bg-slate-500"
};

const Badge: React.FC<BadgeProps> = ({ children, variant = 'success', pulsingDot = false, className = '' }) => {
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wide ${variantClasses[variant]} ${className}`}>
            {pulsingDot && (
                <div className={`h-2 w-2 rounded-full ${dotColors[variant]} animate-pulse`} />
            )}
            {children}
        </div>
    );
};

export { Badge };
export default Badge;

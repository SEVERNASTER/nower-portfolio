import React from 'react';
import type { LucideIcon } from 'lucide-react';

// ==========================================
// TAB (Navigation Item)
// ==========================================

export interface TabProps {
    icon?: LucideIcon;
    label: string;
    active?: boolean;
    badge?: string;
    onClick?: () => void;
}

export const Tab: React.FC<TabProps> = ({ icon: Icon, label, active, badge, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 ${active
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20'
                // INACTIVE: Remains unchanged
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
        >
            {Icon && <Icon className={`h-5 w-5 ${active ? 'text-white' : ''}`} />}

            {label}

            {badge && (
                <span className={`ml-auto flex h-5 w-5 items-center justify-center rounded-full text-xs font-semibold transition-colors ${active
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}>
                    {badge}
                </span>
            )}
        </button>
    );
};

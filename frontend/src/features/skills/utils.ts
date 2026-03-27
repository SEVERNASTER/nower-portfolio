import { SkillLevel } from '../../data/mockData';

export const getLevelSegmentStyles = (level: SkillLevel): string => {
    switch (level) {
        case 'Experto':
            return 'border-l border-indigo-600 bg-indigo-600 text-white dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300';
        case 'Avanzado':
            return 'border-l border-emerald-500 bg-emerald-500 text-white dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
        case 'Intermedio':
            return 'border-l border-amber-500 bg-amber-500 text-white dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';
        case 'Básico':
            return 'border-l border-rose-500 bg-rose-500 text-white dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300';
        default:
            return 'border-l border-slate-500 bg-slate-500 text-white dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300';
    }
};

export const getRemoveBtnStyles = (level: SkillLevel): string => {
    switch (level) {
        case 'Experto':
            return 'hover:bg-indigo-600 hover:text-white text-indigo-600 dark:hover:bg-indigo-900 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50';
        case 'Avanzado':
            return 'hover:bg-emerald-500 hover:text-white text-emerald-500 dark:hover:bg-emerald-900 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50';
        case 'Intermedio':
            return 'hover:bg-amber-500 hover:text-white text-amber-500 dark:hover:bg-amber-900 dark:text-amber-400 border-amber-100 dark:border-amber-800/50';
        case 'Básico':
            return 'hover:bg-rose-500 hover:text-white text-rose-500 dark:hover:bg-rose-900 dark:text-rose-400 border-rose-100 dark:border-rose-800/50';
        default:
            return 'hover:bg-slate-500 hover:text-white text-slate-500 dark:hover:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-800/50';
    }
};

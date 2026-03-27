import React from 'react';

// Array of vibrant colors for the tech stack badges
const techBadgeColors = [
    'bg-indigo-500 border-indigo-600 text-white dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-300',
    'bg-amber-500 border-amber-600 text-white dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300',
    'bg-rose-500 border-rose-600 text-white dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-300',
    'bg-purple-500 border-purple-600 text-white dark:bg-purple-500/10 dark:border-purple-500/30 dark:text-purple-300',
];

interface TechBadgeProps {
    skill: string;
    index: number;
}

export const TechBadge: React.FC<TechBadgeProps> = ({ skill, index }) => {
    return (
        <span
            className={`px-3 py-1.5 text-xs font-semibold rounded-md shadow-sm transition-transform hover:-translate-y-0.5 cursor-default border ${techBadgeColors[index % 4]}`}
        >
            {skill}
        </span>
    );
};

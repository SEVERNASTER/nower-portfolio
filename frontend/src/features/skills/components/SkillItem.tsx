import React from 'react';
import { X } from 'lucide-react';
import { Skill } from '../../../data/mockData';
import { getLevelSegmentStyles, getRemoveBtnStyles } from '../utils';

interface SkillItemProps {
    skill: Skill;
    onRemove: (id: string) => void;
}

export const SkillItem: React.FC<SkillItemProps> = ({ skill, onRemove }) => {
    return (
        <div className="flex items-center group rounded-lg border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#10221C] overflow-hidden shadow-sm">
            {/* Skill Name */}
            <span className="px-3.5 py-2 text-sm font-medium text-slate-800 dark:text-slate-100">
                {skill.name}
            </span>
            {/* Multi-Color Level Segment */}
            <span className={`px-2.5 py-2 text-[10px] uppercase font-bold tracking-widest ${getLevelSegmentStyles(skill.level)}`}>
                {skill.level}
            </span>
            {/* Remove Button - Interactive color change */}
            <button
                onClick={() => onRemove(skill.id)}
                className={`px-2.5 py-2 transition-all border-l border-slate-200 dark:border-slate-700/50 ${getRemoveBtnStyles(skill.level)}`}
                aria-label={`Eliminar ${skill.name}`}
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

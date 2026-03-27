import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Skill } from '../../../data/mockData';
import { SkillItem } from './SkillItem';

interface SkillCardProps {
    title: string;
    icon: LucideIcon;
    skills: Skill[];
    onRemoveSkill: (id: string) => void;
    emptyMessage: string;
}

export const SkillCard: React.FC<SkillCardProps> = ({
    title,
    icon: Icon,
    skills,
    onRemoveSkill,
    emptyMessage
}) => {
    return (
        <div className="bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-3">
                {skills.length === 0 ? (
                    <p className="text-sm text-slate-500 py-4 italic">{emptyMessage}</p>
                ) : (
                    skills.map(skill => (
                        <SkillItem 
                            key={skill.id} 
                            skill={skill} 
                            onRemove={onRemoveSkill} 
                        />
                    ))
                )}
            </div>
        </div>
    );
};

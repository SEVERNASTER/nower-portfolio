import React from 'react';
import { MoreVertical, Calendar, MapPin, Building2, Terminal } from 'lucide-react';
import { TechBadge } from './TechBadge';

export interface Experience {
    id: string;
    role: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    skills: string[];
}

export interface ExperienceCardProps {
    exp: Experience;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({ exp }) => {
    return (
        <div className="relative pl-8 md:pl-12">
            {/* Timeline Dot - Bright Purple for current, Indigo for past */}
            <div className={`absolute -left-[9px] top-8 w-4 h-4 rounded-full border-4 border-slate-50 dark:border-[#0B1120] ${exp.current
                ? 'bg-purple-500 ring-4 ring-purple-500/20 dark:ring-purple-500/10'
                : 'bg-indigo-300 dark:bg-indigo-900/50'
                }`} />

            {/* Experience Card */}
            <div className="group bg-white dark:bg-[#17262C] rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-900/30 transition-all">

                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exp.role}</h3>
                            {/* Status Badge */}
                            {exp.current && (
                                <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                                    Actual
                                </span>
                            )}
                        </div>

                        {/* COLORFUL Metadata Badges */}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {/* AMBER: Company */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/10">
                                <Building2 className="h-3.5 w-3.5" />
                                {exp.company}
                            </div>

                            {/* INDIGO: Date */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-500/5 text-xs font-bold text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/10">
                                <Calendar className="h-3.5 w-3.5" />
                                {exp.startDate} — {exp.endDate}
                            </div>

                            {/* ROSE: Location */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/5 text-xs font-bold text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/10">
                                <MapPin className="h-3.5 w-3.5" />
                                {exp.location}
                            </div>
                        </div>
                    </div>

                    {/* Options Menu */}
                    <button className="p-2 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors">
                        <MoreVertical className="h-5 w-5" />
                    </button>
                </div>

                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                    {exp.description}
                </p>

                {/* VIBRANT Tech Stack Badges */}
                <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Terminal className="h-4 w-4 text-purple-400 mr-1" />
                    {exp.skills.map((skill, index) => (
                        <TechBadge key={skill} skill={skill} index={index} />
                    ))}
                </div>

            </div>
        </div>
    );
};

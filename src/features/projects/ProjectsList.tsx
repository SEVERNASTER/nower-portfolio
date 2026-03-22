import React from 'react';
import { Plus, MoreVertical, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Project } from '../../data/mockData';
import { mockProjects } from '../../data/mockData';

// ==========================================
// PROJECTS LIST
// ==========================================

export const ProjectsList: React.FC = () => {
    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400">
                        <FolderOpen className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Proyectos</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Evidencia tu experiencia práctica.</p>
                    </div>
                </div>
                <Button variant="primary" icon={Plus}>
                    Nuevo Proyecto
                </Button>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {mockProjects.map((project: Project) => (
                    <div
                        key={project.id}
                        className="flex flex-col rounded-2xl bg-white dark:bg-[#17262C] p-6 border border-slate-200 dark:border-slate-800/60 shadow-sm hover:border-emerald-500/30 dark:hover:border-emerald-500/30 transition-colors group"
                    >
                        {/* Card Header */}
                        <div className="flex items-center justify-between mb-4">
                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${project.status === 'PUBLICADO'
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                {project.status}
                            </span>
                            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Card Body */}
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {project.title}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow">
                            {project.description}
                        </p>

                        {/* Card Footer (Tags) */}
                        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            {project.tags.map((tag: string) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 bg-slate-100 dark:bg-[#10221C] text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md uppercase tracking-wider border border-slate-200 dark:border-slate-700/50"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {/* Add New Project Card (Dashed) */}
                <button className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-transparent p-6 min-h-[250px] hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-[#10221C]/50 transition-all group">
                    <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-[#10221C] flex items-center justify-center mb-4 text-slate-500 group-hover:text-emerald-500 group-hover:scale-110 transition-all">
                        <Plus className="h-6 w-6" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        Añadir Proyecto
                    </span>
                </button>

            </div>
        </div>
    );
};

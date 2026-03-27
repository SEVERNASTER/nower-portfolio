import React, { useEffect, useState } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Project } from '../../data/mockData';

import { ProjectCard } from './components/ProjectCard';

// ==========================================
// PROJECTS LIST
// ==========================================

export const ProjectsList: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/projects', {
            credentials: 'include',
        })
            .then(async (res) => {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return [];
                }

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? 'Error cargando proyectos');
                }
                return data as Project[];
            })
            .then((data) => setProjects(data))
            .catch((e) => {
                setError(e instanceof Error ? e.message : 'Error cargando proyectos');
                setProjects([]);
            });
    }, []);

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

            {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {projects.map((project: Project) => (
                    <ProjectCard key={project.id} project={project} />
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

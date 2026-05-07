import React, { useCallback, useEffect, useState } from 'react';
import { Briefcase, GraduationCap, Plus } from 'lucide-react';
import { ExperienceCard } from './components/ExperienceCard';
import type { Experience } from './components/ExperienceCard';
import { Button } from '../../components/ui/Button';
import { AddExperienceModal } from './AddExperienceModal';
import { EducationCard } from '../education/components/EducationCard';
import { AddEducationModal } from '../education/AddEducationModal';

import { useAuth } from '@clerk/clerk-react';
import { fetchUserExperiences, deleteExperience } from './experienceApi';
import { deleteEducation, fetchUserEducation } from '../education/educationApi';

type Panel = 'work' | 'education';

export const ExperienceList: React.FC = () => {
    const [panel, setPanel] = useState<Panel>('work');
    const [isWorkModalOpen, setIsWorkModalOpen] = useState(false);
    const [isEducationModalOpen, setIsEducationModalOpen] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [education, setEducation] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [editingEducation, setEditingEducation] = useState<Experience | null>(null);
    const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
    const [educationToDelete, setEducationToDelete] = useState<Experience | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const loadWork = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }
        const list = await fetchUserExperiences(token);
        setExperiences(list.filter((e) => e.experienceType !== 'academic'));
    }, [getToken]);

    const loadEducation = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            window.location.href = '/login';
            return;
        }
        const list = await fetchUserEducation(token);
        setEducation(list);
    }, [getToken]);

    const loadAll = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const [workRows, eduRows] = await Promise.all([
                fetchUserExperiences(token),
                fetchUserEducation(token),
            ]);
            setExperiences(workRows.filter((e) => e.experienceType !== 'academic'));
            setEducation(eduRows);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error cargando datos');
            setExperiences([]);
            setEducation([]);
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            window.location.href = '/login';
            return;
        }
        void loadAll();
    }, [isLoaded, isSignedIn, loadAll]);

    const handleOpenCreateWorkModal = () => {
        setEditingExperience(null);
        setIsWorkModalOpen(true);
    };

    const handleOpenCreateEducationModal = () => {
        setEditingEducation(null);
        setIsEducationModalOpen(true);
    };

    const handleEditExperience = (experience: Experience) => {
        setEditingExperience(experience);
        setIsWorkModalOpen(true);
    };

    const handleEditEducation = (edu: Experience) => {
        setEditingEducation(edu);
        setIsEducationModalOpen(true);
    };

    const handleEducationSaved = (record: Experience) => {
        setEducation((prev) => {
            const idx = prev.findIndex((e) => e.id === record.id);
            const next = idx >= 0 ? [...prev] : [record, ...prev];
            if (idx >= 0) next[idx] = record;
            return next.sort((a, b) => {
                const da = a.rawStartDate ?? '';
                const db = b.rawStartDate ?? '';
                return db.localeCompare(da);
            });
        });
        setEditingEducation(null);
    };

    const handleAskDeleteExperience = (experience: Experience) => {
        setExperienceToDelete(experience);
    };

    const handleAskDeleteEducation = (edu: Experience) => {
        setEducationToDelete(edu);
    };

    const handleConfirmDeleteExperience = async () => {
        if (!experienceToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const token = await getToken();

            if (!token) {
                window.location.href = '/login';
                return;
            }

            await deleteExperience(token, experienceToDelete.id);

            setExperiences((prev) =>
                prev.filter((item) => item.id !== experienceToDelete.id)
            );

            setExperienceToDelete(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error eliminando experiencia');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleConfirmDeleteEducation = async () => {
        if (!educationToDelete) return;

        setIsDeleting(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }

            await deleteEducation(token, educationToDelete.id);

            setEducation((prev) => prev.filter((item) => item.id !== educationToDelete.id));

            setEducationToDelete(null);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error eliminando formación');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#17262C]/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl shadow-inner ${
                            panel === 'work'
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                : 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400'
                        }`}
                    >
                        {panel === 'work' ? (
                            <Briefcase className="h-6 w-6" />
                        ) : (
                            <GraduationCap className="h-6 w-6" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                            Experiencia y formación
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {panel === 'work'
                                ? 'Tu trayectoria laboral y proyectos profesionales.'
                                : 'Estudios, títulos y certificaciones académicas.'}
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 p-1 bg-slate-50 dark:bg-slate-900/40">
                        <button
                            type="button"
                            onClick={() => setPanel('work')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                panel === 'work'
                                    ? 'bg-white dark:bg-[#17262C] text-purple-700 dark:text-purple-300 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Laboral
                        </button>
                        <button
                            type="button"
                            onClick={() => setPanel('education')}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                                panel === 'education'
                                    ? 'bg-white dark:bg-[#17262C] text-teal-800 dark:text-teal-300 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            Académica
                        </button>
                    </div>

                    {panel === 'work' ? (
                        <Button variant="primary" icon={Plus} onClick={handleOpenCreateWorkModal}>
                            Añadir experiencia
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            icon={Plus}
                            onClick={handleOpenCreateEducationModal}
                            className="!bg-teal-600 hover:!bg-teal-700"
                        >
                            Añadir formación
                        </Button>
                    )}
                </div>
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-4 md:pl-6">Cargando…</p>
            ) : panel === 'work' ? (
                experiences.length === 0 && !error ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 pl-4 md:pl-6">
                        Aún no registras experiencia laboral. Pulsa &quot;Añadir experiencia&quot; para crear la primera.
                    </p>
                ) : (
                    <div className="relative border-l-2 border-purple-100 dark:border-slate-800 ml-4 md:ml-6 space-y-8 pb-4">
                        {experiences.map((exp) => (
                            <ExperienceCard
                                key={exp.id}
                                exp={exp}
                                onEdit={handleEditExperience}
                                onDelete={handleAskDeleteExperience}
                            />
                        ))}
                    </div>
                )
            ) : education.length === 0 && !error ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-4 md:pl-6">
                    No hay formación académica registrada. Usa &quot;Añadir formación&quot; para cargar tus estudios.
                </p>
            ) : (
                <div className="grid gap-5 pl-2 md:pl-4">
                    {education.map((edu) => (
                        <EducationCard
                            key={edu.id}
                            edu={edu}
                            onEdit={handleEditEducation}
                            onDelete={handleAskDeleteEducation}
                        />
                    ))}
                </div>
            )}

            <AddExperienceModal
                isOpen={isWorkModalOpen}
                onClose={() => {
                    setIsWorkModalOpen(false);
                    setEditingExperience(null);
                }}
                onSaved={() => {
                    setEditingExperience(null);
                    void loadWork();
                }}
                experienceToEdit={editingExperience}
            />

            <AddEducationModal
                isOpen={isEducationModalOpen}
                onClose={() => {
                    setIsEducationModalOpen(false);
                    setEditingEducation(null);
                }}
                onSaved={handleEducationSaved}
                educationToEdit={editingEducation}
                existingEducation={education}
            />

            {experienceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#17262C] p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Eliminar experiencia
                        </h3>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            ¿Estás segura de que deseas eliminar esta experiencia laboral?
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setExperienceToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleConfirmDeleteExperience()}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {educationToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#17262C] p-6 shadow-xl border border-teal-200 dark:border-teal-900/40">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Eliminar formación académica
                        </h3>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            ¿Eliminar este registro académico? Esta acción no se puede deshacer.
                        </p>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setEducationToDelete(null)}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-60"
                            >
                                Cancelar
                            </button>

                            <button
                                type="button"
                                onClick={() => void handleConfirmDeleteEducation()}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

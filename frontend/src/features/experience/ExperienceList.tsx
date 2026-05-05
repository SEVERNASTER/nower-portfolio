import React, { useCallback, useEffect, useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { ExperienceCard } from './components/ExperienceCard';
import type { Experience } from './components/ExperienceCard';
import { Button } from '../../components/ui/Button';
import { AddExperienceModal } from './AddExperienceModal';

import { useAuth } from '@clerk/clerk-react';
import { fetchUserExperiences, deleteExperience } from './experienceApi';
export const ExperienceList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingExperience, setEditingExperience] = useState<Experience | null>(null);
    const [experienceToDelete, setExperienceToDelete] = useState<Experience | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const loadExperiences = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                window.location.href = '/login';
                return;
            }
            const list = await fetchUserExperiences(token);
            setExperiences(list);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Error cargando experiencia');
            setExperiences([]);
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
        void loadExperiences();
    }, [isLoaded, isSignedIn, loadExperiences]);

    const handleOpenCreateModal = () => {
        setEditingExperience(null);
        setIsModalOpen(true);
    };
    
    const handleEditExperience = (experience: Experience) => {
    setEditingExperience(experience);
    setIsModalOpen(true);
   };

    const handleAskDeleteExperience = (experience: Experience) => {
        setExperienceToDelete(experience);
    };

    const handleConfirmDelete = async () => {
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

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in">

            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#17262C]/80 p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 shadow-inner">
                        <Briefcase className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Experiencia</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tu trayectoria y evolución profesional.</p>
                    </div>
                </div>
                <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
                    Añadir Experiencia
                </Button>
            </div>

            {error && (
                <div className="text-sm text-red-500 bg-red-50 border border-red-200 p-3 rounded-lg">
                    {error}
                </div>
            )}

            {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-4 md:pl-6">Cargando experiencias…</p>
            ) : experiences.length === 0 && !error ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 pl-4 md:pl-6">
                    Aún no registras experiencias. Pulsa &quot;Añadir Experiencia&quot; para crear la primera.
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
            )}

            <AddExperienceModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingExperience(null);
                }}
                onSaved={() => {
                    setEditingExperience(null);
                    void loadExperiences();
                }}
                experienceToEdit={editingExperience}
            />

           
            {experienceToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#17262C] p-6 shadow-xl border border-slate-200 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Eliminar experiencia
                        </h3>

                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
                            ¿Estás segura de que deseas eliminar esta experiencia?
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
                                onClick={handleConfirmDelete}
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
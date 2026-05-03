import React, { useCallback, useEffect, useState } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { ExperienceCard } from './components/ExperienceCard';
import type { Experience } from './components/ExperienceCard';
import { Button } from '../../components/ui/Button';
import { AddExperienceModal } from './AddExperienceModal';

import { useAuth } from '@clerk/clerk-react';
import { fetchUserExperiences } from './experienceApi';

export const ExperienceList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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
                <Button variant="primary" icon={Plus} onClick={() => setIsModalOpen(true)}>
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
                        <ExperienceCard key={exp.id} exp={exp} />
                    ))}
                </div>
            )}

            <AddExperienceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSaved={() => void loadExperiences()}
            />
        </div>
    );
};

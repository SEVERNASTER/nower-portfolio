import React, { useEffect, useState } from 'react';
import { Plus, Code2, BrainCircuit, Blocks } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { CustomDropdown } from '../../components/ui/CustomDropdown';
import { SkillCard } from './components/SkillCard';
import type { Skill, SkillLevel } from '../../data/mockData';

export const SkillsList: React.FC = () => {
    // ==========================================
    // LOGIC: State Management (Mocked)
    // ==========================================

    // 1. Manage the list of skills in state
    const [skills, setSkills] = useState<Skill[]>([]);

    useEffect(() => {
        fetch('/api/skills', {
            credentials: 'include',
        })
            .then(async (res) => {
                if (res.status === 401) {
                    window.location.href = '/login';
                    return [];
                }

                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data?.error ?? 'Error cargando habilidades');
                }
                return data as Skill[];
            })
            .then((data) => setSkills(data))
            .catch(() => setSkills([]));
    }, []);

    // 2. Form state for the inputs
    const [newSkillName, setNewSkillName] = useState('');
    const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel | ''>('');
    const [newSkillCategory, setNewSkillCategory] = useState<'Técnica' | 'Blanda' | ''>('');

    // 3. Handler to add a new skill to the list
    const handleAddSkill = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent adding incomplete skills
        if (!newSkillName.trim() || !newSkillCategory || !newSkillLevel) return;

        const newSkill: Skill = {
            // Generate a unique temporary ID
            id: `sk_${Date.now()}`,
            name: newSkillName.trim(),
            level: newSkillLevel as SkillLevel,
            category: newSkillCategory as 'Técnica' | 'Blanda'
        };

        // Update state: add new skill to the end
        setSkills([...skills, newSkill]);

        // Reset the form
        setNewSkillName('');
        setNewSkillCategory('');
        setNewSkillLevel('');
    };

    // 4. Handler to remove a skill
    const handleRemoveSkill = (idToRemove: string) => {
        setSkills(skills.filter(skill => skill.id !== idToRemove));
    };

    // Derived state for filtering categories
    const technicalSkills = skills.filter(s => s.category === 'Técnica');
    const softSkills = skills.filter(s => s.category === 'Blanda');


    return (
        <div className="w-full space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400 shadow-inner">
                        <Blocks className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Gestor de Habilidades</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Añade y categoriza tus competencias profesionales.</p>
                    </div>
                </div>
            </div>

            {/* Add New Skill Form */}
            <div className="bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
                <form onSubmit={handleAddSkill} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-5 space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Nombre de la Habilidad</label>
                        <input
                            type="text"
                            value={newSkillName}
                            onChange={(e) => setNewSkillName(e.target.value)}
                            placeholder="Ej. GraphQL, Figma, Kubernetes..."
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                        />
                    </div>

                    <CustomDropdown
                        label="Categoría"
                        value={newSkillCategory}
                        onChange={(val) => setNewSkillCategory(val as 'Técnica' | 'Blanda')}
                        options={[
                            { value: 'Técnica', label: 'Habilidad Técnica' },
                            { value: 'Blanda', label: 'Habilidad Blanda' }
                        ]}
                        placeholder="Seleccionar Categoría"
                        className="md:col-span-3 transition-all"
                    />

                    <CustomDropdown
                        label="Nivel Dominio"
                        value={newSkillLevel}
                        onChange={(val) => setNewSkillLevel(val as SkillLevel)}
                        options={[
                            { value: 'Experto', label: '🟣 Experto' },
                            { value: 'Avanzado', label: '🟠 Avanzado' },
                            { value: 'Intermedio', label: '🟢 Intermedio' },
                            { value: 'Básico', label: '🔴 Básico' }
                        ]}
                        placeholder="Seleccionar Nivel"
                        className="md:col-span-2 transition-all"
                    />

                    <Button
                        variant="primary"
                        icon={Plus}
                        type="submit"
                        className="md:col-span-2 py-3 w-full"
                        disabled={!newSkillName.trim() || !newSkillCategory || !newSkillLevel}
                    >
                        Añadir
                    </Button>
                </form>
            </div>

            {/* Skills Display Grids */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <SkillCard
                    title="Hard Skills (Técnicas)"
                    icon={Code2}
                    skills={technicalSkills}
                    onRemoveSkill={handleRemoveSkill}
                    emptyMessage="Usa el formulario superior para añadir habilidades técnicas."
                />

                <SkillCard
                    title="Soft Skills (Blandas)"
                    icon={BrainCircuit}
                    skills={softSkills}
                    onRemoveSkill={handleRemoveSkill}
                    emptyMessage="No hay habilidades blandas registradas."
                />
            </div>
        </div>
    );
};
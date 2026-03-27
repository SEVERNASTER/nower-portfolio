import React, { useState, useEffect } from 'react';
import { X, Briefcase, Building2, MapPin, Calendar, AlignLeft, Terminal, Plus, Laptop } from 'lucide-react';

interface AddExperienceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AddExperienceModal: React.FC<AddExperienceModalProps> = ({ isOpen, onClose }) => {
    // Form State
    const [isCurrent, setIsCurrent] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [modality, setModality] = useState('Remoto');

    // Tech Stack Array State
    const [techInput, setTechInput] = useState('');
    const [technologies, setTechnologies] = useState<string[]>([]);

    // Animation handler
    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        } else {
            setTimeout(() => setIsVisible(false), 300);
        }
    }, [isOpen]);

    // Tech Tag Handlers
    const handleAddTech = (e?: React.KeyboardEvent | React.MouseEvent) => {
        if (e && 'key' in e && e.key !== 'Enter') return;
        e?.preventDefault(); // Prevent form submission on Enter

        const trimmed = techInput.trim();
        if (trimmed && !technologies.includes(trimmed)) {
            setTechnologies([...technologies, trimmed]);
            setTechInput('');
        }
    };

    const removeTech = (techToRemove: string) => {
        setTechnologies(technologies.filter(t => t !== techToRemove));
    };

    if (!isOpen && !isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className={`relative w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Añadir Experiencia</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Registra un nuevo rol en tu trayectoria.</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar">
                    <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>

                        {/* Role & Company Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Rol / Cargo</label>
                                <div className="relative">
                                    <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ej. Senior Frontend Developer"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Empresa</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ej. NOWER Enterprise"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modality & Location Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Modalidad</label>
                                <div className="relative">
                                    <Laptop className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <select
                                        value={modality}
                                        onChange={(e) => setModality(e.target.value)}
                                        className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors outline-none appearance-none"
                                    >
                                        <option value="Remoto">Remoto</option>
                                        <option value="Híbrido">Híbrido</option>
                                        <option value="Presencial">Presencial</option>
                                    </select>
                                    {/* Custom Dropdown Arrow */}
                                    <div className="absolute right-4 top-4 pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Ubicación (Opcional)</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Ej. Cochabamba, Bolivia"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-colors outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dates Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Fecha de Inicio</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="month"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className={`text-xs font-bold uppercase tracking-wider ${isCurrent ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>
                                        Fecha de Fin
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isCurrent ? 'bg-purple-500 border-purple-500' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#111827] group-hover:border-purple-500'}`}>
                                            {isCurrent && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trabajo actual</span>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={isCurrent}
                                            onChange={() => setIsCurrent(!isCurrent)}
                                        />
                                    </label>
                                </div>
                                <div className="relative">
                                    <Calendar className={`absolute left-3.5 top-3.5 h-4 w-4 ${isCurrent ? 'text-slate-300 dark:text-slate-700' : 'text-slate-400'}`} />
                                    <input
                                        type="month"
                                        disabled={isCurrent}
                                        className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-colors outline-none text-sm ${isCurrent
                                                ? 'border-slate-200 dark:border-slate-800/50 bg-slate-100/50 dark:bg-[#0B1120]/50 text-slate-400 dark:text-slate-600 cursor-not-allowed'
                                                : 'border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                                            }`}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Descripción de Responsabilidades</label>
                            <div className="relative">
                                <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                <textarea
                                    rows={4}
                                    placeholder="Describe tus logros, responsabilidades y el impacto que tuviste en este rol..."
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors outline-none resize-none custom-scrollbar"
                                />
                            </div>
                        </div>

                        {/* DYNAMIC Tech Stack Input */}
                        <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
                            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tecnologías Usadas</label>

                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Terminal className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={handleAddTech}
                                        placeholder="Ej. React, Node.js (Presiona Enter para añadir)"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors outline-none"
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleAddTech}
                                    className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-semibold"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline">Añadir</span>
                                </button>
                            </div>

                            {/* Rendered Tech Tags */}
                            {technologies.length > 0 && (
                                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#0B1120] border border-slate-100 dark:border-slate-800/50">
                                    {technologies.map((tech) => (
                                        <div
                                            key={tech}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white dark:bg-[#17262C] dark:text-slate-200 dark:border dark:border-slate-700 rounded-lg text-xs font-semibold shadow-sm group"
                                        >
                                            {tech}
                                            <button
                                                type="button"
                                                onClick={() => removeTech(tech)}
                                                className="ml-1 text-slate-400 group-hover:text-rose-400 transition-colors focus:outline-none"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] rounded-b-3xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                    >
                        Cancelar
                    </button>
                    <button className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-900/20 transition-all focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120]">
                        Guardar Experiencia
                    </button>
                </div>
            </div>
        </div>
    );
};
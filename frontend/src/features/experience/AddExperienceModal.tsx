import React, { useState, useEffect } from "react";
import {
  X,
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  AlignLeft,
  Terminal,
  Plus,
  Laptop,
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import {
  createExperience,
  updateExperience,
  monthInputToEndDate,
  monthInputToStartDate,
} from "./experienceApi";

import type { Experience } from "./components/ExperienceCard";

interface AddExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (message?: string) => void;
  experienceToEdit?: Experience | null;
}

export const AddExperienceModal: React.FC<AddExperienceModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  experienceToEdit,
}) => {
  const { getToken } = useAuth();

  const [title, setTitle] = useState("");
  const [institution, setInstitution] = useState("");
  const [isCurrent, setIsCurrent] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [modality, setModality] = useState("Remoto");
  const [location, setLocation] = useState("");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const isEditing = Boolean(experienceToEdit);

  const isEndDateDisabled = isCurrent;

  const handleMonthChange = (value: string, setter: (v: string) => void) => {
    if (!value) {
      setter("");
      return;
    }
    const [year, month] = value.split("-");
    if (year && year.length > 4) {
      setter(`${year.slice(0, 4)}${month ? `-${month}` : ""}`);
    } else {
      setter(value);
    }
  };

  const dateToMonthInput = (date?: string | null) => {
    if (!date) return "";
    return date.slice(0, 7);
  };

  const fillFormForEdit = (experience: Experience) => {
    setTitle(experience.role ?? "");
    setInstitution(experience.company ?? "");
    setStartMonth(dateToMonthInput(experience.rawStartDate));
    setEndMonth(dateToMonthInput(experience.rawEndDate));
    setIsCurrent(experience.current);
    setDescription(experience.description ?? "");
    setModality(experience.modality ?? "Remoto");
    setLocation(experience.location ?? "");
    setTechInput("");
    setTechnologies(experience.skills ?? []);
    setSubmitError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (experienceToEdit) {
        fillFormForEdit(experienceToEdit);
      } else {
        resetForm();
      }
    } else {
      setTimeout(() => setIsVisible(false), 300);
    }
  }, [isOpen, experienceToEdit]);

  const resetForm = () => {
    setTitle("");
    setInstitution("");
    setIsCurrent(false);
    setModality("Remoto");
    setLocation("");
    setStartMonth("");
    setEndMonth("");
    setDescription("");
    setTechInput("");
    setTechnologies([]);
    setSubmitError(null);
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleAddTech = (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e && "key" in e && e.key !== "Enter") return;
    e?.preventDefault();
    const trimmed = techInput.trim();
    if (trimmed && !technologies.includes(trimmed)) {
      setTechnologies([...technologies, trimmed]);
      setTechInput("");
    }
  };

  const removeTech = (techToRemove: string) => {
    setTechnologies(technologies.filter((t) => t !== techToRemove));
  };

  const buildDescriptionPayload = (): string | null => {
    const blocks: string[] = [];
    blocks.push(`Modalidad: ${modality}`);
    if (location.trim()) blocks.push(`Ubicación: ${location.trim()}`);
    if (description.trim()) blocks.push(description.trim());
    if (technologies.length > 0)
      blocks.push(`Tecnologías: ${technologies.join(", ")}`);
    const joined = blocks.filter(Boolean).join("\n\n").trim();
    return joined.length > 0 ? joined : null;
  };

  const handleSave = async () => {
    if (saving) return;
    setSubmitError(null);
    const t = title.trim();
    const inst = institution.trim();

    if (!t || !inst) {
      setSubmitError("Completa todos los campos obligatorios.");
      return;
    }
    if (t.length > 100) {
      setSubmitError("El cargo no puede superar los 100 caracteres.");
      return;
    }
    if (inst.length > 70) {
      setSubmitError("La empresa no puede superar los 70 caracteres.");
      return;
    }
    if (description.length > 500) {
      setSubmitError("La descripción no puede superar los 500 caracteres.");
      return;
    }
    if (!startMonth) {
      setSubmitError("Indica la fecha de inicio.");
      return;
    }
    if (!isEndDateDisabled && !endMonth) {
      setSubmitError('Indica la fecha de fin o marca el estado correspondiente.');
      return;
    }

    const startDate = monthInputToStartDate(startMonth);
    const endDate = isEndDateDisabled ? null : monthInputToEndDate(endMonth);

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        setSubmitError("Sesión no válida.");
        return;
      }
      
      const payload = {
        type: "work" as const,
        title: t,
        institution: inst,
        degree_type: null,
        status: null,
        start_date: startDate,
        end_date: endDate,
        description: buildDescriptionPayload(),
      };

      if (experienceToEdit) {
        await updateExperience(token, experienceToEdit.id, payload);
        onSaved?.('Registro actualizado');
      } else {
        await createExperience(token, payload);
        onSaved?.('Experiencia registrada exitosamente');
      }
      resetForm();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen && !isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div
        className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={handleClose}
      />

      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditing ? "Editar experiencia laboral" : "Añadir experiencia laboral"}
              </h2>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            
            {/* Fila: Rol e Institución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Rol / Cargo <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-semibold ${title.length > 90 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
                    {title.length}/100
                  </span>
                </div>
                <div className="relative">
                  <Briefcase className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={title}
                    maxLength={100}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej. Frontend Developer"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Empresa <span className="text-red-500">*</span>
                  </label>
                  <span className={`text-xs font-semibold ${institution.length > 60 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
                    {institution.length}/70
                  </span>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={institution}
                    maxLength={70}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Modalidad y Ubicación */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Modalidad</label>
                <div className="relative">
                  <Laptop className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Remoto">Remoto</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Presencial">Presencial</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Ubicación</label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Fila: Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Fecha de Inicio <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="month"
                    value={startMonth}
                    max="9999-12"
                    onChange={(e) => handleMonthChange(e.target.value, setStartMonth)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Fecha de Fin{!isEndDateDisabled ? <span className="text-red-500"> *</span> : null}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCurrent}
                      onChange={() => setIsCurrent(!isCurrent)}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trabajo actual</span>
                  </label>
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="month"
                    value={endMonth}
                    max="9999-12"
                    onChange={(e) => handleMonthChange(e.target.value, setEndMonth)}
                    disabled={isEndDateDisabled}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
                      isEndDateDisabled
                        ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800"
                        : "bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white border-slate-300 dark:border-slate-800"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Descripción</label>
                <span className={`text-xs font-semibold ${description.length > 450 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
                  {description.length}/500
                </span>
              </div>
              <div className="relative">
                <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  rows={4}
                  value={description}
                  maxLength={500}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none resize-none"
                />
              </div>
            </div>

            {/* Tecnologías */}
            <div className="space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tecnologías Usadas</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Terminal className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={techInput}
                    onChange={(e) => setTechInput(e.target.value)}
                    onKeyDown={handleAddTech}
                    placeholder="Enter para añadir"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none"
                  />
                </div>
                <button type="button" onClick={handleAddTech} className="px-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <div key={tech} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                    {tech}
                    <button type="button" onClick={() => removeTech(tech)}><X className="h-3 w-3" /></button>
                  </div>
                ))}
              </div>
            </div>

            {submitError && <p className="text-sm text-red-600">{submitError}</p>}
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#0B1120] rounded-b-3xl">
          <button onClick={handleClose} disabled={saving} className="px-5 py-2.5 text-sm font-semibold text-slate-600">
            Cancelar
          </button>
          <button
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};
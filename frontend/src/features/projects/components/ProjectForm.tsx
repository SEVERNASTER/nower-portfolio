import React, { useState } from "react";
import { X, Plus } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Skill } from '../../../data/mockData';

interface ProjectFormProps {
  availableSkills: Skill[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  availableSkills,
  onSubmit,
  onCancel,
}) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [techInput, setTechInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});
  const toggleTag = (skillName: string) => {
    if (tags.includes(skillName)) {
      setTags(tags.filter((t) => t !== skillName));
    } else {
      setTags([...tags, skillName]);
    }
  };

  const addTag = () => {
    const trimmed = techInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTechInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!title.trim()) newErrors.title = "El título es requerido";
    if (description.length < 20)
      newErrors.description =
        "La descripción debe tener al menos 20 caracteres";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ 
      title, 
      description, 
      tags, 
      evidence_url: "" 
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Título del Proyecto *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`w-full p-2.5 rounded-xl border ${errors.title ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
          placeholder="Ej: E-commerce Platform"
        />
        {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Descripción *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className={`w-full p-2.5 rounded-xl border ${errors.description ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
          placeholder="Describe los retos y soluciones del proyecto..."
        />
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Tecnologías del Proyecto (Selecciona de tus Skills)
        </label>

        {/* Grid de selección rápida */}
        <div className="flex flex-wrap gap-2 p-4 bg-slate-50 dark:bg-[#10221C] rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
          {availableSkills.length === 0 && (
            <p className="text-xs text-slate-500">
              Primero añade habilidades en el Gestor de Habilidades.
            </p>
          )}
          {availableSkills.map((skill) => (
            <button
              type="button"
              key={skill.id}
              onClick={() => toggleTag(skill.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                tags.includes(skill.name)
                  ? "bg-emerald-500 border-emerald-600 text-white shadow-md scale-105"
                  : "bg-white dark:bg-[#17262C] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400"
              }`}
            >
              {tags.includes(skill.name) ? "✓ " : "+ "}
              {skill.name}
            </button>
          ))}
        </div>

        {/* Input opcional por si quieres añadir algo que NO esté en tus skills generales */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            placeholder="Otra tecnología (Ej: AWS, Docker...)"
            className="flex-1 p-2.5 rounded-xl border ... "
          />
          <Button type="button" onClick={addTag} variant="secondary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar Proyecto
        </Button>
      </div>
    </form>
  );
};

import React, { useEffect, useState } from "react";
import { Plus, Code2, BrainCircuit, Blocks, Trash2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { Button } from "../../components/ui/Button";
import { CustomDropdown } from "../../components/ui/CustomDropdown";
import { SkillCard } from "./components/SkillCard";
import type { Skill, SkillLevel } from "../../data/mockData";
import { API_URL } from "../profile/profileService";
import { apiFetch } from "../../lib/apiClient";
import { ConfirmModal } from "../projects/components/ConfirmModal";

interface BackendSkill {
  id: number | string;
  name: string;
  type: "technical" | "soft";
  proficiency_level: number;
}

const translateTypeToCategory = (
  type: "technical" | "soft",
): "Técnica" | "Blanda" => (type === "technical" ? "Técnica" : "Blanda");

const translateCategoryToType = (
  category: "Técnica" | "Blanda",
): "technical" | "soft" => (category === "Técnica" ? "technical" : "soft");

const translateLevelToProficiency = (level: SkillLevel): number => {
  switch (level) {
    case "Básico":
      return 1;
    case "Intermedio":
      return 2;
    case "Avanzado":
      return 3;
    case "Experto":
      return 4;
    default:
      return 1;
  }
};

const translateProficiencyToLevel = (proficiency: number): SkillLevel => {
  switch (proficiency) {
    case 1:
      return "Básico";
    case 2:
      return "Intermedio";
    case 3:
      return "Avanzado";
    case 4:
    case 5:
      return "Experto";
    default:
      return "Básico";
  }
};

const mapBackendSkill = (skill: BackendSkill): Skill => ({
  id: String(skill.id),
  name: skill.name,
  category: translateTypeToCategory(skill.type),
  level: translateProficiencyToLevel(skill.proficiency_level),
});

export const SkillsList: React.FC = () => {
  // ==========================================
  // LOGIC: State Management (Mocked)
  // ==========================================

  // 1. Manage the list of skills in state
  const [skills, setSkills] = useState<Skill[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = "/login";
      return;
    }

    const loadSkills = async () => {
      try {
        const token = await getToken();
        const res = await fetch(`${API_URL}/skills`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.message ?? "Error cargando habilidades");
        }

        const backendSkills: BackendSkill[] = [
          ...(data.technical ?? []),
          ...(data.soft ?? []),
        ];

        setSkills(backendSkills.map(mapBackendSkill));
      } catch (err) {
        console.error('Error cargando habilidades:', err);
        setError(err instanceof Error ? err : new Error('Error cargando habilidades'));
        setSkills([]);
      }
    };

    loadSkills();
  }, [getToken, isLoaded, isSignedIn]);

  // 2. Form state for the inputs
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel | "">("");
  const [newSkillCategory, setNewSkillCategory] = useState<
    "Técnica" | "Blanda" | ""
  >("");
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 3. Handler to add a new skill to the list
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isAddingSkill) return;
    if (!newSkillName.trim() || !newSkillCategory || !newSkillLevel) return;
    if (!isLoaded || !isSignedIn) return;

    // Frontend validation
    const trimmedName = newSkillName.trim();
    const hasLetter = /[a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/i.test(trimmedName);
    const allowedCharsRegex = /^[a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ\s\+\#\.\-\/_@&:\(\),]+$/i;
    const isAllowedChars = allowedCharsRegex.test(trimmedName);

    const generalErrorMessage = "El nombre de la habilidad no es válido o contiene caracteres extraños.";

    if (!hasLetter || !isAllowedChars) {
      setValidationError(generalErrorMessage);
      return;
    }

    // Check for 5 or more consecutive digits
    if (/\d{5,}/.test(trimmedName)) {
      setValidationError(generalErrorMessage);
      return;
    }

    // Check letter ratio (must be at least 30% letters of alphanumeric characters)
    const alphanumericChars = trimmedName.replace(/[^a-zA-Z0-9áéíóúüñÁÉÍÓÚÜÑ]/g, "");
    const letterChars = trimmedName.replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, "");
    if (alphanumericChars.length > 0 && (letterChars.length / alphanumericChars.length) < 0.3) {
      setValidationError(generalErrorMessage);
      return;
    }

    try {
      setIsAddingSkill(true);
      setValidationError(null);

      const token = await getToken();

      const body = {
        name: trimmedName,
        type: translateCategoryToType(newSkillCategory),
        proficiency_level: translateLevelToProficiency(newSkillLevel),
      };

      const res = await fetch(`${API_URL}/skills`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data?.errors?.name?.[0] || data?.message || "Error creando habilidad";
        throw new Error(errorMsg);
      }

      const createdSkill = mapBackendSkill(data.data);

      setSkills((current) => [...current, createdSkill]);
      setNewSkillName("");
      setNewSkillCategory("");
      setNewSkillLevel("");
    } catch (error) {
      console.error("Error creando habilidad:", error);
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError("Ocurrió un error al agregar la habilidad.");
      }
    } finally {
      setIsAddingSkill(false);
    }
  };

  // 4. Handler to initiate removal (opens confirmation modal)
  const handleInitiateRemove = (idToRemove: string) => {
    const skill = skills.find((s) => s.id === idToRemove);
    if (skill) {
      setSkillToDelete(skill);
    }
  };

  // 5. Handler to confirm removal
  const handleConfirmRemove = async () => {
    if (!skillToDelete) return;

    try {
      setIsDeleting(true);
      const idToRemove = skillToDelete.id;

      if (!isLoaded || !isSignedIn) {
        setSkills(skills.filter((skill) => skill.id !== idToRemove));
        setSkillToDelete(null);
        return;
      }

      const token = await getToken();
      const res = await apiFetch(
        `${API_URL}/skills/${idToRemove}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? "Error eliminando habilidad");
      }

      setSkills(skills.filter((skill) => skill.id !== idToRemove));
      setSkillToDelete(null);
    } catch (error) {
      console.error("Error eliminando habilidad:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Derived state for filtering categories
  const technicalSkills = skills.filter(s => s.category === 'Técnica');
  const softSkills = skills.filter(s => s.category === 'Blanda');

  if (error) {
    throw error;
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Blocks className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Gestor de Habilidades
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Añade y categoriza tus competencias profesionales.
            </p>
          </div>
        </div>
      </div>

      {/* Add New Skill Form */}
      <div className="bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <form
          onSubmit={handleAddSkill}
          className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
        >
          <div className="md:col-span-5 space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nombre de la Habilidad
            </label>
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => {
                setNewSkillName(e.target.value);
                setValidationError(null);
              }}
              placeholder="Ej. GraphQL, Figma, Kubernetes..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <CustomDropdown
            label="Categoría"
            value={newSkillCategory}
            onChange={(val) => setNewSkillCategory(val as "Técnica" | "Blanda")}
            options={[
              { value: "Técnica", label: "Habilidad Técnica" },
              { value: "Blanda", label: "Habilidad Blanda" },
            ]}
            placeholder="Seleccionar Categoría"
            className="md:col-span-3 transition-all"
          />

          <CustomDropdown
            label="Nivel Dominio"
            value={newSkillLevel}
            onChange={(val) => setNewSkillLevel(val as SkillLevel)}
            options={[
              { value: "Experto", label: "🟣 Experto" },
              { value: "Avanzado", label: "🟠 Avanzado" },
              { value: "Intermedio", label: "🟢 Intermedio" },
              { value: "Básico", label: "🔴 Básico" },
            ]}
            placeholder="Seleccionar Nivel"
            className="md:col-span-2 transition-all"
          />

          <Button
            variant="primary"
            icon={isAddingSkill ? undefined : Plus}
            type="submit"
            className="md:col-span-2 py-3 w-full"
            disabled={
              isAddingSkill ||
              !newSkillName.trim() ||
              !newSkillCategory ||
              !newSkillLevel
            }
          >
            {isAddingSkill ? "Cargando..." : "Añadir"}
          </Button>
        </form>
        {validationError && (
          <p className="mt-3 text-sm text-red-500 dark:text-red-400 font-medium">
            {validationError}
          </p>
        )}
      </div>

      {/* Skills Display Grids */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SkillCard
          title="Hard Skills (Técnicas)"
          icon={Code2}
          skills={technicalSkills}
          onRemoveSkill={handleInitiateRemove}
          emptyMessage="Usa el formulario superior para añadir habilidades técnicas."
        />

        <SkillCard
          title="Soft Skills (Blandas)"
          icon={BrainCircuit}
          skills={softSkills}
          onRemoveSkill={handleInitiateRemove}
          emptyMessage="No hay habilidades blandas registradas."
        />
      </div>

      <ConfirmModal
        isOpen={skillToDelete !== null}
        title="Eliminar Habilidad"
        message={`¿Estás seguro de que deseas eliminar la habilidad "${skillToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmRemove}
        onCancel={() => setSkillToDelete(null)}
        loading={isDeleting}
        variant="danger"
        icon={<Trash2 className="h-5 w-5" />}
      />
    </div>
  );
};

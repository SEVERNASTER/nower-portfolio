import React, { useEffect, useState } from "react";
import { Plus, FolderOpen, ArrowLeft } from "lucide-react";
import { useAuth } from "@clerk/clerk-react"; // 1. Importar el hook de Clerk
import { Button } from "../../components/ui/Button";
import type { Project, Skill } from "../../data/mockData";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectForm } from "./components/ProjectForm";

export const ProjectsList: React.FC = () => {
  const { getToken } = useAuth(); // 2. Obtener la función para el token
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  // CARGAR SKILLS
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const token = await getToken(); // 3. Obtener token actual
        const res = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${token}`, // Enviamos el token
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        const allSkills = [...(data.technical || []), ...(data.soft || [])];
        setAvailableSkills(allSkills);
      } catch (err) {
        console.error("Error cargando skills:", err);
      }
    };
    loadSkills();
  }, [getToken]);

  // CREAR PROYECTO
  const handleCreateProject = async (newData: any) => {
    try {
      const token = await getToken();
      const response = await fetch("http://localhost:8000/api/projects", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`, // Enviamos el token
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const savedProject = await response.json();
        setProjects([...projects, savedProject]);
        setIsAdding(false);
      }
    } catch (e) {
      console.error("Error creando proyecto:", e);
    }
  };

  // CARGAR PROYECTOS
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Error cargando proyectos");
        setProjects(data as Project[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando proyectos");
        setProjects([]);
      }
    };
    loadProjects();
  }, [getToken]);

  // SI ESTÁ AÑADIENDO: Muestra el formulario
  if (isAdding) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsAdding(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Nuevo Proyecto
          </h2>
        </div>
        <ProjectForm
          availableSkills={availableSkills.filter(
            (s) => s.category === "Técnica",
          )}
          onSubmit={handleCreateProject}
          onCancel={() => setIsAdding(false)}
        />
      </div>
    );
  }

  // SI NO ESTÁ AÑADIENDO: Muestra la lista
  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400">
            <FolderOpen className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Proyectos
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evidencia tu experiencia práctica.
            </p>
          </div>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setIsAdding(true)}>
          Nuevo Proyecto
        </Button>
      </div>

      {error && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project: Project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        <button
          onClick={() => setIsAdding(true)}
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 min-h-[250px] hover:border-emerald-500 transition-all group"
        >
          <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-[#10221C] flex items-center justify-center mb-4 text-slate-500 group-hover:text-emerald-500 transition-all">
            <Plus className="h-6 w-6" />
          </div>
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-emerald-600">
            Añadir Proyecto
          </span>
        </button>
      </div>
    </div>
  );
};

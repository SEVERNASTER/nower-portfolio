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
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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

        // Mapear skills del backend al formato del frontend
        const mapSkills = (skills: any[]) =>
          skills.map((s: any) => ({
            id: s.id.toString(),
            name: s.name,
            category: (s.type === "technical" ? "Técnica" : "Blanda") as
              | "Técnica"
              | "Blanda",
            level: (s.proficiency_level <= 2
              ? "Básico"
              : s.proficiency_level <= 3
                ? "Intermedio"
                : s.proficiency_level <= 4
                  ? "Avanzado"
                  : "Experto") as
              | "Básico"
              | "Intermedio"
              | "Avanzado"
              | "Experto",
          }));

        const allSkills = [
          ...mapSkills(data.technical || []),
          ...mapSkills(data.soft || []),
        ];
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
        const mappedProject: Project = {
          id: savedProject.id.toString(),
          title: savedProject.title,
          description: savedProject.description || "",
          status: "BORRADOR",
          tags: savedProject.tags || [],
          repositoryUrl: savedProject.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          createdAt: savedProject.created_at || new Date().toISOString(),
        };
        setProjects([...projects, mappedProject]);
        setIsAdding(false);
        setEditingProject(null);
      }
    } catch (e) {
      console.error("Error creando proyecto:", e);
    }
  };

  // ACTUALIZAR PROYECTO
  const handleUpdateProject = async (newData: any) => {
    if (!editingProject) return;
    
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/projects/${editingProject.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        const mappedProject: Project = {
          id: updatedProject.id.toString(),
          title: updatedProject.title,
          description: updatedProject.description || "",
          status: "BORRADOR",
          tags: updatedProject.tags || [],
          repositoryUrl: updatedProject.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          createdAt: updatedProject.created_at || new Date().toISOString(),
        };
        setProjects(projects.map(p => p.id === editingProject.id ? mappedProject : p));
        setIsAdding(false);
        setEditingProject(null);
      }
    } catch (e) {
      console.error("Error actualizando proyecto:", e);
    }
  };

  // ELIMINAR PROYECTO
  const handleDeleteProject = async (id: string) => {
    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setProjects(projects.filter(p => p.id !== id));
      }
    } catch (e) {
      console.error("Error eliminando proyecto:", e);
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
        
        // Mapear proyectos del backend al formato del frontend
        const mappedProjects: Project[] = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.title,
          description: p.description || "",
          status: "BORRADOR", // Por defecto, el backend no tiene status
          tags: p.tags || [],
          repositoryUrl: p.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          createdAt: p.created_at || new Date().toISOString(),
        }));
        setProjects(mappedProjects);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Error cargando proyectos");
        setProjects([]);
      }
    };
    loadProjects();
  }, [getToken]);

  // SI ESTÁ AÑADIENDO O EDITANDO: Muestra el formulario
  if (isAdding) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setIsAdding(false);
              setEditingProject(null);
            }}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
          >
            <ArrowLeft className="h-6 w-6 text-slate-600 dark:text-slate-400" />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {editingProject ? "Editar Proyecto" : "Nuevo Proyecto"}
          </h2>
        </div>
        <ProjectForm
          availableSkills={availableSkills.filter(
            (s) =>
              s.category === "Técnica" ||
              s.category?.toLowerCase() === "Tecnica" ||
              s.category?.toLowerCase() === "Technical",
          )}
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={() => {
            setIsAdding(false);
            setEditingProject(null);
          }}
          initialData={editingProject || undefined}
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
          <ProjectCard
            key={project.id}
            project={project}
            onEdit={(p) => {
              setEditingProject(p);
              setIsAdding(true);
            }}
            onDelete={(id) => handleDeleteProject(id)}
          />
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

import React, { useEffect, useState } from "react";
import { Plus, ArrowLeft, Folder } from "lucide-react";
import { useAuth } from "@clerk/clerk-react"; // 1. Importar el hook de Clerk
import { Button } from "../../components/ui/Button";
import type { Project, Skill } from "../../data/mockData";
import { ProjectCard } from "./components/ProjectCard";
import { ProjectForm } from "./components/ProjectForm";
import { ConfirmModal } from "./components/ConfirmModal";

export const ProjectsList: React.FC = () => {
  const { getToken } = useAuth(); // 2. Obtener la función para el token
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const buildFormData = (projectData: any) => {
    const formData = new FormData();
    formData.append('title', projectData.title);
    formData.append('description', projectData.description);

    if (projectData.evidence_url) {
      formData.append('evidence_url', projectData.evidence_url);
    }

    if (projectData.tags?.length) {
      projectData.tags.forEach((tag: string) => formData.append('tags[]', tag));
    }

    if (projectData.links?.length) {
      projectData.links.forEach((link: any, index: number) => {
        formData.append(`links[${index}][platform_name]`, link.platform_name);
        formData.append(`links[${index}][url]`, link.url);
      });
    }

    if (projectData.images?.length) {
      projectData.images.forEach((file: File) => {
        formData.append('images[]', file);
      });
    }

    if (projectData.remove_image_ids?.length) {
      projectData.remove_image_ids.forEach((id: string | number) => {
        formData.append('remove_image_ids[]', id.toString());
      });
    }

    return formData;
  };

  // CARGAR SKILLS
  useEffect(() => {
    const loadSkills = async () => {
      try {
        const token = await getToken(); // 3. Obtener token actual
        const res = await fetch("http://localhost:8000/api/skills", {
          headers: {
            Authorization: `Bearer ${token}`, // Enviamos el token
            "Content-Type": "application/json",
            Accept: "application/json",
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
          Accept: "application/json",
        },
        body: buildFormData(newData),
      });

      if (response.ok) {
        const savedProject = await response.json();
        const mappedProject: Project = {
          id: savedProject.id.toString(),
          title: savedProject.title,
          description: savedProject.description || "",
          tags: savedProject.tags || [],
          repositoryUrl: savedProject.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          imageUrls: savedProject.images?.map((image: any) => image.url) || [],
          images: savedProject.images?.map((image: any) => ({
            id: image.id.toString(),
            url: image.url,
            public_id: image.public_id,
          })) || [],
          links: savedProject.links || [],
          createdAt: savedProject.created_at || new Date().toISOString(),
        };
        setProjects([...projects, mappedProject]);
        setIsAdding(false);
        setEditingProject(null);
      } else {
        const errorData = await response.json();
        console.error("Error del backend al crear:", errorData);
        alert(
          `Error al guardar: ${errorData.message || JSON.stringify(errorData.errors)}`,
        );
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
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Accept": "application/json",
        },
        body: (() => {
          const formData = buildFormData(newData);
          formData.append('_method', 'PUT');
          return formData;
        })(),
      });

      if (response.ok) {
        const updatedProject = await response.json();
        const mappedProject: Project = {
          id: updatedProject.id.toString(),
          title: updatedProject.title,
          description: updatedProject.description || "",
          tags: updatedProject.tags || [],
          repositoryUrl: updatedProject.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          imageUrls: updatedProject.images?.map((image: any) => image.url) || [],
          images: updatedProject.images?.map((image: any) => ({
            id: image.id.toString(),
            url: image.url,
            public_id: image.public_id,
          })) || [],
          links: updatedProject.links || [],
          createdAt: updatedProject.created_at || new Date().toISOString(),
        };
        setProjects(
          projects.map((p) => (p.id === editingProject.id ? mappedProject : p)),
        );
        setIsAdding(false);
        setEditingProject(null);
      } else {
        const errorData = await response.json();
        console.error("Error del backend al actualizar:", errorData);
        alert(
          `Error al actualizar: ${errorData.message || JSON.stringify(errorData.errors)}`,
        );
      }
    } catch (e) {
      console.error("Error actualizando proyecto:", e);
    }
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const token = await getToken();
      const response = await fetch(
        `http://localhost:8000/api/projects/${projectToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      if (response.ok) {
        setProjects(projects.filter((p) => p.id !== projectToDelete.id));
      }
    } catch (e) {
      console.error("Error eliminando proyecto:", e);
    } finally {
      setDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  // CARGAR PROYECTOS
  useEffect(() => {
    const loadProjects = async () => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const res = await fetch("http://localhost:8000/api/projects", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
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
          tags: p.tags || [],
          repositoryUrl: p.evidence_url || undefined,
          liveUrl: undefined,
          imageUrl: undefined,
          imageUrls: p.images?.map((image: any) => image.url) || [],
          images: p.images?.map((image: any) => ({
            id: image.id.toString(),
            url: image.url,
            public_id: image.public_id,
          })) || [],
          links: p.links || [],
          createdAt: p.created_at || new Date().toISOString(),
        }));
        setProjects(mappedProjects);
      } finally {
        setIsLoading(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Folder className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Proyectos
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Evidencia tu experiencia practica
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Añadir Proyecto
        </Button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="relative">
            <div className="h-16 w-16 rounded-full border-4 border-slate-100 dark:border-slate-800"></div>
            <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 animate-pulse"></div>
          </div>
          <p className="mt-6 text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
            Sincronizando tus proyectos...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center text-center py-12">
          <Folder className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            No tienes proyectos registrados
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Comienza añadiendo tu proyecto para evidenciar tu experiencia
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project: Project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => {
                setEditingProject(project);
                setIsAdding(true);
              }}
              onDelete={() => {
                setProjectToDelete({ id: project.id, title: project.title });
                setDeleteModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que deseas eliminar "${projectToDelete?.title}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
      />
    </div>
  );
};

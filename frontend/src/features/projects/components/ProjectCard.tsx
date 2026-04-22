import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import type { Project } from "../../../data/mockData";

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="flex flex-col rounded-2xl bg-white dark:bg-[#17262C] p-6 border border-slate-200 dark:border-slate-800/60 shadow-sm hover:border-emerald-500 transition-colors group">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md ${
            project.status === "PUBLICADO"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
          }`}
        >
          {project.status}
        </span>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setOpenMenu((prev) => !prev);
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#17262C] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg overflow-hidden z-10">

              <button
                onClick={() => {
                  setOpenMenu(false);
                  onEdit(project);
                }}
                className="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Editar
              </button>

              <button
                onClick={() => {
                  setOpenMenu(false);
                  onDelete(project.id);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
              >
                Eliminar
              </button>

            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors mb-2">
        {project.title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow">
        {project.description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
        {project.tags.map((tag: string) => (
          <span
            key={tag}
            className="px-2 py-1 bg-slate-100 dark:bg-[#10221C] text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md uppercase tracking-wider border border-slate-200 dark:border-slate-700/50"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};
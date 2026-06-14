import React, { useState } from "react";
import { MoreVertical, Tag, ExternalLink } from "lucide-react";
import type { Project } from "../../../data/mockData";
import { PlatformIcon, PREDEFINED_PLATFORMS } from "./PlatformIcon";

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
    <div className="flex flex-col rounded-2xl bg-white dark:bg-[#17262C] p-6 border border-slate-200 dark:border-slate-800/60 shadow-sm hover:shadow-md dark:hover:border-emerald-500 transition-all group">
      
      {/* Header */}
      <div className="flex items-center justify-end mb-4">
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

      {/* Image */}
      {project.imageUrls?.[0] || project.imageUrl ? (
        <div className="mb-5 overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800">
          <img
            src={project.imageUrls?.[0] || project.imageUrl}
            alt={project.title}
            className="h-48 w-full object-cover"
          />
        </div>
      ) : null}

      {/* Body */}
      <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors mb-2 break-words">
        {project.title}
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 flex-grow line-clamp-3 overflow-hidden break-words whitespace-pre-wrap">
        {project.description}
      </p>

      {/* Tags section */}
      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/60">
        <div className="flex items-center gap-1.5 mb-3 text-slate-400 dark:text-slate-500">
          <Tag className="h-3 w-3" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Tecnologías</span>
        </div>
        <div className="max-h-24 overflow-y-auto pr-1 custom-scrollbar-thin flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-[#10221C]/30 rounded-xl border border-slate-200/60 dark:border-slate-800/40">
          {project.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-1 bg-white dark:bg-[#17262C] text-slate-600 dark:text-slate-300 text-[10px] font-semibold rounded-md uppercase tracking-wider border border-slate-200 dark:border-slate-700/50 shadow-sm break-words max-w-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Links section */}
      {project.links && project.links.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-1.5 mb-3 text-slate-400 dark:text-slate-500">
            <ExternalLink className="h-3 w-3" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Enlaces de referencia</span>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3 p-2 bg-slate-100/50 dark:bg-[#10221C]/30 rounded-xl border border-slate-200/60 dark:border-slate-800/40">
            {project.links.map((link, idx) => {
              const isCustom = !PREDEFINED_PLATFORMS.includes(link.platform_name);
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={link.platform_name}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#17262C] hover:bg-slate-50 dark:hover:bg-[#10221C] text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-200 dark:border-slate-700/50 shadow-sm"
                >
                  <PlatformIcon platform={link.platform_name} className="h-4 w-4" />
                  {isCustom && (
                    <span className="text-xs font-semibold whitespace-nowrap">{link.platform_name}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
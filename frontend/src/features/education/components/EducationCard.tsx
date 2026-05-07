import React, { useState } from 'react';
import {
  MoreVertical,
  Calendar,
  Building2,
  GraduationCap,
  Pencil,
  Trash2,
  BookMarked,
} from 'lucide-react';
import type { Experience } from '../../experience/components/ExperienceCard';

export interface EducationCardProps {
  edu: Experience;
  onEdit?: (education: Experience) => void;
  onDelete?: (education: Experience) => void;
}

const statusStyles: Record<
  NonNullable<Experience['status']>,
  string
> = {
  'En curso':
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/25',
  Graduado:
    'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/25',
  Pausado:
    'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/25',
};

export const EducationCard: React.FC<EducationCardProps> = ({
  edu,
  onEdit,
  onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = edu.status ?? 'Graduado';

  return (
    <div className="relative rounded-2xl border border-teal-200/80 dark:border-teal-900/40 bg-gradient-to-br from-teal-50/90 via-white to-cyan-50/50 dark:from-[#0d1f24] dark:via-[#122a32] dark:to-[#0f252b] p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-700/50 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-600/25 dark:bg-teal-500 dark:shadow-teal-900/40">
          <GraduationCap className="h-7 w-7" aria-hidden />
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {edu.role}
                </h3>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyles[status]}`}
                >
                  <BookMarked className="h-3 w-3" />
                  {status}
                </span>
              </div>

              {edu.degree_type ? (
                <p className="text-sm font-semibold text-teal-800 dark:text-teal-300/90">
                  {edu.degree_type}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-teal-200/70 dark:border-teal-800/60 bg-white/70 dark:bg-black/20 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  {edu.company}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200/70 dark:border-cyan-900/50 bg-white/70 dark:bg-black/20 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Calendar className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                  {edu.startDate} — {edu.endDate}
                </span>
              </div>
            </div>

            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="p-2 text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 rounded-xl hover:bg-teal-500/10 transition-colors"
                aria-label="Opciones de formación"
              >
                <MoreVertical className="h-5 w-5" />
              </button>

              {menuOpen ? (
                <div className="absolute right-0 top-11 z-20 w-44 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.(edu);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                    Editar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.(edu);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {edu.description?.trim() ? (
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-teal-100 dark:border-teal-900/40 pt-3">
              {edu.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import { X, GraduationCap, Building2, Calendar, AlignLeft } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import {
  createEducation,
  updateEducation,
  monthInputToEndDate,
  monthInputToStartDate,
  type EducationCreatePayload,
  type EducationStatus,
} from "./educationApi";
import type { Experience } from "../experience/components/ExperienceCard";

const DEGREE_PRESETS = [
  "Licenciatura",
  "Maestría",
  "Doctorado",
  "Grado técnico",
  "Certificación",
] as const;

const OTRO = "Otro";

interface AddEducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (record: Experience) => void;
  educationToEdit?: Experience | null;
  existingEducation: Experience[];
}

function currentYearMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthGt(a: string, b: string): boolean {
  return a > b;
}

function rangesOverlapSameInstitution(
  institution: string,
  startIso: string,
  endIso: string | null,
  others: Experience[],
  excludeId?: string,
): boolean {
  const inst = institution.trim().toLowerCase();
  const s = new Date(startIso).setHours(0, 0, 0, 0);
  const e = endIso
    ? new Date(endIso).setHours(23, 59, 59, 999)
    : new Date().setHours(23, 59, 59, 999);

  for (const o of others) {
    if (excludeId && o.id === excludeId) continue;
    if (o.company.trim().toLowerCase() !== inst) continue;
    const rs = o.rawStartDate;
    if (!rs) continue;
    const os = new Date(rs).setHours(0, 0, 0, 0);
    const oe = o.rawEndDate
      ? new Date(o.rawEndDate).setHours(23, 59, 59, 999)
      : new Date().setHours(23, 59, 59, 999);
    if (s <= oe && os <= e) return true;
  }
  return false;
}

export const AddEducationModal: React.FC<AddEducationModalProps> = ({
  isOpen,
  onClose,
  onSaved,
  educationToEdit,
  existingEducation,
}) => {
  const { getToken } = useAuth();
  const [institution, setInstitution] = useState("");
  const [title, setTitle] = useState("");
  const [degreePreset, setDegreePreset] = useState<string>(DEGREE_PRESETS[0]);
  const [degreeCustom, setDegreeCustom] = useState("");
  const [status, setStatus] = useState<EducationStatus>("Graduado");
  const [startMonth, setStartMonth] = useState("");
  const [endMonth, setEndMonth] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isEditing = Boolean(educationToEdit);
  const endDisabled = status === "En curso";

  const resetForm = () => {
    setInstitution("");
    setTitle("");
    setDegreePreset(DEGREE_PRESETS[0]);
    setDegreeCustom("");
    setStatus("Graduado");
    setStartMonth("");
    setEndMonth("");
    setDescription("");
    setFieldErrors({});
    setSubmitError(null);
  };

  const dateToMonthInput = (date?: string | null) => {
    if (!date) return "";
    return date.slice(0, 7);
  };

  const fillForEdit = (edu: Experience) => {
    setInstitution(edu.company ?? "");
    setTitle(edu.role ?? "");
    const dt = edu.degree_type?.trim() ?? "";
    if (dt && (DEGREE_PRESETS as readonly string[]).includes(dt)) {
      setDegreePreset(dt);
      setDegreeCustom("");
    } else if (dt) {
      setDegreePreset(OTRO);
      setDegreeCustom(dt);
    } else {
      setDegreePreset(DEGREE_PRESETS[0]);
      setDegreeCustom("");
    }
    setStatus(edu.status ?? "Graduado");
    setStartMonth(dateToMonthInput(edu.rawStartDate));
    setEndMonth(dateToMonthInput(edu.rawEndDate));
    setDescription(edu.description ?? "");
    setFieldErrors({});
    setSubmitError(null);
  };

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      if (educationToEdit) fillForEdit(educationToEdit);
      else resetForm();
    } else {
      const t = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, educationToEdit]);

  useEffect(() => {
    if (status === "En curso") {
      setEndMonth("");
    }
  }, [status]);

  const clearField = (key: string) => {
    setFieldErrors((prev) => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  };

  const resolveDegreeType = (): string | null => {
    if (degreePreset === OTRO) {
      return degreeCustom.trim() || null;
    }
    return degreePreset;
  };

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    const inst = institution.trim();
    const tit = title.trim();
    const capYm = currentYearMonth();

    if (!inst) errs.institution = "La institución es obligatoria.";
    else if (inst.length < 3)
      errs.institution = "Indica al menos 3 caracteres para la institución.";

    if (!tit) errs.title = "El título o grado es obligatorio.";
    else if (tit.length < 2)
      errs.title = "El título debe tener al menos 2 caracteres.";

    const dt = resolveDegreeType();
    if (!dt) errs.degree_type = "Selecciona o describe el tipo de grado.";

    if (!startMonth) errs.start_month = "La fecha de inicio es obligatoria.";
    else if (startMonth > capYm)
      errs.start_month = "La fecha de inicio no puede ser futura.";

    if (!endDisabled) {
      if (!endMonth)
        errs.end_month = "La fecha de fin es obligatoria para este estado.";
      else {
        if (startMonth && endMonth) {
          const start = new Date(`${startMonth}-01`);
          const end = new Date(`${endMonth}-01`);

          if (end <= start) {
            errs.end_month =
              "La fecha de fin debe ser posterior a la de inicio.";
          }
        }
      }
    }

    const startDate = monthInputToStartDate(startMonth);
    const endDate = endDisabled ? null : monthInputToEndDate(endMonth);

    if (
      startDate &&
      !endDisabled &&
      endDate &&
      rangesOverlapSameInstitution(
        inst,
        startDate,
        endDate,
        existingEducation,
        educationToEdit?.id,
      )
    ) {
      errs.start_month =
        "Las fechas se solapan con otra formación en la misma institución.";
    }

    if (
      startDate &&
      endDisabled &&
      rangesOverlapSameInstitution(
        inst,
        startDate,
        null,
        existingEducation,
        educationToEdit?.id,
      )
    ) {
      errs.start_month =
        "Las fechas se solapan con otra formación en la misma institución.";
    }

    return errs;
  };

  const handleClose = () => {
    if (!saving) {
      resetForm();
      onClose();
    }
  };

  const handleSave = async () => {
    setSubmitError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const startDate = monthInputToStartDate(startMonth)!;
    const endDate = endDisabled ? null : monthInputToEndDate(endMonth)!;

    const payload: EducationCreatePayload = {
      institution: institution.trim(),
      title: title.trim(),
      degree_type: resolveDegreeType()!,
      status,
      start_date: startDate,
      end_date: endDate,
      description: description.trim() ? description.trim() : null,
    };

    setSaving(true);
    try {
      const token = await getToken();
      if (!token) {
        setSubmitError("Sesión no válida.");
        return;
      }

      let saved: Experience;
      if (educationToEdit) {
        saved = await updateEducation(token, educationToEdit.id, payload);
      } else {
        saved = await createEducation(token, payload);
      }

      resetForm();
      onSaved?.(saved);
      onClose();
    } catch (err: unknown) {
      const e = err as Error & { validationErrors?: Record<string, string> };
      if (e.validationErrors && Object.keys(e.validationErrors).length > 0) {
        const mapped: Record<string, string> = {};
        for (const [k, v] of Object.entries(e.validationErrors)) {
          if (k === "start_date") mapped.start_month = v;
          else if (k === "end_date") mapped.end_month = v;
          else mapped[k] = v;
        }
        setFieldErrors((prev) => ({ ...prev, ...mapped }));
      }
      if (e instanceof Error) {
        setSubmitError(
          e.message?.trim()
            ? e.message
            : "No se pudo guardar la formación académica.",
        );
      } else {
        setSubmitError("No se pudo guardar la formación académica.");
      }
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
        aria-hidden
      />

      <div
        className={`relative w-full max-w-2xl bg-white dark:bg-[#0B1120] rounded-3xl shadow-2xl border border-teal-200/60 dark:border-teal-900/40 flex flex-col max-h-[90vh] transition-all duration-300 transform ${isOpen ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}`}
      >
        <div className="flex items-center justify-between p-6 border-b border-teal-100 dark:border-teal-900/40">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white dark:bg-teal-500">
              <GraduationCap className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {isEditing
                ? "Editar formación académica"
                : "Añadir formación académica"}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Institución <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => {
                      setInstitution(e.target.value);
                      clearField("institution");
                    }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    placeholder="Universidad o centro de estudios"
                  />
                </div>
                {fieldErrors.institution ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.institution}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Título / Grado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearField("title");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm outline-none focus:border-teal-500 text-slate-900 dark:text-white"
                  placeholder="Ej. Ingeniería de Sistemas"
                />
                {fieldErrors.title ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.title}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Tipo de grado <span className="text-red-500">*</span>
                </label>
                <select
                  value={degreePreset}
                  onChange={(e) => {
                    setDegreePreset(e.target.value);
                    clearField("degree_type");
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
                >
                  {DEGREE_PRESETS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                  <option value={OTRO}>{OTRO}</option>
                </select>
                {degreePreset === OTRO ? (
                  <input
                    type="text"
                    value={degreeCustom}
                    onChange={(e) => {
                      setDegreeCustom(e.target.value);
                      clearField("degree_type");
                    }}
                    placeholder="Describe el tipo de grado"
                    className="mt-2 w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm outline-none focus:border-teal-500 text-slate-900 dark:text-white"
                  />
                ) : null}
                {fieldErrors.degree_type ? (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {fieldErrors.degree_type}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as EducationStatus)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
                >
                  <option value="En curso">En curso</option>
                  <option value="Graduado">Graduado</option>
                  <option value="Pausado">Pausado</option>
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha de inicio <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="month"
                      value={startMonth}
                      max={currentYearMonth()}
                      onChange={(e) => {
                        setStartMonth(e.target.value);
                        clearField("start_month");
                      }}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none focus:border-teal-500"
                    />
                  </div>
                  {fieldErrors.start_month ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {fieldErrors.start_month}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Fecha de fin{" "}
                    {!endDisabled ? (
                      <span className="text-red-500">*</span>
                    ) : null}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    <input
                      type="month"
                      value={endMonth}
                      max={currentYearMonth()}
                      onChange={(e) => {
                        setEndMonth(e.target.value);
                        clearField("end_month");
                      }}
                      disabled={endDisabled}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm outline-none ${
                        endDisabled
                          ? "bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed border-slate-200 dark:border-slate-800"
                          : "bg-slate-50 dark:bg-[#111827] text-slate-900 dark:text-white border-slate-300 dark:border-slate-800 focus:border-teal-500"
                      }`}
                    />
                  </div>
                  {endDisabled ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No aplica mientras el estado sea «En curso».
                    </p>
                  ) : null}
                  {fieldErrors.end_month ? (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      {fieldErrors.end_month}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Descripción (opcional)
              </label>
              <div className="relative">
                <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-[#111827] text-sm text-slate-900 dark:text-white outline-none resize-none focus:border-teal-500"
                />
              </div>
            </div>

            {submitError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {submitError}
              </div>
            ) : null}
          </form>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-teal-100 dark:border-teal-900/40 bg-slate-50/80 dark:bg-[#071018] rounded-b-3xl">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-60"
          >
            {saving ? "Guardando…" : isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

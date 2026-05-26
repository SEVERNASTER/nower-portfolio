import React, { useEffect, useState, useRef } from "react";
import { X, Upload, FileText, Award, Building2, Calendar, AlignLeft, Clock } from "lucide-react";
import { Button } from "../../../components/ui/Button";

export interface AchievementFile {
  id: string;
  url: string;
  mime_type?: string;
}

interface AchievementFormValues {
  title?: string;
  institution?: string;
  obtained_at?: string;
  hours?: number | null;
  description?: string;
}

interface SelectedFile {
  file: File;
  type: 'image' | 'pdf';
  previewUrl?: string;
}

interface AchievementFormProps {
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  defaultValues?: AchievementFormValues;
  initialFiles?: AchievementFile[];
  achievementId?: string;
}

export const AchievementForm: React.FC<AchievementFormProps> = ({
  onSubmit,
  onCancel,
  defaultValues,
  initialFiles = [],
  achievementId,
}) => {
  const [title, setTitle] = useState(defaultValues?.title ?? "");
  const [institution, setInstitution] = useState(defaultValues?.institution ?? "");
  const [obtainedAt, setObtainedAt] = useState(defaultValues?.obtained_at ?? "");
  const [hours, setHours] = useState(
    defaultValues?.hours != null && defaultValues.hours > 0 ? String(defaultValues.hours) : ""
  );
  const [description, setDescription] = useState(defaultValues?.description ?? "");
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [existingFiles, setExistingFiles] = useState<AchievementFile[]>(initialFiles);
  const [removedFileIds, setRemovedFileIds] = useState<string[]>([]);
  const [alert, setAlert] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{
    title?: string;
    institution?: string;
    obtainedAt?: string;
    hours?: string;
    description?: string;
    evidence?: string;
  }>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf'];
  const maxSize = 2 * 1024 * 1024; // 2MB — mismo límite que foto de perfil

  useEffect(() => {
    setExistingFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    setTitle(defaultValues?.title ?? "");
    setInstitution(defaultValues?.institution ?? "");
    setObtainedAt(defaultValues?.obtained_at ?? "");
    setHours(
      defaultValues?.hours != null && defaultValues.hours > 0 ? String(defaultValues.hours) : ""
    );
    setDescription(defaultValues?.description ?? "");
    setSelectedFiles([]);
    setRemovedFileIds([]);
  }, [defaultValues]);

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'archivo');
    } catch {
      return url.split('/').pop() || 'archivo';
    }
  };

  const getPreviewFile = () => {
    const selectedImage = selectedFiles.find((file) => file.type === 'image');
    if (selectedImage) {
      return {
        url: selectedImage.previewUrl ?? '',
        type: 'image' as const,
        name: selectedImage.file.name,
      };
    }

    if (selectedFiles.length > 0) {
      return {
        url: selectedFiles[0].previewUrl ?? '',
        type: selectedFiles[0].type,
        name: selectedFiles[0].file.name,
      };
    }

    const existingImage = existingFiles.find((file) => file.mime_type?.startsWith('image/'));
    if (existingImage) {
      return {
        url: existingImage.url,
        type: 'image' as const,
        name: getFileName(existingImage.url),
      };
    }

    if (existingFiles.length > 0) {
      return {
        url: existingFiles[0].url,
        type: existingFiles[0].mime_type?.startsWith('image/') ? 'image' as const : 'pdf' as const,
        name: getFileName(existingFiles[0].url),
      };
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const nextFiles: SelectedFile[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        errors.push(`El archivo ${file.name} no tiene un formato permitido.`);
        return;
      }
      if (file.size > maxSize) {
        errors.push(`El archivo ${file.name} excede el tamaño máximo de 2 MB.`);
        return;
      }

      const type = file.type.startsWith('image/') ? 'image' : 'pdf';
      const selectedFile: SelectedFile = { file, type };

      if (type === 'image') {
        selectedFile.previewUrl = URL.createObjectURL(file);
      }

      nextFiles.push(selectedFile);
    });

    if (errors.length > 0) {
      setAlert({
        type: 'error',
        message: errors.join(' '),
      });
    }

    if (nextFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...nextFiles]);
      setAlert({
        type: 'success',
        message: `${nextFiles.length} archivo(s) agregado(s).`,
      });
    }

    e.target.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      const [removed] = next.splice(index, 1);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return next;
    });
    setAlert({
      type: 'info',
      message: 'Archivo eliminado de la selección.',
    });
  };

  const removeExistingFile = (id: string) => {
    setExistingFiles((prev) => prev.filter((file) => file.id !== id));
    setRemovedFileIds((prev) => [...prev, id]);
    setAlert({
      type: 'info',
      message: 'Archivo existente eliminado.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: any = {};

    if (!title.trim()) newErrors.title = 'El título es obligatorio';
    else if (title.length > 100) newErrors.title = 'El título no puede exceder 100 caracteres';
    if (!institution.trim()) newErrors.institution = 'La institución es obligatoria';
    else if (institution.length > 70) newErrors.institution = 'La institución no puede exceder 70 caracteres';
    if (!obtainedAt) newErrors.obtainedAt = 'La fecha de obtención es obligatoria';
    if (hours.trim()) {
      const parsedHours = Number(hours);
      if (!Number.isInteger(parsedHours) || parsedHours < 1 || parsedHours > 9999) {
        newErrors.hours = 'Ingresa un número entero entre 1 y 9999 horas';
      }
    }
    if (description.length > 500) newErrors.description = 'La descripción no puede exceder 500 caracteres';
    if (existingFiles.length + selectedFiles.length === 0) newErrors.evidence = 'Debes agregar al menos un archivo de evidencia';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('institution', institution.trim());
      formData.append('obtained_at', obtainedAt);
      if (hours.trim()) {
        formData.append('hours', hours.trim());
      } else if (achievementId) {
        formData.append('hours', '');
      }
      if (description.trim()) {
        formData.append('description', description.trim());
      }
      selectedFiles.forEach((fileEntry) => {
        formData.append('evidence[]', fileEntry.file);
      });
      removedFileIds.forEach((id) => {
        formData.append('remove_file_ids[]', id);
      });

      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewFile = getPreviewFile();
  const totalFiles = existingFiles.length + selectedFiles.length;
  const hasEvidence = totalFiles > 0;
  const isSaveDisabled = !title.trim() || !institution.trim() || !obtainedAt || !hasEvidence || isSubmitting;

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Título del Logro <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs font-semibold ${title.length > 90 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
            {title.length}/100
          </span>
        </div>
        <div className="relative">
          <Award className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={title}
            maxLength={100}
            onChange={(e) => setTitle(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.title ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
            placeholder="Ej: Certificación en Desarrollo Web"
          />
        </div>
        {errors.title && (
          <p className="text-xs text-red-500">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Institución <span className="text-red-500">*</span>
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
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.institution ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
            placeholder="Ej: Universidad Nacional, Google, etc."
          />
        </div>
        {errors.institution && (
          <p className="text-xs text-red-500">{errors.institution}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Fecha de Obtención <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="date"
            value={obtainedAt}
            max="9999-12-31"
            onChange={(e) => setObtainedAt(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.obtainedAt ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
          />
        </div>
        {errors.obtainedAt && (
          <p className="text-xs text-red-500">{errors.obtainedAt}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Duración del curso (horas)
        </label>
        <div className="relative">
          <Clock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="number"
            min={1}
            max={9999}
            step={1}
            value={hours}
            onChange={(e) => setHours(e.target.value.replace(/\D/g, '').slice(0, 4))}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.hours ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors`}
            placeholder="Ej: 120"
          />
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Opcional. Ejemplo: 120 horas de duración del curso o certificación.
        </p>
        {errors.hours && (
          <p className="text-xs text-red-500">{errors.hours}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Descripción <span className="text-red-500">*</span>
          </label>
          <span className={`text-xs font-semibold ${description.length > 450 ? "text-amber-500" : "text-slate-400 dark:text-slate-500"}`}>
            {description.length}/500
          </span>
        </div>
        <div className="relative">
          <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            rows={4}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${errors.description ? "border-red-500" : "border-slate-200 dark:border-slate-700"} bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors resize-none`}
            placeholder="Describe brevemente el logro..."
          />
        </div>
        {errors.description && (
          <p className="text-xs text-red-500">{errors.description}</p>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Evidencia (Certificado o Imagen) <span className="text-red-500">*</span>
        </label>

        {alert && (
          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${
              alert.type === 'success'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-200'
                : alert.type === 'error'
                  ? 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-200'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200'
            }`}
          >
            {alert.message}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#10221C] p-8 text-center text-slate-500 dark:text-slate-400 transition hover:border-emerald-500 hover:text-emerald-500"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white text-3xl shadow-sm transition group-hover:bg-emerald-700">
              <Upload className="h-8 w-8" />
            </div>
            <span className="mt-4 text-sm font-semibold">Agregar más evidencia</span>
            <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
              JPG, PNG, PDF • Máx 2 MB por archivo
            </span>
          </button>

          {previewFile && (
            <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#0F1920] shadow-sm">
              <div className="p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400 mb-3">Vista previa de la primera evidencia</p>
                {previewFile.type === 'image' ? (
                  <img
                    src={previewFile.url}
                    alt={previewFile.name}
                    className="h-48 w-full rounded-3xl object-cover"
                  />
                ) : (
                  <div className="flex h-24 items-center gap-3 rounded-3xl border border-slate-200/70 bg-slate-50 dark:border-slate-700/70 dark:bg-slate-900 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-800">
                      <FileText className="h-6 w-6 text-slate-500 dark:text-slate-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-[14rem]">{previewFile.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">PDF o archivo cargado</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(existingFiles.length > 0 || selectedFiles.length > 0) && (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Archivos ({existingFiles.length + selectedFiles.length})
              </p>
              {existingFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1920] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{getFileName(file.url)}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{file.mime_type?.startsWith('image/') ? 'Imagen guardada' : 'PDF guardado'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeExistingFile(file.id)}
                    className="rounded-full bg-slate-200 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              {selectedFiles.map((fileEntry, index) => (
                <div key={`${fileEntry.file.name}-${index}`} className="flex items-center justify-between rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1920] p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{fileEntry.file.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{fileEntry.type === 'image' ? 'Imagen' : 'PDF'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSelectedFile(index)}
                    className="rounded-full bg-slate-200 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-800"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {errors.evidence && (
            <p className="text-xs text-red-500">{errors.evidence}</p>
          )}
        </div>

        <input
          type="file"
          multiple
          accept="image/png,image/jpeg,application/pdf"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" disabled={isSaveDisabled}>
          {isSubmitting ? 'Guardando...' : 'Guardar Logro'}
        </Button>
      </div>
    </form>
  );
};
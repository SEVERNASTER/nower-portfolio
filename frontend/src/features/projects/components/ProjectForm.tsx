import React, { useState, useEffect, useRef } from "react";
import { X, Plus, ChevronDown } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Skill, Project } from "../../../data/mockData";
import { PlatformIcon, PREDEFINED_PLATFORMS } from "./PlatformIcon";

interface ProjectFormProps {
  availableSkills: Skill[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: Project;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  availableSkills,
  onSubmit,
  onCancel,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [techInput, setTechInput] = useState("");
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [links, setLinks] = useState<{ platform_name: string; url: string }[]>(initialData?.links || []);
  const [currentPlatform, setCurrentPlatform] = useState(PREDEFINED_PLATFORMS[0]);
  const [customPlatform, setCustomPlatform] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  // Actualizar estados cuando cambia initialData
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setTags(initialData.tags || []);
      setLinks(initialData.links || []);
    }
  }, [initialData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length === 0) {
      return;
    }

    setImages((prev) => [...prev, ...validFiles]);
    const previews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviewImages((prev) => [...prev, ...previews]);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const validateUrl = (url: string) => {
    if (!url) {
      setUrlError("");
      return true;
    }
    const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    
    if (pattern.test(url)) {
      setUrlError("");
      return true;
    } else {
      setUrlError("Enlace no válido");
      return false;
    }
  };

  const handleUrlChange = (val: string) => {
    setCurrentUrl(val);
    validateUrl(val);
  };

  const addLink = () => {
    if (urlError || !currentUrl.trim()) return;

    const finalPlatform = currentPlatform === "Otros" ? customPlatform.trim() : currentPlatform;
    if (finalPlatform && currentUrl.trim()) {
      setLinks([...links, { platform_name: finalPlatform, url: currentUrl.trim() }]);
      setCurrentPlatform(PREDEFINED_PLATFORMS[0]);
      setCustomPlatform("");
      setCurrentUrl("");
      setUrlError("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
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
      links,
      images,
      evidence_url: "",
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${tags.includes(skill.name)
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
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Otra tecnología (Ej: AWS, Docker...)"
            className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700"
          />

          <Button type="button" onClick={addTag} variant="secondary">
            <Plus className="h-5 w-5" />
          </Button>
        </div>

        {/* 👇 AHORA SÍ: abajo */}
        {tags.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Tecnologías seleccionadas:
            </p>

            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <div
                  key={tag}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full 
          bg-gradient-to-r from-emerald-500/10 to-emerald-500/20 
          text-emerald-700 dark:text-emerald-300 
          border border-emerald-500/20 
          text-xs font-semibold"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)}>
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Enlaces de Referencia
        </label>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Custom Dropdown */}
          <div className="relative sm:w-1/4" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-all hover:border-emerald-400"
            >
              <span className="flex items-center gap-2 truncate">
                <PlatformIcon platform={currentPlatform} className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <span className="truncate">{currentPlatform}</span>
              </span>
              <ChevronDown 
                className={`h-4 w-4 text-slate-400 transition-transform duration-300 ease-in-out ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`} 
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 w-full bottom-full mb-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17262C] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {PREDEFINED_PLATFORMS.map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => {
                        setCurrentPlatform(plat);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 p-2.5 text-left text-sm transition-colors ${
                        currentPlatform === plat 
                          ? "bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      <PlatformIcon platform={plat} className={`h-4 w-4 ${currentPlatform === plat ? "text-emerald-500" : "text-slate-400"}`} />
                      {plat}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {currentPlatform === "Otros" && (
            <input
              type="text"
              value={customPlatform}
              onChange={(e) => setCustomPlatform(e.target.value)}
              placeholder="Nombre de plataforma"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent dark:text-white outline-none focus:border-emerald-500 transition-colors sm:w-1/4"
            />
          )}

          <div className="flex-1 flex flex-col gap-1">
            <input
              type="text"
              value={currentUrl}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLink();
                }
              }}
              placeholder="https://..."
              className={`w-full p-2.5 rounded-xl border bg-transparent dark:text-white outline-none transition-colors ${
                urlError 
                  ? "border-red-500 focus:border-red-600" 
                  : "border-slate-200 dark:border-slate-700 focus:border-emerald-500"
              }`}
            />
            {urlError && (
              <span className="text-[10px] font-medium text-red-500 ml-1">
                {urlError}
              </span>
            )}
          </div>

          <Button type="button" onClick={addLink} variant="secondary" className="px-4">
            Añadir
          </Button>
        </div>

        <div className="mt-4">
          <input
            type="file"
            multiple
            accept="image/png,image/jpeg"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#10221C] p-6 text-center text-slate-500 dark:text-slate-400 transition hover:border-emerald-500 hover:text-emerald-500"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white text-2xl shadow-sm transition group-hover:bg-emerald-700">
                +
              </div>
              <span className="mt-4 text-sm font-semibold">Añadir imagen</span>
              <span className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                JPG, PNG
              </span>
            </button>

            {previewImages.map((src, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-[#0F1920] shadow-sm"
              >
                <img
                  src={src}
                  alt={`preview ${index + 1}`}
                  className="h-40 w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {links.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Enlaces añadidos:
            </p>
            <div className="flex flex-row flex-wrap gap-3">
              {links.map((link, index) => {
                const isCustom = !PREDEFINED_PLATFORMS.includes(link.platform_name);
                return (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-[#10221C] border border-slate-200 dark:border-slate-700/50 shadow-sm group"
                  >
                    <PlatformIcon platform={link.platform_name} className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    {isCustom && (
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {link.platform_name}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="text-slate-400 hover:text-red-500 transition-colors ml-1 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
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

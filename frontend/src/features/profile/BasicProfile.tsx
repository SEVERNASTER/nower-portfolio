import React, { useState, useEffect, useRef } from "react";
import { Camera, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { useUser } from "@clerk/clerk-react";
import { mockProfile } from "../../data/mockData";

type ProfileDto = {
  id: string;
  fullName: string;
  role: string;
  bio: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  status: "ACTIVO" | "INACTIVO";
};

// ==========================================
// BASIC PROFILE
// ==========================================

export const BasicProfile: React.FC = () => {
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [backendImageUrl, setBackendImageUrl] = useState<string | null>(null);

  // Cargar datos del usuario desde el backend
  const loadUserData = async () => {
    if (!user) return;

    try {
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const formData = new FormData();
      formData.append("clerk_id", user.id);
      formData.append("full_name", user.fullName || "");
      formData.append("email", email);

      const res = await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Cargar datos del formulario
        setForm({
          fullName: data.user.full_name || "",
          profession: data.user.profession || "",
          bio: data.user.bio || "",
        });

        // Cargar imagen del backend si existe
        if (data.user.imagen_profile) {
          setBackendImageUrl(data.user.imagen_profile);
          localStorage.setItem('userProfileImage', data.user.imagen_profile);
          
          // Notificar a otros componentes que la imagen cambió
          window.dispatchEvent(new CustomEvent('userImageChanged', { 
            detail: { imageUrl: data.user.imagen_profile } 
          }));
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      // Cargar imagen desde localStorage inicialmente
      const savedImage = localStorage.getItem('userProfileImage');
      if (savedImage) {
        setBackendImageUrl(savedImage);
      }

      // Cargar datos completos desde el backend
      loadUserData();
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Limpiar error del campo modificado en tiempo real
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.server) {
      setErrors((prev) => ({ ...prev, server: "" }));
    }
    setSuccess("");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("image")) {
      setErrors({ image: "Solo se permiten imágenes JPG o PNG" });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ image: "La imagen no puede exceder 2MB" });
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSuccess("");
    setErrors({});

    try {
      const formData = new FormData();
      
      const email = user.primaryEmailAddress?.emailAddress;
      if (!email) {
        setErrors({ server: "No se encontró email del usuario" });
        setLoading(false);
        return;
      }

      formData.append("clerk_id", user.id);
      formData.append("full_name", form.fullName);
      formData.append("email", email);
      formData.append("profession", form.profession);
      formData.append("bio", form.bio);

      if (selectedImage) {
        console.log("Enviando imagen:", selectedImage.name, selectedImage.size);
        formData.append("image", selectedImage);
      }

      const res = await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      const data = await res.json();
      console.log("Response:", res.status, data);

      if (!res.ok) {
        if (res.status === 422) {
           const newErrors: Record<string, string> = {};
           if (data.errors) {
               for (const key in data.errors) {
                   const formKey = key === 'full_name' ? 'fullName' : key;
                   newErrors[formKey] = data.errors[key][0];
               }
           }
           setErrors(newErrors);
        } else {
           setErrors({ server: data.message || data.error || "Ocurrió un error inesperado en el servidor." });
        }
        return;
      }

      // Actualizar imagen del servidor
      if (data.user?.imagen_profile) {
        setBackendImageUrl(data.user.imagen_profile);
        setPreviewImage(null);
        setSelectedImage(null);
        localStorage.setItem('userProfileImage', data.user.imagen_profile);
        
        // Notificar a otros componentes que la imagen cambió
        window.dispatchEvent(new CustomEvent('userImageChanged', { 
          detail: { imageUrl: data.user.imagen_profile } 
        }));
      }

      setSuccess("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
      setErrors({ server: "Error de conexión con el servidor. Verifica que esté funcionando." });
    } finally {
      setLoading(false);
    }
  };
  

  // Initialize with Clerk data if available, otherwise fallback to mock
  const [profile] = useState<ProfileDto>({
    ...mockProfile,
    fullName: user?.fullName || mockProfile.fullName,
    avatarUrl: null,
    id: user?.id || mockProfile.id,
  } as ProfileDto);

  const avatarUrl = previewImage || backendImageUrl || user?.imageUrl;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#17262C] shadow-sm border border-slate-200 dark:border-slate-800/60">
      {/* Cover Gradient - Updated to Emerald/Teal */}
      <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-emerald-500 to-teal-600 relative group">
        <Button
          variant="ghost"
          icon={Camera}
          className="absolute right-4 top-4 rounded-lg bg-black/30 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          Cambiar Portada
        </Button>
      </div>

      {/* Profile Header section */}
      <div className="px-6 sm:px-10 pb-8">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 mb-8 gap-4">
          {/* Avatar - Updated border for new dark bg */}
          <div className="relative">
            <Avatar
              src={avatarUrl}
              name={profile.fullName}
              size="lg"
              className="border-4 border-white dark:border-[#17262C] shadow-xl"
            />
            {/* Updated Avatar Camera Button to Emerald */}
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 rounded-full bg-emerald-600 p-2 text-white shadow-lg hover:bg-emerald-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            {/* Input file oculto */}
            <input
              type="file"
              accept="image/png, image/jpeg"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          {/* Quick Stats / Action */}
          <div className="flex items-center gap-4">
            <Badge variant="success" pulsingDot>
              {profile.status === "ACTIVO"
                ? "PERFIL ACTIVO"
                : "PERFIL INACTIVO"}
            </Badge>
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="primary"
              icon={Sparkles}
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>

        {/* Notificaciones globales */}
        {success && (
          <div className="mb-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="h-5 w-5" />
            {success}
          </div>
        )}
        {errors.server && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            {errors.server}
          </div>
        )}
        {errors.image && (
          <div className="mb-6 rounded-xl bg-red-500/10 border border-red-500/20 p-4 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
            <AlertCircle className="h-5 w-5" />
            {errors.image}
          </div>
        )}

        {/* Form Grid */}
        <form className="space-y-8" key={profile.id}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Field: Nombre */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Nombre Completo <span className="text-red-500">*</span></span>
                <span className={form.fullName.length >= 100 ? "text-red-500" : ""}>{form.fullName.length}/100</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                maxLength={100}
                required
                className={`w-full rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.fullName}</p>}
            </div>

            {/* Field: Profesión */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Profesión / Cargo</span>
                <span className={form.profession.length >= 80 ? "text-red-500" : ""}>{form.profession.length}/80</span>
              </label>
              <input
                type="text"
                name="profession"
                value={form.profession}
                onChange={handleChange}
                placeholder={profile.role}
                maxLength={80}
                className={`w-full rounded-xl border ${errors.profession ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.profession && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.profession}</p>}
            </div>
          </div>

          {/* Field: Biografía */}
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Biografía Profesional</span>
              <span className={form.bio.length >= 500 ? "text-red-500 font-bold" : "text-slate-500"}>
                {form.bio.length} / 500 caracteres
              </span>
            </label>
            <textarea
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder={profile.bio}
              maxLength={500}
              className={`w-full resize-none rounded-xl border ${errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-[#10221C] px-4 py-3 text-sm leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.bio}</p>}
          </div>
        </form>
      </div>
    </div>
  );
};

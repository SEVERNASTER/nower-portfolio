import React, { useState, useEffect } from "react";
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

  const [form, setForm] = useState({
    fullName: "",
    profession: "",
    bio: "",
    phone: "+591 ",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Cargar datos del usuario cuando esté disponible
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        fullName: user.fullName || "",
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // cargar datos desde la bd

    useEffect(() => {
      if (!user) return;

      const fetchProfile = async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:8000/api/profile?clerk_id=${user.id}`,
          );

          const data = await res.json();

          if (res.ok) {
            setForm({
              fullName: data.full_name || "",
              profession: data.profession || "",
              bio: data.bio || "",
            });
          }
        } catch (err) {
          console.error(err);
        }
      };

      fetchProfile();
    }, [user]);

    // Limpiar error del campo modificado en tiempo real
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (errors.server) {
      setErrors((prev) => ({ ...prev, server: "" }));
    }
    setSuccess("");
  };

  const handleSave = async () => {
    if (!user) return;

    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "El nombre es obligatorio.";
    if (!form.profession.trim())
      newErrors.profession = "La profesión es obligatoria.";
    if (!form.bio.trim()) newErrors.bio = "La biografía es obligatoria.";
    if (!form.phone.trim() || form.phone === "+591" || form.phone === "+591 ") newErrors.phone = "El teléfono es obligatorio.";
    if (!form.city.trim()) newErrors.city = "La ciudad es obligatoria.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Evita que se haga el fetch si hay campos vacíos
    }

    setLoading(true);
    setSuccess("");
    setErrors({});

    try {
      // Request 1: Sync Basic Profile
      const resProfile = await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          clerk_id: user.id,
          full_name: form.fullName,
          profession: form.profession,
          bio: form.bio,
        }),
      });

      // Request 2: Sync Contact info in ProfileController
      const resContact = await fetch("http://127.0.0.1:8000/api/profile/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          clerk_id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          phone: form.phone,
          city: form.city,
        }),
      });

      const dataProfile = await resProfile.json();
      const dataContact = await resContact.json();

      if (!resProfile.ok || !resContact.ok) {
        const errorsToSet: Record<string, string> = {};
        
        if (!resProfile.ok && resProfile.status === 422 && dataProfile.errors) {
          for (const key in dataProfile.errors) {
            const formKey = key === "full_name" ? "fullName" : key;
            errorsToSet[formKey] = dataProfile.errors[key][0];
          }
        }
        
        if (!resContact.ok && resContact.status === 422 && dataContact.errors) {
          for (const key in dataContact.errors) {
            errorsToSet[key] = dataContact.errors[key][0];
          }
        }
        
        if (Object.keys(errorsToSet).length > 0) {
          setErrors(errorsToSet);
        } else {
          setErrors({
            server: dataProfile.message || dataContact.message || "Ocurrió un error inesperado en el servidor.",
          });
        }
        return;
      }

      setSuccess("Perfil y contacto actualizados correctamente");
    } catch (error) {
      console.error(error);
      setErrors({
        server:
          "Error de conexión con el servidor. Verifica que esté funcionando.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Initialize with Clerk data if available, otherwise fallback to mock
  const [profile] = useState<ProfileDto>({
    ...mockProfile,
    fullName: user?.fullName || mockProfile.fullName,
    avatarUrl: user?.imageUrl || mockProfile.avatarUrl,
    id: user?.id || mockProfile.id,
  } as ProfileDto);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith("+591 ")) {
      if (val.startsWith("+591")) {
        val = "+591 " + val.slice(4);
      } else {
        val = "+591 ";
      }
    }
    setForm({ ...form, phone: val });
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: "" }));
  };

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
              src={profile.avatarUrl ?? undefined}
              name={profile.fullName}
              size="lg"
              className="border-4 border-white dark:border-[#17262C] shadow-xl"
            />
            {/* Updated Avatar Camera Button to Emerald */}
            <button className="absolute bottom-2 right-2 rounded-full bg-emerald-600 p-2 text-white shadow-lg hover:bg-emerald-700 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
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

        {/* Form Grid */}
        <form className="space-y-8" key={profile.id}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Field: Nombre */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>
                  Nombre Completo <span className="text-red-500">*</span>
                </span>
                <span
                  className={form.fullName.length >= 100 ? "text-red-500" : ""}
                >
                  {form.fullName.length}/100
                </span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                maxLength={100}
                required
                className={`w-full rounded-xl border ${errors.fullName ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Field: Profesión */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Profesión / Cargo</span>
                <span
                  className={form.profession.length >= 80 ? "text-red-500" : ""}
                >
                  {form.profession.length}/80
                </span>
              </label>
              <input
                type="text"
                name="profession"
                value={form.profession}
                onChange={handleChange}
                placeholder={profile.role}
                maxLength={80}
                className={`w-full rounded-xl border ${errors.profession ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.profession && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.profession}
                </p>
              )}
            </div>
          </div>

          {/* Field: Biografía */}
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>Biografía Profesional</span>
              <span
                className={
                  form.bio.length >= 500
                    ? "text-red-500 font-bold"
                    : "text-slate-500"
                }
              >
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
              className={`w-full resize-none rounded-xl border ${errors.bio ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
            />
            {errors.bio && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.bio}
              </p>
            )}
          </div>
        </form>
        {/* FORM DATOS DE CONTACTO */}

        <div className="mt-10 pt-8 border-t border-slate-300 dark:border-slate-800/60">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-8">
            INFORMACIÓN DE CONTACTO
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* EMAIL */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={user?.primaryEmailAddress?.emailAddress || ""}
                disabled
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed focus:outline-none transition-colors opacity-80"
              />
              <p className="text-[10px] text-slate-500 mt-1">Este correo está vinculado a tu cuenta y no se puede modificar.</p>
            </div>

            {/* TELÉFONO */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handlePhoneChange}
                required
                className={`w-full rounded-xl border ${errors.phone ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.phone && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* CIUDAD FULL WIDTH */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                name="city"
                value={form.city}
                onChange={(e) => {
                  setForm({ ...form, city: e.target.value });
                  if (errors.city) setErrors((prev) => ({ ...prev, city: "" }));
                }}
                required
                className={`w-full rounded-xl border ${errors.city ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-transparent"} bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-3 text-sm text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 focus:border-emerald-500 focus:bg-white dark:focus:bg-[#10221C] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer`}
              >
                <option value="" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Selecciona una ciudad</option>
                <option value="La Paz" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">La Paz</option>
                <option value="Cochabamba" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Cochabamba</option>
                <option value="Santa Cruz" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Santa Cruz</option>
                <option value="Oruro" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Oruro</option>
                <option value="Potosí" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Potosí</option>
                <option value="Chuquisaca" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Chuquisaca</option>
                <option value="Tarija" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Tarija</option>
                <option value="Beni" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Beni</option>
                <option value="Pando" className="bg-white dark:bg-[#10221C] text-slate-900 dark:text-white">Pando</option>
              </select>
              {errors.city && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.city}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

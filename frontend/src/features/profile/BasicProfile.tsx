import React, { useState } from "react";
import { Camera, Sparkles } from "lucide-react";
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
    profession: "",
    bio: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSuccess("");

    try {
      await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerk_id: user.id,
          full_name: user.fullName,
          email: user.primaryEmailAddress?.emailAddress,
          profession: form.profession,
          bio: form.bio,
        }),
      });

      setSuccess("Perfil actualizado correctamente");
    } catch (error) {
      console.error(error);
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

        {/* Form Grid */}
        <form className="space-y-8" key={profile.id}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Field: Nombre */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Nombre Completo
              </label>
              <input
                type="text"
                defaultValue={profile.fullName}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Field: Profesión */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Profesión / Cargo
              </label>
              <input
                type="text"
                name="profession"
                value={form.profession}
                onChange={handleChange}
                placeholder={profile.role}
                defaultValue={profile.role}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Field: Biografía */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Biografía Profesional
            </label>
            <textarea
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder={profile.bio}
              className="w-full resize-none rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#10221C] px-4 py-3 text-sm leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            <p className="text-right text-xs text-slate-500 dark:text-slate-500">
              164 / 500 caracteres
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

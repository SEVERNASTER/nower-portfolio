import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  AlertCircle,
  Camera,
  CheckCircle2,
  ChevronDown,
  Pencil,
  Sparkles,
  X,
} from 'lucide-react';

import { useUser } from '@clerk/clerk-react';

import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { mockProfile } from '../../data/mockData';
import { PlatformIcon } from '../projects/components/PlatformIcon';
import {
  getProfile,
  syncUser,
} from './profileService';
import { useProfile } from './useProfile';

// ─── BasicProfile ─────────────────────────────────────────────────────────────
type ProfessionalLink = {
  platform_name: string;
  url: string;
};

const PROFESSIONAL_PLATFORMS = ['LinkedIn', 'GitHub', 'Behance'];

export const BasicProfile: React.FC = () => {
  const {
    loading, errors, success,
    setErrors, setSuccess, setLoading,
  } = useProfile();

  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socialDropdownRef = useRef<HTMLDivElement>(null);

  const [currentPlatform, setCurrentPlatform] = useState(PROFESSIONAL_PLATFORMS[0]);
  const [currentUrl, setCurrentUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false);
  const [editingSocialLinkIndex, setEditingSocialLinkIndex] = useState<number | null>(null);

 const [form, setForm] = useState<{
  fullName: string;
  profession: string;
  bio: string;
  phone: string;
  city: string;
  socialLinks: ProfessionalLink[];
}>({
  fullName: '',
  profession: '',
  bio: '',
  phone: '',
  city: '',
  socialLinks: [],
});

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [backendImageUrl, setBackendImageUrl] = useState<string | null>(null);

  // ─── Carga inicial ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!user?.id) return;

    const load = async () => {
      try {
        // Cargar datos desde el backend (fuente de verdad)
        const data = await getProfile(user.id);

        if (data.user) {
          const u = data.user as Record<string, any>;
          setForm({
            fullName: u.full_name ?? '',
            profession: u.profession ?? '',
            bio: u.bio ?? '',
            phone: u.phone ?? '',
            city: u.city ?? '',
            socialLinks: Array.isArray(u.social_links)
              ? u.social_links.map((link: any) => ({
                  platform_name: link.platform_name,
                  url: link.url,
                }))
              : [],
          });

          if (u.imagen_profile) {
            setBackendImageUrl(u.imagen_profile);
            // Notificar a otros componentes (ej: Sidebar avatar)
            window.dispatchEvent(new CustomEvent('userImageChanged', {
              detail: { imageUrl: u.imagen_profile },
            }));
          }
        }
      } catch (err) {
        console.error('Error loading user data:', err);
      }
    };

    load();
  }, [user?.id]);

  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      socialDropdownRef.current &&
      !socialDropdownRef.current.contains(event.target as Node)
    ) {
      setIsSocialDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (errors.server) setErrors(prev => ({ ...prev, server: '' }));
    setSuccess('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
    setForm(prev => ({ ...prev, phone: value }));
    if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
  };

  const normalizeUrl = (url: string) => {
    return url.trim();
  };

  const getPlatformUrlError = (platform: string, url: string) => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      return 'El enlace es obligatorio.';
    }

    if (!trimmedUrl.startsWith('https://')) {
      return 'El enlace debe comenzar con https://';
    }

    try {
      new URL(trimmedUrl);
    } catch {
      return 'El formato del enlace no es válido.';
    }

    const profilePathSegment = '(?:[a-zA-Z0-9._-]|%[0-9A-Fa-f]{2})+';

const platformPatterns: Record<string, RegExp> = {
    linkedin: new RegExp(
        `^https:\\/\\/(www\\.)?linkedin\\.com\\/in\\/${profilePathSegment}\\/?$`,
        'i'
    ),
    github: new RegExp(
        `^https:\\/\\/(www\\.)?github\\.com\\/${profilePathSegment}\\/?$`,
        'i'
    ),
    behance: new RegExp(
        `^https:\\/\\/(www\\.)?behance\\.net\\/${profilePathSegment}\\/?$`,
        'i'
    ),
};

    const platformExamples: Record<string, string> = {
      LinkedIn: 'Ejemplo válido: https://www.linkedin.com/in/usuario',
      GitHub: 'Ejemplo válido: https://github.com/usuario',
      Behance: 'Ejemplo válido: https://www.behance.net/usuario',
    };

    const normalizedPlatform = platform.toLowerCase();
    const pattern = platformPatterns[normalizedPlatform];

    if (!pattern) {
      return 'La plataforma seleccionada no es válida.';
    }

    if (!pattern.test(trimmedUrl)) {
      return `El enlace no corresponde a ${platform}. ${platformExamples[platform] ?? ''}`;
    }

    return '';
  };

  const validateUrl = (url: string, platform = currentPlatform) => {
    const error = getPlatformUrlError(platform, url);
    setUrlError(error);
    return error === '';
  };

  const handleUrlChange = (value: string) => {
    setCurrentUrl(value);

    if (value.trim()) {
      validateUrl(value, currentPlatform);
    } else {
      setUrlError('');
    }
  };

  const addSocialLink = () => {
    if (!validateUrl(currentUrl, currentPlatform)) return;

    const alreadyExists = form.socialLinks.some(
      (link) => link.platform_name.toLowerCase() === currentPlatform.toLowerCase()
    );

    if (alreadyExists) {
      setUrlError(`Ya agregaste un enlace de ${currentPlatform}`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        {
          platform_name: currentPlatform,
          url: normalizeUrl(currentUrl),
        },
      ],
    }));

    if (errors.socialLinks) {
      setErrors((prev) => ({
        ...prev,
        socialLinks: '',
      }));
    }

    setCurrentPlatform(PROFESSIONAL_PLATFORMS[0]);
    setCurrentUrl('');
    setUrlError('');
  };

  const removeSocialLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index),
    }));

    if (editingSocialLinkIndex === index) {
      cancelEditingSocialLink();
    }
  };

  const startEditingSocialLink = (index: number) => {
    const link = form.socialLinks[index];

    setEditingSocialLinkIndex(index);
    setCurrentPlatform(link.platform_name);
    setCurrentUrl(link.url);
    setUrlError('');
  };

  const cancelEditingSocialLink = () => {
    setEditingSocialLinkIndex(null);
    setCurrentPlatform(PROFESSIONAL_PLATFORMS[0]);
    setCurrentUrl('');
    setUrlError('');
  };

  const updateSocialLink = () => {
    if (editingSocialLinkIndex === null) return;

    if (!validateUrl(currentUrl, currentPlatform)) return;

    const alreadyExists = form.socialLinks.some(
      (link, index) =>
        index !== editingSocialLinkIndex &&
        link.platform_name.toLowerCase() === currentPlatform.toLowerCase()
    );

    if (alreadyExists) {
      setUrlError(`Ya agregaste un enlace de ${currentPlatform}`);
      return;
    }

    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, index) =>
        index === editingSocialLinkIndex
          ? {
              platform_name: currentPlatform,
              url: normalizeUrl(currentUrl),
            }
          : link
      ),
    }));

    setEditingSocialLinkIndex(null);
    setCurrentPlatform(PROFESSIONAL_PLATFORMS[0]);
    setCurrentUrl('');
    setUrlError('');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors({ image: 'Solo se permiten imágenes JPG o PNG' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrors({ image: 'La imagen no puede exceder 2 MB' });
      return;
    }

    setSelectedImage(file);
    setPreviewImage(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, image: '' }));
  };

  const handleSave = async () => {
    if (!user) return;

    // Validación local
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = 'El nombre es obligatorio.';
    if (!form.profession.trim()) newErrors.profession = 'La profesión es obligatoria.';
    if (!form.bio.trim()) newErrors.bio = 'La biografía es obligatoria.';
    if (!/^[0-9]{8}$/.test(form.phone)) newErrors.phone = 'Teléfono inválido (8 dígitos).';
    if (!form.city.trim()) newErrors.city = 'La ciudad es obligatoria.';

    if (form.socialLinks.length === 0) {
      newErrors.socialLinks = 'Debes agregar al menos una red profesional.';
    } else {
      const invalidLink = form.socialLinks.find((link) => {
        return getPlatformUrlError(link.platform_name, link.url) !== '';
      });

      if (invalidLink) {
        newErrors.socialLinks = getPlatformUrlError(
          invalidLink.platform_name,
          invalidLink.url
        );
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const email = user.primaryEmailAddress?.emailAddress;
    if (!email) {
      setErrors({ server: 'No se encontró email del usuario' });
      return;
    }

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      // Una sola llamada que incluye la imagen si fue seleccionada
      // El backend la sube a Cloudinary y devuelve la URL
      const data = await syncUser({
        clerk_id: user.id,
        full_name: form.fullName,
        email,
        profession: form.profession,
        bio: form.bio,
        phone: form.phone,
        city: form.city,
        social_links: form.socialLinks,
        image: selectedImage ?? null,
      });

      if (data.user) {
        const u = data.user as Record<string, string>;

        if (u.imagen_profile) {
          setBackendImageUrl(u.imagen_profile);
          setPreviewImage(null);
          setSelectedImage(null);

          // Notificar a otros componentes (ej: Sidebar avatar)
          window.dispatchEvent(new CustomEvent('userImageChanged', {
            detail: { imageUrl: u.imagen_profile },
          }));
        }
      }

      setSuccess('Perfil actualizado correctamente');

    } catch (err: unknown) {
      const e = err as { errors?: Record<string, string[]>; message?: string };

      if (e.errors) {
        const formatted: Record<string, string> = {};
        for (const key in e.errors) {
          formatted[key === 'full_name' ? 'fullName' : key] = e.errors[key][0];
        }
        setErrors(formatted);
      } else {
        setErrors({ server: e.message ?? 'Error de conexión con el servidor.' });
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  const avatarUrl = previewImage || backendImageUrl || user?.imageUrl;

  const profile = {
    ...mockProfile,
    fullName: form.fullName || mockProfile.fullName,
    avatarUrl: null,
    id: user?.id || mockProfile.id,
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-[#17262C] shadow-sm border border-slate-200 dark:border-slate-800/60">
      {/* Cover */}
      <div className="h-32 sm:h-40 w-full bg-gradient-to-r from-emerald-500 to-teal-600 relative group">
        <Button
          variant="ghost"
          icon={Camera}
          className="absolute right-4 top-4 rounded-lg bg-black/30 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100"
        >
          Cambiar Portada
        </Button>
      </div>

      <div className="px-6 sm:px-10 pb-8">
        <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between -mt-12 sm:-mt-16 mb-8 gap-4">
          {/* Avatar con botón de cámara */}
          <div className="relative">
            <Avatar
              src={avatarUrl ?? undefined}
              name={form.fullName || 'Usuario'}
              size="lg"
              className="border-4 border-white dark:border-[#17262C] shadow-xl"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-2 right-2 rounded-full bg-emerald-600 p-2 text-white shadow-lg hover:bg-emerald-700 transition-colors"
            >
              <Camera className="h-4 w-4" />
            </button>
            <input
              type="file"
              accept="image/png,image/jpeg"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="success" pulsingDot>
              {profile.status === 'ACTIVO' ? 'PERFIL ACTIVO' : 'PERFIL INACTIVO'}
            </Badge>
          </div>
        </div>

        {/* Notificaciones */}
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

        {/* Formulario */}
        <form className="space-y-8" onSubmit={e => e.preventDefault()}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Nombre */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>Nombre Completo <span className="text-red-400">*</span></span>
                <span className={form.fullName.length >= 100 ? 'text-red-400' : ''}>{form.fullName.length}/100</span>
              </label>
              <input
                type="text" name="fullName" value={form.fullName}
                onChange={handleChange} maxLength={100}
                className={`w-full rounded-xl border ${errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.fullName}</p>}
            </div>

            {/* Profesión */}
            <div className="space-y-2">
              <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <span>
                  Profesión / Cargo <span className="text-red-400">*</span>
                </span>
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
                required
                className={`w-full rounded-xl border ${errors.profession ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
              />
              {errors.profession && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.profession}</p>}
            </div>
          </div>

          {/* Biografía */}
          <div className="space-y-2">
            <label className="flex justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <span>
                Biografía Profesional <span className="text-red-400">*</span>
              </span>
              <span
                className={
                  form.bio.length >= 500
                    ? "text-red-500 font-bold"
                    : "text-slate-500"
                }
              >
                {form.bio.length}/500
              </span>
            </label>
            <textarea
              rows={4}
              name="bio"
              value={form.bio}
              onChange={handleChange}
              placeholder={profile.bio}
              maxLength={500}
              required
              className={`w-full resize-none rounded-xl border ${errors.bio ? "border-red-500 focus:ring-red-500" : "border-slate-300 dark:border-slate-700 focus:ring-emerald-500"} bg-white dark:bg-[#10221C] px-4 py-3 text-sm leading-relaxed text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
            />
            {errors.bio && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.bio}</p>}
          </div>
        </form>

        {/* Contacto */}
        <div className="mt-10 pt-8 border-t border-slate-300 dark:border-slate-800/60">
          <h3 className="text-xs font-bold dark:text-slate-400 uppercase tracking-wider mb-5">
            INFORMACIÓN DE CONTACTO
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (readonly) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</label>
              <input
                type="email" value={user?.primaryEmailAddress?.emailAddress ?? ''} disabled
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed focus:outline-none opacity-80"
              />
              <p className="text-[10px] text-slate-500 mt-1">Este correo está vinculado a tu cuenta y no se puede modificar.</p>
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Teléfono <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">+591</span>
                <input
                  type="tel" name="phone" value={form.phone}
                  onChange={handlePhoneChange}
                  className={`w-full rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-slate-700 focus:ring-emerald-500'} bg-white dark:bg-[#10221C] px-4 pl-16 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 transition-colors`}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.phone}</p>}
            </div>

            {/* Ciudad */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                name="city" value={form.city}
                onChange={e => { setForm(prev => ({ ...prev, city: e.target.value })); if (errors.city) setErrors(prev => ({ ...prev, city: '' })); }}
                className={`w-full rounded-xl border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 dark:border-transparent'} bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:bg-white dark:focus:bg-[#10221C] focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all cursor-pointer`}
              >
                <option value="">Selecciona una ciudad</option>
                {['La Paz', 'Cochabamba', 'Santa Cruz', 'Oruro', 'Potosí', 'Chuquisaca', 'Tarija', 'Beni', 'Pando'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.city && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.city}</p>}
            </div>

            {/* Redes profesionales */}
            <div className="space-y-3 md:col-span-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Redes profesionales <span className="text-red-500">*</span>
              </label>

              <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                {/* Selector de plataforma */}
                <div className="relative sm:w-1/4" ref={socialDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsSocialDropdownOpen(!isSocialDropdownOpen)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-white/5 dark:text-white outline-none focus:border-emerald-500 transition-all hover:border-emerald-400"
                  >
                    <span className="flex items-center gap-2 truncate">
                      <PlatformIcon
                        platform={currentPlatform}
                        className="h-5 w-5 text-slate-500 dark:text-slate-400"
                      />
                      <span className="truncate">{currentPlatform}</span>
                    </span>

                    <ChevronDown
                      className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
                        isSocialDropdownOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isSocialDropdownOpen && (
                    <div className="absolute z-50 w-full bottom-full mb-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#17262C] shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
                      {PROFESSIONAL_PLATFORMS.map((platform) => (
                        <button
                          key={platform}
                          type="button"
                          onClick={() => {
                            setCurrentPlatform(platform);
                            setIsSocialDropdownOpen(false);

                            if (currentUrl.trim()) {
                              validateUrl(currentUrl, platform);
                            } else {
                              setUrlError('');
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 text-left text-sm transition-colors ${
                            currentPlatform === platform
                              ? 'bg-emerald-50 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          <PlatformIcon
                            platform={platform}
                            className={`h-5 w-5 ${
                              currentPlatform === platform
                                ? 'text-emerald-500'
                                : 'text-slate-400'
                            }`}
                          />
                          {platform}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Input de enlace */}
                <div className="flex-1 flex flex-col gap-1">
                  <input
                    type="text"
                    value={currentUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSocialLink();
                      }
                    }}
                    placeholder="https://..."
                    className={`w-full p-3 rounded-xl border bg-white/50 dark:bg-white/5 dark:text-white outline-none transition-colors ${
                      urlError
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-slate-300 dark:border-slate-700 focus:border-emerald-500'
                    }`}
                  />

                  {urlError && (
                    <span className="text-[10px] font-medium text-red-500 ml-1">
                      {urlError}
                    </span>
                  )}
                </div>

                <Button
                  type="button"
                  onClick={editingSocialLinkIndex === null ? addSocialLink : updateSocialLink}
                  variant="secondary"
                  className="px-4 h-[50px] shrink-0 whitespace-nowrap"
                >
                  {editingSocialLinkIndex === null ? 'Añadir' : 'Actualizar'}
                </Button>

                {editingSocialLinkIndex !== null && (
                  <button
                    type="button"
                    onClick={cancelEditingSocialLink}
                    className="h-[50px] px-4 rounded-xl text-sm font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>

              {errors.socialLinks && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.socialLinks}
                </p>
              )}

              {/* Redes añadidas */}
              {form.socialLinks.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    Redes añadidas:
                  </p>

                  <div className="flex flex-row flex-wrap gap-3">
                    {form.socialLinks.map((link, index) => (
                      <div
                        key={`${link.platform_name}-${index}`}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border shadow-sm group transition-colors ${
                          editingSocialLinkIndex === index
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500'
                            : 'bg-slate-50 dark:bg-[#10221C] border-slate-200 dark:border-slate-700/50 hover:border-emerald-500'
                        }`}
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`Abrir ${link.platform_name}`}
                          className="flex items-center gap-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                          <PlatformIcon
                            platform={link.platform_name}
                            className="h-5 w-5"
                          />

                          <span className="text-sm font-medium">
                            {link.platform_name}
                          </span>
                        </a>
                        
                        <button
                          type="button"
                          onClick={() => startEditingSocialLink(index)}
                          className="text-slate-400 hover:text-emerald-500 transition-colors ml-1 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                          title={`Editar ${link.platform_name}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeSocialLink(index)}
                          className="text-slate-400 hover:text-red-500 transition-colors ml-1 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                          title={`Eliminar ${link.platform_name}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="md:col-span-2 flex flex-col gap-3">
              {success && (
                <div className="w-full rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 flex items-center gap-3 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                  <CheckCircle2 className="h-5 w-5" />
                  {success}
                </div>
              )}
            </div>
          </div>

          {/* Botón Guardar - Movido al final */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              variant="primary"
              icon={Sparkles}
              className="w-full sm:w-auto px-8"
            >
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

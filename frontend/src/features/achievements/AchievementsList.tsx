import React, { useEffect, useState } from 'react';
import { Plus, Award, FileText, Edit3 } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../../components/ui/Button';
import { AchievementForm, AchievementFile } from './components/AchievementForm';

interface Achievement {
  id: string;
  title: string;
  institution: string;
  obtained_at: string;
  description?: string;
  file_url?: string;
  file_public_id?: string;
  files?: AchievementFile[];
  created_at: string;
  user: {
    id: number;
    full_name: string;
  };
}

export const AchievementsList: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken, isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      window.location.href = '/login';
      return;
    }
    loadAchievements();
  }, [isLoaded, isSignedIn]);

  const loadAchievements = async () => {
    try {
      const token = await getToken();
      const res = await fetch('http://localhost:8000/api/achievements', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message ?? 'Error cargando logros');
      }

      setAchievements(data);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isImageUrl = (url: string) => {
    return /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(url);
  };

  const getFileName = (url: string) => {
    try {
      return decodeURIComponent(url.split('/').pop() || 'archivo');
    } catch {
      return url.split('/').pop() || 'archivo';
    }
  };

  const getAchievementPreview = (achievement: Achievement) => {
    const firstImage = achievement.files?.find((file) => /\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(file.url));
    if (firstImage) {
      return { url: firstImage.url, type: 'image' as const };
    }
    if (achievement.files?.length) {
      return { url: achievement.files[0].url, type: 'file' as const };
    }
    if (achievement.file_url) {
      return { url: achievement.file_url, type: isImageUrl(achievement.file_url) ? 'image' as const : 'file' as const };
    }
    return null;
  };

  const handleCreateAchievement = async (formData: FormData) => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:8000/api/achievements', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements([data.achievement, ...achievements]);
        setIsAdding(false);
      } else {
        const errorData = await response.json();
        console.error('Error del backend:', errorData);
        alert(`Error al guardar: ${errorData.message || JSON.stringify(errorData.errors)}`);
      }
    } catch (error) {
      console.error('Error creando logro:', error);
      alert('Error al crear el logro');
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
  };

  const handleUpdateAchievement = async (formData: FormData) => {
    if (!editingAchievement) return;

    try {
      const token = await getToken();
      const response = await fetch(`http://localhost:8000/api/achievements/${editingAchievement.id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAchievements((prev) => prev.map((item) => item.id === data.achievement.id ? data.achievement : item));
        setEditingAchievement(null);
      } else {
        const errorData = await response.json();
        console.error('Error actualizando logro:', errorData);
        alert(`Error al actualizar: ${errorData.message || JSON.stringify(errorData.errors)}`);
      }
    } catch (error) {
      console.error('Error actualizando logro:', error);
      alert('Error al actualizar el logro');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const shouldShowEmptyState = !isLoading && achievements.length === 0;

  return (
    <div className="h-full min-h-screen flex flex-col max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
            <Award className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Logros y Certificaciones
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Registra tus certificaciones, diplomas y reconocimientos
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Añadir Logro
        </Button>
      </div>

      {/* Form Modal */}
      {(isAdding || editingAchievement) && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white dark:bg-[#17262C] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {editingAchievement ? 'Editar Logro' : 'Nuevo Logro'}
                </h2>
                <button
                  onClick={() => {
                    setIsAdding(false);
                    setEditingAchievement(null);
                  }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <AchievementForm
                onSubmit={editingAchievement ? handleUpdateAchievement : handleCreateAchievement}
                onCancel={() => {
                  setIsAdding(false);
                  setEditingAchievement(null);
                }}
                achievementId={editingAchievement?.id}
                initialFiles={editingAchievement?.files ?? []}
                defaultValues={editingAchievement ? {
                  title: editingAchievement.title,
                  institution: editingAchievement.institution,
                  obtained_at: editingAchievement.obtained_at,
                  description: editingAchievement.description,
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {shouldShowEmptyState ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <Award className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No tienes logros registrados
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Comienza añadiendo tu primera certificación o reconocimiento
            </p>
            <Button onClick={() => setIsAdding(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Primer Logro
            </Button>
          </div>
        ) : (
          <div className="h-full min-h-0 overflow-hidden">
            <div className="h-full min-h-0 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {achievements.map((achievement) => {
            const preview = getAchievementPreview(achievement);
            const totalFiles = achievement.files?.length ?? (achievement.file_url ? 1 : 0);
            return (
              <div
                key={achievement.id}
                className="bg-white dark:bg-[#17262C] rounded-xl border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2">
                      {achievement.institution}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      {formatDate(achievement.obtained_at)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleEditAchievement(achievement)}
                    className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span className="sr-only">Editar logro</span>
                  </button>
                </div>

                {achievement.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                    {achievement.description}
                  </p>
                )}

                {preview && (
                  <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        Evidencia{totalFiles > 1 ? ` (${totalFiles})` : ''}
                      </p>
                      {totalFiles > 1 && (
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                          {totalFiles} archivos
                        </span>
                      )}
                    </div>

                    {preview.type === 'image' ? (
                      <img
                        src={preview.url}
                        alt="Evidencia del logro"
                        className="h-40 w-full rounded-3xl object-cover border border-slate-200 dark:border-slate-700"
                      />
                    ) : (
                      <a
                        href={preview.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0F1920] p-3"
                      >
                        <div className="flex h-10 w-10 min-w-[2.5rem] items-center justify-center rounded-2xl bg-slate-200 dark:bg-slate-900">
                          <FileText className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0 text-left">
                          <p className="font-medium text-slate-900 dark:text-white truncate max-w-[12rem]">
                            {getFileName(preview.url)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Abrir archivo
                          </p>
                        </div>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useEffect, useState } from 'react';
import { Plus, Award, FileText, Pencil, Trash2, MoreVertical } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { Button } from '../../components/ui/Button';
import { AchievementForm, AchievementFile } from './components/AchievementForm';
import {
  Achievement,
  createAchievement,
  deleteAchievement,
  fetchAchievements,
  updateAchievement,
  formatAchievementHours,
} from './achievementsService';

export const AchievementsList: React.FC = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [deletingAchievement, setDeletingAchievement] = useState<Achievement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
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
      const data = await fetchAchievements(token);
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
      const data = await createAchievement(token, formData);
      setAchievements([data.achievement, ...achievements]);
      setIsAdding(false);
    } catch (error) {
      console.error('Error creando logro:', error);
      const message = error instanceof Error ? error.message : 'Error al crear el logro';
      alert(message);
    }
  };

  const handleEditAchievement = (achievement: Achievement) => {
    setEditingAchievement(achievement);
  };

  const handleDeleteAchievement = async (id: string) => {
    try {
      const token = await getToken();
      await deleteAchievement(token, id);
      setAchievements((prev) => prev.filter((achievement) => achievement.id !== id));
      setDeletingAchievement(null);
    } catch (error) {
      console.error('Error eliminando logro:', error);
      const message = error instanceof Error ? error.message : 'Error al eliminar el logro';
      alert(message);
    }
  };

  const handleDeleteClick = (achievement: Achievement) => {
    setDeletingAchievement(achievement);
  };

  const handleCancelDelete = () => {
    setDeletingAchievement(null);
  };

  const handleUpdateAchievement = async (formData: FormData) => {
    if (!editingAchievement) return;

    try {
      const token = await getToken();
      const data = await updateAchievement(token, editingAchievement.id, formData);
      setAchievements((prev) => prev.map((item) => item.id === data.achievement.id ? data.achievement : item));
      setEditingAchievement(null);
    } catch (error) {
      console.error('Error actualizando logro:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar el logro';
      alert(message);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    });
  };

  const shouldShowEmptyState = !isLoading && achievements.length === 0;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-[#17262C] p-6 rounded-2xl border border-slate-200 dark:border-slate-800/60 shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 dark:bg-[#10221C] text-emerald-600 dark:text-emerald-400 shadow-inner">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Logros y Certificaciones
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registra tus certificaciones, diplomas y reconocimientos
            </p>
          </div>
        </div>

        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 w-full sm:w-auto justify-center"
        >
          <Plus className="h-4 w-4" />
          Añadir Logro
        </Button>
      </div>

      {/* Form Modal */}
      {(isAdding || editingAchievement) && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white dark:bg-[#17262C] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="p-6 overflow-y-auto max-h-[90vh]">
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
                  hours: editingAchievement.hours,
                  description: editingAchievement.description,
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}

      {deletingAchievement && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 flex items-center justify-center">
          <div className="bg-white dark:bg-[#17262C] rounded-3xl max-w-xl w-full shadow-2xl">
            <div className="p-6">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                    Confirmar eliminación
                  </h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                    ¿Estás seguro de que deseas eliminar <span className="font-semibold text-slate-900 dark:text-white">{deletingAchievement.title}</span>? Esta acción no se puede deshacer.
                  </p>
                </div>
                <button
                  onClick={handleCancelDelete}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="w-full sm:w-auto px-4 py-2 rounded-2xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <Button
                  onClick={() => handleDeleteAchievement(deletingAchievement.id)}
                  className="w-full sm:w-auto bg-rose-600 text-white hover:bg-rose-700"
                >
                  Eliminar logro
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievements Grid */}
      <>
        {shouldShowEmptyState ? (
          <div className="flex h-full flex-col items-center justify-center text-center py-12">
            <Award className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              No tienes logros registrados
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Comienza añadiendo tu primera certificación o reconocimiento
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => {
            const preview = getAchievementPreview(achievement);
            const totalFiles = achievement.files?.length ?? (achievement.file_url ? 1 : 0);
            const hoursLabel = formatAchievementHours(achievement.hours);
            return (
              <div
                key={achievement.id}
                className="bg-white dark:bg-[#17262C] rounded-xl border border-slate-200 dark:border-slate-800/60 p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2 break-words">
                      {achievement.title}
                    </h3>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-2 break-words">
                      {achievement.institution}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                      {formatDate(achievement.obtained_at)}
                    </p>
                    {hoursLabel ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-3">
                        {hoursLabel}
                      </p>
                    ) : (
                      <div className="mb-3" />
                    )}
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setActiveMenuId(activeMenuId === achievement.id ? null : achievement.id)}
                      className="p-2 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl hover:bg-emerald-500/10 transition-colors"
                      aria-label="Opciones de logro"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {activeMenuId === achievement.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenuId(null)}
                        />
                        <div className="absolute right-0 top-11 z-20 w-44 rounded-xl bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleEditAchievement(achievement);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Pencil className="h-4 w-4" />
                            Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              handleDeleteClick(achievement);
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {achievement.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3 break-words whitespace-pre-wrap">
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
        )}
      </>
    </div>
  );
};
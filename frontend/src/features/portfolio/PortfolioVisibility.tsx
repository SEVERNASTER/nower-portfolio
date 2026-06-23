import React, {
  useEffect,
  useState,
} from 'react';

import {
  CheckCircle2,
  Globe,
  LayoutTemplate,
  PauseCircle,
  Send,
  XCircle,
} from 'lucide-react';

import { useAuth } from '@clerk/clerk-react';

import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../projects/components/ConfirmModal';
import {
  fetchPortfolioPreview,
  fetchPortfolioStatus,
  PortfolioStatus,
  PortfolioTemplateKey,
  publishPortfolio,
  unpublishPortfolio,
} from './portfolioService';
import { renderPortfolioTemplate } from './templates/PortfolioTemplates';

const templates: Array<{
  key: PortfolioTemplateKey;
  name: string;
  description: string;
}> = [
  {
    key: 'classic',
    name: 'Clásica',
    description: 'Orden profesional tradicional: perfil, proyectos, habilidades, experiencia y logros.',
  },
  {
    key: 'modern',
    name: 'Moderna',
    description: 'Diseño con columna lateral para datos personales y contenido principal destacado.',
  },
  {
    key: 'creative',
    name: 'Creativa',
    description: 'Presentación más visual, ideal para portafolios con imagen y proyectos destacados.',
  },
];

export const PortfolioVisibility: React.FC = () => {
  const { getToken, isLoaded, isSignedIn } = useAuth();

  const [status, setStatus] = useState<PortfolioStatus | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PortfolioTemplateKey>('classic');
  const [previewUser, setPreviewUser] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUnpublishConfirmOpen, setIsUnpublishConfirmOpen] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      window.location.href = '/login';
      return;
    }

    void loadInitialData();
  }, [isLoaded, isSignedIn]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        window.location.href = '/login';
        return;
      }

      const [statusData, previewData] = await Promise.all([
        fetchPortfolioStatus(token),
        fetchPortfolioPreview(token),
      ]);

      setStatus(statusData);
      setSelectedTemplate(statusData.template_key || 'classic');
      setPreviewUser(previewData.user);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando portafolio');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await publishPortfolio(token, selectedTemplate);
      setStatus(result.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error enviando portafolio a revisión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnpublish = () => {
    setIsUnpublishConfirmOpen(true);
  };

  const executeUnpublish = async () => {
    setIsUnpublishConfirmOpen(false);
    setActionLoading(true);
    setError(null);
    setMessage(null);

    try {
      const token = await getToken();
      if (!token) return;

      const result = await unpublishPortfolio(token);
      setStatus(result.data);
      setMessage(result.message || 'Portafolio despublicado correctamente.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error despublicando portafolio');
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatusBadge = () => {
    if (!status) return null;

    if (status.status === 'published' && status.is_public) {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          Publicado
        </span>
      );
    }

    if (status.status === 'pending_review') {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
          <Send className="h-4 w-4" />
          Pendiente de revisión
        </span>
      );
    }

    if (status.review_status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900/30 dark:text-red-300">
          <XCircle className="h-4 w-4" />
          Rechazado
        </span>
      );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <PauseCircle className="h-4 w-4" />
            No publicado
        </span>
    );
  };

  if (loading) {
    return (
      <div className="text-sm text-slate-500 dark:text-slate-400">
        Cargando configuración de visibilidad…
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-[#17262C]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <Globe className="h-6 w-6" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Visibilidad Pública
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Selecciona una plantilla, previsualiza tu portafolio y publícalo cuando estés conforme.
              </p>

              <div className="mt-4">
                {renderStatusBadge()}
              </div>
            </div>
          </div>

          {status?.status === 'published' && status.is_public && (
            <Button
              variant="secondary"
              icon={PauseCircle}
              onClick={handleUnpublish}
              disabled={actionLoading}
            >
              Despublicar
            </Button>
          )}
        </div>

        {status?.status === 'published' && status.is_public && (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
            <div className="flex items-start gap-3">
              <p>
                Portafolio aprobado y publicado correctamente.<br></br>
                Tu portafolio ya está visible en el panel de inicio junto a los portafolios públicos de los demás usuarios.
              </p>
            </div>
          </div>
        )}

        {status?.review_status === 'rejected' && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50/50 p-5 shadow-sm dark:border-rose-900/30 dark:bg-rose-950/20">
            <div className="flex gap-4">
              <div className="flex shrink-0 h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
                <XCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">
                  Tu portafolio requiere correcciones
                </h3>
                <p className="mt-1 text-sm text-rose-700 dark:text-rose-400">
                  El administrador ha revisado tu portafolio y ha determinado que es necesario realizar algunos ajustes antes de publicarlo.
                </p>
                {status.review_comment && (
                  <div className="mt-3 rounded-xl bg-white/60 p-4 text-sm text-slate-800 dark:bg-black/20 dark:text-slate-300 border border-rose-100 dark:border-rose-900/50">
                    <p className="font-semibold text-rose-900 dark:text-rose-200 mb-1">Observaciones del administrador:</p>
                    <p className="whitespace-pre-wrap leading-relaxed">{status.review_comment}</p>
                  </div>
                )}

              </div>
            </div>
          </div>
        )}
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-[#17262C]">
        <div className="mb-5 flex items-center gap-3">
          <LayoutTemplate className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Elige una plantilla
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {templates.map((template) => {
            const isSelected = selectedTemplate === template.key;

            return (
              <button
                key={template.key}
                type="button"
                onClick={() => setSelectedTemplate(template.key)}
                className={`rounded-2xl border p-5 text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50 shadow-md dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900/30'
                }`}
              >
                <div className="mb-4 h-28 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900" />

                <h4 className="font-bold text-slate-900 dark:text-white">{template.name}</h4>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {template.description}
                </p>

                {isSelected && (
                  <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Plantilla seleccionada
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-[#17262C]">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Previsualizacion de tu portafolio 
          </h3>
        </div>

        <div className="scale-[0.92] origin-top">
          {previewUser && renderPortfolioTemplate(selectedTemplate, previewUser)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800/60 dark:bg-[#17262C]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 lg:max-w-2xl">
            Antes de ser publicado y visible para visitantes y reclutadores, tu portafolio será revisado por los administradores para su aprobación o rechazo.
            </p>

            <div className="w-full lg:w-auto">
                <Button
                    icon={Send}
                    onClick={handlePublish}
                    disabled={
                    actionLoading ||
                    status?.status === 'pending_review' ||
                    status?.status === 'published'
                    }
                    className="w-full justify-center px-10 py-3 text-base font-semibold lg:min-w-[300px]"
                >
                    {actionLoading 
                        ? 'Enviando...' 
                        : (status?.review_status === 'rejected' ? 'Volver a solicitar revisión' : 'Publicar portafolio')}
                </Button>
            </div>
        </div>
      </section>

      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-2 sm:p-4">
          <div className="mx-auto my-2 sm:my-8 w-full max-w-6xl">
            <div className="mb-3 sm:mb-4 flex justify-end sticky top-0 z-10 pt-2">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded-xl bg-white px-3 sm:px-4 py-2 text-sm font-semibold text-slate-800 shadow hover:bg-slate-100"
              >
                Cerrar preview
              </button>
            </div>

            <div className="overflow-x-hidden rounded-xl">
              {previewUser && renderPortfolioTemplate(selectedTemplate, previewUser)}
            </div>
          </div>
        </div>
      )}

      {/* Custom system confirm dialog instead of default browser confirm popup */}
      <ConfirmModal
        isOpen={isUnpublishConfirmOpen}
        title="Despublicar portafolio"
        message="¿Deseas despublicar tu portafolio? Dejará de estar visible para visitantes y reclutadores."
        confirmText="Despublicar"
        variant="warning"
        icon="⚠️"
        onConfirm={executeUnpublish}
        onCancel={() => setIsUnpublishConfirmOpen(false)}
        loading={actionLoading}
      />
    </div>
  );
};
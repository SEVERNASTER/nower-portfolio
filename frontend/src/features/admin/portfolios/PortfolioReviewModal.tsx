import React from 'react';

import {
  Check,
  Sparkles,
  X,
} from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import {
  renderPortfolioTemplate,
} from '../../portfolio/templates/PortfolioTemplates';
import {
  PortfolioDetail,
  ReviewAction,
} from './portfolioAdminTypes';
import { getStatusBadge } from './portfolioAdminUtils';

interface PortfolioReviewModalProps {
    portfolio: PortfolioDetail;
    reviewComment: string;
    reviewLoading: 'approve' | 'reject' | null;
    onClose: () => void;
    onCommentChange: (value: string) => void;
    onRequestConfirm: (action: ReviewAction) => void;
}

export const PortfolioReviewModal: React.FC<PortfolioReviewModalProps> = ({
    portfolio,
    reviewComment,
    reviewLoading,
    onClose,
    onCommentChange,
    onRequestConfirm,
}) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative flex h-[95dvh] w-full max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl ring-1 ring-slate-200/50 animate-in fade-in zoom-in-95 duration-200 dark:bg-[#121c22] dark:ring-slate-700 sm:rounded-3xl lg:flex-row">
                <div className="relative z-0 flex h-1/2 flex-col overflow-y-auto border-b border-slate-200 dark:border-slate-800 lg:h-auto lg:flex-1 lg:border-b-0 lg:border-r">
                    <div className="sticky top-0 z-30 flex shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-[#121c22]/95 sm:px-6 sm:py-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 sm:h-9 sm:w-9">
                                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-900 dark:text-white sm:text-sm">
                                    Vista previa del usuario
                                </h3>

                                <p className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                                    Plantilla:{' '}
                                    <span className="font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                                        {portfolio.templateKey}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-[#162730] lg:hidden"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 bg-slate-100 p-3 dark:bg-[#0b1319] sm:p-4 md:p-8">
                        <div className="mx-auto max-w-5xl">
                            {renderPortfolioTemplate(portfolio.templateKey, portfolio.rawUser)}
                        </div>
                    </div>
                </div>

                <div className="flex h-1/2 w-full shrink-0 flex-col overflow-y-auto bg-white dark:bg-[#162730] lg:h-auto lg:w-[400px]">
                    <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">
                                Dictamen de revisión
                            </h3>

                            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                Evalúa el contenido antes de aprobar o rechazar.
                            </p>
                        </div>

                        <button
                            onClick={onClose}
                            className="hidden rounded-xl border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-[#1f3643] lg:block"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex-1 space-y-6 overflow-y-auto p-6">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#121c22]">
                            <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                                Estado actual
                            </label>

                            {getStatusBadge(portfolio.status)}
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#121c22]">
                            <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                                Usuario
                            </label>

                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                {portfolio.nombre}
                            </p>

                            <p className="text-xs text-slate-500">
                                {portfolio.email}
                            </p>
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-200">
                                Comentarios
                            </label>

                            <textarea
                                rows={5}
                                placeholder="Escribe las razones del rechazo o sugerencias de mejora..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 transition-colors focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:border-slate-700 dark:bg-[#0b1319] dark:text-white"
                                value={reviewComment}
                                onChange={(e) => onCommentChange(e.target.value)}
                            />

                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                                Obligatorio solo si se rechaza el portafolio.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-[#121c22]">
                        <Button
                            variant="secondary"
                            icon={Check}
                            onClick={() => onRequestConfirm('approved')}
                            disabled={reviewLoading !== null}
                            className="w-full justify-center border-transparent bg-[#10b981] text-white hover:bg-[#059669]"
                        >
                            Aprobar y publicar
                        </Button>

                        <Button
                            variant="outline"
                            icon={X}
                            onClick={() => onRequestConfirm('rejected')}
                            disabled={reviewLoading !== null || reviewComment.trim().length === 0}
                            className="w-full justify-center border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                        >
                            Rechazar portafolio
                        </Button>

                        {reviewComment.trim().length === 0 && (
                            <p className="mt-1 text-center text-[10px] text-slate-500">
                                * El botón de rechazar requiere justificación.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
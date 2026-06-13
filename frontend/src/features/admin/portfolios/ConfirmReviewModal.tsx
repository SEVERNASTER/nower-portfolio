import React from 'react';

import { Button } from '../../../components/ui/Button';
import {
  PortfolioDetail,
  ReviewAction,
} from './portfolioAdminTypes';

interface ConfirmReviewModalProps {
    action: ReviewAction;
    portfolio: PortfolioDetail;
    onCancel: () => void;
    onConfirm: (action: ReviewAction) => void;
}

export const ConfirmReviewModal: React.FC<ConfirmReviewModalProps> = ({
    action,
    portfolio,
    onCancel,
    onConfirm,
}) => {
    const isApproval = action === 'approved';

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onCancel}
            />

            <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/50 animate-in fade-in zoom-in-95 dark:bg-[#162730] dark:ring-slate-700">
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                    Confirmar veredicto
                </h3>

                <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
                    Estás a punto de{' '}
                    <strong className={isApproval ? 'text-emerald-500' : 'text-rose-500'}>
                        {isApproval ? 'aprobar y publicar' : 'rechazar'}
                    </strong>{' '}
                    el portafolio de <strong>{portfolio.nombre}</strong>.
                </p>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="w-full justify-center sm:w-auto"
                    >
                        Cancelar
                    </Button>

                    <Button
                        variant={isApproval ? 'secondary' : 'outline'}
                        className={`w-full justify-center sm:w-auto ${
                            !isApproval
                                ? 'border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white'
                                : ''
                        }`}
                        onClick={() => onConfirm(action)}
                    >
                        Confirmar {isApproval ? 'aprobación' : 'rechazo'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
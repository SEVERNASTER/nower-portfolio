import React from 'react';

import { useLocation } from 'react-router-dom';

import { useAuth } from '@clerk/clerk-react';

import { AdminMetricsPanel } from './metrics';
import { PortfolioManagementPanel } from './portfolios';
import { AdminReportsPanel } from './reports';

type AdminSectionKey =
    | 'metrics'
    | 'portfolios'
    | 'reports';

const cardBaseClass =
    'rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#17262C] p-5 shadow-sm';

export const AdminSection: React.FC = () => {
    const location = useLocation();
    const { getToken } = useAuth();

    const sectionByPath: Record<string, AdminSectionKey> = {
        '/admin/metrics': 'metrics',
        '/admin/portafolios': 'portfolios',
        '/admin/reportes': 'reports',
    };

    const activeSection = sectionByPath[location.pathname] ?? 'metrics';

    return (
        <section className="space-y-6">
            <div className={cardBaseClass}>
                <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
                    Panel Administrador
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Módulo exclusivo para consultar métricas, revisar portafolios y generar reportes.
                </p>
            </div>

            {activeSection === 'metrics' && (
                <AdminMetricsPanel
                    cardBaseClass={cardBaseClass}
                    getToken={getToken}
                />
            )}

            {activeSection === 'portfolios' && (
                <PortfolioManagementPanel
                    cardBaseClass={cardBaseClass}
                    getToken={getToken}
                />
            )}

            {activeSection === 'reports' && (
                <AdminReportsPanel
                    cardBaseClass={cardBaseClass}
                    getToken={getToken}
                />
            )}
        </section>
    );
};
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Eye,
  FileText,
  Filter,
  FolderKanban,
  Search,
} from 'lucide-react';

import { Button } from '../../../components/ui/Button';
import { API_URL } from '../../profile/profileService';
import { ConfirmReviewModal } from './ConfirmReviewModal';
import {
  PortfolioDetail,
  PortfolioStatus,
  PortfolioStatusFilter,
  ReviewAction,
} from './portfolioAdminTypes';
import {
  ensureValidUrl,
  formatPeriodDate,
  formatSubmittedAt,
  getPortfolioStatus,
  getStatusBadge,
  parseTags,
} from './portfolioAdminUtils';
import { PortfolioReviewModal } from './PortfolioReviewModal';

interface PortfolioManagementPanelProps {
    cardBaseClass: string;
    getToken: () => Promise<string | null>;
}

export const PortfolioManagementPanel: React.FC<PortfolioManagementPanelProps> = ({
    cardBaseClass,
    getToken,
}) => {
    const [portfolios, setPortfolios] = useState<PortfolioDetail[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioDetail | null>(null);
    const [reviewLoading, setReviewLoading] = useState<'approve' | 'reject' | null>(null);
    const [reviewToast, setReviewToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<PortfolioStatusFilter>('Todos');

    const [reviewComment, setReviewComment] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState<ReviewAction | null>(null);

    const fetchAdminData = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/admin/users-data`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });

            if (!response.ok) throw new Error('Error al obtener datos');

            const data = await response.json();

            const adminPortfolios: PortfolioDetail[] = data.map((u: any) => ({
                id: `PRT-${u.id}`,
                userId: u.id.toString(),
                portfolioId: u.portfolio?.id ?? null,
                nombre: u.full_name || 'Sin nombre',
                rol: u.profession || 'Desconocido',
                ciudad: u.city || 'Desconocida',
                email: u.email,
                telefono: u.phone || 'N/A',
                bio: u.bio || '',
                proyectos: (u.projects || []).map((p: any) => {
                    const fallBackLink =
                        Array.isArray(p.links) && p.links.length > 0
                            ? p.links[0].url
                            : '#';

                    return {
                        id: p.id.toString(),
                        titulo: p.title || 'Sin título',
                        descripcion: p.description || '',
                        tecnologias: parseTags(p.tags),
                        enlace: ensureValidUrl(p.evidence_url || fallBackLink),
                        imagenes: Array.isArray(p.images)
                            ? p.images.map((img: any) => img.url)
                            : [],
                        links: p.links || [],
                    };
                }),
                experiencia: (u.experiences || []).map((exp: any) => {
                    const start = formatPeriodDate(exp.start_date);
                    const end = exp.end_date ? formatPeriodDate(exp.end_date) : 'Presente';

                    const rawDesc: string = exp.description || '';
                    let modalidad: string | undefined;
                    let ubicacion: string | undefined;
                    const cleanLines: string[] = [];

                    rawDesc.split('\n').forEach(line => {
                        const trimmed = line.trim();

                        if (trimmed.startsWith('Modalidad:')) {
                            modalidad = trimmed.replace('Modalidad:', '').trim();
                        } else if (trimmed.startsWith('Ubicación:')) {
                            ubicacion = trimmed.replace('Ubicación:', '').trim();
                        } else if (trimmed.startsWith('Tecnologías:')) {
                            // skip tech line — it is already shown in skills
                        } else {
                            cleanLines.push(trimmed);
                        }
                    });

                    const cleanDesc = cleanLines.filter(Boolean).join('\n').trim();

                    return {
                        id: exp.id.toString(),
                        tipo: exp.type === 'academic' ? 'academic' : 'work',
                        cargo: exp.title || '',
                        empresa: exp.institution || '',
                        periodo: start ? `${start} - ${end}` : 'N/A',
                        modalidad,
                        ubicacion,
                        descripcion: cleanDesc || undefined,
                    };
                }),
                skills: (u.skills || []).map((s: any) => s.name),
                status: getPortfolioStatus(u.portfolio),
                imagen_profile: u.imagen_profile,
                templateKey: u.portfolio?.template_key || 'classic',
                rawUser: u,
            }));

            setPortfolios(adminPortfolios);
        } catch (error) {
            console.error('Failed to load admin dashboard data:', error);
        }
    }, [getToken]);

    useEffect(() => {
        void fetchAdminData();
    }, [fetchAdminData]);

    const filteredPortfoliosList = useMemo(() => {
        let result = portfolios.filter((portfolio) =>
            portfolio.portfolioId !== null &&
            portfolio.rawUser?.role !== 'admin' &&
            ['Pendiente', 'Aprobado', 'Rechazado'].includes(portfolio.status)
        );

        if (statusFilter !== 'Todos') {
            result = result.filter(portfolio => portfolio.status === statusFilter);
        }

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();

            result = result.filter(portfolio =>
                portfolio.nombre.toLowerCase().includes(query) ||
                portfolio.email.toLowerCase().includes(query)
            );
        }

        const statusPriority: Record<PortfolioStatus, number> = {
            Pendiente: 1,
            Aprobado: 2,
            Rechazado: 3,
            'No publicado': 4,
        };

        result.sort((a, b) => {
            const priorityA = statusPriority[a.status];
            const priorityB = statusPriority[b.status];

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            const dateA = new Date(a.rawUser?.portfolio?.updated_at || 0).getTime();
            const dateB = new Date(b.rawUser?.portfolio?.updated_at || 0).getTime();

            return dateB - dateA;
        });

        return result;
    }, [portfolios, searchQuery, statusFilter]);

    const openPortfolioModal = (userId: string) => {
        const portfolio = portfolios.find((item) => item.userId === userId);
        setSelectedPortfolio(portfolio || null);
    };

    const closePortfolioModal = () => {
        setSelectedPortfolio(null);
        setReviewLoading(null);
        setReviewComment('');
        setShowConfirmModal(null);
    };

    const showToast = useCallback((type: 'success' | 'error', msg: string) => {
        setReviewToast({ type, msg });
        setTimeout(() => setReviewToast(null), 3500);
    }, []);

    const handleReviewPortfolio = useCallback(async (action: ReviewAction) => {
        if (!selectedPortfolio?.portfolioId) {
            showToast('error', 'No se encontró el ID del portafolio.');
            return;
        }

        setReviewLoading(action === 'approved' ? 'approve' : 'reject');

        try {
            const token = await getToken();

            const response = await fetch(`${API_URL}/admin/portfolio/review`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    portfolio_id: selectedPortfolio.portfolioId,
                    status: action,
                    comment: action === 'rejected'
                        ? reviewComment.trim()
                        : (reviewComment.trim() || null),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = errorData.message || 'Error al procesar el portafolio';

                if (errorData.errors) {
                    errorMsg = Object.values(errorData.errors).flat().join(' | ');
                }

                throw new Error(errorMsg);
            }

            const newStatus: PortfolioStatus = action === 'approved'
                ? 'Aprobado'
                : 'Rechazado';

            setPortfolios(prev =>
                prev.map(portfolio =>
                    portfolio.portfolioId === selectedPortfolio.portfolioId
                        ? { ...portfolio, status: newStatus }
                        : portfolio
                )
            );

            await fetchAdminData();

            showToast(
                'success',
                action === 'approved'
                    ? 'Portafolio aprobado y publicado.'
                    : 'Portafolio rechazado.',
            );

            closePortfolioModal();
        } catch (err: any) {
            showToast('error', err.message || 'Error inesperado.');
        } finally {
            setReviewLoading(null);
        }
    }, [selectedPortfolio, reviewComment, getToken, showToast, fetchAdminData]);

    return (
        <div className="space-y-6">
            {reviewToast && (
                <div
                    className={`fixed bottom-6 right-6 z-[9999] rounded-2xl px-5 py-3 text-sm font-semibold shadow-2xl ${
                        reviewToast.type === 'success'
                            ? 'bg-emerald-800 text-emerald-100'
                            : 'bg-red-900 text-red-100'
                    }`}
                >
                    {reviewToast.msg}
                </div>
            )}

            <div className={cardBaseClass}>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-[#10221C] dark:text-emerald-400">
                            <FolderKanban className="h-6 w-6" />
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                Gestión de portafolios
                            </h3>

                            <p className="mt-1 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                                Revisa, aprueba o rechaza los portafolios enviados por los usuarios.
                            </p>
                        </div>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-[#1e2f38] dark:text-slate-300">
                        {filteredPortfoliosList.length}{' '}
                        {filteredPortfoliosList.length === 1 ? 'portafolio' : 'portafolios'}
                    </span>
                </div>
            </div>

            <div className={`${cardBaseClass} p-0 overflow-hidden`}>
                <div className="border-b border-slate-200 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-[#121c22]/50 sm:p-6">
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
                        <div>
                            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                Solicitudes de revisión
                            </h4>

                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Filtra por estado o busca un usuario por nombre/correo.
                            </p>
                        </div>

                        <div className="flex w-full flex-col gap-3 sm:flex-row xl:w-auto">
                            <div className="w-full sm:w-80">
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Search className="h-4 w-4 text-emerald-500" />
                                    Buscar
                                </label>

                                <input
                                    type="text"
                                    placeholder="Nombre o correo..."
                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-[#121c22] dark:text-white"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>

                            <div className="w-full sm:w-64">
                                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <Filter className="h-4 w-4 text-emerald-500" />
                                    Estado
                                </label>

                                <select
                                    className="block w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-[#121c22] dark:text-white"
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value as PortfolioStatusFilter)
                                    }
                                >
                                    <option value="Todos" className="dark:bg-[#162730]">
                                        Todos los estados
                                    </option>
                                    <option value="Pendiente" className="dark:bg-[#162730]">
                                        Pendientes
                                    </option>
                                    <option value="Aprobado" className="dark:bg-[#162730]">
                                        Aprobados
                                    </option>
                                    <option value="Rechazado" className="dark:bg-[#162730]">
                                        Rechazados
                                    </option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-[#121c22]">
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">
                                    Usuario
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">
                                    Correo electrónico
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">
                                    Solicitud
                                </th>
                                <th className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">
                                    Acción
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredPortfoliosList.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-16 text-center text-slate-400 dark:text-slate-500"
                                    >
                                        <div className="flex flex-col items-center justify-center space-y-3">
                                            <FileText className="h-10 w-10 opacity-20" />

                                            <p className="text-base font-semibold">
                                                No se encontraron portafolios
                                            </p>

                                            <p className="text-sm opacity-70">
                                                Intenta cambiar los filtros de búsqueda.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredPortfoliosList.map((portfolio) => {
                                    const submittedAt = formatSubmittedAt(
                                        portfolio.rawUser?.portfolio?.updated_at,
                                    );

                                    return (
                                        <tr
                                            key={portfolio.id}
                                            className="transition-colors hover:bg-slate-50/70 dark:hover:bg-[#121c22]/70"
                                        >
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-slate-900 dark:text-white">
                                                    {portfolio.nombre}
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                                    {portfolio.rol}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                {portfolio.email}
                                            </td>

                                            <td className="px-6 py-4">
                                                {getStatusBadge(portfolio.status)}
                                            </td>

                                            <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">
                                                {submittedAt}
                                            </td>

                                            <td className="px-6 py-4 text-center">
                                                <Button
                                                    variant="outline"
                                                    icon={Eye}
                                                    onClick={() => openPortfolioModal(portfolio.userId)}
                                                >
                                                    Revisar
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showConfirmModal && selectedPortfolio && (
                <ConfirmReviewModal
                    action={showConfirmModal}
                    portfolio={selectedPortfolio}
                    onCancel={() => setShowConfirmModal(null)}
                    onConfirm={(action) => {
                        void handleReviewPortfolio(action);
                        setShowConfirmModal(null);
                    }}
                />
            )}

            {selectedPortfolio && (
                <PortfolioReviewModal
                    portfolio={selectedPortfolio}
                    reviewComment={reviewComment}
                    reviewLoading={reviewLoading}
                    onClose={closePortfolioModal}
                    onCommentChange={setReviewComment}
                    onRequestConfirm={setShowConfirmModal}
                />
            )}
        </div>
    );
};
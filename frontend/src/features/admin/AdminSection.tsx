import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';

import {
  Check,
  Eye,
  FileText,
  Sparkles,
  X,
} from 'lucide-react';
import {
  useLocation
} from 'react-router-dom';

import { useAuth } from '@clerk/clerk-react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { PlatformIcon, PREDEFINED_PLATFORMS } from '../projects/components/PlatformIcon';
import { renderPortfolioTemplate } from '../portfolio/templates/PortfolioTemplates';

type AdminSectionKey =
    | 'metrics'
    | 'users'
    | 'reports';

interface AdminUser {
    id: string;
    name: string;
    email: string;
    status: 'Activo' | 'Inactivo';
    registeredAt: string;
}

interface AdminProfile {
    id: string;
    owner: string;
    role: string;
    city: string;
    portfolioUrl: string;
    updatedAt: string;
}

interface ModerationProject {
    id: string;
    title: string;
    owner: string;
    status: 'En revision' | 'Aprobado' | 'Rechazado';
    submittedAt: string;
}

interface PortfolioDetail {
    id: string;
    userId: string;
    portfolioId: number | null;  // real backend portfolio.id
    nombre: string;
    rol: string;
    ciudad: string;
    email: string;
    telefono: string;
    bio: string;
    proyectos: Array<{
        id: string;
        titulo: string;
        descripcion: string;
        tecnologias: string[];
        enlace: string;
        imagenes?: string[];
        links?: Array<{ platform_name: string; url: string }>;
    }>;
    experiencia: Array<{
        id: string;
        tipo: 'work' | 'academic';
        cargo: string;
        empresa: string;
        periodo: string;
        modalidad?: string;
        ubicacion?: string;
        descripcion?: string;
    }>;
    skills: string[];
    status: 'Pendiente' | 'Aprobado' | 'Rechazado' | 'No publicado';
    imagen_profile?: string;
    templateKey: 'classic' | 'modern' | 'creative';
    rawUser: any;
}
const parseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return tags.split(',').map(t => t.trim()).filter(Boolean);
        }
    }
    return [];
};

const cardBaseClass =
    'rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#17262C] p-5 shadow-sm';

const getStatusBadge = (status: string) => {
    if (status === 'Activo' || status === 'Aprobado' || status === 'Aprobada') {
        return <Badge variant="success">{status}</Badge>;
    }
    if (status === 'Inactivo' || status === 'Rechazado' || status === 'Rechazada') {
        return <Badge variant="neutral">{status}</Badge>;
    }
    return <Badge variant="warning">{status}</Badge>;
};

const ensureValidUrl = (url?: string): string => {
    if (!url || url.trim() === '' || url === '#') return '#';
    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `https://${trimmedUrl}`;
    }
    return trimmedUrl;
};


export const AdminSection: React.FC = () => {
    const location = useLocation();
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [portfolios, setPortfolios] = useState<PortfolioDetail[]>([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState<PortfolioDetail | null>(null);
    const [reviewLoading, setReviewLoading] = useState<'approve' | 'reject' | null>(null);
    const [reviewToast, setReviewToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'Todos' | 'Pendiente' | 'Aprobado' | 'Rechazado'>('Todos');
    
    const [reviewComment, setReviewComment] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState<'approved' | 'rejected' | null>(null);

    const { getToken } = useAuth();


    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const token = await getToken();
                if (!token) return;

                const response = await fetch('http://localhost:8000/api/admin/users-with-projects', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Error al obtener datos');

                const data = await response.json();

                const adminUsers: AdminUser[] = data.map((u: any) => ({
                    id: u.id.toString(),
                    name: u.full_name || 'Sin nombre',
                    email: u.email,
                    status: 'Activo',
                    registeredAt: new Date(u.created_at).toISOString().split('T')[0]
                }));

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
                        const fallBackLink = Array.isArray(p.links) && p.links.length > 0 ? p.links[0].url : '#';
                        return {
                            id: p.id.toString(),
                            titulo: p.title || 'Sin título',
                            descripcion: p.description || '',
                            tecnologias: parseTags(p.tags),
                            enlace: ensureValidUrl(p.evidence_url || fallBackLink),
                            imagenes: Array.isArray(p.images) ? p.images.map((img: any) => img.url) : [],
                            links: p.links || []
                        };
                    }),
                    experiencia: (u.experiences || []).map((exp: any) => {
                        const formatDate = (dateStr?: string) => {
                            if (!dateStr) return '';
                            const d = new Date(dateStr);
                            if (isNaN(d.getTime())) return '';
                            return d.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                        };
                        const start = formatDate(exp.start_date);
                        const end = exp.end_date ? formatDate(exp.end_date) : 'Presente';

                        // Parse embedded metadata from description
                        const rawDesc: string = exp.description || '';
                        let modalidad: string | undefined;
                        let ubicacion: string | undefined;
                        const cleanLines: string[] = [];
                        rawDesc.split('\n').forEach(line => {
                            const trimmed = line.trim();
                            if (trimmed.startsWith('Modalidad:')) {
                                modalidad = trimmed.replace('Modalidad:', '').trim();
                            } else if (trimmed.startsWith('Ubicaci\u00f3n:')) {
                                ubicacion = trimmed.replace('Ubicaci\u00f3n:', '').trim();
                            } else if (trimmed.startsWith('Tecnolog\u00edas:')) {
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
                            descripcion: cleanDesc || undefined
                        };
                    }),
                    skills: (u.skills || []).map((s: any) => s.name),
                    status: ((): 'Pendiente' | 'Aprobado' | 'Rechazado' | 'No publicado' => {
                        if (!u.portfolio || u.portfolio.status === 'unpublished') return 'No publicado';
                        const rs = u.portfolio?.review_status;
                        if (rs === 'approved') return 'Aprobado';
                        if (rs === 'rejected') return 'Rechazado';
                        return 'Pendiente';
                    })(),
                    imagen_profile: u.imagen_profile,
                    templateKey: u.portfolio?.template_key || 'classic',
                    rawUser: u
                }));

                setUsers(adminUsers);
                setPortfolios(adminPortfolios);
            } catch (error) {
                console.error("Failed to load admin dashboard data:", error);
            }
        };

        fetchAdminData();
    }, [getToken]);

    const sectionByPath: Record<string, AdminSectionKey> = {
        '/admin/metrics': 'metrics',
        '/admin/users': 'users',
        '/admin/reportes': 'reports'
    };

    const activeSection = sectionByPath[location.pathname] ?? 'metrics';

    const metrics = useMemo(() => {
        const registeredUsers = users.length;
        const approvedPortfolios = portfolios.filter((p) => p.status === 'Aprobado').length;
        const pendingPortfolios = portfolios.filter((p) => p.status === 'Pendiente').length;
        const disabledAccounts = users.filter((user) => user.status === 'Inactivo').length;

        return { registeredUsers, approvedPortfolios, pendingPortfolios, disabledAccounts };
    }, [users, portfolios]);

    const filteredPortfoliosList = useMemo(() => {
        let result = portfolios.filter(p => p.status !== 'No publicado' && p.portfolioId !== null);
        
        // Filter by Status
        if (statusFilter !== 'Todos') {
            result = result.filter(p => p.status === statusFilter);
        }

        // Filter by Search (name or email)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p => 
                p.nombre.toLowerCase().includes(q) || 
                p.email.toLowerCase().includes(q)
            );
        }

        // Sort by submitted_at (oldest first)
        result.sort((a, b) => {
            const dateA = new Date(a.rawUser?.portfolio?.updated_at || 0).getTime();
            const dateB = new Date(b.rawUser?.portfolio?.updated_at || 0).getTime();
            return dateA - dateB;
        });

        return result;
    }, [portfolios, searchQuery, statusFilter]);

    const toggleUserStatus = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' } : user
            )
        );
    };

    const openPortfolioModal = (userId: string) => {
        const portfolio = portfolios.find((p) => p.userId === userId);
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

    const handleReviewPortfolio = useCallback(async (action: 'approved' | 'rejected') => {
        if (!selectedPortfolio?.portfolioId) {
            showToast('error', 'No se encontró el ID del portafolio.');
            return;
        }
        setReviewLoading(action === 'approved' ? 'approve' : 'reject');
        try {
            const token = await getToken();
            const res = await fetch('http://localhost:8000/api/admin/portfolio/review', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    portfolio_id: selectedPortfolio.portfolioId,
                    status: action,
                    comment: reviewComment,
                }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                let errorMsg = errorData.message || 'Error al procesar el portafolio';
                if (errorData.errors) {
                    errorMsg = Object.values(errorData.errors).flat().join(' | ');
                }
                throw new Error(errorMsg);
            }
            const newStatus = action === 'approved' ? 'Aprobado' : 'Rechazado';
            // Update local state
            setPortfolios(prev =>
                prev.map(p =>
                    p.portfolioId === selectedPortfolio.portfolioId
                        ? { ...p, status: newStatus as 'Aprobado' | 'Rechazado' }
                        : p
                )
            );
            showToast('success', action === 'approved' ? 'Portafolio aprobado y publicado.' : 'Portafolio rechazado.');
            closePortfolioModal();
        } catch (err: any) {
            showToast('error', err.message || 'Error inesperado.');
        } finally {
            setReviewLoading(null);
        }
    }, [selectedPortfolio, getToken, showToast]);

    const getPortfolioByUserId = (userId: string): PortfolioDetail | undefined => {
        return portfolios.find((p) => p.userId === userId);
    };

    const exportReports = () => {
        const rows = [
            ['metric', 'value'],
            ['usuarios_registrados', String(metrics.registeredUsers)],
            ['portafolios_aprobados', String(metrics.approvedPortfolios)],
            ['portafolios_pendientes', String(metrics.pendingPortfolios)],
            ['cuentas_deshabilitadas', String(metrics.disabledAccounts)]
        ];
        const csv = rows.map((row) => row.join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `reporte_admin_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    return (
        <section className="space-y-6">
            {/* Toast notification */}
            {reviewToast && (
                <div
                    style={{
                        position: 'fixed',
                        bottom: '1.5rem',
                        right: '1.5rem',
                        zIndex: 9999,
                        padding: '0.75rem 1.25rem',
                        borderRadius: 14,
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        boxShadow: '0 8px 30px rgba(0,0,0,0.18)',
                        background: reviewToast.type === 'success' ? '#065f46' : '#7f1d1d',
                        color: reviewToast.type === 'success' ? '#a7f3d0' : '#fca5a5',
                        animation: 'toastIn 0.25s ease',
                    }}
                >
                    {reviewToast.msg}
                </div>
            )}
            <div className={cardBaseClass}>
                <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">Panel Administrador</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Módulo exclusivo para gestión de usuarios, perfiles, publicaciones y reportes.</p>
            </div>



            {activeSection === 'metrics' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Usuarios registrados</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.registeredUsers}</p>
                    </div>
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Portafolios aprobados</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.approvedPortfolios}</p>
                    </div>
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Portafolios pendientes</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.pendingPortfolios}</p>
                    </div>
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Cuentas deshabilitadas</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.disabledAccounts}</p>
                    </div>
                </div>
            )}
            {activeSection === 'users' && (
                <div className={`${cardBaseClass} p-0 overflow-hidden`}>
                    {/* Header and Filters Section */}
                    <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#121c22]/50">
                        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>Gestión de Portafolios</span>
                                <span className="text-xs bg-slate-100 dark:bg-[#1e2f38] text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
                                    {filteredPortfoliosList.length} {filteredPortfoliosList.length === 1 ? 'portafolio' : 'portafolios'}
                                </span>
                            </h3>
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                <div className="relative w-full sm:w-72">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <svg className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <input 
                                        type="text"
                                        placeholder="Buscar por nombre o correo..."
                                        className="block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121c22] py-2 pl-10 pr-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                
                                <select
                                    className="block w-full sm:w-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#121c22] py-2 pl-3 pr-8 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as any)}
                                >
                                    <option value="Todos" className="dark:bg-[#162730]">Todos los estados</option>
                                    <option value="Pendiente" className="dark:bg-[#162730]">Pendientes</option>
                                    <option value="Aprobado" className="dark:bg-[#162730]">Aprobados</option>
                                    <option value="Rechazado" className="dark:bg-[#162730]">Rechazados</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-[#121c22]">
                                <tr className="border-b border-slate-200 dark:border-slate-800">
                                    <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Estudiante</th>
                                    <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Correo Electrónico</th>
                                    <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Estado</th>
                                    <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-slate-300">Solicitud</th>
                                    <th className="px-6 py-4 text-center font-bold text-slate-700 dark:text-slate-300">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredPortfoliosList.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="text-center py-16 text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <FileText className="h-10 w-10 opacity-20" />
                                                <p className="text-base font-semibold">No se encontraron portafolios</p>
                                                <p className="text-sm opacity-70">Intenta cambiar los filtros de búsqueda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPortfoliosList.map((portfolio) => {
                                        const submittedAt = portfolio.rawUser?.portfolio?.updated_at 
                                            ? new Date(portfolio.rawUser.portfolio.updated_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
                                            : 'N/A';
                                        return (
                                            <tr key={portfolio.id} className="hover:bg-slate-50/50 dark:hover:bg-[#121c22]/50 transition-colors">
                                                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                                    {portfolio.nombre}
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                                                    {portfolio.email}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {getStatusBadge(portfolio.status)}
                                                </td>
                                                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                                                    {submittedAt}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <Button variant="outline" icon={Eye} onClick={() => openPortfolioModal(portfolio.userId)}>
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
            )}


            {activeSection === 'reports' && (
                <div className={`${cardBaseClass} space-y-4`}>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generar Reportes</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">Exporta métricas del sistema en formato CSV.</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-[#10221C]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Usuarios</p>
                            <p className="mt-1 text-sm">Registrados: {metrics.registeredUsers}</p>
                            <p className="text-sm">Inactivos: {metrics.disabledAccounts}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-4 dark:bg-[#10221C]">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Portafolios</p>
                            <p className="mt-1 text-sm">Aprobados: {metrics.approvedPortfolios}</p>
                            <p className="text-sm">Pendientes: {metrics.pendingPortfolios}</p>
                        </div>
                    </div>
                    <Button icon={FileText} onClick={exportReports}>
                        Exportar CSV
                    </Button>
                </div>
            )}

            {/* Confirm Modal */}
            {showConfirmModal && selectedPortfolio && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowConfirmModal(null)}></div>
                    <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-[#162730] shadow-2xl ring-1 ring-slate-200/50 dark:ring-slate-700 p-6 animate-in fade-in zoom-in-95">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Confirmar Veredicto</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                            Estás a punto de <strong className={showConfirmModal === 'approved' ? 'text-emerald-500' : 'text-rose-500'}>{showConfirmModal === 'approved' ? 'Aprobar y Publicar' : 'Rechazar'}</strong> el portafolio de <strong>{selectedPortfolio.nombre}</strong>.
                        </p>
                        <div className="flex items-center justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowConfirmModal(null)}>Cancelar</Button>
                            <Button 
                                variant={showConfirmModal === 'approved' ? 'secondary' : 'outline'} 
                                className={showConfirmModal === 'rejected' ? 'text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white' : ''}
                                onClick={() => {
                                    handleReviewPortfolio(showConfirmModal);
                                    setShowConfirmModal(null);
                                }}
                            >
                                Confirmar {showConfirmModal === 'approved' ? 'Aprobación' : 'Rechazo'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {selectedPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closePortfolioModal}></div>
                    
                    <div className="relative h-[95vh] w-full max-w-[1400px] overflow-hidden rounded-3xl bg-slate-50 dark:bg-[#121c22] shadow-2xl flex flex-col lg:flex-row ring-1 ring-slate-200/50 dark:ring-slate-700 animate-in fade-in zoom-in-95 duration-200">
                        {/* LEFT COLUMN: PORTFOLIO PREVIEW */}
                        <div className="h-1/2 lg:h-auto lg:flex-1 flex flex-col overflow-y-auto relative z-0 border-b lg:border-b-0 lg:border-r border-slate-200 dark:border-slate-800">
                            {/* ADMIN PREVIEW HEADER */}
                            <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#121c22]/95 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                                            Vista Previa del Estudiante
                                        </h3>
                                        <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                            Plantilla: <span className="font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">{selectedPortfolio.templateKey}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closePortfolioModal}
                                    className="lg:hidden rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#162730] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* PORTFOLIO CONTENT (DYNAMICAL PLANTILLA) */}
                            <div className="p-3 sm:p-4 md:p-8 bg-slate-100 dark:bg-[#0b1319] flex-1">
                                <div className="mx-auto max-w-5xl">
                                    {renderPortfolioTemplate(selectedPortfolio.templateKey, selectedPortfolio.rawUser)}
                                </div>
                            </div>
                        </div>
                        
                        {/* RIGHT COLUMN: REVIEW FORM */}
                        <div className="h-1/2 lg:h-auto w-full lg:w-[400px] shrink-0 bg-white dark:bg-[#162730] flex flex-col overflow-y-auto">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                                <h3 className="font-bold text-slate-900 dark:text-white">Dictamen de Revisión</h3>
                                <button
                                    onClick={closePortfolioModal}
                                    className="hidden lg:block rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1f3643] transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Estado Actual</label>
                                    {getStatusBadge(selectedPortfolio.status)}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">Estudiante</label>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">{selectedPortfolio.nombre}</p>
                                    <p className="text-xs text-slate-500">{selectedPortfolio.email}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-slate-900 dark:text-slate-200 mb-2">
                                        Comentarios (Obligatorio si se rechaza)
                                    </label>
                                    <textarea
                                        rows={5}
                                        placeholder="Escribe las razones del rechazo o sugerencias de mejora..."
                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0b1319] p-3 text-sm text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                                        value={reviewComment}
                                        onChange={(e) => setReviewComment(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#121c22] space-y-3">
                                <Button
                                    variant="secondary"
                                    icon={Check}
                                    onClick={() => setShowConfirmModal('approved')}
                                    disabled={reviewLoading !== null}
                                    className="w-full justify-center bg-[#10b981] text-white hover:bg-[#059669] border-transparent"
                                >
                                    Aprobar y Publicar
                                </Button>
                                
                                <Button
                                    variant="outline"
                                    icon={X}
                                    onClick={() => setShowConfirmModal('rejected')}
                                    disabled={reviewLoading !== null || reviewComment.trim().length === 0}
                                    className="w-full justify-center text-rose-500 border-rose-500/30 hover:bg-rose-500 hover:text-white"
                                >
                                    Rechazar Portafolio
                                </Button>
                                {reviewComment.trim().length === 0 && (
                                    <p className="text-[10px] text-center text-slate-500 mt-1">
                                        * El botón de rechazar requiere justificación.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

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
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    portfolio_id: selectedPortfolio.portfolioId,
                    status: action,
                }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al procesar la solicitud');
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
                <div className={cardBaseClass}>
                    <h3 className="mb-6 text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Gestionar Usuarios</span>
                        <span className="text-xs bg-slate-100 dark:bg-[#1e2f38] text-slate-600 dark:text-slate-400 px-2.5 py-0.5 rounded-full font-semibold">
                            {users.length} {users.length === 1 ? 'usuario' : 'usuarios'}
                        </span>
                    </h3>

                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-700">
                                    <th className="px-2 py-3 text-left">Usuario</th>
                                    <th className="px-2 py-3 text-left">Correo</th>
                                    <th className="px-2 py-3 text-left">Estado</th>
                                    <th className="px-2 py-3 text-left">Portafolio</th>
                                    <th className="px-2 py-3 text-left">Registro</th>
                                    <th className="px-2 py-3 text-left">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                                            No hay usuarios registrados
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user) => {
                                        const portfolio = getPortfolioByUserId(user.id);
                                        return (
                                            <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                                                <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                                                <td className="px-2 py-3">{user.email}</td>
                                                <td className="px-2 py-3">{getStatusBadge(user.status)}</td>
                                                <td className="px-2 py-3">
                                                    {portfolio && portfolio.status !== 'No publicado' ? (
                                                        <div className="flex items-center gap-2">
                                                            {getStatusBadge(portfolio.status)}
                                                            <Button variant="ghost" icon={Eye} onClick={() => openPortfolioModal(user.id)}>
                                                                Ver
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">Sin portafolio</span>
                                                    )}
                                                </td>
                                                <td className="px-2 py-3">{user.registeredAt}</td>
                                                <td className="px-2 py-3">
                                                    <Button
                                                        variant={user.status === 'Activo' ? 'outline' : 'secondary'}
                                                        onClick={() => toggleUserStatus(user.id)}
                                                    >
                                                        {user.status === 'Activo' ? 'Deshabilitar' : 'Habilitar'}
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

            {selectedPortfolio && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 transition-all duration-300">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={closePortfolioModal}></div>
                    
                    <div className="relative max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-slate-50 dark:bg-[#121c22] shadow-2xl flex flex-col ring-1 ring-slate-200/50 dark:ring-slate-700 animate-in fade-in zoom-in-95 duration-200">
                        {/* SCROLLABLE AREA */}
                        <div className="flex-1 overflow-y-auto relative z-0">
                            {/* ADMIN PREVIEW HEADER */}
                            <div className="sticky top-0 z-30 shrink-0 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-[#121c22]/95 px-6 py-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                                            Modo Moderador — Vista Previa del Estudiante
                                        </h3>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">
                                            Visualizando plantilla: <span className="font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">{selectedPortfolio.templateKey}</span>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={closePortfolioModal}
                                    className="rounded-xl border border-slate-200 p-2 text-slate-500 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#162730] transition-colors"
                                    title="Cerrar"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* PORTFOLIO CONTENT (DYNAMICAL PLANTILLA) */}
                            <div className="p-4 sm:p-8 bg-slate-100 dark:bg-[#0b1319] min-h-[50vh]">
                                <div className="mx-auto max-w-5xl">
                                    {renderPortfolioTemplate(selectedPortfolio.templateKey, selectedPortfolio.rawUser)}
                                </div>
                            </div>
                        </div>
                        
                        {/* BOTTOM ACTIONS */}
                        <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-white/60 backdrop-blur-md dark:bg-[#121c22]/80 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10 w-full">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:flex">
                                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                Revisa la información detalladamente antes de aprobar o rechazar el portafolio
                            </div>
                            <div className="flex w-full sm:w-auto flex-col sm:flex-row gap-3">
                                <Button
                                    variant="outline"
                                    icon={X}
                                    onClick={() => handleReviewPortfolio('rejected')}
                                    disabled={reviewLoading !== null}
                                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl !border !border-rose-400/10 !bg-[#13243a] px-5 py-2.5 text-sm font-bold !text-rose-300 shadow-[inset_0_0_35px_rgba(186,4,4,0.22),0_0_0_1px_rgba(186,4,4,0.30),0_0_10px_rgba(186,4,4,0.15)] transition-all duration-200 hover:!border-[#9C0000] hover:!bg-[#13243a] hover:!text-rose-300 hover:shadow-[inset_0_0_30px_rgba(244,63,94,0.25),0_0_12px_rgba(244,63,94,0.15),0_0_20px_rgba(244,63,94,0.20)] active:!border-[#e11d48] active:!bg-[#13243a] active:!text-rose-300 active:shadow-[inset_0_0_30px_rgba(244,63,94,0.35),0_0_16px_rgba(244,63,94,0.20),0_0_26px_rgba(244,63,94,0.25)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {reviewLoading === 'reject' ? 'Rechazando…' : 'Rechazar'}
                                </Button>
                                
                                <Button
                                    variant="secondary"
                                    icon={Check}
                                    onClick={() => handleReviewPortfolio('approved')}
                                    disabled={reviewLoading !== null}
                                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/25 bg-[#13243a] px-5 py-2.5 text-sm font-bold text-emerald-300 shadow-[inset_0_0_12px_rgba(20,215,163,0.05),0_0_0_1px_rgba(20,215,163,0.06)] transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_18px_rgba(20,215,163,0.20)] active:border-emerald-600 active:bg-emerald-600 active:text-white active:shadow-[0_0_20px_rgba(20,215,163,0.24)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {reviewLoading === 'approve' ? 'Aprobando…' : 'Aprobar Portafolio'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

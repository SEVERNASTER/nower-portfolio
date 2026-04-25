import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import { IconType } from 'react-icons';

import {
  Check,
  ContactRound,
  ExternalLink,
  Eye,
  FileText,
  FolderOpen,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import {
  FaCss3Alt,
  FaFigma,
  FaHtml5,
  FaJava,
  FaReact,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiNextdotjs,
  SiPostgresql,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';
import {
  useLocation
} from 'react-router-dom';

import { useAuth } from '@clerk/clerk-react';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

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
    }>;
    experiencia: Array<{
        id: string;
        cargo: string;
        empresa: string;
        periodo: string;
    }>;
    skills: string[];
    status: 'Pendiente' | 'Aprobado' | 'Rechazado';
    imagen_profile?: string;
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

const skillMetaMap: Record<
    string,
    {
        icon: any;
        iconClassName: string;
    }
> = {
    figma: {
        icon: FaFigma,
        iconClassName: 'text-pink-400',
    },
    html: {
        icon: FaHtml5,
        iconClassName: 'text-orange-500',
    },
    css: {
        icon: FaCss3Alt,
        iconClassName: 'text-blue-400',
    },
    javascript: {
        icon: SiJavascript,
        iconClassName: 'text-yellow-300',
    },
    typescript: {
        icon: SiTypescript,
        iconClassName: 'text-sky-400',
    },
    react: {
        icon: FaReact,
        iconClassName: 'text-cyan-400',
    },
    'react.js': {
        icon: FaReact,
        iconClassName: 'text-cyan-400',
    },
    next: {
        icon: SiNextdotjs,
        iconClassName: 'text-slate-200',
    },
    'next.js': {
        icon: SiNextdotjs,
        iconClassName: 'text-slate-200',
    },
    java: {
        icon: FaJava,
        iconClassName: 'text-orange-400',
    },
    postgresql: {
        icon: SiPostgresql,
        iconClassName: 'text-blue-300',
    },
    tailwind: {
        icon: SiTailwindcss,
        iconClassName: 'text-cyan-300',
    },
    'tailwind css': {
        icon: SiTailwindcss,
        iconClassName: 'text-cyan-300',
    },
};

const normalizeSkillName = (skill: string) => skill.trim().toLowerCase();

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
                            enlace: ensureValidUrl(p.evidence_url || fallBackLink)
                        };
                    }),
                    experiencia: [],
                    skills: (u.skills || []).map((s: any) => s.name),
                    status: 'Pendiente',
                    imagen_profile: u.imagen_profile
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
    };

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
                <div className={`${cardBaseClass} overflow-x-auto`}>
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Gestionar Usuarios</h3>
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
                            {users.map((user) => {
                                const portfolio = getPortfolioByUserId(user.id);
                                return (
                                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                                        <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                                        <td className="px-2 py-3">{user.email}</td>
                                        <td className="px-2 py-3">{getStatusBadge(user.status)}</td>
                                        <td className="px-2 py-3">
                                            {portfolio ? (
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
                            })}
                        </tbody>
                    </table>
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
                            {/* HEADER COVER */}
                            <div className="relative h-40 sm:h-36 w-full shrink-0">
                                <div className="absolute inset-0 bg-gradient-to-br from-teal-500 via-emerald-600 to-emerald-800 opacity-90"></div>
                                
                                <button
                                    onClick={closePortfolioModal}
                                    className="absolute top-4 right-4 rounded-full bg-black/20 p-2 text-white backdrop-blur-md transition-all hover:bg-black/40 hover:scale-105 z-10 shadow-sm"
                                    title="Cerrar"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                                {/* Avatar Overlay */}
                                <div className="absolute -bottom-14 sm:-bottom-20 left-6 sm:left-10 h-28 w-28 sm:h-40 sm:w-40 rounded-full border-4 border-slate-50 dark:border-[#121c22] bg-white dark:bg-slate-800 flex items-center justify-center shadow-lg z-10 transition-transform hover:scale-105 duration-300 overflow-hidden">
                                    {selectedPortfolio.imagen_profile ? (
                                        <img 
                                            src={selectedPortfolio.imagen_profile} 
                                            alt={selectedPortfolio.nombre} 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-5xl sm:text-7xl font-black bg-gradient-to-br from-emerald-500 to-teal-700 bg-clip-text text-transparent">
                                            {selectedPortfolio.nombre.charAt(0)}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* CONTENT BODY */}
                            <div className="px-6 sm:px-16 pt-10 sm:pt-5 pb-8">
                            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:pl-36">
                                <div className="min-w-0">
                                    <h2 className="text-2xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                        {selectedPortfolio.nombre}
                                    </h2>
                                    <p className="mt-1 text-sm sm:text-base font-semibold text-emerald-600 dark:text-emerald-400">
                                        {selectedPortfolio.rol}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 bg-white dark:bg-slate-800/80 py-2 px-4 rounded-full shadow-sm border border-slate-200/60 dark:border-slate-700/60 self-start sm:self-auto">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Estado
                                    </span>
                                    {getStatusBadge(selectedPortfolio.status)}
                                </div>
                            </div>
                            
                            <div className="grid gap-6 lg:gap-8 md:grid-cols-12 mt-8">
                                {/* LEFT COLUMN: Info */}
                                <div className="md:col-span-5 lg:col-span-4 space-y-6">
                                    {/* Contact Card */}
                                    <div className="rounded-2xl border border-[#1d4254] bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_28px_rgba(20,215,163,0.05),0_10px_30px_rgba(0,0,0,0.18)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_0_34px_rgba(20,215,163,0.07),0_14px_34px_rgba(0,0,0,0.22)]">                                        
                                        <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                                            <ContactRound className="h-4 w-4" />
                                            Contacto
                                        </h3>
                                        <div className="space-y-5">
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(20,215,163,0.06)] transition-transform hover:-translate-y-1 duration-300">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ubicación</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{selectedPortfolio.ciudad}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(20,215,163,0.06)] transition-transform hover:-translate-y-1 duration-300">
                                                    <Mail className="h-5 w-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Correo</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-full hover:text-emerald-600 transition-colors cursor-pointer">{selectedPortfolio.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-emerald-400/10 bg-emerald-500/10 text-emerald-400 shadow-[inset_0_0_12px_rgba(20,215,163,0.06)] transition-transform hover:-translate-y-1 duration-300">
                                                    <Phone className="h-5 w-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Teléfono</p>
                                                    <p className="font-semibold text-slate-900 dark:text-white truncate hover:text-emerald-600 transition-colors cursor-pointer">{selectedPortfolio.telefono}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Bio Card */}
                                    <div className="rounded-2xl border border-[#1d4254] bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_28px_rgba(20,215,163,0.05),0_10px_30px_rgba(0,0,0,0.18)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_0_34px_rgba(20,215,163,0.07),0_14px_34px_rgba(0,0,0,0.22)]">
                                        <h3 className="mb-5 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                                            <User className="h-4 w-4" />
                                            Sobre mi
                                        </h3>
                                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                                            {selectedPortfolio.bio}
                                        </p>
                                    </div>
                                    
                                    {/* Skills Card */}
                                    <div className="rounded-2xl border border-[#1d4254] bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_28px_rgba(20,215,163,0.05),0_10px_30px_rgba(0,0,0,0.18)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_0_34px_rgba(20,215,163,0.07),0_14px_34px_rgba(0,0,0,0.22)]">
                                        <h3 className="mb-4 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                                            <Sparkles className="h-4 w-4" />
                                            Habilidades ({selectedPortfolio.skills.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedPortfolio.skills.map((skill) => {
                                                const skillMeta = skillMetaMap[normalizeSkillName(skill)];
                                                const Icon = skillMeta?.icon;
                                                const iconClassName = skillMeta?.iconClassName ?? 'text-emerald-300';

                                                return (
                                                    <span
                                                        key={skill}
                                                        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-[#102637] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[inset_0_0_12px_rgba(20,215,163,0.05)] transition-all hover:border-emerald-400/30 hover:bg-[#133042] cursor-default"
                                                    >
                                                        {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                                                        <span>{skill}</span>
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                                
                                {/* RIGHT COLUMN: Projects & Experience */}
                                <div className="md:col-span-7 lg:col-span-8 space-y-6">
                                    {/* Projects Card */}
                                    <div className="rounded-2xl border border-[#1d4254] bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.03),inset_0_0_28px_rgba(20,215,163,0.05),0_10px_30px_rgba(0,0,0,0.18)] transition-all hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.04),inset_0_0_34px_rgba(20,215,163,0.07),0_14px_34px_rgba(0,0,0,0.22)]">
                                        <h3 className="mb-6 flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide text-emerald-400">
                                            <FolderOpen className="h-4 w-4" />
                                            Proyectos Destacados
                                        </h3>
                                        <div className="grid gap-4">
                                            {selectedPortfolio.proyectos.map((proyecto) => (
                                                <div key={proyecto.id} className="group relative overflow-hidden rounded-2xl border border-[#1d4254] bg-[linear-gradient(135deg,#102634_0%,#0b1f30_55%,#0c2236_100%)] p-5 transition-all hover:border-emerald-300/30 hover:bg-emerald-500/5 hover:shadow-md">
                                                    <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                                                        <div>
                                                            <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors text-base">{proyecto.titulo}</h4>
                                                            <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{proyecto.descripcion}</p>
                                                        </div>
                                                        {proyecto.enlace !== '#' ? (
                                                            <a
                                                                href={proyecto.enlace}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/25 bg-[#13243a] px-5 py-2.5 text-sm font-bold text-emerald-300 shadow-[inset_0_0_12px_rgba(20,215,163,0.05),0_0_0_1px_rgba(20,215,163,0.06)] transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_18px_rgba(20,215,163,0.20)] active:border-emerald-600 active:bg-emerald-600 active:text-white active:shadow-[0_0_20px_rgba(20,215,163,0.24)]"
                                                            >
                                                                <ExternalLink className="h-4 w-4" />
                                                                Visitar
                                                            </a>
                                                        ) : (
                                                            <span className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-slate-700/50 bg-[#13243a]/50 px-5 py-2.5 text-sm font-bold text-slate-500 cursor-not-allowed">
                                                                <ExternalLink className="h-4 w-4 opacity-50" />
                                                                Sin Link
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="mt-5 flex flex-wrap gap-2">
                                                        {proyecto.tecnologias.map((tech) => {
                                                            const techMeta = skillMetaMap[normalizeSkillName(tech)];
                                                            const Icon = techMeta?.icon;
                                                            const iconClassName = techMeta?.iconClassName ?? 'text-emerald-300';

                                                            return (
                                                                <span
                                                                    key={tech}
                                                                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/15 bg-[#102637] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-[inset_0_0_12px_rgba(20,215,163,0.05)] transition-all hover:border-emerald-400/30 hover:bg-[#133042] cursor-default"
                                                                >
                                                                    {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${iconClassName}`} />}
                                                                    <span>{tech}</span>
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Experience timeline (Deshabilitada temporalmente) */}
                                </div>
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
                                    onClick={() => alert('Modo lectura: No puedes rechazar portafolios por el momento.')}
                                    
                                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl !border !border-rose-400/10 !bg-[#13243a] px-5 py-2.5 text-sm font-bold !text-rose-300 shadow-[inset_0_0_35px_rgba(186,4,4,0.22),0_0_0_1px_rgba(186,4,4,0.30),0_0_10px_rgba(186,4,4,0.15)] transition-all duration-200 hover:!border-[#9C0000] hover:!bg-[#13243a] hover:!text-rose-300 hover:shadow-[inset_0_0_30px_rgba(244,63,94,0.25),0_0_12px_rgba(244,63,94,0.15),0_0_20px_rgba(244,63,94,0.20)] active:!border-[#e11d48] active:!bg-[#13243a] active:!text-rose-300 active:shadow-[inset_0_0_30px_rgba(244,63,94,0.35),0_0_16px_rgba(244,63,94,0.20),0_0_26px_rgba(244,63,94,0.25)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                >
                                    Rechazar
                                </Button>
                                
                                <Button
                                    variant="secondary"
                                    icon={Check}
                                    onClick={() => alert('Modo lectura: No puedes aprobar portafolios por el momento.')}
                                    className="flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/25 bg-[#13243a] px-5 py-2.5 text-sm font-bold text-emerald-300 shadow-[inset_0_0_12px_rgba(20,215,163,0.05),0_0_0_1px_rgba(20,215,163,0.06)] transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-[0_0_18px_rgba(20,215,163,0.20)] active:border-emerald-600 active:bg-emerald-600 active:text-white active:shadow-[0_0_20px_rgba(20,215,163,0.24)] focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
                                >
                                    Aprobar Portafolio
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

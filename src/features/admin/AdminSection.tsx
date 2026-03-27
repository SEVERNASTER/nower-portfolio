import React, {
  useMemo,
  useState,
} from 'react';

import {
  Check,
  FileText,
  X,
} from 'lucide-react';
import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type AdminSectionKey =
    | 'metrics'
    | 'users'
    | 'profiles'
    | 'moderation'
    | 'publish'
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

interface PublicationRequest {
    id: string;
    owner: string;
    portfolioName: string;
    status: 'Pendiente' | 'Aprobada' | 'Rechazada';
    requestedAt: string;
    preview: string;
}

const sectionItems: Array<{
    key: AdminSectionKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}> = [];

const initialUsers: AdminUser[] = [
    { id: 'USR-001', name: 'Ana Rojas', email: 'ana.rojas@nower.com', status: 'Activo', registeredAt: '2026-01-12' },
    { id: 'USR-002', name: 'Carlos Vega', email: 'carlos.vega@nower.com', status: 'Inactivo', registeredAt: '2026-01-30' },
    { id: 'USR-003', name: 'Daniela Lima', email: 'daniela.lima@nower.com', status: 'Activo', registeredAt: '2026-02-14' },
    { id: 'USR-004', name: 'Mateo Perez', email: 'mateo.perez@nower.com', status: 'Inactivo', registeredAt: '2026-02-20' }
];

const profiles: AdminProfile[] = [
    {
        id: 'PRF-001',
        owner: 'Ana Rojas',
        role: 'Frontend Developer',
        city: 'Cochabamba',
        portfolioUrl: 'https://nower.io/ana-rojas',
        updatedAt: '2026-03-08'
    },
    {
        id: 'PRF-002',
        owner: 'Carlos Vega',
        role: 'Backend Engineer',
        city: 'La Paz',
        portfolioUrl: 'https://nower.io/carlos-vega',
        updatedAt: '2026-03-11'
    },
    {
        id: 'PRF-003',
        owner: 'Daniela Lima',
        role: 'UI/UX Designer',
        city: 'Santa Cruz',
        portfolioUrl: 'https://nower.io/daniela-lima',
        updatedAt: '2026-03-15'
    }
];

const initialModerationProjects: ModerationProject[] = [
    { id: 'PROJ-101', title: 'Marketplace API', owner: 'Ana Rojas', status: 'En revision', submittedAt: '2026-03-18' },
    { id: 'PROJ-102', title: 'DataViz Dashboard', owner: 'Carlos Vega', status: 'En revision', submittedAt: '2026-03-20' },
    { id: 'PROJ-103', title: 'UX Redesign Kit', owner: 'Daniela Lima', status: 'Aprobado', submittedAt: '2026-03-10' }
];

const initialPublicationRequests: PublicationRequest[] = [
    {
        id: 'PUB-401',
        owner: 'Ana Rojas',
        portfolioName: 'Portfolio Frontend 2026',
        status: 'Pendiente',
        requestedAt: '2026-03-19',
        preview: 'Landing personal con proyectos React, stack y experiencia.'
    },
    {
        id: 'PUB-402',
        owner: 'Mateo Perez',
        portfolioName: 'Backend & Cloud Portfolio',
        status: 'Pendiente',
        requestedAt: '2026-03-21',
        preview: 'Portafolio tecnico con APIs, CI/CD y arquitectura de microservicios.'
    }
];

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

export const AdminSection: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [users, setUsers] = useState<AdminUser[]>(initialUsers);
    const [moderationProjects, setModerationProjects] = useState<ModerationProject[]>(initialModerationProjects);
    const [publicationRequests, setPublicationRequests] = useState<PublicationRequest[]>(initialPublicationRequests);

    const sectionByPath: Record<string, AdminSectionKey> = {
        '/admin/metrics': 'metrics',
        '/admin/users': 'users',
        '/admin/profiles': 'profiles',
        '/admin/moderation': 'moderation',
        '/admin/publicaciones': 'publish',
        '/admin/reportes': 'reports'
    };

    const activeSection = sectionByPath[location.pathname] ?? 'metrics';

    const metrics = useMemo(() => {
        const registeredUsers = users.length;
        // Demo: portafolios = solicitudes aprobadas + un baseline.
        const publishedPortfolios = publicationRequests.filter((request) => request.status === 'Aprobada').length + 12;
        const projectsInReview = moderationProjects.filter((project) => project.status === 'En revision').length;
        const disabledAccounts = users.filter((user) => user.status === 'Inactivo').length;

        return { registeredUsers, publishedPortfolios, projectsInReview, disabledAccounts };
    }, [users, moderationProjects, publicationRequests]);

    const toggleUserStatus = (userId: string) => {
        setUsers((prev) =>
            prev.map((user) =>
                user.id === userId ? { ...user, status: user.status === 'Activo' ? 'Inactivo' : 'Activo' } : user
            )
        );
    };

    const updateProjectStatus = (projectId: string, status: 'Aprobado' | 'Rechazado') => {
        setModerationProjects((prev) => prev.map((project) => (project.id === projectId ? { ...project, status } : project)));
    };

    const updatePublicationStatus = (requestId: string, status: 'Aprobada' | 'Rechazada') => {
        setPublicationRequests((prev) => prev.map((request) => (request.id === requestId ? { ...request, status } : request)));
    };

    const exportReports = () => {
        const rows = [
            ['metric', 'value'],
            ['usuarios_registrados', String(metrics.registeredUsers)],
            ['portafolios_publicados', String(metrics.publishedPortfolios)],
            ['proyectos_en_revision', String(metrics.projectsInReview)],
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

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sectionItems.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => {
                            const pathBySection: Record<AdminSectionKey, string> = {
                                metrics: '/admin/metrics',
                                users: '/admin/users',
                                profiles: '/admin/profiles',
                                moderation: '/admin/moderation',
                                publish: '/admin/publicaciones',
                                reports: '/admin/reportes'
                            };
                            navigate(pathBySection[key]);
                        }}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
                            activeSection === key
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-300 dark:border-slate-700 dark:bg-[#17262C] dark:text-slate-300'
                        }`}
                    >
                        <Icon className="h-4 w-4" />
                        {label}
                    </button>
                ))}
            </div>

            {activeSection === 'metrics' && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Usuarios registrados</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.registeredUsers}</p>
                    </div>
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Portafolios publicados</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.publishedPortfolios}</p>
                    </div>
                    <div className={cardBaseClass}>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Proyectos en revisión</p>
                        <p className="mt-2 text-3xl font-black text-slate-900 dark:text-white">{metrics.projectsInReview}</p>
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
                                <th className="px-2 py-3 text-left">Registro</th>
                                <th className="px-2 py-3 text-left">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white">{user.name}</td>
                                    <td className="px-2 py-3">{user.email}</td>
                                    <td className="px-2 py-3">{getStatusBadge(user.status)}</td>
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
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'profiles' && (
                <div className={`${cardBaseClass} overflow-x-auto`}>
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Gestionar Perfiles</h3>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-2 py-3 text-left">Propietario</th>
                                <th className="px-2 py-3 text-left">Rol</th>
                                <th className="px-2 py-3 text-left">Ciudad</th>
                                <th className="px-2 py-3 text-left">Portafolio</th>
                                <th className="px-2 py-3 text-left">Actualizado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {profiles.map((profile) => (
                                <tr key={profile.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white">{profile.owner}</td>
                                    <td className="px-2 py-3">{profile.role}</td>
                                    <td className="px-2 py-3">{profile.city}</td>
                                    <td className="px-2 py-3">
                                        <a
                                            className="text-emerald-600 hover:underline dark:text-emerald-400"
                                            href={profile.portfolioUrl}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            Ver portafolio
                                        </a>
                                    </td>
                                    <td className="px-2 py-3">{profile.updatedAt}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'moderation' && (
                <div className={`${cardBaseClass} overflow-x-auto`}>
                    <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Moderar Proyectos</h3>
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                                <th className="px-2 py-3 text-left">Proyecto</th>
                                <th className="px-2 py-3 text-left">Usuario</th>
                                <th className="px-2 py-3 text-left">Estado</th>
                                <th className="px-2 py-3 text-left">Fecha</th>
                                <th className="px-2 py-3 text-left">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moderationProjects.map((project) => (
                                <tr key={project.id} className="border-b border-slate-100 dark:border-slate-800">
                                    <td className="px-2 py-3 font-semibold text-slate-900 dark:text-white">{project.title}</td>
                                    <td className="px-2 py-3">{project.owner}</td>
                                    <td className="px-2 py-3">{getStatusBadge(project.status)}</td>
                                    <td className="px-2 py-3">{project.submittedAt}</td>
                                    <td className="px-2 py-3">
                                        <div className="flex flex-wrap gap-2">
                                            <Button variant="secondary" icon={Check} onClick={() => updateProjectStatus(project.id, 'Aprobado')}>
                                                Aprobar
                                            </Button>
                                            <Button variant="outline" icon={X} onClick={() => updateProjectStatus(project.id, 'Rechazado')}>
                                                Rechazar
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeSection === 'publish' && (
                <div className="space-y-4">
                    {publicationRequests.map((request) => (
                        <article key={request.id} className={cardBaseClass}>
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{request.portfolioName}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Solicitante: {request.owner} - {request.requestedAt}
                                    </p>
                                    <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">Vista previa: {request.preview}</p>
                                </div>
                                <div>{getStatusBadge(request.status)}</div>
                            </div>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <Button variant="secondary" icon={Check} onClick={() => updatePublicationStatus(request.id, 'Aprobada')}>
                                    Aprobar Publicación
                                </Button>
                                <Button variant="outline" icon={X} onClick={() => updatePublicationStatus(request.id, 'Rechazada')}>
                                    Rechazar
                                </Button>
                            </div>
                        </article>
                    ))}
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
                            <p className="mt-1 text-sm">Publicados: {metrics.publishedPortfolios}</p>
                            <p className="text-sm">
                                Pendientes: {publicationRequests.filter((request) => request.status === 'Pendiente').length}
                            </p>
                        </div>
                    </div>
                    <Button icon={FileText} onClick={exportReports}>
                        Exportar CSV
                    </Button>
                </div>
            )}
        </section>
    );
};


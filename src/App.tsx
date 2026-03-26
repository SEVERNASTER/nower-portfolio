import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';
import { BasicProfile } from './features/profile/BasicProfile';
import { ProjectsList } from './features/projects/ProjectsList';
import { SkillsList } from './features/skills/SkillsList';
import { ExperienceList } from './features/experience/ExperienceList';
import { AdminSection } from './features/admin/AdminSection';
import {
    BarChart3,
    Briefcase,
    Code,
    FileText,
    FolderCheck,
    FolderGit2,
    ShieldCheck,
    User,
    UserCog,
    Users
} from 'lucide-react';
import type { NavItem } from './components/navigation/Sidebar';
import { LoginPage } from './components/pages/LoginPage';

// ==========================================
// APP
// ==========================================

const navItemsUser: NavItem[] = [
    { name: 'Perfil Básico', icon: User, path: '/profile' },
    { name: 'Proyectos', icon: FolderGit2, badge: '2', path: '/projects' },
    { name: 'Habilidades', icon: Code, path: '/skills' },
    { name: 'Experiencia', icon: Briefcase, path: '/experience' }
];

const navItemsAdmin: NavItem[] = [
    { name: 'Métricas del Sistema', icon: BarChart3, path: '/admin/metrics' },
    { name: 'Gestionar Usuarios', icon: UserCog, path: '/admin/users' },
    { name: 'Gestionar Perfiles', icon: Users, path: '/admin/profiles' },
    { name: 'Moderar Proyectos', icon: ShieldCheck, path: '/admin/moderation' },
    { name: 'Aprobar Publicaciones', icon: FolderCheck, path: '/admin/publicaciones' },
    { name: 'Generar Reportes', icon: FileText, path: '/admin/reportes' }
];

type Role = 'ADMIN' | string;

const AppContent: React.FC<{
    isLoggedIn: boolean;
    role: Role | null;
    onLogin: () => void;
}> = ({ isLoggedIn, role, onLogin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const isAdmin = role === 'ADMIN';
    const navItems = isAdmin ? navItemsAdmin : navItemsUser;
    const landingPath = isAdmin ? '/admin/metrics' : '/profile';

    // Determine active tab by matching current path
    const activeItem = navItems.find((item) => item.path === location.pathname);
    const activeTab = activeItem ? activeItem.name : (navItems[0]?.name ?? '');

    const handleTabChange = (name: string) => {
        const item = navItems.find((n) => n.name === name);
        if (item && item.path) {
            navigate(item.path);
        }
    };

    if (!isLoggedIn) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    if (role === null) {
        return (
            <Routes>
                <Route path="/login" element={<LoginPage onLogin={onLogin} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        );
    }

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange} navItems={navItems}>
            <Routes>
                <Route path="/" element={<Navigate to={landingPath} replace />} />
                <Route path="/login" element={<Navigate to={landingPath} replace />} />

                <Route path="/profile" element={<BasicProfile />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/skills" element={<SkillsList />} />
                <Route path="*" element={
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="rounded-full bg-slate-100 dark:bg-[#10221C] p-4 mb-4">
                            <Code className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Próximamente</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">Esta sección está en desarrollo y estará disponible pronto.</p>
                    </div>
                } />
                <Route path="/experience" element={<ExperienceList />} />

                {/* Admin routes (visible only when role === ADMIN) */}
                <Route
                    path="/admin/metrics"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
                <Route
                    path="/admin/users"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
                <Route
                    path="/admin/profiles"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
                <Route
                    path="/admin/moderation"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
                <Route
                    path="/admin/publicaciones"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
                <Route
                    path="/admin/reportes"
                    element={isAdmin ? <AdminSection /> : <Navigate to={landingPath} replace />}
                />
            </Routes>
        </DashboardLayout>
    );
};

const App: React.FC = () => {
    // Auth state detectada por cookie (token en Backend con setcookie).
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState<Role | null>(null);

    // Nota: intencionalmente no validamos la sesión por cookie al iniciar,
    // para que "si o si" el usuario pase por el login antes de entrar
    // al panel de admin. (La cookie puede persistir entre reinicios.)

    return (
        <BrowserRouter>
            <AppContent
                isLoggedIn={isLoggedIn}
                role={role}
                onLogin={async () => {
                    // Re-consulta /api/auth/me para que el role quede sincronizado tras el login.
                    try {
                        const res = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
                        const data = await res.json().catch(() => ({}));

                        if (!res.ok || data?.authenticated !== true) {
                            setIsLoggedIn(false);
                            setRole(null);
                            return;
                        }

                        // Importante: primero el role (para evitar redirect incorrecto).
                        setRole((data?.role as Role | null) ?? null);
                        setIsLoggedIn(true);
                    } catch {
                        setIsLoggedIn(false);
                        setRole(null);
                    }
                }}
            />
        </BrowserRouter>
    );
};

export default App;

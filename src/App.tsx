import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from './components/layouts/DashboardLayout';
import { BasicProfile } from './features/profile/BasicProfile';
import { ProjectsList } from './features/projects/ProjectsList';
import { SkillsList } from './features/skills/SkillsList';
import { User, FolderGit2, Code, Briefcase } from 'lucide-react';
import type { NavItem } from './components/navigation/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { ExperienceList } from './features/experience/ExperienceList';
import { RegisterPage } from './components/pages/RegisterPage';

// ==========================================
// APP
// ==========================================

const navItems: NavItem[] = [
    { name: 'Perfil Básico', icon: User, path: '/profile' },
    { name: 'Proyectos', icon: FolderGit2, badge: '2', path: '/projects' },
    { name: 'Habilidades', icon: Code, path: '/skills' },
    { name: 'Experiencia', icon: Briefcase, path: '/experience' }, // Assuming it might exist soon
];

const AppContent: React.FC<{ isLoggedIn: boolean, onLogin: () => void }> = ({ isLoggedIn, onLogin }) => {
    const location = useLocation();
    const navigate = useNavigate();

    // Determine active tab by matching current path
    const activeItem = navItems.find((item) => item.path === location.pathname);
    const activeTab = activeItem ? activeItem.name : 'Perfil Básico';

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
                <Route path="/register" element={<RegisterPage onLogin={onLogin} />} />
            </Routes>
        );
    }

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange} navItems={navItems}>
            <Routes>
                <Route path="/" element={<Navigate to="/profile" replace />} />
                <Route path="/login" element={<Navigate to="/profile" replace />} />
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
            </Routes>
        </DashboardLayout>
    );
};

const App: React.FC = () => {
    // Auth state detectada por cookie (token en Backend con setcookie).
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        fetch('/api/auth/me', { method: 'GET', credentials: 'include' })
            .then(async (res) => {
                if (!res.ok) {
                    setIsLoggedIn(false);
                    return;
                }
                setIsLoggedIn(true);
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    return (
        <BrowserRouter>
            <AppContent isLoggedIn={isLoggedIn} onLogin={() => setIsLoggedIn(true)} />
        </BrowserRouter>
    );
};

export default App;

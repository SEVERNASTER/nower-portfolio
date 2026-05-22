import React, {
  useEffect,
  useState,
} from 'react';

import {
  Award,
  BarChart,
  Briefcase,
  Code,
  FolderGit2,
  Globe,
  PieChart,
  User,
  Users,
} from 'lucide-react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  AuthenticateWithRedirectCallback,
  SignedIn,
  SignedOut,
  useUser,
} from '@clerk/clerk-react';

import DashboardLayout from './components/layouts/DashboardLayout';
import type { NavItem } from './components/navigation/Sidebar';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { AchievementsList } from './features/achievements/AchievementsList';
import { AdminSection } from './features/admin/AdminSection';
import { ExperienceList } from './features/experience/ExperienceList';
import { PortfolioVisibility } from './features/portfolio/PortfolioVisibility';
import { PublicPortfolioPage } from './features/portfolio/PublicPortfolioPage';
import { BasicProfile } from './features/profile/BasicProfile';
import { ProjectsList } from './features/projects/ProjectsList';
import { SkillsList } from './features/skills/SkillsList';
import { LandingPage } from './features/landing/LandingPage';

const baseNavItems: NavItem[] = [
  { name: "Perfil Básico", icon: User, path: "/profile" },
  { name: "Proyectos", icon: FolderGit2, path: "/projects" },
  { name: "Habilidades", icon: Code, path: "/skills" },
  { name: "Experiencia", icon: Briefcase, path: "/experience" },
  { name: "Logros", icon: Award, path: "/achievements" },
  { name: "Visibilidad Pública", icon: Globe, path: "/portfolio/visibility" },
];

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(localStorage.getItem('userRole'));

  React.useEffect(() => {
    if (isLoaded && !user) {
      localStorage.removeItem('userRole');
    }
  }, [user, isLoaded]);

  React.useEffect(() => {
    // Si sabemos que es admin y la ruta actual no es del panel de admin, una ruta pública ni está procesando SSO
    const isPublicRoute = location.pathname === '/' || location.pathname.startsWith('/p/');
    if (userRole === 'admin' && !location.pathname.startsWith('/admin') && !isPublicRoute && !location.pathname.includes('sso-callback')) {
      navigate('/admin/metrics', { replace: true });
    }
  }, [userRole, location.pathname, navigate]);

  const adminNavItems: NavItem[] = userRole === 'admin' ? [
    { name: "Métricas", icon: BarChart, path: "/admin/metrics" },
    { name: "Usuarios", icon: Users, path: "/admin/users" },
    { name: "Reportes", icon: PieChart, path: "/admin/reportes" },
  ] : [];

  const navItems = userRole === 'admin' ? adminNavItems : baseNavItems;

  const activeItem = navItems.find((item) => location.pathname.startsWith(item.path!));
  const activeTab = activeItem ? activeItem.name : "Perfil Básico";

  const handleTabChange = (name: string) => {
    const item = navItems.find((n) => n.name === name);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (synced) return;

    syncBackendUser(user);
    setSynced(true);
  }, [user, isLoaded, synced]);

  async function syncBackendUser(user: any) {
    try {
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) return;


      const res = await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          clerk_id: user.id,
          full_name: user.fullName || user.firstName,
          email,
        }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        const role = data.user.role;
        setUserRole(role);
        localStorage.setItem('userRole', role);
      }
      console.log(" Guardado en BD:", data);
    } catch (error) {
      console.error("Error sincronizando usuario en backend:", error);
    }
  }
  return (
    <Routes>
      <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
      <Route path="/p/:slug" element={<PublicPortfolioPage />} />
      {/* PUBLIC LANDING PAGE — no auth required */}
      <Route path="/" element={<LandingPage />} />
      {/* PUBLIC ROUTES (Wrapped in SignedOut) */}
      <Route
        path="/login"
        element={
          <SignedOut>
            <LoginPage />
          </SignedOut>
        }
      />
      <Route
        path="/register"
        element={
          <SignedOut>
            <RegisterPage />
          </SignedOut>
        }
      />

      {/* PROTECTED ROUTES (Wrapped in SignedIn) */}
      <Route
        path="/*"
        element={
          <>
            <SignedIn>
              <Routes>
                {/* RUTAS CON DASHBOARD */}
                <Route
                  path="*"
                  element={
                    <DashboardLayout
                      activeTab={activeTab}
                      setActiveTab={handleTabChange}
                      navItems={navItems}
                    >
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/profile" replace />}
                        />
                        <Route path="/profile" element={<BasicProfile />} />
                        <Route path="/projects" element={<ProjectsList />} />
                        <Route path="/skills" element={<SkillsList />} />
                        <Route path="/experience" element={<ExperienceList />} />
                        <Route path="/achievements" element={<AchievementsList />} />
                        <Route path="/portfolio/visibility" element={<PortfolioVisibility />} />
                        
                        {/* RUTAS DE ADMIN DENTRO DEL DASHBOARD */}
                        {userRole === 'admin' ? (
                          <Route path="/admin/*" element={<AdminSection />} />
                        ) : (
                          <Route path="/admin/*" element={<Navigate to="/profile" replace />} />
                        )}

                        <Route
                          path="*"
                          element={
                            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                              <div className="rounded-full bg-slate-100 dark:bg-[#10221C] p-4 mb-4">
                                <Code className="h-8 w-8 text-emerald-500" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                Próximamente
                              </h3>
                              <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                                Esta sección está en desarrollo y estará disponible
                                pronto.
                              </p>
                            </div>
                          }
                        />
                      </Routes>
                    </DashboardLayout>
                  }
                />
              </Routes>
            </SignedIn>

            {/* If signed out and trying to access a protected route, redirect to login */}
            <SignedOut>
              <Navigate to="/login" replace />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  AuthenticateWithRedirectCallback,
  SignedIn,
  SignedOut,
  useAuth,
  useUser,
} from "@clerk/clerk-react";
import {
  User,
  FolderGit2,
  Code,
  Briefcase,
  BarChart,
  Users,
  PieChart,
  Award,
  Lock,
  Globe,
} from "lucide-react";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { ProtectedAppGate } from "./components/auth/ProtectedAppGate";
import type { NavItem } from "./components/navigation/Sidebar";
import { LoginPage } from "./components/pages/LoginPage";
import { RegisterPage } from "./components/pages/RegisterPage";
import { BasicProfile } from "./features/profile/BasicProfile";
import { ProjectsList } from "./features/projects/ProjectsList";
import { SkillsList } from "./features/skills/SkillsList";
import { AdminSection } from "./features/admin/AdminSection";
import { ExperienceList } from "./features/experience/ExperienceList";
import { AchievementsList } from "./features/achievements/AchievementsList";
import { PortfolioVisibility } from "./features/portfolio/PortfolioVisibility";
import { PublicPortfolioPage } from "./features/portfolio/PublicPortfolioPage";
import { LandingPage } from "./features/landing/LandingPage";
import PasswordSettings from "./features/settings/components/PasswordSettings";
import {
  notifyCredentialsEmailSent,
  notifyMandatoryPasswordChange,
  useNotification,
} from "./contexts/NotificationContext";
import { AuthStatusProvider, useAuthStatus } from "./contexts/AuthStatusContext";
import type { SyncUserResponse } from "./lib/apiTypes";

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
const PASSWORD_SETTINGS_PATH = "/settings/password";

const baseNavItems: NavItem[] = [
  { name: "Perfil Básico", icon: User, path: "/profile" },
  { name: "Proyectos", icon: FolderGit2, path: "/projects" },
  { name: "Habilidades", icon: Code, path: "/skills" },
  { name: "Experiencia", icon: Briefcase, path: "/experience" },
  { name: "Logros", icon: Award, path: "/achievements" },
  { name: "Visibilidad Pública", icon: Globe, path: "/portfolio/visibility" },
];

const settingsNavItems: NavItem[] = [
  { name: "Contraseña", icon: Lock, path: PASSWORD_SETTINGS_PATH },
];

/** Rutas de login/registro: redirige si ya hay sesión; evita pantalla en blanco con SignedOut. */
const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#0B1120]">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Cargando...
        </p>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const SignedInApp: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoaded } = useUser();
  const { showNotification } = useNotification();
  const { mustChangePassword, applyMustChangePassword, refresh } = useAuthStatus();
  const [synced, setSynced] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(
    localStorage.getItem("userRole"),
  );

  React.useEffect(() => {
    if (isLoaded && !user) {
      localStorage.removeItem("userRole");
    }
  }, [user, isLoaded]);

  React.useEffect(() => {
    if (mustChangePassword) return;

    const isPublicRoute =
      location.pathname === "/" || location.pathname.startsWith("/p/");
    if (
      userRole === "admin" &&
      !location.pathname.startsWith("/admin") &&
      !isPublicRoute &&
      !location.pathname.includes("sso-callback")
    ) {
      navigate("/admin/metrics", { replace: true });
    }
  }, [userRole, mustChangePassword, location.pathname, navigate]);

  React.useEffect(() => {
    if (
      mustChangePassword &&
      user &&
      location.pathname === PASSWORD_SETTINGS_PATH
    ) {
      notifyMandatoryPasswordChange(showNotification, user.id);
    }
  }, [mustChangePassword, location.pathname, showNotification, user?.id]);

  const adminNavItems: NavItem[] =
    userRole === "admin"
      ? [
          { name: "Métricas", icon: BarChart, path: "/admin/metrics" },
          { name: "Usuarios", icon: Users, path: "/admin/users" },
          { name: "Reportes", icon: PieChart, path: "/admin/reportes" },
        ]
      : [];

  const navItems = userRole === "admin" ? adminNavItems : baseNavItems;
  const allNavItems = [...navItems, ...settingsNavItems];

  const activeItem = allNavItems.find(
    (item) => item.path && location.pathname.startsWith(item.path),
  );
  const activeTab =
    activeItem?.name ??
    (mustChangePassword
      ? "Contraseña"
      : userRole === "admin"
        ? "Métricas"
        : "Perfil Básico");

  const handleTabChange = (name: string) => {
    const item = allNavItems.find((n) => n.name === name);
    if (item?.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;
    if (synced) return;
    syncBackendUser(user);
    setSynced(true);
  }, [user, isLoaded, synced]);

  async function syncBackendUser(clerkUser: NonNullable<ReturnType<typeof useUser>["user"]>) {
    try {
      const email = clerkUser.primaryEmailAddress?.emailAddress;
      if (!email) return;

      const res = await fetch(`${API_URL}/sync-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          clerk_id: clerkUser.id,
          full_name: clerkUser.fullName || clerkUser.firstName,
          email,
        }),
      });

      const data = (await res.json()) as SyncUserResponse;

      if (data.success && data.user) {
        if (data.user.role) {
          setUserRole(data.user.role);
          localStorage.setItem("userRole", data.user.role);
        }

        const mustChange = Boolean(data.user.must_change_password);
        applyMustChangePassword(mustChange);

        if (data.user.must_change_password === undefined) {
          await refresh();
        }

        if (data.credentials_email_sent) {
          notifyCredentialsEmailSent(showNotification, clerkUser.id, {
            sent: true,
            email: data.user.email ?? email,
          });
        }

        if (mustChange) {
          navigate(PASSWORD_SETTINGS_PATH, { replace: true });
        }
      }
    } catch (error) {
      console.error("Error sincronizando usuario en backend:", error);
    }
  }

  return (
    <ProtectedAppGate>
      <Routes>
        <Route
          path="*"
          element={
            <DashboardLayout
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              navItems={navItems}
              settingsNavItems={settingsNavItems}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route
                  path="/dashboard"
                  element={
                    mustChangePassword ? (
                      <Navigate to={PASSWORD_SETTINGS_PATH} replace />
                    ) : (
                      <Navigate
                        to={userRole === "admin" ? "/admin/metrics" : "/profile"}
                        replace
                      />
                    )
                  }
                />
                <Route path="/profile" element={<BasicProfile />} />
                <Route path="/projects" element={<ProjectsList />} />
                <Route path="/skills" element={<SkillsList />} />
                <Route path="/experience" element={<ExperienceList />} />
                <Route path="/achievements" element={<AchievementsList />} />
                <Route
                  path="/portfolio/visibility"
                  element={<PortfolioVisibility />}
                />
                <Route
                  path={PASSWORD_SETTINGS_PATH}
                  element={<PasswordSettings />}
                />

                {userRole === "admin" ? (
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
    </ProtectedAppGate>
  );
};

const AppContent: React.FC = () => (
  <Routes>
    <Route path="/sso-callback" element={<AuthenticateWithRedirectCallback />} />
    <Route path="/p/:slug" element={<PublicPortfolioPage />} />
    <Route path="/" element={<LandingPage />} />
    <Route
      path="/login"
      element={
        <GuestOnlyRoute>
          <LoginPage />
        </GuestOnlyRoute>
      }
    />
    <Route
      path="/register"
      element={
        <GuestOnlyRoute>
          <RegisterPage />
        </GuestOnlyRoute>
      }
    />
    <Route
      path="/*"
      element={
        <>
          <SignedIn>
            <AuthStatusProvider>
              <SignedInApp />
            </AuthStatusProvider>
          </SignedIn>
          <SignedOut>
            <Navigate to="/login" replace />
          </SignedOut>
        </>
      }
    />
  </Routes>
);

const App: React.FC = () => (
  <BrowserRouter>
    <AppContent />
  </BrowserRouter>
);

export default App;

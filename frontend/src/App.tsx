import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import DashboardLayout from "./components/layouts/DashboardLayout";
import { BasicProfile } from "./features/profile/BasicProfile";
import { ProjectsList } from "./features/projects/ProjectsList";
import { SkillsList } from "./features/skills/SkillsList";
import { User, FolderGit2, Code, Briefcase } from "lucide-react";
import type { NavItem } from "./components/navigation/Sidebar";
import { LoginPage } from "./components/pages/LoginPage";
import { ExperienceList } from "./features/experience/ExperienceList";
import { RegisterPage } from "./components/pages/RegisterPage";
import SsoCallback from "./components/pages/SsoCallback";

import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";

const navItems: NavItem[] = [
  { name: "Perfil Básico", icon: User, path: "/profile" },
  { name: "Proyectos", icon: FolderGit2, badge: "2", path: "/projects" },
  { name: "Habilidades", icon: Code, path: "/skills" },
  { name: "Experiencia", icon: Briefcase, path: "/experience" },
];

const AppContent: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isLoaded } = useUser();
  const [synced, setSynced] = useState(false);

  const activeItem = navItems.find((item) => item.path === location.pathname);
  const activeTab = activeItem ? activeItem.name : "Perfil Básico";

  const handleTabChange = (name: string) => {
    const item = navItems.find((n) => n.name === name);
    if (item && item.path) {
      navigate(item.path);
    }
  };
  useEffect(() => {
    if (!isLoaded || !user || synced) return;

    sendToBackend(user);
    setSynced(true);
  }, [user, isLoaded]);
  async function sendToBackend(user: any) {
    try {
      const email = user.primaryEmailAddress?.emailAddress;

      if (!email) return;

      if (!email.endsWith("@est.umss.edu")) {
        alert("Solo correos institucionales");
        return;
      }

      const res = await fetch("http://127.0.0.1:8000/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clerk_id: user.id,
          full_name: user.fullName || user.firstName,
          email: email,
        }),
      });

      const data = await res.json();
      console.log(" Guardado en BD:", data);
    } catch (error) {
      console.error(" Error enviando usuario:", error);
    }
  }

  return (
    <Routes>
      <Route path="/sso-callback" element={<SsoCallback />} />
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
            {/* If signed in, show the Dashboard Layout */}
            <SignedIn>
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

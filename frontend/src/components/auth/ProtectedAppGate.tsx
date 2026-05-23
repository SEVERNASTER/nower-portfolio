import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStatus } from "../../contexts/AuthStatusContext";

const PASSWORD_SETTINGS_PATH = "/settings/password";

type ProtectedAppGateProps = {
  children: React.ReactNode;
};

export const ProtectedAppGate: React.FC<ProtectedAppGateProps> = ({ children }) => {
  const { loading, mustChangePassword } = useAuthStatus();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-[#0B1120]">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Verificando tu cuenta...
        </p>
      </div>
    );
  }

  if (
    mustChangePassword &&
    !location.pathname.startsWith(PASSWORD_SETTINGS_PATH)
  ) {
    return <Navigate to={PASSWORD_SETTINGS_PATH} replace />;
  }

  return <>{children}</>;
};

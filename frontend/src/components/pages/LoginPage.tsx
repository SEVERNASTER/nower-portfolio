// src/components/pages/LoginPage.tsx
import React, { useState } from "react";
import { Eye, EyeOff, Lock, Layers, ShieldCheck } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSignIn } from "@clerk/clerk-react";
import { loginWithPassword } from "../../features/auth/authApi";


export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleAuthLoading, setIsGoogleAuthLoading] = useState(false);
  const [isMicrosoftAuthLoading, setIsMicrosoftAuthLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Handle errors from redirect (URL params)
  React.useEffect(() => {
    const errorParam = searchParams.get("error") || searchParams.get("clerk_error");
    if (errorParam) {
      if (errorParam === "access_denied" || errorParam.includes("not_allowed")) {
        setError(`Acceso denegado. Verifica tus permisos o inténtalo de nuevo.`);
      } else {
        setError("Error en el inicio de sesión. Por favor, intenta de nuevo.");
      }
      // Clear the error param from the URL for a cleaner experience
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [searchParams]);

  const { signIn, setActive, isLoaded } = useSignIn();

  const goAfterLogin = () => navigate("/dashboard", { replace: true });

  const getClerkError = (err: unknown) => {
    const clerkErr = err as {
      errors?: Array<{ code?: string; message?: string; longMessage?: string }>;
    };
    return clerkErr.errors?.[0];
  };

  const finishSignIn = async (
    result: { status: string | null; createdSessionId: string | null },
  ) => {
    if (result.status === "complete" && result.createdSessionId) {
      if (!setActive) {
        setError("No se pudo activar la sesión. Intenta de nuevo.");
        return false;
      }
      await setActive({ session: result.createdSessionId });
      goAfterLogin();
      return true;
    }
    if (result.status === "needs_second_factor") {
      setError("Revisa tu correo para completar la verificación de seguridad.");
      return true;
    }
    return false;
  };

  // Email/password: validar en backend (BD local) y abrir sesión Clerk con token ticket
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded || !signIn) return;
    setError("");
    setIsSubmitting(true);

    const trimmedEmail = email.trim();

    try {
      const { sign_in_token, role } = await loginWithPassword(
        trimmedEmail,
        password,
      );

      if (role) {
        localStorage.setItem("userRole", role);
      }

      const signInAttempt = await signIn.create({
        strategy: "ticket",
        ticket: sign_in_token,
      });

      if (!(await finishSignIn(signInAttempt))) {
        setError("Se requiere un paso adicional para iniciar sesión.");
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.message) {
        setError(err.message);
        return;
      }

      const firstError = getClerkError(err);
      const errorMessage =
        firstError?.longMessage || firstError?.message || "";

      if (
        firstError?.code === "form_identifier_not_allowed" ||
        errorMessage.includes("domain")
      ) {
        setError("Este correo no tiene permisos para iniciar sesión.");
      } else {
        setError(errorMessage || "Credenciales inválidas. Intente de nuevo.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Custom Google Login via Clerk
  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setIsGoogleAuthLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_google",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      setError("Error en autenticación con Google.");
      setIsGoogleAuthLoading(false);
    }
  };

  // Handle Custom Microsoft Login via Clerk
  const handleMicrosoftSignIn = async () => {
    if (!isLoaded) return;
    setIsMicrosoftAuthLoading(true);
    try {
      await signIn.authenticateWithRedirect({
        strategy: "oauth_microsoft",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/dashboard",
      });
    } catch (err) {
      setError("Error en autenticación con Microsoft.");
      setIsMicrosoftAuthLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100 dark:bg-[#0B1120] p-4 lg:p-10 font-sans">
      {/* Main Split-Screen Container */}
      <div className="w-full max-w-[1300px] flex flex-col lg:flex-row lg:max-h-[850px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-emerald-950/10 bg-white dark:bg-[#10221C] border border-slate-200 dark:border-slate-800/60">
        {/* LEFT SIDE: Branding & Value Prop */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#17262C] p-10 flex-col justify-between relative overflow-hidden">
          {/* Background Decorative Element */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute w-[40rem] h-[40rem] bg-purple-500 rounded-full blur-[100px] -top-20 -left-20"></div>
            <div className="absolute w-[30rem] h-[30rem] bg-emerald-500 rounded-full blur-[100px] bottom-0 right-0"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-center">
            {/* Logo Area */}
            <div className="flex items-center gap-4 mb-12">
              <img
                src="/nowerLogo.png"
                alt="NOWER Logo"
                className="h-16 w-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <h1 className="text-4xl font-black tracking-tight text-white leading-none">
                  NOWER
                </h1>
                <p className="text-[10px] -mt-6 sm:text-[11px] font-semibold text-slate-300 tracking-widest uppercase">
                  Efficient Web Performance
                </p>
              </div>
            </div>

            {/* Hero Copy */}
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
              Tu Portafolio y <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                Espacio de Trabajo
              </span>
            </h1>
            <p className="text-slate-400 xl:text-lg mb-10 max-w-md">
              Accede de forma segura a tu panel centralizado para gestionar
              proyectos, habilidades y experiencia profesional.
            </p>

            {/* Features / Trust Badges */}
            <div className="space-y-5">
              <div className="flex items-center gap-4 text-slate-300">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-medium">
                  Acceso seguro basado en roles
                </span>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <Layers className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-medium">
                  Gestión centralizada de datos
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 text-xs text-slate-500">
            © 2026 NOWER Workspaces. Bolivia HQ.
          </div>
        </div>

        {/* RIGHT SIDE: Login Form */}
        <div className="relative w-full lg:w-1/2 flex-1 p-6 sm:p-8 lg:p-14 flex flex-col justify-center bg-slate-50 dark:bg-gradient-to-br from-[#120F1A] via-[#171E2F] to-[#120F1A] lg:bg-white lg:dark:bg-[#08180d] transition-colors">
          {/* Background Decorative Element (Mobile Only) */}
          <div className="lg:hidden absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
            <div className="absolute w-[40rem] h-[40rem] bg-purple-500 rounded-full blur-[100px] -top-20 -left-20"></div>
            <div className="absolute w-[30rem] h-[30rem] bg-emerald-500 rounded-full blur-[100px] bottom-0 right-0"></div>
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto">
            {/* Mobile Logo Logo */}
            <div className="flex lg:hidden items-center gap-3 mb-8">
              <img
                src="/nowerLogo.png"
                alt="NOWER Logo"
                className="h-12 w-auto object-contain"
              />
              <div className="flex flex-col justify-center">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                  NOWER
                </h1>
                <p className="text-[9px] sm:text-[10px] -mt-6 font-semibold text-slate-500 tracking-widest uppercase">
                  Efficient Web Performance
                </p>
              </div>
            </div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Bienvenido de nuevo
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                Inicia sesión para acceder a tu dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  CORREO ELECTRÓNICO
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nombre@ejemplo.com"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Contraseña
                  </label>
                  <a
                    href="#"
                    className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] pl-11 pr-12 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !isLoaded}
                className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 transition-all shadow-md shadow-purple-900/10 hover:shadow-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Iniciando sesión..." : "Iniciar Sesión"}
              </button>
              <p className="text-sm text-center mt-6">
                ¿No tienes cuenta?{" "}
                <span
                  className="text-purple-600 cursor-pointer font-medium"
                  onClick={() => navigate("/register")}
                >
                  Regístrate
                </span>
              </p>
            </form>

            {/* Divider */}
            <div className="mt-7 mb-5 relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-800"></div>
              </div>
              <div className="relative px-4 bg-slate-50 dark:bg-[#17262C] lg:bg-white lg:dark:bg-[#08180d] transition-colors">
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  O continúa con
                </span>
              </div>
            </div>

            {/* SSO Buttons */}
            <div className="grid grid-cols-1 gap-4">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleAuthLoading}
                className="flex items-center justify-center gap-2 w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {isGoogleAuthLoading ? "Iniciando con Google..." : "Google"}
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
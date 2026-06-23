import React, { useState } from 'react';

import {
  Eye,
  EyeOff,
  Layers,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useSignUp } from '@clerk/clerk-react'; // <-- Clerk Hook

// We removed the onLogin prop since Clerk handles global state
export const RegisterPage: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();
  // Standard UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clerk Verification State
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");

  const [form, setForm] = useState({
    firstName: "", // Clerk uses first/last name, we'll map fullName to firstName for simplicity
    emailAddress: "", // Note: Clerk uses emailAddress
    password: "",
    confirmPassword: "",
  });

  const isPasswordValid = form.password.length >= 8; // Clerk's default minimum is usually 8
  const passwordsMatch =
    form.password !== "" && form.password === form.confirmPassword;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setError(""); // Clear error when typing
  };

  // --- STEP 1: INITIAL SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (!isPasswordValid || !passwordsMatch) {
      setError("Por favor, verifica las contraseñas.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 1. Create the user in Clerk with their own password
      await signUp.create({
        firstName: form.firstName,
        emailAddress: form.emailAddress,
        password: form.password,
      });

      // 2. Send the verification email (OTP code)
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // 3. Switch the UI to ask for the code
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Error al crear la cuenta.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- STEP 2: VERIFICATION ---
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setIsLoading(true);
    setError("");

    try {
      // 1. Send the code the user typed back to Clerk
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      // 2. If successful, set the session active and redirect
      if (completeSignUp.status === "complete") {
        if (!setActive || !completeSignUp.createdSessionId) {
          setError("No se pudo activar la sesión. Intenta de nuevo.");
          return;
        }
        await setActive({ session: completeSignUp.createdSessionId });
        await fetch(`${API_URL}/sync-user`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            clerk_id: signUp.createdUserId,
            full_name: form.firstName,
            email: form.emailAddress,
            password: form.password,
            registration_type: "password",
          }),
        });
        navigate("/dashboard", { replace: true });
      } else {
        console.error(JSON.stringify(completeSignUp, null, 2));
        setError("La verificación no está completa. Intenta de nuevo.");
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || "Código incorrecto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center bg-slate-100 dark:bg-[#0B1120] p-4 lg:p-10 font-sans">
      <div className="w-full max-w-[1300px] flex flex-col lg:flex-row lg:max-h-[850px] rounded-2xl lg:rounded-3xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-emerald-950/10 bg-white dark:bg-[#10221C] border border-slate-200 dark:border-slate-800/60">
        
        {/* LEFT SIDE: Branding & Value Prop */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#17262C] p-10 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute w-[40rem] h-[40rem] bg-purple-500 rounded-full blur-[100px] -top-20 -left-20"></div>
            <div className="absolute w-[30rem] h-[30rem] bg-emerald-500 rounded-full blur-[100px] bottom-0 right-0"></div>
          </div>

          <div className="relative z-10 flex flex-col h-full justify-center">
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

            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-5">
              Tu Portafolio y <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                Espacio de Trabajo
              </span>
            </h1>

            <p className="text-slate-400 xl:text-lg mb-10 max-w-md">
              Crea tu cuenta para gestionar proyectos, habilidades y experiencia profesional en un solo lugar.
            </p>

            <div className="space-y-5">
              <div className="flex items-center gap-4 text-slate-300">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-medium">
                  Registro seguro con verificación por correo
                </span>
              </div>

              <div className="flex items-center gap-4 text-slate-300">
                <Layers className="w-6 h-6 text-purple-400" />
                <span className="text-sm font-medium">
                  Construye y publica tu portafolio profesional
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-5 text-xs text-slate-500">
            © 2026 NOWER Workspaces. Bolivia HQ.
          </div>
        </div>

        {/* RIGHT SIDE: Register Form */}
        <div className="relative w-full lg:w-1/2 flex-1 p-6 sm:p-8 lg:p-14 flex flex-col justify-center bg-slate-50 dark:bg-gradient-to-br from-[#120F1A] via-[#171E2F] to-[#120F1A] lg:bg-white lg:dark:bg-[#08180d] transition-colors">
          
          <div className="lg:hidden absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 pointer-events-none">
            <div className="absolute w-[40rem] h-[40rem] bg-purple-500 rounded-full blur-[100px] -top-20 -left-20"></div>
            <div className="absolute w-[30rem] h-[30rem] bg-emerald-500 rounded-full blur-[100px] bottom-0 right-0"></div>
          </div>

          <div className="relative z-10 w-full max-w-md mx-auto">
            
            {/* Mobile Logo */}
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

            {!pendingVerification ? (
              <>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Crear cuenta
                  </h2>

                  <p className="text-slate-500 dark:text-slate-400">
                    Regístrate para comenzar a construir tu portafolio.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Nombre completo
                    </label>

                    <input
                      type="text"
                      name="firstName"
                      placeholder="Tu nombre completo"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Correo electrónico
                    </label>

                    <input
                      type="email"
                      name="emailAddress"
                      placeholder="nombre@ejemplo.com"
                      value={form.emailAddress}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Contraseña
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>

                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mínimo 8 caracteres"
                        value={form.password}
                        onChange={handleChange}
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

                    {form.password !== "" && !isPasswordValid && (
                      <p className="text-xs text-red-500">
                        La contraseña debe tener al menos 8 caracteres.
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Confirmar contraseña
                    </label>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                        <Lock className="h-4 w-4" />
                      </div>

                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Repite tu contraseña"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] pl-11 pr-12 py-3.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                        required
                      />

                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    {form.confirmPassword !== "" && !passwordsMatch && (
                      <p className="text-xs text-red-500">
                        Las contraseñas no coinciden.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isLoaded}
                    className="w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3.5 transition-all shadow-md shadow-purple-900/10 hover:shadow-purple-900/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                  </button>

                  <p className="text-sm text-center mt-6 text-slate-600 dark:text-slate-400">
                    ¿Ya tienes cuenta?{" "}
                    <span
                      className="text-purple-600 dark:text-purple-400 cursor-pointer font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      onClick={() => navigate("/login")}
                    >
                      Inicia sesión
                    </span>
                  </p>
                </form>
              </>
            ) : (
              <div>
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    Verifica tu correo
                  </h2>

                  <p className="text-slate-500 dark:text-slate-400">
                    Hemos enviado un código de 6 dígitos a{" "}
                    <strong className="text-slate-700 dark:text-slate-200">
                      {form.emailAddress}
                    </strong>
                  </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-5">
                  {error && (
                    <div className="p-3 text-sm text-red-500 bg-red-100/50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
                      {error}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Código de verificación
                    </label>

                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="123456"
                      className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#111827] px-4 py-3.5 text-center text-2xl tracking-[0.5em] text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !isLoaded}
                    className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 transition-all shadow-md shadow-emerald-900/10 hover:shadow-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-[#0B1120] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verificando..." : "Verificar código"}
                  </button>

                  <p className="text-sm text-center mt-6 text-slate-600 dark:text-slate-400">
                    ¿Usaste otro correo?{" "}
                    <span
                      className="text-purple-600 dark:text-purple-400 cursor-pointer font-medium hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                      onClick={() => {
                        setPendingVerification(false);
                        setCode("");
                        setError("");
                      }}
                    >
                      Volver al registro
                    </span>
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

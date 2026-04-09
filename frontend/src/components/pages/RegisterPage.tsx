import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";
import { useSignUp } from "@clerk/clerk-react"; // <-- Clerk Hook

const ALLOWED_DOMAINS = ["@est.umss.edu", "@ms.umss.edu"];

// We removed the onLogin prop since Clerk handles global state
export const RegisterPage: React.FC = () => {
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
      const isDomainValid = ALLOWED_DOMAINS.some((domain) =>
        form.emailAddress.toLowerCase().endsWith(domain),
      );
      if (!isDomainValid) {
        setError(
          `Debes registrarte con tu correo institucional (${ALLOWED_DOMAINS.join(" o ")})`,
        );
        return;
      }
      // 1. Create the user in Clerk
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
      // Clerk provides highly specific error messages (e.g., "Email already taken")
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
        await setActive({ session: completeSignUp.createdSessionId });
        navigate("/profile");
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
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 w-[900px] rounded-2xl overflow-hidden shadow-lg">
        {/* LEFT SIDE (Unchanged Branding) */}
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-10 flex flex-col justify-between">
          {/* ... Your exact same left-side branding code here ... */}
          <div>
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
            <h1 className="text-4xl font-bold leading-tight">
              Tu Portafolio y <br />
              <span className="text-purple-400">Espacio de Trabajo</span>
            </h1>
            <p className="mt-4 text-slate-300">
              Regístrate y comienza a gestionar tu perfil profesional.
            </p>
          </div>
          <p className="text-sm text-slate-400">© 2026 NOWER Workspaces</p>
        </div>

        {/* RIGHT SIDE (Dynamic Form) */}
        <div className="bg-white p-10 flex flex-col justify-center">
          {/* INLINE ERROR STATE (Replaces `alert()`) */}
          {error && (
            <div className="mb-4 p-3 text-sm text-red-500 bg-red-100/50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* DYNAMIC RENDER: Show OTP Form OR Registration Form */}
          {!pendingVerification ? (
            <>
              <h2 className="text-2xl font-bold mb-2 text-black">
                Crear cuenta
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Completa los datos para registrarte
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="firstName"
                  placeholder="Nombre"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
                <input
                  type="email"
                  name="emailAddress"
                  placeholder="Correo electrónico"
                  value={form.emailAddress}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  required
                />
                <p className="text-[10px] font-medium text-slate-500 px-1 italic -mt-2">
                  * Solo se permite el registro con correos institucionales
                  (@est.umss.edu o @ms.umss.edu)
                </p>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Contraseña"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
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

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
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

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{
                    background: "linear-gradient(90deg, #9333ea, #7c3aed)",
                  }}
                >
                  {isLoading ? "Cargando..." : "Registrarse"}
                </button>
              </form>

              <p className="text-sm text-center mt-6">
                ¿Ya tienes cuenta?{" "}
                <span
                  className="text-purple-600 cursor-pointer font-medium"
                  onClick={() => navigate("/login")}
                >
                  Inicia sesión
                </span>
              </p>
            </>
          ) : (
            // --- VERIFICATION UI ---
            <div className="space-y-4">
              <h2 className="text-2xl font-bold mb-2 text-black">
                Verifica tu correo
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Hemos enviado un código de 6 dígitos a{" "}
                <strong>{form.emailAddress}</strong>
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Ej. 123456"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-slate-900 placeholder-slate-300 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg text-white font-medium disabled:opacity-50"
                  style={{
                    background: "linear-gradient(90deg, #10b981, #059669)",
                  }}
                >
                  {isLoading ? "Verificando..." : "Verificar Código"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff } from "lucide-react";

export const RegisterPage: React.FC<{ onLogin: () => void }> = ({
  onLogin,
}) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const isPasswordValid = form.password.length >= 6;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    if (name === "email") {
      const isValid = /\S+@\S+\.\S+/.test(value);

      if (!isValid) {
        setEmailError("Correo inválido");
        return;
      }

      try {
        const res = await fetch(`/api/auth/check-email?email=${value}`);

        const data = await res.json();

        if (data.exists) {
          setEmailError("Este correo ya está registrado");
        } else {
          setEmailError("");
        }
      } catch {
        setEmailError("Error verificando el correo");
      }
    }
  };

  const passwordsMatch =
    form.password !== "" &&
    form.confirmPassword !== "" &&
    form.password === form.confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;
    if (!passwordsMatch) return;
    if (emailError) return;
    
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.fullName,   
          email: form.email,
          password: form.password
        }),
      });

      if (!res.ok) {
        const data = await res.json();

        if (res.status === 409) {
          alert("El correo ya está registrado");
        } else if (res.status === 400) {
          alert(data.error || "Datos inválidos");
        } else {
          alert("Error del servidor, intenta más tarde");
        }

        return;
      }

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al registrarse");
        return;
      }

      if (!loginRes.ok) {
        alert("Registro exitoso, pero fallo el login");
        return;
      }

      onLogin();
      navigate("/profile");
    } catch (err) {
      console.error(err);
      alert("Error de conexión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 w-[900px] rounded-2xl overflow-hidden shadow-lg">
        {/* IZQUIERDA (IGUAL QUE LOGIN) */}
        <div className="bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white p-10 flex flex-col justify-between">
          <div>
            {/* LOGO */}
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

        {/* DERECHA (FORM BLANCO COMO LOGIN) */}
        <div className="bg-white p-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2 text-black dark:text-white">
            Crear cuenta
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            Completa los datos para registrarte
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="fullName"
              placeholder="Nombre completo"
              value={form.fullName}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Correo electrónico"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
              required
            />
            {emailError && (
              <p className="text-xs mt-1 text-red-500">{emailError}</p>
            )}
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
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {form.password !== "" && !isPasswordValid && (
              <p className="text-xs mt-1 text-red-500">
                La contraseña debe tener al menos 6 caracteres
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
              {form.confirmPassword !== "" && !passwordsMatch && (
                <p className="text-xs mt-1 text-red-500">
                  Las contraseñas no coinciden
                </p>
              )}
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
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-medium"
              style={{
                background: "linear-gradient(90deg, #9333ea, #7c3aed)",
              }}
            >
              Registrarse
            </button>
          </form>

          {/* LINK A LOGIN */}
          <p className="text-sm text-center mt-6">
            ¿Ya tienes cuenta?{" "}
            <span
              className="text-purple-600 cursor-pointer font-medium"
              onClick={() => navigate("/login")}
            >
              Inicia sesión
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

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
        alert("Error al registrarse");
        return;
      }

      navigate("/login");
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
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="nombre@ejemplo.com"
              value={form.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={form.password}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirmar contraseña"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              required
            />

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

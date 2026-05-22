import { useState } from "react";
import { Eye, EyeOff, ShieldCheck, Lock } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { changePassword } from "../settingsApi";

function getPasswordStrength(password: string) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return {
      label: "Débil",
      color: "text-red-500",
      bg: "bg-red-500",
      width: "w-1/3",
    };
  }

  if (score <= 3) {
    return {
      label: "Media",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      width: "w-2/3",
    };
  }

  return {
    label: "Fuerte",
    color: "text-green-500",
    bg: "bg-green-500",
    width: "w-full",
  };
}

function isNewPasswordValid(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

export default function PasswordSettings() {
  const { getToken } = useAuth();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const strength = getPasswordStrength(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (!isNewPasswordValid(newPassword)) {
      setError(
        "La nueva contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        window.location.href = "/login";
        return;
      }

      const result = await changePassword(token, {
        current_password: currentPassword,
        new_password: newPassword,
        new_password_confirmation: confirmPassword,
      });

      setSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f224a]">
              <Lock className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                Seguridad de Cuenta
              </h1>

              <p className="mt-1 text-slate-500 dark:text-slate-400">
                Cambia tu contraseña y protege tu cuenta.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#17262C]">
          {error && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          {success && (
            <p className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Contraseña Actual
              </label>

              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Contraseña actual"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition-all focus:border-[#0f224a] dark:border-slate-600 dark:bg-[#0F1B20] dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showCurrent ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nueva Contraseña
              </label>

              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition-all focus:border-[#0f224a] dark:border-slate-600 dark:bg-[#0F1B20] dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showNew ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {newPassword && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${strength.color}`} />

                    <span className={`text-sm font-semibold ${strength.color}`}>
                      Seguridad: {strength.label}
                    </span>
                  </div>

                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${strength.bg} ${strength.width}`}
                    />
                  </div>

                  <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <li>• Mínimo 8 caracteres</li>
                    <li>• Una letra mayúscula</li>
                    <li>• Un número</li>
                    <li>• Un carácter especial</li>
                  </ul>
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Confirmar Contraseña
              </label>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pr-12 outline-none transition-all focus:border-[#0f224a] dark:border-slate-600 dark:bg-[#0F1B20] dark:text-white"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirm ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center rounded-2xl bg-[#0f224a] px-6 py-3 font-bold text-white transition-all hover:bg-[#1d3570] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Actualizando..." : "Cambiar Contraseña"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

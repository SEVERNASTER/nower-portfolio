import { useEffect, useState } from "react";
import { Eye, EyeOff, ShieldCheck, Lock, ShieldAlert, Mail } from "lucide-react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { clearPasswordChangeNotifications } from "../../../contexts/NotificationContext";
import { changePassword } from "../settingsApi";
import { useAuthStatus } from "../../../contexts/AuthStatusContext";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) {
    return { label: "Débil", color: "text-red-500", bg: "bg-red-500", width: "w-1/3" };
  }
  if (score <= 3) {
    return {
      label: "Media",
      color: "text-yellow-500",
      bg: "bg-yellow-500",
      width: "w-2/3",
    };
  }
  return { label: "Fuerte", color: "text-green-500", bg: "bg-green-500", width: "w-full" };
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

type FieldErrors = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function PasswordSettings() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();
  const { mustChangePassword, clearMustChangePassword } = useAuthStatus();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);

  useEffect(() => {
    if (mustChangePassword) {
      setSuccess(null);
    }
  }, [mustChangePassword]);

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!currentPassword.trim()) {
      errors.currentPassword = "La contraseña actual es obligatoria*.";
    }

    if (!newPassword.trim()) {
      errors.newPassword = "La nueva contraseña es obligatoria*.";
    } else if (!isNewPasswordValid(newPassword)) {
      errors.newPassword =
        "Debe tener al menos 8 caracteres, mayúscula, minúscula, número y carácter especial.*";
    }

    if (!confirmPassword.trim()) {
      errors.confirmPassword = "Debes confirmar la nueva contraseña.*";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.*";
    }

    setFieldErrors(errors);
    setFormError(null);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(null);

    if (!validate()) return;

    try {
      setLoading(true);
      setFormError(null);

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

      clearMustChangePassword();
      if (user?.id) {
        clearPasswordChangeNotifications(user.id);
      }
      setSuccess(result.message);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      if (mustChangePassword) {
        window.setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 1200);
      }
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-6">
      <div className="mx-auto max-w-3xl">
        {mustChangePassword && (
          <div className="mb-6 space-y-4">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 dark:border-amber-700/50 dark:bg-amber-950/30">
              <div className="flex gap-3">
                <ShieldAlert className="h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-bold text-amber-900 dark:text-amber-100">
                    Cambio de contraseña obligatorio
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-amber-800 dark:text-amber-200/90">
                    Por seguridad, debes cambiar la contraseña temporal que te asignó el
                    sistema antes de acceder al resto de la plataforma. Usa la clave que
                    recibiste en tu correo como contraseña actual.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/50 dark:bg-emerald-950/30">
              <div className="flex gap-3">
                <Mail className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-emerald-800 dark:text-emerald-200/90">
                  Tu nueva contraseña ya fue enviada a tu bandeja de entrada. Revisa tu
                  correo (y la carpeta de spam) para obtener la clave temporal.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0f224a]">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                {mustChangePassword ? "Configuración de contraseña" : "Seguridad de Cuenta"}
              </h1>
              <p className="mt-1 text-slate-500 dark:text-slate-400">
                {mustChangePassword
                  ? "Completa el formulario para continuar."
                  : "Cambia tu contraseña y protege tu cuenta."}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-[#17262C]">
          {formError && (
            <p className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
              {formError}
            </p>
          )}

          {success && (
            <p className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 dark:border-green-900/50 dark:bg-green-950/40 dark:text-green-300">
              {success}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                {mustChangePassword ? "Contraseña actual (del correo)" : "Contraseña Actual"}
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (fieldErrors.currentPassword) {
                      setFieldErrors((p) => ({ ...p, currentPassword: undefined }));
                    }
                  }}
                  placeholder={
                    mustChangePassword
                      ? "Contraseña recibida por correo"
                      : "Contraseña actual"
                  }
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 outline-none dark:bg-[#0F1B20] dark:text-white ${
                    fieldErrors.currentPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-600 focus:border-[#0f224a]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showCurrent ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.currentPassword && (
                <p className="mt-1.5 text-xs text-red-500">{fieldErrors.currentPassword}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) {
                      setFieldErrors((p) => ({ ...p, newPassword: undefined }));
                    }
                  }}
                  placeholder="Ingresa tu nueva contraseña"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 outline-none dark:bg-[#0F1B20] dark:text-white ${
                    fieldErrors.newPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-600 focus:border-[#0f224a]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showNew ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.newPassword && (
                <p className="mt-1.5 text-xs text-red-500">{fieldErrors.newPassword}</p>
              )}
              {newPassword && !fieldErrors.newPassword && (
                <div className="mt-4">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className={`h-4 w-4 ${strength.color}`} />
                    <span className={`text-sm font-semibold ${strength.color}`}>
                      Seguridad: {strength.label}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                    <div
                      className={`h-full rounded-full transition-all ${strength.bg} ${strength.width}`}
                    />
                  </div>
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
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) {
                      setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="Confirma tu nueva contraseña"
                  className={`w-full rounded-2xl border bg-white px-4 py-3 pr-12 outline-none dark:bg-[#0F1B20] dark:text-white ${
                    fieldErrors.confirmPassword
                      ? "border-red-400 focus:border-red-500"
                      : "border-slate-300 dark:border-slate-600 focus:border-[#0f224a]"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showConfirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#0f224a] px-6 py-3 font-bold text-white hover:bg-[#1d3570] disabled:opacity-50"
            >
              {loading
                ? "Actualizando..."
                : mustChangePassword
                  ? "Actualizar y continuar"
                  : "Cambiar Contraseña"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

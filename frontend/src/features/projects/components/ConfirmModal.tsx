import React, { useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary" | "success";
  icon?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title = "Confirmar acción",
  message = "¿Estás seguro?",
  onConfirm,
  onCancel,
  loading = false,
  confirmText,
  cancelText = "Cancelar",
  variant = "danger",
  icon = "⚠️",
}) => {

  // ⌨️ Cerrar con ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    if (isOpen) {
      window.addEventListener("keydown", handleKey);
    }

    return () => {
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  // Variant color definitions
  const variantStyles = {
    danger: {
      iconBg: "bg-red-100 text-red-600 dark:bg-red-950/30 dark:text-red-400",
      btnBg: "bg-red-600 hover:bg-red-700 text-white dark:bg-red-600 dark:hover:bg-red-700",
      defaultConfirm: "Eliminar",
    },
    warning: {
      iconBg: "bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
      btnBg: "bg-amber-600 hover:bg-amber-700 text-white dark:bg-amber-650 dark:hover:bg-amber-700",
      defaultConfirm: "Confirmar",
    },
    primary: {
      iconBg: "bg-blue-100 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700",
      defaultConfirm: "Aceptar",
    },
    success: {
      iconBg: "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
      btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700",
      defaultConfirm: "Aceptar",
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;
  const finalConfirmText = confirmText || currentVariant.defaultConfirm;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onCancel} // 🧠 click afuera cierra
    >
      <div
        className="bg-white dark:bg-[#17262C] rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100 opacity-100 border border-slate-200 dark:border-slate-800/80"
        onClick={(e) => e.stopPropagation()} // ❌ evita cerrar al hacer click dentro
      >
        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`h-10 w-10 flex items-center justify-center rounded-full ${currentVariant.iconBg}`}>
            {icon}
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {title}
          </h2>
        </div>

        {/* Message */}
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-750 dark:text-slate-200 disabled:opacity-50 font-medium transition-colors"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-lg font-medium disabled:opacity-50 transition-colors ${currentVariant.btnBg}`}
          >
            {loading ? "Procesando..." : finalConfirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
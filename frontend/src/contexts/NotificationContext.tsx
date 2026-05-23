import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";

export type NotificationType = "success" | "error" | "info";

export type ShowNotificationInput = {
  type?: NotificationType;
  title: string;
  message: string;
  durationMs?: number;
};

type NotificationItem = ShowNotificationInput & {
  id: string;
  type: NotificationType;
};

type NotificationContextValue = {
  showNotification: (input: ShowNotificationInput) => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

const typeStyles: Record<
  NotificationType,
  { container: string; icon: React.ReactNode }
> = {
  success: {
    container:
      "border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-100",
    icon: (
      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
    ),
  },
  error: {
    container:
      "border-red-200 bg-red-50 text-red-950 dark:border-red-800/60 dark:bg-red-950/50 dark:text-red-100",
    icon: <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />,
  },
  info: {
    container:
      "border-sky-200 bg-sky-50 text-sky-950 dark:border-sky-800/60 dark:bg-sky-950/50 dark:text-sky-100",
    icon: <Info className="h-5 w-5 shrink-0 text-sky-600 dark:text-sky-400" />,
  },
};

function NotificationToast({
  item,
  onDismiss,
}: {
  item: NotificationItem;
  onDismiss: (id: string) => void;
}) {
  const styles = typeStyles[item.type];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto w-full max-w-sm rounded-2xl border p-4 shadow-lg ${styles.container}`}
    >
      <div className="flex gap-3">
        {styles.icon}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">{item.title}</p>
          <p className="mt-1 text-sm leading-relaxed opacity-90">{item.message}</p>
        </div>
        <button
          type="button"
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"
          aria-label="Cerrar notificación"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showNotification = useCallback(
    ({ type = "info", title, message, durationMs = 12000 }: ShowNotificationInput) => {
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now());

      setItems((prev) => [...prev, { id, type, title, message }]);
      window.setTimeout(() => dismiss(id), durationMs);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[9999] flex flex-col items-center gap-3 px-4 sm:items-end sm:pr-6">
        {items.map((item) => (
          <NotificationToast key={item.id} item={item} onDismiss={dismiss} />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotification debe usarse dentro de NotificationProvider");
  }
  return ctx;
}

const CREDENTIALS_NOTIFIED_PREFIX = "credentials-email-notified-";

export function notifyCredentialsEmailSent(
  showNotification: NotificationContextValue["showNotification"],
  clerkId: string,
  options?: { email?: string; sent?: boolean }
) {
  if (!options?.sent || !clerkId) return;

  const storageKey = `${CREDENTIALS_NOTIFIED_PREFIX}${clerkId}`;
  if (sessionStorage.getItem(storageKey)) return;

  const emailHint = options.email ? ` (${options.email})` : "";

  showNotification({
    type: "success",
    title: "Nueva contraseña enviada",
    message: `Tu nueva clave fue enviada a tu bandeja de entrada${emailHint}. Revisa tu correo y la carpeta de spam.`,
  });

  sessionStorage.setItem(storageKey, "1");
}

const MANDATORY_NOTIFIED_PREFIX = "mandatory-password-notified-";

export function notifyMandatoryPasswordChange(
  showNotification: NotificationContextValue["showNotification"],
  clerkId: string
) {
  if (!clerkId) return;

  const storageKey = `${MANDATORY_NOTIFIED_PREFIX}${clerkId}`;
  if (sessionStorage.getItem(storageKey)) return;

  showNotification({
    type: "info",
    title: "Cambio de contraseña obligatorio",
    message:
      "Debes cambiar la contraseña temporal que recibiste por correo antes de usar el resto del sistema.",
    durationMs: 14000,
  });

  sessionStorage.setItem(storageKey, "1");
}

export function clearPasswordChangeNotifications(clerkId: string) {
  sessionStorage.removeItem(`${CREDENTIALS_NOTIFIED_PREFIX}${clerkId}`);
  sessionStorage.removeItem(`${MANDATORY_NOTIFIED_PREFIX}${clerkId}`);
}

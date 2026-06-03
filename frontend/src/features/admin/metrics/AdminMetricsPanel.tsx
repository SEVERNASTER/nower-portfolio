import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  BarChart3,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserCheck,
  UserRoundCog,
  UserRoundX,
  Users,
  XCircle,
} from 'lucide-react';

import {
  AdminSystemMetrics,
  fetchAdminMetrics,
} from './adminMetricsService';

interface AdminMetricsPanelProps {
  cardBaseClass: string;
  getToken: () => Promise<string | null>;
}

interface MetricCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700/60 dark:bg-[#17262C]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-3 text-4xl font-black text-slate-900 dark:text-white">
            {value}
          </p>

          <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-[#10221C] dark:text-emerald-400">
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const emptyMetrics: AdminSystemMetrics = {
  users: {
    registered_total: 0,
    admins: 0,
    normal_users: 0,
    password_pending: 0,
  },
  portfolios: {
    approved: 0,
    rejected: 0,
    pending_review: 0,
    unpublished: 0,
  },
};

export const AdminMetricsPanel: React.FC<AdminMetricsPanelProps> = ({
  cardBaseClass,
  getToken,
}) => {
  const [metrics, setMetrics] = useState<AdminSystemMetrics>(emptyMetrics);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await getToken();

      if (!token) {
        setError("No se pudo obtener el token de autenticación.");
        return;
      }

      const data = await fetchAdminMetrics(token);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cargando métricas");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void loadMetrics();
  }, [loadMetrics]);

  if (loading) {
    return (
      <div className={cardBaseClass}>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Cargando métricas del sistema...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cardBaseClass}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={cardBaseClass}>
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-[#10221C] dark:text-emerald-400">
            <BarChart3 className="h-6 w-6" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Métricas del sistema
            </h3>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Visualiza la cantidad de usuarios registrados y el estado actual
              de los portafolios.
            </p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Usuarios
          </h4>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Conteo general de usuarios registrados en el sistema.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Usuarios registrados"
            value={metrics.users.registered_total}
            description="Total de cuentas registradas."
            icon={Users}
          />

          <MetricCard
            title="Usuarios administradores"
            value={metrics.users.admins}
            description="Cuentas con rol administrativo."
            icon={ShieldCheck}
          />

          <MetricCard
            title="Usuarios normales"
            value={metrics.users.normal_users}
            description="Usuarios comunes de la plataforma."
            icon={UserCheck}
          />

          <MetricCard
            title="Contraseña pendiente"
            value={metrics.users.password_pending}
            description="Usuarios que deben cambiar contraseña."
            icon={UserRoundCog}
          />
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-white">
            Portafolios
          </h4>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Conteo de portafolios según su estado de publicación y revisión.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Portafolios aprobados"
            value={metrics.portfolios.approved}
            description="Portafolios publicados y visibles."
            icon={CheckCircle2}
          />

          <MetricCard
            title="Portafolios rechazados"
            value={metrics.portfolios.rejected}
            description="Portafolios rechazados por administración."
            icon={XCircle}
          />

          <MetricCard
            title="Pendientes de revisión"
            value={metrics.portfolios.pending_review}
            description="Portafolios esperando aprobación."
            icon={Clock3}
          />

          <MetricCard
            title="No publicados"
            value={metrics.portfolios.unpublished}
            description="Portafolios no visibles públicamente."
            icon={UserRoundX}
          />
        </div>
      </section>
    </div>
  );
};

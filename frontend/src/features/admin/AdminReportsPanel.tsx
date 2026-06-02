import React, {
  useMemo,
  useState,
} from 'react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart3,
  FileSpreadsheet,
  FileText,
  Filter,
  History,
  Table2,
} from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from '../../components/ui/Button';

type ReportType = "summary" | "users" | "portfolios";

interface AdminUserReportData {
  id: string;
  name: string;
  email: string;
  status?: string;
  registeredAt: string;
  role?: string;
  mustChangePassword?: boolean;
}

interface PortfolioReportData {
  id: string;
  portfolioId: number | null;
  nombre: string;
  rol: string;
  ciudad: string;
  email: string;
  status: "Pendiente" | "Aprobado" | "Rechazado" | "No publicado";
  templateKey?: "classic" | "modern" | "creative";
  rawUser?: any;
}

interface GeneratedReport {
  title: string;
  type: ReportType;
  filter: string;
  generatedAt: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
}

interface ReportHistoryItem {
  id: string;
  type: ReportType;
  filter: string;
  generatedAt: string;
  adminName: string;
}

interface AdminReportsPanelProps {
  users: AdminUserReportData[];
  portfolios: PortfolioReportData[];
  cardBaseClass: string;
  currentAdminName: string;
}

const REPORT_HISTORY_KEY = "nower_admin_report_history_preview";
const MAX_HISTORY_ITEMS = 10;

const reportTypeLabels: Record<ReportType, string> = {
  summary: "Resumen general",
  users: "Usuarios",
  portfolios: "Portafolios",
};

const filterLabels: Record<string, string> = {
  all: "Todos",
  admin: "Administradores",
  user: "Usuarios comunes",
  password_pending: "Contraseña pendiente",
  unpublished: "No publicados",
  pending_review: "Pendientes de revisión",
  published: "Publicados",
  rejected: "Rechazados",
};

function getCurrentDateTime() {
  return new Date().toLocaleString("es-BO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeRole(role?: string) {
  return role || "user";
}

function getRoleLabel(role?: string) {
  return normalizeRole(role) === "admin" ? "Administrador" : "Usuario común";
}

function getTemplateLabel(template?: string) {
  if (template === "modern") return "Moderna";
  if (template === "creative") return "Creativa";
  return "Clásica";
}

function loadInitialHistory(storageKey: string): ReportHistoryItem[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as ReportHistoryItem[];

    return parsed.slice(0, MAX_HISTORY_ITEMS);
  } catch {
    return [];
  }
}

export const AdminReportsPanel: React.FC<AdminReportsPanelProps> = ({
  users,
  portfolios,
  cardBaseClass,
  currentAdminName,
}) => {
  const [reportType, setReportType] = useState<ReportType>("summary");
  const [filterStatus, setFilterStatus] = useState("all");
  const [generatedReport, setGeneratedReport] =
    useState<GeneratedReport | null>(null);
  const [history, setHistory] = useState<ReportHistoryItem[]>(() =>
    loadInitialHistory(REPORT_HISTORY_KEY),
  );

  const metrics = useMemo(() => {
    const commonUsers = users.filter((user) => normalizeRole(user.role) !== "admin");

    const reportablePortfolios = portfolios.filter(
      (item) => normalizeRole(item.rawUser?.role) !== "admin",
    );

    return {
      usersRegistered: users.length,
      usersAdmins: users.filter((user) => normalizeRole(user.role) === "admin").length,
      usersCommon: commonUsers.length,
      usersPasswordPending: users.filter((user) =>
        Boolean(user.mustChangePassword),
      ).length,

      portfoliosUnpublished: reportablePortfolios.filter(
        (item) => item.status === "No publicado",
      ).length,
      portfoliosPending: reportablePortfolios.filter(
        (item) => item.status === "Pendiente",
      ).length,
      portfoliosApproved: reportablePortfolios.filter(
        (item) => item.status === "Aprobado",
      ).length,
      portfoliosRejected: reportablePortfolios.filter(
        (item) => item.status === "Rechazado",
      ).length,
    };
  }, [users, portfolios]);

  const availableFilters = useMemo(() => {
    if (reportType === "users") {
      return [
        { value: "all", label: "Todos" },
        { value: "admin", label: "Administradores" },
        { value: "user", label: "Usuarios comunes" },
        { value: "password_pending", label: "Contraseña pendiente" },
      ];
    }

    if (reportType === "portfolios") {
      return [
        { value: "all", label: "Todos" },
        { value: "unpublished", label: "No publicados" },
        { value: "pending_review", label: "Pendientes de revisión" },
        { value: "published", label: "Publicados" },
        { value: "rejected", label: "Rechazados" },
      ];
    }

    return [{ value: "all", label: "Todos" }];
  }, [reportType]);

  const buildUsersReport = (): GeneratedReport => {
    let filteredUsers = [...users];

    if (filterStatus === "admin") {
      filteredUsers = filteredUsers.filter(
        (user) => normalizeRole(user.role) === "admin",
      );
    }

    if (filterStatus === "user") {
      filteredUsers = filteredUsers.filter(
        (user) => normalizeRole(user.role) !== "admin",
      );
    }

    if (filterStatus === "password_pending") {
      filteredUsers = filteredUsers.filter((user) =>
        Boolean(user.mustChangePassword),
      );
    }

    return {
      title: "Reporte de usuarios",
      type: "users",
      filter: filterStatus,
      generatedAt: getCurrentDateTime(),
      columns: [
        "ID",
        "Nombre",
        "Correo",
        "Rol",
        "Contraseña pendiente",
        "Fecha de registro",
      ],
      rows: filteredUsers.map((user) => [
        user.id,
        user.name,
        user.email,
        getRoleLabel(user.role),
        user.mustChangePassword ? "Sí" : "No",
        user.registeredAt,
      ]),
    };
  };

  const buildPortfoliosReport = (): GeneratedReport => {
    let filteredPortfolios = portfolios.filter(
      (item) => normalizeRole(item.rawUser?.role) !== "admin",
    );

    if (filterStatus === "unpublished") {
      filteredPortfolios = filteredPortfolios.filter(
        (item) => item.status === "No publicado",
      );
    }

    if (filterStatus === "pending_review") {
      filteredPortfolios = filteredPortfolios.filter(
        (item) => item.status === "Pendiente",
      );
    }

    if (filterStatus === "published") {
      filteredPortfolios = filteredPortfolios.filter(
        (item) => item.status === "Aprobado",
      );
    }

    if (filterStatus === "rejected") {
      filteredPortfolios = filteredPortfolios.filter(
        (item) => item.status === "Rechazado",
      );
    }

    return {
      title: "Reporte de portafolios",
      type: "portfolios",
      filter: filterStatus,
      generatedAt: getCurrentDateTime(),
      columns: [
        "ID",
        "Usuario",
        "Correo",
        "Profesión",
        "Ciudad",
        "Estado",
        "Plantilla",
      ],
      rows: filteredPortfolios.map((portfolio) => [
        portfolio.portfolioId ?? portfolio.id,
        portfolio.nombre,
        portfolio.email,
        portfolio.rol,
        portfolio.ciudad,
        portfolio.status,
        getTemplateLabel(portfolio.templateKey),
      ]),
    };
  };

  const buildSummaryReport = (): GeneratedReport => {
    return {
      title: "Resumen general del sistema",
      type: "summary",
      filter: "all",
      generatedAt: getCurrentDateTime(),
      columns: ["Métrica", "Valor"],
      rows: [
        ["Usuarios registrados", metrics.usersRegistered],
        ["Usuarios administradores", metrics.usersAdmins],
        ["Usuarios comunes", metrics.usersCommon],
        ["Usuarios con contraseña pendiente", metrics.usersPasswordPending],
        ["Portafolios no publicados", metrics.portfoliosUnpublished],
        ["Portafolios pendientes de revisión", metrics.portfoliosPending],
        ["Portafolios publicados/aprobados", metrics.portfoliosApproved],
        ["Portafolios rechazados", metrics.portfoliosRejected],
      ],
    };
  };

  const buildReport = (): GeneratedReport => {
    if (reportType === "users") return buildUsersReport();
    if (reportType === "portfolios") return buildPortfoliosReport();
    return buildSummaryReport();
  };

  const saveHistoryItem = (report: GeneratedReport) => {
    const item: ReportHistoryItem = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      type: report.type,
      filter: report.filter,
      generatedAt: getCurrentDateTime(),
      adminName: currentAdminName,
    };

    const updatedHistory = [item, ...history].slice(0, MAX_HISTORY_ITEMS);

    setHistory(updatedHistory);
    localStorage.setItem(REPORT_HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const handleGenerateReport = () => {
    const report = buildReport();
    setGeneratedReport(report);
    saveHistoryItem(report);
  };

  const handleExportExcel = () => {
    if (!generatedReport) return;

    const worksheetData = [
      [generatedReport.title],
      [`Generado: ${generatedReport.generatedAt}`],
      [
        `Filtro: ${filterLabels[generatedReport.filter] || generatedReport.filter}`,
      ],
      [],
      generatedReport.columns,
      ...generatedReport.rows,
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte");

    const fileName = `${generatedReport.type}_${generatedReport.filter}_${new Date()
      .toISOString()
      .slice(0, 10)}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleExportPdf = () => {
    if (!generatedReport) return;

    const doc = new jsPDF({
      orientation: "landscape",
    });

    doc.setFontSize(16);
    doc.text(generatedReport.title, 14, 16);

    doc.setFontSize(10);
    doc.text(`Generado: ${generatedReport.generatedAt}`, 14, 24);
    doc.text(
      `Filtro: ${filterLabels[generatedReport.filter] || generatedReport.filter}`,
      14,
      30,
    );

    autoTable(doc, {
      head: [generatedReport.columns],
      body: generatedReport.rows.map((row) =>
        row.map((cell) => String(cell ?? "")),
      ),
      startY: 38,
      styles: {
        fontSize: 8,
      },
    });

    const fileName = `${generatedReport.type}_${generatedReport.filter}_${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;

    doc.save(fileName);
  };

  return (
    <div className="space-y-6">
      <div className={cardBaseClass}>
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 shadow-inner dark:bg-[#10221C] dark:text-emerald-400">
            <BarChart3 className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Generar Reportes
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Genera reportes filtrados de usuarios y portafolios. Luego puedes
              exportarlos en formato Excel o PDF.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <FileText className="h-4 w-4 text-emerald-500" />
              Tipo de reporte
            </label>

            <select
              value={reportType}
              onChange={(event) => {
                setReportType(event.target.value as ReportType);
                setFilterStatus("all");
                setGeneratedReport(null);
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option value="summary">Resumen general</option>
              <option value="users">Usuarios</option>
              <option value="portfolios">Portafolios</option>
            </select>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
              <Filter className="h-4 w-4 text-emerald-500" />
              Filtro por estado
            </label>

            <select
              value={filterStatus}
              onChange={(event) => {
                setFilterStatus(event.target.value);
                setGeneratedReport(null);
              }}
              disabled={reportType === "summary"}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:disabled:bg-slate-800"
            >
              {availableFilters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleGenerateReport}
              className="w-full justify-center"
            >
              Generar reporte
            </Button>
          </div>
        </div>
      </div>

      {generatedReport ? (
        <div className={cardBaseClass}>
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-emerald-500" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {generatedReport.title}
                </h3>
              </div>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Generado: {generatedReport.generatedAt} · Filtro:{" "}
                {filterLabels[generatedReport.filter] || generatedReport.filter}
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="secondary" onClick={handleExportExcel}>
                <FileSpreadsheet className="h-4 w-4" />
                Exportar Excel
              </Button>

              <Button variant="secondary" onClick={handleExportPdf}>
                <FileText className="h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/70">
                <tr>
                  {generatedReport.columns.map((column) => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {generatedReport.rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={generatedReport.columns.length}
                      className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                    >
                      No hay datos para este filtro.
                    </td>
                  </tr>
                ) : (
                  generatedReport.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="bg-white dark:bg-transparent">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="px-4 py-3 text-slate-600 dark:text-slate-300"
                        >
                          {String(cell ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className={cardBaseClass}>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Table2 className="h-12 w-12 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">
              Aún no generaste un reporte
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
              Selecciona el tipo de reporte y el filtro que deseas aplicar.
              Luego presiona “Generar reporte”.
            </p>
          </div>
        </div>
      )}

      <div className={cardBaseClass}>
        <div className="mb-5 flex items-center gap-2">
          <History className="h-5 w-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Historial de reportes generados recientemente
          </h3>
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Todavía no se generaron reportes.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-900/70">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Filtro
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700 dark:text-slate-300">
                    Administrador
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {history.slice(0, MAX_HISTORY_ITEMS).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.generatedAt}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {reportTypeLabels[item.type]}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {filterLabels[item.filter] || item.filter}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {item.adminName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

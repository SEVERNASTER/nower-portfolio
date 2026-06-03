import { API_URL } from '../../profile/profileService';

export type ReportType = 'summary' | 'users' | 'portfolios';

export interface GeneratedReport {
  title: string;
  type: ReportType;
  filter: string;
  generatedAt: string;
  columns: string[];
  rows: Array<Array<string | number | null>>;
}

export interface ReportHistoryItem {
  id: number;
  report_type: ReportType;
  filter_status: string;
  generated_at: string;
  admin: {
    id: number;
    full_name: string | null;
    email: string | null;
  };
}

export async function generateAdminReport(
  token: string,
  type: ReportType,
  status: string,
): Promise<GeneratedReport> {
  const params = new URLSearchParams({
    type,
    status,
  });

  const response = await fetch(`${API_URL}/admin/reports/generate?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error generando reporte');
  }

  return json.report as GeneratedReport;
}

export async function fetchReportHistory(token: string): Promise<ReportHistoryItem[]> {
  const response = await fetch(`${API_URL}/admin/reports/history`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error cargando historial de reportes');
  }

  return json.data as ReportHistoryItem[];
}
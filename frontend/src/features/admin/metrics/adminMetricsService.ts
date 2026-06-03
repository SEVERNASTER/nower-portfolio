import { API_URL } from '../../profile/profileService';

export interface AdminSystemMetrics {
  users: {
    registered_total: number;
    admins: number;
    normal_users: number;
    password_pending: number;
  };
  portfolios: {
    approved: number;
    rejected: number;
    pending_review: number;
    unpublished: number;
  };
}

export async function fetchAdminMetrics(token: string): Promise<AdminSystemMetrics> {
  const response = await fetch(`${API_URL}/admin/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const json = await response.json();

  if (!response.ok) {
    throw new Error(json.message || 'Error cargando métricas del sistema');
  }

  return json as AdminSystemMetrics;
}
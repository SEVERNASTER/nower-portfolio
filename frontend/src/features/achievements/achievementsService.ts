import { API_URL } from '../profile/profileService';

export interface AchievementFile {
  id: string;
  url: string;
  mime_type?: string;
}

export interface Achievement {
  id: string;
  title: string;
  institution: string;
  obtained_at: string;
  description?: string;
  file_url?: string;
  file_public_id?: string;
  files?: AchievementFile[];
  created_at: string;
  user: {
    id: number;
    full_name: string;
  };
}

function authHeaders(token: string | null): HeadersInit {
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function handleError(res: Response, json: unknown): never {
  const err = json as { message?: string; errors?: Record<string, string[]>; error?: string };
  const parts = [
    err.message,
    err.error,
    err.errors ? JSON.stringify(err.errors) : undefined,
  ].filter(Boolean);
  throw new Error(parts.join(' ') || `HTTP ${res.status}`);
}

export async function fetchAchievements(token: string | null): Promise<Achievement[]> {
  const res = await fetch(`${API_URL}/achievements`, {
    headers: authHeaders(token),
  });

  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json as Achievement[];
}

export async function createAchievement(token: string | null, formData: FormData) {
  const res = await fetch(`${API_URL}/achievements`, {
    method: 'POST',
    headers: authHeaders(token),
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json as { success: boolean; achievement: Achievement; message?: string };
}

export async function updateAchievement(
  token: string | null,
  id: string,
  formData: FormData
) {
  const res = await fetch(`${API_URL}/achievements/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: formData,
  });

  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json as { success: boolean; achievement: Achievement; message?: string };
}

export async function deleteAchievement(token: string | null, id: string) {
  const res = await fetch(`${API_URL}/achievements/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json as { success: boolean; message?: string };
}

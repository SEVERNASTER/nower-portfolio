import { apiFetch } from '../../lib/apiClient';
import { API_URL } from '../profile/profileService';
import type { ApiExperienceRow } from '../experience/experienceApi';
import {
  mapApiExperienceToCard,
  parseExperienceListPayload,
  monthInputToEndDate,
  monthInputToStartDate,
} from '../experience/experienceApi';
import type { Experience } from '../experience/components/ExperienceCard';

export type EducationStatus = 'En curso' | 'Graduado' | 'Pausado';

export interface EducationCreatePayload {
  title: string;
  institution: string;
  degree_type: string;
  status: EducationStatus;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
}

export function parseValidationErrors(payload: Record<string, unknown>): Record<string, string> {
  const errors = payload.errors;
  if (!errors || typeof errors !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(errors as Record<string, unknown>)) {
    if (Array.isArray(v) && v[0]) out[k] = String(v[0]);
    else if (typeof v === 'string') out[k] = v;
  }
  return out;
}

function readErrorMessage(payload: Record<string, unknown>): string {
  if (typeof payload.message === 'string') {
    return payload.message;
  }
  const parsed = parseValidationErrors(payload);
  const first = Object.values(parsed)[0];
  if (first) return first;
  if (typeof payload.error === 'string') return payload.error;
  return 'Error en la solicitud';
}

/** Misma forma que experiencia académica en API; reutilizamos el mapper existente. */
export function mapApiEducationToCard(row: ApiExperienceRow): Experience {
  return mapApiExperienceToCard(row);
}

export async function fetchUserEducation(token: string): Promise<Experience[]> {
  const res = await fetch(`${API_URL}/education`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(readErrorMessage(data as Record<string, unknown>));
  }

  const rows = parseExperienceListPayload(data);
  return rows.map(mapApiEducationToCard);
}

function extractCreatedRow(data: unknown): ApiExperienceRow | null {
  if (data && typeof data === 'object' && 'data' in data) {
    const inner = (data as { data: unknown }).data;
    if (inner && typeof inner === 'object' && 'id' in inner) {
      return inner as ApiExperienceRow;
    }
  }
  return null;
}

export async function createEducation(
  token: string,
  body: EducationCreatePayload
): Promise<Experience> {
  const res = await fetch(`${API_URL}/education`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(readErrorMessage(data as Record<string, unknown>)), {
      validationErrors: parseValidationErrors(data as Record<string, unknown>),
    });
  }

  const row = extractCreatedRow(data);
  if (!row) {
    throw new Error('Respuesta inválida del servidor');
  }
  return mapApiEducationToCard(row);
}

export async function updateEducation(
  token: string,
  id: string | number,
  body: EducationCreatePayload
): Promise<Experience> {
  const res = await apiFetch(`${API_URL}/education/${id}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(readErrorMessage(data as Record<string, unknown>)), {
      validationErrors: parseValidationErrors(data as Record<string, unknown>),
    });
  }

  const row = extractCreatedRow(data);
  if (!row) {
    throw new Error('Respuesta inválida del servidor');
  }
  return mapApiEducationToCard(row);
}

export async function deleteEducation(token: string, id: string | number): Promise<void> {
  const res = await apiFetch(`${API_URL}/education/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(readErrorMessage(data as Record<string, unknown>));
  }
}

export { monthInputToEndDate, monthInputToStartDate };

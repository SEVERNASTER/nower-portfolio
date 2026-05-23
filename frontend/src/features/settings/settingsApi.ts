import { API_URL } from '../profile/profileService';

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  new_password_confirmation: string;
}

function readErrorMessage(payload: Record<string, unknown>): string {
  if (typeof payload.message === 'string') {
    return payload.message;
  }
  const errors = payload.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, string[]>)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }
  if (typeof payload.error === 'string') return payload.error;
  return 'Error al cambiar la contraseña';
}

export async function changePassword(
  token: string,
  payload: ChangePasswordPayload
): Promise<{ message: string }> {
  const res = await fetch(`${API_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(readErrorMessage(data as Record<string, unknown>));
  }

  return data as { message: string };
}

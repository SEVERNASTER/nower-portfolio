import { API_URL } from "../profile/profileService";

export type AuthMeUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  must_change_password: boolean;
};

export type PasswordLoginResponse = {
  sign_in_token: string;
  must_change_password: boolean;
  role?: string;
};

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<PasswordLoginResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const payload = data as Record<string, unknown>;
    throw new Error(
      typeof payload.message === "string"
        ? payload.message
        : "Credenciales inválidas.",
    );
  }

  return data as PasswordLoginResponse;
}

export async function fetchAuthMe(token: string): Promise<{ user: AuthMeUser }> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const data: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const payload = data as Record<string, unknown>;
    throw new Error(
      typeof payload.message === "string" ? payload.message : "Error de autenticación"
    );
  }

  return data as { user: AuthMeUser };
}

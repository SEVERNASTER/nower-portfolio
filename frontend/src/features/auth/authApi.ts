import { API_URL } from "../profile/profileService";

export type AuthMeUser = {
  id: number;
  email: string;
  full_name: string;
  role: string;
  must_change_password: boolean;
};

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

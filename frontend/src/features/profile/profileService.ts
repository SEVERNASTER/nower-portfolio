/**
 * profileService.ts
 *
 * La URL base se lee del .env para que todos los devs puedan cambiarla
 * sin tocar código.
 *
 * En tu .env agrega:
 *   VITE_API_URL=http://127.0.0.1:8000/api
 */

export const API_URL =
  import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ProfilePayload {
  clerk_id: string;
  full_name: string;
  profession: string;
  bio: string;
}

export interface ContactPayload {
  clerk_id: string;
  phone: string;
  city: string;
}

export interface SyncPayload {
  clerk_id: string;
  full_name: string;
  email: string;
  registration_type?: string;

  profession?: string;
  bio?: string;
  phone?: string;
  city?: string;
  image?: File | null;
  imagen_profile?: string | null;
  social_links?: {
    platform_name: string;
    url: string;
  }[];
}

// ─── Helper de error ──────────────────────────────────────────────────────────

function handleError(res: Response, json: unknown): never {
  const err = json as { message?: string; errors?: Record<string, string[]> };
  const error = new Error(err.message ?? `HTTP ${res.status}`) as Error & {
    errors?: Record<string, string[]>;
  };
  (error as any).errors = err.errors;
  throw error;
}

// ─── API calls ────────────────────────────────────────────────────────────────

/**
 * Sincroniza datos del usuario (y opcionalmente sube imagen a Cloudinary).
 *
 * IMPORTANTE: No agregues Content-Type manualmente al header.
 * El browser lo agrega automáticamente con el boundary de multipart/form-data.
 */
export async function syncUser(payload: SyncPayload) {
  const form = new FormData();
  form.append("clerk_id", payload.clerk_id);
  form.append("full_name", payload.full_name);
  form.append("email", payload.email);

  if (payload.registration_type) {
  form.append(
    "registration_type",
    payload.registration_type
  );
}
  if (payload.profession) form.append("profession", payload.profession);
  if (payload.bio) form.append("bio", payload.bio);
  if (payload.phone) form.append("phone", payload.phone);
  if (payload.city) form.append("city", payload.city);
  if (payload.imagen_profile)
    form.append("imagen_profile", payload.imagen_profile);
  if (payload.social_links?.length) {
    payload.social_links.forEach((link, index) => {
      form.append(`social_links[${index}][platform_name]`, link.platform_name);
      form.append(`social_links[${index}][url]`, link.url);
    });
  } else {
    form.append("social_links", "");
  }

  // El campo se llama "image" — debe coincidir con el backend
  if (payload.image) {
    form.append("image", payload.image);
  }

  const res = await fetch(`${API_URL}/sync-user`, {
    method: "POST",
    headers: { Accept: "application/json" }, // NO Content-Type aqui
    body: form,
  });

  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json as { success: boolean; user: Record<string, unknown> };
}

/** Lee el perfil del usuario desde el backend */
export async function getProfile(clerkId: string) {
  const res = await fetch(`${API_URL}/profile?clerk_id=${clerkId}`, {
    headers: { Accept: "application/json" },
  });
  return res.json();
}

/** Actualiza solo datos de perfil (sin imagen) */
export async function updateProfile(data: ProfilePayload) {
  const res = await fetch(`${API_URL}/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json;
}

/** Actualiza solo datos de contacto */
export async function updateContact(data: ContactPayload) {
  const res = await fetch(`${API_URL}/profile/contact`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) handleError(res, json);
  return json;
}

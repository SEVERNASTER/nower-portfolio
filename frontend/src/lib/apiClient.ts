/**
 * Cliente HTTP centralizado para la API.
 *
 * Algunos servidores Apache (p. ej. hosting compartido) bloquean PUT/PATCH/DELETE
 * antes de que la petición llegue a Laravel. Laravel soporta method spoofing:
 * enviar POST con X-HTTP-Method-Override o _method en FormData.
 *
 * El backend mantiene rutas REST estándar; la adaptación del transporte vive aquí.
 */

export type ApiMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

const SPOOFED_METHODS = new Set<ApiMethod>(["PUT", "PATCH", "DELETE"]);

function cloneFormData(source: FormData): FormData {
  const copy = new FormData();
  source.forEach((value, key) => {
    copy.append(key, value);
  });
  return copy;
}

export async function apiFetch(
  input: RequestInfo | URL,
  init: RequestInit & { method?: ApiMethod } = {},
): Promise<Response> {
  const method = (init.method ?? "GET").toUpperCase() as ApiMethod;

  if (!SPOOFED_METHODS.has(method)) {
    return fetch(input, init);
  }

  const headers = new Headers(init.headers);
  headers.set("X-HTTP-Method-Override", method);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  let body = init.body;
  if (body instanceof FormData) {
    const formData = cloneFormData(body);
    formData.append("_method", method);
    body = formData;
  }

  return fetch(input, {
    ...init,
    method: "POST",
    headers,
    body,
  });
}

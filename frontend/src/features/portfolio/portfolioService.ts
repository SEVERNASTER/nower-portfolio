import { API_URL } from '../profile/profileService';

export type PortfolioTemplateKey = 'classic' | 'modern' | 'creative';

export interface PortfolioStatus {
  id: number;
  status: 'unpublished' | 'pending_review' | 'published';
  is_public: boolean;
  review_status: null | 'pending' | 'approved' | 'rejected';
  review_comment?: string | null;
  reviewed_at?: string | null;
  template_key: PortfolioTemplateKey;
  public_slug?: string | null;
  public_url?: string | null;
}

export interface PortfolioPreviewResponse {
  portfolio: PortfolioStatus;
  user: any;
}

function authHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  };
}

function jsonHeaders(token: string): HeadersInit {
  return {
    ...authHeaders(token),
    'Content-Type': 'application/json',
  };
}

function readErrorMessage(payload: any): string {
  if (payload?.message) return payload.message;

  if (payload?.errors) {
    const first = Object.values(payload.errors)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
  }

  return 'Error en la solicitud';
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(readErrorMessage(json));
  }

  return json as T;
}

export async function fetchPortfolioStatus(token: string): Promise<PortfolioStatus> {
  const res = await fetch(`${API_URL}/portfolio/status`, {
    headers: authHeaders(token),
  });

  const json = await handleResponse<{ data: PortfolioStatus }>(res);
  return json.data;
}

export async function fetchPortfolioPreview(token: string): Promise<PortfolioPreviewResponse> {
  const res = await fetch(`${API_URL}/portfolio/preview`, {
    headers: authHeaders(token),
  });

  return handleResponse<PortfolioPreviewResponse>(res);
}

export async function publishPortfolio(
  token: string,
  templateKey: PortfolioTemplateKey
): Promise<{ message: string; data: PortfolioStatus }> {
  const res = await fetch(`${API_URL}/portfolio/publish`, {
    method: 'POST',
    headers: jsonHeaders(token),
    body: JSON.stringify({
      template_key: templateKey,
    }),
  });

  return handleResponse<{ message: string; data: PortfolioStatus }>(res);
}

export async function unpublishPortfolio(
  token: string
): Promise<{ message: string; data: PortfolioStatus }> {
  const res = await fetch(`${API_URL}/portfolio/unpublish`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return handleResponse<{ message: string; data: PortfolioStatus }>(res);
}

export async function fetchPublicPortfolio(slug: string): Promise<PortfolioPreviewResponse> {
  const res = await fetch(`${API_URL}/public/portfolios/${slug}`, {
    headers: {
      Accept: 'application/json',
    },
  });

  return handleResponse<PortfolioPreviewResponse>(res);
}
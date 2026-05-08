import type { Experience } from './components/ExperienceCard';
import { API_URL } from '../profile/profileService';

export interface ApiExperienceRow {
    id: number;
    type: 'work' | 'academic';
    title: string;
    institution: string;
    degree_type: string | null;
    status: 'En curso' | 'Graduado' | 'Pausado' | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
}

export interface ExperienceCreatePayload {
    type: 'work' | 'academic';
    title: string;
    institution: string;
    degree_type?: string | null; 
    status?: 'En curso' | 'Graduado' | 'Pausado' | null;
    start_date: string | null;
    end_date: string | null;
    description: string | null;
}

const MONTHS_SHORT = [
    'ene',
    'feb',
    'mar',
    'abr',
    'may',
    'jun',
    'jul',
    'ago',
    'sep',
    'oct',
    'nov',
    'dic',
] as const;

function formatMonthYear(iso: string | null): string {
    if (!iso) return '—';
    const [y, m] = iso.split('-');
    const mi = parseInt(m, 10) - 1;
    if (!y || Number.isNaN(mi) || mi < 0 || mi > 11) return iso;
    return `${MONTHS_SHORT[mi]} ${y}`;
}

/** Separa tecnologías guardadas como bloque final `Tecnologías: …` dentro de `description`. */
function splitDescriptionAndTechnologies(raw: string | null): { text: string; skills: string[] } {
    if (!raw) return { text: '', skills: [] };
    const idx = raw.search(/\n\nTecnologías:\s*/i);
    if (idx === -1) return { text: raw.trim(), skills: [] };
    const text = raw.slice(0, idx).trim();
    const rest = raw.slice(idx).replace(/\n\nTecnologías:\s*/i, '');
    const skills = rest
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    return { text, skills };
}

export function mapApiExperienceToCard(row: ApiExperienceRow): Experience {
    const current = row.end_date == null;
    const { text, skills } = splitDescriptionAndTechnologies(row.description);
return {
    id: String(row.id),
    role: row.title,
    company: row.institution,
    location: '',
    startDate: row.start_date ? formatMonthYear(row.start_date) : '—',
    endDate: current ? 'Actual' : formatMonthYear(row.end_date),
    current,
    description: text,
    skills,
    experienceType: row.type,
    degree_type: row.degree_type || undefined,
        status: row.status || undefined,
    rawStartDate: row.start_date,
    rawEndDate: row.end_date,
};
}

export function parseExperienceListPayload(data: unknown): ApiExperienceRow[] {
    if (Array.isArray(data)) {
        return data as ApiExperienceRow[];
    }
    if (
        data &&
        typeof data === 'object' &&
        'data' in data &&
        Array.isArray((data as { data: unknown }).data)
    ) {
        return (data as { data: ApiExperienceRow[] }).data;
    }
    return [];
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
    return 'Error en la solicitud';
}

export async function fetchUserExperiences(token: string): Promise<Experience[]> {
    const res = await fetch(`${API_URL}/experience`, {
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
    return rows.map(mapApiExperienceToCard);
}

export async function createExperience(token: string, body: ExperienceCreatePayload): Promise<void> {
    const res = await fetch(`${API_URL}/experience`, {
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
        throw new Error(readErrorMessage(data as Record<string, unknown>));
    }
}
export async function updateExperience(
    token: string,
    id: string | number,
    body: ExperienceCreatePayload
): Promise<void> {
    const res = await fetch(`${API_URL}/experience/${id}`, {
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
        throw new Error(readErrorMessage(data as Record<string, unknown>));
    }
}

export async function deleteExperience(
    token: string,
    id: string | number
): Promise<void> {
    const res = await fetch(`${API_URL}/experience/${id}`, {
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

/** Convierte valor de input month (YYYY-MM) al primer día del mes. */
export function monthInputToStartDate(ym: string): string | null {
    const t = ym.trim();
    if (!/^\d{4}-\d{2}$/.test(t)) return null;
    return `${t}-01`;
}

/** Último día del mes para end_date. */
export function monthInputToEndDate(ym: string): string | null {
    const t = ym.trim();
    if (!/^\d{4}-\d{2}$/.test(t)) return null;
    const [ys, ms] = t.split('-');
    const y = parseInt(ys, 10);
    const m = parseInt(ms, 10);
    const last = new Date(y, m, 0).getDate();
    return `${ys}-${ms}-${String(last).padStart(2, '0')}`;
}

import { Badge } from '../../../components/ui/Badge';
import {
  PortfolioDetail,
  PortfolioStatus,
} from './portfolioAdminTypes';

export const parseTags = (tags: any): string[] => {
    if (Array.isArray(tags)) return tags;

    if (typeof tags === 'string') {
        try {
            const parsed = JSON.parse(tags);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            return tags.split(',').map(t => t.trim()).filter(Boolean);
        }
    }

    return [];
};

export const ensureValidUrl = (url?: string): string => {
    if (!url || url.trim() === '' || url === '#') return '#';

    const trimmedUrl = url.trim();

    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
        return `https://${trimmedUrl}`;
    }

    return trimmedUrl;
};

export const getStatusBadge = (status: PortfolioDetail['status']) => {
    if (status === 'Aprobado') {
        return <Badge variant="success">{status}</Badge>;
    }

    if (status === 'Rechazado') {
        return <Badge variant="neutral">{status}</Badge>;
    }

    return <Badge variant="warning">{status}</Badge>;
};

export const getPortfolioStatus = (portfolio: any): PortfolioStatus => {
    if (!portfolio) {
        return 'No publicado';
    }

    const reviewStatus = portfolio?.review_status;

    if (reviewStatus === 'approved') {
        return 'Aprobado';
    }

    if (reviewStatus === 'rejected') {
        return 'Rechazado';
    }

    if (portfolio.status === 'pending_review') {
        return 'Pendiente';
    }

    if (portfolio.status === 'published') {
        return 'Aprobado';
    }

    return 'No publicado';
};

export const formatSubmittedAt = (date?: string): string => {
    if (!date) return 'N/A';

    return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
};

export const formatPeriodDate = (dateStr?: string): string => {
    if (!dateStr) return '';

    const date = new Date(dateStr);

    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-ES', {
        month: 'short',
        year: 'numeric',
    });
};
export type PortfolioStatus =
    | 'Pendiente'
    | 'Aprobado'
    | 'Rechazado'
    | 'No publicado';

export type PortfolioStatusFilter =
    | 'Todos'
    | 'Pendiente'
    | 'Aprobado'
    | 'Rechazado';

export type ReviewAction =
    | 'approved'
    | 'rejected';

export interface PortfolioDetail {
    id: string;
    userId: string;
    portfolioId: number | null;
    nombre: string;
    rol: string;
    ciudad: string;
    email: string;
    telefono: string;
    bio: string;
    proyectos: Array<{
        id: string;
        titulo: string;
        descripcion: string;
        tecnologias: string[];
        enlace: string;
        imagenes?: string[];
        links?: Array<{ platform_name: string; url: string }>;
    }>;
    experiencia: Array<{
        id: string;
        tipo: 'work' | 'academic';
        cargo: string;
        empresa: string;
        periodo: string;
        modalidad?: string;
        ubicacion?: string;
        descripcion?: string;
    }>;
    skills: string[];
    status: PortfolioStatus;
    imagen_profile?: string;
    templateKey: 'classic' | 'modern' | 'creative';
    rawUser: any;
}
// ==========================================
// TYPES & INTERFACES
// ==========================================

export type ProjectStatus = 'PUBLICADO' | 'BORRADOR';
export type SkillLevel = 'Básico' | 'Intermedio' | 'Avanzado' | 'Experto';

export interface UserProfile {
    id: string;
    fullName: string;
    role: string;
    bio: string;
    avatarUrl: string;
    coverUrl?: string;
    status: 'ACTIVO' | 'INACTIVO';
}

export interface Project {
    id: string;
    title: string;
    description: string;
    status: ProjectStatus;
    tags: string[];
    repositoryUrl?: string;
    liveUrl?: string;
    imageUrl?: string;
    createdAt: string;
}

export interface Skill {
    id: string;
    name: string;
    category: 'Técnica' | 'Blanda';
    level: SkillLevel;
}

export interface Experience {
    id: string;
    role: string;
    company: string;
    startDate: string;
    endDate: string | 'Presente';
    description: string;
    type: 'Laboral' | 'Académica';
}

// ==========================================
// MOCK DATA
// ==========================================

export const mockProfile: UserProfile = {
    id: "usr_01",
    fullName: "Alex Developer",
    role: "Full Stack Software Engineer",
    bio: "Apasionado por crear soluciones eficientes y escalables. Más de 3 años de experiencia trabajando con tecnologías web modernas como React, Node.js y arquitecturas Cloud.",
    avatarUrl: "/api/placeholder/150/150",
    status: "ACTIVO"
};

export const mockProjects: Project[] = [
    {
        id: "proj_01",
        title: "E-commerce API",
        description: "Microservicio para procesamiento de pagos y gestión de inventario.",
        status: "PUBLICADO",
        tags: ["NODE.JS", "EXPRESS", "MONGODB"],
        repositoryUrl: "https://github.com/alexdev/ecommerce-api",
        createdAt: "2023-10-15T10:00:00Z"
    },
    {
        id: "proj_02",
        title: "Dashboard Analítico",
        description: "Panel de control en tiempo real para métricas de usuarios usando WebSockets.",
        status: "BORRADOR",
        tags: ["REACT", "TAILWIND", "SOCKET.IO"],
        createdAt: "2024-01-20T14:30:00Z"
    },
    {
        id: "proj_03",
        title: "Nower Portfolio Builder",
        description: "Plataforma SaaS para la creación y gestión de portafolios profesionales.",
        status: "PUBLICADO",
        tags: ["REACT", "TYPESCRIPT", "TAILWIND"],
        liveUrl: "https://nower.com/alexdev",
        createdAt: "2024-02-10T09:15:00Z"
    }
];

export const mockSkills: Skill[] = [
    { id: "sk_01", name: "React / Next.js", category: "Técnica", level: "Avanzado" },
    { id: "sk_02", name: "TypeScript", category: "Técnica", level: "Intermedio" },
    { id: "sk_03", name: "Node.js", category: "Técnica", level: "Avanzado" },
    { id: "sk_04", name: "Comunicación Asertiva", category: "Blanda", level: "Experto" }
];

export const mockExperience: Experience[] = [
    {
        id: "exp_01",
        role: "Frontend Developer",
        company: "Tech Solutions Inc.",
        startDate: "2022-03",
        endDate: "Presente",
        description: "Líder del equipo frontend en la migración de una arquitectura monolítica a micro-frontends utilizando React y Webpack.",
        type: "Laboral"
    },
    {
        id: "exp_02",
        role: "Ingeniería de Software",
        company: "Universidad Mayor de San Simón",
        startDate: "2018-02",
        endDate: "2022-11",
        description: "Titulación por excelencia. Proyecto de grado enfocado en optimización de algoritmos de búsqueda.",
        type: "Académica"
    }
];
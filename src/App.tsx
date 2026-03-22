import React, { useState } from 'react';
import DashboardLayout from './components/layouts/DashboardLayout';
import { BasicProfile } from './features/profile/BasicProfile';
import { ProjectsList } from './features/projects/ProjectsList';
import { User, FolderGit2, Code, Briefcase } from 'lucide-react';
import type { NavItem } from './components/navigation/Sidebar';

// ==========================================
// APP
// ==========================================

const navItems: NavItem[] = [
    { name: 'Perfil Básico', icon: User },
    { name: 'Proyectos', icon: FolderGit2, badge: '2' },
    { name: 'Habilidades', icon: Code },
    { name: 'Experiencia', icon: Briefcase },
];

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>('Perfil Básico');

    const renderContent = (): React.ReactNode => {
        switch (activeTab) {
            case 'Perfil Básico':
                return <BasicProfile />;
            case 'Proyectos':
                return <ProjectsList />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                        <div className="rounded-full bg-slate-100 dark:bg-[#10221C] p-4 mb-4">
                            <Code className="h-8 w-8 text-emerald-500" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Próximamente</h3>
                        <p className="text-slate-500 dark:text-slate-400 max-w-sm">La pestaña de {activeTab} está en desarrollo y estará disponible pronto.</p>
                    </div>
                );
        }
    };

    return (
        <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab} navItems={navItems}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default App;

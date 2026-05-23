import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  Menu,
  Monitor,
  Smartphone,
  Tablet,
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { ErrorBoundary } from '../core/ErrorBoundary';
import type { NavItem } from '../navigation/Sidebar';
import { Sidebar } from '../navigation/Sidebar';
import { Button } from '../ui/Button';

// ==========================================
// DASHBOARD LAYOUT
// ==========================================

export interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (name: string) => void;
    navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab, navItems }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(true);
    const location = useLocation();
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
    const [previewDevice, setPreviewDevice] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

    const previewWidthClass = {
        mobile: 'max-w-[390px]',
        tablet: 'max-w-[768px]',
        desktop: 'max-w-4xl',
    }[previewDevice];


    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    return (
        <ErrorBoundary>
            <div className="flex h-screen w-full bg-slate-50 dark:bg-[#10221C] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">    {/* Mobile Sidebar Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <Sidebar
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                    isDark={isDark}
                    toggleTheme={() => setIsDark(!isDark)}
                    navItems={navItems}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="flex h-20 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F1C22]/80 px-4 sm:px-8 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" onClick={() => setIsSidebarOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="hidden sm:flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                <span className="hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Dashboard</span>
                                <span className="mx-2">/</span>
                                <span className="text-slate-900 dark:text-white font-bold">{activeTab}</span>
                            </div>
                        </div>

                        {!location.pathname.startsWith('/admin') && (
                            <Button 
                                variant="secondary" 
                                icon={Eye}
                                className="hidden sm:flex"
                                onClick={() => setIsPreviewMode((prev) => !prev)}
                            >
                                {isPreviewMode ? 'Volver a edición' : 'Preview Público'}    
                            </Button>
                        )}
                    </header>

                <div className="flex-1 overflow-y-auto p-4 sm:p-8">
    {isPreviewMode && (
        <div className="mb-6 flex flex-col items-center gap-3">
            <div className="rounded-2xl border border-purple-200 dark:border-purple-900/40 bg-purple-50 dark:bg-purple-500/10 px-4 py-3 text-center">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                    Modo vista previa activo
                </p>
                <p className="text-xs text-purple-600/80 dark:text-purple-300/70">
                    La edición está bloqueada para simular cómo se visualizará el portafolio.
                </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
                <button
                    type="button"
                    onClick={() => setPreviewDevice('mobile')}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        previewDevice === 'mobile'
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#17262C] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                    <Smartphone className="h-4 w-4" />
                    Móvil
                </button>

                <button
                    type="button"
                    onClick={() => setPreviewDevice('tablet')}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        previewDevice === 'tablet'
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#17262C] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                    <Tablet className="h-4 w-4" />
                    Tablet
                </button>

                <button
                    type="button"
                    onClick={() => setPreviewDevice('desktop')}
                    className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        previewDevice === 'desktop'
                            ? 'border-purple-600 bg-purple-600 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-[#17262C] dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                    <Monitor className="h-4 w-4" />
                    Escritorio
                </button>
            </div>
        </div>
    )}

    <div className={`mx-auto transition-all duration-300 ${isPreviewMode ? previewWidthClass : 'max-w-4xl'}`}>
        <div
            className={
                isPreviewMode
                    ? 'rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0F1C22]/70 p-4 shadow-2xl pointer-events-none select-none'
                    : ''
            }
            aria-label={isPreviewMode ? 'Vista previa del portafolio en modo solo lectura' : undefined}
        >
            {children}
        </div>
    </div>
</div>    
                </main>
            </div>
        </ErrorBoundary>
    );
};

export default DashboardLayout;

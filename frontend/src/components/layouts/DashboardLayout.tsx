import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
  Menu,
  Home,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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
    settingsNavItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
    children,
    activeTab,
    setActiveTab,
    navItems,
    settingsNavItems,
}) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(() => {
        const stored = localStorage.getItem('theme');
        if (stored !== null) return stored === 'dark';
        return document.documentElement.classList.contains('dark') || true;
    });
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'theme') {
                setIsDark(e.newValue === 'dark');
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, []);

    const toggleTheme = () => {
        const next = !isDark;
        setIsDark(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
    };

    return (
        <ErrorBoundary>
            <div className="flex h-[100dvh] w-full bg-slate-50 dark:bg-[#10221C] text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans overflow-hidden">
                {/* Mobile Sidebar Overlay */}
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
                    toggleTheme={toggleTheme}
                    navItems={navItems}
                    settingsNavItems={settingsNavItems}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                />

                <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <header className="flex h-16 sm:h-20 shrink-0 items-center justify-between border-b border-slate-200 dark:border-slate-800/60 bg-white/80 dark:bg-[#0F1C22]/80 px-3 sm:px-8 backdrop-blur-md">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                            <button className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0" onClick={() => setIsSidebarOpen(true)}>
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="flex items-center text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 min-w-0 truncate">
                                <span className="hidden sm:inline hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors">Dashboard</span>
                                <span className="hidden sm:inline mx-2">/</span>
                                <span className="text-slate-900 dark:text-white font-bold truncate">{activeTab}</span>
                            </div>
                        </div>

                        <Button 
                            variant="secondary" 
                            icon={Home} 
                            className="shrink-0"
                            onClick={() => navigate('/')}
                        >
                            <span className="hidden sm:inline">Ir a Inicio</span>
                        </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 lg:p-8">
                        <div className="mx-auto w-full max-w-4xl xl:max-w-6xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
};

export default DashboardLayout;

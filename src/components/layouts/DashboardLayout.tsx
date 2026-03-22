import React, { useState, useEffect } from 'react';
import { Menu, Eye } from 'lucide-react';
import { ErrorBoundary } from '../core/ErrorBoundary';
import { Sidebar } from '../navigation/Sidebar';
import type { NavItem } from '../navigation/Sidebar';
import { Button } from '../ui/Button';

// ==========================================
// DASHBOARD LAYOUT
// ==========================================

export interface DashboardLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: React.Dispatch<React.SetStateAction<string>>;
    navItems: NavItem[];
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, activeTab, setActiveTab, navItems }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [isDark, setIsDark] = useState<boolean>(true);

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

                        <Button variant="secondary" icon={Eye} className="hidden sm:flex">
                            Preview Público
                        </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-8">
                        <div className="mx-auto max-w-4xl">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </ErrorBoundary>
    );
};

export default DashboardLayout;

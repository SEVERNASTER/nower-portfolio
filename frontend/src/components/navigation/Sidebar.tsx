import React from 'react';
import { X, Moon, Sun, LogOut, Globe } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Tab } from './Tab';
import { Avatar } from '../ui/Avatar';

// ==========================================
// SIDEBAR
// ==========================================

export interface NavItem {
    name: string;
    icon: LucideIcon;
    badge?: string;
    path?: string;
}

export interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isDark: boolean;
    toggleTheme: () => void;
    navItems: NavItem[];
    activeTab: string;
    setActiveTab: (name: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDark, toggleTheme, navItems, activeTab, setActiveTab }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform flex-col bg-white dark:bg-[#17262C] border-r border-slate-200 dark:border-slate-800/60 transition-transform duration-300 lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex`}>
            <div className="flex h-20 items-center gap-3 px-6">
                <img src="/nowerLogo.png" alt="NOWER Logo" className="h-[2.75rem] w-auto object-contain" />
                <div className="flex flex-col justify-center">
                    <h1 className="text-2xl font-black tracking-tight text-[#0f224a] dark:text-white leading-none">
                        NOWER
                    </h1>
                    {/* Changed mt-0.5 to -mt-1 to pull the text up tightly against the H1 */}
                    <p className="-mt-6 text-[9px] sm:text-[10px] md:block hidden font-semibold text-slate-500 tracking-widest uppercase">
                        Efficient Web Performance
                    </p>
                </div>
                <button className="ml-auto lg:hidden" onClick={onClose}>
                    <X className="h-6 w-6 text-slate-500" />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
                <p className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Gestión de Portafolio</p>
                {navItems.map((item) => (
                    <Tab
                        key={item.name}
                        icon={item.icon}
                        label={item.name}
                        active={activeTab === item.name}
                        badge={item.badge}
                        onClick={() => setActiveTab(item.name)}
                    />
                ))}

                <div className="mt-8 mb-4 border-t border-slate-200 dark:border-slate-800/60" />
                <p className="px-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Configuración</p>
                <Tab icon={Globe} label="Visibilidad Pública" active={false} />
            </nav>

            {/* Bottom Actions */}
            <div className="border-t border-slate-200 dark:border-slate-800/60 p-4">
                <div className="mb-4 flex items-center justify-between px-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Modo Visual</span>
                    <button onClick={toggleTheme} className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-[#162033]">
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}`} />
                        {isDark ? <Moon className="absolute left-1.5 h-3 w-3 text-slate-400" /> : <Sun className="absolute right-1.5 h-3 w-3 text-amber-500" />}
                    </button>
                </div>

                <button className="flex w-full items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-[#10221C] p-3 transition-colors hover:border-slate-300 dark:hover:border-slate-600">
                    <Avatar name="Alex Developer" size="sm" className="border-2 border-emerald-500" />
                    <div className="flex flex-1 flex-col text-left">
                        <span className="text-sm font-bold text-slate-900 dark:text-white leading-none">Alex Dev</span>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase">Manager</span>
                    </div>
                    <LogOut className="h-4 w-4 text-slate-400" />
                </button>
            </div>
        </aside>
    );
};

export { Sidebar };
export default Sidebar;

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
    value: string;
    label: string | React.ReactNode;
}

interface CustomDropdownProps {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder?: string;
    className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, label, placeholder = 'Seleccionar...', className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all duration-300 ${isOpen
                        ? 'border-emerald-500 ring-1 ring-emerald-500 bg-white dark:bg-[#1a2e26]'
                        : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#10221C]'
                    } text-slate-900 dark:text-white focus:outline-none`}
            >
                <span className={`truncate ${!selectedOption ? 'text-slate-400 dark:text-slate-500' : ''}`}>
                    {selectedOption?.label || placeholder}
                </span>
                <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown Menu */}
            <div
                className={`absolute z-50 mt-2 w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#10221C] shadow-lg overflow-hidden transition-all duration-300 ease-in-out origin-top ${isOpen
                        ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
                        : 'opacity-0 -translate-y-2 scale-95 pointer-events-none'
                    }`}
            >
                <div className="py-1 max-h-60 overflow-y-auto scrollbar-thin">
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => {
                                onChange(option.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${value === option.value
                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

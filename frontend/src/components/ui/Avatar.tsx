import React from 'react';
import { User } from 'lucide-react';

// ==========================================
// AVATAR
// ==========================================

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
    src?: string;
    name?: string;
    size?: AvatarSize;
    className?: string;
}

const sizeClasses: Record<AvatarSize, string> = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-24 w-24 sm:h-32 sm:w-32 text-2xl',
};

const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', className = '' }) => {
    return (
        <div className={`relative inline-flex items-center justify-center overflow-hidden rounded-full text-white dark:text-slate-900 dark:bg-slate-200 bg-slate-900 ${sizeClasses[size]} ${className}`}>
            {src ? (
                <img src={src} alt={name} className="h-full w-full object-cover" />
            ) : (
                <User className="h-1/2 w-1/2 text-slate-400 dark:text-slate-500" />
            )}
        </div>
    );
};

export { Avatar };
export default Avatar;

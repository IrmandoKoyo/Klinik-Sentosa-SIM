import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    icon?: React.ReactNode;
    error?: string;
}

export const Input: React.FC<InputProps> = ({ label, icon, error, className = '', ...props }) => {
    return (
        <div className="w-full">
            {label && <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 ml-1">{label}</label>}
            <div className="relative">
                {icon && <div className="absolute left-4 top-3.5 text-gray-400">{icon}</div>}
                <input
                    className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition dark:text-white placeholder-gray-400 font-medium ${error ? 'border-red-500' : ''} ${className}`}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>
    );
};

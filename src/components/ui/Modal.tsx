import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    title?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
            <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md p-0 shadow-2xl overflow-hidden transform transition-all scale-100">
                {title && (
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                    </div>
                )}
                <div className={title ? "p-6" : ""}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
};

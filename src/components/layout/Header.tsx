import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Menu, Moon, Sun } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { currentUser } = useClinic();
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        if (localStorage.getItem('theme') === 'dark') {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    }, []);

    const toggleTheme = () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <header className="h-20 bg-white/95 dark:bg-slate-800/95 sticky top-0 z-20 flex items-center justify-between px-6 lg:px-8 border-b border-gray-200 dark:border-slate-700 backdrop-blur-md">
            <div className="flex items-center">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden mr-4 text-slate-500 hover:text-primary p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                    <Menu size={24} />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                        {/* We can make this dynamic based on route later */}
                        Dashboard
                    </h2>
                    <p className="text-xs text-slate-500 hidden sm:block">{formatDate(new Date())}</p>
                </div>
            </div>

            <div className="flex items-center space-x-3">
                <button
                    onClick={toggleTheme}
                    className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-yellow-400 flex items-center justify-center hover:bg-slate-50 transition shadow-sm"
                >
                    {isDark ? <Moon size={20} /> : <Sun size={20} />}
                </button>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-600 mx-2"></div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm font-bold text-slate-700 dark:text-white leading-tight">{currentUser?.name}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {currentUser?.role}
                        </p>
                    </div>
                </div>
            </div>
        </header>
    );
};

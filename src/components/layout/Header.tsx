import React from 'react';
import { useClinic } from '../../context/ClinicContext';
import { Menu, Moon, Sun } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const Header: React.FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
    const { currentUser, updateUser } = useClinic();
    const [isDark, setIsDark] = React.useState(false);

    React.useEffect(() => {
        // Check local storage or system preference
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        } else {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
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

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        if (currentUser && (currentUser as any).firestoreId) {
            try {
                // Optimistic update locally if needed, but context should handle it via snapshot
                await updateUser((currentUser as any).firestoreId, { status: newStatus as any });
            } catch (error) {
                console.error("Failed to update status:", error);
                alert("Gagal mengupdate status. Periksa koneksi internet Anda.");
            }
        } else {
            console.error("User ID missing or invalid for status update");
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
                {currentUser?.role === 'dokter' && (
                    <div className="hidden md:flex items-center gap-2 mr-2">
                        <select
                            value={currentUser.status || 'Offline'}
                            onChange={handleStatusChange}
                            className={`text-xs font-bold py-1 px-2 rounded-lg border-2 outline-none cursor-pointer transition-colors ${currentUser.status === 'Ready' ? 'border-green-500 text-green-600 bg-green-50' :
                                currentUser.status === 'Tindakan' ? 'border-red-500 text-red-600 bg-red-50' :
                                    currentUser.status === 'Istirahat' ? 'border-yellow-500 text-yellow-600 bg-yellow-50' :
                                        'border-slate-300 text-slate-500 bg-slate-50'
                                }`}
                        >
                            <option value="Ready">🟢 Ready</option>
                            <option value="Tindakan">🔴 Tindakan</option>
                            <option value="Istirahat">🟡 Istirahat</option>
                            <option value="Offline">⚫ Offline</option>
                        </select>
                    </div>
                )}

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

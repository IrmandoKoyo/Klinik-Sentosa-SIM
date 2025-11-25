import React from 'react';
import { NavLink } from 'react-router-dom';
import { useClinic } from '../../context/ClinicContext';
import {
    LayoutDashboard,
    UserPlus,
    Stethoscope,
    CreditCard,
    Pill,
    PieChart,
    LogOut,
    HeartPulse,
    Users
} from 'lucide-react';

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { currentUser, logout } = useClinic();

    if (!currentUser) return null;

    const role = currentUser.role;

    const links = [
        { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'dokter', 'kasir', 'apoteker'] },
        { to: '/registration', label: 'Pendaftaran', icon: <UserPlus size={20} />, roles: ['admin', 'kasir'] },
        { to: '/examination', label: 'Pemeriksaan', icon: <Stethoscope size={20} />, roles: ['admin', 'dokter'] },
        { to: '/payment', label: 'Pembayaran', icon: <CreditCard size={20} />, roles: ['admin', 'kasir'] },
        { to: '/pharmacy', label: 'Apotek & Stok', icon: <Pill size={20} />, roles: ['admin', 'apoteker'] },
        { to: '/report', label: 'Laporan', icon: <PieChart size={20} />, roles: ['admin'] },
        { to: '/users', label: 'Pengguna', icon: <Users size={20} />, roles: ['admin'] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(role));

    return (
        <>
            {/* Mobile Overlay */}
            <div
                className={`fixed inset-0 bg-black/50 z-20 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <aside className={`
        w-72 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-gray-200 dark:border-slate-700 
        flex flex-col fixed h-full z-30 transition-transform duration-300 
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        shadow-xl lg:shadow-none
      `}>
                <div className="h-20 flex items-center px-8 border-b border-gray-200 dark:border-slate-700">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-teal-600 flex items-center justify-center text-white shadow-lg mr-3">
                        <HeartPulse size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg text-slate-800 dark:text-white leading-none tracking-tight">SENTOSA</h1>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clinic System</span>
                    </div>
                </div>

                <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
                    <p className="px-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Main Navigation</p>

                    {filteredLinks.map(link => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => window.innerWidth < 1024 && onClose()}
                            className={({ isActive }) => `
                flex items-center px-4 py-3 rounded-xl transition group
                ${isActive
                                    ? 'bg-teal-50 dark:bg-slate-700/50 text-primary'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-slate-700/50 hover:text-primary'
                                }
              `}
                        >
                            <span className={`
                w-8 h-8 flex items-center justify-center rounded-lg shadow-sm mr-3 transition border
                ${window.location.pathname === link.to
                                    ? 'bg-white dark:bg-slate-800 text-primary border-slate-100 dark:border-slate-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-400 group-hover:text-primary border-slate-100 dark:border-slate-600'
                                }
              `}>
                                {link.icon}
                            </span>
                            <span className="font-medium">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
                    <div className="flex items-center mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs mr-3">
                            {currentUser.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-700 dark:text-white truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-slate-500 uppercase truncate">{currentUser.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm('Keluar?')) logout();
                        }}
                        className="w-full flex items-center justify-center px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 border border-red-100 dark:border-red-900/30 rounded-xl transition font-bold text-sm gap-2"
                    >
                        <LogOut size={16} /> Keluar
                    </button>
                </div>
            </aside>
        </>
    );
};

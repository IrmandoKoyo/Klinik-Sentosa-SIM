import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Search, LogOut, Check, User, CreditCard, Pill, Flag, Info, Stethoscope } from 'lucide-react';

import { normalizeDate, getTodayDateString } from '../utils/helpers';

export const VisitorPortal: React.FC = () => {
    const { queue } = useClinic();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState<any>(null);

    const handleSearch = () => {
        if (!searchQuery) return;

        const today = getTodayDateString();
        const todayQueue = queue.filter(q => normalizeDate(q.date) === today);

        const result = todayQueue.find(
            q => q.id.toLowerCase() === searchQuery.toLowerCase() ||
                q.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (result) {
            setSearchResult(result);
        } else {
            alert('Data antrian hari ini tidak ditemukan!');
            setSearchResult(null);
        }
    };

    const getProgressWidth = (status: string) => {
        const map: Record<string, string> = {
            'waiting': '20%',
            'exam': '40%',
            'payment': '60%',
            'pharmacy': '80%',
            'done': '100%'
        };
        return map[status] || '0%';
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'waiting':
                return {
                    label: 'Menunggu Dokter',
                    desc: 'Silahkan tunggu panggilan dokter di ruang tunggu.',
                    icon: <User size={48} />,
                    color: 'bg-yellow-500'
                };
            case 'exam':
                return {
                    label: 'Sedang Diperiksa',
                    desc: 'Anda sedang diperiksa oleh dokter di dalam ruangan.',
                    icon: <Stethoscope size={48} />,
                    color: 'bg-blue-500'
                };
            case 'payment':
                return {
                    label: 'Menunggu Pembayaran',
                    desc: 'Silahkan menuju kasir untuk melakukan pembayaran.',
                    icon: <CreditCard size={48} />,
                    color: 'bg-orange-500'
                };
            case 'pharmacy':
                return {
                    label: 'Menunggu Obat',
                    desc: 'Silahkan tunggu di depan apotek, obat sedang disiapkan.',
                    icon: <Pill size={48} />,
                    color: 'bg-purple-500'
                };
            case 'done':
                return {
                    label: 'Selesai',
                    desc: 'Terima kasih telah berkunjung. Semoga lekas sembuh!',
                    icon: <Check size={48} />,
                    color: 'bg-green-500'
                };
            default:
                return {
                    label: 'Status Tidak Diketahui',
                    desc: 'Hubungi petugas untuk informasi lebih lanjut.',
                    icon: <Info size={48} />,
                    color: 'bg-slate-500'
                };
        }
    };

    const statusInfo = searchResult ? getStatusInfo(searchResult.status) : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center p-6 relative">
            <div className="fixed bottom-8 left-0 right-0 flex justify-center z-50">
                <button
                    onClick={() => navigate('/')}
                    className="group bg-white dark:bg-slate-800 text-red-500 hover:text-white hover:bg-red-500 px-6 py-3 rounded-full shadow-2xl border border-red-100 dark:border-slate-600 transition-all duration-300 font-bold flex items-center gap-3 transform hover:-translate-y-1"
                >
                    <span className="bg-red-100 group-hover:bg-white/20 text-red-500 group-hover:text-white rounded-full w-6 h-6 flex items-center justify-center text-xs transition">
                        <LogOut size={12} />
                    </span>
                    <span>Keluar / Kembali ke Login</span>
                </button>
            </div>

            <div className="w-full max-w-4xl mx-auto mt-8 mb-24">
                <div className="text-center mb-12">
                    <span className="px-3 py-1 bg-teal-50 dark:bg-teal-900/30 text-primary text-xs font-bold uppercase tracking-widest rounded-full mb-4 inline-block">Portal Pasien Publik</span>
                    <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">Cek Status Antrian Anda</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">Pantau progres pemeriksaan dan pengambilan obat secara realtime.</p>
                </div>

                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 flex items-center gap-2 mb-12 transform transition hover:scale-[1.01]">
                    <div className="pl-4 text-slate-400">
                        <Search size={24} />
                    </div>
                    <input
                        type="text"
                        placeholder="Ketik Nomor Antrian (Contoh: U-001) atau Nama Lengkap..."
                        className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-slate-800 dark:text-white placeholder-slate-300 dark:placeholder-slate-500 font-medium"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} size="lg" className="rounded-xl shadow-lg shadow-primary/30">
                        Cari Data
                    </Button>
                </div>

                {searchResult && statusInfo && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <User size={128} />
                                </div>
                                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider mb-1">Halo, Pasien</p>
                                <h1 className="text-4xl font-bold mb-2">{searchResult.name}</h1>
                                <div className="flex items-center gap-4 mt-4">
                                    <span className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg text-xl font-mono font-bold border border-white/10">
                                        {searchResult.id}
                                    </span>
                                    <span className={`${statusInfo.color} text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg flex items-center gap-2`}>
                                        {statusInfo.label}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 lg:p-12">
                                <div className="relative mb-12">
                                    <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 dark:bg-slate-700 rounded-full -z-10"></div>
                                    <div
                                        className="absolute top-5 left-0 h-1 bg-primary rounded-full -z-10 transition-all duration-1000"
                                        style={{ width: getProgressWidth(searchResult.status) }}
                                    ></div>
                                    <div className="flex justify-between relative">
                                        {['waiting', 'exam', 'payment', 'pharmacy', 'done'].map((step, idx) => {
                                            const isActive = ['waiting', 'exam', 'payment', 'pharmacy', 'done'].indexOf(searchResult.status) >= idx;

                                            return (
                                                <div key={step} className="flex flex-col items-center gap-2">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-300'
                                                        }`}>
                                                        {idx + 1}
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase transition-colors duration-300 ${isActive ? 'text-primary' : 'text-slate-300'
                                                        }`}>
                                                        {step}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-700/30 rounded-2xl p-8 border border-slate-100 dark:border-slate-700 text-center">
                                    <div className={`w-20 h-20 ${statusInfo.color} bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6 text-${statusInfo.color.replace('bg-', '')}`}>
                                        {statusInfo.icon}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                        {statusInfo.label}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                                        {statusInfo.desc}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

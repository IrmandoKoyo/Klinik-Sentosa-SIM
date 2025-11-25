import React from 'react';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Users, Clock, TrendingUp, Pill, ArrowUp, Database, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export const Dashboard: React.FC = () => {
    const { queue, transactions, seedData, resetQueue, currentUser } = useClinic();
    const [isSeeding, setIsSeeding] = React.useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        await seedData();
        setIsSeeding(false);
    };

    const handleResetQueue = async () => {
        if (confirm('Apakah Anda yakin ingin mereset antrian? Semua data antrian hari ini akan dihapus.')) {
            await resetQueue();
        }
    };

    const totalVisits = queue.length;
    const waitingCount = queue.filter(q => q.status === 'waiting').length;
    const pharmacyCount = queue.filter(q => q.status === 'pharmacy').length;
    const revenue = transactions.reduce((acc, curr) => acc + curr.total, 0);

    const stats = [
        {
            label: 'Total Kunjungan',
            value: totalVisits,
            icon: <Users size={24} />,
            color: 'text-primary',
            bg: 'bg-teal-50 dark:bg-teal-900/30',
            sub: 'Hari ini',
            subColor: 'text-green-500'
        },
        {
            label: 'Antrian Menunggu',
            value: waitingCount,
            icon: <Clock size={24} />,
            color: 'text-yellow-500',
            bg: 'bg-yellow-50 dark:bg-yellow-900/30',
            sub: 'Perlu Tindakan',
            subColor: 'text-yellow-600'
        },
        {
            label: 'Pendapatan Harian',
            value: formatCurrency(revenue),
            icon: <TrendingUp size={24} />,
            color: 'text-blue-500',
            bg: 'bg-blue-50 dark:bg-blue-900/30',
            sub: 'Gross Revenue',
            subColor: 'text-blue-600'
        },
        {
            label: 'Antrian Farmasi',
            value: pharmacyCount,
            icon: <Pill size={24} />,
            color: 'text-purple-500',
            bg: 'bg-purple-50 dark:bg-purple-900/30',
            sub: 'Siap Ambil',
            subColor: 'text-purple-600'
        },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard</h2>
                    <p className="text-slate-500 text-sm">Ringkasan operasional klinik</p>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2">
                        <Button onClick={handleResetQueue} variant="secondary" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={18} /> Reset Antrian
                        </Button>
                        <Button onClick={handleSeed} variant="outline" className="gap-2" isLoading={isSeeding}>
                            <Database size={18} /> Isi Database (Seed)
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="relative overflow-hidden group hover:-translate-y-1 transition duration-300">
                        <div className={`absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition transform group-hover:scale-110 ${stat.color}`}>
                            {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 64 })}
                        </div>
                        <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                            {stat.icon}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">{stat.value}</h3>
                        <div className={`mt-2 flex items-center text-xs font-bold ${stat.subColor} bg-opacity-20 w-fit px-2 py-1 rounded-full`}>
                            {stat.sub === 'Hari ini' && <ArrowUp size={12} className="mr-1" />} {stat.sub}
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Antrian Realtime</h3>
                        <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-bold animate-pulse">● Live</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400 border-b border-dashed border-slate-200 dark:border-slate-600">
                                    <th className="pb-3 pl-2 font-semibold">No. Antrian</th>
                                    <th className="pb-3 font-semibold">Nama Pasien</th>
                                    <th className="pb-3 font-semibold">Poli Tujuan</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 text-right pr-2 font-semibold">Waktu Daftar</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-slate-600 dark:text-slate-300">
                                {[...queue].reverse().slice(0, 5).map((p) => (
                                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-700 last:border-0">
                                        <td className="p-3 font-mono text-slate-500">{p.id}</td>
                                        <td className="font-bold dark:text-white">{p.name}</td>
                                        <td>{p.poli}</td>
                                        <td><span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">{p.status}</span></td>
                                        <td className="text-right text-xs">{p.time}</td>
                                    </tr>
                                ))}
                                {queue.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-4 text-slate-400">Belum ada antrian hari ini.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>

                <div className="bg-gradient-to-b from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary opacity-10 rounded-full blur-3xl"></div>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur rounded-lg flex items-center justify-center">
                                <Hospital size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Klinik Sentosa</h3>
                                <p className="text-slate-400 text-xs">Jl. Minahasa No. 123</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                <p className="text-xs text-slate-400 mb-1">Dokter Jaga Hari Ini</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <p className="font-bold text-sm">Dr. Budi Santoso</p>
                                </div>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl backdrop-blur-sm border border-white/5">
                                <p className="text-xs text-slate-400 mb-1">Apoteker Jaga</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <p className="font-bold text-sm">Andi Farma, S.Farm</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10 text-center">
                        <p className="text-xs text-slate-500">System Version 11.0 (React)</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

function Hospital({ size }: { size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 6V4" />
            <path d="M14 14h-4" />
            <path d="M14 18h-4" />
            <path d="M14 8h-4" />
            <path d="M18 12h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2" />
            <path d="M18 22V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v18" />
        </svg>
    )
}

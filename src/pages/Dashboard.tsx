import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Users, Clock, TrendingUp, Pill, Database, Trash2, Activity, AlertTriangle, FileText, Stethoscope } from 'lucide-react';
import { formatCurrency, getTodayDateString, formatDateString, normalizeDate } from '../utils/helpers';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
    const { queue, transactions, medications, seedData, resetQueue, currentUser } = useClinic();
    const navigate = useNavigate();
    const [isSeeding, setIsSeeding] = useState(false);
    const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

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

    // --- Real-time Stats Calculation ---
    const stats = useMemo(() => {
        const today = getTodayDateString(); // YYYY-MM-DD

        // Filter queue for today only to avoid double counting from stale data
        const todayQueue = queue.filter(q => normalizeDate(q.date) === today || !q.date); // Fallback for old data without date

        // 1. Visits Today (Only Paid Transactions)
        const visitsToday = transactions.filter(t => normalizeDate(t.date) === today && t.status === 'paid').length;

        // 2. Revenue Today
        const revenueToday = transactions
            .filter(t => normalizeDate(t.date) === today)
            .reduce((acc, curr) => acc + curr.total, 0);

        // 3. Waiting Patients (from today's queue)
        const waitingCount = todayQueue.filter(q => q.status === 'waiting').length;

        // 4. Low Stock Items (< 10)
        const lowStockCount = medications.filter(m => m.stock < 10).length;

        return { visitsToday, revenueToday, waitingCount, lowStockCount };
    }, [queue, transactions, medications]);

    // --- Chart Data Preparation (Real Data) ---
    const chartData = useMemo(() => {
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const today = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (6 - i));
            return {
                date: formatDateString(d),
                dayName: days[d.getDay()],
                fullDate: d
            };
        });

        const visits = last7Days.map(day => {
            // For today, use queue length as it includes all patients (waiting, processing, done)
            // For past days, use transactions as queue is likely cleared
            if (day.date === getTodayDateString()) {
                const queueCount = queue.filter(q => normalizeDate(q.date) === day.date).length;
                const trxCount = transactions.filter(t => normalizeDate(t.date) === day.date).length;
                return { name: day.dayName, visits: Math.max(queueCount, trxCount) };
            }

            // Count transactions for this day
            const count = transactions.filter(t => normalizeDate(t.date) === day.date).length;
            return { name: day.dayName, visits: count };
        });

        const revenue = last7Days.map(day => {
            // Sum revenue for this day
            const total = transactions
                .filter(t => normalizeDate(t.date) === day.date)
                .reduce((acc, curr) => acc + curr.total, 0);
            return { name: day.dayName, total: total };
        });

        return { visits, revenue };
    }, [transactions, queue]);

    const visitData = chartData.visits;
    const revenueData = chartData.revenue;

    const diagnosisData = useMemo(() => {
        const diagMap = new Map<string, number>();
        transactions.forEach(t => {
            if (t.diagnosis) {
                // Extract code or name (e.g., "A00.1 Cholera" -> "Cholera" or keep full)
                const diag = t.diagnosis.split(' ')[0] || 'Unknown';
                diagMap.set(diag, (diagMap.get(diag) || 0) + 1);
            }
        });

        const sorted = Array.from(diagMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5) // Top 5
            .map(([name, value]) => ({ name, value }));

        if (sorted.length === 0) return [{ name: 'Belum ada data', value: 1 }];
        return sorted;
    }, [transactions]);

    const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#64748b'];

    // --- Role-Based Widget Visibility ---
    const canViewRevenue = ['admin', 'kasir'].includes(currentUser?.role || '');
    const canViewStock = ['admin', 'apoteker', 'kasir'].includes(currentUser?.role || '');
    const canViewMedical = ['admin', 'dokter'].includes(currentUser?.role || '');

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Dashboard Operasional</h2>
                    <p className="text-slate-500 text-sm">
                        Selamat datang, <span className="font-bold text-primary">{currentUser?.name}</span> ({currentUser?.role})
                    </p>
                </div>
                {currentUser?.role === 'admin' && (
                    <div className="flex gap-2">
                        <Button onClick={handleResetQueue} variant="secondary" className="gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 size={16} /> Reset Harian
                        </Button>
                        <Button onClick={handleSeed} variant="outline" className="gap-2" isLoading={isSeeding}>
                            <Database size={16} /> Seed Data
                        </Button>
                    </div>
                )}
            </div>

            {/* 1. Summary Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium mb-1">Total Pasien Hari Ini</p>
                            <h3 className="text-3xl font-bold">{stats.visitsToday}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                            <Users size={24} className="text-white" />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-xs text-blue-100">
                        <Activity size={14} className="mr-1" /> Termasuk antrian & selesai
                    </div>
                </Card>

                <Card className="bg-white dark:bg-slate-800 border-l-4 border-yellow-500 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Antrian Menunggu</p>
                            <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.waitingCount}</h3>
                        </div>
                        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                            <Clock size={24} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>
                    <div className="mt-4 text-xs text-slate-400">
                        Pasien belum diperiksa
                    </div>
                </Card>

                {canViewRevenue && (
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-green-500 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Pendapatan Hari Ini</p>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.revenueToday)}</h3>
                            </div>
                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <TrendingUp size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-slate-400">
                            Gross revenue (Jasa + Obat)
                        </div>
                    </Card>
                )}

                {canViewStock && (
                    <Card className="bg-white dark:bg-slate-800 border-l-4 border-red-500 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Stok Obat Menipis</p>
                                <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{stats.lowStockCount}</h3>
                            </div>
                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                        <div className="mt-4 text-xs text-red-500 font-medium">
                            Perlu restock segera!
                        </div>
                    </Card>
                )}
            </div>

            {/* 2. Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visits Chart - Visible to All */}
                <Card className="lg:col-span-2 min-h-[350px]">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Activity size={20} className="text-primary" /> Tren Kunjungan Pasien (7 Hari)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    cursor={{ fill: '#f1f5f9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="visits" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Role Specific Chart */}
                {canViewRevenue ? (
                    <Card className="min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <TrendingUp size={20} className="text-green-500" /> Tren Pendapatan
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" hide />
                                    <Tooltip
                                        formatter={(value: number) => formatCurrency(value)}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                ) : canViewMedical ? (
                    <Card className="min-h-[350px]">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Stethoscope size={20} className="text-purple-500" /> Top 5 Diagnosa
                        </h3>
                        <div className="h-[250px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={diagnosisData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {diagnosisData.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            {diagnosisData.map((entry, index) => (
                                <div key={index} className="flex items-center text-xs text-slate-500">
                                    <div className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    {entry.name}
                                </div>
                            ))}
                        </div>
                    </Card>
                ) : (
                    <Card className="min-h-[350px] flex items-center justify-center text-slate-400">
                        <p>Tidak ada grafik tambahan untuk role ini.</p>
                    </Card>
                )}
            </div>

            {/* 3. Operational Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Queue List */}
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Clock size={18} className="text-slate-400" /> Antrian Saat Ini
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setIsQueueModalOpen(true)}>Lihat Semua</Button>
                    </div>
                    <div className="space-y-3">
                        {queue.slice(0, 5).map(q => (
                            <div key={q.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded text-xs">{q.id}</span>
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">{q.name}</p>
                                        <p className="text-xs text-slate-500">Poli {q.poli}</p>
                                    </div>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${q.status === 'waiting' ? 'bg-yellow-100 text-yellow-600' :
                                    q.status === 'exam' ? 'bg-blue-100 text-blue-600' :
                                        q.status === 'payment' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {q.status}
                                </span>
                            </div>
                        ))}
                        {queue.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Tidak ada antrian aktif.</p>}
                    </div>
                </Card>

                {/* Role Specific List */}
                {canViewStock ? (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" /> Peringatan Stok
                            </h3>
                            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate('/pharmacy')}>Ke Farmasi</Button>
                        </div>
                        <div className="space-y-3">
                            {medications.filter(m => m.stock < 10).slice(0, 5).map(m => (
                                <div key={m.id} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-100 dark:border-red-900/30">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-full text-red-500">
                                            <Pill size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{m.name}</p>
                                            <p className="text-xs text-slate-500">Sisa: <span className="font-bold text-red-600">{m.stock}</span></p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="outline" className="h-8 text-xs border-red-200 text-red-600 hover:bg-red-100">Restock</Button>
                                </div>
                            ))}
                            {medications.filter(m => m.stock < 10).length === 0 && (
                                <p className="text-center text-green-500 text-sm py-4 flex flex-col items-center">
                                    <Activity size={24} className="mb-2 opacity-50" />
                                    Stok obat aman.
                                </p>
                            )}
                        </div>
                    </Card>
                ) : (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <FileText size={18} className="text-slate-400" /> Transaksi Terakhir
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {transactions.slice(0, 5).map(t => (
                                <div key={t.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800 dark:text-white">{t.patientName}</p>
                                        <p className="text-xs text-slate-500">{t.date}</p>
                                    </div>
                                    <p className="font-bold text-sm text-green-600">{formatCurrency(t.total)}</p>
                                </div>
                            ))}
                            {transactions.length === 0 && <p className="text-center text-slate-400 text-sm py-4">Belum ada transaksi.</p>}
                        </div>
                    </Card>
                )}
            </div>

            {/* Latest Transactions Table (Admin/All) */}
            <Card>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FileText size={18} className="text-primary" />
                        Detail Transaksi Terakhir
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsTransactionModalOpen(true)}>Lihat Semua</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">ID Transaksi</th>
                                <th className="px-4 py-3">Pasien</th>
                                <th className="px-4 py-3">Dokter & Poli</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 rounded-r-lg">Tanggal & Waktu</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 5).map((t, idx) => (
                                <tr key={idx} className="border-b border-slate-100 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-white">{t.patientName}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 dark:text-slate-300">{t.doctorName || '-'}</span>
                                            <span className="text-xs text-slate-500">Poli {t.poli || '-'}</span>
                                            {t.handledByRoleMismatch && (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-red-100">
                                                    ⚠ Ditangani {t.actualDoctorRole}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(t.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {t.status === 'paid' ? 'Lunas' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{t.date}</span>
                                            <span className="text-[10px]">{t.time}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Belum ada transaksi hari ini
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
            {/* --- Modals --- */}

            {/* All Queue Modal */}
            <Modal isOpen={isQueueModalOpen} onClose={() => setIsQueueModalOpen(false)} title="Semua Antrian Hari Ini">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">No. Antrian</th>
                                <th className="px-4 py-3">Nama Pasien</th>
                                <th className="px-4 py-3">Poli</th>
                                <th className="px-4 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {queue.map(q => (
                                <tr key={q.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-mono font-bold text-primary">{q.id}</td>
                                    <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{q.name}</td>
                                    <td className="px-4 py-3">{q.poli}</td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${q.status === 'waiting' ? 'bg-yellow-100 text-yellow-600' :
                                            q.status === 'exam' ? 'bg-blue-100 text-blue-600' :
                                                q.status === 'payment' ? 'bg-green-100 text-green-600' :
                                                    q.status === 'pharmacy' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-slate-100 text-slate-500'
                                            }`}>
                                            {q.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {queue.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">Tidak ada antrian.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => setIsQueueModalOpen(false)}>Tutup</Button>
                </div>
            </Modal>

            {/* All Transactions Modal */}
            <Modal isOpen={isTransactionModalOpen} onClose={() => setIsTransactionModalOpen(false)} title="Semua Transaksi">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                            <tr>
                                <th className="px-4 py-3">ID</th>
                                <th className="px-4 py-3">Pasien</th>
                                <th className="px-4 py-3">Dokter & Poli</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Tanggal & Waktu</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                            {transactions.map((t, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                    <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-white">{t.patientName}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="text-slate-700 dark:text-slate-300">{t.doctorName || '-'}</span>
                                            <span className="text-xs text-slate-500">Poli {t.poli || '-'}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-bold text-primary">{formatCurrency(t.total)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.status === 'paid' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                            {t.status === 'paid' ? 'Lunas' : 'Pending'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold">{t.date}</span>
                                            <span className="text-[10px]">{t.time}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {transactions.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Belum ada transaksi.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Button onClick={() => setIsTransactionModalOpen(false)}>Tutup</Button>
                </div>
            </Modal>
        </div>
    );
};

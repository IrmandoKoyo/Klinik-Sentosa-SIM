import React, { useMemo, useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, DollarSign, Calendar, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { db, COLLECTIONS } from '../lib/firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export const Report: React.FC = () => {
    const { transactions } = useClinic();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter transactions for printing
    const filteredTransactions = useMemo(() => {
        if (!startDate || !endDate) return transactions;
        return transactions.filter(t => {
            // Assuming t.date is YYYY-MM-DD
            return t.date >= startDate && t.date <= endDate;
        });
    }, [transactions, startDate, endDate]);

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Laporan Transaksi</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                        th { background-color: #f2f2f2; }
                        .header { text-align: center; margin-bottom: 20px; }
                        .total { font-weight: bold; text-align: right; margin-top: 10px; }
                        @media print {
                            .no-print { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h2>KLINIK SENTOSA</h2>
                        <p>Laporan Transaksi</p>
                        <p>Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Pasien</th>
                                <th>Dokter</th>
                                <th>Poli</th>
                                <th>Diagnosa</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filteredTransactions.map(t => `
                                <tr>
                                    <td>${t.date}</td>
                                    <td>${t.patientName}</td>
                                    <td>${t.doctorName || '-'}</td>
                                    <td>${t.poli || '-'}</td>
                                    <td>${t.diagnosis || '-'}</td>
                                    <td>${formatCurrency(t.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total">
                        Total Pendapatan: ${formatCurrency(filteredTransactions.reduce((acc, t) => acc + t.total, 0))}
                    </div>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    // Aggregate Data for Charts
    const { revenueData, visitData, totalRevenue, totalVisits, avgDailyVisits } = useMemo(() => {
        // ... (existing aggregation logic) ...
        const revMap = new Map<string, number>();
        const visitMap = new Map<string, number>();
        let totalRev = 0;

        transactions.forEach(t => {
            const date = t.date || new Date().toISOString().split('T')[0];
            const currentRev = revMap.get(date) || 0;
            revMap.set(date, currentRev + t.total);
            totalRev += t.total;

            const currentVisits = visitMap.get(date) || 0;
            visitMap.set(date, currentVisits + 1);
        });

        const sortedDates = Array.from(new Set([...revMap.keys(), ...visitMap.keys()])).sort();

        const rData = sortedDates.map(date => ({
            name: date,
            total: revMap.get(date) || 0
        }));

        const vData = sortedDates.map(date => ({
            name: date,
            visits: visitMap.get(date) || 0
        }));

        const tVisits = transactions.length;
        const uniqueDays = sortedDates.length || 1;
        const avgVisits = Math.round(tVisits / uniqueDays);

        return {
            revenueData: rData,
            visitData: vData,
            totalRevenue: totalRev,
            totalVisits: tVisits,
            avgDailyVisits: avgVisits
        };
    }, [transactions]);

    const handleCleanDuplicates = async () => {
        if (!confirm('Apakah Anda yakin ingin membersihkan data duplikat?')) return;

        const uniqueKeys = new Set();
        const duplicates: any[] = [];

        // Sort transactions so 'paid' comes first, so we keep that one
        const sortedTrans = [...transactions].sort((a, b) => {
            if (a.status === 'paid' && b.status !== 'paid') return -1;
            if (a.status !== 'paid' && b.status === 'paid') return 1;
            return 0;
        });

        sortedTrans.forEach(t => {
            const key = `${t.date}-${t.patientName}-${t.total}`;
            if (uniqueKeys.has(key)) {
                duplicates.push(t);
            } else {
                uniqueKeys.add(key);
            }
        });

        if (duplicates.length === 0) {
            alert('Tidak ditemukan data duplikat.');
            return;
        }

        try {
            for (const dup of duplicates) {
                if ((dup as any).firestoreId) {
                    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, (dup as any).firestoreId));
                }
            }
            alert(`Berhasil menghapus ${duplicates.length} data duplikat.`);
        } catch (error) {
            console.error("Error cleaning duplicates:", error);
            alert("Gagal membersihkan data.");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Laporan & Statistik</h2>
                    <p className="text-slate-500 text-sm">Analisis kinerja klinik</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                    />
                    <Button onClick={handlePrint} size="sm" className="gap-2">
                        <Printer size={16} /> Cetak
                    </Button>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCleanDuplicates}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                >
                    Bersihkan Data Duplikat
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">Total Pendapatan</p>
                            <h3 className="text-3xl font-bold mt-1">{formatCurrency(totalRevenue)}</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">Total Kunjungan</p>
                            <h3 className="text-3xl font-bold mt-1">{totalVisits} Pasien</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Users size={24} />
                        </div>
                    </div>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-emerald-100 text-sm font-medium">Rata-rata Harian</p>
                            <h3 className="text-3xl font-bold mt-1">{avgDailyVisits} Pasien/Hari</h3>
                        </div>
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Calendar size={24} />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-500" /> Tren Pendapatan
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `Rp${value / 1000}k`} />
                                <Tooltip
                                    formatter={(value: number) => formatCurrency(value)}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card>
                    <h3 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <Users size={18} className="text-purple-500" /> Tren Kunjungan
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={visitData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                                <YAxis stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="visits" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
};

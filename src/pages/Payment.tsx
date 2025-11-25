import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { CreditCard, Check, Printer } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';

export const Payment: React.FC = () => {
    const { queue, updateQueueItem, addTransaction } = useClinic();
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const paymentQueue = queue.filter(q => q.status === 'payment');

    const handleOpenInvoice = (patient: any) => {
        setSelectedInvoice(patient);
    };

    const handleProcessPayment = () => {
        if (!selectedInvoice) return;

        addTransaction({
            id: `TRX-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            patientName: selectedInvoice.name,
            total: selectedInvoice.bill,
            status: 'paid',
            items: selectedInvoice.prescription.map((item: any) => ({
                name: item.name,
                qty: item.qty,
                price: item.price
            })),
            diagnosis: selectedInvoice.diagnosis,
            anamnesa: selectedInvoice.anamnesa,
            notes: selectedInvoice.notes,
            vitalSigns: selectedInvoice.vitalSigns,
            doctorName: selectedInvoice.doctorName,
            time: selectedInvoice.examTime,
            poli: selectedInvoice.poli
        });

        updateQueueItem(selectedInvoice.id, { status: 'pharmacy' });
        alert('Pembayaran berhasil dikonfirmasi!');
        setSelectedInvoice(null);
    };

    const handlePrintInvoice = () => {
        if (!selectedInvoice) return;
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Invoice - ${selectedInvoice.id}</title>
                    <style>
                        body { font-family: sans-serif; padding: 20px; }
                        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
                        .header h1 { margin: 0; color: #0f766e; }
                        .info { margin-bottom: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        th, td { border-bottom: 1px solid #eee; padding: 10px; text-align: left; }
                        .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
                        .footer { margin-top: 40px; text-align: center; font-size: 0.8em; color: #666; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>KLINIK SENTOSA</h1>
                        <p>Jl. Minahasa No. 123, Manado</p>
                        <p>Telp: (0431) 888-999</p>
                    </div>
                    <div class="info">
                        <p><strong>No. Invoice:</strong> INV-${selectedInvoice.id}</p>
                        <p><strong>Tanggal:</strong> ${new Date().toLocaleDateString()}</p>
                        <p><strong>Pasien:</strong> ${selectedInvoice.name}</p>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Deskripsi</th>
                                <th>Qty</th>
                                <th>Harga</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedInvoice.prescription.map((item: any) => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.qty}</td>
                                    <td>Rp ${item.price.toLocaleString('id-ID')}</td>
                                    <td>Rp ${(item.price * item.qty).toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                            <tr>
                                <td>Jasa Dokter & Admin</td>
                                <td>1</td>
                                <td>Rp 50.000</td>
                                <td>Rp 50.000</td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="total">
                        Total Bayar: Rp ${selectedInvoice.bill.toLocaleString('id-ID')}
                    </div>
                    <div class="footer">
                        <p>Terima kasih atas kunjungan Anda.</p>
                        <p>Semoga lekas sembuh.</p>
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

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Kasir & Pembayaran</h2>
                    <p className="text-slate-500 text-sm">Kelola tagihan pasien</p>
                </div>
            </div>

            <Card className="overflow-hidden p-0">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="p-4 font-semibold text-slate-500 text-sm">ID Tagihan</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Nama Pasien</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm">Poli</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm text-right">Total Tagihan</th>
                            <th className="p-4 font-semibold text-slate-500 text-sm text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {paymentQueue.map(p => (
                            <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                <td className="p-4 font-mono text-sm font-bold text-slate-600 dark:text-slate-400">INV-{p.id}</td>
                                <td className="p-4 font-bold text-slate-800 dark:text-white">{p.name}</td>
                                <td className="p-4 text-sm text-slate-500">{p.poli}</td>
                                <td className="p-4 text-right font-bold text-primary">{formatCurrency(p.bill)}</td>
                                <td className="p-4 text-center">
                                    <Button size="sm" onClick={() => handleOpenInvoice(p)}>
                                        Bayar
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {paymentQueue.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-slate-400">Tidak ada tagihan menunggu pembayaran.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Invoice Modal */}
            <Modal isOpen={!!selectedInvoice} onClose={() => setSelectedInvoice(null)} title="Konfirmasi Pembayaran">
                {selectedInvoice && (
                    <div className="space-y-6">
                        <div className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-xl border border-slate-100 dark:border-slate-600">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">No. Invoice</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-white">INV-{selectedInvoice.id}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Tanggal</span>
                                <span className="font-medium text-slate-700 dark:text-white">{formatDate(new Date())}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Pasien</span>
                                <span className="font-bold text-slate-700 dark:text-white">{selectedInvoice.name}</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-sm text-slate-500 uppercase mb-3">Rincian Biaya</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600 dark:text-slate-300">Jasa Dokter & Klinik</span>
                                    <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(50000)}</span>
                                </div>
                                {selectedInvoice.prescription.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-slate-600 dark:text-slate-300">{item.name} (x{item.qty})</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{formatCurrency(item.price * item.qty)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-dashed border-slate-200 dark:border-slate-600 my-2 pt-2 flex justify-between font-bold text-lg">
                                    <span className="text-slate-800 dark:text-white">Total</span>
                                    <span className="text-primary">{formatCurrency(selectedInvoice.bill)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                            <Button variant="secondary" className="flex-1" onClick={() => setSelectedInvoice(null)}>Batal</Button>
                            <Button className="flex-1 gap-2" onClick={handleProcessPayment}>
                                <Check size={18} /> Konfirmasi Pembayaran
                            </Button>
                            <Button variant="outline" onClick={handlePrintInvoice}>
                                <Printer size={18} />
                            </Button>
                        </div>

                    </div>
                )}
            </Modal>
        </div>
    );
};

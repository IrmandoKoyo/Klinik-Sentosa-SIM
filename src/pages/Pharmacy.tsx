import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Pill, Search, Plus, Edit2, Trash2, Save, Clock, Printer } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import type { Medication } from '../types';

export const Pharmacy: React.FC = () => {
    const { queue, medications, updateQueueItem, updateMedicationStock, addMedication, updateMedication, deleteMedication } = useClinic();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [formData, setFormData] = useState({ name: '', stock: 0, price: 0 });

    const pharmacyQueue = queue.filter(q => q.status === 'pharmacy');

    const handleProcessPrescription = (id: string, prescription: any[]) => {
        // Check stock availability first
        for (const item of prescription) {
            const med = medications.find(m => m.name === item.name);
            if (!med) {
                alert(`Obat ${item.name} tidak ditemukan di inventaris!`);
                return;
            }
            if (med.stock < item.qty) {
                alert(`Stok obat ${item.name} tidak mencukupi! (Sisa: ${med.stock}, Butuh: ${item.qty})`);
                return;
            }
        }

        // Reduce stock
        prescription.forEach(item => {
            updateMedicationStock(item.name, -item.qty);
        });

        // Update status to done
        updateQueueItem(id, { status: 'done' });
        alert('Obat telah diserahkan. Transaksi selesai.');
    };

    const handlePrintLabel = (patientName: string, drugName: string, qty: number) => {
        const printWindow = window.open('', '_blank', 'width=400,height=300');
        if (printWindow) {
            printWindow.document.write(`
                <html>
                <head>
                    <title>Etiket - ${drugName}</title>
                    <style>
                        body { font-family: sans-serif; padding: 10px; border: 2px solid #000; width: 300px; margin: 0 auto; text-align: center; }
                        h2 { margin: 5px 0; font-size: 16px; }
                        p { margin: 5px 0; font-size: 14px; }
                        .drug { font-weight: bold; font-size: 18px; margin: 10px 0; }
                    </style>
                </head>
                <body>
                    <h2>KLINIK SENTOSA</h2>
                    <p>${new Date().toLocaleDateString()}</p>
                    <p>Pasien: <strong>${patientName}</strong></p>
                    <div class="drug">${drugName}</div>
                    <p>Jumlah: ${qty}</p>
                    <p>3 x 1 Sehari</p>
                    <p>Sesudah Makan</p>
                    <script>
                        window.onload = function() { window.print(); }
                    </script>
                </body>
                </html>
            `);
            printWindow.document.close();
        }
    };

    const handleOpenAdd = () => {
        setEditingMed(null);
        setFormData({ name: '', stock: 0, price: 0 });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (med: Medication) => {
        setEditingMed(med);
        setFormData({ name: med.name, stock: med.stock, price: med.price });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus obat ini?')) {
            await deleteMedication(id);
        }
    };

    const handleSubmit = async () => {
        if (!formData.name || formData.stock < 0 || formData.price < 0) {
            alert('Mohon isi data dengan benar');
            return;
        }

        if (editingMed && editingMed.id) {
            await updateMedication(editingMed.id, formData);
        } else {
            await addMedication({
                name: formData.name,
                stock: formData.stock,
                price: formData.price
            });
        }
        setIsModalOpen(false);
    };

    const filteredMeds = medications.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500 flex items-center justify-center">
                    <Pill size={20} />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Farmasi & Stok Obat</h2>
                    <p className="text-slate-500 text-sm">Kelola antrian resep dan inventaris</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Queue */}
                <Card className="lg:col-span-1 h-fit">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <Clock size={18} className="text-purple-500" /> Antrian Resep
                    </h3>
                    <div className="space-y-3">
                        {pharmacyQueue.map(p => (
                            <div key={p.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded text-xs">{p.id}</span>
                                    <span className="text-[10px] text-slate-400">{p.time}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-white">{p.name}</h4>
                                <div className="mt-3 space-y-1">
                                    {p.prescription?.map((item, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-lg border border-slate-100 dark:border-slate-600">
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
                                                <p className="text-xs text-slate-500">{item.qty} unit</p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handlePrintLabel(p.name, item.name, item.qty)}>
                                                <Printer size={14} /> Etiket
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                                <Button
                                    className="w-full mt-4"
                                    size="sm"
                                    onClick={() => handleProcessPrescription(p.id, p.prescription)}
                                >
                                    Serahkan Obat
                                </Button>
                            </div>
                        ))}
                        {pharmacyQueue.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-8">Tidak ada antrian resep.</p>
                        )}
                    </div>
                </Card>

                {/* Right: Inventory */}
                <Card className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-slate-800 dark:text-white">Stok Obat</h3>
                        <Button size="sm" onClick={handleOpenAdd} className="gap-2">
                            <Plus size={16} /> Tambah Obat
                        </Button>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama obat..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 outline-none transition"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700">
                                <tr>
                                    <th className="p-3 font-semibold text-slate-500 text-sm">Nama Obat</th>
                                    <th className="p-3 font-semibold text-slate-500 text-sm">Stok</th>
                                    <th className="p-3 font-semibold text-slate-500 text-sm">Harga</th>
                                    <th className="p-3 font-semibold text-slate-500 text-sm text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filteredMeds.map((m, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="p-3 font-medium text-slate-800 dark:text-white">{m.name}</td>
                                        <td className="p-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${m.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                                {m.stock}
                                            </span>
                                        </td>
                                        <td className="p-3 text-slate-600 dark:text-slate-400">{formatCurrency(m.price)}</td>
                                        <td className="p-3 flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(m)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => m.id && handleDelete(m.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                disabled={!m.id}
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingMed ? "Edit Obat" : "Tambah Obat Baru"}
            >
                <div className="space-y-4">
                    <Input
                        label="Nama Obat"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Contoh: Paracetamol 500mg"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Stok Awal"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                        />
                        <Input
                            label="Harga Satuan (Rp)"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) })}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmit} className="gap-2">
                            <Save size={18} /> Simpan Data
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

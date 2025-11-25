import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Pill, Search, Plus, Edit2, Trash2, Save, Clock, Printer, FileText, Check } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import type { Medication, Invoice } from '../types';

export const Pharmacy: React.FC = () => {
    const { queue, medications, updateQueueItem, updateMedicationStock, addMedication, updateMedication, deleteMedication, currentUser, invoices, addInvoice, processInvoice } = useClinic();
    const [searchTerm, setSearchTerm] = useState('');

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMed, setEditingMed] = useState<Medication | null>(null);
    const [formData, setFormData] = useState({ name: '', stock: 0, price: 0 });

    // Invoice Modal State
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [invoiceImage, setInvoiceImage] = useState('');

    // Process Invoice State (Admin)
    const [processingInvoice, setProcessingInvoice] = useState<Invoice | null>(null);
    const [invoiceItems, setInvoiceItems] = useState<{ name: string; qty: number; price: number }[]>([{ name: '', qty: 0, price: 0 }]);

    const pharmacyQueue = queue.filter(q => q.status === 'pharmacy');
    const pendingInvoices = invoices?.filter(i => i.status === 'pending') || [];

    const handleProcessPrescription = (id: string, prescription: any[]) => {
        // ... (existing logic) ...
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

    const handlePrintLabel = (patientName: string, drugName: string, qty: number, dosage?: string) => {
        // ... (existing logic) ...
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
                        .dosage { font-weight: bold; font-size: 16px; margin: 10px 0; border: 1px solid #000; padding: 5px; display: inline-block; }
                    </style>
                </head>
                <body>
                    <h2>KLINIK SENTOSA</h2>
                    <p>${new Date().toLocaleDateString()}</p>
                    <p>Pasien: <strong>${patientName}</strong></p>
                    <div class="drug">${drugName}</div>
                    <p>Jumlah: ${qty}</p>
                    <div class="dosage">${dosage || '3 x 1 Sesudah Makan'}</div>
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
        // ... (existing logic for Admin manual add/edit) ...
        if (!formData.name || formData.stock < 0 || formData.price < 0) {
            alert('Mohon isi data dengan benar');
            return;
        }

        // Check for duplicates
        const normalizedName = formData.name.trim().toLowerCase();
        const duplicate = medications.find(m =>
            m.name.toLowerCase() === normalizedName &&
            (!editingMed || m.id !== editingMed.id)
        );

        if (duplicate) {
            alert(`Obat dengan nama "${formData.name}" sudah terdaftar!`);
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

    // --- Invoice Workflow ---
    const handleSubmitInvoice = async () => {
        if (!invoiceImage) {
            alert('Mohon upload foto faktur (simulasi).');
            return;
        }
        await addInvoice({
            id: `INV-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            imageUrl: invoiceImage,
            status: 'pending',
            submittedBy: currentUser?.name || 'Apoteker'
        });
        setIsInvoiceModalOpen(false);
        setInvoiceImage('');
        alert('Faktur berhasil diupload dan menunggu review Admin.');
    };

    const handleProcessInvoice = async () => {
        if (!processingInvoice) return;
        if (invoiceItems.some(i => !i.name || i.qty <= 0 || i.price <= 0)) {
            alert('Mohon lengkapi semua item dengan benar.');
            return;
        }

        if ((processingInvoice as any).firestoreId) {
            await processInvoice((processingInvoice as any).firestoreId, invoiceItems);
            setProcessingInvoice(null);
            setInvoiceItems([{ name: '', qty: 0, price: 0 }]);
            alert('Faktur berhasil diproses. Stok telah diperbarui.');
        }
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
                                                <p className="text-xs text-slate-500">{item.qty} unit <span className="text-purple-600 font-bold ml-1">({item.dosage || '3x1'})</span></p>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => handlePrintLabel(p.name, item.name, item.qty, item.dosage)}>
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

                {/* Right: Inventory & Invoices */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Admin Invoice Review Section */}
                    {currentUser?.role === 'admin' && pendingInvoices.length > 0 && (
                        <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
                            <h3 className="font-bold text-yellow-800 dark:text-yellow-500 mb-4 flex items-center gap-2">
                                <FileText size={18} /> Review Faktur Masuk ({pendingInvoices.length})
                            </h3>
                            <div className="space-y-3">
                                {pendingInvoices.map(inv => (
                                    <div key={inv.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-yellow-100 dark:border-yellow-900/30">
                                        <div>
                                            <p className="font-bold text-sm">Faktur #{inv.id}</p>
                                            <p className="text-xs text-slate-500">Oleh: {inv.submittedBy} | {inv.date}</p>
                                        </div>
                                        <Button size="sm" onClick={() => setProcessingInvoice(inv)}>
                                            Proses Stok
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    <Card>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 dark:text-white">Stok Obat</h3>
                            <div className="flex gap-2">
                                {currentUser?.role === 'admin' ? (
                                    <Button size="sm" onClick={handleOpenAdd} className="gap-2">
                                        <Plus size={16} /> Tambah Manual
                                    </Button>
                                ) : (
                                    <Button size="sm" onClick={() => setIsInvoiceModalOpen(true)} className="gap-2 bg-purple-600 hover:bg-purple-700">
                                        <FileText size={16} /> Input Faktur
                                    </Button>
                                )}
                            </div>
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
                                        {currentUser?.role === 'admin' && <th className="p-3 font-semibold text-slate-500 text-sm text-center">Aksi</th>}
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
                                            {currentUser?.role === 'admin' && (
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
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Add/Edit Modal (Admin Only) */}
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

            {/* Input Invoice Modal (Pharmacist) */}
            <Modal
                isOpen={isInvoiceModalOpen}
                onClose={() => setIsInvoiceModalOpen(false)}
                title="Input Faktur Obat Masuk"
            >
                <div className="space-y-4">
                    <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl text-center hover:bg-slate-50 transition cursor-pointer" onClick={() => setInvoiceImage('https://via.placeholder.com/400x600?text=Faktur+Obat')}>
                        {invoiceImage ? (
                            <img src={invoiceImage} alt="Preview" className="max-h-48 mx-auto rounded shadow" />
                        ) : (
                            <div className="text-slate-500">
                                <FileText size={32} className="mx-auto mb-2 opacity-50" />
                                <p>Klik untuk upload foto faktur</p>
                                <p className="text-xs">(Simulasi: Klik untuk generate gambar)</p>
                            </div>
                        )}
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>Batal</Button>
                        <Button onClick={handleSubmitInvoice} className="gap-2" disabled={!invoiceImage}>
                            <Save size={18} /> Kirim ke Admin
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Process Invoice Modal (Admin) */}
            <Modal
                isOpen={!!processingInvoice}
                onClose={() => setProcessingInvoice(null)}
                title="Proses Faktur Masuk"
            >
                <div className="space-y-6">
                    <div className="bg-slate-100 p-4 rounded-lg text-center">
                        <img src={processingInvoice?.imageUrl} alt="Faktur" className="max-h-40 mx-auto rounded" />
                        <p className="text-xs text-slate-500 mt-2">Faktur #{processingInvoice?.id}</p>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-bold text-sm">Input Item Obat</h4>
                        {invoiceItems.map((item, idx) => (
                            <div key={idx} className="flex gap-2 items-end">
                                <div className="flex-1">
                                    <Input
                                        label={idx === 0 ? "Nama Obat" : ""}
                                        value={item.name}
                                        onChange={(e) => {
                                            const newItems = [...invoiceItems];
                                            newItems[idx].name = e.target.value;
                                            setInvoiceItems(newItems);
                                        }}
                                        placeholder="Nama Obat"
                                    />
                                </div>
                                <div className="w-20">
                                    <Input
                                        label={idx === 0 ? "Qty" : ""}
                                        type="number"
                                        value={item.qty}
                                        onChange={(e) => {
                                            const newItems = [...invoiceItems];
                                            newItems[idx].qty = parseInt(e.target.value);
                                            setInvoiceItems(newItems);
                                        }}
                                    />
                                </div>
                                <div className="w-28">
                                    <Input
                                        label={idx === 0 ? "Harga" : ""}
                                        type="number"
                                        value={item.price}
                                        onChange={(e) => {
                                            const newItems = [...invoiceItems];
                                            newItems[idx].price = parseInt(e.target.value);
                                            setInvoiceItems(newItems);
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const newItems = invoiceItems.filter((_, i) => i !== idx);
                                        setInvoiceItems(newItems);
                                    }}
                                    className="mb-2.5 text-red-500 hover:bg-red-50 p-1 rounded"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setInvoiceItems([...invoiceItems, { name: '', qty: 0, price: 0 }])}
                            className="w-full"
                        >
                            <Plus size={14} /> Tambah Item Lain
                        </Button>
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button variant="secondary" onClick={() => setProcessingInvoice(null)}>Batal</Button>
                        <Button onClick={handleProcessInvoice} className="gap-2">
                            <Check size={18} /> Posting Stok
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

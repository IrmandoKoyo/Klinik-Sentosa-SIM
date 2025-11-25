import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Search, UserPlus, Printer } from 'lucide-react';
import { calculateAge, formatDate } from '../utils/helpers';
import QRCode from 'qrcode';

export const Registration: React.FC = () => {
    const { oldPatients, quotas, queue, addQueueItem, addPatient } = useClinic();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof oldPatients>([]);
    const [showResults, setShowResults] = useState(false);

    const [formData, setFormData] = useState({
        nik: '',
        name: '',
        dob: '',
        insurance: 'Umum' as 'Umum' | 'BPJS',
        bpjsNumber: '',
        poli: 'Umum' as 'Umum' | 'Gigi' | 'KIA'
    });

    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    // Smart Search
    useEffect(() => {
        if (searchQuery.length > 2) {
            const results = oldPatients.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.nik.includes(searchQuery)
            );
            setSearchResults(results);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    }, [searchQuery, oldPatients]);

    const handleSelectPatient = (patient: typeof oldPatients[0]) => {
        setFormData({
            ...formData,
            nik: patient.nik,
            name: patient.name,
            dob: patient.dob,
            insurance: patient.insurance,
            bpjsNumber: patient.bpjs || ''
        });
        setSearchQuery('');
        setShowResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.nik || !formData.name || !formData.dob) {
            alert('Mohon lengkapi data!');
            return;
        }

        // Quota Check
        const currentQueueCount = queue.filter(q => q.poli === formData.poli).length;
        if (currentQueueCount >= quotas[formData.poli]) {
            alert('Kuota poli penuh!');
            return;
        }

        // Generate ID
        const poliCode = formData.poli === 'Umum' ? 'U' : formData.poli === 'Gigi' ? 'G' : 'K';
        const queueNumber = String(currentQueueCount + 1).padStart(3, '0');
        const id = `${poliCode}-${queueNumber}`;

        // Priority Check
        const age = calculateAge(formData.dob);
        let priority = '';
        if (age >= 60) priority = 'LANSIA';
        if (age <= 5) priority = 'BALITA';

        const newQueueItem = {
            id,
            name: formData.name,
            nik: formData.nik,
            poli: formData.poli,
            status: 'waiting' as const,
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            prescription: [],
            bill: 0,
            priority // Add priority to QueueItem type if needed, or just handle it in UI
        };

        addQueueItem(newQueueItem);

        // Check if patient exists, if not add to database
        const existingPatient = oldPatients.find(p => p.nik === formData.nik);
        if (!existingPatient) {
            await addPatient({
                nik: formData.nik,
                name: formData.name,
                dob: formData.dob,
                insurance: formData.insurance,
                bpjs: formData.bpjsNumber
            });
        }

        // Generate QR
        try {
            const qrUrl = await QRCode.toDataURL(id);
            setQrCodeUrl(qrUrl);
        } catch (err) {
            console.error(err);
        }

        setCurrentTicket({ ...newQueueItem, priority });
        setTicketModalOpen(true);

        // Reset Form
        setFormData({
            nik: '',
            name: '',
            dob: '',
            insurance: 'Umum',
            bpjsNumber: '',
            poli: 'Umum'
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column: Form */}
                <div className="flex-1 space-y-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
                            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-900/30 text-primary flex items-center justify-center">
                                <UserPlus size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white">Pendaftaran Pasien</h3>
                                <p className="text-xs text-slate-500">Input data pasien baru atau lama</p>
                            </div>
                        </div>

                        {/* Smart Search */}
                        <div className="relative mb-6 z-20">
                            <Input
                                icon={<Search size={18} />}
                                placeholder="Cari Pasien Lama (NIK / Nama)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                            />
                            {showResults && (
                                <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 shadow-xl rounded-xl mt-2 border border-slate-100 dark:border-slate-700 overflow-hidden max-h-60 overflow-y-auto">
                                    {searchResults.map((p, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectPatient(p)}
                                            className="p-3 hover:bg-teal-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-50 dark:border-slate-700 last:border-0"
                                        >
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{p.name}</p>
                                            <p className="text-xs text-slate-500">NIK: {p.nik} | {p.dob}</p>
                                        </div>
                                    ))}
                                    {searchResults.length === 0 && (
                                        <div className="p-4 text-center text-sm text-slate-400">Data tidak ditemukan</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="NIK"
                                    placeholder="16 digit NIK"
                                    value={formData.nik}
                                    onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Nama Lengkap"
                                    placeholder="Nama sesuai KTP"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Tanggal Lahir"
                                    type="date"
                                    value={formData.dob}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 ml-1">Penjamin</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 outline-none focus:ring-2 focus:ring-primary transition dark:text-white"
                                        value={formData.insurance}
                                        onChange={(e) => setFormData({ ...formData, insurance: e.target.value as any })}
                                    >
                                        <option value="Umum">Umum / Pribadi</option>
                                        <option value="BPJS">BPJS Kesehatan</option>
                                    </select>
                                </div>
                            </div>

                            {formData.insurance === 'BPJS' && (
                                <Input
                                    label="Nomor BPJS"
                                    placeholder="13 digit No. BPJS"
                                    value={formData.bpjsNumber}
                                    onChange={(e) => setFormData({ ...formData, bpjsNumber: e.target.value })}
                                    className="animate-in slide-in-from-top-2"
                                />
                            )}

                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 ml-1">Poli Tujuan</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['Umum', 'Gigi', 'KIA'].map((p) => {
                                        const count = queue.filter(q => q.poli === p).length;
                                        const max = quotas[p];
                                        const isFull = count >= max;

                                        return (
                                            <div
                                                key={p}
                                                onClick={() => !isFull && setFormData({ ...formData, poli: p as any })}
                                                className={`
                          cursor-pointer rounded-xl p-3 border-2 transition-all relative overflow-hidden
                          ${formData.poli === p
                                                        ? 'border-primary bg-teal-50 dark:bg-teal-900/20'
                                                        : 'border-transparent bg-gray-50 dark:bg-slate-700 hover:bg-gray-100'
                                                    }
                          ${isFull ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                        `}
                                            >
                                                <p className={`font-bold text-sm ${formData.poli === p ? 'text-primary' : 'text-slate-600 dark:text-slate-300'}`}>Poli {p}</p>
                                                <p className="text-xs text-slate-400 mt-1">{count} / {max}</p>
                                                {isFull && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">PENUH</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-4 gap-2" size="lg">
                                <Printer size={18} /> Simpan & Cetak Tiket
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Column: Live Preview */}
                <div className="w-full lg:w-80">
                    <Card className="sticky top-24 bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none">
                        <div className="text-center mb-6">
                            <h3 className="font-bold text-lg">Live Kuota</h3>
                            <p className="text-xs text-slate-400">Update Realtime</p>
                        </div>

                        <div className="space-y-4">
                            {Object.entries(quotas).map(([poli, max]) => {
                                const count = queue.filter(q => q.poli === poli).length;
                                const percent = (count / max) * 100;

                                return (
                                    <div key={poli} className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="font-bold text-sm">Poli {poli}</span>
                                            <span className="text-xs font-mono opacity-70">{count}/{max}</span>
                                        </div>
                                        <div className="w-full bg-black/20 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ${percent > 90 ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Ticket Modal */}
            <Modal isOpen={ticketModalOpen} onClose={() => setTicketModalOpen(false)}>
                {currentTicket && (
                    <div className="text-center">
                        <div className="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-sm mx-auto max-w-[300px] relative overflow-hidden">
                            {/* Decorative circles */}
                            <div className="absolute -left-3 top-1/2 w-6 h-6 bg-slate-800 rounded-full"></div>
                            <div className="absolute -right-3 top-1/2 w-6 h-6 bg-slate-800 rounded-full"></div>

                            <h3 className="font-bold text-slate-800 text-lg mb-1">KLINIK SENTOSA</h3>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Nomor Antrian</p>

                            <div className="text-5xl font-black text-slate-800 mb-2 tracking-tighter">
                                {currentTicket.id}
                            </div>

                            <div className="bg-slate-100 rounded-lg p-2 mb-4">
                                <p className="font-bold text-slate-700 text-sm">Poli {currentTicket.poli}</p>
                                <p className="text-xs text-slate-500">{currentTicket.name}</p>
                            </div>

                            {currentTicket.priority && (
                                <div className="mb-4">
                                    <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold border border-red-200">
                                        PRIORITAS: {currentTicket.priority}
                                    </span>
                                </div>
                            )}

                            <div className="flex justify-center mb-4">
                                <img src={qrCodeUrl} alt="QR Code" className="w-24 h-24" />
                            </div>

                            <p className="text-[10px] text-slate-400">
                                {formatDate(new Date())} • {currentTicket.time}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1">
                                Mohon menunggu panggilan
                            </p>
                        </div>

                        <div className="mt-6 flex gap-3 justify-center">
                            <Button variant="secondary" onClick={() => setTicketModalOpen(false)}>Tutup</Button>
                            <Button onClick={() => window.print()}>Cetak</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

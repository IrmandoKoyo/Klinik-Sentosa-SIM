import React, { useState, useEffect } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Search, UserPlus, Printer, ScanLine, User, Clock, MessageCircle, Stethoscope } from 'lucide-react';
import QRCode from 'qrcode';

const calculateAge = (dobString: string): number => {
    const dob = new Date(dobString);
    const ageDiffMs = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiffMs);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
};



export const Registration: React.FC = () => {
    const { oldPatients, quotas, queue, addQueueItem, addPatient, doctorStatuses } = useClinic();

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<typeof oldPatients>([]);
    const [showResults, setShowResults] = useState(false);

    const [formData, setFormData] = useState({
        nik: '',
        name: '',
        dob: '',
        phoneNumber: '',
        insurance: 'Umum' as 'Umum' | 'BPJS',
        bpjsNumber: '',
        poli: '' as any, // Force manual selection
        isEmergency: false,
        isReferral: false
    });

    const [ticketModalOpen, setTicketModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState<any>(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');

    const [sendWhatsApp, setSendWhatsApp] = useState(true);

    const [confirmPoli, setConfirmPoli] = useState<{ poli: 'Umum' | 'Gigi' | 'KIA', message: string } | null>(null);

    const handlePoliClick = (poli: 'Umum' | 'Gigi' | 'KIA', doctorStatus: string) => {
        if (doctorStatus === 'Offline') {
            setConfirmPoli({
                poli,
                message: `Dokter Poli ${poli} sedang OFFLINE. Apakah Anda yakin ingin mendaftarkan pasien ke poli ini?`
            });
        } else if (doctorStatus === 'Istirahat') {
            setConfirmPoli({
                poli,
                message: `Dokter Poli ${poli} sedang ISTIRAHAT. Pasien mungkin harus menunggu lebih lama. Apakah Anda yakin?`
            });
        } else {
            setFormData({ ...formData, poli });
        }
    };

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
            phoneNumber: patient.phoneNumber || '',
            insurance: patient.insurance,
            bpjsNumber: patient.bpjs || '',
            isEmergency: false,
            isReferral: false
        });
        setSearchQuery('');
        setShowResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.nik || !formData.name || !formData.dob || !formData.poli) {
            alert('Mohon lengkapi data wajib (Nama, Tanggal Lahir, dan Poli)!');
            return;
        }

        // DOB Validation
        const today = new Date();
        const dobDate = new Date(formData.dob);
        if (dobDate > today) {
            alert('Tanggal lahir tidak boleh lebih dari hari ini!');
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
        let priority: 'normal' | 'bayi' | 'lansia' = 'normal';
        if (age >= 60) priority = 'lansia';
        if (age <= 5) priority = 'bayi';

        const newQueueItem = {
            id,
            name: formData.name,
            nik: formData.nik,
            phoneNumber: formData.phoneNumber,
            poli: formData.poli,
            status: 'waiting' as const,
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            prescription: [],
            bill: 0,
            priority,
            isEmergency: formData.isEmergency,
            isReferral: formData.isReferral
        };

        addQueueItem(newQueueItem);

        // Check if patient exists, if not add to database
        const existingPatient = oldPatients.find(p => p.nik === formData.nik);
        if (!existingPatient) {
            await addPatient({
                nik: formData.nik,
                name: formData.name,
                dob: formData.dob,
                phoneNumber: formData.phoneNumber,
                insurance: formData.insurance,
                bpjs: formData.bpjsNumber
            });
        }

        // Simulate WhatsApp Sending
        if (sendWhatsApp && formData.phoneNumber) {
            console.log(`Sending WhatsApp ticket to ${formData.phoneNumber}: Ticket ID ${id}`);
        }

        // Generate QR
        try {
            const qrUrl = await QRCode.toDataURL(id);
            setQrCodeUrl(qrUrl);
        } catch (err) {
            console.error(err);
        }

        setCurrentTicket(newQueueItem);
        setTicketModalOpen(true);

        // Reset Form
        setFormData({
            nik: '',
            name: '',
            dob: '',
            phoneNumber: '',
            insurance: 'Umum',
            bpjsNumber: '',
            poli: '' as any,
            isEmergency: false,
            isReferral: false
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
                        <div className="relative mb-6 z-20 flex gap-2">
                            <div className="relative flex-1">
                                <Input
                                    icon={<Search size={18} />}
                                    placeholder="Cari Pasien Lama (NIK / Nama)..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                />
                                {showResults && (
                                    <div className="absolute top-full left-0 right-0 bg-white dark:bg-slate-800 shadow-xl rounded-xl mt-2 border border-slate-100 dark:border-slate-700 overflow-hidden max-h-60 overflow-y-auto z-50">
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
                            <Button
                                variant="secondary"
                                className="px-4"
                                title="Scan E-KTP (Simulasi)"
                                onClick={() => {
                                    const btn = document.getElementById('scan-btn');
                                    if (btn) {
                                        btn.innerHTML = '<span class="animate-spin">⌛</span> Scanning...';
                                        setTimeout(() => {
                                            setFormData({
                                                ...formData,
                                                nik: '3201123456789001',
                                                name: 'Budi Santoso (E-KTP)',
                                                dob: '1990-01-01'
                                            });
                                            btn.innerHTML = '✅ Sukses';
                                            setTimeout(() => btn.innerHTML = 'Scan E-KTP', 2000);
                                        }, 1500);
                                    }
                                }}
                            >
                                <span id="scan-btn" className="flex items-center gap-2">
                                    <ScanLine size={18} /> <span className="hidden md:inline">Scan E-KTP</span>
                                </span>
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="NIK"
                                    placeholder="16 digit NIK"
                                    value={formData.nik}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                                        setFormData({ ...formData, nik: val });
                                    }}
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
                                    max={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        const today = new Date().toISOString().split('T')[0];
                                        if (val > today) {
                                            setFormData({ ...formData, dob: today });
                                        } else {
                                            setFormData({ ...formData, dob: val });
                                        }
                                    }}
                                    required
                                />
                                <Input
                                    label="Nomor WhatsApp / HP"
                                    type="tel"
                                    placeholder="08..."
                                    value={formData.phoneNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setFormData({ ...formData, phoneNumber: val });
                                    }}
                                />
                            </div>

                            {formData.dob && (
                                <div className="mt-2">
                                    {calculateAge(formData.dob) <= 5 && (
                                        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 animate-in fade-in slide-in-from-top-1">
                                            PRIORITAS: BALITA
                                        </span>
                                    )}
                                    {calculateAge(formData.dob) >= 60 && (
                                        <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold border border-purple-200 animate-in fade-in slide-in-from-top-1">
                                            PRIORITAS: LANSIA
                                        </span>
                                    )}
                                </div>
                            )}

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

                            {formData.insurance === 'BPJS' && (
                                <Input
                                    label="Nomor BPJS"
                                    placeholder="13 digit No. BPJS"
                                    value={formData.bpjsNumber}
                                    onChange={(e) => setFormData({ ...formData, bpjsNumber: e.target.value })}
                                    className="animate-in slide-in-from-top-2"
                                />
                            )}

                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 flex-1 transition-all hover:bg-red-100 dark:hover:bg-red-900/40">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                                        checked={formData.isEmergency}
                                        onChange={(e) => setFormData({ ...formData, isEmergency: e.target.checked })}
                                    />
                                    <div>
                                        <span className="block font-bold text-sm text-red-700 dark:text-red-400">Darurat / IGD</span>
                                        <span className="text-xs text-red-500 dark:text-red-500/70">Butuh penanganan segera</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 flex-1 transition-all hover:bg-blue-100 dark:hover:bg-blue-900/40">
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                        checked={formData.isReferral}
                                        onChange={(e) => setFormData({ ...formData, isReferral: e.target.checked })}
                                    />
                                    <div>
                                        <span className="block font-bold text-sm text-blue-700 dark:text-blue-400">Butuh Rujukan</span>
                                        <span className="text-xs text-blue-500 dark:text-blue-500/70">Permintaan surat rujukan</span>
                                    </div>
                                </label>
                            </div>


                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 ml-1">Poli Tujuan</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    {['Umum', 'Gigi', 'KIA'].map((p) => {
                                        const count = queue.filter(q => q.poli === p).length;
                                        const max = quotas[p];
                                        const isFull = count >= max;
                                        const doctor = doctorStatuses.find(d => d.poli === p);
                                        const estTime = (count + 1) * 15; // 15 mins per patient

                                        return (
                                            <div
                                                key={p}
                                                onClick={() => !isFull && handlePoliClick(p as any, doctor?.status || 'Offline')}
                                                className={`
                          cursor-pointer rounded-xl p-3 border-2 transition-all relative overflow-hidden group
                          ${formData.poli === p
                                                        ? 'border-primary bg-teal-50 dark:bg-teal-900/20 shadow-md'
                                                        : 'border-transparent bg-gray-50 dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600'
                                                    }
                          ${isFull ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                        `}
                                            >
                                                {/* ... (card content) ... */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <p className={`font-bold text-sm ${formData.poli === p ? 'text-primary' : 'text-slate-800 dark:text-white'}`}>Poli {p}</p>
                                                        <p className="text-[10px] text-slate-400">{count} / {max} Pasien</p>
                                                    </div>
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${formData.poli === p ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                                                        {doctor?.avatar || '?'}
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                        <User size={12} />
                                                        <span className="truncate font-medium">{doctor?.name || 'Dokter Jaga'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                                        <Clock size={12} />
                                                        <span>Est. Masuk: {estTime} mnt</span>
                                                    </div>
                                                </div>

                                                {isFull && <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-bl-lg font-bold">PENUH</span>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* ... (rest of form) ... */}

                            {/* Confirmation Modal for Poli Selection */}
                            <Modal
                                isOpen={!!confirmPoli}
                                onClose={() => setConfirmPoli(null)}
                                title="Konfirmasi Pilihan Poli"
                            >
                                <div className="space-y-4">
                                    <div className="bg-yellow-50 text-yellow-700 p-4 rounded-xl flex items-start gap-3">
                                        <div className="shrink-0 mt-0.5">⚠️</div>
                                        <p className="text-sm font-medium">{confirmPoli?.message}</p>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-4">
                                        <Button variant="secondary" onClick={() => setConfirmPoli(null)}>
                                            Batal
                                        </Button>
                                        <Button onClick={() => {
                                            if (confirmPoli) {
                                                setFormData({ ...formData, poli: confirmPoli.poli });
                                                setConfirmPoli(null);
                                            }
                                        }}>
                                            Ya, Lanjutkan
                                        </Button>
                                    </div>
                                </div>
                            </Modal>

                            <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 p-3 rounded-xl border border-green-100 dark:border-green-900/30">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300 flex items-center justify-center">
                                        <MessageCircle size={16} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-green-800 dark:text-green-300">Kirim Tiket via WhatsApp</p>
                                        <p className="text-[10px] text-green-600 dark:text-green-400">Kirim nomor antrean ke HP pasien</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={sendWhatsApp}
                                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                                </label>
                            </div>

                            <Button type="submit" className="w-full mt-4 gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" size="lg">
                                <Printer size={18} /> Simpan & Cetak Tiket
                            </Button>
                        </form>
                    </Card>
                </div>

                {/* Right Column: Live Preview & Doctor Status */}
                <div className="w-full lg:w-80 space-y-6 sticky top-24 h-fit">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-none shadow-xl">
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

                    <Card className="border-none shadow-lg bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-2 mb-4">
                            <Stethoscope size={18} className="text-primary" />
                            <h3 className="font-bold text-slate-800 dark:text-white">Status Dokter</h3>
                        </div>
                        <div className="space-y-3">
                            {doctorStatuses.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                            {doc.avatar}
                                        </div>
                                        <div>
                                            <p className="font-bold text-xs text-slate-800 dark:text-white">{doc.name}</p>
                                            <p className="text-[10px] text-slate-500">Poli {doc.poli}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400">{doc.status}</span>
                                        <div className={`w-2.5 h-2.5 rounded-full ${doc.status === 'Ready' ? 'bg-green-500 animate-pulse' :
                                            doc.status === 'Tindakan' ? 'bg-red-500' :
                                                doc.status === 'Istirahat' ? 'bg-yellow-500' :
                                                    'bg-slate-300'
                                            }`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Ticket Modal */}
            <Modal isOpen={ticketModalOpen} onClose={() => setTicketModalOpen(false)}>
                {currentTicket && (
                    <div className="text-center space-y-4">
                        <div className="bg-green-100 text-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                            <Printer size={32} />
                        </div>
                        <h3 className="font-bold text-xl text-slate-800 dark:text-white">Pendaftaran Berhasil!</h3>
                        <p className="text-slate-500">Silakan cetak tiket antrean Anda.</p>

                        <div className="bg-slate-50 dark:bg-slate-700 p-6 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-2 bg-primary"></div>
                            <h2 className="text-3xl font-black text-primary mb-2">{currentTicket.id}</h2>
                            <p className="font-bold text-lg text-slate-800 dark:text-white">{currentTicket.name}</p>
                            <p className="text-sm text-slate-500 mb-4">Poli {currentTicket.poli} | {currentTicket.time}</p>

                            {/* Priority Tags */}
                            <div className="flex justify-center gap-2 mb-4">
                                {currentTicket.priority !== 'normal' && (
                                    <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-purple-200">
                                        {currentTicket.priority}
                                    </span>
                                )}
                                {currentTicket.isEmergency && (
                                    <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-red-200">
                                        IGD / DARURAT
                                    </span>
                                )}
                                {currentTicket.isReferral && (
                                    <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-blue-200">
                                        RUJUKAN
                                    </span>
                                )}
                            </div>

                            <div className="flex justify-center">
                                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">Simpan tiket ini untuk dipindai saat dipanggil.</p>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="secondary" className="flex-1" onClick={() => setTicketModalOpen(false)}>Tutup</Button>
                            <Button className="flex-1" onClick={() => window.print()}>Cetak Tiket</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

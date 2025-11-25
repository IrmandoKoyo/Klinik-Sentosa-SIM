import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Stethoscope, Plus, Trash2, Save, Pill, Activity, History, FileText, AlertTriangle } from 'lucide-react';
import { icd10Codes } from '../data/icd10';

export const Examination: React.FC = () => {
    const { queue, medications, updateQueueItem, transactions, currentUser } = useClinic();

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [anamnesa, setAnamnesa] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [vitalSigns, setVitalSigns] = useState({ bp: '', weight: '', temp: '', heartRate: '', respiratoryRate: '' });
    const [activeTab, setActiveTab] = useState<'exam' | 'history'>('exam');
    const [prescription, setPrescription] = useState<{ name: string, qty: number, price: number, dosage?: string }[]>([]);

    // Form for adding medicine
    const [selectedMed, setSelectedMed] = useState('');
    const [medQty, setMedQty] = useState(1);
    const [medDosage, setMedDosage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Cross-role confirmation
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingPatientId, setPendingPatientId] = useState<string | null>(null);

    const waitingPatients = queue.filter(q => q.status === 'waiting' || q.status === 'exam');
    const activePatient = queue.find(q => q.id === selectedPatientId);

    const handleStartExamClick = (patient: typeof queue[0]) => {
        // Check for role mismatch
        if (currentUser?.role === 'dokter' && currentUser?.poli && patient.poli !== currentUser.poli) {
            setPendingPatientId(patient.id);
            setConfirmModalOpen(true);
        } else {
            handleStartExam(patient.id);
        }
    };

    const handleConfirmStartExam = () => {
        if (pendingPatientId) {
            handleStartExam(pendingPatientId);
            setConfirmModalOpen(false);
            setPendingPatientId(null);
        }
    };

    const handleStartExam = (id: string) => {
        setSelectedPatientId(id);
        updateQueueItem(id, { status: 'exam' });

        // Only reset if starting a new exam for a waiting patient
        const patient = queue.find(q => q.id === id);
        if (patient && patient.status === 'waiting') {
            setAnamnesa('');
            setDiagnosis('');
            setNotes('');
            setPrescription([]);
            setVitalSigns({ bp: '', weight: '', temp: '', heartRate: '', respiratoryRate: '' });
            setActiveTab('exam');
        }
    };

    const handleAddMedicine = () => {
        if (!selectedMed || medQty <= 0) return;

        const med = medications.find(m => m.name === selectedMed);
        if (!med) return;

        if (med.stock < medQty) {
            alert(`Stok tidak cukup! Sisa: ${med.stock}`);
            return;
        }

        setPrescription([...prescription, {
            name: med.name,
            qty: medQty,
            price: med.price,
            dosage: medDosage || '3x1 Sesudah Makan' // Default dosage
        }]);

        // Reset med input
        setSelectedMed('');
        setMedQty(1);
        setMedDosage('');
    };

    const handleRemoveMedicine = (index: number) => {
        const newPrescription = [...prescription];
        newPrescription.splice(index, 1);
        setPrescription(newPrescription);
    };

    const handleSubmit = async () => {
        if (!selectedPatientId || !activePatient) return;
        if (!diagnosis) {
            alert('Diagnosa harus diisi!');
            return;
        }

        setIsSubmitting(true);

        try {
            const totalBill = prescription.reduce((acc, item) => acc + (item.price * item.qty), 0) + 50000; // + Jasa Dokter

            // Check if handled by mismatch
            const isRoleMismatch = currentUser?.role === 'dokter' && currentUser?.poli && activePatient.poli !== currentUser.poli;

            await updateQueueItem(selectedPatientId, {
                status: 'payment',
                prescription,
                bill: totalBill,
                diagnosis,
                anamnesa,
                notes,
                vitalSigns,
                doctorName: currentUser?.name || 'dr. Umum',
                examTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
                handledByRoleMismatch: isRoleMismatch,
                actualDoctorRole: currentUser?.role === 'dokter' ? currentUser.poli : 'Admin'
            });

            alert('Pemeriksaan selesai. Data dikirim ke kasir.');
            setSelectedPatientId(null);
        } catch (error) {
            console.error("Error submitting exam:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
            {/* Left: Queue List */}
            <div className="w-full lg:w-1/3 flex flex-col gap-4">
                <Card className="flex-1 overflow-hidden flex flex-col p-0">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Stethoscope size={18} className="text-primary" />
                            Antrian Pasien
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {waitingPatients.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">Tidak ada pasien menunggu</div>
                        )}
                        {waitingPatients.map(p => {
                            const isRoleMismatch = currentUser?.role === 'dokter' && currentUser?.poli && p.poli !== currentUser.poli;
                            return (
                                <div
                                    key={p.id}
                                    className={`p-4 rounded-xl border cursor-pointer transition group relative overflow-hidden
                                        ${p.status === 'exam' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' :
                                            isRoleMismatch ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800 hover:border-red-400' :
                                                'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50'
                                        }`}
                                    onClick={() => handleStartExamClick(p)}
                                >
                                    {isRoleMismatch && (
                                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-bl-lg font-bold flex items-center gap-1">
                                            <AlertTriangle size={10} /> BUKAN ROLE ANDA
                                        </div>
                                    )}
                                    <div className="flex justify-between items-start mb-2">
                                        <span className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${isRoleMismatch ? 'text-red-600 bg-red-100' : 'text-primary bg-primary/10'}`}>{p.id}</span>
                                        <span className="text-[10px] text-slate-400">{p.time}</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800 dark:text-white">{p.name}</h4>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-slate-500">Poli {p.poli}</span>
                                        {p.status === 'exam' && (
                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full animate-pulse">
                                                SEDANG DIPERIKSA
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* Right: Exam Form */}
            <div className="flex-1">
                {activePatient ? (
                    <Card className="h-full flex flex-col overflow-hidden">
                        <div className="border-b border-slate-100 dark:border-slate-700 pb-4 mb-4 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white">{activePatient.name}</h2>
                                <p className="text-sm text-slate-500">No. RM: {activePatient.nik} | ID: {activePatient.id}</p>
                            </div>
                            <div className="text-right">
                                <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                    SEDANG DIPERIKSA
                                </span>
                                {activePatient.handledByRoleMismatch && (
                                    <div className="mt-1 text-[10px] font-bold text-red-500 bg-red-100 px-2 py-0.5 rounded-full border border-red-200">
                                        DITANGANI DOKTER {activePatient.actualDoctorRole || 'LAIN'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-4 mb-6 border-b border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setActiveTab('exam')}
                                className={`pb-2 px-4 text-sm font-bold transition flex items-center gap-2 ${activeTab === 'exam' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                            >
                                <Activity size={16} /> Pemeriksaan
                            </button>
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`pb-2 px-4 text-sm font-bold transition flex items-center gap-2 ${activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
                            >
                                <History size={16} /> Riwayat Medis
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
                            {activeTab === 'exam' ? (
                                <>
                                    {/* Vital Signs */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-3 flex items-center gap-2">
                                            <Activity size={14} /> Tanda Tanda Vital (TTV)
                                        </h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Tekanan Darah</label>
                                                <input
                                                    type="text"
                                                    placeholder="120/80"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                    value={vitalSigns.bp}
                                                    onChange={e => {
                                                        let val = e.target.value.replace(/\D/g, '');
                                                        if (val.length > 6) val = val.slice(0, 6);
                                                        if (val.length > 3) {
                                                            val = val.slice(0, 3) + '/' + val.slice(3);
                                                        }
                                                        setVitalSigns({ ...vitalSigns, bp: val });
                                                    }}
                                                    maxLength={7}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Berat Badan (kg)</label>
                                                <input
                                                    type="number"
                                                    placeholder="60"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                    value={vitalSigns.weight}
                                                    onChange={e => setVitalSigns({ ...vitalSigns, weight: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Suhu (°C)</label>
                                                <input
                                                    type="number"
                                                    placeholder="36.5"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                    value={vitalSigns.temp}
                                                    onChange={e => setVitalSigns({ ...vitalSigns, temp: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Nadi (bpm)</label>
                                                <input
                                                    type="number"
                                                    placeholder="80"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                    value={vitalSigns.heartRate}
                                                    onChange={e => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500 mb-1 block">Pernapasan (x/mnt)</label>
                                                <input
                                                    type="number"
                                                    placeholder="20"
                                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                    value={vitalSigns.respiratoryRate}
                                                    onChange={e => setVitalSigns({ ...vitalSigns, respiratoryRate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Anamnesa & Diagnosa */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Anamnesa / Keluhan</label>
                                            <textarea
                                                className="w-full p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary outline-none transition dark:text-white min-h-[80px]"
                                                placeholder="Catat keluhan pasien..."
                                                value={anamnesa}
                                                onChange={(e) => setAnamnesa(e.target.value)}
                                            ></textarea>
                                        </div>
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Diagnosa (ICD-10)</label>
                                                <div className="relative">
                                                    <Input
                                                        placeholder="Cari Diagnosa (Kode / Nama)..."
                                                        value={diagnosis}
                                                        onChange={(e) => {
                                                            setDiagnosis(e.target.value);
                                                            // Filter logic handled in render or separate state if needed
                                                        }}
                                                        list="icd10-list"
                                                        autoComplete="off"
                                                    />
                                                    <datalist id="icd10-list">
                                                        {icd10Codes.map((code) => (
                                                            <option key={code.code} value={`${code.code} - ${code.name}`} />
                                                        ))}
                                                    </datalist>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Saran / Catatan Dokter</label>
                                                <Input
                                                    placeholder="Contoh: Istirahat cukup, kurangi garam"
                                                    value={notes}
                                                    onChange={(e) => setNotes(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* E-Resep */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <h4 className="font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                                            <Pill size={16} /> E-Resep
                                        </h4>

                                        <div className="flex gap-2 mb-4">
                                            <select
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                value={selectedMed}
                                                onChange={(e) => setSelectedMed(e.target.value)}
                                            >
                                                <option value="">Pilih Obat...</option>
                                                {medications.map(m => (
                                                    <option key={m.name} value={m.name} disabled={m.stock <= 0}>
                                                        {m.name} (Stok: {m.stock})
                                                    </option>
                                                ))}
                                            </select>
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-16 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                value={medQty}
                                                onChange={(e) => setMedQty(parseInt(e.target.value))}
                                                placeholder="Qty"
                                            />
                                            <input
                                                type="text"
                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                value={medDosage}
                                                onChange={(e) => setMedDosage(e.target.value)}
                                                placeholder="Dosis (e.g., 3x1)"
                                            />
                                            <Button onClick={handleAddMedicine} size="sm">
                                                <Plus size={16} />
                                            </Button>
                                        </div>

                                        {prescription.length > 0 ? (
                                            <div className="space-y-2">
                                                {prescription.map((item, idx) => (
                                                    <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-700 p-2 rounded-lg border border-slate-100 dark:border-slate-600">
                                                        <div>
                                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</p>
                                                            <p className="text-xs text-slate-500">{item.qty}x @ {item.dosage}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleRemoveMedicine(idx)}
                                                            className="text-red-500 hover:bg-red-50 p-1 rounded transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4 text-slate-400 text-xs italic">
                                                Belum ada resep
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-4">
                                        <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                                            <Save size={18} /> {isSubmitting ? 'Menyimpan...' : 'Simpan Pemeriksaan'}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {transactions.filter(t => t.patientName === activePatient?.name).length > 0 ? (
                                        transactions.filter(t => t.patientName === activePatient?.name).map((t, idx) => (
                                            <div key={idx} className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                <div className="flex justify-between mb-2">
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                                                            <FileText size={14} /> {t.date} <span className="text-slate-400 font-normal">| {t.time || '00:00'}</span>
                                                        </span>
                                                        <span className="text-xs text-slate-500 mt-0.5">
                                                            {t.doctorName || 'dr. Umum'} | Poli {t.poli || 'Umum'}
                                                        </span>
                                                        {t.handledByRoleMismatch && (
                                                            <span className="text-[10px] font-bold text-red-500 mt-1">
                                                                DITANGANI DOKTER {t.actualDoctorRole || 'LAIN'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 h-fit rounded-full font-bold">Selesai</span>
                                                </div>

                                                {/* Diagnosis & Anamnesa */}
                                                <div className="mb-3 pb-3 border-b border-slate-200 dark:border-slate-600">
                                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Diagnosa: <span className="font-normal">{t.diagnosis || '-'}</span></p>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><span className="font-semibold">Keluhan:</span> {t.anamnesa || '-'}</p>
                                                    {t.notes && <p className="text-sm text-slate-600 dark:text-slate-400 mt-1"><span className="font-semibold">Saran:</span> {t.notes}</p>}
                                                </div>

                                                {/* Vital Signs */}
                                                {t.vitalSigns && (
                                                    <div className="grid grid-cols-5 gap-2 mb-3 pb-3 border-b border-slate-200 dark:border-slate-600">
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 block">TD</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{t.vitalSigns.bp || '-'}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 block">BB</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{t.vitalSigns.weight || '-'} kg</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 block">Suhu</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{t.vitalSigns.temp || '-'} °C</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 block">Nadi</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{t.vitalSigns.heartRate || '-'}</span>
                                                        </div>
                                                        <div className="text-xs">
                                                            <span className="text-slate-400 block">RR</span>
                                                            <span className="font-bold text-slate-700 dark:text-slate-300">{t.vitalSigns.respiratoryRate || '-'}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="space-y-1 pl-2 border-l-2 border-primary/20 ml-1">
                                                    <p className="text-xs font-bold text-slate-400 mb-1">Resep Obat:</p>
                                                    {t.items.map((item, i) => (
                                                        <p key={i} className="text-sm text-slate-600 dark:text-slate-400 flex justify-between">
                                                            <span>{item.name}</span>
                                                            <span className="font-bold">x{item.qty}</span>
                                                        </p>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-slate-400">
                                            <History size={48} className="mx-auto mb-4 opacity-20" />
                                            <p>Belum ada riwayat medis untuk pasien ini.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Stethoscope size={48} className="mb-4 opacity-20" />
                        <p>Pilih pasien dari antrian untuk memulai pemeriksaan</p>
                    </div>
                )}
            </div>

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                title="Konfirmasi Pemeriksaan Lintas Poli"
            >
                <div className="space-y-4">
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle className="shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold">Peringatan Role Mismatch</h4>
                            <p className="text-sm mt-1">
                                Pasien ini terdaftar di Poli <strong>{queue.find(q => q.id === pendingPatientId)?.poli}</strong>,
                                sedangkan Anda adalah Dokter <strong>{currentUser?.poli}</strong>.
                            </p>
                        </div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                        Apakah Anda yakin ingin memeriksa pasien ini? Tindakan ini akan tercatat dalam riwayat medis sebagai
                        <span className="font-bold text-red-500"> "Ditangani Dokter {currentUser?.poli}"</span>.
                    </p>
                    <div className="flex justify-end gap-3 mt-6">
                        <Button variant="secondary" onClick={() => setConfirmModalOpen(false)}>
                            Batal
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white"
                            onClick={handleConfirmStartExam}
                        >
                            Ya, Saya Yakin
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

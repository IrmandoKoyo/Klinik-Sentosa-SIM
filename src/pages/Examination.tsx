import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Stethoscope, Plus, Trash2, Save, Pill, Activity, History, FileText } from 'lucide-react';

export const Examination: React.FC = () => {
    const { queue, medications, updateQueueItem, transactions, currentUser } = useClinic();

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [anamnesa, setAnamnesa] = useState('');
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [vitalSigns, setVitalSigns] = useState({ bp: '', weight: '', temp: '', heartRate: '', respiratoryRate: '' });
    const [activeTab, setActiveTab] = useState<'exam' | 'history'>('exam');
    const [prescription, setPrescription] = useState<{ name: string, qty: number, price: number }[]>([]);

    // Form for adding medicine
    const [selectedMed, setSelectedMed] = useState('');
    const [medQty, setMedQty] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const waitingPatients = queue.filter(q => q.status === 'waiting' || q.status === 'exam');
    const activePatient = queue.find(q => q.id === selectedPatientId);

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
            price: med.price
        }]);

        // Reset med input
        setSelectedMed('');
        setMedQty(1);
    };

    const handleRemoveMedicine = (index: number) => {
        const newPrescription = [...prescription];
        newPrescription.splice(index, 1);
        setPrescription(newPrescription);
    };

    const handleSubmit = async () => {
        if (!selectedPatientId) return;
        if (!diagnosis) {
            alert('Diagnosa harus diisi!');
            return;
        }

        setIsSubmitting(true);

        try {
            const totalBill = prescription.reduce((acc, item) => acc + (item.price * item.qty), 0) + 50000; // + Jasa Dokter

            await updateQueueItem(selectedPatientId, {
                status: 'payment',
                prescription,
                bill: totalBill,
                diagnosis,
                anamnesa,
                notes,
                vitalSigns,
                doctorName: currentUser?.name || 'dr. Umum',
                examTime: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
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
                        {waitingPatients.map(p => (
                            <div
                                key={p.id}
                                className={`p-4 rounded-xl border cursor-pointer transition group ${p.status === 'exam' ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-primary/50'}`}
                                onClick={() => handleStartExam(p.id)}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded text-xs">{p.id}</span>
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
                        ))}
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
                                                    onChange={e => setVitalSigns({ ...vitalSigns, bp: e.target.value })}
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
                                                <label className="text-xs text-slate-500 mb-1 block">Pernapasan (x/m)</label>
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
                                                <Input
                                                    placeholder="Contoh: A00.1 Cholera"
                                                    value={diagnosis}
                                                    onChange={(e) => setDiagnosis(e.target.value)}
                                                />
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
                                                className="w-20 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-sm"
                                                value={medQty}
                                                onChange={(e) => setMedQty(parseInt(e.target.value))}
                                            />
                                            <Button size="sm" onClick={handleAddMedicine} disabled={!selectedMed}>
                                                <Plus size={16} />
                                            </Button>
                                        </div>

                                        <div className="space-y-2">
                                            {prescription.map((item, idx) => (
                                                <div key={idx} className="flex justify-between items-center bg-white dark:bg-slate-700 p-3 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                                                    <div>
                                                        <p className="font-bold text-sm text-slate-800 dark:text-white">{item.name}</p>
                                                        <p className="text-xs text-slate-500">{item.qty} unit @ Rp {item.price}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMedicine(idx)}
                                                        className="text-red-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                            {prescription.length === 0 && (
                                                <p className="text-center text-xs text-slate-400 py-2">Belum ada obat ditambahkan</p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (<div className="space-y-4">
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

                        {activeTab === 'exam' && (
                            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                                <Button className="w-full gap-2" onClick={handleSubmit} isLoading={isSubmitting} disabled={isSubmitting}>
                                    <Save size={18} /> Simpan & Kirim ke Kasir
                                </Button>
                            </div>
                        )}
                    </Card>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                        <Stethoscope size={48} className="mb-4 opacity-20" />
                        <p>Pilih pasien dari antrian untuk memulai pemeriksaan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

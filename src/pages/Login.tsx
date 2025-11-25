import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { User, Lock, ArrowRight, Hospital } from 'lucide-react';

export const Login: React.FC = () => {
    const { users, login } = useClinic();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'staff' | 'patient'>('staff');

    const [role, setRole] = useState('admin');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        const user = users.find(u => u.u === username && u.p === password);

        if (user) {
            if (user.role !== role) {
                alert('Akun tidak sesuai role!');
                return;
            }
            login(user);
            navigate('/dashboard');
        } else {
            alert('Username atau password salah!');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-100 dark:from-slate-900 dark:to-teal-900 p-4">
            <div className="bg-white dark:bg-darkCard p-8 rounded-3xl shadow-2xl w-full max-w-md border-t-4 border-primary transform transition-all hover:shadow-primary/20">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 dark:bg-teal-900 text-primary mb-4 shadow-inner ring-4 ring-white dark:ring-slate-700">
                        <Hospital size={40} />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">Klinik Sentosa</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Integrated Health System V11</p>
                </div>

                <div className="flex mb-8 bg-gray-100 dark:bg-slate-700 rounded-xl p-1.5">
                    <button
                        onClick={() => setActiveTab('staff')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Staf Klinik
                    </button>
                    <button
                        onClick={() => setActiveTab('patient')}
                        className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'patient' ? 'bg-white dark:bg-slate-600 shadow-sm text-slate-800 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                    >
                        Portal Pasien
                    </button>
                </div>

                {activeTab === 'staff' ? (
                    <form onSubmit={handleLogin} className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div>
                            <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5 ml-1">Pilih Role</label>
                            <div className="relative">
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition dark:text-white appearance-none font-medium cursor-pointer"
                                >
                                    <option value="admin">Administrator</option>
                                    <option value="dokter">Dokter</option>
                                    <option value="kasir">Kasir / Pendaftaran</option>
                                    <option value="apoteker">Apoteker</option>
                                </select>
                            </div>
                        </div>

                        <Input
                            label="Username"
                            icon={<User size={18} />}
                            placeholder="Contoh: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            icon={<Lock size={18} />}
                            placeholder="••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="button" onClick={handleLogin} className="w-full gap-2">
                            <span>Masuk Sistem</span> <ArrowRight size={16} />
                        </Button>

                        <div className="pt-2 text-center">
                            <p className="text-xs text-slate-400">Gunakan akun demo untuk presentasi:</p>
                            <div className="flex justify-center gap-2 mt-2 flex-wrap">
                                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-500">admin/123</span>
                                <span className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-[10px] font-mono text-slate-500">dokter/123</span>
                            </div>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 py-4">
                        <div className="bg-teal-50 dark:bg-slate-700/50 p-6 rounded-2xl border border-teal-100 dark:border-slate-600 text-center">
                            <div className="w-12 h-12 bg-white dark:bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm text-primary">
                                <Hospital size={24} />
                            </div>
                            <h3 className="font-bold text-slate-800 dark:text-white mb-1">Lacak Antrian Realtime</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-300 leading-relaxed">
                                Masukkan nama atau nomor antrian Anda untuk melihat status pemeriksaan dan pengambilan obat tanpa perlu login.
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            className="w-full gap-2"
                            onClick={() => navigate('/visitor')}
                        >
                            Masuk Portal Pasien
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

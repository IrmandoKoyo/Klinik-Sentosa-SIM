import React, { useState } from 'react';
import { useClinic } from '../context/ClinicContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';

import { Edit, Trash2, Shield, UserPlus, Search } from 'lucide-react';
import type { User as UserType, Role } from '../types';

export const UsersPage: React.FC = () => {
    const { users, addUser, updateUser, deleteUser, currentUser } = useClinic();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUser, setEditingUser] = useState<UserType | null>(null);
    const [formData, setFormData] = useState<Partial<UserType>>({
        name: '',
        role: 'dokter',
        u: '',
        p: '',
        poli: 'Umum',
        status: 'Offline',
        avatar: '👨‍⚕️'
    });

    const handleOpenModal = (user?: UserType) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                role: 'dokter',
                u: '',
                p: '',
                poli: 'Umum',
                status: 'Offline',
                avatar: '👨‍⚕️'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.u || !formData.p) return;

        try {
            if (editingUser) {
                // Update existing user
                await updateUser((editingUser as any).firestoreId, formData);
            } else {
                // Add new user
                const newId = Math.max(...users.map(u => u.id), 0) + 1;
                await addUser({ ...formData, id: newId } as UserType);
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error("Failed to save user", error);
            alert("Gagal menyimpan data pengguna");
        }
    };

    const handleDelete = async (user: UserType) => {
        if (user.role === 'admin' && users.filter(u => u.role === 'admin').length <= 1) {
            alert("Tidak dapat menghapus Admin terakhir!");
            return;
        }

        if (confirm(`Apakah Anda yakin ingin menghapus pengguna ${user.name}?`)) {
            await deleteUser((user as any).firestoreId);
        }
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.u.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Manajemen Pengguna</h2>
                    <p className="text-slate-500 text-sm">Kelola akun staf klinik (Dokter, Apoteker, Kasir)</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <UserPlus size={18} /> Tambah Pengguna
                </Button>
            </div>

            <Card>
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Cari pengguna..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500 font-bold bg-slate-50 dark:bg-slate-800/50">
                                <th className="p-4 rounded-tl-xl">Nama Lengkap</th>
                                <th className="p-4">Role</th>
                                <th className="p-4">Username</th>
                                <th className="p-4">Password</th>
                                <th className="p-4 text-right rounded-tr-xl">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-bold text-slate-800 dark:text-white flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${user.role === 'admin' ? 'bg-red-500' :
                                            user.role === 'dokter' ? 'bg-blue-500' :
                                                user.role === 'apoteker' ? 'bg-purple-500' : 'bg-green-500'
                                            }`}>
                                            {user.name.charAt(0)}
                                        </div>
                                        {user.name}
                                        {user.id === currentUser?.id && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-2">(Anda)</span>}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${user.role === 'admin' ? 'bg-red-100 text-red-600' :
                                            user.role === 'dokter' ? 'bg-blue-100 text-blue-600' :
                                                user.role === 'apoteker' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-slate-500">{user.u}</td>
                                    <td className="p-4 font-mono text-slate-400">••••••</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button size="sm" variant="secondary" onClick={() => handleOpenModal(user)} className="h-8 w-8 p-0">
                                                <Edit size={14} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleDelete(user)}
                                                disabled={user.id === currentUser?.id}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nama Lengkap"
                        placeholder="Contoh: Dr. Budi Santoso"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Role / Jabatan</label>
                        <div className="relative">
                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <select
                                value={formData.role}
                                onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition appearance-none"
                            >
                                <option value="admin">Administrator</option>
                                <option value="dokter">Dokter</option>
                                <option value="kasir">Kasir / Pendaftaran</option>
                                <option value="apoteker">Apoteker</option>
                            </select>
                        </div>
                    </div>

                    {formData.role === 'dokter' && (
                        <div className="grid grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Poli</label>
                                <select
                                    value={formData.poli || 'Umum'}
                                    onChange={e => setFormData({ ...formData, poli: e.target.value as any })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Umum">Umum</option>
                                    <option value="Gigi">Gigi</option>
                                    <option value="KIA">KIA</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Status</label>
                                <select
                                    value={formData.status || 'Offline'}
                                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="Ready">Ready</option>
                                    <option value="Tindakan">Tindakan</option>
                                    <option value="Istirahat">Istirahat</option>
                                    <option value="Offline">Offline</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase text-slate-400 mb-1.5">Avatar</label>
                                <select
                                    value={formData.avatar || '👨‍⚕️'}
                                    onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="👨‍⚕️">👨‍⚕️ Pria</option>
                                    <option value="👩‍⚕️">👩‍⚕️ Wanita</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Username"
                            placeholder="username"
                            value={formData.u || ''}
                            onChange={e => setFormData({ ...formData, u: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="text" // Visible for admin convenience as requested
                            placeholder="password"
                            value={formData.p || ''}
                            onChange={e => setFormData({ ...formData, p: e.target.value })}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                            Batal
                        </Button>
                        <Button type="submit">
                            {editingUser ? 'Simpan Perubahan' : 'Buat Akun'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

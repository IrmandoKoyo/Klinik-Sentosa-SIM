import type { ClinicData } from '../types';

export const initialData: ClinicData = {
    users: [
        { id: 1, name: 'Dr. Budi Santoso', role: 'dokter', u: 'dokter', p: '123' },
        { id: 2, name: 'Siti Aminah, S.Farm', role: 'apoteker', u: 'apoteker', p: '123' },
        { id: 3, name: 'Rina Kasir', role: 'kasir', u: 'kasir', p: '123' },
        { id: 4, name: 'Admin Utama', role: 'admin', u: 'admin', p: '123' }
    ],
    quotas: { 'Umum': 20, 'Gigi': 15, 'KIA': 10 },
    medications: [
        { name: 'Paracetamol 500mg', stock: 100, price: 5000 },
        { name: 'Amoxicillin 500mg', stock: 50, price: 12000 },
        { name: 'Vitamin C 500mg', stock: 200, price: 2000 },
        { name: 'Ibuprofen 400mg', stock: 80, price: 8000 },
        { name: 'Omeprazole 20mg', stock: 60, price: 15000 }
    ],
    oldPatients: [
        { nik: '1234567890123456', name: 'Budi Santoso', dob: '1990-01-01', insurance: 'Umum' },
        { nik: '9876543210987654', name: 'Siti Aminah', dob: '1955-08-17', insurance: 'BPJS', bpjs: '000123456' },
        { nik: '1111111111111111', name: 'Bayu (Bayi)', dob: '2023-01-01', insurance: 'Umum' }
    ],
    queue: [],
    transactions: [],
    invoices: []
};

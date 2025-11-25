export type Role = 'admin' | 'dokter' | 'kasir' | 'apoteker';

export interface User {
    id: number;
    name: string;
    role: Role;
    u: string; // username
    p: string; // password
}

export interface Patient {
    nik: string;
    name: string;
    dob: string;
    insurance: 'Umum' | 'BPJS';
    bpjs?: string;
}

export interface Medication {
    id?: string; // Firestore ID
    name: string;
    stock: number;
    price: number;
}

export interface PrescriptionItem {
    name: string;
    qty: number;
    price: number;
}

export interface QueueItem {
    id: string;
    name: string;
    nik: string;
    poli: 'Umum' | 'Gigi' | 'KIA';
    status: 'waiting' | 'exam' | 'payment' | 'pharmacy' | 'done';
    time: string;
    prescription: PrescriptionItem[];
    bill: number;
    diagnosis?: string;
    anamnesa?: string;
    notes?: string; // Saran/Catatan Dokter
    doctorName?: string;
    examTime?: string;
    vitalSigns?: {
        bp: string;
        weight: string;
        temp: string;
        heartRate?: string; // Nadi
        respiratoryRate?: string; // Pernapasan
    };
}

export interface Transaction {
    id: string;
    date: string;
    time?: string; // Waktu transaksi/pemeriksaan
    patientName: string;
    doctorName?: string;
    poli?: string;
    total: number;
    status: 'pending' | 'paid' | 'cancelled';
    items: {
        name: string;
        qty: number;
        price: number;
    }[];
    diagnosis?: string;
    anamnesa?: string;
    notes?: string;
    vitalSigns?: {
        bp: string;
        weight: string;
        temp: string;
        heartRate?: string;
        respiratoryRate?: string;
    };
}

export interface ClinicData {
    users: User[];
    oldPatients: Patient[];
    medications: Medication[];
    queue: QueueItem[];
    transactions: Transaction[];
    quotas: Record<string, number>;
}

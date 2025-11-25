export type Role = 'admin' | 'dokter' | 'kasir' | 'apoteker';

export interface User {
    id: number;
    name: string;
    role: Role;
    u: string; // username
    p: string; // password
    poli?: 'Umum' | 'Gigi' | 'KIA';
    status?: 'Ready' | 'Tindakan' | 'Istirahat' | 'Offline';
    avatar?: string;
}

export interface Patient {
    nik: string;
    name: string;
    dob: string;
    insurance: 'Umum' | 'BPJS';
    bpjs?: string;
    phoneNumber?: string;
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
    dosage?: string; // Aturan Pakai (e.g., "3x1 Sesudah Makan")
}

export interface QueueItem {
    id: string;
    name: string;
    nik: string;
    phoneNumber?: string;
    poli: 'Umum' | 'Gigi' | 'KIA';
    status: 'waiting' | 'exam' | 'payment' | 'pharmacy' | 'done';
    date: string; // YYYY-MM-DD
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
    priority?: 'normal' | 'bayi' | 'lansia';
    isEmergency?: boolean;
    isReferral?: boolean;
    handledByRoleMismatch?: boolean;
    actualDoctorRole?: string;
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
        dosage?: string;
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
    respiratoryRate?: string;
    handledByRoleMismatch?: boolean;
    actualDoctorRole?: string;
}

export interface Invoice {
    id: string;
    date: string;
    imageUrl: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedBy: string;
    items?: { name: string; qty: number; price: number }[];
    firestoreId?: string;
}

export interface ClinicData {
    users: User[];
    oldPatients: Patient[];
    medications: Medication[];
    queue: QueueItem[];
    transactions: Transaction[];
    quotas: Record<string, number>;
    invoices: Invoice[];
}

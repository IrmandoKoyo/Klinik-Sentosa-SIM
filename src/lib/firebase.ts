import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDNtdtWNgYCCGgP4S84zDmNDQvRD_6Kt5o",
    authDomain: "sad-project-909e7.firebaseapp.com",
    projectId: "sad-project-909e7",
    storageBucket: "sad-project-909e7.firebasestorage.app",
    messagingSenderId: "148876232726",
    appId: "1:148876232726:web:4cb5994d237870c09f8d37",
    measurementId: "G-YBP6NWRNZX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Collection References
export const COLLECTIONS = {
    QUEUE: 'queue',
    TRANSACTIONS: 'transactions',
    MEDICATIONS: 'medications',
    USERS: 'users',
    QUOTAS: 'quotas',
    PATIENTS: 'patients'
};

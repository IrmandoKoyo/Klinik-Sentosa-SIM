import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ClinicData, User, QueueItem, Transaction, Medication, Patient } from '../types';
import { initialData } from '../data/mockData';
import { db, COLLECTIONS } from '../lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, getDocs, writeBatch } from 'firebase/firestore';
import { seedDatabase } from '../utils/seedData';

interface ClinicContextType extends ClinicData {
    currentUser: User | null;
    login: (user: User) => void;
    logout: () => void;
    addQueueItem: (item: QueueItem) => void;
    updateQueueItem: (id: string, updates: Partial<QueueItem>) => void;
    updateMedicationStock: (name: string, qty: number) => void;
    addMedication: (med: Medication) => Promise<void>;
    updateMedication: (id: string, updates: Partial<Medication>) => Promise<void>;
    deleteMedication: (id: string) => Promise<void>;
    addTransaction: (transaction: Transaction) => void;
    addPatient: (patient: Patient) => Promise<void>;
    updateQuota: (poli: string) => void;


    seedData: () => Promise<void>;
    resetQueue: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial state is empty, will be filled by Firestore
    const [data, setData] = useState<ClinicData>({
        users: initialData.users, // Users still hardcoded for now or from initialData
        oldPatients: initialData.oldPatients,
        medications: [],
        queue: [],
        transactions: [],
        quotas: initialData.quotas
    });
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    // Subscribe to Firestore collections
    useEffect(() => {
        // Queue Subscription
        const qQuery = query(collection(db, COLLECTIONS.QUEUE));
        const unsubscribeQueue = onSnapshot(qQuery, (snapshot) => {
            const queueData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as QueueItem));
            // Sort by time if needed, but for now just trust the order or sort client side
            // Let's sort by time string for consistency
            queueData.sort((a, b) => a.time.localeCompare(b.time));
            setData(prev => ({ ...prev, queue: queueData }));
        });

        // Medications Subscription
        const mQuery = query(collection(db, COLLECTIONS.MEDICATIONS));
        const unsubscribeMeds = onSnapshot(mQuery, (snapshot) => {
            const medsData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as Medication));
            setData(prev => ({ ...prev, medications: medsData }));
        });

        // Transactions Subscription
        const tQuery = query(collection(db, COLLECTIONS.TRANSACTIONS));
        const unsubscribeTrans = onSnapshot(tQuery, (snapshot) => {
            const transData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as Transaction));
            setData(prev => ({ ...prev, transactions: transData }));
        });

        // Users Subscription
        const uQuery = query(collection(db, COLLECTIONS.USERS));
        const unsubscribeUsers = onSnapshot(uQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as User));

            // Fallback to initialData if Firestore is empty (for first time setup)
            if (usersData.length === 0) {
                setData(prev => ({ ...prev, users: initialData.users }));
            } else {
                setData(prev => ({ ...prev, users: usersData }));
            }
        });

        // Patients Subscription
        const pQuery = query(collection(db, COLLECTIONS.PATIENTS));
        const unsubscribePatients = onSnapshot(pQuery, (snapshot) => {
            const patientsData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as Patient));

            // Fallback to initialData if Firestore is empty
            if (patientsData.length === 0) {
                setData(prev => ({ ...prev, oldPatients: initialData.oldPatients }));
            } else {
                setData(prev => ({ ...prev, oldPatients: patientsData }));
            }
        });

        return () => {
            unsubscribeQueue();
            unsubscribeMeds();
            unsubscribeTrans();
            unsubscribeUsers();
            unsubscribePatients();
        };
    }, []);

    const login = (user: User) => setCurrentUser(user);
    const logout = () => setCurrentUser(null);

    const addQueueItem = async (item: QueueItem) => {
        try {
            await addDoc(collection(db, COLLECTIONS.QUEUE), item);
        } catch (error) {
            console.error("Error adding queue item: ", error);
        }
    };

    const updateQueueItem = async (id: string, updates: Partial<QueueItem>) => {
        try {
            const itemToUpdate = data.queue.find(q => q.id === id);
            if (itemToUpdate && (itemToUpdate as any).firestoreId) {
                const docRef = doc(db, COLLECTIONS.QUEUE, (itemToUpdate as any).firestoreId);
                await updateDoc(docRef, updates);
            } else {
                console.error("Could not find item to update or missing firestoreId", id);
            }
        } catch (error) {
            console.error("Error updating queue item: ", error);
        }
    };

    const updateMedicationStock = async (name: string, qty: number) => {
        try {
            const medToUpdate = data.medications.find(m => m.name === name);
            if (medToUpdate && (medToUpdate as any).firestoreId) {
                const docRef = doc(db, COLLECTIONS.MEDICATIONS, (medToUpdate as any).firestoreId);
                await updateDoc(docRef, { stock: medToUpdate.stock + qty });
            }
        } catch (error) {
            console.error("Error updating medication stock: ", error);
        }
    };

    const addMedication = async (med: Medication) => {
        try {
            await addDoc(collection(db, COLLECTIONS.MEDICATIONS), med);
        } catch (error) {
            console.error("Error adding medication: ", error);
        }
    };

    const updateMedication = async (id: string, updates: Partial<Medication>) => {
        try {
            const docRef = doc(db, COLLECTIONS.MEDICATIONS, id);
            await updateDoc(docRef, updates);
        } catch (error) {
            console.error("Error updating medication: ", error);
        }
    };

    const deleteMedication = async (id: string) => {
        try {
            const docRef = doc(db, COLLECTIONS.MEDICATIONS, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error("Error deleting medication: ", error);
        }
    };

    const addTransaction = async (transaction: Transaction) => {
        try {
            await addDoc(collection(db, COLLECTIONS.TRANSACTIONS), transaction);
        } catch (error) {
            console.error("Error adding transaction: ", error);
        }
    };

    const addPatient = async (patient: Patient) => {
        try {
            await addDoc(collection(db, COLLECTIONS.PATIENTS), patient);
        } catch (error) {
            console.error("Error adding patient: ", error);
        }
    };


    const updateQuota = (_poli: string) => {
        // Quota logic remains derived or local for now
    };

    const seedData = async () => {
        await seedDatabase();
    };

    const resetQueue = async () => {
        try {
            const qQuery = query(collection(db, COLLECTIONS.QUEUE));
            const snapshot = await getDocs(qQuery);
            const batch = writeBatch(db);
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
            await batch.commit();
        } catch (error) {
            console.error("Error resetting queue: ", error);
        }
    };

    return (
        <ClinicContext.Provider value={{
            ...data,
            currentUser,
            login,
            logout,
            addQueueItem,
            updateQueueItem,
            updateMedicationStock,
            addTransaction,
            addPatient,
            updateQuota,

            seedData,
            resetQueue,
            addMedication,
            updateMedication,
            deleteMedication
        }}>
            {children}
        </ClinicContext.Provider>
    );
};

export const useClinic = () => {
    const context = useContext(ClinicContext);
    if (context === undefined) {
        throw new Error('useClinic must be used within a ClinicProvider');
    }
    return context;
};

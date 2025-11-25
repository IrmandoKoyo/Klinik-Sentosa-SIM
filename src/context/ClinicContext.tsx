import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ClinicData, User, QueueItem, Transaction, Medication, Patient, Invoice } from '../types';
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
    addUser: (user: User) => Promise<void>;
    updateUser: (id: string, updates: Partial<User>) => Promise<void>;
    deleteUser: (id: string) => Promise<void>;
    addInvoice: (invoice: Invoice) => Promise<void>;
    processInvoice: (invoiceId: string, items: { name: string; qty: number; price: number }[]) => Promise<void>;
    doctorStatuses: {
        id: string;
        name: string;
        poli: 'Umum' | 'Gigi' | 'KIA';
        status: 'Ready' | 'Tindakan' | 'Istirahat' | 'Offline';
        avatar: string;
    }[];
}

const ClinicContext = createContext<ClinicContextType | undefined>(undefined);

export const ClinicProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial state is empty, will be filled by Firestore
    const [data, setData] = useState<ClinicData>({
        users: initialData.users,
        oldPatients: initialData.oldPatients,
        medications: [],
        queue: [],
        transactions: [],
        quotas: initialData.quotas,
        invoices: []
    });
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Derived currentUser to ensure reactivity
    const currentUser = currentUserId
        ? data.users.find(u => u.id.toString() === currentUserId || (u as any).firestoreId === currentUserId) || null
        : null;

    // Derived state for doctor statuses
    const doctorStatuses = data.users
        .filter(u => u.role === 'dokter')
        .map(u => ({
            id: u.id.toString(),
            name: u.name,
            poli: u.poli || 'Umum',
            status: u.status || 'Ready',
            avatar: u.avatar || u.name[0]
        }));

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
            const medsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, firestoreId: doc.id } as unknown as Medication));
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

        // Invoices Subscription
        const iQuery = query(collection(db, COLLECTIONS.INVOICES));
        const unsubscribeInvoices = onSnapshot(iQuery, (snapshot) => {
            const invoicesData = snapshot.docs.map(doc => ({ ...doc.data(), firestoreId: doc.id } as unknown as Invoice));
            setData(prev => ({ ...prev, invoices: invoicesData }));
        });

        return () => {
            unsubscribeQueue();
            unsubscribeMeds();
            unsubscribeTrans();
            unsubscribeUsers();
            unsubscribePatients();
            unsubscribeInvoices();
        };
    }, []);

    const login = (user: User) => setCurrentUserId((user as any).firestoreId || user.id.toString());
    const logout = () => setCurrentUserId(null);

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
            deleteMedication,
            addUser: async (user: User) => {
                try {
                    await addDoc(collection(db, COLLECTIONS.USERS), user);
                } catch (error) {
                    console.error("Error adding user: ", error);
                }
            },
            updateUser: async (id: string, updates: Partial<User>) => {
                try {
                    // Ensure we are updating the correct document
                    if (!id) throw new Error("Invalid User ID");
                    const docRef = doc(db, COLLECTIONS.USERS, id);
                    await updateDoc(docRef, updates);
                } catch (error) {
                    console.error("Error updating user: ", error);
                    throw error; // Re-throw to let caller handle it
                }
            },
            deleteUser: async (id: string) => {
                try {
                    const docRef = doc(db, COLLECTIONS.USERS, id);
                    await deleteDoc(docRef);
                } catch (error) {
                    console.error("Error deleting user: ", error);
                }
            },
            addInvoice: async (invoice: Invoice) => {
                try {
                    await addDoc(collection(db, COLLECTIONS.INVOICES), invoice);
                } catch (error) {
                    console.error("Error adding invoice: ", error);
                }
            },
            processInvoice: async (invoiceId: string, items: { name: string; qty: number; price: number }[]) => {
                try {
                    // 1. Update Invoice Status
                    const invRef = doc(db, COLLECTIONS.INVOICES, invoiceId);
                    await updateDoc(invRef, { status: 'approved', items });

                    // 2. Update Inventory
                    const batch = writeBatch(db);

                    for (const item of items) {
                        // Check if med exists
                        const existingMed = data.medications.find(m => m.name.toLowerCase() === item.name.toLowerCase());

                        if (existingMed && (existingMed as any).firestoreId) {
                            const medRef = doc(db, COLLECTIONS.MEDICATIONS, (existingMed as any).firestoreId);
                            batch.update(medRef, {
                                stock: existingMed.stock + item.qty,
                                price: item.price // Update price to latest
                            });
                        } else {
                            const newMedRef = doc(collection(db, COLLECTIONS.MEDICATIONS));
                            batch.set(newMedRef, {
                                name: item.name,
                                stock: item.qty,
                                price: item.price
                            });
                        }
                    }

                    await batch.commit();

                } catch (error) {
                    console.error("Error processing invoice: ", error);
                    throw error;
                }
            },
            doctorStatuses // Add derived property to context value
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

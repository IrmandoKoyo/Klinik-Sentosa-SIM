import { db, COLLECTIONS } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { initialData } from '../data/mockData';

export const seedDatabase = async () => {
    try {
        const queueRef = collection(db, COLLECTIONS.QUEUE);
        const medsRef = collection(db, COLLECTIONS.MEDICATIONS);

        const usersRef = collection(db, COLLECTIONS.USERS);
        const patientsRef = collection(db, COLLECTIONS.PATIENTS);

        // Check if collections are empty
        const queueSnapshot = await getDocs(queueRef);
        const usersSnapshot = await getDocs(usersRef);
        const patientsSnapshot = await getDocs(patientsRef);
        const medsSnapshot = await getDocs(medsRef);

        const batch = writeBatch(db);
        let hasUpdates = false;

        // Seed Users if empty
        if (usersSnapshot.empty) {
            console.log('Seeding users...');
            initialData.users.forEach(item => {
                const docRef = doc(usersRef);
                batch.set(docRef, item);
            });
            hasUpdates = true;
        }

        // Seed Patients if empty
        if (patientsSnapshot.empty) {
            console.log('Seeding patients...');
            initialData.oldPatients.forEach(item => {
                const docRef = doc(patientsRef);
                batch.set(docRef, item);
            });
            hasUpdates = true;
        }

        // Seed Medications if empty
        if (medsSnapshot.empty) {
            console.log('Seeding medications...');
            initialData.medications.forEach(item => {
                const docRef = doc(medsRef);
                batch.set(docRef, item);
            });
            hasUpdates = true;
        }

        // Seed Queue if empty
        if (queueSnapshot.empty) {
            console.log('Seeding queue...');
            initialData.queue.forEach(item => {
                const docRef = doc(queueRef);
                batch.set(docRef, item);
            });
            hasUpdates = true;
        }

        if (hasUpdates) {
            await batch.commit();
            console.log('Database seeded successfully!');
            alert('Database berhasil di-update! Silakan refresh halaman.');
        } else {
            console.log('All collections already have data.');
            alert('Database sudah lengkap. Tidak ada data baru yang ditambahkan.');
        }

    } catch (error) {
        console.error('Error seeding database:', error);
        alert('Error seeding database. Check console for details.');
    }
};

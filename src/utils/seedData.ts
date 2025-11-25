import { db, COLLECTIONS } from '../lib/firebase';
import { collection, getDocs, writeBatch, doc, query, where } from 'firebase/firestore';
import { initialData } from '../data/mockData';

export const seedDatabase = async () => {
    try {
        const queueRef = collection(db, COLLECTIONS.QUEUE);
        const medsRef = collection(db, COLLECTIONS.MEDICATIONS);

        const usersRef = collection(db, COLLECTIONS.USERS);
        const patientsRef = collection(db, COLLECTIONS.PATIENTS);

        // Check if collections are empty
        const queueSnapshot = await getDocs(queueRef);
        // const usersSnapshot = await getDocs(usersRef); // Removed unused
        const patientsSnapshot = await getDocs(patientsRef);
        const medsSnapshot = await getDocs(medsRef);

        const batch = writeBatch(db);
        let hasUpdates = false;

        // Seed/Update Users
        console.log('Seeding/Updating users...');
        for (const user of initialData.users) {
            // Query by username to avoid duplicates/find existing
            const q = query(usersRef, where('u', '==', user.u));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // Update existing
                const docId = querySnapshot.docs[0].id;
                const docRef = doc(db, COLLECTIONS.USERS, docId);
                batch.update(docRef, user as any);
            } else {
                // Create new
                const docRef = doc(usersRef);
                batch.set(docRef, user);
            }
        }
        hasUpdates = true; // Always mark as having updates since we checked/updated users

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

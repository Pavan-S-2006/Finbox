
import { db } from "../lib/firebase";
import {
    collection,
    doc,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    where,
    query,
    getDoc,
    setDoc,
    serverTimestamp,
    onSnapshot
} from "firebase/firestore";

// Helper for delay (legacy support if needed, can be removed but keeping for specific transitions)
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const legacyService = {
    // Authenticate Vault
    authenticateVault: async (pin) => {
        // In a real app, this should verify against a hashed PIN stored in the user's secure settings
        // For now, we'll keep a simple client-side check or fetch from user settings
        // TODO: Move PIN to Firestore user settings
        await delay(500);
        if (pin === '1234') {
            return { success: true, token: 'auth-token-' + Date.now() };
        }
        throw new Error('Incorrect PIN. Access Denied.');
    },

    // Get All Nominees for a User
    getNominees: async (uid) => {
        if (!uid) return [];
        try {
            const q = collection(db, "users", uid, "legacy_nominees");
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error getting nominees:", error);
            throw error;
        }
    },

    // Add New Nominee & Create Invite
    addNominee: async (uid, nominee) => {
        if (!uid) throw new Error("User ID is required");
        if (!nominee.name || !nominee.relationship || !nominee.email) {
            throw new Error('Name, Relationship, and Email are required.');
        }

        try {
            // 1. Add to user's nominee subcollection
            const nomineeRef = await addDoc(collection(db, "users", uid, "legacy_nominees"), {
                ...nominee,
                accessGranted: false, // Default: No access until permitted
                createdAt: serverTimestamp()
            });

            // 2. Create an Invite in global collection
            // This allows the nominee to "Sign Up as Family Member"
            await setDoc(doc(db, "legacy_invites", nominee.email), {
                inviterUid: uid,
                nomineeId: nomineeRef.id,
                email: nominee.email,
                name: nominee.name,
                relationship: nominee.relationship,
                status: 'pending',
                permission: false, // Matches accessGranted
                createdAt: serverTimestamp()
            });

            return { id: nomineeRef.id, ...nominee };
        } catch (error) {
            console.error("Error adding nominee:", error);
            throw error;
        }
    },

    // Remove Nominee
    removeNominee: async (uid, nomineeId) => {
        if (!uid || !nomineeId) return;
        try {
            // Get nominee data first to delete the invite
            const nomineeRef = doc(db, "users", uid, "legacy_nominees", nomineeId);
            const snapshot = await getDoc(nomineeRef);

            if (snapshot.exists()) {
                const data = snapshot.data();
                if (data.email) {
                    await deleteDoc(doc(db, "legacy_invites", data.email));
                }
            }

            await deleteDoc(nomineeRef);
            return true;
        } catch (error) {
            console.error("Error removing nominee:", error);
            throw error;
        }
    },

    // Update Permission (Toggle Access)
    updateMemberPermission: async (uid, nomineeId, accessGranted, nomineeEmail) => {
        try {
            // Update local record
            const nomineeRef = doc(db, "users", uid, "legacy_nominees", nomineeId);
            await updateDoc(nomineeRef, { accessGranted });

            // Update invite record (so the family member knows they have access)
            if (nomineeEmail) {
                const inviteRef = doc(db, "legacy_invites", nomineeEmail);
                await updateDoc(inviteRef, { permission: accessGranted });
            }
            return true;
        } catch (error) {
            console.error("Error updating permission:", error);
            throw error;
        }
    },

    // Get Vault Documents (Protected)
    // token arg is kept for interface compatibility, but we rely on uid from context
    getDocuments: async (token, uid) => {
        if (!uid) throw new Error('Unauthorized');
        try {
            const q = collection(db, "users", uid, "legacy_documents");
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Error fetching documents:", error);
            throw error;
        }
    },

    // Add Document
    addDocument: async (token, docData, uid) => {
        if (!uid) throw new Error('Unauthorized');
        try {
            const newDocRef = await addDoc(collection(db, "users", uid, "legacy_documents"), {
                ...docData,
                date: new Date().toLocaleDateString(),
                createdAt: serverTimestamp()
            });
            return { id: newDocRef.id, ...docData };
        } catch (error) {
            console.error("Error adding document:", error);
            throw error;
        }
    },

    // Check if an email has a pending invite
    checkInvite: async (email) => {
        try {
            const inviteRef = doc(db, "legacy_invites", email);
            const snapshot = await getDoc(inviteRef);
            if (snapshot.exists()) {
                return snapshot.data();
            }
            return null;
        } catch (error) {
            console.error("Error checking invite:", error);
            return null;
        }
    },

    // Subscribe to Invite Updates (Real-time Permission Check)
    subscribeToInvite: (email, callback) => {
        if (!email) return () => { };
        const inviteRef = doc(db, "legacy_invites", email);
        return onSnapshot(inviteRef, (doc) => {
            if (doc.exists()) {
                callback(doc.data());
            } else {
                callback(null);
            }
        });
    },

    // Get Recommendations (kept as mock for now, or can be moved to Firestore later)
    getRecommendations: async () => {
        // This could be fetched from a global "config" collection if dynamic
        return [
            { id: 1, type: 'Health Insurance', priority: 'high', reason: 'Coverage gap detected: No active policy for parents.', action: 'View Plans' },
            { id: 2, type: 'Will Generation', priority: 'medium', reason: 'You have significant assets but no registered will.', action: 'Draft Will' },
            { id: 3, type: 'Critical Illness Cover', priority: 'low', reason: 'Recommended add-on for your age group.', action: 'Explore' },
        ];
    }
};

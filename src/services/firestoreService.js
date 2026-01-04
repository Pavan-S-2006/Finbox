import { db } from "../lib/firebase";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc, // Keep for reference, but we use runTransaction now
    updateDoc, // Keep for reference
    deleteDoc, // Keep for reference
    onSnapshot,
    query,
    orderBy,
    serverTimestamp,
    runTransaction
} from "firebase/firestore";

// User Operations
export const createUserDocument = async (user, additionalData = {}) => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        const { email, displayName } = user;
        const createdAt = serverTimestamp();

        try {
            await setDoc(userRef, {
                uid: user.uid,
                email,
                fullName: displayName || '',
                createdAt,
                assets: {
                    savings: 0,
                    gold: 0,
                    investments: 0,
                    other: 0,
                    ...(additionalData.assets || {})
                },
                liabilities: {
                    loans: 0,
                    creditCard: 0,
                    other: 0,
                    ...(additionalData.liabilities || {})
                },
                healthScore: 50,
                ...additionalData
            });
        } catch (error) {
            console.error("Error creating user document", error);
        }
    }
};

export const getUserData = async (uid) => {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
        return userSnap.data();
    } else {
        return null;
    }
};

export const subscribeToUserData = (uid, callback) => {
    const userRef = doc(db, "users", uid);
    return onSnapshot(userRef, (doc) => {
        if (doc.exists()) {
            callback(doc.data());
        }
    });
};

export const updateUserAssets = async (uid, assets) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { assets });
};

export const updateUserLiabilities = async (uid, liabilities) => {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, { liabilities });
};


// Transaction Operations with ACID properties
export const addTransactionToFirestore = async (uid, transaction) => {
    console.log("addTransactionToFirestore called for uid:", uid, "with data:", transaction);
    const userRef = doc(db, "users", uid);
    const newTxRef = doc(collection(db, "users", uid, "transactions"));

    const newTx = {
        ...transaction,
        amount: Number(transaction.amount),
        date: transaction.date || new Date().toISOString(),
        createdAt: serverTimestamp()
    };
    const { id, ...txData } = newTx; // Remove ID if present

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists()) {
                throw "User does not exist!";
            }

            const userData = userDoc.data();
            let assets = { ...userData.assets };
            let liabilities = { ...userData.liabilities };

            // Update balances Logic
            if (newTx.type === 'expense') {
                if (newTx.paymentSource === 'credit') {
                    liabilities.creditCard = (liabilities.creditCard || 0) + newTx.amount;
                } else {
                    assets.savings = (assets.savings || 0) - newTx.amount;
                }
            } else {
                assets.savings = (assets.savings || 0) + newTx.amount;
            }

            // Commit updates
            transaction.set(newTxRef, txData);
            transaction.update(userRef, { assets, liabilities });
        });
    } catch (error) {
        console.error("Transaction failed: ", error);
        throw error;
    }
};

export const updateTransactionInFirestore = async (uid, updatedTx) => {
    const userRef = doc(db, "users", uid);
    const txRef = doc(db, "users", uid, "transactions", updatedTx.id);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const txDoc = await transaction.get(txRef);

            if (!userDoc.exists() || !txDoc.exists()) {
                throw "Document does not exist!";
            }

            const userData = userDoc.data();
            const oldTx = txDoc.data();

            let assets = { ...userData.assets };
            let liabilities = { ...userData.liabilities };

            // Revert Old
            if (oldTx.type === 'expense') {
                if (oldTx.paymentSource === 'credit') {
                    liabilities.creditCard = (liabilities.creditCard || 0) - oldTx.amount;
                } else {
                    assets.savings = (assets.savings || 0) + oldTx.amount;
                }
            } else {
                assets.savings = (assets.savings || 0) - oldTx.amount;
            }

            // Apply New
            if (updatedTx.type === 'expense') {
                if (updatedTx.paymentSource === 'credit') {
                    liabilities.creditCard = (liabilities.creditCard || 0) + Number(updatedTx.amount);
                } else {
                    assets.savings = (assets.savings || 0) - Number(updatedTx.amount);
                }
            } else {
                assets.savings = (assets.savings || 0) + Number(updatedTx.amount);
            }

            const { id, ...txData } = updatedTx;
            transaction.update(txRef, txData);
            transaction.update(userRef, { assets, liabilities });
        });
    } catch (error) {
        console.error("Update failed: ", error);
        throw error;
    }
};

export const deleteTransactionFromFirestore = async (uid, transactionId) => {
    const userRef = doc(db, "users", uid);
    const txRef = doc(db, "users", uid, "transactions", transactionId);

    try {
        await runTransaction(db, async (transaction) => {
            const userDoc = await transaction.get(userRef);
            const txDoc = await transaction.get(txRef);

            if (!userDoc.exists() || !txDoc.exists()) {
                throw "Document does not exist!";
            }

            const userData = userDoc.data();
            const oldTx = txDoc.data();

            let assets = { ...userData.assets };
            let liabilities = { ...userData.liabilities };

            // Revert Effect
            if (oldTx.type === 'expense') {
                if (oldTx.paymentSource === 'credit') {
                    liabilities.creditCard = (liabilities.creditCard || 0) - oldTx.amount;
                } else {
                    assets.savings = (assets.savings || 0) + oldTx.amount;
                }
            } else {
                assets.savings = (assets.savings || 0) - oldTx.amount;
            }

            transaction.delete(txRef);
            transaction.update(userRef, { assets, liabilities });
        });
    } catch (error) {
        console.error("Delete failed: ", error);
        throw error;
    }
};

export const subscribeToTransactions = (uid, callback) => {
    const transactionsRef = collection(db, "users", uid, "transactions");
    const q = query(transactionsRef, orderBy("date", "desc"));

    return onSnapshot(q, (querySnapshot) => {
        const transactions = [];
        querySnapshot.forEach((doc) => {
            transactions.push({ id: doc.id, ...doc.data() });
        });
        callback(transactions);
    });
};

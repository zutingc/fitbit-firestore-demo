import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dataCollection = collection(db, "users");

/* Get all data within collection */
const getData = async () => {
    try {
        const querySnapshot = await getDocs(dataCollection);

        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
};

/* Get data from specific document within the collection */
const getDataByUID = async (UID) => {
    try {
        const userDocRef = doc(dataCollection, UID);
        const docSnapshot = await getDocs(userDocRef);

        if (docSnapshot.exists()) {
            console.log(`${docSnapshot.id} => ${JSON.stringify(docSnapshot.data())}`);
        } else {
            console.log(`Document with UID ${UID} not found`);
        }
    } catch (error) {
        console.error("Error getting document by UID: ", error);
    }
};

/* Write data into document with new ID "UID". If it exists, the data will be merged into the existing ID */
const addData = async (UID, data) => {
    try {
        const userDocRef = doc(dataCollection, UID);
        await setDoc(userDocRef, data, {merge: true});
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

export {getData, getDataByUID, addData};
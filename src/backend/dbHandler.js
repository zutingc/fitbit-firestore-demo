import { getFirestore, collection, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from './firebaseConfig';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const dataCollection = collection(db, "users");

const getData = async () => {
    try {
        const querySnapshot = await getDocs(dataCollection);

        // modify as needed
        querySnapshot.forEach((doc) => {
            console.log(`${doc.id} => ${JSON.stringify(doc.data())}`);
        });
    } catch (error) {
        console.error("Error getting documents: ", error);
    }
};

const addData = async (UID, data) => {
    try {
        const userDocRef = doc(dataCollection, UID);
        const docRef = await setDoc(userDocRef, data, {merge: true});
        // await addDoc(documentRef, data);
    } catch (error) {
        console.error("Error adding document: ", error);
    }
};

export {getData, addData};
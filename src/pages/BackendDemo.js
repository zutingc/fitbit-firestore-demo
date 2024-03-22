import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import dbHandler from '../backend/dbHandler';
import FitbitDataComponent from '../fitbit/fitbitDataComponent';
import { useFitbitAuth } from '../fitbit/fitbitAuth';

function BackendDemo() {
    const [UID, setUID] = useState("");
    const [firebaseUID, setFirebaseUID] = useState("");
    const [allData, setAllData] = useState("");
    const [UIDData, setUIDData] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const [arg1, setArg1] = useState('');
    const [arg2, setArg2] = useState('');

    const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: "users/" });

    // Use the useFitbitAuth hook to get the access token
    const accessToken = useFitbitAuth();

    useEffect(() => {
        // Check if accessToken is available and fetch user data only if it's available
        if (accessToken) {
            const fetchData = async () => {
                const { getProfile, getUID } = FitbitDataComponent({ accessToken });

                try {
                    const auth = getAuth();
                    onAuthStateChanged(auth, (user) => {
                        if (user) {
                            setUserEmail(user.email);
                            setFirebaseUID(user.uid);
                        }
                    });

                    const UID = await getUID();
                    setUID(UID);

                    const sampleData = {
                        heartrate: 123,
                        test: "test string",
                    };

                    await addData(UID, await getProfile());
                    await addData(UID, sampleData);

                    getDataByDocID(UID).then((data) => {
                        console.log('Data by UID:', data);
                        setUIDData(data);
                    });


                    getAllData().then((data) => {
                        console.log('All data from collection:', data);
                        setAllData(data);
                    });

                } catch (error) {
                    console.error('Error in fetching data:', error);
                }
            };

            fetchData();
        }
    }, [accessToken]);

    const handleSubmit = (e) => {
        e.preventDefault();
        addData(UID, { [arg1]: arg2 })
            .then(() => {
                getAllData().then((data) => setAllData(data));
                getDataByDocID(UID).then((data) => setUIDData(data));
            })
            .catch((error) => {
                console.error('Error adding data:', error);
            });
    }

    return (
        <div>
            <h1>Backend Demo</h1>
            <p><b>Firebase Auth UID: </b> {firebaseUID}</p>
            <p><b>FitBit UID: </b> {UID}</p>
            <p><b>User Email: </b> {userEmail}</p>
            <p><Link to="/login">Log in</Link> <Link to="/register">Register</Link></p>
            <hr />
            <p>Write Data:
                <form onSubmit={handleSubmit}>
                    <label>
                        <input type="text" placeholder="field name" value={arg1} onChange={(e) => setArg1(e.target.value)} />
                    </label>
                    <label>
                        <input type="text" placeholder="field value" value={arg2} onChange={(e) => setArg2(e.target.value)} />
                    </label>
                    <button type="submit">Submit</button>
                </form>
            </p>
            <hr />
            <b>All data from collection: </b><pre>{JSON.stringify(allData)}</pre>
            <hr />
            <b>Data From UID {"(should be your data)"}: </b><pre>{JSON.stringify(UIDData)}</pre>
        </div>
    );
}

export default BackendDemo;

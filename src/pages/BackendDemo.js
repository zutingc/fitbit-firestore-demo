import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import dbHandler from '../backend/dbHandler';
import FitbitDataComponent from '../fitbit/fitbitDataComponent';
import { useFitbitAuth } from '../fitbit/fitbitAuth';

function BackendDemo() {
    const [fitbitUID, setFitbitUID] = useState("");
    const [firebaseUID, setFirebaseUID] = useState("");
    const [allData, setAllData] = useState("");
    const [UIDData, setUIDData] = useState("");
    const [userEmail, setUserEmail] = useState("");

    const [arg1, setArg1] = useState('');
    const [arg2, setArg2] = useState('');

    // instance of dbHandler for the collections "users"
    const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: "users/" });

    // Use the useFitbitAuth hook to get the access token
    const accessToken = useFitbitAuth();

    useEffect(() => {
        // Check if accessToken is available and fetch user data only if it's available
        if (accessToken) {
            const fetchData = async () => {
                const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });
    
                try {
                    const auth = getAuth();
                    onAuthStateChanged(auth, async (user) => {
                        if (user) {
                            // set states with Firebase user email and UID
                            setUserEmail(user.email);
                            setFirebaseUID(user.uid);
    
                            // set FitBit UID state
                            const FBUID = await getUID();
                            setFitbitUID(FBUID);
    
                            const sampleData = {
                                heartrate: 123,
                                test: "test string",
                            };

                            // set doc ID with Fitbit UID to getProfile and sampleData
                            await addData(FBUID, await getProfile());
                            await addData(FBUID, sampleData);
                            
                            // set doc ID with Firebase UID to getProfile
                            await addData(user.uid, await getProfile());
                            await addData(user.uid, await getHeartRateTimeSeries('2024-02-02', '1d'));
    
                            getDataByDocID(user.uid).then((data) => {
                                console.log('Data by UID:', data);
                                setUIDData(data);
                            });
    
                            getAllData().then((data) => {
                                console.log('All data from collection:', data);
                                setAllData(data);
                            });
                        }
                    });
    
                } catch (error) {
                    console.error('Error in fetching data:', error);
                }
            };
    
            fetchData();
        }
    }, [accessToken]);
    
    
    // submit button for write data fields
    const handleSubmit = (e) => {
        e.preventDefault();
        addData(firebaseUID, { [arg1]: arg2 })
            .then(() => {
                getAllData().then((data) => setAllData(data));
                getDataByDocID(firebaseUID).then((data) => setUIDData(data));
            })
            .catch((error) => {
                console.error('Error adding data:', error);
            });
    }

    return (
        <div>
            <h1>Backend Demo</h1>
            <p><b>Firebase Auth UID: </b> {firebaseUID}</p>
            <p><b>FitBit UID: </b> {fitbitUID}</p>
            <p><b>User Email: </b> {userEmail}</p>
            <p><Link to="/login">Log in</Link> <Link to="/register">Register</Link></p>
            <hr />
            <p>Write Data to doc with FireStore UID:
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
            <b>Data From FireStore UID {"(should be your data)"}: </b><pre>{JSON.stringify(UIDData)}</pre>
        </div>
    );
}

export default BackendDemo;

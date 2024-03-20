import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Link } from 'react-router-dom';
import dbHandler from '../backend/dbHandler';
import FitbitDataComponent from '../fitbit/fitbitDataComponent';
import { useFitbitAuth } from '../fitbit/fitbitAuth';

function BackendDemo() {
  const [fitBitUID, setFitBitUID] = useState('');
  const [firebaseUID, setFirebaseUID] = useState('');
  const [allData, setAllData] = useState('');
  const [UIDData, setUIDData] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const accessToken = useFitbitAuth();

  const [arg1, setArg1] = useState('');
  const [arg2, setArg2] = useState('');

  // Import functions from Firestore db component
  const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: 'users/' });

  // Import functions from Fitbit data component
  const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email);
        setFirebaseUID(user.uid);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  function refreshData() {
    // Get data from Firestore by UID
    getDataByDocID(fitBitUID).then((data) => {
      setUIDData(data);
    });

    // Get all data from collection
    getAllData().then((data) => {
      console.log(data);
      setAllData(data);
    });
  };

  const demoFunctions = async () => {
    // Ensure that the access token is ready
    if (!accessToken) {
      return;
    }

    try {
      // Observe the authentication state to get the current user's email
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUserEmail(user.email);
        }
      });

      // Use FitBit UID as Firestore document ID to organize the users' data
      setFitBitUID( await getUID());

      // Data is in JSON. Here's some sample data
      const sampleData = {
        heartrate: 123,
        test: 'test string',
      };

      // Examples of writing data to Firestore
      // const addData: (docID: any, data: any, mergeVal?: boolean)
      await addData(firebaseUID, await getProfile());
      await addData(firebaseUID, sampleData);
      // use the FitBit UID only to store user data
      await addData(fitBitUID, await getHeartRateTimeSeries('2024-02-02', '1d'));
      // use the Firebase UID to store data + link it to FitBit UID
      await addData(firebaseUID, {firebaseEmail: userEmail});
      await addData(firebaseUID, {fitBitUID: fitBitUID});

      // Get data from Firestore by FitBit UID
      getDataByDocID(fitBitUID).then((data) => {
        setUIDData(data);
      });

      // Get all data from collection
      getAllData().then((data) => {
        setAllData(data);
      });
    } catch (error) {
      console.error('Error in demoFunctions:', error);
    }
  };

  demoFunctions();

  const handleSubmit = (e) => {
    // Call the provided onSubmit function with the input values
    e.preventDefault();
    addData(fitBitUID, { [arg1]: arg2 })
      .then(() => {
        // After successfully adding data, refresh the displayed data
        getAllData().then((data) => setAllData(data));
        getDataByDocID(fitBitUID).then((data) => setUIDData(data));
      })
      .catch((error) => {
        console.error('Error adding data:', error);
      });
  };

  return (
    <div>
      <h1>Backend Demo</h1>
      <p><b>Firebase Auth UID: </b> {firebaseUID}</p>
      <p><b>FitBit UID: </b> {fitBitUID}</p>
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

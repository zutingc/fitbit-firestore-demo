import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";


import dbHandler from '../backend/dbHandler';
import FitbitDataComponent from '../fitbit/fitbitDataComponent';
import { useFitbitAuth } from '../fitbit/fitbitAuth';

/*
Recommended Reading:
- https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing
- https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises

Documentation:
- https://firebase.google.com/docs/firestore
- https://dev.fitbit.com/build/reference/web-api/
*/

function BackendDemo() {
  // For demo purposes:
  const [UID, setUID] = useState("");
  const [allData, setAllData] = useState("");
  const [UIDData, setUIDData] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const accessToken = useFitbitAuth();

  const [arg1, setArg1] = useState('');
  const [arg2, setArg2] = useState('');

  // Import functions from Firestore db component
  // I'm retrieving data from a collections "users" which I manually created on Firestore
  const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: "users/" });

  useEffect(() => {
    const demoFunctions = async () => {
      // Ensure that the access token is ready 
      if (!accessToken) {
        return;
      }

      // Import functions from Fitbit data component
      const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });

      try {
        // Observe the authentication state to get the current user's email
        const auth = getAuth();
        onAuthStateChanged(auth, (user) => {
          if (user) {
            setUserEmail(user.email);
          }
        });

        // Use FitBit UID as Firestore document ID to organize the users' data
        const UID = await getUID();
        console.log('UID:', UID); // demo
        setUID(UID); // demo

        // Data is in JSON. Here's some sample data
        const sampleData = {
          heartrate: 123,
          test: "test string",
        };

        // Examples of writing data to Firestore
        await addData(UID, await getProfile());
        await addData(UID, sampleData);

        // Get data from Firestore by UID
        getDataByDocID(UID).then((data) => {
          console.log('Data by UID:', data); // demo
          setUIDData(data); // demo
        });

        // Get all data from collection
        getAllData().then((data) => {
          console.log('All data from collection:', data); // demo
          setAllData(data); // demo
        });

      } catch (error) {
        console.error('Error in demoFunctions:', error);
      }
    };

    demoFunctions();
  }, [accessToken]);

  const handleSubmit = (e) => {
    // Call the provided onSubmit function with the input values
    e.preventDefault();
    addData(UID, { [arg1]: arg2 })
      .then(() => {
        // After successfully adding data, refresh the displayed data
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
      <p><b>UID: </b> {UID}</p>
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
import React, { useEffect, useState } from 'react';
import dbHandler from './backend/dbHandler';
import FitbitDataComponent from './fitbit/FitbitDataComponent';

/*
Recommended Reading:
- https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing
- https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises

Documentation:
- https://firebase.google.com/docs/firestore
- https://dev.fitbit.com/build/reference/web-api/
*/

function BackendDemo({ accessToken }) {
  // For demo purposes:
  const [UID, setUID] = useState("");
  const [allData, setAllData] = useState("");
  const [UIDData, setUIDData] = useState("");

  useEffect(() => {
    const demoFunctions = async () => {
      // Ensure that the access token is ready 
      if (!accessToken) {
        return;
      }

      // Import functions from Firestore db component
      // I'm retrieving data from a collections "users" which I manually greated on Firestore
      const { getAllData, getDataByDocID, addData } = dbHandler({ collectionName: "users/" });

      // Import functions from Fitbit data component
      const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });

      try {
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

  return (
    <div>
      <p><b>UID: </b> {UID}</p>
      <hr />
      <p><b>All data from collection: </b>{JSON.stringify(allData)}</p>
      <hr />
      <p><b>Data From UID {"(should be your data)"}: </b>{JSON.stringify(UIDData)}</p>
    </div>
  );
}

export default BackendDemo;

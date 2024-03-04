import React, { useEffect } from 'react';
import { getData, addData, getDataByUID } from './backend/dbHandler';
import FitbitDataComponent from './fitbit/FitbitDataComponent';

function BackendDemo({ accessToken }) {
  useEffect(() => {
    const { getProfile, getUID, getHeartRateTimeSeries } = FitbitDataComponent({ accessToken });

    const functionsRan = async () => {
      try {
        const UID = await getUID();
        getDataByUID(UID).then((data) => {
          console.log('Data by UID:', data);
        });

        const sampleData = {
          heartrate: 123,
        };

        // Assuming addData is an asynchronous function
        await addData(UID, await getProfile());

        console.log('UID:', UID);
      } catch (error) {
        console.error('Error in functionsRan:', error);
      }
    };

    functionsRan();
  }, [accessToken]);

  return (
    <div>
      {/* Display other content if needed */}
    </div>
  );
}

export default BackendDemo;

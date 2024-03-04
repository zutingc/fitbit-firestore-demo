import React, { useEffect, useState } from 'react';
import {getData, addData, getDataByUID} from './backend/dbHandler';


const FitbitDataComponent = () => {
    const [profile, setProfile] = useState('');
    const [heartrate, setHeartrate] = useState('');

    /************ Change for your app *************/
    const clientId = '23RRZN';
    const clientSecret = '7e745be34f33726d916933190c116bd9';
    const redirectUri = 'https://ssw322-app.web.app/'; // the redirectURL in FitBit app

    /*  ------------------------------ Authorization ------------------------------  */

    useEffect(() => {
        // Check if the authorization code is present in the URL
        const urlParams = new URLSearchParams(window.location.search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
            // Authorization code is present, handle it
            handleAuthorizationCode(authorizationCode);
        } else {
            // Authorization code is not present, initiate the authentication flow
            initiateAuthentication();
        }
    }, []);

    const initiateAuthentication = () => {
        const scope = 'activity+cardio_fitness+electrocardiogram+heartrate+location+nutrition+oxygen_saturation+profile+respiratory_rate+settings+sleep+social+temperature+weight'; /************* Add other scopes as needed *************/
        // Construct the Fitbit authorization URL
        const authorizationEndpoint = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

        // Redirect the user to the Fitbit authorization page
        window.location.href = authorizationEndpoint;
    };

    const handleAuthorizationCode = async (code) => {
        const tokenEndpoint = 'https://api.fitbit.com/oauth2/token';
        const body = new URLSearchParams({
            code: code,
            grant_type: 'authorization_code',
            client_id: clientId,
            redirect_uri: redirectUri,
        });

        try {
            const response = await fetch(tokenEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`, // Base64 encoded client_id:client_secret
                },
                body: body.toString(),
            });

            if (response.ok) {
                const data = await response.json();
                const accessToken = data.access_token;
                console.log(JSON.stringify(accessToken));
                console.log(accessToken);
                // Now you can use the access token to make requests to the Fitbit API
                functionsRan(accessToken);
            }
            else {
                console.error('Error exchanging authorization code for access token');
            }
        } catch (error) {
            console.error('Error during token exchange:', error);
        }
    };

    /*  ------------------------------ API Calls ------------------------------  */

    // functions called after the authorization is complete
    const functionsRan = async (accessToken) => {
        getProfile(accessToken);
        getHeartRateTimeSeries(accessToken, '2024-02-02', '1d'); // Adjust the date range as needed
        getData();
        const sampleData = {
            heartrate: 123,
            time: "yipppeeee!"
        }
        const UID = await getUID(accessToken);
        addData(UID, await getProfile(accessToken));
        console.log(await getDataByUID(UID))
    }

    const APIRequest = async (endpoint, requestHeaders) => {
        const response = await fetch(endpoint, requestHeaders);

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        } else {
            console.error('Error fetching Fitbit data');
        }
    }

    const getProfile = async (accessToken) => {
        const profileEndpoint = 'https://api.fitbit.com/1/user/-/profile.json';
        const profileHeaders = { 
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        };

        const profileData = await APIRequest(profileEndpoint, profileHeaders);
        setProfile(profileData);
        return profileData;
    };

    const getUID = async (accessToken) => {
        try {
            const profileData = await getProfile(accessToken);
            const fitbitUserID = profileData.user?.encodedId;
    
            if (fitbitUserID) {
                console.log('Fitbit User ID:', fitbitUserID);
                return fitbitUserID;
            } else {
                console.error('Fitbit User ID not found in profile data.');
                return null;
            }
        } catch (error) {
            console.error("Error fetching Fitbit profile data: ", error);
            return null;
        }
    };

    const getHeartRateTimeSeries = async (accessToken, date, period) => {
        const timeSeriesEndpoint = `https://api.fitbit.com/1/user/-/activities/heart/date/${date}/${period}.json`;
        const timeSeriesHeaders = {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        };

        setHeartrate(await APIRequest(timeSeriesEndpoint, timeSeriesHeaders));
    };

    return (
        <div>
        <h2>Hi {profile != "" ? profile.user.fullName : "World"}! 
        Your resting heartrate on {heartrate != "" ? heartrate?.['activities-heart'][0]?.dateTime : "YYYY-MM-DD"} is {heartrate != "" ? heartrate?.['activities-heart'][0]?.value.restingHeartRate : "???"} bpm
        </h2>
            <p>{JSON.stringify(profile)}</p>
            <hr></hr>
            <p>{JSON.stringify(heartrate)}</p>
        </div>
    )
};

export default FitbitDataComponent;

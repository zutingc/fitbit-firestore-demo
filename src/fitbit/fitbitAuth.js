/************ Change for your app *************/
const clientId = '23RRZN';
const clientSecret = '7e745be34f33726d916933190c116bd9';
const redirectUri = 'https://ssw322-app.web.app/'; // the redirectURL in FitBit app

/*  ------------------------------ Authorization ------------------------------  */

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
            return accessToken;
        }
        else {
            console.error('Error exchanging authorization code for access token');
        }
    } catch (error) {
        console.error('Error during token exchange:', error);
    }
};

export {initiateAuthentication, handleAuthorizationCode};
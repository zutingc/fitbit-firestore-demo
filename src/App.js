import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './pages/Login';
import BackendDemo from './pages/BackendDemo';
import firebaseConfig from './backend/firebaseConfig';
import { initializeApp } from 'firebase/app';
import { handleAuthorizationCode, initiateAuthentication } from './fitbit/fitbitAuth';

const app = initializeApp(firebaseConfig);

function App() {
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authorizationCode = urlParams.get('code');

    if (authorizationCode) {
      handleAuthorizationCode(authorizationCode)
        .then((token) => {
          setAccessToken(token);
        })
        .catch((error) => {
          console.error('Error handling authorization code:', error);
        });
    } else {
      initiateAuthentication();
    }
  }, []);


  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Login />} />
    //   </Routes>
    // </BrowserRouter>
    <div>
      <h1>Hello.</h1>
      <BackendDemo accessToken={accessToken}/>
    </div>
  );
}

export default App;
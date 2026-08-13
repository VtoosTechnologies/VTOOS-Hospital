import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyAI5-RhZ-KEYiX16Az-NRv71DU-90rKl7A",
    authDomain: "vtoos-hospital.firebaseapp.com",
    projectId: "vtoos-hospital",
    storageBucket: "vtoos-hospital.firebasestorage.app",
    messagingSenderId: "1069058372481",
    appId: "1:1069058372481:web:c825042b2c242e5fe5ee80"
};

const app = initializeApp(firebaseConfig);

export { app };

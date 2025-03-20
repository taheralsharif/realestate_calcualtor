const firebase = require('firebase/app');
require('firebase/database');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX",
    authDomain: "realestate-calculator-xxxxx.firebaseapp.com",
    databaseURL: "https://realestate-calculator-xxxxx-default-rtdb.firebaseio.com",
    projectId: "realestate-calculator-xxxxx",
    storageBucket: "realestate-calculator-xxxxx.appspot.com",
    messagingSenderId: "xxxxx",
    appId: "xxxxx"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// The Groq API key
const GROQ_API_KEY = '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';

// Store the API key in the database
async function storeApiKey() {
    try {
        await firebase.database().ref('config/groqApiKey').set(GROQ_API_KEY);
        console.log('API key stored successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error storing API key:', error);
        process.exit(1);
    }
}

storeApiKey(); 
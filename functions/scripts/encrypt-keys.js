const admin = require('firebase-admin');
const { encrypt } = require('../utils/encryption');
const serviceAccount = require('../service-account.json');

// Initialize Firebase Admin with service account
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://real-estate-calculator-3212e-default-rtdb.firebaseio.com'
});

const API_KEYS = {
    googleMaps: 'AIzaSyBHOgcVjW7Z0EQF_Qzl5gZXrriTT6xgaaM',
    groqApiKey: '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'
};

async function encryptAndUpdateKeys() {
    try {
        const database = admin.database();
        
        for (const [key, value] of Object.entries(API_KEYS)) {
            const encrypted = encrypt(value);
            await database.ref(key).set(encrypted);
            console.log(`Encrypted and updated ${key}`);
        }
        
        console.log('All API keys have been encrypted and updated successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error encrypting and updating API keys:', error);
        process.exit(1);
    }
}

encryptAndUpdateKeys(); 
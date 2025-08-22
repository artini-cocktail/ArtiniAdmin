/*
* Firebase configuration and initialization
* Path: src/services/firebase.js
* */
import { getAuth } from 'firebase/auth';
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: import.meta.env.FIREBASE_API_KEY,
    authDomain: import.meta.env.FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.FIREBASE_APP_ID,
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

export const auth = getAuth(app);

export const storage = getStorage(app);

export default app;
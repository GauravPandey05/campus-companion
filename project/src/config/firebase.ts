import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDblPay0HWzjt-3rmMguECjmTIOsM0LtGk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "clg-companion.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "clg-companion",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "clg-companion.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "34138446383",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:34138446383:web:69080989e0fcfd5fba84da",
  measurementId: "G-DTPQH48X42"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
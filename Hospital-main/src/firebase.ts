import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as analyticsIsSupported } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDtZ-TXz98HB6qDICYU-8PYAHXSEXckXbk',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lifeline-3f4e4.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lifeline-3f4e4',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lifeline-3f4e4.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1076441240521',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1076441240521:web:f42945bef9e2ad26c4ce18',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-XXXXXXXXXX',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const analyticsPromise = analyticsIsSupported().then((supported) => {
  return supported ? getAnalytics(app) : null;
});



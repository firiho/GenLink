import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app, 'africa-south1');

// Connect to emulators in development mode
const useEmulators = import.meta.env.VITE_USE_EMULATORS === 'true';

if (useEmulators) {
  console.log('🔧 Connecting to Firebase Emulators...');
  
  // Auth Emulator
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
  
  // Firestore Emulator
  connectFirestoreEmulator(db, 'localhost', 8080);
  
  // Storage Emulator
  connectStorageEmulator(storage, 'localhost', 9199);
  
  // Functions Emulator
  connectFunctionsEmulator(functions, 'localhost', 5001);
  
  console.log('✅ Connected to Firebase Emulators');
}
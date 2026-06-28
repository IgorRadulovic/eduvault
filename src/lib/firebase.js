// src/lib/firebase.js
// Firebase is initialized once here and exported.
// Import { auth } from '@/lib/firebase' wherever you need it.

import { initializeApp }                      from 'firebase/app';
import { getAuth, GoogleAuthProvider }        from 'firebase/auth';
import { getAnalytics, isSupported }          from 'firebase/analytics';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            ?? "AIzaSyDrHaXDx9J28j98vk9rQiR-0ohP3j5KtEQ",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        ?? "eduvault-9c8ec.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         ?? "eduvault-9c8ec",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     ?? "eduvault-9c8ec.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "259871598265",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             ?? "1:259871598265:web:3078b6db81c76dab195d68",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     ?? "G-6ESN8BC7YP",
};

// Initialize Firebase app (singleton)
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Google provider — configured once, reused everywhere
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');
// Always show the Google account picker even if already signed in
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Analytics — only in browser, not during SSR/build
isSupported().then(supported => {
  if (supported) getAnalytics(app);
});

export default app;

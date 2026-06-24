import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDksEsBF9Nyq94OjJ-rkW9HlfMQ0gEHnrw",
  authDomain: "traderkishann-e33ff.firebaseapp.com",
  projectId: "traderkishann-e33ff",
  storageBucket: "traderkishann-e33ff.firebasestorage.app",
  messagingSenderId: "228433487881",
  appId: "1:228433487881:web:5a30a8403ffa72370e30d8",
  measurementId: "G-VC5X65CRRN"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);

export let analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

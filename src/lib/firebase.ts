// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

// Firebase config using your actual project details from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!, // AIzaSyCSfA76VlTBL0DUXwTA40BvrqB3_R9j07E
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!, // spraycoat-dashboard.firebaseapp.com
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!, // spraycoat-dashboard
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!, // spraycoat-dashboard.firebasestorage.app
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!, // 850717237603
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!, // 1:850717237603:web:baba19329401aed99cb356
}

// Prevent duplicate initialization in Next.js dev mode
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)

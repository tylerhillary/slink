import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyBHIWxAFZz9gBEJ12XXF6QK53sY5BEfrVs",
  authDomain: "slink-website.firebaseapp.com",
  projectId: "slink-website",
  storageBucket: "slink-website.firebasestorage.app",
  messagingSenderId: "876458436291",
  appId: "1:876458436291:web:0aff5515ed8b5fdc156476",
  measurementId: "G-KPQSCM484L",
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const analyticsReady = isAnalyticsSupported()
  .then((supported) => (supported ? getAnalytics(app) : null))
  .catch(() => null);

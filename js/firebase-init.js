import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

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

// Analytics is deliberately not initialised here. Firebase Analytics sets
// cookies the moment it loads, which would break the promise made in the
// cookie policy. It is loaded by js/consent.js instead, and only after the
// visitor has actually agreed.

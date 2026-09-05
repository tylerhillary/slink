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

// ---------------------------------------------------------------------------
// App Check
//
// The registration form writes to Firestore as an anonymous visitor - there
// is no login, and there cannot be one, because asking people to make an
// account before they have seen a match would cost more registrations than it
// saved. That leaves the write path open to anyone with a script: thousands of
// junk registrations into the desk queue, a poisoned public directory, and a
// Firestore bill to match.
//
// App Check closes that. It proves a write came from this site, in a real
// browser, and the security rules can then refuse everything else.
//
// SETUP IS A TWO-STAGE ROLLOUT - see docs/app-check-setup.md. Put the
// reCAPTCHA site key below and deploy; the rules stay permissive while you
// confirm in the Firebase console that real traffic is arriving verified.
// Only then do you turn on enforcement. Doing it the other way round rejects
// every registration.
//
// This key is public by design - it identifies the site to reCAPTCHA and is
// meant to ship in client code. The secret half lives in the Firebase console.
// ---------------------------------------------------------------------------
const RECAPTCHA_SITE_KEY = "";

export const app = initializeApp(firebaseConfig);

if (RECAPTCHA_SITE_KEY) {
  try {
    // Loaded only when a key is configured, so the App Check bundle is not
    // downloaded by every visitor before it can do anything useful.
    const { initializeAppCheck, ReCaptchaV3Provider } = await import(
      "https://www.gstatic.com/firebasejs/12.7.0/firebase-app-check.js"
    );

    // Local development has no reCAPTCHA domain to verify against. This asks
    // the SDK to print a debug token to the console, which you register once
    // under App Check -> Apps -> Manage debug tokens.
    if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
      self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (error) {
    // Never let App Check failing take the registration form down with it.
    // While the rules are permissive this changes nothing; once they enforce,
    // this is the case the console's unverified-request count will show.
    console.warn("App Check could not start; continuing without it.", error);
  }
}

// Initialised after App Check so the first Firestore request already carries
// a token rather than racing it.
export const db = getFirestore(app);

// Analytics is deliberately not initialised here. Firebase Analytics sets
// cookies the moment it loads, which would break the promise made in the
// cookie policy. It is loaded by js/consent.js instead, and only after the
// visitor has actually agreed.

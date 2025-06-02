import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from './firebaseConfig';

let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined' && !getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} else if (getApps().length > 0) {
  app = getApps()[0];
  db = getFirestore(app);
  auth = getAuth(app);
}

// Ensure db and auth are exported, even if initialized late or on server (though client-side focus here)
// For server components, you might need a different initialization strategy or admin SDK.
// This setup is primarily for client-side Firebase.

export { db, auth, app as firebaseApp };

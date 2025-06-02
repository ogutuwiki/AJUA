
"use client";
import type { FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { firebaseApp, db as firestoreDb, auth as firebaseAuth } from '@/lib/firebase'; // Assuming firebase.ts exports these

interface FirebaseContextType {
  app: FirebaseApp | null;
  db: Firestore | null;
  auth: Auth | null;
}

const FirebaseContext = createContext<FirebaseContextType>({ app: null, db: null, auth: null });

export const useFirebase = () => useContext(FirebaseContext);

export const FirebaseProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [firebaseInstances, setFirebaseInstances] = useState<FirebaseContextType>({ app: null, db: null, auth: null });

  useEffect(() => {
    // firebaseApp, firestoreDb, firebaseAuth are initialized in firebase.ts
    // This check is mostly to ensure they are available before setting context
    if (firebaseApp && firestoreDb && firebaseAuth) {
      setFirebaseInstances({ app: firebaseApp, db: firestoreDb, auth: firebaseAuth });
    }
  }, []);
  
  // Render children only when Firebase is initialized to prevent errors
  if (!firebaseInstances.app) {
    return <div className="flex items-center justify-center min-h-screen bg-background text-foreground">Loading Firebase...</div>;
  }

  return (
    <FirebaseContext.Provider value={firebaseInstances}>
      {children}
    </FirebaseContext.Provider>
  );
};

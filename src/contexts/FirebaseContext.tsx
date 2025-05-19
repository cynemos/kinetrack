import React, { createContext, useContext } from 'react';
import { FirebaseApp } from 'firebase/app';
import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';

interface FirebaseContextType {
  app: FirebaseApp;
  db: Firestore;
  auth: Auth;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider: React.FC<FirebaseContextType & { children: React.ReactNode }> = ({ 
  app, 
  db, 
  auth, 
  children 
}) => {
  return (
    <FirebaseContext.Provider value={{ app, db, auth }}>
      {children}
    </FirebaseContext.Provider>
  );
};
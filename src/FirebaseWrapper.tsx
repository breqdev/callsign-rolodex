import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, User, getAuth, onAuthStateChanged } from "firebase/auth";
import { Firestore, getFirestore } from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

export const FirebaseContext = React.createContext<{
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null;
}>(null!);

export default function FirebaseWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { app, auth, db } = useMemo(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyAYvLgbDC1GhlcobSocdHCzScQuNBiI-R8",
      authDomain: "callsign-rolodex.firebaseapp.com",
      projectId: "callsign-rolodex",
      storageBucket: "callsign-rolodex.appspot.com",
      messagingSenderId: "892125981806",
      appId: "1:892125981806:web:1a625c4f9242b843a9ca7f",
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    return { app, auth, db };
  }, []);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // onAuthStateChanged returns an unsubscribe function
    return onAuthStateChanged(auth, setUser);
  }, [auth]);

  return (
    <FirebaseContext.Provider value={{ app, auth, db, user }}>
      {children}
    </FirebaseContext.Provider>
  );
}

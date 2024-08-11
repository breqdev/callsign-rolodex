import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, User, getAuth, onAuthStateChanged } from "firebase/auth";
import {
  Firestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";
import React, { useEffect, useMemo, useState } from "react";

export const FirebaseContext = React.createContext<{
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  user: User | null | undefined;
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
    const db = initializeFirestore(app, {
      ignoreUndefinedProperties: true,
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
      }),
    });

    const auth = getAuth(app);

    return { app, auth, db };
  }, []);

  const [user, setUser] = useState<User | null | undefined>(undefined);

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

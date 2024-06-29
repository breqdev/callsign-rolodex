import { useContext } from "react";
import AuthPage from "./AuthPage";
import Rolodex from "./Rolodex";
import { FirebaseContext } from "./FirebaseWrapper";

export default function App() {
  const { user } = useContext(FirebaseContext);

  if (user) {
    return <Rolodex />;
  } else {
    return <AuthPage />;
  }
}

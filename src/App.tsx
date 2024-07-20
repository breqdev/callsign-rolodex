import { useContext } from "react";
import AuthPage from "./AuthPage";
import Rolodex from "./Rolodex";
import { FirebaseContext } from "./FirebaseWrapper";
import SettingsProvider from "./Settings";

export default function App() {
  const { user } = useContext(FirebaseContext);

  if (user) {
    return (
      <SettingsProvider>
        <Rolodex />
      </SettingsProvider>
    );
  } else if (user === null) {
    return <AuthPage />;
  } else {
    return <div />;
  }
}

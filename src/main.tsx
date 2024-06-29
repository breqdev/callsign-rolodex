import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

import FirebaseWrapper from "./FirebaseWrapper.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <FirebaseWrapper>
      <App />
    </FirebaseWrapper>
  </React.StrictMode>
);

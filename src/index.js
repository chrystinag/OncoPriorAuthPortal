import React from "react";
import ReactDOM from "react-dom/client";
import App from "./pages/App";

const root = ReactDOM.createRoot(document.getElementById("root"));
import { AuthProvider } from "./AuthProvider";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);

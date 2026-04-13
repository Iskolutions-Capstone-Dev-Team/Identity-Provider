import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { clearLegacyRefreshTokenCookie } from "./auth/utils/authCookies";
import "./index.css";

clearLegacyRefreshTokenCookie();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
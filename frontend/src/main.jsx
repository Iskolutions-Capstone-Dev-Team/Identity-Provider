import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { clearLegacyRefreshTokenCookie } from "./auth/utils/authCookies";
import "./index.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";

clearLegacyRefreshTokenCookie();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TooltipProvider>
      <App />
      <Toaster />
    </TooltipProvider>
  </React.StrictMode>
);
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import AppProviders from "./context/AppProviders";
import { applySettings, getSettings } from "./utils/settings";
import "./css/app.css";
import "./css/dashboard.css";

applySettings(getSettings());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  </React.StrictMode>
);
import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AdminPanel from "./components/AdminPanel";
import { LangContext } from "./lib/i18n";
import "./index.css";

// Show the admin panel only when the URL has ?admin (e.g. localhost:5173/?admin).
// The public site never renders it.
const isAdmin = new URLSearchParams(window.location.search).has("admin");

function Root() {
  const [lang, setLang] = useState("en");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {isAdmin ? <AdminPanel /> : <App />}
    </LangContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

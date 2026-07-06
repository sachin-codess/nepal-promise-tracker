import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { LangContext } from "./lib/i18n";
import "./index.css";

function Root() {
  const [lang, setLang] = useState("en");
  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <App />
    </LangContext.Provider>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

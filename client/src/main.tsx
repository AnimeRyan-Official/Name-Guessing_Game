import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Load the desktop-specific renderer script
const desktopScript = document.createElement("script");
desktopScript.src = "/desktop-renderer.js";
desktopScript.async = true;
document.head.appendChild(desktopScript);

createRoot(document.getElementById("root")!).render(<App />);

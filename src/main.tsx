// Polyfill for Node.js globals needed by some libraries
import { Buffer } from "buffer/";

(globalThis as typeof globalThis & { global?: typeof globalThis }).global = globalThis;
(globalThis as typeof globalThis & { Buffer?: typeof Buffer }).Buffer = Buffer;

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);

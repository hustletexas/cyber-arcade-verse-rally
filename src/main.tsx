// Polyfill for Node.js globals needed by some libraries
import { Buffer } from 'buffer';

// @ts-ignore
window.global = window;
// @ts-ignore
window.Buffer = Buffer;

import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);

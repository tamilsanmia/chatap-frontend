import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Custom CSS for dark mode color and other tweaks

// src/index.js or src/App.js


createRoot(document.getElementById('root')).render(
 
    <App />
 
)

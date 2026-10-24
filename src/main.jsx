import '@fontsource/dm-sans/latin-400.css';
import '@fontsource/dm-sans/latin-500.css';
import '@fontsource/dm-sans/latin-600.css';
import '@fontsource/dm-sans/latin-700.css';
import '@fontsource/manrope/latin-600.css';
import '@fontsource/manrope/latin-700.css';
import '@fontsource/manrope/latin-800.css';
import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import './style.css';
createRoot(document.getElementById('root')).render(<App/>);
if('serviceWorker' in navigator && import.meta.env.PROD && !location.protocol.startsWith('file')) navigator.serviceWorker.register('./sw.js').catch(console.error);

import './branding.css';

import './features.css';

import './green.css';

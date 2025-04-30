import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@/styles/globals.css';

console.log('index.tsx: Starting to mount React application');
const rootElement = document.getElementById('root');
console.log('index.tsx: Root element found:', rootElement);

if (!rootElement) {
    throw new Error('Failed to find root element');
}

const root = createRoot(rootElement);
console.log('index.tsx: Created React root, about to render App');

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
console.log('index.tsx: Completed initial render');
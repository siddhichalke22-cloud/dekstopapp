import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
	throw new Error('Root element #root was not found in index.html');
}

createRoot(rootElement).render(
	<React.StrictMode>
		<HashRouter>
			<App />
		</HashRouter>
	</React.StrictMode>,
);

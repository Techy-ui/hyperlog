import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom'; // 👈 Use HashRouter
import App from './App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HashRouter> 
    <App />
  </HashRouter>
);
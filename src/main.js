// src/main.js (또는 index.js)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext'; // ⭐️ Import
import './styles.css'; // ⭐️ 공통 스타일 Import

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ⭐️ AuthProvider로 BrowserRouter를 감싸거나 그 반대로 해도 됩니다. */}
    <BrowserRouter>
      <AuthProvider> 
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
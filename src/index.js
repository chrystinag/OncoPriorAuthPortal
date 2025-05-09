import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './pages/App';
import Dashboard from './pages/Dashboard';
import SubmitPA from './pages/SubmitPA';
import Patients from './pages/Patients';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/submit" element={<SubmitPA />} />
      <Route path="/patients" element={<Patients />} />
    </Routes>
  </Router>
);
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard';
import SubmitPA from './SubmitPA';
import Patients from './Patients';
import Tasks from './Tasks';
import Sidebar from '../components/Sidebar';

const App = () => (
  <div style={{ display: 'flex' }}>
    <Sidebar />
    <div style={{ flex: 1, padding: '1rem' }}>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/submit" element={<SubmitPA />} />
        <Route path="/patients" element={<Patients />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </div>
  </div>
);
export default App;

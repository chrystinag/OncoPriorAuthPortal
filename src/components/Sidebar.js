import React from 'react';
import { Link } from 'react-router-dom';
const Sidebar = () => (
  <div style={{ width: '200px', padding: '1rem', background: '#f4f4f4', height: '100vh' }}>
    <h2>Stealth PA</h2>
    <nav>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/patients">Patients</Link></li>
        <li><Link to="/submit">Submit PA</Link></li>
        <li><Link to="/tasks">Tasks</Link></li>
      </ul>
    </nav>
  </div>
);
export default Sidebar;

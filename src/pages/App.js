import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Dashboard from "./Dashboard";
import SubmitPA from "./SubmitPA";
import Patients from "./Patients";
import Tasks from "./Tasks";
import Login from "./Login";
import Signup from "./Signup";
import Sidebar from "../components/Sidebar";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Authenticated Layout */}
        <Route
          path="*"
          element={
            <div style={{ display: "flex" }}>
              <Sidebar />
              <div style={{ flex: 1, padding: "1rem" }}>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/submit" element={<SubmitPA />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/tasks" element={<Tasks />} />
                </Routes>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

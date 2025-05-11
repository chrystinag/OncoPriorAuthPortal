import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./Home";
import Dashboard from "./Dashboard";
import SubmitPA from "./SubmitPA";
import Patients from "./Patients";
import Tasks from "./Tasks";
import Login from "./Login";
import Signup from "./Signup";
import MainLayout from "./MainLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Layout Routes */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitPA />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/tasks" element={<Tasks />} />
        </Route>
      </Routes>
    </Router>
  );
}

import Login from "./Login";
import Signup from "./Signup";
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./Dashboard";
import SubmitPA from "./SubmitPA";
import Patients from "./Patients";
import Tasks from "./Tasks";
import Sidebar from "../components/Sidebar";

const App = () => (
  <Router>
    <div style={{ display: "flex" }}>
      <Sidebar />
      <div style={{ flex: 1, padding: "1rem" }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/submit" element={<SubmitPA />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </div>
  </Router>
);

export default App;

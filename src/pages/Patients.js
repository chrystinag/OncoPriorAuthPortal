
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from("patients").select("*");

      if (error) {
        console.error("Error loading patients:", error.message);
      } else {
        setPatients(data);
      }

      setLoading(false);
    };

    fetchPatients();
  }, []);

  return (
    <div>
      <h1>Patient Records</h1>
      {loading ? (
        <p>Loading patients...</p>
      ) : patients.length === 0 ? (
        <p>No patients found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>DOB</th>
              <th>Diagnosis</th>
              <th>Insurance</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <Link to={`/patients/${patient.id}`}>{patient.name}</Link>
                </td>
                <td>{patient.dob}</td>
                <td>{patient.diagnosis}</td>
                <td>{patient.insurance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}


import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function Dashboard() {
  const [paRequests, setPARequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  useEffect(() => {
    const fetchPAs = async () => {
      const { data, error } = await supabase
        .from("pa_requests")
        .select("*, patients(*)")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error loading PA requests:", error.message);
      } else {
        setPARequests(data || []);

        const counts = data.reduce((acc, item) => {
          const status = item.status || "Submitted";
          acc[status] = (acc[status] || 0) + 1;
          return acc;
        }, {});
        setStatusCounts(counts);
      }
    };

    fetchPAs();
  }, []);

  const statusList = ["Submitted", "Pending", "P2P Requested", "Approved", "Denied"];

  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        {statusList.map((status) => (
          <div key={status} style={{ padding: "1rem", background: "#f4f4f4", borderRadius: "8px", flex: 1 }}>
            <h4>{status}</h4>
            <p style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{statusCounts[status] || 0}</p>
          </div>
        ))}
      </div>

      <h2>Recent PA Requests</h2>
      {paRequests.length === 0 ? (
        <p>No prior auths found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Status</th>
              <th>Notes</th>
              <th>Document</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {paRequests.map((pa) => (
              <tr key={pa.id}>
                <td>
                  <Link to={`/patients/${pa.patient_id}`}>
                    {pa.patients?.name || "Unknown"}
                  </Link>
                </td>
                <td>{pa.status || "Submitted"}</td>
                <td>{pa.notes?.slice(0, 40)}...</td>
                <td>
                  {pa.document_url ? (
                    <a href={pa.document_url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
                <td>{new Date(pa.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [notes, setNotes] = useState([]);
  const [paRequests, setPARequests] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const { data: patientData } = await supabase
          .from("patients")
          .select("*")
          .eq("id", id)
          .single();

        const { data: noteData } = await supabase
          .from("notes")
          .select("*")
          .eq("patient_id", id);

        const { data: paData } = await supabase
          .from("pa_requests")
          .select("*")
          .eq("patient_id", id);

        setPatient(patientData);
        setNotes(noteData || []);
        setPARequests(paData || []);
      } catch (err) {
        console.error("Error fetching patient details:", err);
      }
      setLoading(false);
    };

    fetchDetails();
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from("notes").insert([{ patient_id: id, content: newNote }]);
    const { data: updatedNotes } = await supabase
      .from("notes")
      .select("*")
      .eq("patient_id", id);
    setNotes(updatedNotes);
    setNewNote("");
  };

  if (loading) return <p>Loading...</p>;
  if (!patient) return <p>Patient not found.</p>;

  return (
    <div>
      <h2>{patient.name}</h2>
      <p>DOB: {patient.dob}</p>
      <p>Diagnosis: {patient.diagnosis}</p>
      <p>Insurance: {patient.insurance}</p>

      <h3>Notes</h3>
      <textarea
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a note"
      />
      <button onClick={addNote}>Save Note</button>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            <strong>Note:</strong> {note.content}
          </li>
        ))}
      </ul>

      <h3>Prior Auth Submissions</h3>
      <ul>
        {paRequests.map((pa) => (
          <li key={pa.id}>
            <div>
              <strong>Status:</strong> {pa.status || "Submitted"}
              <select
                value={pa.status || "Submitted"}
                onChange={async (e) => {
                  await supabase
                    .from("pa_requests")
                    .update({ status: e.target.value })
                    .eq("id", pa.id);
                  const { data: updated } = await supabase
                    .from("pa_requests")
                    .select("*")
                    .eq("patient_id", id);
                  setPARequests(updated);
                }}
              >
                <option value="Submitted">Submitted</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="P2P Requested">P2P Requested</option>
                <option value="Denied">Denied</option>
              </select>
            </div>
            <p>{pa.notes}</p>
            {pa.document_url && (
              <a href={pa.document_url} target="_blank" rel="noreferrer">View Document</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

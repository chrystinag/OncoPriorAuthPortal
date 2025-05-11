
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

  useEffect(() => {
    const fetchDetails = async () => {
      const { data: patientData } = await supabase.from("patients").select("*").eq("id", id).single();
      const { data: noteData } = await supabase.from("notes").select("*").eq("patient_id", id).order("created_at", { ascending: false });
      const { data: paData } = await supabase.from("pa_requests").select("*").eq("patient_id", id).order("created_at", { ascending: false });

      setPatient(patientData);
      setNotes(noteData || []);
      setPARequests(paData || []);
    };

    fetchDetails();
  }, [id]);

  const addNote = async () => {
    if (!newNote.trim()) return;
    await supabase.from("notes").insert([{ patient_id: id, content: newNote }]);
    setNewNote("");
    const { data: updatedNotes } = await supabase.from("notes").select("*").eq("patient_id", id).order("created_at", { ascending: false });
    setNotes(updatedNotes);
  };

  if (!patient) return <p>Loading patient details...</p>;

  return (
    <div>
      <h2>{patient.name}</h2>
      <p>DOB: {patient.dob}</p>
      <p>Diagnosis: {patient.diagnosis}</p>
      <p>Insurance: {patient.insurance}</p>

      <h3>Clinical Notes</h3>
      <div>
        <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add a note" />
        <button onClick={addNote}>Save Note</button>
      </div>
      <ul>
        {notes.map(note => (
          <li key={note.id}>
            <strong>{new Date(note.created_at).toLocaleString()}:</strong> {note.content}
          </li>
        ))}
      </ul>

      <h3>PA Submission History</h3>
      <ul>
        {paRequests.map(pa => (
          <li key={pa.id}>
            <p><strong>{new Date(pa.created_at).toLocaleString()}</strong> - {pa.status}</p>
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

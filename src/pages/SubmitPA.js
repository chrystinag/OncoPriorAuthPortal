import React, { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function SubmitPA() {
  const [formData, setFormData] = useState({
    name: "",
    dob: "",
    diagnosis: "",
    insurance: "",
    notes: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const patientRes = await supabase
        .from("patients")
        .insert([{ ...formData }])
        .select()
        .single();

      if (!patientRes.data) throw new Error("Error creating patient");

      let fileURL = null;
      if (file) {
        const filePath = `${patientRes.data.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicURL } = supabase.storage
          .from("documents")
          .getPublicUrl(filePath);
        fileURL = publicURL.publicUrl;
      }

      const paRes = await supabase.from("pa_requests").insert([
        {
          patient_id: patientRes.data.id,
          notes: formData.notes,
          document_url: fileURL
        }
      ]);

      if (paRes.error) throw paRes.error;

      setMessage("Prior Auth submitted successfully!");
      setFormData({
        name: "",
        dob: "",
        diagnosis: "",
        insurance: "",
        notes: ""
      });
      setFile(null);
    } catch (error) {
      console.error(error);
      setMessage("Submission failed. Check console.");
    }

    setUploading(false);
  };

  return (
    <div>
      <h1>Submit Prior Authorization</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Patient Name" value={formData.name} onChange={handleChange} required />
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        <input name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleChange} />
        <input name="insurance" placeholder="Insurance" value={formData.insurance} onChange={handleChange} />
        <textarea name="notes" placeholder="Clinical Notes" value={formData.notes} onChange={handleChange} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" disabled={uploading}>
          {uploading ? "Submitting..." : "Submit Prior Auth"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

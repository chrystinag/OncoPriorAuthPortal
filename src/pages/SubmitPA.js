
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
    setMessage("");

    try {
      if (!formData.name || !formData.dob || !formData.insurance) {
        setMessage("Name, DOB, and Insurance are required.");
        setUploading(false);
        return;
      }

      const patientData = {
        name: formData.name,
        dob: formData.dob,
        diagnosis: formData.diagnosis || "",
        insurance: formData.insurance
      };

      const { data: newPatient, error: patientError } = await supabase
        .from("patients")
        .insert([patientData])
        .select()
        .single();

      if (patientError) {
        throw new Error("Error creating patient: " + patientError.message);
      }

      let fileURL = null;
      if (file) {
        const filePath = `${newPatient.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage
          .from("documents")
          .upload(filePath, file);

        if (uploadError) {
          console.error("File upload error:", uploadError.message);
        } else {
          const { data: publicURL } = supabase.storage
            .from("documents")
            .getPublicUrl(filePath);
          fileURL = publicURL?.publicUrl || null;
        }
      }

      const paData = {
        patient_id: newPatient.id,
        notes: formData.notes || "",
        document_url: fileURL
      };

      const { error: paError } = await supabase
        .from("pa_requests")
        .insert([paData]);

      if (paError) {
        throw new Error("Error creating PA request: " + paError.message);
      }

      setMessage("✅ Prior Auth submitted successfully.");
      setFormData({ name: "", dob: "", diagnosis: "", insurance: "", notes: "" });
      setFile(null);
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Submission failed.");
    }

    setUploading(false);
  };

  return (
    <div>
      <h1>Submit Prior Authorization</h1>
      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Patient Name *" value={formData.name} onChange={handleChange} required />
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        <input name="diagnosis" placeholder="Diagnosis" value={formData.diagnosis} onChange={handleChange} />
        <input name="insurance" placeholder="Insurance *" value={formData.insurance} onChange={handleChange} required />
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

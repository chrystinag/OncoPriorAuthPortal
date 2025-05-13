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
    sex: "",
    insurance: "",
    primary_dx: "",
    secondary_dx: "",
    jcodes: "",
    height: "",
    weight: "",
    frequency: "",
    dosing: "",
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
      const { name, dob, insurance } = formData;
      if (!name || !dob || !insurance) {
        setMessage("Name, DOB, and Insurance are required.");
        setUploading(false);
        return;
      }

      const { data: patient, error: patientError } = await supabase
        .from("patients")
        .insert([formData])
        .select()
        .single();

      if (patientError) throw new Error("Error creating patient: " + patientError.message);

      let fileURL = null;
      if (file) {
        const path = `${patient.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
          fileURL = urlData?.publicUrl;
        }
      }

      const { error: paError } = await supabase.from("pa_requests").insert([{
        patient_id: patient.id,
        notes: formData.notes,
        document_url: fileURL
      }]);

      if (paError) throw new Error("Error saving PA: " + paError.message);

      setMessage("✅ Prior Auth submitted.");
      setFormData({
        name: "", dob: "", sex: "", insurance: "",
        primary_dx: "", secondary_dx: "", jcodes: "",
        height: "", weight: "", frequency: "", dosing: "", notes: ""
      });
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
        <h3>Member Demographics</h3>
        <input name="name" placeholder="Patient Name *" value={formData.name} onChange={handleChange} required />
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} required />
        <input name="sex" placeholder="Sex (M/F)" value={formData.sex} onChange={handleChange} />
        <input name="insurance" placeholder="Insurance *" value={formData.insurance} onChange={handleChange} required />

        <h3>Clinical Information</h3>
        <input name="primary_dx" placeholder="Primary Diagnosis Code" value={formData.primary_dx} onChange={handleChange} />
        <input name="secondary_dx" placeholder="Secondary Diagnosis Code(s)" value={formData.secondary_dx} onChange={handleChange} />
        <input name="jcodes" placeholder="J-Codes / Drug Codes" value={formData.jcodes} onChange={handleChange} />
        <input name="height" placeholder="Height (inches)" value={formData.height} onChange={handleChange} />
        <input name="weight" placeholder="Weight (lbs)" value={formData.weight} onChange={handleChange} />
        <input name="frequency" placeholder="Treatment Frequency (e.g., weekly)" value={formData.frequency} onChange={handleChange} />
        <input name="dosing" placeholder="Dosing Instructions" value={formData.dosing} onChange={handleChange} />

        <textarea name="notes" placeholder="Additional Clinical Notes" value={formData.notes} onChange={handleChange} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" disabled={uploading}>
          {uploading ? "Submitting..." : "Submit Prior Auth"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

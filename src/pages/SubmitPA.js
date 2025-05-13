import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function SubmitPA() {
  const [formData, setFormData] = useState({
    contact_name: "",
    contact_phone: "",
    contact_fax: "",
    first_name: "",
    last_name: "",
    dob: "",
    member_id: "",
    insurance: "",
    sex: "",
    height: "",
    weight: "",
    bsa: "",
    primary_dx: "",
    secondary_dx: [""],
    treatments: [{
      jcode: "",
      drug_name: "",
      route: "",
      dose: "",
      frequency: "",
      schedule: "",
      indication: "",
      delivery: ""
    }],
    ordering_provider: "",
    ordering_npi: "",
    ordering_tin: "",
    treating_provider: "",
    treating_npi: "",
    treating_tin: "",
    site_name: "",
    site_npi: "",
    site_tin: "",
    notes: ""
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const height = parseFloat(formData.height);
    const weight = parseFloat(formData.weight);
    if (height && weight) {
      const bsa = Math.sqrt((height * weight) / 3600).toFixed(2);
      setFormData((prev) => ({ ...prev, bsa }));
    }
  }, [formData.height, formData.weight]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSecondaryDxChange = (index, value) => {
    const updated = [...formData.secondary_dx];
    updated[index] = value;
    setFormData({ ...formData, secondary_dx: updated });
  };

  const addSecondaryDx = () => {
    setFormData({ ...formData, secondary_dx: [...formData.secondary_dx, ""] });
  };

  const handleTreatmentChange = (index, field, value) => {
    const updated = [...formData.treatments];
    updated[index][field] = value;
    setFormData({ ...formData, treatments: updated });
  };

  const addTreatment = () => {
    setFormData({
      ...formData,
      treatments: [...formData.treatments, {
        jcode: "", drug_name: "", route: "", dose: "",
        frequency: "", schedule: "", indication: "", delivery: ""
      }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    try {
      const patientData = {
        ...formData,
        secondary_dx: formData.secondary_dx.filter((dx) => dx.trim() !== ""),
        treatments: JSON.stringify(formData.treatments)
      };

      const { data: patient, error } = await supabase
        .from("patients")
        .insert([patientData])
        .select()
        .single();

      if (error) throw new Error("Submission failed: " + error.message);

      let fileURL = null;
      if (file) {
        const path = `${patient.id}/${file.name}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("documents").getPublicUrl(path);
          fileURL = urlData?.publicUrl;
        }
      }

      await supabase.from("pa_requests").insert([{
        patient_id: patient.id,
        document_url: fileURL,
        notes: formData.notes
      }]);

      setMessage("✅ Prior Authorization submitted.");
    } catch (err) {
      console.error(err);
      setMessage(err.message || "Submission error.");
    }

    setUploading(false);
  };

  return (
    <div>
      <h1>Submit Prior Authorization</h1>
      <form onSubmit={handleSubmit}>
        <h3>📞 Contact Info</h3>
        <input name="contact_name" placeholder="Contact Name" value={formData.contact_name} onChange={handleChange} />
        <input name="contact_phone" placeholder="Phone Number" value={formData.contact_phone} onChange={handleChange} />
        <input name="contact_fax" placeholder="Fax Number" value={formData.contact_fax} onChange={handleChange} />

        <h3>👤 Patient Information</h3>
        <input name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} />
        <input name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} />
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
        <input name="member_id" placeholder="Member ID" value={formData.member_id} onChange={handleChange} />
        <input name="insurance" placeholder="Insurance" value={formData.insurance} onChange={handleChange} />
        <input name="sex" placeholder="Sex" value={formData.sex} onChange={handleChange} />
        <input name="height" placeholder="Height (inches)" value={formData.height} onChange={handleChange} />
        <input name="weight" placeholder="Weight (lbs)" value={formData.weight} onChange={handleChange} />
        <input name="bsa" placeholder="BSA (auto-calculated)" value={formData.bsa} readOnly />

        <h4>Diagnosis</h4>
        <input name="primary_dx" placeholder="Primary ICD Code" value={formData.primary_dx} onChange={handleChange} required />
        {formData.secondary_dx.map((dx, idx) => (
          <input key={idx} placeholder="Secondary ICD Code" value={dx} onChange={(e) => handleSecondaryDxChange(idx, e.target.value)} />
        ))}
        <button type="button" onClick={addSecondaryDx}>+ Add Secondary Diagnosis</button>

        <h3>💊 Treatment Plan</h3>
        {formData.treatments.map((treat, idx) => (
          <div key={idx} style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}>
            <input placeholder="J-Code" value={treat.jcode} onChange={(e) => handleTreatmentChange(idx, "jcode", e.target.value)} />
            <input placeholder="Drug Name" value={treat.drug_name} onChange={(e) => handleTreatmentChange(idx, "drug_name", e.target.value)} />
            <select value={treat.route} onChange={(e) => handleTreatmentChange(idx, "route", e.target.value)}>
              <option value="">Select Route</option>
              <option value="IV">IV</option>
              <option value="Oral">Oral</option>
            </select>
            <input placeholder="Dose" value={treat.dose} onChange={(e) => handleTreatmentChange(idx, "dose", e.target.value)} />
            <input placeholder="Frequency" value={treat.frequency} onChange={(e) => handleTreatmentChange(idx, "frequency", e.target.value)} />
            <input placeholder="Schedule" value={treat.schedule} onChange={(e) => handleTreatmentChange(idx, "schedule", e.target.value)} />
            <input placeholder="Indication" value={treat.indication} onChange={(e) => handleTreatmentChange(idx, "indication", e.target.value)} />
            <select value={treat.delivery} onChange={(e) => handleTreatmentChange(idx, "delivery", e.target.value)}>
              <option value="">Buy & Bill or Specialty</option>
              <option value="Buy & Bill">Buy & Bill</option>
              <option value="Specialty Pharmacy">Specialty Pharmacy</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={addTreatment}>+ Add Treatment Line</button>

        <h3>👨‍⚕️ Provider Info</h3>
        <input name="ordering_provider" placeholder="Ordering Provider" value={formData.ordering_provider} onChange={handleChange} />
        <input name="ordering_npi" placeholder="Ordering NPI" value={formData.ordering_npi} onChange={handleChange} />
        <input name="ordering_tin" placeholder="Ordering TIN" value={formData.ordering_tin} onChange={handleChange} />
        <input name="treating_provider" placeholder="Treating Provider (optional)" value={formData.treating_provider} onChange={handleChange} />
        <input name="treating_npi" placeholder="Treating NPI" value={formData.treating_npi} onChange={handleChange} />
        <input name="treating_tin" placeholder="Treating TIN" value={formData.treating_tin} onChange={handleChange} />
        <input name="site_name" placeholder="Treatment Site Name" value={formData.site_name} onChange={handleChange} />
        <input name="site_npi" placeholder="Site NPI" value={formData.site_npi} onChange={handleChange} />
        <input name="site_tin" placeholder="Site TIN" value={formData.site_tin} onChange={handleChange} />

        <h3>📎 Attachments + Notes</h3>
        <textarea name="notes" placeholder="Clinical Notes" value={formData.notes} onChange={handleChange} />
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        <br />
        <button type="submit" disabled={uploading}>
          {uploading ? "Submitting..." : "Submit Prior Authorization"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

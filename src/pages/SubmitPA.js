import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://wzenvycwzxitcmusaxak.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZW52eWN3enhpdGNtdXNheGFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyNDMzNjgsImV4cCI6MjA2MTgxOTM2OH0.sbrjDCHlvPPKQkkHdF63lvDkWuCXKPD2gI3zPOdzYRo"
);

export default function SubmitPA() {
  const [formData, setFormData] = useState({
    contact_name: "", contact_phone: "", contact_fax: "",
    first_name: "", last_name: "", dob: "", member_id: "",
    insurance: "", sex: "", height: "", weight: "", bsa: "",
    primary_dx: "", secondary_dx: [""],
    chemoTreatments: [{ jcode: "", drug_name: "", route: "", dose: "", dosing_schedule: "", indication: "", delivery: "" }],
    supportiveTreatments: [{ jcode: "", drug_name: "", route: "", dose: "", dosing_schedule: "", indication: "", delivery: "" }],
    ordering_provider: "", ordering_npi: "", ordering_tin: "",
    treating_provider: "", treating_npi: "", treating_tin: "",
    site_name: "", site_npi: "", site_tin: "", notes: ""
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleSecondaryDxChange = (index, value) => {
    const updated = [...formData.secondary_dx];
    updated[index] = value;
    setFormData({ ...formData, secondary_dx: updated });
  };
  const addSecondaryDx = () => setFormData({ ...formData, secondary_dx: [...formData.secondary_dx, ""] });
  const handleTreatmentChange = (section, index, field, value) => {
    const updated = [...formData[section]];
    updated[index][field] = value;
    setFormData({ ...formData, [section]: updated });
  };
  const addTreatment = (section) => {
    const blank = { jcode: "", drug_name: "", route: "", dose: "", dosing_schedule: "", indication: "", delivery: "" };
    setFormData({ ...formData, [section]: [...formData[section], blank] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMessage("");

    try {
      const patientData = {
        ...formData,
        secondary_dx: formData.secondary_dx.filter((dx) => dx.trim() !== ""),
        chemoTreatments: JSON.stringify(formData.chemoTreatments),
        supportiveTreatments: JSON.stringify(formData.supportiveTreatments),
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
        notes: formData.notes,
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
        {["contact_name", "contact_phone", "contact_fax"].map(field => (
          <div key={field} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label>{field.replaceAll("_", " ").toUpperCase()}</label>
            <input name={field} value={formData[field]} onChange={handleChange} />
          </div>
        ))}

        <h3>👤 Patient Information</h3>
        {["first_name", "last_name", "dob", "member_id", "insurance", "sex", "height", "weight", "bsa"].map(field => (
          <div key={field} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label>{field.replaceAll("_", " ").toUpperCase()}</label>
            <input
              name={field}
              value={formData[field]}
              onChange={handleChange}
              {...(field === "dob" ? { type: "date" } : {})}
              {...(field === "bsa" ? { readOnly: true } : {})}
            />
          </div>
        ))}

        <h4>Diagnosis</h4>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
          <label>Primary ICD Code *</label>
          <input name="primary_dx" value={formData.primary_dx} onChange={handleChange} required />
        </div>
        {formData.secondary_dx.map((dx, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label>Secondary ICD Code</label>
            <input value={dx} onChange={(e) => handleSecondaryDxChange(idx, e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addSecondaryDx}>+ Add Secondary Diagnosis</button>

        <h3>💊 Chemotherapy</h3>
        {formData.chemoTreatments.map((t, i) => (
          <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            {["jcode", "drug_name", "dose", "dosing_schedule", "indication"].map(field => (
              <div key={field} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                <label>{field.replaceAll("_", " ").toUpperCase()}</label>
                <input value={t[field]} onChange={(e) => handleTreatmentChange("chemoTreatments", i, field, e.target.value)} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
              <label>Route</label>
              <select value={t.route} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "route", e.target.value)}>
                <option value="">Select</option>
                <option value="IV">IV</option>
                <option value="Oral">Oral</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
              <label>Delivery Method</label>
              <select value={t.delivery} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "delivery", e.target.value)}>
                <option value="">Select</option>
                <option value="Buy & Bill">Buy & Bill</option>
                <option value="Specialty Pharmacy">Specialty Pharmacy</option>
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addTreatment("chemoTreatments")}>+ Add Chemo</button>
        <h3>💉 Supportive Medications</h3>
        {formData.supportiveTreatments.map((t, i) => (
          <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            {["jcode", "drug_name", "dose", "dosing_schedule", "indication"].map(field => (
              <div key={field} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
                <label>{field.replaceAll("_", " ").toUpperCase()}</label>
                <input value={t[field]} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, field, e.target.value)} />
              </div>
            ))}
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
              <label>Route</label>
              <select value={t.route} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "route", e.target.value)}>
                <option value="">Select</option>
                <option value="IV">IV</option>
                <option value="Oral">Oral</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
              <label>Delivery Method</label>
              <select value={t.delivery} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "delivery", e.target.value)}>
                <option value="">Select</option>
                <option value="Buy & Bill">Buy & Bill</option>
                <option value="Specialty Pharmacy">Specialty Pharmacy</option>
              </select>
            </div>
          </div>
        ))}
        <button type="button" onClick={() => addTreatment("supportiveTreatments")}>+ Add Supportive Med</button>

        <h3>👨‍⚕️ Provider Info</h3>
        {["ordering_provider", "ordering_npi", "ordering_tin", "treating_provider", "treating_npi", "treating_tin", "site_name", "site_npi", "site_tin"].map(field => (
          <div key={field} style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
            <label>{field.replaceAll("_", " ").toUpperCase()}</label>
            <input name={field} value={formData[field]} onChange={handleChange} />
          </div>
        ))}

        <h3>📎 Attachments + Notes</h3>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
          <label>Clinical Notes</label>
          <textarea name="notes" value={formData.notes} onChange={handleChange} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", marginBottom: "10px" }}>
          <label>File Upload</label>
          <input type="file" onChange={(e) => setFile(e.target.files[0])} />
        </div>

        <button type="submit" disabled={uploading}>
          {uploading ? "Submitting..." : "Submit Prior Authorization"}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

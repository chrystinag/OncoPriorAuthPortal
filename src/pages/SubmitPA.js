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
    chemoTreatments: [
      {
        jcode: "",
        drug_name: "",
        route: "",
        dose: "",
        frequency: "",
        schedule: "",
        indication: "",
        delivery: "",
      },
    ],
    supportiveTreatments: [
      {
        jcode: "",
        drug_name: "",
        route: "",
        dose: "",
        frequency: "",
        schedule: "",
        indication: "",
        delivery: "",
      },
    ],
    ordering_provider: "",
    ordering_npi: "",
    ordering_tin: "",
    treating_provider: "",
    treating_npi: "",
    treating_tin: "",
    site_name: "",
    site_npi: "",
    site_tin: "",
    notes: "",
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

  const handleTreatmentChange = (section, index, field, value) => {
    const updated = [...formData[section]];
    updated[index][field] = value;
    setFormData({ ...formData, [section]: updated });
  };

  const addTreatment = (section) => {
    const blank = {
      jcode: "",
      drug_name: "",
      route: "",
      dose: "",
      frequency: "",
      schedule: "",
      indication: "",
      delivery: "",
    };
    setFormData({
      ...formData,
      [section]: [...formData[section], blank],
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
        <label>Contact Name</label>
        <input name="contact_name" value={formData.contact_name} onChange={handleChange} />
        <label>Phone Number</label>
        <input name="contact_phone" value={formData.contact_phone} onChange={handleChange} />
        <label>Fax Number</label>
        <input name="contact_fax" value={formData.contact_fax} onChange={handleChange} />

        <h3>👤 Patient Information</h3>
        <label>First Name</label>
        <input name="first_name" value={formData.first_name} onChange={handleChange} />
        <label>Last Name</label>
        <input name="last_name" value={formData.last_name} onChange={handleChange} />
        <label>Date of Birth</label>
        <input name="dob" type="date" value={formData.dob} onChange={handleChange} />
        <label>Member ID</label>
        <input name="member_id" value={formData.member_id} onChange={handleChange} />
        <label>Insurance</label>
        <input name="insurance" value={formData.insurance} onChange={handleChange} />
        <label>Sex</label>
        <input name="sex" value={formData.sex} onChange={handleChange} />
        <label>Height (inches)</label>
        <input name="height" value={formData.height} onChange={handleChange} />
        <label>Weight (lbs)</label>
        <input name="weight" value={formData.weight} onChange={handleChange} />
        <label>BSA (auto)</label>
        <input name="bsa" value={formData.bsa} readOnly />

        <h4>Diagnosis</h4>
        <label>Primary ICD Code *</label>
        <input name="primary_dx" value={formData.primary_dx} onChange={handleChange} required />
        {formData.secondary_dx.map((dx, idx) => (
          <div key={idx}>
            <label>Secondary ICD Code</label>
            <input value={dx} onChange={(e) => handleSecondaryDxChange(idx, e.target.value)} />
          </div>
        ))}
        <button type="button" onClick={addSecondaryDx}>+ Add Secondary Diagnosis</button>

        <h3>💊 Chemotherapy</h3>
        {formData.chemoTreatments.map((t, i) => (
          <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <label>J-Code</label>
            <input value={t.jcode} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "jcode", e.target.value)} />
            <label>Drug Name</label>
            <input value={t.drug_name} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "drug_name", e.target.value)} />
            <label>Route</label>
            <select value={t.route} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "route", e.target.value)}>
              <option value="">Select</option>
              <option value="IV">IV</option>
              <option value="Oral">Oral</option>
            </select>
            <label>Dose</label>
            <input value={t.dose} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "dose", e.target.value)} />
            <label>Frequency</label>
            <input value={t.frequency} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "frequency", e.target.value)} />
            <label>Schedule</label>
            <input value={t.schedule} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "schedule", e.target.value)} />
            <label>Indication</label>
            <input value={t.indication} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "indication", e.target.value)} />
            <label>Delivery Method</label>
            <select value={t.delivery} onChange={(e) => handleTreatmentChange("chemoTreatments", i, "delivery", e.target.value)}>
              <option value="">Select</option>
              <option value="Buy & Bill">Buy & Bill</option>
              <option value="Specialty Pharmacy">Specialty Pharmacy</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={() => addTreatment("chemoTreatments")}>+ Add Chemo</button>
        <h3>💉 Supportive Medications</h3>
        {formData.supportiveTreatments.map((t, i) => (
          <div key={i} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
            <label>J-Code</label>
            <input value={t.jcode} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "jcode", e.target.value)} />
            <label>Drug Name</label>
            <input value={t.drug_name} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "drug_name", e.target.value)} />
            <label>Route</label>
            <select value={t.route} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "route", e.target.value)}>
              <option value="">Select</option>
              <option value="IV">IV</option>
              <option value="Oral">Oral</option>
            </select>
            <label>Dose</label>
            <input value={t.dose} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "dose", e.target.value)} />
            <label>Frequency</label>
            <input value={t.frequency} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "frequency", e.target.value)} />
            <label>Schedule</label>
            <input value={t.schedule} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "schedule", e.target.value)} />
            <label>Indication</label>
            <input value={t.indication} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "indication", e.target.value)} />
            <label>Delivery Method</label>
            <select value={t.delivery} onChange={(e) => handleTreatmentChange("supportiveTreatments", i, "delivery", e.target.value)}>
              <option value="">Select</option>
              <option value="Buy & Bill">Buy & Bill</option>
              <option value="Specialty Pharmacy">Specialty Pharmacy</option>
            </select>
          </div>
        ))}
        <button type="button" onClick={() => addTreatment("supportiveTreatments")}>+ Add Supportive Med</button>

        <h3>👨‍⚕️ Provider Info</h3>
        <label>Ordering Provider</label>
        <input name="ordering_provider" value={formData.ordering_provider} onChange={handleChange} />
        <label>Ordering NPI</label>
        <input name="ordering_npi" value={formData.ordering_npi} onChange={handleChange} />
        <label>Ordering TIN</label>
        <input name="ordering_tin" value={formData.ordering_tin} onChange={handleChange} />
        <label>Treating Provider (optional)</label>
        <input name="treating_provider" value={formData.treating_provider} onChange={handleChange} />
        <label>Treating NPI</label>
        <input name="treating_npi" value={formData.treating_npi} onChange={handleChange} />
        <label>Treating TIN</label>
        <input name="treating_tin" value={formData.treating_tin} onChange={handleChange} />
        <label>Treatment Site Name</label>
        <input name="site_name" value={formData.site_name} onChange={handleChange} />
        <label>Site NPI</label>
        <input name="site_npi" value={formData.site_npi} onChange={handleChange} />
        <label>Site TIN</label>
        <input name="site_tin" value={formData.site_tin} onChange={handleChange} />

        <h3>📎 Attachments + Notes</h3>
        <label>Clinical Notes</label>
        <textarea name="notes" value={formData.notes} onChange={handleChange} />
        <label>File Upload</label>
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

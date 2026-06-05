import React, { useEffect, useRef, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { createPatient, fetchPatients } from "../store/slices/patientSlice";
import { fetchDoctors } from "../store/slices/doctorSlice";
import { Patient } from "../types/patient";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const validationSchema = Yup.object({
  patientName: Yup.string()
    .required("Patient name is required")
    .min(2, "Minimum 2 characters"),
  age: Yup.number().required("Age is required").min(0).max(150),
  sex: Yup.string()
    .required("Sex is required")
    .oneOf(["Male", "Female", "Other"]),
  doctorId: Yup.number().required("Doctor selection is required").min(1),
});

const PatientForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { doctors } = useAppSelector((s) => s.doctors);
  const { loading } = useAppSelector((s) => s.patients);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [savedPatient, setSavedPatient] = useState<Patient | null>(null);
  const prescriptionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const generatePDF = async () => {
    if (!prescriptionRef.current) return;
    const el = prescriptionRef.current;
    el.style.width = "800px";
    const canvas = await html2canvas(el as HTMLElement, {
      scale: 2,
      backgroundColor: "#fff",
      useCORS: true,
    });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const w = pdf.internal.pageSize.getWidth();
    const h = (canvas.height * w) / canvas.width;
    pdf.addImage(img, "PNG", 0, 0, w, h);
    pdf.save(
      `Prescription_${savedPatient?.patientName ?? "patient"}_${new Date().toISOString().split("T")[0]}.pdf`,
    );
    el.style.width = "";
  };

  const handlePrint = () => {
    const el = prescriptionRef.current;
    if (!el) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(
      `<html><head><title>Prescription</title><link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"></head><body>${el.innerHTML}</body></html>`,
    );
    w.document.close();
    w.print();
  };

  const formik = useFormik({
    initialValues: {
      patientName: "",
      age: 0,
      sex: "",
      visitDate: new Date().toISOString().split("T")[0],
      doctorId: 0,
      temperature: 98.6,
      pr: 72,
      bpSystolic: 120,
      bpDiastolic: 80,
      spo2: 98,
      complaints: "",
      history: "",
      onExamination: "",
      heart: "",
      lungs: "",
      p_a: "",
      p_r: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      const selectedDoctor = doctors.find(
        (d) => d.id === Number(values.doctorId),
      );
      if (!selectedDoctor) {
        alert("Please select a valid doctor.");
        return;
      }

      const payload: Patient = {
        patientName: values.patientName,
        age: values.age,
        sex: values.sex as any,
        visitDate: values.visitDate,
        temperature: values.temperature,
        pr: values.pr,
        bpSystolic: values.bpSystolic,
        bpDiastolic: values.bpDiastolic,
        spo2: values.spo2,
        complaints: values.complaints || "",
        history: values.history || "",
        onExamination: values.onExamination || "",
        heart: values.heart || "",
        lungs: values.lungs || "",
        p_a: values.p_a || "",
        p_r: values.p_r || "",
        doctor: selectedDoctor,
        doctorId: Number(values.doctorId),
      } as Patient;

      const res = await dispatch(createPatient(payload));
      const status = (res as any)?.meta?.requestStatus;
      if (status === "fulfilled") {
        const server = (res as any)?.payload || {};
        setSavedPatient({ ...payload, ...server } as Patient);
        setShowSuccessModal(true);
        resetForm();
        await dispatch(fetchPatients());
      } else {
        alert((res as any)?.error?.message || "Failed to save patient");
      }
    },
  });

  return (
    <>
      <div className="container-fluid px-4 py-4">
        <div className="card shadow-lg border-0 rounded-4">
          <div
            className="card-header rounded-top-4"
            style={{
              background: "linear-gradient(135deg, #2a9866 0%, #2a9866 100%)",
              borderBottom: "3px solid #c9a03d",
            }}
          >
            <h3 className="mb-0 text-white">🏥 Patient Registration</h3>
            <p className="mb-0 mt-2 text-white opacity-75">
              Fill in all patient details below
            </p>
          </div>

          <div className="card-body">
            <form onSubmit={formik.handleSubmit}>
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Patient Name *</label>
                  <input
                    type="text"
                    className={`form-control form-control-lg ${formik.touched.patientName && formik.errors.patientName ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("patientName")}
                    placeholder="Enter full name"
                  />
                  {formik.touched.patientName && formik.errors.patientName && (
                    <div className="invalid-feedback">
                      {formik.errors.patientName}
                    </div>
                  )}
                </div>

                <div className="col-md-2 mb-3">
                  <label className="form-label fw-bold">Age *</label>
                  <input
                    type="number"
                    className={`form-control form-control-lg ${formik.touched.age && formik.errors.age ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("age")}
                    placeholder="Years"
                  />
                  {formik.touched.age && formik.errors.age && (
                    <div className="invalid-feedback">{formik.errors.age}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Sex *</label>
                  <select
                    className={`form-control form-control-lg ${formik.touched.sex && formik.errors.sex ? "is-invalid" : ""}`}
                    {...formik.getFieldProps("sex")}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {formik.touched.sex && formik.errors.sex && (
                    <div className="invalid-feedback">{formik.errors.sex}</div>
                  )}
                </div>

                <div className="col-md-3 mb-3">
                  <label className="form-label fw-bold">Visit Date *</label>
                  <input
                    type="date"
                    className="form-control form-control-lg"
                    {...formik.getFieldProps("visitDate")}
                  />
                </div>
              </div>

              {/* Vital Signs */}
              <div className="card bg-light border-0 rounded-3 mb-4">
                <div className="card-body">
                  <h5 className="mb-3 text-primary">🩺 Vital Signs</h5>
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        className="form-control"
                        {...formik.getFieldProps("temperature")}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Pulse Rate (bpm)</label>
                      <input
                        type="number"
                        className="form-control"
                        {...formik.getFieldProps("pr")}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">SpO₂ (%)</label>
                      <input
                        type="number"
                        className="form-control"
                        {...formik.getFieldProps("spo2")}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">BP Systolic (mmHg)</label>
                      <input
                        type="number"
                        className="form-control"
                        {...formik.getFieldProps("bpSystolic")}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">BP Diastolic (mmHg)</label>
                      <input
                        type="number"
                        className="form-control"
                        {...formik.getFieldProps("bpDiastolic")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Examination */}
              <div className="card bg-light border-0 rounded-3 mb-4">
                <div className="card-body">
                  <h5 className="mb-3 text-info">📝 Clinical Examination</h5>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Chief Complaints</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        {...formik.getFieldProps("complaints")}
                        placeholder="e.g., Fever, cough, headache since 2 days"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">
                        History of Present Illness
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        {...formik.getFieldProps("history")}
                        placeholder="Past medical history, family history, etc."
                      />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">
                        On Examination (General)
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        {...formik.getFieldProps("onExamination")}
                        placeholder="General physical examination findings"
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Heart Examination</label>
                      <input
                        type="text"
                        className="form-control"
                        {...formik.getFieldProps("heart")}
                        placeholder="S1, S2, murmurs, etc."
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Lungs Examination</label>
                      <input
                        type="text"
                        className="form-control"
                        {...formik.getFieldProps("lungs")}
                        placeholder="Clear, wheeze, crepitations, etc."
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Per Abdomen (P/A)</label>
                      <input
                        type="text"
                        className="form-control"
                        {...formik.getFieldProps("p_a")}
                        placeholder="Soft, tender, organomegaly, etc."
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Per Rectum (P/R)</label>
                      <input
                        type="text"
                        className="form-control"
                        {...formik.getFieldProps("p_r")}
                        placeholder="If applicable"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Doctor Selection */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">👨‍⚕️ Select Doctor *</label>
                <select
                  className={`form-control form-control-lg ${formik.touched.doctorId && formik.errors.doctorId ? "is-invalid" : ""}`}
                  {...formik.getFieldProps("doctorId")}
                  required
                >
                  <option value="">-- Select a Doctor --</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.doctorName} - {doctor.specialization}
                    </option>
                  ))}
                </select>
                {formik.touched.doctorId && formik.errors.doctorId && (
                  <div className="invalid-feedback">
                    {formik.errors.doctorId}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="row">
                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg w-100"
                    disabled={loading}
                    style={{
                      background:
                        "linear-gradient(135deg, #2a9866 0%, #2a9866 100%)",
                      border: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                        ></span>
                        Registering...
                      </>
                    ) : (
                      "🏥 Register Patient & Generate Prescription"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && savedPatient && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.7)", zIndex: 1050 }}
          onClick={() => setShowSuccessModal(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered modal-lg"
            style={{ maxWidth: "900px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content rounded-4">
              <div
                className="modal-header"
                style={{
                  background:
                    "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                }}
              >
                <h5 className="modal-title text-white">
                  ✅ Patient Registered Successfully!
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>

              <div className="modal-body p-0">
                <div
                  ref={prescriptionRef}
                  className="p-3"
                  style={{
                    background: "#fff",
                    maxWidth: "800px",
                    margin: "0 auto",
                  }}
                >
                  <div className="text-center mb-2 border-bottom pb-2">
                    <h3 style={{ color: "#1e3c72" }}>
                      GBK'S HEALTH CARE SPECIALITY CLINIC
                    </h3>
                    <p>
                      Thomas Arcade, Anandbagh 'X' Road, Malakajiri, Hyderabad -
                      500 047
                    </p>
                    <p>📞 +91 9291627858 | ✉️ gbkdrkmc1995@gmail.com</p>
                  </div>

                  <div className="row mb-2">
                    <div className="col-5">
                      <strong>Patient Name:</strong> {savedPatient?.patientName}
                    </div>
                    <div className="col-3">
                      <strong>Age/Sex:</strong> {savedPatient?.age} yrs /{" "}
                      {savedPatient?.sex}
                    </div>
                    <div className="col-4">
                      <strong>Date:</strong> {savedPatient?.visitDate}
                    </div>
                  </div>

                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="p-1" style={{ background: "#f0f7ff" }}>
                        <strong>👨‍⚕️ Doctor:</strong>{" "}
                        {savedPatient?.doctor?.doctorName} (
                        {savedPatient?.doctor?.specialization})
                      </div>
                    </div>
                  </div>

                  {/* Vitals Summary */}
                  <div className="row mb-2">
                    <div className="col-12">
                      <div
                        className="p-2"
                        style={{
                          background: "#f8f9fb",
                          borderRadius: "6px",
                          border: "1px solid #e9eef6",
                        }}
                      >
                        <div className="d-flex justify-content-between">
                          <div>
                            <strong>🌡️ Temp:</strong>{" "}
                            {savedPatient?.temperature ?? "-"}°F
                          </div>
                          <div>
                            <strong>❤️ Pulse:</strong> {savedPatient?.pr ?? "-"}{" "}
                            bpm
                          </div>
                          <div>
                            <strong>💓 BP:</strong>{" "}
                            {savedPatient?.bpSystolic &&
                            savedPatient?.bpDiastolic
                              ? `${savedPatient.bpSystolic}/${savedPatient.bpDiastolic} mmHg`
                              : "-"}
                          </div>
                          <div>
                            <strong>🩸 SpO₂:</strong>{" "}
                            {savedPatient?.spo2 ?? "-"}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Examination Details */}
                  <div className="row mb-2">
                    <div className="col-12">
                      <div className="p-2" style={{ background: "#fff" }}>
                        <h6 className="mb-2">🩺 Clinical Examination</h6>
                        <div className="mb-2">
                          <strong>Complaints:</strong>{" "}
                          {(savedPatient?.complaints ?? "").trim() !== ""
                            ? savedPatient?.complaints
                            : "-"}
                        </div>
                        <div className="mb-2">
                          <strong>History:</strong>{" "}
                          {(savedPatient?.history ?? "").trim() !== ""
                            ? savedPatient?.history
                            : "-"}
                        </div>
                        <div className="mb-2">
                          <strong>On Examination:</strong>{" "}
                          {(savedPatient?.onExamination ?? "").trim() !== ""
                            ? savedPatient?.onExamination
                            : "-"}
                        </div>
                        <div className="row">
                          <div className="col-md-3">
                            <strong>Heart:</strong> {savedPatient?.heart ?? "-"}
                          </div>
                          <div className="col-md-3">
                            <strong>Lungs:</strong> {savedPatient?.lungs ?? "-"}
                          </div>
                          <div className="col-md-3">
                            <strong>P/A:</strong> {savedPatient?.p_a ?? "-"}
                          </div>
                          <div className="col-md-3">
                            <strong>P/R:</strong> {savedPatient?.p_r ?? "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mt-2 pt-1 border-top">
                    <small>GBK'S HEALTH CARE - Committed to Excellence</small>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowSuccessModal(false)}
                >
                  Close
                </button>
                <button className="btn btn-info" onClick={handlePrint}>
                  🖨️ Print Prescription
                </button>
                <button className="btn btn-primary" onClick={generatePDF}>
                  📥 Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientForm;

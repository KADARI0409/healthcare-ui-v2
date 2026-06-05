import React, { useRef } from "react";
import { Patient } from "../types/patient";

interface PatientPrescriptionProps {
  patient: Patient;
  onClose: () => void;
}

const PatientPrescription: React.FC<PatientPrescriptionProps> = ({
  patient,
  onClose,
}) => {
  const prescriptionRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const printContent = prescriptionRef.current;
    if (!printContent) {
      console.error("Print content not found");
      return;
    }

    const originalTitle = document.title;
    document.title = `Prescription_${patient.patientName}_${patient.visitDate}`;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Prescription - ${patient.patientName}</title>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              body {
                padding: 20px;
                font-family: 'Segoe UI', Arial, sans-serif;
                background: white;
              }
              .prescription-container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
              }
              .clinic-header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 3px solid #1e3c72;
                padding-bottom: 15px;
              }
              .clinic-header h2 {
                color: #1e3c72;
                margin-bottom: 5px;
              }
              .clinic-header p {
                margin: 3px 0;
                color: #666;
                font-size: 12px;
              }
              .section-title {
                background: #e8f0fe;
                padding: 8px;
                border-radius: 5px;
                margin: 15px 0 10px 0;
                font-weight: bold;
              }
              .info-row {
                margin-bottom: 8px;
              }
              .doctor-signature {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 2px dashed #ccc;
              }
              .footer {
                text-align: center;
                margin-top: 20px;
                padding-top: 10px;
                border-top: 1px solid #ddd;
                font-size: 10px;
                color: #999;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                .no-print {
                  display: none;
                }
                .clinic-header {
                  margin-bottom: 15px;
                }
              }
            </style>
          </head>
          <body>
            <div class="prescription-container">
              ${printContent.innerHTML}
            </div>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
    document.title = originalTitle;
  };

  if (!patient) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        style={{ maxWidth: "900px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content prescription-card rounded-4">
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
            }}
          >
            <h5 className="modal-title text-white">
              📄 Patient Prescription / Clinical Note
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body p-0">
            {/* Prescription Content */}
            <div
              ref={prescriptionRef}
              className="p-4"
              style={{ background: "#fff" }}
            >
              {/* Clinic Header */}
              <div className="text-center mb-4 border-bottom pb-3">
                <h2
                  style={{
                    color: "#1e3c72",
                    fontWeight: "bold",
                    marginBottom: "5px",
                  }}
                >
                  GBK'S HEALTH CARE SPECIALITY CLINIC
                </h2>
                <p style={{ color: "#666", marginBottom: "5px" }}>
                  Sri R.K Medical & General Stores
                </p>
                <p
                  style={{
                    color: "#666",
                    fontSize: "12px",
                    marginBottom: "5px",
                  }}
                >
                  Thomas Arcade, Anandbagh 'X' Road, Malakajiri, Hyderabad - 500
                  047
                </p>
                <p style={{ color: "#666", fontSize: "12px" }}>
                  📞 +91 9291627858 | ✉️ gbkdrkmc1995@gmail.com
                </p>
              </div>

              {/* Patient Info */}
              <div className="row mb-4">
                <div className="col-6">
                  <strong>Patient Name:</strong> {patient.patientName}
                </div>
                <div className="col-3">
                  <strong>Age/Sex:</strong> {patient.age} yrs / {patient.sex}
                </div>
                <div className="col-3">
                  <strong>Date:</strong> {patient.visitDate}
                </div>
              </div>

              {/* Doctor Info */}
              <div className="row mb-4">
                <div className="col-12">
                  <div
                    className="p-2"
                    style={{ background: "#f0f7ff", borderRadius: "8px" }}
                  >
                    <strong>👨‍⚕️ Attending Doctor:</strong>{" "}
                    {patient.doctor?.doctorName || "Not Assigned"}
                    {patient.doctor?.specialization && (
                      <small className="text-muted">
                        {" "}
                        ({patient.doctor?.specialization})
                      </small>
                    )}
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="row mb-4">
                <div className="col-12">
                  <h6
                    style={{
                      background: "#e8f0fe",
                      padding: "8px",
                      borderRadius: "5px",
                    }}
                  >
                    🩺 Vital Signs
                  </h6>
                  <div className="row mt-2">
                    <div className="col-3">
                      <small className="text-muted">Temperature</small>
                      <div>
                        <strong>{patient.temperature || "-"} °F</strong>
                      </div>
                    </div>
                    <div className="col-3">
                      <small className="text-muted">Pulse Rate</small>
                      <div>
                        <strong>{patient.pr || "-"} bpm</strong>
                      </div>
                    </div>
                    <div className="col-3">
                      <small className="text-muted">Blood Pressure</small>
                      <div>
                        <strong>
                          {patient.bpSystolic && patient.bpDiastolic
                            ? `${patient.bpSystolic}/${patient.bpDiastolic}`
                            : "-"}{" "}
                          mmHg
                        </strong>
                      </div>
                    </div>
                    <div className="col-3">
                      <small className="text-muted">SpO₂</small>
                      <div>
                        <strong>{patient.spo2 || "-"} %</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Examination */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6
                    style={{
                      background: "#e8f0fe",
                      padding: "8px",
                      borderRadius: "5px",
                    }}
                  >
                    📋 Clinical Examination
                  </h6>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-12">
                  <strong>Complaints:</strong>
                  <div
                    className="p-2 mt-1"
                    style={{
                      background: "#fafafa",
                      borderRadius: "5px",
                      minHeight: "50px",
                    }}
                  >
                    {patient.complaints || "No complaints recorded"}
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-12">
                  <strong>History:</strong>
                  <div
                    className="p-2 mt-1"
                    style={{
                      background: "#fafafa",
                      borderRadius: "5px",
                      minHeight: "50px",
                    }}
                  >
                    {patient.history || "No history recorded"}
                  </div>
                </div>
              </div>

              <div className="row mb-2">
                <div className="col-12">
                  <strong>On Examination:</strong>
                  <div
                    className="p-2 mt-1"
                    style={{
                      background: "#fafafa",
                      borderRadius: "5px",
                      minHeight: "50px",
                    }}
                  >
                    {patient.onExamination || "No examination recorded"}
                  </div>
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-md-3 mb-2">
                  <strong>❤️ Heart:</strong>
                  <div className="p-1 mt-1">{patient.heart || "-"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>🫁 Lungs:</strong>
                  <div className="p-1 mt-1">{patient.lungs || "-"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>🩺 P/A:</strong>
                  <div className="p-1 mt-1">{patient.p_a || "-"}</div>
                </div>
                <div className="col-md-3 mb-2">
                  <strong>📎 P/R:</strong>
                  <div className="p-1 mt-1">{patient.p_r || "-"}</div>
                </div>
              </div>

              {/* Doctor Signature */}
              <div className="doctor-signature mt-4">
                <div className="row">
                  <div className="col-12 text-center">
                    <p>____________________________</p>
                    <p>
                      <strong>Doctor's Signature</strong>
                    </p>
                    <small className="text-muted">
                      {patient.doctor?.doctorName || ""}
                    </small>
                  </div>
                </div>
              </div>

              {/* Footer Watermark */}
              <div className="text-center mt-4 pt-3 border-top">
                <small className="text-muted" style={{ fontSize: "10px" }}>
                  GBK'S HEALTH CARE - Committed to Excellence in Patient Care
                </small>
              </div>
            </div>
          </div>
          <div className="modal-footer no-print">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-primary"
              onClick={handlePrint}
              style={{
                background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
              }}
            >
              🖨️ Print Prescription
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPrescription;

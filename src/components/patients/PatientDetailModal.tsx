import React from "react";
import { Patient } from "../../types/patient";
import PatientVitals from "./PatientVitals";

interface PatientDetailModalProps {
  patient: Patient | null;
  onClose: () => void;
  onEdit: (patient: Patient) => void;
}

const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  onClose,
  onEdit,
}) => {
  if (!patient) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content rounded-4">
          <div
            className="modal-header"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            <h5 className="modal-title text-white">
              👤 Patient Details: {patient.patientName}
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <div className="row mb-4">
              <div className="col-md-6">
                <div className="border rounded-3 p-3 bg-light">
                  <h6 className="text-primary mb-3">📋 Basic Information</h6>
                  <p>
                    <strong>Patient ID:</strong> #{patient.id}
                  </p>
                  <p>
                    <strong>Name:</strong> {patient.patientName}
                  </p>
                  <p>
                    <strong>Age:</strong> {patient.age} years
                  </p>
                  <p>
                    <strong>Sex:</strong> {patient.sex}
                  </p>
                  <p>
                    <strong>Visit Date:</strong> {patient.visitDate}
                  </p>
                  <p>
                    <strong>Doctor:</strong> {patient.doctor?.doctorName} (
                    {patient.doctor?.specialization})
                  </p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="border rounded-3 p-3 bg-light">
                  <h6 className="text-success mb-3">🩺 Vital Signs</h6>
                  <PatientVitals
                    temperature={patient.temperature}
                    pr={patient.pr}
                    bpSystolic={patient.bpSystolic}
                    bpDiastolic={patient.bpDiastolic}
                    spo2={patient.spo2}
                    size="large"
                  />
                </div>
              </div>
            </div>

            {(patient.complaints ||
              patient.history ||
              patient.onExamination) && (
              <div className="border rounded-3 p-3 bg-light">
                <h6 className="text-info mb-3">📝 Clinical Examination</h6>
                {patient.complaints && (
                  <div className="mb-2">
                    <strong>Chief Complaints:</strong>
                    <p className="mb-1">{patient.complaints}</p>
                  </div>
                )}
                {patient.history && (
                  <div className="mb-2">
                    <strong>History:</strong>
                    <p className="mb-1">{patient.history}</p>
                  </div>
                )}
                {patient.onExamination && (
                  <div className="mb-2">
                    <strong>On Examination:</strong>
                    <p className="mb-1">{patient.onExamination}</p>
                  </div>
                )}
                {(patient.heart || patient.lungs || patient.p_a) && (
                  <div className="row mt-2">
                    {patient.heart && (
                      <div className="col-md-4">
                        <strong>❤️ Heart:</strong>
                        <p className="small">{patient.heart}</p>
                      </div>
                    )}
                    {patient.lungs && (
                      <div className="col-md-4">
                        <strong>🫁 Lungs:</strong>
                        <p className="small">{patient.lungs}</p>
                      </div>
                    )}
                    {patient.p_a && (
                      <div className="col-md-4">
                        <strong>🩺 P/A:</strong>
                        <p className="small">{patient.p_a}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Close
            </button>
            <button
              className="btn btn-warning"
              onClick={() => {
                onClose();
                onEdit(patient);
              }}
            >
              ✏️ Edit Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailModal;

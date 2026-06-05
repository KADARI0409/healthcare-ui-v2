import React from "react";
import { Patient } from "../../types/patient";
import PatientVitals from "./PatientVitals";

interface PatientCardProps {
  patient: Patient;
  onEdit: (patient: Patient) => void;
  onDelete: (id: number) => void;
  onViewDetails?: (patient: Patient) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <div className="card mb-3 shadow-sm border-0 rounded-3">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h5 className="card-title mb-1">{patient.patientName}</h5>
            <p className="text-muted small mb-2">
              #{patient.id} • {patient.age} yrs • {patient.sex}
            </p>
          </div>
          <div className="dropdown">
            <button
              className="btn btn-light btn-sm rounded-circle"
              data-bs-toggle="dropdown"
            >
              ⋮
            </button>
            <ul className="dropdown-menu">
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onViewDetails?.(patient)}
                >
                  👁️ View Details
                </button>
              </li>
              <li>
                <button
                  className="dropdown-item"
                  onClick={() => onEdit(patient)}
                >
                  ✏️ Edit
                </button>
              </li>
              <li>
                <hr className="dropdown-divider" />
              </li>
              <li>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => onDelete(patient.id!)}
                >
                  🗑️ Delete
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3">
          <div className="row">
            <div className="col-6">
              <small className="text-muted">Visit Date</small>
              <p className="mb-2">{patient.visitDate}</p>
            </div>
            <div className="col-6">
              <small className="text-muted">Doctor</small>
              <p className="mb-2">{patient.doctor?.doctorName || "N/A"}</p>
            </div>
          </div>

          <PatientVitals
            temperature={patient.temperature}
            pr={patient.pr}
            bpSystolic={patient.bpSystolic}
            bpDiastolic={patient.bpDiastolic}
            spo2={patient.spo2}
            size="small"
          />

          {patient.complaints && (
            <div className="mt-2">
              <small className="text-muted">Complaints</small>
              <p className="mb-0 small text-truncate">{patient.complaints}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientCard;

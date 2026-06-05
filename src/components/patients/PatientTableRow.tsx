import React from "react";
import { Patient } from "../../types/patient";
import PatientVitals from "./PatientVitals";

interface PatientTableRowProps {
  patient: Patient;
  index: number;
  onEdit: (patient: Patient) => void;
  onDelete: (id: number) => void;
  onViewDetails: (patient: Patient) => void;
}

const PatientTableRow: React.FC<PatientTableRowProps> = ({
  patient,
  onEdit,
  onDelete,
  onViewDetails,
}) => {
  return (
    <tr>
      <td className="fw-bold">#{patient.id}</td>
      <td>
        <strong>{patient.patientName}</strong>
        <br />
        <small className="text-muted">
          {patient.age} yrs • {patient.sex}
        </small>
      </td>
      <td>
        <small>{patient.visitDate}</small>
        <br />
        <small className="text-muted">
          {patient.doctor?.doctorName || "N/A"}
        </small>
      </td>
      <td>
        <PatientVitals
          temperature={patient.temperature}
          pr={patient.pr}
          bpSystolic={patient.bpSystolic}
          bpDiastolic={patient.bpDiastolic}
          spo2={patient.spo2}
          size="small"
        />
      </td>
      <td>
        <button
          className="btn btn-sm btn-outline-info me-1"
          onClick={() => onViewDetails(patient)}
          title="View Details"
        >
          👁️
        </button>
        <button
          className="btn btn-sm btn-outline-warning me-1"
          onClick={() => onEdit(patient)}
          title="Edit"
        >
          ✏️
        </button>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={() => onDelete(patient.id!)}
          title="Delete"
        >
          🗑️
        </button>
      </td>
    </tr>
  );
};

export default PatientTableRow;

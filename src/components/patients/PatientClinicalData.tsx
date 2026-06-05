import React, { useState } from "react";

interface PatientClinicalDataProps {
  complaints?: string;
  history?: string;
  onExamination?: string;
  heart?: string;
  lungs?: string;
  p_a?: string;
  p_r?: string;
  compact?: boolean;
}

const PatientClinicalData: React.FC<PatientClinicalDataProps> = ({
  complaints,
  history,
  onExamination,
  heart,
  lungs,
  p_a,
  p_r,
  compact = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const hasData =
    complaints || history || onExamination || heart || lungs || p_a || p_r;

  if (!hasData) {
    return <span className="text-muted">No clinical data recorded</span>;
  }

  if (compact && !expanded) {
    return (
      <div>
        <div className="text-truncate" style={{ maxWidth: "200px" }}>
          {complaints || "No complaints"}
        </div>
        <button
          className="btn btn-link btn-sm p-0 mt-1"
          onClick={() => setExpanded(true)}
        >
          View full details →
        </button>
      </div>
    );
  }

  return (
    <div>
      {complaints && (
        <div className="mb-2">
          <strong className="text-primary">📝 Chief Complaints:</strong>
          <p className="mb-1 mt-1">{complaints}</p>
        </div>
      )}
      {history && (
        <div className="mb-2">
          <strong className="text-info">📋 History:</strong>
          <p className="mb-1 mt-1">{history}</p>
        </div>
      )}
      {onExamination && (
        <div className="mb-2">
          <strong className="text-success">🔍 On Examination:</strong>
          <p className="mb-1 mt-1">{onExamination}</p>
        </div>
      )}
      <div className="row mt-2">
        {heart && (
          <div className="col-md-6 mb-2">
            <strong>❤️ Heart:</strong>
            <p className="mb-0 small">{heart}</p>
          </div>
        )}
        {lungs && (
          <div className="col-md-6 mb-2">
            <strong>🫁 Lungs:</strong>
            <p className="mb-0 small">{lungs}</p>
          </div>
        )}
        {p_a && (
          <div className="col-md-6 mb-2">
            <strong>🩺 P/A:</strong>
            <p className="mb-0 small">{p_a}</p>
          </div>
        )}
        {p_r && (
          <div className="col-md-6 mb-2">
            <strong>📎 P/R:</strong>
            <p className="mb-0 small">{p_r}</p>
          </div>
        )}
      </div>
      {compact && (
        <button
          className="btn btn-link btn-sm p-0 mt-2"
          onClick={() => setExpanded(false)}
        >
          Show less ↑
        </button>
      )}
    </div>
  );
};

export default PatientClinicalData;

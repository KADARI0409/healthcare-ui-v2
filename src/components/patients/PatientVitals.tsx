import React from "react";

interface PatientVitalsProps {
  temperature?: number;
  pr?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;
  size?: "small" | "medium" | "large";
}

const PatientVitals: React.FC<PatientVitalsProps> = ({
  temperature,
  pr,
  bpSystolic,
  bpDiastolic,
  spo2,
  size = "medium",
}) => {
  const getFontSize = () => {
    switch (size) {
      case "small":
        return "0.875rem";
      case "large":
        return "1.1rem";
      default:
        return "0.95rem";
    }
  };

  const getSpacing = () => {
    switch (size) {
      case "small":
        return "me-2";
      default:
        return "me-3";
    }
  };

  const styles = { fontSize: getFontSize() };

  return (
    <div style={styles} className="d-flex flex-wrap align-items-center">
      {temperature && (
        <span className={getSpacing()} title="Temperature">
          🌡️ {temperature}°F
        </span>
      )}
      {pr && (
        <span className={getSpacing()} title="Pulse Rate">
          ❤️ {pr} bpm
        </span>
      )}
      {bpSystolic && bpDiastolic && (
        <span className={getSpacing()} title="Blood Pressure">
          💓 {bpSystolic}/{bpDiastolic}
        </span>
      )}
      {spo2 && (
        <span className={getSpacing()} title="Oxygen Saturation">
          🩸 SpO₂ {spo2}%
        </span>
      )}
      {!temperature && !pr && !bpSystolic && !spo2 && (
        <span className="text-muted">No vitals recorded</span>
      )}
    </div>
  );
};

export default PatientVitals;

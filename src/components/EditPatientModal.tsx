import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { updatePatient, fetchPatients } from "../store/slices/patientSlice";
import { fetchDoctors } from "../store/slices/doctorSlice";
import { Patient, Doctor } from "../types/patient";

interface EditPatientModalProps {
  patient: Patient | null;
  onClose: () => void;
  onUpdated?: (patient: Patient) => void;
}

const validationSchema = Yup.object({
  patientName: Yup.string()
    .required("Patient name is required")
    .min(2, "Minimum 2 characters"),
  age: Yup.number()
    .required("Age is required")
    .min(0, "Age must be 0 or greater")
    .max(150, "Age must be less than 150"),
  sex: Yup.string()
    .required("Sex is required")
    .oneOf(["Male", "Female", "Other"], "Invalid sex"),
  doctorId: Yup.number().required("Please select a doctor"),
  temperature: Yup.number()
    .min(95, "Temperature must be at least 95°F")
    .max(104, "Temperature must not exceed 104°F"),
  pr: Yup.number()
    .min(40, "Pulse must be at least 40 bpm")
    .max(200, "Pulse must not exceed 200 bpm"),
  bpSystolic: Yup.number()
    .min(60, "Systolic BP must be at least 60 mmHg")
    .max(200, "Systolic BP must not exceed 200 mmHg"),
  bpDiastolic: Yup.number()
    .min(40, "Diastolic BP must be at least 40 mmHg")
    .max(130, "Diastolic BP must not exceed 130 mmHg"),
  spo2: Yup.number()
    .min(70, "SpO2 must be at least 70%")
    .max(100, "SpO2 must not exceed 100%"),
});

const EditPatientModal: React.FC<EditPatientModalProps> = ({
  patient,
  onClose,
  onUpdated,
}) => {
  const dispatch = useAppDispatch();
  const { doctors } = useAppSelector((state) => state.doctors);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const formik = useFormik({
    initialValues: {
      patientName: patient?.patientName || "",
      age: patient?.age || 0,
      sex: patient?.sex || "",
      visitDate: patient?.visitDate || new Date().toISOString().split("T")[0],
      doctorId: patient?.doctor?.id || 0,
      temperature: patient?.temperature || 98.6,
      pr: patient?.pr || 72,
      bpSystolic: patient?.bpSystolic || 120,
      bpDiastolic: patient?.bpDiastolic || 80,
      spo2: patient?.spo2 || 98,
      complaints: patient?.complaints || "",
      history: patient?.history || "",
      onExamination: patient?.onExamination || "",
      heart: patient?.heart || "",
      lungs: patient?.lungs || "",
      p_a: patient?.p_a || "",
      p_r: patient?.p_r || "",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      console.log("EditPatientModal: onSubmit called", {
        values,
        patientId: patient?.id,
      });
      if (!patient?.id) {
        console.error(
          "EditPatientModal: missing patient id, cannot update",
          patient,
        );
        alert("Cannot update: missing patient id");
        return;
      }

      setLoading(true);
      const updatedPatient: Patient = {
        id: patient.id,
        patientName: values.patientName,
        age: values.age,
        sex: values.sex as "Male" | "Female" | "Other",
        visitDate: values.visitDate,
        temperature: values.temperature,
        pr: values.pr,
        bpSystolic: values.bpSystolic,
        bpDiastolic: values.bpDiastolic,
        spo2: values.spo2,
        complaints: values.complaints,
        history: values.history,
        onExamination: values.onExamination,
        heart: values.heart,
        lungs: values.lungs,
        p_a: values.p_a,
        p_r: values.p_r,
        doctor: { id: Number(values.doctorId) } as Doctor,
      };

      const res = await dispatch(
        updatePatient({ id: patient.id, patient: updatedPatient }),
      );
      console.log("EditPatientModal: updatePatient dispatch result", res);
      if ((res as any)?.error) {
        console.error("EditPatientModal: update failed", (res as any).error);
        setLoading(false);
        alert(
          "Update failed: " + ((res as any).error.message || "Unknown error"),
        );
        return;
      }
      const server = (res as any)?.payload || {};
      const merged = { ...updatedPatient, ...server } as Patient;
      await dispatch(fetchPatients());
      setLoading(false);
      if (onUpdated) onUpdated(merged);
      onClose();
      alert("Patient updated successfully!");
    },
  });

  if (!patient) return null;

  return (
    <div
      className="modal show d-block"
      tabIndex={-1}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content">
          <div className="modal-header bg-warning">
            <h5 className="modal-title">✏️ Edit Patient Details</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div
            className="modal-body"
            style={{ maxHeight: "80vh", overflowY: "auto" }}
          >
            <form onSubmit={formik.handleSubmit}>
              {/* Basic Information */}
              <div className="card mb-3">
                <div className="card-header bg-primary text-white">
                  <h6 className="mb-0">📋 Basic Information</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        className={`form-control ${formik.touched.patientName && formik.errors.patientName ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("patientName")}
                      />
                      {formik.touched.patientName &&
                        formik.errors.patientName && (
                          <div className="invalid-feedback">
                            {formik.errors.patientName}
                          </div>
                        )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Age</label>
                      <input
                        type="number"
                        className={`form-control ${formik.touched.age && formik.errors.age ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("age")}
                      />
                      {formik.touched.age && formik.errors.age && (
                        <div className="invalid-feedback">
                          {formik.errors.age}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Sex</label>
                      <select
                        className={`form-control ${formik.touched.sex && formik.errors.sex ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("sex")}
                      >
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      {formik.touched.sex && formik.errors.sex && (
                        <div className="invalid-feedback">
                          {formik.errors.sex}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Visit Date</label>
                      <input
                        type="date"
                        className="form-control"
                        {...formik.getFieldProps("visitDate")}
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Doctor *</label>
                      <select
                        className={`form-control ${formik.touched.doctorId && formik.errors.doctorId ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("doctorId")}
                        required
                      >
                        <option value="">-- Select Doctor --</option>
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
                  </div>
                </div>
              </div>

              {/* Vital Signs */}
              <div className="card mb-3">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">🩺 Vital Signs</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Temperature (°F)</label>
                      <input
                        type="number"
                        step="0.1"
                        className={`form-control ${formik.touched.temperature && formik.errors.temperature ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("temperature")}
                      />
                      {formik.touched.temperature &&
                        formik.errors.temperature && (
                          <div className="invalid-feedback">
                            {String(formik.errors.temperature)}
                          </div>
                        )}

                      {formik.touched.pr && formik.errors.pr && (
                        <div className="invalid-feedback">
                          {String(formik.errors.pr)}
                        </div>
                      )}

                      {formik.touched.bpSystolic &&
                        formik.errors.bpSystolic && (
                          <div className="invalid-feedback">
                            {String(formik.errors.bpSystolic)}
                          </div>
                        )}

                      {formik.touched.bpDiastolic &&
                        formik.errors.bpDiastolic && (
                          <div className="invalid-feedback">
                            {String(formik.errors.bpDiastolic)}
                          </div>
                        )}

                      {formik.touched.spo2 && formik.errors.spo2 && (
                        <div className="invalid-feedback">
                          {String(formik.errors.spo2)}
                        </div>
                      )}
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Pulse (bpm)</label>
                      <input
                        type="number"
                        className={`form-control ${formik.touched.pr && formik.errors.pr ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("pr")}
                      />
                      {formik.touched.pr && formik.errors.pr && (
                        <div className="invalid-feedback">
                          {formik.errors.pr}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">BP Systolic (mmHg)</label>
                      <input
                        type="number"
                        className={`form-control ${formik.touched.bpSystolic && formik.errors.bpSystolic ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("bpSystolic")}
                      />
                      {formik.touched.bpSystolic &&
                        formik.errors.bpSystolic && (
                          <div className="invalid-feedback">
                            {formik.errors.bpSystolic}
                          </div>
                        )}
                    </div>

                    <div className="col-md-4 mb-3">
                      <label className="form-label">BP Diastolic (mmHg)</label>
                      <input
                        type="number"
                        className={`form-control ${formik.touched.bpDiastolic && formik.errors.bpDiastolic ? "is-invalid" : ""}`}
                        {...formik.getFieldProps("bpDiastolic")}
                      />
                      {formik.touched.bpDiastolic &&
                        formik.errors.bpDiastolic && (
                          <div className="invalid-feedback">
                            {formik.errors.bpDiastolic}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Examination */}
              <div className="card mb-3">
                <div className="card-header bg-info text-white">
                  <h6 className="mb-0">📝 Clinical Examination</h6>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12 mb-3">
                      <label className="form-label">Chief Complaints</label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="e.g., Fever, cough, headache since 2 days"
                        {...formik.getFieldProps("complaints")}
                      ></textarea>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        History of Present Illness
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Past medical history, family history, etc."
                        {...formik.getFieldProps("history")}
                      ></textarea>
                    </div>

                    <div className="col-12 mb-3">
                      <label className="form-label">
                        On Examination (General)
                      </label>
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="General physical examination findings"
                        {...formik.getFieldProps("onExamination")}
                      ></textarea>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Heart Examination</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="S1, S2, murmurs, etc."
                        {...formik.getFieldProps("heart")}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Lungs Examination</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Clear, wheeze, crepitations, etc."
                        {...formik.getFieldProps("lungs")}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Per Abdomen (P/A)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Soft, tender, organomegaly, etc."
                        {...formik.getFieldProps("p_a")}
                      />
                    </div>

                    <div className="col-md-3 mb-3">
                      <label className="form-label">Per Rectum (P/R)</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="If applicable"
                        {...formik.getFieldProps("p_r")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-warning"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditPatientModal;

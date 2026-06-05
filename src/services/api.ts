import axios from "axios";
import { Patient, Doctor } from "../types/patient";

const API_BASE_URL = "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const patientApi = {
  getAllPatients: () => api.get<Patient[]>("/patients"),
  getPatientById: (id: number) => api.get<Patient>(`/patients/${id}`),
  createPatient: (patient: Patient) => {
    console.log("Sending to API:", patient);
    return api.post<Patient>("/patients", patient);
  },
  updatePatient: (id: number, patient: Patient) =>
    api.put<Patient>(`/patients/${id}`, patient),
  deletePatient: (id: number) => api.delete(`/patients/${id}`),
  getPatientsByDoctor: (doctorId: number) =>
    api.get<Patient[]>(`/patients/doctor/${doctorId}`),
};

export const doctorApi = {
  getAllDoctors: () => api.get<Doctor[]>("/doctors"),
  getDoctorById: (id: number) => api.get<Doctor>(`/doctors/${id}`),
  createDoctor: (doctor: Doctor) => api.post<Doctor>("/doctors", doctor),
};

export interface Doctor {
  id: number;
  doctorName: string;
  specialization: string;
}

export interface Patient {
  id?: number;
  patientName: string;
  age: number;
  sex: "Male" | "Female" | "Other";
  visitDate: string;

  // Vital Signs
  temperature?: number;
  pr?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  spo2?: number;

  // Clinical Examination Fields
  complaints?: string;
  history?: string;
  onExamination?: string;
  heart?: string;
  lungs?: string;
  p_a?: string;
  p_r?: string;

  doctor?: Doctor;
  doctorId?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

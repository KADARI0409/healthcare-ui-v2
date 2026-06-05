import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { patientApi } from "../../services/api";
import { Patient } from "../../types/patient";

interface PatientState {
  patients: Patient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
};

export const fetchPatients = createAsyncThunk("patients/fetchAll", async () => {
  const response = await patientApi.getAllPatients();
  return response.data;
});

export const createPatient = createAsyncThunk(
  "patients/create",
  async (patient: Patient) => {
    const response = await patientApi.createPatient(patient);
    return response.data;
  },
);

export const updatePatient = createAsyncThunk(
  "patients/update",
  async ({ id, patient }: { id: number; patient: Patient }) => {
    console.log("patientSlice.updatePatient: calling API", { id, patient });
    try {
      const response = await patientApi.updatePatient(id, patient);
      console.log("patientSlice.updatePatient: api response", response);
      return response.data;
    } catch (err) {
      console.error("patientSlice.updatePatient: api error", err);
      throw err;
    }
  },
);

export const deletePatient = createAsyncThunk(
  "patients/delete",
  async (id: number) => {
    await patientApi.deletePatient(id);
    return id;
  },
);

const patientSlice = createSlice({
  name: "patients",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch patients
      .addCase(fetchPatients.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchPatients.fulfilled,
        (state, action: PayloadAction<Patient[]>) => {
          state.loading = false;
          state.patients = action.payload;
        },
      )
      .addCase(fetchPatients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch patients";
      })
      // Create patient
      .addCase(createPatient.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        createPatient.fulfilled,
        (state, action: PayloadAction<Patient>) => {
          state.loading = false;
          state.patients.push(action.payload);
        },
      )
      .addCase(createPatient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to create patient";
      })
      // Update patient
      .addCase(
        updatePatient.fulfilled,
        (state, action: PayloadAction<Patient>) => {
          const index = state.patients.findIndex(
            (p) => p.id === action.payload.id,
          );
          if (index !== -1) {
            state.patients[index] = action.payload;
          }
        },
      )
      // Delete patient
      .addCase(
        deletePatient.fulfilled,
        (state, action: PayloadAction<number>) => {
          state.patients = state.patients.filter(
            (p) => p.id !== action.payload,
          );
        },
      );
  },
});

export default patientSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { doctorApi } from "../../services/api";
import { Doctor } from "../../types/patient";

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
}

const initialState: DoctorState = {
  doctors: [],
  loading: false,
};

export const fetchDoctors = createAsyncThunk("doctors/fetchAll", async () => {
  const response = await doctorApi.getAllDoctors();
  return response.data;
});

const doctorSlice = createSlice({
  name: "doctors",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchDoctors.fulfilled,
        (state, action: PayloadAction<Doctor[]>) => {
          state.loading = false;
          state.doctors = action.payload;
        },
      )
      .addCase(fetchDoctors.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default doctorSlice.reducer;

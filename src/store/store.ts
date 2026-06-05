import { configureStore } from "@reduxjs/toolkit";
import patientReducer from "./slices/patientSlice";
import doctorReducer from "./slices/doctorSlice";

export const store = configureStore({
  reducer: {
    patients: patientReducer,
    doctors: doctorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

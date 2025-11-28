import { configureStore } from "@reduxjs/toolkit";
import globalState from "./stateSlice";

export const store = configureStore({
  reducer: {
    state: globalState,
  },
});

import { configureStore } from '@reduxjs/toolkit';
import layoutReducer from './slices/layoutSlice';
import authReducer from './slices/authSlice';
import technicianAuthReducer from './slices/technicianAuthSlice';

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    auth:authReducer,
    technicianAuth: technicianAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
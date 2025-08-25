import { configureStore } from '@reduxjs/toolkit';
import layoutReducer from './redux_slices/layoutSlice';
import authReducer from './redux_slices/authSlice';
import technicianAuthReducer from './redux_slices/technicianAuthSlice';

export const store = configureStore({
  reducer: {
    layout: layoutReducer,
    auth:authReducer,
    technicianAuth: technicianAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
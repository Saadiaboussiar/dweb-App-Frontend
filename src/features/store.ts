import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import layoutReducer from './slices/layoutSlice';
import authReducer from './slices/authSlice';
import technicianAuthReducer from './slices/technicianAuthSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    layout: layoutReducer,
    auth:authReducer,
    technicianAuth: technicianAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



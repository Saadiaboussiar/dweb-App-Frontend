import { configureStore, type UnknownAction } from '@reduxjs/toolkit';
import layoutReducer from './slices/layoutSlice';
import authReducer from './slices/authSlice';
import technicianAuthReducer from './slices/technicianAuthSlice';
import userReducer from './slices/userSlice';
import profileReducer from './slices/profileSlice';
import verifyCodeReducer from './slices/verifyCodeSlice';

export const store = configureStore({
  reducer: {
    verifyCode:verifyCodeReducer,
    profile:profileReducer,
    user: userReducer,
    layout: layoutReducer,
    auth:authReducer,
    technicianAuth: technicianAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



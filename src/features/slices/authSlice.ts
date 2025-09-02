// features/auth/authSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import { authService } from '../../service/authService';

interface DecodedToken {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: DecodedToken | null;
  roles: string[];
  expiresAt: number | null;
}

// Get initial state from localStorage
const getInitialState = (): AuthState => {
  const token = sessionStorage.getItem('access_token');
  const refreshToken = sessionStorage.getItem('refresh_token');
  const expiresAt = sessionStorage.getItem('token_expires_at');
  
  let roles: string[] = [];
  let user:DecodedToken|null=null;

  if (token) {
    try {
      const decoded: DecodedToken = jwtDecode(token);
      user=decoded;
      roles = decoded.roles || [];
    } catch (error) {
      console.error('Failed to decode stored token:', error);
    }
  }

  return {
    token,
    refreshToken,
    user,
    roles,
    expiresAt: expiresAt ? Number(expiresAt) : null,
  };
};

const initialState: AuthState = getInitialState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ 
      token: string; 
      refreshToken: string;
    }>) => {
      const { token, refreshToken } = action.payload;
      
      // Decode token to get expiration and roles
      let expiresAt: number | null = null;
      let roles: string[] = [];
      let user: DecodedToken|null=null;
      
      try {
        const decoded: DecodedToken = jwtDecode(token);
        user=decoded || null;
        expiresAt = decoded.exp * 1000; // Convert to milliseconds
        roles = decoded.roles || [];
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
      
      state.token = token;
      state.refreshToken = refreshToken;
      state.roles = roles;
      state.user=user;
      state.expiresAt = expiresAt;
      
      // Store in localStorage
      authService.setTokens(token,refreshToken,expiresAt?.toString() ?? 'undefined')
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.roles = [];
      state.expiresAt = null;
      
      // Clear localStorage
      authService.removeTokens();
    },
    clearAuth: (state) => {
      // Clear state without affecting localStorage (for auto-logout)
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.roles = [];
      state.expiresAt = null;
    },
  },
});

export const { setCredentials, logout, clearAuth } = authSlice.actions;
export default authSlice.reducer;
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectRoles = (state: { auth: AuthState }) => state.auth.roles;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;


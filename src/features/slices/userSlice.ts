// features/slices/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  email: string | null;
  isLoggedIn: boolean;
  // Vous pouvez ajouter d'autres informations utilisateur ici
  name?: string;
  role?: string;
}

const initialState: UserState = {
  email: null,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ email: string; name?: string; role?: string }>) => {
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isLoggedIn = true;
      
      // Optionnel: sauvegarder aussi dans sessionStorage pour la persistance
      sessionStorage.setItem('userEmail', action.payload.email);
      if (action.payload.name) {
        sessionStorage.setItem('userName', action.payload.name);
      }
      if (action.payload.role) {
        sessionStorage.setItem('userRole', action.payload.role);
      }
    },
    clearUser: (state) => {
      state.email = null;
      state.name = undefined;
      state.role = undefined;
      state.isLoggedIn = false;
      
      // Nettoyer le sessionStorage
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userRole');
    },
    // Vous pouvez ajouter d'autres actions comme updateUser si nécessaire
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
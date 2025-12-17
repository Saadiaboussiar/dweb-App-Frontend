// features/slices/userSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UserState {
  id:number|null;
  email: string | null;
  isLoggedIn: boolean;
  // Vous pouvez ajouter d'autres informations utilisateur ici
  name?: string;
  role?: string;
}

const initialState: UserState = {
  id:null,
  email: null,
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<{ id:number;email: string; name?: string; role?: string }>) => {
      state.id=action.payload.id
      state.email = action.payload.email;
      state.name = action.payload.name;
      state.role = action.payload.role;
      state.isLoggedIn = true;
      
      // Optionnel: sauvegarder aussi dans sessionStorage pour la persistance
      sessionStorage.setItem('userEmail', action.payload.email);
      sessionStorage.setItem("userId",String(action.payload.id))
      if (action.payload.name) {
        sessionStorage.setItem('userName', action.payload.name);
      }
      if (action.payload.role) {
        sessionStorage.setItem('userRole', action.payload.role);
      }
    },
    clearUser: (state) => {
      state.id=null;
      state.email = null;
      state.name = undefined;
      state.role = undefined;
      state.isLoggedIn = false;
      
      // Nettoyer le sessionStorage
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userRole');
    },
    // Vous pouvez ajouter d'autres actions comme updateUser si nécessaire
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
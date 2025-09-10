// features/slices/profileSlice.ts
import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { getProfileData, editProfileData } from '../../data/profileData'; // Importez votre fonction existante
import type { RootState } from '../store';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  position: string;
  avatar: string;
  department: string;
  phone?: string;
  // ajoutez d'autres champs selon vos besoins
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  updateError: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  updating: false,
  error: null,
  updateError: null,
};

// Thunk pour récupérer les données du profil
export const fetchProfile = createAsyncThunk(
  'profile/fetchProfile',
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await getProfileData(email); // Votre fonction existante
      return response;
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération du profil');
    }
  }
);

// Thunk pour mettre à jour les données du profil
export const updateProfile = createAsyncThunk(
  'profile/updateProfile',
  async (profileData: Partial<ProfileData>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      const email = state.user.email; // On suppose que vous avez l'email dans le user slice
      
      if (!email) {
        throw new Error('Email utilisateur non disponible');
      }
      
      // Utilisez votre fonction existante de mise à jour
      const response = await editProfileData(email, profileData);
      return response;
    } catch (error:any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    }
  }
);

export const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.updateError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion des fetch
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Gestion des updates
      .addCase(updateProfile.pending, (state) => {
        state.updating = true;
        state.updateError = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.updating = false;
        state.data = { ...state.data, ...action.payload };
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.updating = false;
        state.updateError = action.payload as string;
      });
  },
});

export const { clearProfile, clearUpdateError } = profileSlice.actions;
export default profileSlice.reducer;

// Sélecteurs
export const selectProfile = (state: RootState) => state.profile.data;
export const selectProfileLoading = (state: RootState) => state.profile.loading;
export const selectProfileUpdating = (state: RootState) => state.profile.updating;
export const selectProfileError = (state: RootState) => state.profile.error;
export const selectProfileUpdateError = (state: RootState) => state.profile.updateError;
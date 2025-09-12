// hooks/useProfile.ts
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProfile, 
  updateProfile, // Importez l'action de mise à jour
  selectProfile, 
  selectProfileLoading, 
  selectProfileUpdating,
  selectProfileError, 
  selectProfileUpdateError,
  clearUpdateError 
} from '../features/slices/profileSlice';
import { useUserEmail } from './useUserEmail';
import { useAppDispatch } from './useDispatch';
import type { profileDataType } from '../data/profileData';

export const useProfile = () => {

  const dispatch = useAppDispatch();
  const email = useUserEmail();
  const profile = useSelector(selectProfile);
  const loading = useSelector(selectProfileLoading);
  const updating = useSelector(selectProfileUpdating);
  const error = useSelector(selectProfileError);
  const updateError = useSelector(selectProfileUpdateError);

  const fetchProfileData = useCallback(() => {
    if (email) {
      dispatch(fetchProfile(email));
    }
  }, [email, dispatch]);

  // Fonction pour mettre à jour le profil
  const updateProfileData = useCallback((updates: Partial<profileDataType>) => {
    dispatch(updateProfile(updates));
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch(clearUpdateError());
  }, [dispatch]);

  return { 
    profile, 
    loading, 
    updating,
    error, 
    updateError,
    fetchProfileData, 
    updateProfileData, // Exposez la fonction de mise à jour
    clearError
  };
};
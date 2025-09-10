// hooks/useUserEmail.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';

export const useUserEmail = () => {
  return useSelector((state: RootState) => state.user.email);
};
// hooks/useAppDispatch.ts
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../features/store';

export const useAppDispatch = () => useDispatch<AppDispatch>();
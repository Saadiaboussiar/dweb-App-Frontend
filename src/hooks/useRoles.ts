// hooks/useRoles.ts
import { useSelector } from 'react-redux';
import type { RootState } from '../features/store';

export const useRoles = () => {
  const roles = useSelector((state: RootState) => state.auth.roles);
  
  const hasRole = (role: string): boolean => {
    return roles.includes(role);
  };

  const hasAnyRole = (requiredRoles: string[]): boolean => {
    return requiredRoles.some(role => roles.includes(role));
  };

  return {
    roles,
    hasRole,
    hasAnyRole,
    isAdmin: hasRole('ADMIN'),
    isUser: hasRole('USER'),
  };
};
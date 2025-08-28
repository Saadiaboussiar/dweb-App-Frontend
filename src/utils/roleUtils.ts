// utils/roleUtils.ts
import { jwtDecode } from 'jwt-decode';

export interface DecodedToken {
  sub: string;
  email: string;
  roles: string[];
  exp: number;
  iat: number;
}


export const extractRolesFromToken = (token: string): string[] => {
  try {
    const decoded: DecodedToken = jwtDecode(token);
    return decoded.roles || [];
  } catch (error) {
    console.error('Failed to decode token:', error);
    return [];
  }
};
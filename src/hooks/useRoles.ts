import { useMemo } from "react";
import type { RootState } from "../comp_management/store";
import { useSelector } from "react-redux";

export const useRoles=()=>{
    const { roles }=useSelector((state:RootState)=>state.auth)as { roles: string[] };

    return useMemo(() => ({
        roles,
        isAdmin: roles.includes('ADMIN'),
        isUser: roles.includes('USER'),
        hasRole: (role: string) => roles.includes(role)
    }), [roles]);
};
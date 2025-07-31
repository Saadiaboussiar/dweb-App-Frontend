import React, { useEffect, type JSX, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const RequireAuth = ({children}:{children: ReactNode}) => {
    
    const navigate=useNavigate();

    useEffect(()=>{
        const token=localStorage.getItem("access_token");
        if(!token){
            navigate("/login");
        }
    },[])
  return children;
}

export default RequireAuth;
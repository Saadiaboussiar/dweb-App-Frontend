import { config } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";
import { authService } from "../service/authService";
import type { DecodedToken } from "utils/roleUtils";
import { jwtDecode } from "jwt-decode";

const api=axios.create({
    baseURL:'http://localhost:9090/'
});

console.log("axios ")

api.interceptors.request.use(
    (config)=>{

        const token=sessionStorage.getItem('access_token');

        
        if(token){
            config.headers.Authorization=`Bearer ${token}`;
        }
        return config;
    },
    (error)=>Promise.reject(error)
);

api.interceptors.response.use(
    (response)=>response,
    async (error)=>{
        const originalRequest=error.config;

        const isTokenExpiredError = 
            (error.response?.status === 500 || error.response?.status === 401) && 
            error.response.data?.message === 'JWT token expired';

        if (isTokenExpiredError && !originalRequest._retry) {{
            
            console.log("Entering api refresh token");
            
            originalRequest._retry=true;
            
            try{
                console.log("Attempting token refresh...")

                const refreshToken=sessionStorage.getItem('refresh_token');
                if(!refreshToken){
                    console.error("No refresh token found");
                    throw new Error("No refresh token available");
                }

                const response=await axios.post('http://localhost:9090/refreshToken',
                    {
                    "refreshToken":refreshToken
                },
                {
                    headers:{
                        'Content-Type':'application/json'
                    },
                    baseURL: ''

                });
                
                const {
                    'access-token': newAccessToken, 
                    'refresh-token': newRefreshToken
                } = response.data;

                if (!newAccessToken || !newRefreshToken) {
                    throw new Error("Invalid tokens received from refresh endpoint");
                }

                const decoded: DecodedToken = jwtDecode(newAccessToken);
                const expiresAt = decoded.exp * 1000;
                        
                authService.setTokens(newAccessToken,newRefreshToken, expiresAt.toString());
                
                originalRequest.headers.Authorization=`Bearer ${newAccessToken}`
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest);

            }catch(refreshError){
                console.error("Token refresh failed:", refreshError);
                
                const currentPath = window.location.pathname;
                const isPublicRoute = ['/', '/login', '/register'].includes(currentPath);

                if (!isPublicRoute) {
                    authService.removeTokens();
                    window.location.href = `/login?reason=session_expired&returnUrl=${encodeURIComponent(currentPath)}`;
                }

                return Promise.reject(refreshError);
            }
        }
            
        return Promise.reject(error);
        
    }
}
)

export default api;
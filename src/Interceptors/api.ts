import { config } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";
import { authService } from "../service/authService";

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

        if(error.response?.status===401 && !originalRequest._retry){
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
                    }

                });
                
                const {
                    'access-token': newAccessToken, 
                    'refresh-token': newRefreshToken
                } = response.data;

                
                authService.setTokens(newAccessToken,newRefreshToken);
                
                originalRequest.headers.Authorization=`Bearer ${newAccessToken}`


                return api(originalRequest);

            }catch(refreshError){
                console.error("Token refresh failed:", refreshError);
                
                const currentPath = window.location.pathname;
                const isPublicRoute = ['/', '/login', '/register'].includes(currentPath);

                if (!isPublicRoute) {
                    authService.removeTokens();
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }
            
        return Promise.reject(error);
        
    }
)

export default api;
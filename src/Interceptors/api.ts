import { config } from "@fortawesome/fontawesome-svg-core";
import axios from "axios";

const api=axios.create({
    baseURL:'http://localhost:9090/'
});

console.log("axios ")

api.interceptors.request.use(
    (config)=>{

        const token=localStorage.getItem('access_token');
       
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

                const refreshToken=localStorage.getItem('refresh_token');
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

                localStorage.setItem('access_token',newAccessToken);

                if (newRefreshToken) {
                    localStorage.setItem('refresh_token', newRefreshToken);
                }

                originalRequest.headers.Authorization=`Bearer ${newAccessToken}`


                return api(originalRequest);

            }catch(refreshError){
                console.error("Token refresh failed:", refreshError);
                
                // Clear tokens and redirect to login on refresh failure
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/';
                
                return Promise.reject(refreshError);
            }
        }
            
        return Promise.reject(error);
        
    }
)

export default api;
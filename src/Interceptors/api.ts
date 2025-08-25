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

        if(error.response.status===401 && !originalRequest._retry){
            originalRequest._retry=true;

            try{
                const refreshToken=localStorage.getItem('refresh_token');
                const {data}=await axios.post('http://localhost:8081/refreshToken',{token:refreshToken});
                
                localStorage.setItem('access_token',data.accessToken);

                originalRequest.headers.Authorization=`Bearer ${data.accessToken}`

                return api(originalRequest);

            }catch(refreshError){
                return Promise.reject(refreshError);
            }
            return Promise.reject(error);
        }
    }
)

export default api;
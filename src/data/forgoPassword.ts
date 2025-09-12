import axios from "axios";
import api from "../Interceptors/api";

export type forgotPwType={
    newPassword:string,
    confirmPassword:string;
}

export const sendCode=async (email:string)=>{

    try{
        const response=await axios.get(`http://localhost:9090/sendVerifyCode/${email}`,{
            headers:{
                'Content-Type':'application/json'
            }
        });
        console.log(response.data)
        if(response.data !=null && response.data!=undefined){
            return response.data;
        }
        
    }catch(error){
        console.log("couldnt get the code ", error);
    }

}


export const insertNewPassword=async (newPassword:string)=>{

    try{
        const response=await api.put("/setNewPassword",newPassword);

    }catch(error){
        console.log("couldnt set the new password ",error);
    }
}
import api from "../Interceptors/api";

export type profileDataType={
  fullName: string;
  email: string;
  phoneNumber: string;
  cin: string;
}

const UNDEFINED_VALUES:profileDataType={
    fullName:"undefined",
    email:"undefined",
    phoneNumber:"undefined",
    cin:"undefined"
}

export const editProfileData=async (technicianId:number,data:Partial<profileDataType>):Promise<profileDataType | undefined>=>{

    try{
        const response=await api.put(`/technicianInfos/editProfile/${technicianId}`,JSON.stringify(data) ,{
        headers: {
            "Content-Type": "application/json",
            },
        })

        if(response.data!=null && response.data!=undefined){
            return response.data
        }else{
            return undefined;
        }
    }catch(err){
        console.log("error updating user:",technicianId,err);
    }
}

export const getProfileData=async (technicianId:number):Promise<profileDataType>=>{

    try{
        const response=await api.get(`/technicianInfos/getProfile/${technicianId}`);

        return response.data
        
    }catch(err){
        console.log("error fetching user:",technicianId,err);
        return UNDEFINED_VALUES;
    }
}

export const uploadProfilePhoto=async (file:File,technicianId:number)=>{

    const formData = new FormData();
    formData.append('profilePhoto', file);
  
    try{
        const response=await api.post(`/technicianInfos/profilePhoto/${technicianId}`,formData)
    
    console.log('Profile photo uploaded successfully:', response.data);
    return response.data;
    
   }catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }

}
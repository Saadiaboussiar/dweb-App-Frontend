import api from "../Interceptors/api";

export type profileDataType={
  fullName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  profileUrl:string;
  carMatricule:string
  role:string;
}

const UNDEFINED_VALUES:profileDataType={
    fullName:"undefined",
    email:"undefined",
    phoneNumber:"undefined",
    cin:"undefined",
    profileUrl:"",
    carMatricule:"undefined",
    role:""
}

export const editProfileData=async (userEmail:string,data:Partial<profileDataType>):Promise<profileDataType | undefined>=>{

    try{
        const response=await api.put(`/user/editProfile/${userEmail}`,JSON.stringify(data) ,{
        headers: {
            "Content-Type": "application/json",
            },
        })

        if(response.data!=null && response.data!=undefined){
            console.log("cin: ",data.cin);
            return response.data
        }else{
            return undefined;
        }
    }catch(err){
        console.log("error updating user:",userEmail,err);
    }
}

export const getProfileData=async (userEmail:string):Promise<profileDataType>=>{

    try{
        const response=await api.get(`/user/getProfile/${userEmail}`);

        return response.data
        
    }catch(err){
        console.log("error fetching user:",userEmail,err);
        return UNDEFINED_VALUES;
    }
}

export const uploadProfilePhoto=async (file:File,userEmail:string)=>{

    const formData = new FormData();
    formData.append('profilePhoto', file);
  
    try{
        const response=await api.post(`/user/profilePhoto/${userEmail}`,formData)
    
    console.log('Profile photo uploaded successfully:', response.data);
    return response.data;
    
   }catch (error) {
    console.error('Error uploading profile photo:', error);
    throw error;
  }

}
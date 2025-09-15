import api from "../Interceptors/api";
import type { Intervention } from "./interventions";


export type NotificationStatus =  
  | 'INTERVENTION_VALIDATED' 
  | 'INTERVENTION_REJECTED';

export type NotificationResponse={
    id?: number,
    interventionId:number,
    title: string,
    message: string,
    timestamp: string,
    read: boolean,
    type: NotificationStatus,
}

export type NotificationRequest={
  clientName:string,
  interventionId:number,
  type: NotificationStatus | "",
}

const timestamp=new Date(Date.now() - 1000 * 60 * 30);

export const getNotifications=async (email:string):Promise<NotificationResponse[]>=>{

  try{
    const response=await api.get(`/notifications/${email}`);
    console.log("response ",response.data)

    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}


export const sendNotification=async (email:string,notif:NotificationRequest)=>{

  try{

    const response=await api.post(`/notifications/${email}`,notif);
    return response.data;

  }catch(error){
    console.log("couldnt send notification ",error);
    
  }
}

export const markNotificationAsRead=async (notificationId:number)=>{

  try{
    const response=await api.put(`/notifications/${notificationId}`);

  }catch(error){
    console.log("couldnt mark notification as read ",error);
  }
  
}

export const  deletNotification=async (notificationId:number)=>{
  try{
    const response=await api.delete(`/notifications/${notificationId}`);
    return response.data;

  }catch(error){
    console.log("ouldnt delete notification ",error);
  }
}

export const deleteAllNotifications=async ()=>{

  try{
    const response=await api.delete("/notifications");
    return response.data;

  }catch(error){
    console.log("ouldnt delete notification ",error);
  }
  
}

export const updateIntervention=(interventionId:number, updatedata:Intervention)=>{

}
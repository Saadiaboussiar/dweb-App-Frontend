import api from "../Interceptors/api";


export type NotificationStatus =  
  | 'INTERVENTION_VALIDATED' 
  | 'INTERVENTION_REJECTED';

export type NotificationResonse={
    id?: number,
    title: string,
    message: string,
    timestamp: string,
    isRead: boolean,
    type: NotificationStatus,
}

export type NotificationRequest={
  clientName:string,
  interventionId:number,
  type: NotificationStatus | "",
}

const timestamp=new Date(Date.now() - 1000 * 60 * 30);

export const getNotifications=async (email:string):Promise<NotificationResonse[]>=>{

  try{
    const response=await api.get(`/notifications/${email}`);

    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}



export const sendNotification=async (email:string,notif:FormData)=>{

  try{
    const response=await api.post(`/notifications/${email}`,notif);

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

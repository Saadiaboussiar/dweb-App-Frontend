import api from '../Interceptors/api';

export type Intervention = {
  client: string;          // client name (or CIN if you prefer)
  ville: string;
  km: number;
  technicianFN: string;
  technicianLN: string;
  date: string;
  startTime: string;
  finishTime: string;
  duration: string;
  nbreIntervenant: number;
  interId: number;
  submittedAt:string;
  interUrl:string | null
};

export type InterventionCard={
  client: string;          
  ville: string;
  technicianFullName:string,
  date:string,
  submittedAt:string;
  interId: number;
}
export const getInterventionsByTechnician=async (technicianId:number):Promise<Intervention[]>=>{

  try{
    const response= await api.get(`/bonIntervention/Technician/${technicianId}`);
    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}


export const getAllInterventionsCards=async ():Promise<InterventionCard[]>=>{

  try{
    const response= await api.get('/intervention/interventionsDetails');
    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}

export const getAllInterventions=async ():Promise<Intervention[]>=>{

  try{
    const response= await api.get('/intervention');
    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}



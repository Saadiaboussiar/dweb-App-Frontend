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


export const getInterventions=async (technicianId:number):Promise<Intervention[]>=>{

  try{
    const response= await api.get(`/bonIntervention/Technician/${technicianId}`);
    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}


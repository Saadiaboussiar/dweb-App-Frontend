import api from '../Interceptors/api';

export type Intervention = {
  client: string;          
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
  interUrl:string | null;
  status?:InterventionStatus;
  ville:string;
};

export type InterventionStatus = 
  | 'PENDING' 
  | 'VALIDATED' 
  | 'REJECTED';


export type InterventionEssentials={
  client: string;          
  ville: string;
  technicianFullName:string,
  date:string,
  submittedAt:string;
  interId: number;
  status:InterventionStatus
}

export const getFrenchName=(status:string)=>{
  
  switch(status){
    case "PENDING": 
      return "EN ATTENTE"
    case "VALIDATED":
      return "VALIDÉ"
    case "REJECTED":
      return "REJETÉ"
    default: 
      return "non spécifié"
  }
}

export const getInterventionsByTechnician=async (technicianEmail:string):Promise<Intervention[]>=>{

  try {
    const response=await api.get(`/technicianInfos/${technicianEmail}`);
    
    return response.data ;

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
  
  
}


export const getAllInterventionsCards=async ():Promise<InterventionEssentials[]>=>{

  try{
    const response= await api.get('/intervention/interventionsEssentials');
    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}

export const getAllInterventions=async ():Promise<Intervention[]>=>{

  try{
    const response= await api.get('/intervention/interventionsDetails');


    return Array.isArray(response.data) ? response.data : [];

  }catch(error){
      console.error("failed to fetch interventions: ", error);
      return [];
  }
}


export async function getOneIntervention(id: number) {
  const intervention = (await getAllInterventions()).find((t) => t.interId === id);
  if (!intervention) throw new Error("Intervention not found");
  return intervention;
}



export async function deleteIntervention(interventionId: number) {
  try{
    const response=await api.delete(`/intervention/${interventionId}`);
    return response.data;
  }catch(error){
    if (typeof window !== 'undefined') {
      window.console.error('Failed to delete technician', error);
    }    
    throw error; 
  }
}

export const validateIntervetion=async (interId:number, isValid:boolean)=>{

  
  try{
    const reponse=await api.put(`/intervention/${interId}?isValidate=${isValid}`);

    return reponse.data;

  }catch(err){
    console.log("error de validation d'intervention: ",err);
  }
} 
 

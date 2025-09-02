import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import api from "../Interceptors/api";
import axios from "axios";

export type TechnicianData = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  cin: string;
  cnss: string;
  profileUrl: string;
};

const INITIAL_TECHNICIANS_STORE: TechnicianData[] = [];

export async function getTechniciansStore(): Promise<TechnicianData[]> {
  try {
    
    const access_token=sessionStorage.getItem("access_token");
    const response = await axios.get('http://localhost:9090//technicianInfos',
      {
        headers:{'Authorization':`Bearer ${access_token}`}
      }
    ).catch(error => {
      throw new Error(`API request failed: ${error.message}`);
    });
    
     if (!response) {
      throw new Error('No response received from server');
    }

     if (response.data === undefined) {
      throw new Error('Response data is undefined');
    }

    const parsedData = typeof response.data === 'string' 
      ? JSON.parse(response.data) 
      : response.data;

    // Type guard validation (recommended)
    if (!Array.isArray(parsedData)) {
      throw new Error('Invalid data format: expected array');
    }

    return parsedData as TechnicianData[];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return INITIAL_TECHNICIANS_STORE; // Fallback to initial data
  }
}
(async () => {
  const technicians = await getTechniciansStore();
  console.log("fetched technicians:", technicians);
})();

export function setTechniciansStore(technicians: TechnicianData[]) {
  return localStorage.setItem("technicians-store", JSON.stringify(technicians));
}

export async function getManyTechnicians({
  paginationModel,
  filterModel,
  sortModel,
}: {
  paginationModel: GridPaginationModel;
  sortModel: GridSortModel;
  filterModel: GridFilterModel;
}): Promise<{ items: TechnicianData[]; itemCount: number }> {
  let technicians = [...await getTechniciansStore()];

  // Apply filters
  if (filterModel?.items?.length) {
    filterModel.items.forEach(({ field, value, operator }) => {
      if (!field || value == null) return;

      technicians = technicians.filter((t) => {
        const tValue = t[field as keyof TechnicianData];

        switch (operator) {
          case "contains":
            return String(tValue).toLowerCase().includes(String(value).toLowerCase());
          case "equals":
            return tValue === value;
          case "startsWith":
            return String(tValue).toLowerCase().startsWith(String(value).toLowerCase());
          case "endsWith":
            return String(tValue).toLowerCase().endsWith(String(value).toLowerCase());
          default:
            return true;
        }
      });
    });
  }

  // Apply sorting
  if (sortModel?.length) {
    technicians.sort((a, b) => {
      for (const { field, sort } of sortModel) {
        if (a[field as keyof TechnicianData] < b[field as keyof TechnicianData]) {
          return sort === "asc" ? -1 : 1;
        }
        if (a[field as keyof TechnicianData] > b[field as keyof TechnicianData]) {
          return sort === "asc" ? 1 : -1;
        }
      }
      return 0;
    });
  }

  // Apply pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  const paginated = technicians.slice(start, end);

  return {
    items: paginated,
    itemCount: technicians.length,
  };
}

export async function getOneTechnician(id: number) {
  const technician = (await getTechniciansStore()).find((t) => t.id === id);
  if (!technician) throw new Error("Technician not found");
  return technician;
}

export async function createTechnician(formaData:FormData):Promise<number> {
  
  try {
  const response = await api.post('/technicianInfos',formaData,{
    headers:{'Content-Type' : 'application/json'}
  })
  
  console.log('Full response:', response);
  console.log('Response data:', response.data);
  console.log('Type of response data:', typeof response.data);
  console.log('Response data value:', response.data);

  if ( typeof response.data==="number") {
      return response.data; 
    } else if(response.data !== null && response.data !== undefined) {
      const id=Number(response.data);
      if (!isNaN(id)) {
        return id;
      }
  }
  throw new Error('Unexpected response format from server');
  }catch(error){
     console.error('Error in createTechnician:', error);
    throw error;
  }
}

export async function updateTechnician(id: number, data: Partial<TechnicianData>) {
  try{
    const response=await api.put(`/technicianInfos/${id}`,JSON.stringify(data),{
      headers:{"Content-Type": "application/json" }
    } );
    return response.data;
  }catch(error){
    if (typeof window !== 'undefined') {
      window.console.error('Failed to update technician', error);
    }    
    throw error; 
  }
}

export async function deleteTechnician(id: number) {
  try{
    const response=await api.delete(`/technicianInfos/${id}`);
    return response.data;
  }catch(error){
    if (typeof window !== 'undefined') {
      window.console.error('Failed to delete technician', error);
    }    
    throw error; 
  }
}


// Validation
type ValidationResult = { issues: { message: string; path: (keyof TechnicianData)[] }[] };

export function validateTechnician(technician: Partial<TechnicianData>): ValidationResult {
  let issues: ValidationResult["issues"] = [];

  if (!technician.firstName) {
    issues.push({ message: "First name is required", path: ["firstName"] });
  }
  if (!technician.lastName) {
    issues.push({ message: "Last name is required", path: ["lastName"] });
  }
  if (!technician.email) {
    issues.push({ message: "Email is required", path: ["email"] });
  }
  if (!technician.phoneNumber) {
    issues.push({ message: "Phone number is required", path: ["phoneNumber"] });
  }
  if (!technician.cin) {
    issues.push({ message: "CIN is required", path: ["cin"] });
  }
  if (!technician.cnss) {
    issues.push({ message: "CNSS is required", path: ["cnss"] });
  }

  return { issues };
}

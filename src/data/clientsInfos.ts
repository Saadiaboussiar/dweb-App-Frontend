import type { GridFilterModel, GridPaginationModel, GridSortModel } from "@mui/x-data-grid";
import api from "../Interceptors/api";


export type ClientData = {
  cin: string;
  fullName: string;
  reseauSocial: string;
  contrat: string;
  ville: string;
  adresse: string;
  email?: string;
  phoneNumber?: string;
};

const INITIAL_CLIENTS_STORE: ClientData[] = [];

export async function getClientsStore(): Promise<ClientData[]> {
  try {
    
    const response = await api.get('/clientInfos').catch(error => {
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

    return parsedData as ClientData[];
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    return INITIAL_CLIENTS_STORE; // Fallback to initial data
  }
}
(async () => {
  const clients = await getClientsStore();
  console.log("fetched clients:", clients);
})();

export function setClientsStore(clients: ClientData[]) {
  localStorage.setItem("clients-store", JSON.stringify(clients));
}

// CRUD Operations
export async function getManyClients({
  paginationModel,
  filterModel,
  sortModel
}: {
  paginationModel: GridPaginationModel;
  filterModel: GridFilterModel;
  sortModel: GridSortModel;
}): Promise<{ items: ClientData[]; itemCount: number }> {
  let clients = [...await getClientsStore()];

  // Filtering
  if (filterModel?.items?.length) {
    clients = clients.filter(client => {
      return filterModel.items.every(({ field, value, operator }) => {
        if (!field || value == null) return true;
        
        const clientValue = client[field as keyof ClientData];
        const strValue = String(value).toLowerCase();
        const strClientValue = String(clientValue).toLowerCase();

        switch (operator) {
          case "contains": return strClientValue.includes(strValue);
          case "equals": return strClientValue === strValue;
          case "startsWith": return strClientValue.startsWith(strValue);
          case "endsWith": return strClientValue.endsWith(strValue);
          default: return true;
        }
      });
    });
  }

  // Sorting
  // Updated sorting logic in getManyClients function
if (sortModel?.length) {
  clients.sort((a, b) => {
    for (const { field, sort } of sortModel) {
      const aValue = a[field as keyof ClientData] ?? ''; // Fallback to empty string if undefined
      const bValue = b[field as keyof ClientData] ?? ''; // Fallback to empty string if undefined
      
      if (aValue < bValue) return sort === "asc" ? -1 : 1;
      if (aValue > bValue) return sort === "asc" ? 1 : -1;
    }
    return 0;
  });
}

  // Pagination
  const start = paginationModel.page * paginationModel.pageSize;
  const end = start + paginationModel.pageSize;
  
  return {
    items: clients.slice(start, end),
    itemCount: clients.length
  };
}

export async function getOneClient(cin: string): Promise<ClientData> {
  const client = (await getClientsStore()).find(c => c.cin === cin);
  if (!client) throw new Error("Client not found");
  return client;
}

export const createClient= async (formaData:FormData)=>{
  const response= await api.post("/clientInfos", formaData , {
    headers:{'Content-Type' : 'application/json'}
  })
  return response.data;
}

export async function updateClient(clientCin: string, updates: Partial<ClientData>): Promise<ClientData> {
  try {

    const response = await api.put<ClientData>(`/clientInfos/${clientCin}`, JSON.stringify(updates), {
      headers: {
        "Content-Type": "application/json" // Correct content type for FormData
      }
    });
    
    return response.data;
  } catch (error) {
    if (typeof window !== 'undefined') {
      window.console.error('Failed to update client', error);
    }    
    throw error; 
  }
}

export async function deleteClient(clientCin: string): Promise<void> {
  try{
    const response=await api.delete(`/clientInfos/${clientCin}`);
    return response.data;
  }catch(error){
    if (typeof window !== 'undefined') {
      window.console.error('Failed to delete client', error);
    }    
    throw error; 
  }
}


// Validation
type ValidationResult = {
  issues: {
    message: string;
    path: (keyof ClientData)[];
  }[];
};

export function validateClient(client: Partial<ClientData>): ValidationResult {
  const issues: ValidationResult["issues"] = [];

  if (!client.cin) issues.push({ message: "CIN is required", path: ["cin"] });
  if (!client.fullName) issues.push({ message: "Full name is required", path: ["fullName"] });
  if (!client.contrat) issues.push({ message: "Contract type is required", path: ["contrat"] });
  if (!client.ville) issues.push({ message: "City is required", path: ["ville"] });
  if (!client.adresse) issues.push({ message: "Address is required", path: ["adresse"] });

  return { issues };
}

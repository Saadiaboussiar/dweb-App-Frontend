import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import api from "Interceptors/api";

interface Intervention{
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
}

interface InterventionState{
    interventions: Intervention[],
    loading:boolean,
    error:string | null,
}

const initialState:InterventionState={
    interventions:[],
    loading:false,
    error:null,
}

export const fetchInterventions=createAsyncThunk(
    'interventions/fetchIntervention',
    async (__dirname,{rejectWithValue})=>{
        try{
            const response=await api.get('bonIntervention');
            return response.data;
        }catch(error:any){
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch interventions');
        }
    }
);

const interventionsSlice=createSlice({
    name:'interventions',
    initialState,
    reducers:{
        clearError: (state) => {
        state.error = null;
      }
    },
    extraReducers:(builder)=>{
        builder
            .addCase(fetchInterventions.pending,(state)=>{
                state.loading=true;
                state.error=null;
            })
            .addCase(fetchInterventions.fulfilled,(state,action)=>{
                state.loading=false;
                state.interventions=action.payload;
            })
            .addCase(fetchInterventions.rejected,(state,action)=>{
                state.loading=false;
                state.error=action.payload as string;
            });
    }
})

export const {clearError} = interventionsSlice.actions;
export default interventionsSlice.reducer;
